import api, { apiSafe } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/constants';

// Add dua to favorites
export const addFavorite = async (duaId: number, token: string, subcategoryId: number): Promise<void> => {
  if (!duaId || typeof duaId !== 'number') {
    console.error('FAVORITE_ADD: Invalid duaId provided:', duaId);
    throw new Error('Invalid dua ID');
  }
  
  if (!subcategoryId || typeof subcategoryId !== 'number') {
    console.error('FAVORITE_ADD: Invalid subcategoryId provided:', subcategoryId);
    throw new Error('Invalid subcategory ID');
  }
  
  if (!token) {
    console.error('FAVORITE_ADD: No token provided');
    throw new Error('Authentication token is required');
  }
  
  console.log(`FAVORITE_ADD: Adding dua ${duaId} with subcategory ${subcategoryId} to favorites`);
  console.log('FAVORITE_ADD: Token length:', token.length);
  
  try {
    // Display token prefix for debugging (first few chars only)
    if (token.length > 10) {
      console.log('FAVORITE_ADD: Token prefix:', token.substring(0, 10) + '...');
    }
    
    // Log the full request details
    console.log('FAVORITE_ADD: Making POST request to /favorites');
    console.log('FAVORITE_ADD: Request payload:', { duaId, subcategoryId });
    console.log('FAVORITE_ADD: Request headers include Authorization token');
    
    const response = await axios.post(
      `${API_URL}/api/favorites`,
      { duaId, subcategoryId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('FAVORITE_ADD: Response status:', response.status);
    console.log('FAVORITE_ADD: Response data:', response.data);
    
    return response.data;
  } catch (error: unknown) {
    console.error('FAVORITE_ADD: Error adding favorite:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('FAVORITE_ADD: Response status:', error.response?.status);
      console.error('FAVORITE_ADD: Response data:', error.response?.data);
      console.error('FAVORITE_ADD: Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        hasAuthHeader: !!error.config?.headers?.Authorization,
      });
    }
    
    throw error;
  }
};

// Remove dua from favorites
export const removeFavorite = async (duaId: number, token: string): Promise<void> => {
  if (!duaId || typeof duaId !== 'number') {
    console.error('FAVORITE_REMOVE: Invalid duaId provided:', duaId);
    throw new Error('Invalid dua ID');
  }
  
  if (!token) {
    console.error('FAVORITE_REMOVE: No token provided');
    throw new Error('Authentication token is required');
  }
  
  console.log(`FAVORITE_REMOVE: Removing dua ${duaId} from favorites`);
  console.log('FAVORITE_REMOVE: Token length:', token.length);
  
  try {
    // Display token prefix for debugging (first few chars only)
    if (token.length > 10) {
      console.log('FAVORITE_REMOVE: Token prefix:', token.substring(0, 10) + '...');
    }
    
    // Log the full request details
    console.log('FAVORITE_REMOVE: Making DELETE request to /favorites/${duaId}');
    console.log('FAVORITE_REMOVE: Request headers include Authorization token');
    
    const response = await axios.delete(
      `${API_URL}/api/favorites/${duaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('FAVORITE_REMOVE: Response status:', response.status);
    console.log('FAVORITE_REMOVE: Response data:', response.data);
    
    return response.data;
  } catch (error: unknown) {
    console.error('FAVORITE_REMOVE: Error removing favorite:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('FAVORITE_REMOVE: Response status:', error.response?.status);
      console.error('FAVORITE_REMOVE: Response data:', error.response?.data);
      console.error('FAVORITE_REMOVE: Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        hasAuthHeader: !!error.config?.headers?.Authorization,
      });
    }
    
    throw error;
  }
};

// Get all favorites
export const getFavorites = async () => {
  try {
    console.log('FAVORITES_GET: Getting token');
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      console.log('FAVORITES_GET: No token found, returning empty array');
      return [];
    }
    
    console.log('FAVORITES_GET: Making API call to get favorites');
    
    // Use apiSafe for rate limiting protection
    const response = await apiSafe.get('/favorites', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response && response.data) {
      console.log('FAVORITES_GET: Got response with', Array.isArray(response.data) ? response.data.length : '0', 'favorites');
      return Array.isArray(response.data) ? response.data : [];
    }
    
    return [];
  } catch (error) {
    console.error('FAVORITES_GET: Error getting favorites:', error);
    
    // Only clear token if server explicitly says token is invalid (not for other errors)
    if (axios.isAxiosError(error) && error.response?.status === 401 && 
        error.response.data && 
        (error.response.data.message === 'Invalid token' || 
         error.response.data.message === 'Token expired')) {
      console.log('FAVORITES_GET: Server explicitly reported invalid token');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    // Return empty array as fallback
    return [];
  }
};

// Check if a dua is in favorites
export const checkFavorite = async (duaId: string): Promise<boolean> => {
  try {
    console.log('FAVORITE_CHECK: Getting token');
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      console.log('FAVORITE_CHECK: No token found, returning false');
      return false;
    }
    
    console.log(`FAVORITE_CHECK: Checking dua ${duaId} favorite status`);
    
    // Use apiSafe for rate limiting protection
    const response = await apiSafe.get(`/favorites/check/${duaId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response && response.data) {
      console.log('FAVORITE_CHECK: Got response', response.data);
      return !!response.data.isFavorite;
    }
    
    return false;
  } catch (error) {
    console.error('FAVORITE_CHECK: Error checking favorite:', error);
    
    // Only clear token if server explicitly says token is invalid (not for other errors)
    if (axios.isAxiosError(error) && error.response?.status === 401 && 
        error.response.data && 
        (error.response.data.message === 'Invalid token' || 
         error.response.data.message === 'Token expired')) {
      console.log('FAVORITE_CHECK: Server explicitly reported invalid token');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    // If rate limited or other temporary server error, don't crash the app
    // Just return false as a fallback
    return false;
  }
}; 