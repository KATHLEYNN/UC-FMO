const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(userData) {
        const { username, email, password, role, department } = userData;
        const hashedPassword = await bcrypt.hash(password, 8);

        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, department]
        );

        return result.insertId;
    }

    static async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User; 