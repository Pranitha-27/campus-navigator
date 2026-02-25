const db = require('../config/firebase');
const PathFinder = require('../utils/pathfinding');

// Search for locations
exports.searchLocations = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const snapshot = await db.collection('locations').get();

    const locations = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(loc =>
        loc.name?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 20);

    res.json({
      success: true,
      count: locations.length,
      data: locations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching locations',
      error: error.message
    });
  }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const snapshot = await db.collection('locations').get();

    const locations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      count: locations.length,
      data: locations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
};

// Get single location
exports.getLocation = async (req, res) => {
  try {
    const doc = await db.collection('locations')
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message
    });
  }
};

// Find path between two locations
exports.findPath = async (req, res) => {
  try {
    const { startId, endId } = req.query;

    if (!startId || !endId) {
      return res.status(400).json({
        success: false,
        message: 'Start and end location IDs are required'
      });
    }

    const snapshot = await db.collection('locations').get();
    const locations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const pathFinder = new PathFinder(locations);
    const result = pathFinder.findPath(startId, endId);

    if (result.error) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding path',
      error: error.message
    });
  }
};

// Get nearby locations
exports.getNearbyLocations = async (req, res) => {
  try {
    const { locationId, radius = 50 } = req.query;

    const doc = await db.collection('locations')
      .doc(locationId)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const location = { id: doc.id, ...doc.data() };

    const snapshot = await db.collection('locations').get();
    const allLocations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const filtered = allLocations.filter(loc => {
      if (loc.id === locationId) return false;
      if (loc.building !== location.building) return false;
      if (loc.floor !== location.floor) return false;

      const dx = loc.coordinates.x - location.coordinates.x;
      const dy = loc.coordinates.y - location.coordinates.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= radius;
    });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding nearby locations',
      error: error.message
    });
  }
};