import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
        {/* Next Prayer Section */}
        <View style={styles.prayerCard}>
          <View style={styles.prayerInfo}>
            <View style={styles.dateInfo}>
              <ThemedText style={styles.islamicDate}>15 Ramadan, 1445</ThemedText>
              <ThemedText style={styles.gregorianDate}>25 March 2024</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.prayerDetails}>
              <View>
                <ThemedText style={styles.prayerLabel}>Next Prayer</ThemedText>
                <ThemedText style={styles.prayerName}>Fajr</ThemedText>
              </View>
              <View style={styles.timeInfo}>
                <ThemedText style={styles.prayerTime}>05:53</ThemedText>
                <ThemedText style={styles.timeRemaining}>04:23:24 remaining</ThemedText>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="sunny-outline" size={16} color="#88A398" />
                <ThemedText style={styles.infoText}>Sunrise: 06:45</ThemedText>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="moon-outline" size={16} color="#88A398" />
                <ThemedText style={styles.infoText}>Maghrib: 18:30</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.grid}>
          {categoriesData.categories.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem} 
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/dua',
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
  prayerCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
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
  prayerInfo: {
    padding: 16,
  },
  dateInfo: {
    marginBottom: 12,
  },
  islamicDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E8A3E',
    marginBottom: 2,
  },
  gregorianDate: {
    fontSize: 13,
    color: '#88A398',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8F5ED',
    marginVertical: 12,
  },
  prayerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  prayerLabel: {
    fontSize: 13,
    color: '#88A398',
    marginBottom: 4,
  },
  prayerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0E8A3E',
    lineHeight: 28,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0E8A3E',
    lineHeight: 28,
  },
  timeRemaining: {
    fontSize: 13,
    color: '#88A398',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8F5ED',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: '#0E8A3E',
    borderRadius: 2,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#88A398',
    marginLeft: 6,
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
