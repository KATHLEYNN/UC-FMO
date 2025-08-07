const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authController = {
    async register(req, res) {
        const { username, email, password, role, department } = req.body;

        try {
            const [existingUsers] = await pool.execute(
                'SELECT * FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    message: 'Email or username already exists'
                });
            }

            const salt = await bcrypt.genSalt(8);
            const hashedPassword = await bcrypt.hash(password, salt);

            const [result] = await pool.execute(
                'INSERT INTO users (username, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
                [username, email, hashedPassword, role, department]
            );

            res.status(201).json({
                message: 'User registered successfully',
                userId: result.insertId
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error during registration' });
        }
    },

    async login(req, res) {
        const { username, password } = req.body;

        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            if (rows.length === 0) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const user = rows[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role,
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ 
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    username: user.username
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error during login' });
        }
    },

    async logout(req, res) {
        res.json({ message: 'Logged out successfully' });
    },

    async verify(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const [rows] = await pool.execute(
                'SELECT id, email, role, username FROM users WHERE id = ?',
                [decoded.id]
            );

            if (rows.length === 0) {
                return res.status(401).json({ message: 'User not found' });
            }

            const user = rows[0];
            res.json({ user });
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    }
};

module.exports = authController; 