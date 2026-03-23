// backend/src/routes/social.js

const express = require('express');
const router = express.Router();
const { shareLocation, getLocations, createGroup, joinGroup, getUserGroups } = require('../controllers/socialController');

// POST /api/social/location
router.post('/location', shareLocation);

// GET /api/social/locations
router.get('/locations', getLocations);

// POST /api/social/groups
router.post('/groups', createGroup);

// POST /api/social/groups/join
router.post('/groups/join', joinGroup);

// GET /api/social/groups/:userId
router.get('/groups/:userId', getUserGroups);

module.exports = router;