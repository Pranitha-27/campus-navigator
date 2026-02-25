import axios from 'axios';

// For Android Emulator
const API_URL = 'http://192.168.0.103:5000/api';

// For Physical Device - replace with your computer's IP
// Find your IP: Windows (ipconfig), Mac (ifconfig | grep inet)
// const API_URL = 'http://192.168.1.XXX:5000/api';

// For iOS Simulator
// const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;