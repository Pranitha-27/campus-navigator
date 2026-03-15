import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'campus_session_id';

// Generates a random ID like "user_a3f9b2"
const generateId = () =>
  'user_' + Math.random().toString(36).substring(2, 8);

export const getSessionId = async () => {
  try {
    const existing = await AsyncStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const newId = generateId();
    await AsyncStorage.setItem(SESSION_KEY, newId);
    return newId;
  } catch {
    return generateId(); // fallback if storage fails
  }
};