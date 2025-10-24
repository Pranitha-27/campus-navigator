const Location = require('../models/Location');
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

    const locations = await Location.find({
      $text: { $search: query }
    }).limit(10);

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

// Get all locations (for map display)
exports.getAllLocations = async (req, res) => {
  try {
    const { building, floor, type } = req.query;
    
    let filter = {};
    if (building) filter.building = building;
    if (floor) filter.floor = parseInt(floor);
    if (type) filter.type = type;

    const locations = await Location.find(filter)
      .populate('connectedTo.locationId');

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

// Get single location by ID
exports.getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('connectedTo.locationId');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
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

    // Get all locations to build graph
    const locations = await Location.find().populate('connectedTo.locationId');
    
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

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Find locations on same floor within radius
    const nearbyLocations = await Location.find({
      _id: { $ne: locationId },
      building: location.building,
      floor: location.floor,
      isAccessible: true
    });

    // Filter by distance
    const filtered = nearbyLocations.filter(loc => {
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