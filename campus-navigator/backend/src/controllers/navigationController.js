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

    const locations = await Location.search(query);
    const limited = locations.slice(0, 20);

    res.json({
      success: true,
      count: limited.length,
      data: limited
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

    const locations = await Location.find(filter);

    // Populate connectedTo locations if needed
    for (let location of locations) {
      if (location.connectedTo && location.connectedTo.length > 0) {
        for (let connection of location.connectedTo) {
          if (connection.locationId) {
            const connectedLoc = await Location.findById(connection.locationId);
            connection.locationData = connectedLoc;
          }
        }
      }
    }

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
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Populate connectedTo locations
    if (location.connectedTo && location.connectedTo.length > 0) {
      for (let connection of location.connectedTo) {
        if (connection.locationId) {
          const connectedLoc = await Location.findById(connection.locationId);
          connection.locationData = connectedLoc;
        }
      }
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
    const locations = await Location.find();
    
    // Populate all connections
    for (let location of locations) {
      if (location.connectedTo && location.connectedTo.length > 0) {
        for (let connection of location.connectedTo) {
          if (connection.locationId) {
            const connectedLoc = await Location.findById(connection.locationId);
            connection.locationData = connectedLoc;
          }
        }
      }
    }
    
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

    // Find locations on same floor
    const nearbyLocations = await Location.find({
      building: location.building,
      floor: location.floor,
      isAccessible: true
    });

    // Filter by distance and exclude the current location
    const filtered = nearbyLocations.filter(loc => {
      if (loc.id === locationId) return false;
      
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