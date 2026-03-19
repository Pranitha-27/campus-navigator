// backend/src/controllers/crowdController.js

const { db } = require('../config/firebase');

// GET /api/crowd?floor=1
// Returns all crowd data for a specific floor
const getCrowdData = async (req, res) => {
  try {
    const { floor = 1 } = req.query;
    const snapshot = await db.collection('crowd_data')
      .where('floor', '==', parseInt(floor))
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, floor: parseInt(floor), data });
  } catch (err) {
    console.error('getCrowdData error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/crowd/report
// Submit crowd density for a room/cell
// Body: { floor, row, col, area, density, reportedBy? }
const reportCrowd = async (req, res) => {
  try {
    const { floor, row, col, area, density, reportedBy } = req.body;
    if (floor === undefined || density === undefined) {
      return res.status(400).json({ success: false, error: 'floor and density are required' });
    }

    const docRef = db.collection('crowd_data').doc();
    const record = {
      floor: parseInt(floor),
      row: parseInt(row) || 0,
      col: parseInt(col) || 0,
      area: area || null,
      density: Math.max(0, Math.min(100, parseInt(density))),
      reportedBy: reportedBy || 'anonymous',
      timestamp: new Date(),
    };
    await docRef.set(record);
    res.json({ success: true, id: docRef.id, data: record });
  } catch (err) {
    console.error('reportCrowd error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/crowd/summary
// Returns aggregated crowd summary per floor
const getCrowdSummary = async (req, res) => {
  try {
    // Get latest entry per floor
    const floors = [1, 2, 3, 4, 5];
    const results = await Promise.all(
      floors.map(async (f) => {
        const snap = await db.collection('crowd_data')
          .where('floor', '==', f)
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get();
        const docs = snap.docs.map(d => d.data());
        const avgDensity = docs.length
          ? Math.round(docs.reduce((a, d) => a + (d.density || 0), 0) / docs.length)
          : 0;
        return { floor: f, avgDensity, sampleCount: docs.length };
      })
    );
    res.json({ success: true, summary: results });
  } catch (err) {
    console.error('getCrowdSummary error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/crowd/seed
// Seed demo data for testing (dev only)
const seedCrowdData = async (req, res) => {
  try {
    const batch = db.batch();
    for (let floor = 1; floor <= 5; floor++) {
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          const ref = db.collection('crowd_data').doc();
          batch.set(ref, {
            floor, row, col,
            density: Math.floor(Math.random() * 100),
            reportedBy: 'seed',
            timestamp: new Date(),
          });
        }
      }
    }
    await batch.commit();
    res.json({ success: true, message: 'Demo crowd data seeded for floors 1–5' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getCrowdData, reportCrowd, getCrowdSummary, seedCrowdData };