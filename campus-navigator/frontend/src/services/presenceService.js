import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { getSessionId } from '../utils/sessionId';

const PRESENCE_COL = 'presence';
const STALE_MINUTES = 2; // remove presence older than 2 mins

// Update this user's location in Firestore
export const updatePresence = async (latitude, longitude, nearestRoomId) => {
  try {
    const sessionId = await getSessionId();
    const ref = doc(db, PRESENCE_COL, sessionId);
    await setDoc(ref, {
      sessionId,
      latitude,
      longitude,
      nearestRoom: nearestRoomId || null,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('updatePresence error:', err);
  }
};

// Remove this user's presence (on app close/background)
export const removePresence = async () => {
  try {
    const sessionId = await getSessionId();
    const ref = doc(db, PRESENCE_COL, sessionId);
    await deleteDoc(ref);
  } catch (err) {
    console.error('removePresence error:', err);
  }
};

// Listen to ALL active presence in real time
// Returns unsubscribe function
export const subscribeToPresence = (onUpdate) => {
  const ref = collection(db, PRESENCE_COL);
  return onSnapshot(ref, (snapshot) => {
    const now = Date.now();
    const active = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Filter out stale entries (older than 2 minutes)
      if (data.updatedAt) {
        const age = now - data.updatedAt.toMillis();
        if (age < STALE_MINUTES * 60 * 1000) {
          active.push(data);
        }
      }
    });
    onUpdate(active);
  });
};

// Get crowd count per room
export const getRoomCrowdCounts = (presenceList) => {
  const counts = {};
  for (const p of presenceList) {
    if (p.nearestRoom) {
      counts[p.nearestRoom] = (counts[p.nearestRoom] || 0) + 1;
    }
  }
  return counts;
};