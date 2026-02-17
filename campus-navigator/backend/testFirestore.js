// backend/testFirestore.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log('🔥 Testing Firebase Firestore connection...\n');

    // Test 1: Get all locations
    console.log('📍 Fetching all locations...');
    const snapshot = await db.collection('locations').get();

    if (snapshot.empty) {
      console.log('❌ No documents found in "locations" collection.');
      console.log('💡 Please add documents manually in Firebase Console.');
      return;
    }

    console.log(`✅ Found ${snapshot.size} location(s):\n`);

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 ID: ${doc.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Type: ${data.type}`);
      console.log(`   Building: ${data.building}`);
      console.log(`   Floor: ${data.floor}`);
      console.log(`   Tags: ${data.tags ? data.tags.join(', ') : 'none'}`);
      console.log('   ---');
    });

    console.log('\n✅ Firestore connection successful!');
  } catch (error) {
    console.error('❌ Firestore error:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check if billing is enabled for your project');
    console.error('   2. Verify serviceAccountKey.json is correct');
    console.error('   3. Ensure Firestore database is created');
    console.error('   4. Check if "locations" collection exists');
  }
}

testFirestore();