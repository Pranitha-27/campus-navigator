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
    return { success: true, count: removeDuplicates(data).length, data: removeDuplicates(data) };
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