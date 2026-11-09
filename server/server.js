// server.js
// Main entry point for the EduChain backend server
// Sets up Express, connects to MongoDB, registers all routes

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const seedAdmin = require('./utils/seedAdmin');
const seedTestUsers = require('./utils/seedTestUsers');
const { testConnection } = require('./utils/blockchain');

// Import routes
const authRoutes = require('./routes/authRoutes');
const fundingRequestRoutes = require('./routes/fundingRequestRoutes');
const donationRoutes = require('./routes/donationRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====

// CORS - Allow frontend at localhost:5173 to call our API
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded documents as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/funding-requests', fundingRequestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EduChain API is running',
    timestamp: new Date().toISOString(),
  });
});

// Handle 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum 5MB allowed.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ===== DATABASE CONNECTION =====
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/education_fund_db');
    console.log('✅ MongoDB connected successfully');

    // Create default admin account if none exists
    await seedAdmin();

    // Create test student and donor accounts for demo
    await seedTestUsers();

    // Test blockchain connection (non-blocking)
    testConnection();

    // Start the server
    app.listen(PORT, () => {
      console.log('');
      console.log('🎓 ===== EduChain Backend Server =====');
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(`📡 API base:          http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend URL:      ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log('=====================================');
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('   Make sure MongoDB is running: mongod --dbpath "C:/data/db"');
    process.exit(1);
  }
};

connectDB();

