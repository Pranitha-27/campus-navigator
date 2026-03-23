// backend/src/server.js
// Updated server with all new routes registered

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
const navigationRoutes = require('./routes/navigation');
const crowdRoutes = require('./routes/crowd');
const socialRoutes = require('./routes/social');

app.use('/api/navigation', navigationRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/social', socialRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Campus Navigator API running on port ${PORT}`));

module.exports = app;