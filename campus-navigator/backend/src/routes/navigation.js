const express = require('express');
const router = express.Router();
const {
  searchLocations,
  getAllLocations,
  getLocation,
  findPath,
  getNearbyLocations
} = require('../controllers/navigationController');

// @route   GET /api/navigation/search
// @desc    Search for locations
router.get('/search', searchLocations);

// @route   GET /api/navigation/locations
// @desc    Get all locations (with optional filters)
router.get('/locations', getAllLocations);

// @route   GET /api/navigation/locations/:id
// @desc    Get single location
router.get('/locations/:id', getLocation);

// @route   GET /api/navigation/path
// @desc    Find path between two locations
router.get('/path', findPath);

// @route   GET /api/navigation/nearby
// @desc    Get nearby locations
router.get('/nearby', getNearbyLocations);

module.exports = router;