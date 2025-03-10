import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token here if you have a refresh token mechanism
        // For now, just redirect to login
        // You might want to use a navigation service to handle this in a real app
        console.log('Unauthorized access, user needs to login again');
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  async signup(data: { name: string; email: string; password: string; confirmPassword: string }) {
    try {
      const response = await api.post('/auth/signup', data);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to create account');
      }
      throw error;
    }
  },

  async login(data: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Invalid email or password');
      }
      throw error;
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
}; 