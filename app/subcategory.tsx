import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_URL } from '@/config/constants';

type IconName = keyof typeof Ionicons.glyphMap;

// Define the subcategory type
interface Subcategory {
  id: string;
  name: string;
  reference: string;
  description?: string;
  icon?: string;
}

export default function SubcategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams();
  const [category, setCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryResponse = await fetch(`${API_URL}/api/categories/${categoryId}`);
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category');
        }
        const categoryData = await categoryResponse.json();
        
        // Fetch subcategories for this category
        const subcategoriesResponse = await fetch(`${API_URL}/api/subcategories/category/${categoryId}`);
        if (!subcategoriesResponse.ok) {
          throw new Error('Failed to fetch subcategories');
        }
        const subcategoriesData = await subcategoriesResponse.json();
        
        setCategory(categoryData);
        setSubcategories(subcategoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0E8A3E" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#FF3B30" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>{category?.name || 'Subcategories'}</ThemedText>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryInfo}>
            <View style={styles.categoryIcon}>
              <Ionicons name={(category?.icon || 'hand-left-outline') as IconName} size={28} color="white" />
            </View>
            <View style={styles.categoryDetails}>
              <ThemedText style={styles.categoryCount}>
                {subcategories?.length || 0} Dua's
              </ThemedText>
              <ThemedText style={styles.categoryDescription}>
                {category?.description || 'Essential duas for daily prayers, Ramadan, and worship activities'}
              </ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Subcategories List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {subcategories.map((subcategory) => (
            <TouchableOpacity 
              key={subcategory.id} 
              style={styles.listItem} 
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/dua',
                params: { subcategoryId: subcategory.id }
              })}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconContainer}>
                  <Ionicons 
                    name={(subcategory.icon || 'hand-right-outline') as IconName} 
                    size={20} 
                    color="#0E8A3E" 
                  />
                </View>
                <View style={styles.itemMain}>
                  <ThemedText style={styles.itemTitle}>{subcategory.name}</ThemedText>
                  <ThemedText style={styles.itemReference}>{subcategory.reference || ''}</ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#88A398" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0E8A3E',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  iconButton: {
    padding: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  list: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginVertical: 1,
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemMain: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  itemReference: {
    fontSize: 12,
    color: '#888888',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#0E8A3E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 