const jwt = require('jsonwebtoken');
const { isAdminRole, isUserRole, isValidRole } = require('../utils/roleUtils');
require('dotenv').config();

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authentication required - No Authorization header' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required - Invalid header format' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication required - No token provided' });
        }

        try {
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired' });
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token format' });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required - No user context' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied - Insufficient privileges'
            });
        }

        next();
    };
};

// Check if user has admin role (any admin role)
const checkAdminRole = () => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required - No user context' });
        }

        if (!isAdminRole(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied - Admin privileges required'
            });
        }

        next();
    };
};

// Check if user has user role (student or external)
const checkUserRole = () => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required - No user context' });
        }

        if (!isUserRole(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied - User privileges required'
            });
        }

        next();
    };
};

module.exports = { auth, checkRole, checkAdminRole, checkUserRole };