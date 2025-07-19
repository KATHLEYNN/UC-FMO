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
                'confirmed' as status
            FROM events
            WHERE date >= CURDATE()
            ORDER BY date ASC
        `);

        // Combine reservations and events
        const allReservations = [...reservations, ...events];

        // Format data for calendar (fix timezone issue)
        const reservedDates = {};
        allReservations.forEach(item => {
            // Use local date formatting to avoid timezone issues
            const date = new Date(item.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            reservedDates[dateStr] = {
                title: item.title,
                time: item.time,
                location: item.location,
                status: item.status
            };
        });

        res.json({ reservedDates });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).json({ message: 'Error fetching calendar data', error: error.message });
    }
});

// Save user's reservation data (called after successful form submission)
router.post('/save-date', [auth, checkUserRole()], async (req, res) => {
    try {
        const { reservation_date, form_type, title, location, time_start, time_end } = req.body;
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
                SET form_type = ?, title = ?, location = ?, time_start = ?, time_end = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND reservation_date = ?
            `, [form_type, title, location, time_start, time_end, userId, reservation_date]);

            res.json({
                message: 'Reservation updated successfully',
                reservationId: existingReservation[0].id
            });
        } else {
            // Insert new reservation
            const [result] = await pool.execute(`
                INSERT INTO reservation_calendar
                (user_id, reservation_date, form_type, title, location, time_start, time_end, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            `, [userId, reservation_date, form_type, title, location, time_start, time_end]);

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

module.exports = router;
