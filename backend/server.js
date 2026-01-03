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

// ✅ FIX 1: Serve static files CORRECTLY for Vercel
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '../public')));

// ✅ FIX 2: Vercel-specific MongoDB connection
const connectDBVercel = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully on Vercel');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);
  }
};

connectDBVercel();

// ✅ FIX 3: Debug endpoint for Vercel
app.get('/api/debug', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'debug',
    mongodb_uri_set: !!process.env.MONGODB_URI,
    jwt_secret_set: !!process.env.JWT_SECRET,
    mongoose_state: mongoose.connection.readyState,
    node_env: process.env.NODE_ENV || 'development',
    vercel: true,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/auth', authRoutes);

// ✅ FIX 4: Serve HTML pages with proper fallback
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

// ✅ FIX 5: Vercel serverless timeout fix
const server = require('http').createServer(app);
server.setTimeout(30000); // 30 seconds timeout

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    status: mongoose.connection.readyState === 1 ? 'healthy' : 'degraded',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'School Portal API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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

// ✅ FIX 6: Vercel provides PORT automatically
const PORT = process.env.PORT || 5000;

// ✅ FIX 7: Export for Vercel serverless
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Vercel needs module.exports
  module.exports = app;
} else {
  // Local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
    console.log(`Frontend URL: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
