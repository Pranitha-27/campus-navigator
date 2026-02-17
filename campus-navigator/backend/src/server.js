const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase (replaces MongoDB connection)
const { admin, db } = require('./config/firebase');
console.log('✅ Firebase initialized successfully');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const navigationRoutes = require('./routes/navigation');
app.use('/api/navigation', navigationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    database: 'Firebase Firestore'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});