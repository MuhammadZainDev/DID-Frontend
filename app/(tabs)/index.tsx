import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, Modal, Animated, Text, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PrayerTimes from '@/components/PrayerTimes';
import Settings from '@/components/Settings';
import UserAvatar from '@/components/UserAvatar';
import CalligraphicDuaBox from '@/components/CalligraphicDuaBox';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '@/config/constants';

// Category type definition
interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { translations } = useLanguage();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalDuas, setTotalDuas] = useState(104);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    // Fetch categories and count total duas
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch(`${API_URL}/api/categories`);
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Fetch subcategories to count duas
        const subcategoriesResponse = await fetch(`${API_URL}/api/subcategories`);
        if (!subcategoriesResponse.ok) {
          throw new Error('Failed to fetch subcategories');
        }
        const subcategoriesData = await subcategoriesResponse.json();
        
        // Set total duas count (using subcategories count as an approximation)
        setTotalDuas(subcategoriesData.length);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (showSettings) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showSettings]);

  const closeSettings = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSettings(false));
  };

  const handleLogout = async () => {
    try {
      // Clear user data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      
      // Update local state
      setUser(null);
      setShowLogoutMenu(false);
      
      // Navigate to login screen
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <SafeAreaView>
            <View style={styles.headerTop}>
              <ThemedText style={styles.title}>{translations['app.name']}</ThemedText>
              <View style={styles.headerIcons}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => router.push('/settings')}
                >
                  <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => {
                    if (user) {
                      setShowLogoutMenu(!showLogoutMenu);
                    } else {
                      // Use replace instead of push for better navigation
                      router.replace('/login');
                    }
                  }}
                >
                  {user ? (
                    <UserAvatar name={user.name} size={32} />
                  ) : (
                    <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                {showLogoutMenu && user && (
                  <View style={styles.logoutMenu}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity 
                      style={styles.logoutButton}
                      onPress={handleLogout}
                    >
                      <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={styles.logoutIcon} />
                      <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#88A398" style={styles.searchIcon} />
              <TextInput 
                placeholder={translations['home.search_placeholder']}
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
            <ImageBackground 
              source={require('../../assets/img/homeBG.jpg')} 
              style={styles.prayerTimeBackground}
              resizeMode="cover"
            >
              <View style={styles.prayerTimeOverlay}>
                <PrayerTimes />
              </View>
            </ImageBackground>
          </View>

          {/* Calligraphic Dua Box */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <ThemedText style={styles.loadingText}>Loading...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={40} color="#FF3B30" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setError('');
                  setLoading(true);
                  // Fetch data again
                  fetch(`${API_URL}/api/categories`)
                    .then(response => {
                      if (!response.ok) throw new Error('Failed to fetch');
                      return response.json();
                    })
                    .then(data => {
                      setCategories(data);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error('Error fetching categories:', err);
                      setError('Failed to load categories. Please try again later.');
                      setLoading(false);
                    });
                }}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <CalligraphicDuaBox 
              totalDuas={totalDuas} 
              onPress={() => router.push('/duas')}
            />
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>

      <Modal
        visible={showSettings}
        transparent={true}
        onRequestClose={closeSettings}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={closeSettings}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>{translations['settings.title']}</ThemedText>
            </View>
            <Settings />
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme background
  },
  header: {
    backgroundColor: '#121212', // Dark theme background
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for dark theme
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    width: 200,
    backgroundColor: '#1E1E1E', // Dark theme popup
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for dark theme
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#CCCCCC', // Light gray text for dark theme
  },
  divider: {
    height: 1,
    backgroundColor: '#333333', // Dark divider for dark theme
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Dark search bar for dark theme
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF', // White text for dark theme
  },
  scrollView: {
    flex: 1,
  },
  prayerCardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  prayerTimeBackground: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  prayerTimeBackgroundImage: {
    borderRadius: 12,
  },
  prayerTimeOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#CCCCCC', // Light gray text for dark theme
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1E1E1E', // Dark button for dark theme
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  viewMoreText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  viewMoreLink: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // Change to 48% for 2 items per row with space between
    marginBottom: 16,
  },
  categoryBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    borderWidth: 1,
    borderColor: '#333333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(26, 127, 75, 0.1)', // Subtle green background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF', // White text for better visibility
    paddingHorizontal: 4,
  },
  bottomPadding: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for dark theme
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    backgroundColor: '#121212', // Dark background for dark theme
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  modalHeader: {
    backgroundColor: '#0E8A3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    backgroundColor: '#333333', // Dark handle for dark theme
    borderRadius: 3,
    marginBottom: 16,
  },
});
