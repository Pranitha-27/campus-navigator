// backend/generate-qr.js
const QRCode = require('qrcode');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function generateQRForLocation(locationId, locationName) {
  try {
    // Generate QR code with location ID
    const qrData = locationId;
    
    await QRCode.toFile(`./qr-codes/${locationName.replace(/\s+/g, '-').toLowerCase()}.png`, qrData, {
      width: 400,
      height: 400,
    });
    
    console.log(`✅ Generated QR for: ${locationName}`);
    console.log(`   Data: ${qrData}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  // Create output directory
  const fs = require('fs');
  if (!fs.existsSync('./qr-codes')) {
    fs.mkdirSync('./qr-codes');
  }

  // Get all locations from Firebase
  const snapshot = await db.collection('locations').get();
  
  console.log(`Found ${snapshot.size} locations\n`);
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    await generateQRForLocation(doc.id, data.name);
  }
  
  console.log('\n✅ All QR codes generated in ./qr-codes/ folder');
  process.exit(0);
}

main();