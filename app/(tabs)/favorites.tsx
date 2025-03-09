import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Define types for our data
interface FavoriteItem {
  id: string;
  name: string;
  type: 'prayer' | 'dua';
  time?: string;
  description?: string;
}

export default function FavoritesScreen() {
  // Sample data for favorites
  const favorites: FavoriteItem[] = [
    { id: '1', name: 'Fajr Prayer', type: 'prayer', time: '5:46 AM' },
    { id: '2', name: 'Morning Dua', type: 'dua', description: 'Dua for starting the day' },
    { id: '3', name: 'Protection Dua', type: 'dua', description: 'Dua for protection from harm' },
    { id: '4', name: 'Maghrib Prayer', type: 'prayer', time: '6:38 PM' },
    { id: '5', name: 'Sleep Dua', type: 'dua', description: 'Dua before sleeping' },
  ];

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity style={styles.favoriteItem}>
      <View style={styles.favoriteContent}>
        <Ionicons 
          name={item.type === 'prayer' ? 'time-outline' : 'book-outline'} 
          size={24} 
          color="#0E8A3E" 
          style={styles.favoriteIcon}
        />
        <View style={styles.favoriteTextContainer}>
          <Text style={styles.favoriteName}>{item.name}</Text>
          <Text style={styles.favoriteDescription}>
            {item.type === 'prayer' ? `Prayer Time: ${item.time}` : item.description}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient colors={['#0E8A3E', '#085C29']} style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </LinearGradient>
      
      {/* Content */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Add prayers and duas to your favorites for quick access
          </Text>
        </View>
      )}
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
  },
}); 