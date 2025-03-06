import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import categoriesData from '@/constants/categories.json';
import subcategoriesData from '@/constants/subcategories.json';

export default function SubcategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams();
  
  // Find the category details
  const category = categoriesData.categories.find(cat => cat.id === categoryId);
  
  // Filter subcategories by category
  const categorySubcategories = subcategoriesData.subcategories.filter(
    subcat => subcat.category_id === categoryId
  );

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
              <Ionicons name={category?.icon || 'layers'} size={24} color="white" />
            </View>
            <View style={styles.categoryDetails}>
              <ThemedText style={styles.categoryCount}>
                {categorySubcategories.length} Subcategories
              </ThemedText>
              <ThemedText style={styles.categoryDescription}>
                Collection of duas for {category?.name.toLowerCase()}
              </ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categorySubcategories.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.listItem} 
            activeOpacity={0.7}
            onPress={() => router.push({
              pathname: '/dua',
              params: { subcategoryId: item.id }
            })}
          >
            <View style={styles.itemContent}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="star" size={18} color="white" />
                </View>
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.itemText}>{item.name}</ThemedText>
                <ThemedText style={styles.itemDescription}>
                  Essential duas for {item.name.toLowerCase()}
                </ThemedText>
              </View>
              <View style={styles.rightContainer}>
                <Ionicons name="chevron-forward" size={20} color="#88A398" />
              </View>
            </View>
            <View style={styles.referenceContainer}>
              <View style={styles.referenceIcon}>
                <Ionicons name="book-outline" size={14} color="#88A398" />
              </View>
              <ThemedText style={styles.referenceText}>
                References: Bukhari, Muslim, Abu Dawud
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0E8A3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#88A398',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5ED',
    paddingTop: 12,
  },
  referenceIcon: {
    marginRight: 8,
  },
  referenceText: {
    fontSize: 12,
    color: '#88A398',
    fontStyle: 'italic',
  },
}); 