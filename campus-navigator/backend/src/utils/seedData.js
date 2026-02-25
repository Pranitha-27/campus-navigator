const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../../serviceAccountKey.json'); // replace with your key path
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Sample locations for BSN Block
// Note: 1 step ≈ 0.75 meters
const sampleLocations = [
  // Ground Floor
  {
    name: 'BSN Block Main Entrance',
    type: 'landmark',
    building: 'BSN Block',
    floor: 0,
    roomNumber: null,
    description: 'Main entrance to BSN Block',
    coordinates: { x: 0, y: 0, z: 0 },
    connectedTo: [],
    tags: ['entrance', 'ground floor'],
  },
  {
    name: 'Ground Floor Front Lift',
    type: 'landmark',
    building: 'BSN Block',
    floor: 0,
    description: 'Lift at front entrance',
    coordinates: { x: 10, y: 0, z: 0 },
    connectedTo: [],
    tags: ['lift', 'elevator'],
  },
  {
    name: 'Ground Floor Back Lift',
    type: 'landmark',
    building: 'BSN Block',
    floor: 0,
    description: 'Lift at back entrance',
    coordinates: { x: -10, y: 0, z: 0 },
    connectedTo: [],
    tags: ['lift', 'elevator'],
  },

  // First Floor
  {
    name: 'BOT Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 1,
    roomNumber: '101',
    description: 'Biology and Biotechnology Laboratory',
    coordinates: { x: 30, y: 15, z: 1 },
    connectedTo: [],
    tags: ['lab', 'biology', 'important'],
  },
  {
    name: 'IoT Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 1,
    roomNumber: '102',
    description: 'Internet of Things Laboratory',
    coordinates: { x: 40, y: 15, z: 1 },
    connectedTo: [],
    tags: ['lab', 'iot', 'technology', 'important'],
  },

  // Second Floor
  {
    name: 'Von Neumann Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 2,
    roomNumber: '201',
    description: 'Computer Science Laboratory',
    coordinates: { x: 30, y: 25, z: 2 },
    connectedTo: [],
    tags: ['lab', 'computer', 'cs', 'important'],
  },

  // ========================================
  // FIFTH FLOOR - Front Entrance (Front Lift)
  // ========================================
  {
    name: '5th Floor Front Lift',
    type: 'landmark',
    building: 'BSN Block',
    floor: 5,
    description: 'Front lift entrance on 5th floor',
    coordinates: { x: 0, y: 0, z: 5 },
    connectedTo: [],
    tags: ['lift', 'elevator', 'entrance', 'front'],
  },
  {
    name: 'Kevin Ashton IoT Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: '501',
    description: 'Kevin Ashton IoT Laboratory',
    coordinates: { x: 7.5, y: 0, z: 5 }, // 10 steps = 7.5m from front lift
    connectedTo: [],
    tags: ['lab', 'iot', 'important', 'kevin ashton'],
  },
  {
    name: 'Sahyadri AI Computing Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: '507',
    description: 'Sahyadri Artificial Intelligence Computing Laboratory',
    coordinates: { x: 18, y: 5, z: 5 }, // 24 steps = 18m from front lift
    connectedTo: [],
    tags: ['lab', 'ai', 'computing', 'important', 'sahyadri'],
  },
  {
    name: 'John McCarthy Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: '506',
    description: 'John McCarthy AI Laboratory',
    coordinates: { x: 33, y: 8, z: 5 }, // 44 steps = 33m from front lift
    connectedTo: [],
    tags: ['lab', 'ai', 'important', 'john mccarthy'],
  },
  {
    name: 'AIML Board Room',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: null,
    description: 'AI & ML Board Room for meetings',
    coordinates: { x: 33, y: 15, z: 5 }, // 44 steps from front lift
    connectedTo: [],
    tags: ['boardroom', 'meeting', 'aiml'],
  },
  {
    name: 'AIML Faculty Room',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: null,
    description: 'AI & ML Faculty Room',
    coordinates: { x: 40.5, y: 12, z: 5 }, // 54 steps = 40.5m from front lift
    connectedTo: [],
    tags: ['faculty', 'staff', 'aiml'],
  },
  {
    name: 'Staff Room',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: null,
    description: '5th Floor Staff Room',
    coordinates: { x: 40.5, y: 18, z: 5 }, // 54 steps from front lift
    connectedTo: [],
    tags: ['staff', 'faculty'],
  },
  {
    name: 'MTech Cybersecurity Research Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: 'TR 501',
    description: 'MTech Cybersecurity Research Laboratory',
    coordinates: { x: 19.5, y: -8, z: 5 }, // 26 steps = 19.5m from front lift
    connectedTo: [],
    tags: ['lab', 'research', 'cybersecurity', 'mtech', 'important'],
  },
  {
    name: 'Peter Naur Data Science Lab',
    type: 'room',
    building: 'BSN Block',
    floor: 5,
    roomNumber: '502',
    description: 'Peter Naur Data Science Laboratory',
    coordinates: { x: 24, y: -10, z: 5 }, // 32 steps = 24m from front lift
    connectedTo: [],
    tags: ['lab', 'data science', 'important', 'peter naur'],
  },

  // ========================================
  // FIFTH FLOOR - Back Entrance (Back Lift)
  // ========================================
  {
    name: '5th Floor Back Lift',
    type: 'landmark',
    building: 'BSN Block',
    floor: 5,
    description: 'Back lift entrance on 5th floor',
    coordinates: { x: 50, y: 15, z: 5 },
    connectedTo: [],
    tags: ['lift', 'elevator', 'entrance', 'back'],
  },

  // Other Buildings
  {
    name: 'Main Cafeteria',
    type: 'landmark',
    building: 'Main Campus',
    floor: 0,
    description: 'College main cafeteria',
    coordinates: { x: 100, y: 50, z: 0 },
    connectedTo: [],
    tags: ['cafeteria', 'food', 'dining'],
  },
  {
    name: 'College Bakery',
    type: 'landmark',
    building: 'Main Campus',
    floor: 0,
    description: 'College bakery and snacks',
    coordinates: { x: 110, y: 55, z: 0 },
    connectedTo: [],
    tags: ['bakery', 'food', 'snacks'],
  },
  {
    name: 'Main Library',
    type: 'building',
    building: 'Library Block',
    floor: 0,
    description: 'College main library',
    coordinates: { x: 80, y: 30, z: 0 },
    connectedTo: [],
    tags: ['library', 'books', 'study'],
  },
];

async function seedFirebase() {
  console.log('🔄 Starting Firebase seeding...');
  
  try {
    for (const loc of sampleLocations) {
      // Use deterministic doc ID to prevent duplicates
      const docId = loc.name.replace(/\s+/g, '_').toLowerCase();
      await db.collection('locations').doc(docId).set(loc, { merge: true });
      console.log(`✅ Seeded: ${loc.name}`);
    }

    console.log(`🎉 All ${sampleLocations.length} locations seeded without duplicates!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase seed error:', error);
    process.exit(1);
  }
}

seedFirebase();