const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./utils/database');
const newsRoutes = require('./routes/newsRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static(__dirname + '/..'));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/auth', authRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'news.html'));
});

app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'calendar.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'School Portal API is running',
        timestamp: new Date().toISOString() 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found' 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
    console.log(`Frontend URL: http://localhost:${PORT}`);
});