// Get the current hostname and protocol
const protocol = window.location.protocol;
const hostname = window.location.hostname;
const port = 5001; // Server port

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const BASE_URL = 'http://localhost:5001';

// For development, allow both localhost and network access
if (process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
  console.log('Development mode: Allowing both localhost and network access');
}

// Axios default configuration
export const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
}; 