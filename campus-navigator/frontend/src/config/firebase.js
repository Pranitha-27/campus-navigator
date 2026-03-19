// frontend/src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpNWCrnkvt8RNz10leQPRE2VyxDnlxa7M",
  authDomain: "campus-navigator-fbd98.firebaseapp.com",
  projectId: "campus-navigator-fbd98",
  storageBucket: "campus-navigator-fbd98.firebasestorage.app",
  messagingSenderId: "303146270835",
  appId: "1:303146270835:web:84ffb7b91beeefc4c16a06",
  measurementId: "G-9CW03B0PZ8",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;