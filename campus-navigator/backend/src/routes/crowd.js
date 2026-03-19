// backend/src/routes/crowd.js

const express = require('express');
const router = express.Router();
const { getCrowdData, reportCrowd, getCrowdSummary, seedCrowdData } = require('../controllers/crowdController');

// GET /api/crowd?floor=1
router.get('/', getCrowdData);

// GET /api/crowd/summary
router.get('/summary', getCrowdSummary);

// POST /api/crowd/report
router.post('/report', reportCrowd);

// POST /api/crowd/seed  (dev only)
router.post('/seed', seedCrowdData);

module.exports = router;