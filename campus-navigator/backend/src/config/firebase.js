// backend/src/config/firebase.js
// This file is ONLY for the Node.js backend using Firebase Admin SDK

// ✅ Use require() for firebase-admin
const admin = require('firebase-admin');

// ✅ Ensure this path correctly points to your downloaded service account key
//    It should be in the 'backend' folder, not inside 'src'
const serviceAccount = require('../../serviceAccountKey.json'); 

// Check if Firebase app is already initialized to prevent re-initialization
// (useful if you're using nodemon)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore(); // Get Firestore instance from Admin SDK
// You can also get other services like auth, storage if needed from 'admin'
// const auth = admin.auth(); 

module.exports = { admin, db }; // Export db for use in controllers