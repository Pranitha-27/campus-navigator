import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const LOCATIONS_COL = 'locations';

// Helper to remove duplicates by name
const removeDuplicates = (locations) => {
  if (!locations) return [];
  const seen = new Set();
  return locations.filter((loc) => {
    if (seen.has(loc.name)) return false;
    seen.add(loc.name);
    return true;
  });
};

// Fetch all locations
export const getAllLocations = async (filters = {}) => {
  try {
    let q = collection(db, LOCATIONS_COL);
    const constraints = [];

    if (filters.building) constraints.push(where('building', '==', filters.building));
    if (filters.floor !== undefined) constraints.push(where('floor', '==', Number(filters.floor)));
    if (filters.type) constraints.push(where('type', '==', filters.type));

    const snapshot = constraints.length > 0 ? await getDocs(query(q, ...constraints)) : await getDocs(q);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
<<<<<<< HEAD
    return { success: true, count: removeDuplicates(data).length, data: removeDuplicates(data) };
=======
    return { success: true, count: data.length, data };
  } catch (error) {
    console.error('getAllLocations error:', error);
    throw error;
  }
};

// ─── Get locations by floor ───────────────────────────────────────────────────
export const getLocationsByFloor = async (building, floor) => {
  return getAllLocations({ building, floor });
};

// ─── Get single location by Firestore doc ID ─────────────────────────────────
export const getLocationById = async (id) => {
  try {
    const snap = await getDoc(doc(db, LOCATIONS_COL, id));
    if (!snap.exists()) return { success: false, message: 'Not found' };
    return { success: true, data: { id: snap.id, ...snap.data() } };
  } catch (error) {
    console.error('getLocationById error:', error);
    throw error;
  }
};

// ─── Find navigation path (step counts) ──────────────────────────────────────
//
// This is a LOCAL lookup — no backend call needed.
// Step counts match your seedData distances.
//
// Returns: { success, data: { steps, meters, startName, endName, lift } }
//
const STEP_TABLE = {
  // [startId]: { [destinationName]: stepCount }
  'front-lift': {
    'Kevin Ashton IoT Lab': 10,
    'Sahyadri AI Computing Lab': 24,
    'John McCarthy Lab': 44,
    'AIML Board Room': 44,
    'AIML Faculty Room': 54,
    'Staff Room': 54,
    'MTech Cybersecurity Research Lab': 26,
    'Peter Naur Data Science Lab': 32,
  },
  'back-lift': {
    'Kevin Ashton IoT Lab': 56,
    'Sahyadri AI Computing Lab': 38,
    'John McCarthy Lab': 21,
    'AIML Board Room': 23,
    'AIML Faculty Room': 11,
    'Staff Room': 23,
    'MTech Cybersecurity Research Lab': 66,
    'Peter Naur Data Science Lab': 72,
  },
};

export const getNavigationPath = async (startPointId, destinationName) => {
  try {
    const stepsForStart = STEP_TABLE[startPointId];
    if (!stepsForStart) {
      return { success: false, message: 'Unknown start point' };
    }

    const steps = stepsForStart[destinationName];
    if (steps === undefined) {
      return { success: false, message: 'No route found' };
    }

    return {
      success: true,
      data: {
        steps,
        meters: Math.round(steps * 0.75),
        minutesWalk: Math.ceil(steps / 100),
        startId: startPointId,
        destinationName,
      },
    };
  } catch (error) {
    console.error('getNavigationPath error:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ONE-TIME SEED FUNCTION
// Call this once from a dev screen or useEffect to populate Firestore.
// Comment it out after first run.
//
// Usage in a component:
//   import { seedFirestore } from '../../services/navigationService';
//   useEffect(() => { seedFirestore(); }, []);
// ─────────────────────────────────────────────────────────────────────────────
export const seedFirestore = async () => {
  const locations = [
    // Ground Floor
    { name: 'BSN Block Main Entrance', type: 'landmark', building: 'BSN Block', floor: 0, roomNumber: null, description: 'Main entrance to BSN Block', coordinates: { x: 0, y: 0, z: 0 }, connectedTo: [], tags: ['entrance', 'ground floor'], isAccessible: true },
    { name: 'Ground Floor Front Lift', type: 'landmark', building: 'BSN Block', floor: 0, description: 'Lift at front entrance', coordinates: { x: 10, y: 0, z: 0 }, connectedTo: [], tags: ['lift', 'elevator'], isAccessible: true },
    { name: 'Ground Floor Back Lift', type: 'landmark', building: 'BSN Block', floor: 0, description: 'Lift at back entrance', coordinates: { x: -10, y: 0, z: 0 }, connectedTo: [], tags: ['lift', 'elevator'], isAccessible: true },
    // Floor 1
    { name: 'BOT Lab', type: 'room', building: 'BSN Block', floor: 1, roomNumber: '101', description: 'Biology and Biotechnology Laboratory', coordinates: { x: 30, y: 15, z: 1 }, connectedTo: [], tags: ['lab', 'biology', 'important'], isAccessible: true },
    { name: 'IoT Lab', type: 'room', building: 'BSN Block', floor: 1, roomNumber: '102', description: 'Internet of Things Laboratory', coordinates: { x: 40, y: 15, z: 1 }, connectedTo: [], tags: ['lab', 'iot', 'technology', 'important'], isAccessible: true },
    // Floor 2
    { name: 'Von Neumann Lab', type: 'room', building: 'BSN Block', floor: 2, roomNumber: '201', description: 'Computer Science Laboratory', coordinates: { x: 30, y: 25, z: 2 }, connectedTo: [], tags: ['lab', 'computer', 'cs', 'important'], isAccessible: true },
    // Floor 5
    { name: '5th Floor Front Lift', type: 'landmark', building: 'BSN Block', floor: 5, description: 'Front lift entrance on 5th floor', coordinates: { x: 0, y: 0, z: 5 }, connectedTo: [], tags: ['lift', 'elevator', 'entrance', 'front'], isAccessible: true },
    { name: 'Kevin Ashton IoT Lab', type: 'room', building: 'BSN Block', floor: 5, roomNumber: '501', description: 'Kevin Ashton IoT Laboratory', coordinates: { x: 7.5, y: 0, z: 5 }, connectedTo: [], tags: ['lab', 'iot', 'important', 'kevin ashton'], isAccessible: true },
    { name: 'Sahyadri AI Computing Lab', type: 'room', building: 'BSN Block', floor: 5, roomNumber: '507', description: 'Sahyadri Artificial Intelligence Computing Laboratory', coordinates: { x: 18, y: 5, z: 5 }, connectedTo: [], tags: ['lab', 'ai', 'computing', 'important', 'sahyadri'], isAccessible: true },
    { name: 'John McCarthy Lab', type: 'room', building: 'BSN Block', floor: 5, roomNumber: '506', description: 'John McCarthy AI Laboratory', coordinates: { x: 33, y: 8, z: 5 }, connectedTo: [], tags: ['lab', 'ai', 'important', 'john mccarthy'], isAccessible: true },
    { name: 'AIML Board Room', type: 'room', building: 'BSN Block', floor: 5, roomNumber: null, description: 'AI & ML Board Room for meetings', coordinates: { x: 33, y: 15, z: 5 }, connectedTo: [], tags: ['boardroom', 'meeting', 'aiml'], isAccessible: true },
    { name: 'AIML Faculty Room', type: 'room', building: 'BSN Block', floor: 5, roomNumber: null, description: 'AI & ML Faculty Room', coordinates: { x: 40.5, y: 12, z: 5 }, connectedTo: [], tags: ['faculty', 'staff', 'aiml'], isAccessible: true },
    { name: 'Staff Room', type: 'room', building: 'BSN Block', floor: 5, roomNumber: null, description: '5th Floor Staff Room', coordinates: { x: 40.5, y: 18, z: 5 }, connectedTo: [], tags: ['staff', 'faculty'], isAccessible: true },
    { name: 'MTech Cybersecurity Research Lab', type: 'room', building: 'BSN Block', floor: 5, roomNumber: 'TR 501', description: 'MTech Cybersecurity Research Laboratory', coordinates: { x: 19.5, y: -8, z: 5 }, connectedTo: [], tags: ['lab', 'research', 'cybersecurity', 'mtech', 'important'], isAccessible: true },
    { name: 'Peter Naur Data Science Lab', type: 'room', building: 'BSN Block', floor: 5, roomNumber: '502', description: 'Peter Naur Data Science Laboratory', coordinates: { x: 24, y: -10, z: 5 }, connectedTo: [], tags: ['lab', 'data science', 'important', 'peter naur'], isAccessible: true },
    { name: '5th Floor Back Lift', type: 'landmark', building: 'BSN Block', floor: 5, description: 'Back lift entrance on 5th floor', coordinates: { x: 50, y: 15, z: 5 }, connectedTo: [], tags: ['lift', 'elevator', 'entrance', 'back'], isAccessible: true },
    // Other
    { name: 'Main Cafeteria', type: 'landmark', building: 'Main Campus', floor: 0, description: 'College main cafeteria', coordinates: { x: 100, y: 50, z: 0 }, connectedTo: [], tags: ['cafeteria', 'food', 'dining'], isAccessible: true },
    { name: 'College Bakery', type: 'landmark', building: 'Main Campus', floor: 0, description: 'College bakery and snacks', coordinates: { x: 110, y: 55, z: 0 }, connectedTo: [], tags: ['bakery', 'food', 'snacks'], isAccessible: true },
    { name: 'Main Library', type: 'building', building: 'BSN Block', floor: 0, description: 'College main library', coordinates: { x: 80, y: 30, z: 0 }, connectedTo: [], tags: ['library', 'books', 'study'], isAccessible: true },
  ];

  try {
    const col = collection(db, LOCATIONS_COL);
    const batch = writeBatch(db);

    for (const loc of locations) {
      const ref = doc(col); // auto-ID
      batch.set(ref, { ...loc, createdAt: new Date() });
    }

    await batch.commit();
    console.log(`✅ Seeded ${locations.length} locations to Firestore`);
>>>>>>> aa2f81e0d91b418f69d8dc2cac50178c13cb758a
  } catch (err) {
    console.error('getAllLocations error:', err);
    return { success: false, count: 0, data: [] };
  }
};

// Search locations
export const searchLocations = async (searchTerm) => {
  try {
    const allSnap = await getAllLocations();
    const all = allSnap.data || [];
    const lower = searchTerm.toLowerCase();

    const filtered = all.filter(loc => {
      return (
        loc.name?.toLowerCase().includes(lower) ||
        loc.description?.toLowerCase().includes(lower) ||
        loc.tags?.some(t => t.toLowerCase().includes(lower))
      );
    });

    return { success: true, count: removeDuplicates(filtered).length, data: removeDuplicates(filtered) };
  } catch (err) {
    console.error('searchLocations error:', err);
    return { success: false, count: 0, data: [] };
  }
};

import api from './api';

// Find path between two locations
export const findPath = async (startId, endId) => {
  try {
    const response = await api.get('/navigation/path', {
      params: { startId, endId },
    });
    return { success: true, data: response.data };
  } catch (err) {
    console.error('findPath error:', err);
    return { success: false, data: null };
  }
};

// Seed data safely (skips if data already exists)
export const seedFirestoreSafely = async () => {
  try {
    const existing = await getAllLocations();
    if (existing.data && existing.data.length > 0) {
      console.log(`✅ Firestore already has ${existing.data.length} locations, skipping seed.`);
      return;
    }
    console.log('🌱 No data found, please run the seed script from backend.');
  } catch (err) {
    console.error('seedFirestoreSafely error:', err);
  }
};