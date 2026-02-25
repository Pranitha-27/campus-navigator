// frontend/src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBMj1sFCI5P0pQVMrvODyJjZvCEMjWMS5k",
  authDomain: "campus-navigator-7b651.firebaseapp.com",
  projectId: "campus-navigator-7b651",
  storageBucket: "campus-navigator-7b651.firebasestorage.app",
  messagingSenderId: "655884400108",
  appId: "1:655884400108:web:d4a1fd0b843e280d0e7cc9",
  measurementId: "G-LCEHKX34QT",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);