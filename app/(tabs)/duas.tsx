import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/constants';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import NetInfo from '@react-native-community/netinfo';

// Sample data for duas
const sampleDuas = [
  {
    id: '1',
    title: 'Morning Dua',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    translation: 'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
    category: 'Morning Adhkar'
  },
  {
    id: '2',
    title: 'Evening Dua',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    translation: 'O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.',
    category: 'Evening Adhkar'
  },
  {
    id: '3',
    title: 'Before Sleep',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    translation: 'In Your name O Allah, I die and I live.',
    category: 'Sleep & Wake up'
  },
  {
    id: '4',
    title: 'After Waking Up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
    category: 'Sleep & Wake up'
  },
  {
    id: '5',
    title: 'Entering Masjid',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    translation: 'O Allah, open the gates of Your mercy for me.',
    category: 'Entering & Leaving'
  },
];

// Interface for category type
interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Interface for subcategory type
interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  icon: string;
  description: string;
}

export default function DuasScreen() {
  const [searchText, setSearchText] = useState('');
  const { translations } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add a ref to track if we're retrying to avoid state conflicts
  const isRetrying = useRef(false);

  // Load categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let categoriesData: Category[] = [];
        let subcategoriesData: Subcategory[] = [];
        let fromCache = false;
        
        // Always try to load from cache first
        const cachedCategories = await AsyncStorage.getItem('categories_cache');
        const cachedSubcategories = await AsyncStorage.getItem('subcategories_cache');
        
        if (cachedCategories && cachedSubcategories) {
          // We have cached data, use it immediately
          categoriesData = JSON.parse(cachedCategories);
          subcategoriesData = JSON.parse(cachedSubcategories);
          setCategories(categoriesData);
          setSubcategories(subcategoriesData);
          fromCache = true;
          console.log('Loaded duas categories from cache');
        }
        
        // Check network state
        const netInfo = await NetInfo.fetch();
        
        // If online, try to get fresh data in the background
        if (netInfo.isConnected) {
          try {
            const categoriesResponse = await fetch(`${API_URL}/api/categories`);
            if (categoriesResponse.ok) {
              categoriesData = await categoriesResponse.json();
              
              const subcategoriesResponse = await fetch(`${API_URL}/api/subcategories`);
              if (subcategoriesResponse.ok) {
                subcategoriesData = await subcategoriesResponse.json();
                
                // Cache successful network response
                await AsyncStorage.setItem('categories_cache', JSON.stringify(categoriesData));
                await AsyncStorage.setItem('subcategories_cache', JSON.stringify(subcategoriesData));
                
                // Only update UI if we didn't already set from cache
                if (!fromCache) {
                  setCategories(categoriesData);
                  setSubcategories(subcategoriesData);
                }
                
                console.log('Successfully fetched fresh categories data from network');
              }
            }
          } catch (networkError) {
            console.log('Network error (silent):', networkError);
            // Don't set error state if we already have cached data
            if (!fromCache) {
              console.log('No cached data available and network failed');
              setError('Could not connect to server. Check your internet connection and try again.');
            }
          }
        } else if (!fromCache) {
          // If we're offline and have no cache, show a message
          setError('No internet connection and no cached data available. Please connect to the internet and try again.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load duas categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter subcategories based on selected category and search text
  const filteredSubcategories = subcategories.filter(subcategory => {
    const matchesSearch = subcategory.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subcategory.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Update the selectedCategoryTag style dynamically
  const dynamicStyles = {
    selectedTag: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    }
  };

  // Render category item with dynamic styles
  const renderCategoryItem = (item: Category) => (
    <TouchableOpacity 
      key={item.id} 
      style={[
        styles.categoryTag, 
        selectedCategory === item.id && dynamicStyles.selectedTag
      ]} 
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={16} 
        color={selectedCategory === item.id ? "#FFFFFF" : colors.primary} 
        style={styles.categoryTagIcon}
      />
      <Text style={[styles.categoryTagText, selectedCategory === item.id && styles.selectedCategoryTagText]}>
        {translations[`category.${item.id}`] || item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render subcategory grid item
  const renderSubcategoryItem = ({ item }: { item: Subcategory }) => (
    <TouchableOpacity 
      style={styles.subcategoryItem} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/dua',
        params: { subcategoryId: item.id }
      })}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={item.icon as any} size={24} color={colors.primary} />
      </View>
      <Text style={styles.subcategoryLabel}>
        {translations[`subcategory.${item.id}`] || item.name}
      </Text>
    </TouchableOpacity>
  );

  // Modify the retry handler
  const handleRetry = async () => {
    if (isRetrying.current) return;
    isRetrying.current = true;
    
    setError('');
    setLoading(true);
    
    try {
      // Check network state
      const netInfo = await NetInfo.fetch();
      
      if (netInfo.isConnected) {
        // Try to fetch from network
        const categoriesResponse = await fetch(`${API_URL}/api/categories`);
        if (!categoriesResponse.ok) throw new Error('Failed to fetch');
        const categoriesData = await categoriesResponse.json();
        
        const subcategoriesResponse = await fetch(`${API_URL}/api/subcategories`);
        if (!subcategoriesResponse.ok) throw new Error('Failed to fetch');
        const subcategoriesData = await subcategoriesResponse.json();
        
        // Save to cache
        await AsyncStorage.setItem('categories_cache', JSON.stringify(categoriesData));
        await AsyncStorage.setItem('subcategories_cache', JSON.stringify(subcategoriesData));
        
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
        setError('');
      } else {
        // Try to load from cache if offline
        const cachedCategories = await AsyncStorage.getItem('categories_cache');
        const cachedSubcategories = await AsyncStorage.getItem('subcategories_cache');
        
        if (cachedCategories && cachedSubcategories) {
          setCategories(JSON.parse(cachedCategories));
          setSubcategories(JSON.parse(cachedSubcategories));
          setError(''); // Remove offline mode message
        } else {
          setError('No internet connection and no cached data available.');
        }
      }
    } catch (error) {
      console.error('Error during retry:', error);
      
      // Try to load from cache as fallback
      try {
        const cachedCategories = await AsyncStorage.getItem('categories_cache');
        const cachedSubcategories = await AsyncStorage.getItem('subcategories_cache');
        
        if (cachedCategories && cachedSubcategories) {
          setCategories(JSON.parse(cachedCategories));
          setSubcategories(JSON.parse(cachedSubcategories));
          setError('Showing cached data (offline mode). Some features may be limited.');
        } else {
          setError('Failed to load data. Please check your connection and try again.');
        }
      } catch (cacheError) {
        setError('Failed to load data. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
      isRetrying.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search duas..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>{translations['retry'] || 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Categories filter tags */}
          <View style={styles.categoriesContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoryTagsContainer}
            >
              <TouchableOpacity 
                style={[
                  styles.categoryTag, 
                  selectedCategory === 'all' && dynamicStyles.selectedTag
                ]} 
                onPress={() => setSelectedCategory('all')}
              >
                <Ionicons 
                  name="apps-outline" 
                  size={16} 
                  color={selectedCategory === 'all' ? "#FFFFFF" : colors.primary} 
                  style={styles.categoryTagIcon}
                />
                <Text style={[styles.categoryTagText, selectedCategory === 'all' && styles.selectedCategoryTagText]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map(item => renderCategoryItem(item))}
            </ScrollView>
          </View>

          {/* Subcategories Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>
              {selectedCategory === 'all' 
                ? 'All categories' 
                : categories.find(c => c.id === selectedCategory)?.name || ''}
            </Text>
          </View>

          {filteredSubcategories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={50} color="#666" />
              <Text style={styles.emptyText}>No duas found</Text>
            </View>
          ) : (
            <View style={styles.subcategoriesGrid}>
              {filteredSubcategories.map((item) => (
                <View key={item.id} style={styles.subcategoryItemWrapper}>
                  {renderSubcategoryItem({ item })}
                </View>
              ))}
            </View>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryTagsContainer: {
    paddingHorizontal: 16,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedCategoryTag: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryTagIcon: {
    marginRight: 6,
  },
  categoryTagText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  selectedCategoryTagText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  subcategoryItemWrapper: {
    width: '50%',
    padding: 6,
  },
  subcategoryItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 140,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  subcategoryLabel: {
    textAlign: 'center',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#CCCCCC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80,
  },
}); 