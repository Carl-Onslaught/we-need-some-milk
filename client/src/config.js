export const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL is not set! Please create a .env file in the client directory with VITE_API_URL=http://localhost:5001/api');
}

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