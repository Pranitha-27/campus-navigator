import api from './api';

// Search for locations
export const searchLocations = async (query) => {
  try {
    const response = await api.get(`/navigation/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Get all locations with filters
export const getAllLocations = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/navigation/locations?${params}`);
    return response.data;
  } catch (error) {
    console.error('Get locations error:', error);
    throw error;
  }
};

// Get locations by floor
export const getLocationsByFloor = async (building, floor) => {
  try {
    const response = await api.get(`/navigation/locations?building=${building}&floor=${floor}`);
    return response.data;
  } catch (error) {
    console.error('Get locations by floor error:', error);
    throw error;
  }
};

// Find path between two locations
export const findPath = async (startId, endId) => {
  try {
    const response = await api.get(`/navigation/path?startId=${startId}&endId=${endId}`);
    return response.data;
  } catch (error) {
    console.error('Find path error:', error);
    throw error;
  }
};