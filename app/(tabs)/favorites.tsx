import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';

import { getFavorites } from '@/services/favorites';
import { API_URL } from '@/config/constants';

// Define types for our data
interface FavoriteItem {
  id: number;
  dua_id: string;
  subcategory_id: string;
  created_at: string;
}

interface DisplayFavorite {
  id: string;
  name: string;
  subcategoryId: string;
  subcategoryName: string;
  description: string;
  isDua?: boolean;
  duaId?: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<DisplayFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Reload data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Favorites screen focused - refreshing data');
      checkAuthAndLoadFavorites();
      return () => {
        // Cleanup on screen unfocus (optional)
      };
    }, [])
  );
  
  // Initial load
  useEffect(() => {
    checkAuthAndLoadFavorites();
  }, []);

  const checkAuthAndLoadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (!token || !userData) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      
      setIsLoggedIn(true);
      await loadFavorites();
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Get user favorites
      const userFavorites = await getFavorites();
      
      if (!userFavorites || userFavorites.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // We need to convert the IDs to actual data by fetching from the API
      const displayFavs: DisplayFavorite[] = [];
      
      for (const fav of userFavorites) {
        try {
          // Fetch the dua data
          const duaResponse = await fetch(`${API_URL}/api/duas/${fav.dua_id}`);
          if (!duaResponse.ok) continue;
          const dua = await duaResponse.json();
          
          // Fetch the subcategory data
          const subcategoryResponse = await fetch(`${API_URL}/api/subcategories/${dua.subcategory_id}`);
          if (!subcategoryResponse.ok) continue;
          const subcategory = await subcategoryResponse.json();
          
          displayFavs.push({
            id: fav.id.toString(),
            name: dua.name,
            subcategoryId: dua.subcategory_id,
            subcategoryName: subcategory.name,
            description: dua.description || '',
            isDua: true,
            duaId: dua.id
          });
        } catch (error) {
          console.error('Error processing favorite:', error);
        }
      }
      
      setFavorites(displayFavs);
      
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: DisplayFavorite) => {
    try {
      console.log('Item pressed:', item);
      
      if (item.isDua) {
        // If it's a dua item, navigate to the dua details
        console.log('Navigating to dua (isDua=true):', { subcategoryId: item.subcategoryId });
        router.push(`/dua?subcategoryId=${item.subcategoryId}`);
      } else {
        // When clicking a subcategory in favorites, we want to go directly to the dua
        // If duaId is available, navigate directly to dua page
        if (item.duaId) {
          console.log('Navigating directly to dua from favorites:', { 
            subcategoryId: item.subcategoryId, 
            duaId: item.duaId 
          });
          
          // First verify that the subcategory actually exists
          const subcategory = subcategoriesData.subcategories
            .flatMap(cat => cat.subcategories)
            .find(sub => sub.id === item.subcategoryId);
            
          console.log('Found subcategory?', !!subcategory, subcategory?.name);
          
          // Verify that a dua exists for this subcategory
          const dua = duasData.duas.find(d => d.subcategory_id === item.subcategoryId);
          console.log('Found dua for subcategory?', !!dua, dua?.name);
          
          // Navigate to dua screen with the subcategory ID
          router.push(`/dua?subcategoryId=${item.subcategoryId}`);
        } else {
          // Fallback to subcategory screen
          console.log('Fallback: navigating to subcategory screen:', { subcategoryId: item.subcategoryId });
          router.push(`/subcategory?subcategoryId=${item.subcategoryId}`);
        }
      }
    } catch (error) {
      console.error('Error in handleItemPress:', error);
      // Fallback navigation
      router.push('/');
    }
  };

  const renderItem = ({ item }: { item: DisplayFavorite }) => (
    <TouchableOpacity 
      style={styles.favoriteItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.favoriteContent}>
        <Ionicons 
          name="folder-outline" 
          size={24} 
          color="#0E8A3E" 
          style={styles.favoriteIcon}
        />
        <View style={styles.favoriteTextContainer}>
          <Text style={styles.favoriteName}>{item.name}</Text>
          <Text style={styles.favoriteDescription}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#0E8A3E" />
        </View>
      );
    }

    if (!isLoggedIn) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="log-in-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Login Required</Text>
          <Text style={styles.emptySubtext}>
            Please login to view and manage your favorites
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (favorites.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Add duas to your favorites for quick access
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient colors={['#0E8A3E', '#085C29']} style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </LinearGradient>
      
      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  favoriteIcon: {
    marginRight: 16,
  },
  favoriteTextContainer: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#0E8A3E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 