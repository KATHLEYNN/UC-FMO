require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const sarfRoutes = require('./routes/sarfRoutes');
const { auth, checkRole } = require('./middleware/auth');

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Database connections
const { pool } = require('./config/database');

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sarf', sarfRoutes);

// Serve PDF files (public access for preview)
app.use('/uploads/pdfs', express.static(path.join(__dirname, 'uploads', 'pdfs')));

// Admin verification endpoint
app.get('/api/auth/verify', auth, (req, res) => {
    res.json({ user: req.user });
});

// Admin-specific verification endpoint
app.get('/api/auth/admin/verify', [auth, checkRole(['admin'])], (req, res) => {
    res.json({ user: req.user });
});

// Admin stats endpoint - admin only
app.get('/api/admin/stats', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        // Mock data for now
        const stats = {
            totalReservations: 0,
            topReservationType: 'N/A',
            totalClients: 0,
            reservationsByType: [],
            clientDistribution: []
        };

        // TODO: Replace with actual database queries
        // const [reservations] = await pool.execute('SELECT COUNT(*) as total FROM reservations');
        // const [clients] = await pool.execute('SELECT COUNT(*) as total FROM clients');
        // stats.totalReservations = reservations[0].total;
        // stats.totalClients = clients[0].total;

        res.json(stats);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

app.get('/api/user/profile', [auth, checkRole(['student', 'external'])], (req, res) => {
    res.json({ user: req.user });
});

app.get('/api/user/reservations', [auth, checkRole(['student', 'external'])], async (req, res) => {
    try {
        res.json({ reservations: [] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user reservations' });
    }
});

// Events API endpoints
app.get('/api/events', async (req, res) => {
    try {
        const [events] = await pool.execute(
            'SELECT id, title, date, time, location, image_url FROM events WHERE date >= CURDATE() ORDER BY date ASC, time ASC'
        );
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

app.post('/api/events', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const { title, date, time, location, image_url } = req.body;

        if (!title || !date || !time || !location) {
            return res.status(400).json({ message: 'Title, date, time, and location are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO events (title, date, time, location, image_url) VALUES (?, ?, ?, ?, ?)',
            [title, date, time, location, image_url || null]
        );

        res.status(201).json({
            message: 'Event created successfully',
            eventId: result.insertId
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

app.delete('/api/events/:id', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const eventId = req.params.id;

        const [result] = await pool.execute(
            'DELETE FROM events WHERE id = ?',
            [eventId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
});

// Test endpoint to check database connection and table structure
app.get('/api/test/db', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        // Test basic connection
        const [tables] = await pool.execute('SHOW TABLES');
        console.log('Available tables:', tables);

        // Test events table structure
        const [columns] = await pool.execute('DESCRIBE events');
        console.log('Events table structure:', columns);

        // Test simple query
        const [events] = await pool.execute('SELECT COUNT(*) as count FROM events');
        console.log('Total events in database:', events[0].count);

        res.json({
            message: 'Database connection successful',
            tables: tables,
            eventsTableStructure: columns,
            totalEvents: events[0].count
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ message: 'Database test failed', error: error.message });
    }
});

// Public routes (accessible to all)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

// Home route - accessible by all authenticated users
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Legacy user home route - redirect to new home
app.get('/user/home', (req, res) => {
    res.redirect('/home');
});

app.get('/user/reservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'reservation.html'));
});

app.get('/user/internal-clients', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'internal-clients.html'));
});

app.get('/user/external-clients', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'external-clients.html'));
});

app.get('/user/main-campus', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'main-campus.html'));
});

app.get('/user/legarda-campus', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'legarda-campus.html'));
});

app.get('/user/on-campus', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'on-campus.html'));
});

app.get('/user/my-sarf-forms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'my-sarf-forms.html'));
});

// Admin routes - protected for admin role only
app.get('/admin/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin.html'));
});

app.get('/admin/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'calendar.html'));
});

app.get('/admin/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'events.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Page not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    
    if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'Resource not found' });
    }
    
    if (err.status === 401) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (err.status === 403) {
        return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
    }
    
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 