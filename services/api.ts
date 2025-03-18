import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/constants';
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to check if token is expired, using only JWT date
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Only check if the token has a valid expiration date and if it's past that date
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token expired based on JWT date');
      return true;
    }
    
    return false; // Token is still valid
  } catch (error) {
    console.error('Error decoding token:', error);
    return false; // If there's an error decoding, assume token is valid (don't force logout)
  }
};

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      // Only check expiration for tokens older than 30 days
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const tokenAgeInDays = (currentTime - decoded.iat) / (60 * 60 * 24);
        
        // Check if token is more than 30 days old, only then check expiration
        if (tokenAgeInDays > 30 && decoded.exp && decoded.exp < currentTime) {
          console.log('Token older than 30 days and expired, clearing token');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          // Return the config without the token
          return config;
        }
      } catch (e) {
        // If we can't decode the token, just continue and add it
        console.log('Could not parse token, using it anyway');
      }
      
      // Token is valid or we couldn't check, add it to headers
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors but be less aggressive with token validation
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Only handle cases where the server explicitly says token is invalid or expired
    if (error.response && error.response.status === 401 && 
        error.response.data && 
        (error.response.data.message === 'Invalid token' || 
         error.response.data.message === 'Token expired')) {
      
      console.log('Server reported invalid/expired token, clearing token data');
      // Clear token and user data only when server explicitly says token is bad
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

// Add rate limiting protection
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second minimum between requests
const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // Start with 2 second delay

// Add queue for pending requests to prevent flooding the server
const requestQueue = [];
let isProcessingQueue = false;

// Process the queue one request at a time with proper delays
const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { config, resolve, reject } = requestQueue.shift();
    
    try {
      // Ensure minimum time between requests
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise(r => setTimeout(r, delay));
      }
      
      console.log(`API: Making request to ${config.url}`);
      const response = await api(config);
      lastRequestTime = Date.now();
      resolve(response);
      
      // Small delay after each successful request to prevent overwhelming server
      await new Promise(r => setTimeout(r, 300));
    } catch (error) {
      console.error(`API: Error in request to ${config.url}`, error);
      
      // Handle rate limiting with exponential backoff
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.log('API: Rate limited (429). Implementing exponential backoff...');
        let retryCount = 0;
        
        while (retryCount < MAX_RETRIES) {
          const backoffTime = BASE_DELAY * Math.pow(2, retryCount);
          console.log(`API: Waiting ${backoffTime}ms before retry ${retryCount + 1}/${MAX_RETRIES}`);
          
          await new Promise(r => setTimeout(r, backoffTime));
          
          try {
            console.log(`API: Retrying request to ${config.url} (${retryCount + 1}/${MAX_RETRIES})`);
            const retryResponse = await api(config);
            lastRequestTime = Date.now();
            resolve(retryResponse);
            // Successful retry, break out of retry loop
            break;
          } catch (retryError) {
            retryCount++;
            
            // If it's not a rate limit error or we've reached max retries, give up
            if (!axios.isAxiosError(retryError) || 
                retryError.response?.status !== 429 || 
                retryCount >= MAX_RETRIES) {
              reject(retryError);
              break;
            }
          }
        }
      } else {
        reject(error);
      }
    }
  }
  
  isProcessingQueue = false;
};

// Create a throttled API client with proper return types
export const apiSafe = {
  get: <T = any>(url: string, config = {}): Promise<{data: T, status: number}> => {
    return new Promise((resolve, reject) => {
      requestQueue.push({
        config: { ...config, method: 'get', url },
        resolve,
        reject
      });
      processQueue();
    });
  },
  
  post: <T = any>(url: string, data: any, config = {}): Promise<{data: T, status: number}> => {
    return new Promise((resolve, reject) => {
      requestQueue.push({
        config: { ...config, method: 'post', url, data },
        resolve,
        reject
      });
      processQueue();
    });
  },
  
  delete: <T = any>(url: string, config = {}): Promise<{data: T, status: number}> => {
    return new Promise((resolve, reject) => {
      requestQueue.push({
        config: { ...config, method: 'delete', url },
        resolve,
        reject
      });
      processQueue();
    });
  },
  
  put: <T = any>(url: string, data: any, config = {}): Promise<{data: T, status: number}> => {
    return new Promise((resolve, reject) => {
      requestQueue.push({
        config: { ...config, method: 'put', url, data },
        resolve,
        reject
      });
      processQueue();
    });
  }
};

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
    console.log(`API_LOGIN: Attempting login for ${data.email}`);
    
    try {
      const response = await api.post('/auth/login', data);
      console.log('API_LOGIN: Login successful, received token');
      
      // Log token details (first few chars only for security)
      const token = response.data.token;
      console.log('API_LOGIN: Token length:', token.length);
      if (token.length > 10) {
        console.log('API_LOGIN: Token prefix:', token.substring(0, 10) + '...');
      }
      
      try {
        // Try to decode token to verify format before saving
        const decoded: any = jwtDecode(token);
        console.log('API_LOGIN: Token decoded successfully');
        console.log('API_LOGIN: Token exp time:', new Date(decoded.exp * 1000).toISOString());
      } catch (decodeError) {
        console.error('API_LOGIN: Failed to decode token', decodeError);
      }
      
      // Save token and user to AsyncStorage
      try {
        await AsyncStorage.setItem('token', token);
        console.log('API_LOGIN: Token saved to AsyncStorage');
        
        // Get token right after saving to verify
        const savedToken = await AsyncStorage.getItem('token');
        console.log('API_LOGIN: Token verification after save:', !!savedToken);
        if (savedToken) {
          console.log('API_LOGIN: Saved token length:', savedToken.length);
        } else {
          console.warn('API_LOGIN: ⚠️ Token was not saved correctly!');
        }
      } catch (storageError) {
        console.error('API_LOGIN: Error saving token to AsyncStorage:', storageError);
      }
      
      try {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('API_LOGIN: User saved to AsyncStorage');
      } catch (userStorageError) {
        console.error('API_LOGIN: Error saving user to AsyncStorage:', userStorageError);
      }
      
      return response.data;
    } catch (error) {
      console.error('API_LOGIN: Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('API_LOGIN: Response data:', error.response?.data);
        console.error('API_LOGIN: Status code:', error.response?.status);
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