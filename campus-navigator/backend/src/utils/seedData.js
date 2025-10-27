console.log('🚀 Starting seed script...');


const mongoose = require('mongoose');


async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // DROP DATABASE FIRST
    await mongoose.connection.dropDatabase();
    console.log('Old database dropped');
    
    // Your existing seed code here...
    // (add your 5th floor data, etc.)
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log('📁 Environment loaded');
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');

const Location = require('../models/Location');

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

console.log(`📝 Prepared ${sampleLocations.length} sample locations`);

// Function to seed database
async function seedDatabase() {
  console.log('🔄 Connecting to MongoDB...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing locations
    console.log('🗑  Clearing existing locations...');
    const deleteResult = await Location.deleteMany({});
    console.log(`🗑  Deleted ${deleteResult.deletedCount} existing locations`);

    // Insert sample locations
    console.log(`'📥 Inserting sample locations...'`);
    const locations = await Location.insertMany(sampleLocations);
    console.log(`✅ Added ${locations.length} sample locations`);

    // Now let's connect them with paths
    console.log('🔗 Connecting 5th floor locations with paths...');
    
    // Find 5th floor locations
    const frontLift5 = await Location.findOne({ name: '5th Floor Front Lift' });
    const backLift5 = await Location.findOne({ name: '5th Floor Back Lift' });
    const kevinAshtonLab = await Location.findOne({ name: 'Kevin Ashton IoT Lab' });
    const sahyadriLab = await Location.findOne({ name: 'Sahyadri AI Computing Lab' });
    const johnMcCarthyLab = await Location.findOne({ name: 'John McCarthy Lab' });
    const aimlBoardRoom = await Location.findOne({ name: 'AIML Board Room' });
    const aimlFacultyRoom = await Location.findOne({ name: 'AIML Faculty Room' });
    const staffRoom = await Location.findOne({ name: 'Staff Room' });
    const cybersecurityLab = await Location.findOne({ name: 'MTech Cybersecurity Research Lab' });
    const peterNaurLab = await Location.findOne({ name: 'Peter Naur Data Science Lab' });

    // Connect FRONT LIFT to nearby locations
    frontLift5.connectedTo.push(
      {
        locationId: kevinAshtonLab._id,
        distance: 10 * 0.75, // 10 steps = 7.5m
        pathType: 'corridor'
      },
      {
        locationId: sahyadriLab._id,
        distance: 24 * 0.75, // 24 steps = 18m
        pathType: 'corridor'
      },
      {
        locationId: johnMcCarthyLab._id,
        distance: 44 * 0.75, // 44 steps = 33m
        pathType: 'corridor'
      },
      {
        locationId: aimlBoardRoom._id,
        distance: 44 * 0.75,
        pathType: 'corridor'
      },
      {
        locationId: aimlFacultyRoom._id,
        distance: 54 * 0.75, // 54 steps = 40.5m
        pathType: 'corridor'
      },
      {
        locationId: staffRoom._id,
        distance: 54 * 0.75,
        pathType: 'corridor'
      },
      {
        locationId: cybersecurityLab._id,
        distance: 26 * 0.75, // 26 steps = 19.5m
        pathType: 'corridor'
      },
      {
        locationId: peterNaurLab._id,
        distance: 32 * 0.75, // 32 steps = 24m
        pathType: 'corridor'
      }
    );
    await frontLift5.save();
    console.log('  ✓ Connected Front Lift to all rooms');

    // Connect BACK LIFT to nearby locations
    backLift5.connectedTo.push(
      {
        locationId: aimlFacultyRoom._id,
        distance: 11 * 0.75, // 11 steps = 8.25m
        pathType: 'corridor'
      },
      {
        locationId: staffRoom._id,
        distance: 23 * 0.75, // 23 steps = 17.25m
        pathType: 'corridor'
      },
      {
        locationId: johnMcCarthyLab._id,
        distance: 21 * 0.75, // 21 steps = 15.75m
        pathType: 'corridor'
      },
      {
        locationId: sahyadriLab._id,
        distance: 38 * 0.75, // 38 steps = 28.5m
        pathType: 'corridor'
      },
      {
        locationId: kevinAshtonLab._id,
        distance: 56 * 0.75, // 56 steps = 42m
        pathType: 'corridor'
      },
      {
        locationId: cybersecurityLab._id,
        distance: 66 * 0.75, // 66 steps = 49.5m
        pathType: 'corridor'
      },
      {
        locationId: peterNaurLab._id,
        distance: 72 * 0.75, // 72 steps = 54m
        pathType: 'corridor'
      }
    );
    await backLift5.save();
    console.log('  ✓ Connected Back Lift to all rooms');

    // Connect each room back to both lifts (bidirectional)
    const rooms = [
      kevinAshtonLab, sahyadriLab, johnMcCarthyLab, aimlBoardRoom,
      aimlFacultyRoom, staffRoom, cybersecurityLab, peterNaurLab
    ];

    for (const room of rooms) {
      // Find distances from front lift
      const frontConnection = frontLift5.connectedTo.find(
        c => c.locationId.toString() === room._id.toString()
      );
      
      // Find distances from back lift
      const backConnection = backLift5.connectedTo.find(
        c => c.locationId.toString() === room._id.toString()
      );

      if (frontConnection) {
        room.connectedTo.push({
          locationId: frontLift5._id,
          distance: frontConnection.distance,
          pathType: 'corridor'
        });
      }

      if (backConnection) {
        room.connectedTo.push({
          locationId: backLift5._id,
          distance: backConnection.distance,
          pathType: 'corridor'
        });
      }

      await room.save();
    }
    console.log('  ✓ Connected all rooms back to lifts (bidirectional)');

    console.log('✅ All 5th floor locations connected!');
    console.log('🎉 Database seeded successfully!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total locations: ${locations.length}`);
    console.log(`   5th Floor rooms: 10`);
    console.log(`   Front entrance connections: 8`);
    console.log(`   Back entrance connections: 7`);
    
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

console.log('🏃 Running seed function...');

// Run the seeding function
seedDatabase();