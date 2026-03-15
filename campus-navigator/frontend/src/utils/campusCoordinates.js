// Mock GPS coordinates for BSN Block campus
// Replace these with real coordinates from Google Maps

export const CAMPUS_CENTER = {
  latitude: 3.1390,   // 👈 replace with your campus lat
  longitude: 101.6869, // 👈 replace with your campus lng
};

// Each building's GPS bounding box
export const BUILDINGS = [
  {
    id: 'bsn-block',
    name: 'BSN Block',
    latitude: 3.1392,
    longitude: 101.6871,
    floors: 5,
    radius: 50, // metres — how close you need to be to "be inside"
  },
  {
    id: 'main-block',
    name: 'Main Block',
    latitude: 3.1388,
    longitude: 101.6865,
    floors: 3,
    radius: 60,
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    latitude: 3.1385,
    longitude: 101.6870,
    floors: 1,
    radius: 30,
  },
  {
    id: 'library',
    name: 'Library',
    latitude: 3.1395,
    longitude: 101.6868,
    floors: 2,
    radius: 40,
  },
];

// Each floor's rooms with GPS coords
// Since rooms are indoors, GPS is approximate — we use
// the building coords + small offsets per room
export const ROOM_LOCATIONS = [
  { id: 'iot-lab',          name: 'IoT Lab',           latitude: 3.13922, longitude: 101.68712, floor: 5, building: 'bsn-block' },
  { id: 'ai-lab',           name: 'AI Lab',            latitude: 3.13921, longitude: 101.68715, floor: 5, building: 'bsn-block' },
  { id: 'cybersecurity-lab',name: 'Cybersecurity Lab', latitude: 3.13920, longitude: 101.68710, floor: 4, building: 'bsn-block' },
  { id: 'networking-lab',   name: 'Networking Lab',    latitude: 3.13919, longitude: 101.68711, floor: 3, building: 'bsn-block' },
  { id: 'cs-lab',           name: 'CS Lab',            latitude: 3.13918, longitude: 101.68713, floor: 2, building: 'bsn-block' },
  { id: 'front-lift',       name: 'Front Lift',        latitude: 3.13923, longitude: 101.68708, floor: 0, building: 'bsn-block' },
  { id: 'back-lift',        name: 'Back Lift',         latitude: 3.13924, longitude: 101.68720, floor: 0, building: 'bsn-block' },
  { id: 'cafeteria',        name: 'Cafeteria',         latitude: 3.13850, longitude: 101.68700, floor: 0, building: 'main-block' },
  { id: 'library',          name: 'Library',           latitude: 3.13950, longitude: 101.68680, floor: 1, building: 'library' },
];

// Calculate distance between two GPS points in metres
export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Find nearest room to a GPS position
export const getNearestRoom = (latitude, longitude) => {
  let nearest = null;
  let minDist = Infinity;
  for (const room of ROOM_LOCATIONS) {
    const dist = getDistance(latitude, longitude, room.latitude, room.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearest = { ...room, distance: Math.round(dist) };
    }
  }
  return nearest;
};