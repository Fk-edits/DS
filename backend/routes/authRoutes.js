const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../middleware/authMiddleware');

// Admin login
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        const result = loginAdmin(username, password);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Login successful',
                token: result.token,
                user: { username, role: 'admin' }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: result.message 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
});

// Verify token
router.post('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        res.json({ 
            success: true, 
            user: decoded 
        });
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
});

module.exports = router;