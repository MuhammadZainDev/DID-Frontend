import api from './api';

// Add dua to favorites
export const addFavorite = async (duaId: string, subcategoryId: string) => {
  try {
    const response = await api.post('/favorites', { duaId, subcategoryId });
    return response.data;
  } catch (error) {
    console.error('Add favorite error:', error);
    throw error;
  }
};

// Remove dua from favorites
export const removeFavorite = async (duaId: string) => {
  try {
    const response = await api.delete(`/favorites/${duaId}`);
    return response.data;
  } catch (error) {
    console.error('Remove favorite error:', error);
    throw error;
  }
};

// Get all favorites
export const getFavorites = async () => {
  try {
    console.log('Making API call to get favorites');
    const response = await api.get('/favorites');
    console.log('Get favorites API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get favorites error:', error);
    console.error('Get favorites error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return [];
  }
};

// Check if a dua is in favorites
export const checkFavorite = async (duaId: string) => {
  try {
    const response = await api.get(`/favorites/check/${duaId}`);
    return response.data.isFavorite;
  } catch (error) {
    console.error('Check favorite error:', error);
    return false;
  }
}; 