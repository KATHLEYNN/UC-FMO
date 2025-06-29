require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const authRoutes = require('./routes/auth');

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

// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//         return;
//     }
//     console.log('Successfully connected to the database');
//     connection.release();
// });

// Routes
app.use('/api/auth', authRoutes);

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// User routes
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

// Admin routes
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 