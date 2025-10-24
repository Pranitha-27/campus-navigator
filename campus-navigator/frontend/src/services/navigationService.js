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

// Get all locations
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

// Get single location
export const getLocation = async (id) => {
  try {
    const response = await api.get(`/navigation/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get location error:', error);
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

// Get nearby locations
export const getNearbyLocations = async (locationId, radius = 50) => {
  try {
    const response = await api.get(`/navigation/nearby?locationId=${locationId}&radius=${radius}`);
    return response.data;
  } catch (error) {
    console.error('Get nearby error:', error);
    throw error;
  }
};