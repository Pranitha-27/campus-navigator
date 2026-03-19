// backend/src/controllers/socialController.js

const { db } = require('../config/firebase');

// POST /api/social/location
// Share user location
const shareLocation = async (req, res) => {
  try {
    const { userId, name, building, floor, area, visible = true } = req.body;
    if (!userId || !name) return res.status(400).json({ success: false, error: 'userId and name required' });
    await db.collection('user_locations').doc(userId).set({
      userId, name, building, floor: parseInt(floor) || 1, area,
      visible, timestamp: new Date(),
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/social/locations
// Get visible user locations
const getLocations = async (req, res) => {
  try {
    const snap = await db.collection('user_locations').where('visible', '==', true).get();
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/social/groups
// Create a navigation group
const createGroup = async (req, res) => {
  try {
    const { name, createdBy, destination, meetingTime } = req.body;
    if (!name || !createdBy) return res.status(400).json({ success: false, error: 'name and createdBy required' });
    const inviteCode = `CNS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const ref = db.collection('nav_groups').doc();
    const group = {
      id: ref.id, name, createdBy,
      members: [createdBy],
      destination: destination || null,
      meetingTime: meetingTime || null,
      inviteCode, active: true,
      createdAt: new Date(),
    };
    await ref.set(group);
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/social/groups/join
// Join a group by invite code
const joinGroup = async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;
    if (!inviteCode || !userId) return res.status(400).json({ success: false, error: 'inviteCode and userId required' });
    const snap = await db.collection('nav_groups').where('inviteCode', '==', inviteCode).where('active', '==', true).get();
    if (snap.empty) return res.status(404).json({ success: false, error: 'Group not found' });
    const doc = snap.docs[0];
    const group = doc.data();
    if (!group.members.includes(userId)) {
      await doc.ref.update({ members: [...group.members, userId] });
    }
    res.json({ success: true, group: { ...group, id: doc.id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/social/groups/:userId
// Get groups for a user
const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const snap = await db.collection('nav_groups')
      .where('members', 'array-contains', userId)
      .where('active', '==', true)
      .get();
    const groups = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { shareLocation, getLocations, createGroup, joinGroup, getUserGroups };