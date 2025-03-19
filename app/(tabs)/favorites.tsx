import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';

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
  icon?: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
            description: subcategory.description || '',
            isDua: true,
            duaId: dua.id,
            icon: subcategory.icon || 'folder-outline'
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
          
          // First verify that the subcategory exists in local data
          // This is just for logging/debugging purposes
          console.log('Navigating to subcategory ID:', item.subcategoryId);
          if (item.subcategoryName) {
            console.log('Subcategory name:', item.subcategoryName);
          }
          
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
          name={(item.icon as any) || 'folder-outline'} 
          size={24} 
          color={colors.primary}
          style={styles.favoriteIcon}
        />
        <View style={styles.favoriteTextContainer}>
          <Text style={styles.favoriteName}>{item.name}</Text>
          <Text style={styles.favoriteDescription}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
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
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.backButtonPlaceholder}></View>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{width: 70}} />
      </View>
      
      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 54,
    paddingBottom: 16,
    height: Platform.OS === 'android' ? 100 : 100,
    backgroundColor: '#1A7F4B',
    width: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButtonPlaceholder: {
    width: 70,
  },
  listContent: {
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    marginRight: 16,
  },
  favoriteTextContainer: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#888888',
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
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
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