import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PrayerTimes from '@/components/PrayerTimes';
import categoriesData from '@/constants/categories.json';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <ThemedText style={styles.title}>Duas & Adhkar</ThemedText>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="person-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#88A398" style={styles.searchIcon} />
            <TextInput 
              placeholder="Search for duas..."
              placeholderTextColor="#88A398"
              style={styles.searchInput}
            />
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Prayer Times Section */}
        <View style={styles.prayerCardContainer}>
          <PrayerTimes />
        </View>

        {/* Categories Grid */}
        <View style={styles.grid}>
          {categoriesData.categories.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem} 
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/subcategory',
                params: { categoryId: item.id }
              })}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={24} color="#0E8A3E" />
              </View>
              <ThemedText style={styles.gridLabel}>{item.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bottomPadding} />
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
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
  },
  scrollView: {
    flex: 1,
  },
  prayerCardContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: 'white',
    marginHorizontal: '1.16%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 90,
  },
});
