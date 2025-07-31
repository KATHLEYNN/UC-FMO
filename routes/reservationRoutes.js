const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, checkRole, checkAdminRole, checkUserRole } = require('../middleware/auth');

// Get calendar data for user reservation page
router.get('/calendar', async (req, res) => {
    try {
        // Get all confirmed reservations and events for calendar display
        const [reservations] = await pool.execute(`
            SELECT
                reservation_date as date,
                title,
                CASE
                    WHEN time_start IS NOT NULL AND time_end IS NOT NULL
                    THEN CONCAT(TIME_FORMAT(time_start, '%h:%i %p'), ' - ', TIME_FORMAT(time_end, '%h:%i %p'))
                    ELSE 'All Day'
                END as time,
                location,
                venue,
                status
            FROM reservation_calendar
            WHERE status IN ('confirmed', 'pending')
            AND reservation_date >= CURDATE()
            ORDER BY reservation_date ASC
        `);

        // Get events from events table
        const [events] = await pool.execute(`
            SELECT
                date,
                title,
                time,
                location,
                location as venue,
                'confirmed' as status
            FROM events
            WHERE date >= CURDATE()
            ORDER BY date ASC
        `);

        // Combine reservations and events
        const allReservations = [...reservations, ...events];

        // Return the data as an array for the frontend to process
        res.json(allReservations);
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).json({ message: 'Error fetching calendar data', error: error.message });
    }
});

// Save user's reservation data (called after successful form submission)
router.post('/save-date', [auth, checkUserRole()], async (req, res) => {
    try {
        const { reservation_date, form_type, title, location, venue, time_start, time_end } = req.body;
        const userId = req.user.id;

        if (!reservation_date || !form_type || !title) {
            return res.status(400).json({ message: 'Date, form type, and title are required' });
        }

        // Check if user already has a reservation for this date
        const [existingReservation] = await pool.execute(
            'SELECT id FROM reservation_calendar WHERE user_id = ? AND reservation_date = ?',
            [userId, reservation_date]
        );

        if (existingReservation.length > 0) {
            // Update existing reservation
            const [result] = await pool.execute(`
                UPDATE reservation_calendar
                SET form_type = ?, title = ?, location = ?, venue = ?, time_start = ?, time_end = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND reservation_date = ?
            `, [form_type, title, location, venue, time_start, time_end, userId, reservation_date]);

            res.json({
                message: 'Reservation updated successfully',
                reservationId: existingReservation[0].id
            });
        } else {
            // Insert new reservation
            const [result] = await pool.execute(`
                INSERT INTO reservation_calendar
                (user_id, reservation_date, form_type, title, location, venue, time_start, time_end, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `, [userId, reservation_date, form_type, title, location, venue, time_start, time_end]);

            res.status(201).json({
                message: 'Reservation saved successfully',
                reservationId: result.insertId
            });
        }
    } catch (error) {
        console.error('Error saving reservation date:', error);
        res.status(500).json({ message: 'Error saving reservation date', error: error.message });
    }
});

// Get user's reservations
router.get('/my-reservations', [auth, checkUserRole()], async (req, res) => {
    try {
        const userId = req.user.id;

        const [reservations] = await pool.execute(`
            SELECT
                id,
                reservation_date,
                form_type,
                title,
                location,
                CASE
                    WHEN time_start IS NOT NULL AND time_end IS NOT NULL
                    THEN CONCAT(TIME_FORMAT(time_start, '%h:%i %p'), ' - ', TIME_FORMAT(time_end, '%h:%i %p'))
                    ELSE 'All Day'
                END as time_display,
                time_start,
                time_end,
                status,
                created_at,
                updated_at
            FROM reservation_calendar
            WHERE user_id = ?
            ORDER BY reservation_date DESC
        `, [userId]);

        res.json({ reservations });
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        res.status(500).json({ message: 'Error fetching reservations', error: error.message });
    }
});

// Admin: Get all reservations for calendar view
router.get('/admin/calendar', [auth, checkAdminRole()], async (req, res) => {
    try {
        const [reservations] = await pool.execute(`
            SELECT
                rc.id,
                rc.reservation_date as date,
                rc.title,
                CASE
                    WHEN rc.time_start IS NOT NULL AND rc.time_end IS NOT NULL
                    THEN CONCAT(TIME_FORMAT(rc.time_start, '%h:%i %p'), ' - ', TIME_FORMAT(rc.time_end, '%h:%i %p'))
                    ELSE 'All Day'
                END as time,
                rc.location,
                rc.venue,
                rc.status,
                rc.form_type,
                u.username,
                u.email,
                rc.created_at
            FROM reservation_calendar rc
            JOIN users u ON rc.user_id = u.id
            WHERE rc.reservation_date >= CURDATE()
            ORDER BY rc.reservation_date ASC, rc.time_start ASC
        `);

        // Get events from events table
        const [events] = await pool.execute(`
            SELECT
                id,
                date,
                title,
                time,
                location,
                location as venue,
                'confirmed' as status,
                'event' as form_type,
                'System' as username,
                '' as email,
                created_at
            FROM events
            WHERE date >= CURDATE()
            ORDER BY date ASC, time ASC
        `);

        // Combine and format data
        const allItems = [...reservations, ...events];

        // Format for admin calendar (fix timezone issue)
        const calendarData = {};
        allItems.forEach(item => {
            // Use local date formatting to avoid timezone issues
            const date = new Date(item.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            if (!calendarData[dateStr]) {
                calendarData[dateStr] = [];
            }
            calendarData[dateStr].push({
                id: item.id,
                title: item.title,
                time: item.time,
                location: item.location,
                status: item.status,
                type: item.form_type,
                user: item.username,
                email: item.email,
                created_at: item.created_at
            });
        });

        res.json({ calendarData, reservations: allItems });
    } catch (error) {
        console.error('Error fetching admin calendar data:', error);
        res.status(500).json({ message: 'Error fetching admin calendar data', error: error.message });
    }
});

// Admin: Update reservation status
router.put('/admin/:id/status', [auth, checkAdminRole()], async (req, res) => {
    try {
        const reservationId = req.params.id;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await pool.execute(
            'UPDATE reservation_calendar SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, reservationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.json({ message: 'Reservation status updated successfully' });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ message: 'Error updating reservation status', error: error.message });
    }
});

// Admin: Delete reservation
router.delete('/admin/:id', [auth, checkAdminRole()], async (req, res) => {
    try {
        const reservationId = req.params.id;

        const [result] = await pool.execute(
            'DELETE FROM reservation_calendar WHERE id = ?',
            [reservationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Error deleting reservation', error: error.message });
    }
});

// Get available time slots for a specific date
router.get('/available-slots/:date', async (req, res) => {
    try {
        const date = req.params.date;

        // Get reserved dates (any reservation makes the whole day unavailable)
        const [reservedDates] = await pool.execute(`
            SELECT COUNT(*) as count
            FROM reservation_calendar
            WHERE reservation_date = ? AND status IN ('confirmed', 'pending')
            UNION ALL
            SELECT COUNT(*) as count
            FROM events
            WHERE date = ?
        `, [date, date]);

        const totalReservations = reservedDates.reduce((sum, row) => sum + row.count, 0);
        const isDateAvailable = totalReservations === 0;

        res.json({
            isDateAvailable,
            message: isDateAvailable ? 'Date is available' : 'Date is already reserved'
        });
    } catch (error) {
        console.error('Error checking date availability:', error);
        res.status(500).json({ message: 'Error checking date availability', error: error.message });
    }
});

// Check for time conflicts on a specific date and venue
router.post('/check-time-conflict', async (req, res) => {
    try {
        const { reservation_date, time_start, time_end, location } = req.body;

        if (!reservation_date || !time_start || !time_end) {
            return res.status(400).json({ message: 'Date, start time, and end time are required' });
        }

        // Check for overlapping reservations on the same date and venue
        const [conflicts] = await pool.execute(`
            SELECT
                title,
                TIME_FORMAT(time_start, '%h:%i %p') as start_time,
                TIME_FORMAT(time_end, '%h:%i %p') as end_time,
                location,
                venue
            FROM reservation_calendar
            WHERE reservation_date = ?
            AND (location = ? OR venue = ?)
            AND status IN ('confirmed', 'pending')
            AND (
                (time_start <= ? AND time_end > ?) OR
                (time_start < ? AND time_end >= ?) OR
                (time_start >= ? AND time_end <= ?)
            )
        `, [reservation_date, location, location, time_start, time_start, time_end, time_end, time_start, time_end]);

        // Also check events table for conflicts
        const [eventConflicts] = await pool.execute(`
            SELECT
                title,
                time,
                location
            FROM events
            WHERE date = ?
            AND location = ?
        `, [reservation_date, location]);

        const hasConflicts = conflicts.length > 0 || eventConflicts.length > 0;

        // Generate suggested times if there are conflicts
        let suggestedTimes = [];
        if (hasConflicts) {
            suggestedTimes = await generateSuggestedTimes(reservation_date, location, time_start, time_end);
        }

        res.json({
            hasConflicts,
            conflicts: [...conflicts, ...eventConflicts],
            suggestedTimes,
            message: hasConflicts ? 'Time conflict detected' : 'No conflicts found'
        });
    } catch (error) {
        console.error('Error checking time conflicts:', error);
        res.status(500).json({ message: 'Error checking time conflicts', error: error.message });
    }
});

// Helper function to generate suggested times
async function generateSuggestedTimes(date, location, requestedStart, requestedEnd) {
    try {
        // Get all existing reservations for the date and location
        const [existingReservations] = await pool.execute(`
            SELECT time_start, time_end
            FROM reservation_calendar
            WHERE reservation_date = ? AND location = ? AND status IN ('confirmed', 'pending')
            ORDER BY time_start
        `, [date, location]);

        const suggestedTimes = [];
        const requestedDuration = getTimeDifferenceInMinutes(requestedStart, requestedEnd);

        // Define working hours (7:30 AM to 7:30 PM)
        const workingStart = '07:30:00';
        const workingEnd = '19:30:00';

        // Generate time slots every 30 minutes
        let currentTime = workingStart;
        while (currentTime < workingEnd) {
            const endTime = addMinutesToTime(currentTime, requestedDuration);

            if (endTime <= workingEnd) {
                // Check if this slot conflicts with existing reservations
                const hasConflict = existingReservations.some(reservation => {
                    return (
                        (currentTime < reservation.time_end && endTime > reservation.time_start)
                    );
                });

                if (!hasConflict && suggestedTimes.length < 3) {
                    suggestedTimes.push({
                        start: formatTimeForDisplay(currentTime),
                        end: formatTimeForDisplay(endTime),
                        start_24h: currentTime,
                        end_24h: endTime
                    });
                }
            }

            // Move to next 30-minute slot
            currentTime = addMinutesToTime(currentTime, 30);
        }

        return suggestedTimes;
    } catch (error) {
        console.error('Error generating suggested times:', error);
        return [];
    }
}

// Helper functions for time calculations
function getTimeDifferenceInMinutes(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end - start) / (1000 * 60);
}

function addMinutesToTime(timeStr, minutes) {
    const time = new Date(`2000-01-01 ${timeStr}`);
    time.setMinutes(time.getMinutes() + minutes);
    return time.toTimeString().slice(0, 8);
}

function formatTimeForDisplay(timeStr) {
    const time = new Date(`2000-01-01 ${timeStr}`);
    return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

module.exports = router;
