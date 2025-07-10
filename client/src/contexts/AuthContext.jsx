import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize axios defaults
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = API_URL;
  }, []);

  // Add token to requests if available
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Content-Type'] = 'application/json';
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginData) => {
    try {
      const response = await axios.post('/auth/login', loginData);
      const { data } = response;
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', data.token);
      setUser(data.user);

      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'agent') {
        navigate('/agent');
      }

      return data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Invalid credentials');
      } else if (error.request) {
        throw new Error('Unable to reach the server. Please check your connection.');
      } else {
        throw new Error('Error setting up the request. Please try again.');
      }
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 