import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/constants';

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

export default function DuasScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { translations } = useLanguage();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter duas based on search text and selected category
  const filteredDuas = sampleDuas.filter(dua => {
    const matchesSearch = dua.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          dua.translation.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dua.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Render a dua item
  const renderDuaItem = ({ item }) => (
    <View style={styles.duaCard}>
      <View style={styles.duaHeader}>
        <Text style={styles.duaTitle}>{item.title}</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <Text style={styles.arabicText}>{item.arabic}</Text>
      <Text style={styles.translationText}>{item.translation}</Text>
      <View style={styles.duaFooter}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render a category grid item
  const renderCategoryItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.categoryItem, selectedCategory === item.id && styles.selectedCategoryItem]} 
      activeOpacity={0.7}
      onPress={() => {
        setSelectedCategory(item.id);
        // Navigate to subcategory or filter
      }}
    >
      <View style={[styles.categoryIconCircle, selectedCategory === item.id && styles.selectedCategoryIconCircle]}>
        <Ionicons 
          name={item.icon as any} 
          size={20} 
          color={selectedCategory === item.id ? "#FFFFFF" : "#4CAF50"} 
        />
      </View>
      <Text style={[styles.categoryLabel, selectedCategory === item.id && styles.selectedCategoryLabel]}>
        {translations[`category.${item.id}`] || item.name}
      </Text>
    </TouchableOpacity>
  );

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

      {/* Categories Section */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              // Retry fetching categories
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesContainer}
          >
            <TouchableOpacity 
              style={[styles.categoryItem, selectedCategory === 'All' && styles.selectedCategoryItem]}
              onPress={() => setSelectedCategory('All')}
            >
              <View style={[styles.categoryIconCircle, selectedCategory === 'All' && styles.selectedCategoryIconCircle]}>
                <Ionicons 
                  name="grid-outline" 
                  size={20} 
                  color={selectedCategory === 'All' ? "#FFFFFF" : "#4CAF50"} 
                />
              </View>
              <Text style={[styles.categoryLabel, selectedCategory === 'All' && styles.selectedCategoryLabel]}>
                All
              </Text>
            </TouchableOpacity>
            
            {categories.map(item => renderCategoryItem(item))}
          </ScrollView>
        </View>
      )}

      <View style={styles.divider} />

      {/* Filter by Category (Scrollable buttons) */}
      <Text style={styles.sectionTitle}>Popular Duas</Text>

      {/* Duas List */}
      <FlatList
        data={filteredDuas}
        renderItem={renderDuaItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.duaList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={50} color="#333" />
            <Text style={styles.emptyText}>No duas found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 10,
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
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  selectedCategoryItem: {
    // Styling for selected category
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedCategoryIconCircle: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedCategoryLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  categoriesScrollView: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  duaList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  duaCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  favoriteButton: {
    padding: 4,
  },
  arabicText: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 32,
  },
  translationText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 20,
  },
  duaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#888888',
  },
  shareButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#CCCCCC',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
}); 