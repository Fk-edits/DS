const jwt = require('jsonwebtoken');

const adminCredentials = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'DanferSchool@2024'
};

// Simple authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

// Login function
const loginAdmin = (username, password) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
        const token = jwt.sign(
            { username: username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return { success: true, token };
    }
    return { success: false, message: 'Invalid credentials' };
};

module.exports = { authenticateAdmin, loginAdmin };