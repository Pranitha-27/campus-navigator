// src/services/navigationService.js

import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

// Search locations by name/tag/description
export const searchLocations = async (query) => {
  try {
    const res = await api.get(`/navigation/search`, { params: { query } });
    return res.data?.locations || res.data || [];
  } catch (err) {
    console.warn('searchLocations failed:', err.message);
    return [];
  }
};

// Get all locations (with optional filters: building, floor, type)
export const getAllLocations = async (filters = {}) => {
  try {
    const res = await api.get(`/navigation/locations`, { params: filters });
    return res.data?.locations || res.data || [];
  } catch (err) {
    console.warn('getAllLocations failed:', err.message);
    return [];
  }
};

// Get a single location by ID
export const getLocation = async (id) => {
  try {
    const res = await api.get(`/navigation/locations/${id}`);
    return res.data?.location || res.data || null;
  } catch (err) {
    console.warn('getLocation failed:', err.message);
    return null;
  }
};

// Find path between two locations
export const findPath = async (startId, endId) => {
  try {
    const res = await api.get(`/navigation/path`, { params: { startId, endId } });
    return res.data?.path || res.data || [];
  } catch (err) {
    console.warn('findPath failed:', err.message);
    return [];
  }
};

// Get nearby locations within a radius
export const getNearbyLocations = async (locationId, radius = 50) => {
  try {
    const res = await api.get(`/navigation/nearby`, { params: { locationId, radius } });
    return res.data?.locations || res.data || [];
  } catch (err) {
    console.warn('getNearbyLocations failed:', err.message);
    return [];
  }
};

export default api;