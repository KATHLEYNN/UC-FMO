require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const authRoutes = require('./routes/auth');
const { auth, checkRole } = require('./middleware/auth');

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to the database');
    connection.release();
});

// Routes
app.use('/api/auth', authRoutes);

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

// User API endpoints - accessible by student and external users
app.get('/api/user/profile', [auth, checkRole(['student', 'external'])], (req, res) => {
    res.json({ user: req.user });
});

// Reservations endpoint for users
app.get('/api/user/reservations', [auth, checkRole(['student', 'external'])], async (req, res) => {
    try {
        // TODO: Implement user reservations query
        // const [reservations] = await pool.execute('SELECT * FROM reservations WHERE user_id = ?', [req.user.id]);
        res.json({ reservations: [] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user reservations' });
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

// User routes - let client-side handle authentication
app.get('/user/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'home.html'));
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

// Admin routes - protected for admin role only
app.get('/admin/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin.html'));
});

app.get('/admin/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'calendar.html'));
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