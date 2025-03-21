import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, Modal, Animated, Text, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import NetInfo from '@react-native-community/netinfo';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PrayerTimes from '@/components/PrayerTimes';
import Settings from '@/components/Settings';
import UserAvatar from '@/components/UserAvatar';
import CalligraphicDuaBox from '@/components/CalligraphicDuaBox';
import NamazGuideBox from '@/components/NamazGuideBox';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '@/config/constants';
import { searchDuaWithAI, DuaResponse } from '@/services/geminiService';
import DuaModal from '@/components/DuaModal';
import LoadingView from '@/components/LoadingView';

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
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { translations } = useLanguage();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalDuas, setTotalDuas] = useState(104);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [duaResult, setDuaResult] = useState<DuaResponse | null>(null);

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
        setError(null);
        
        let categoriesData = [];
        let subcategoriesData = [];
        let fromCache = false;
        
        // Try to load from cache first
        const cachedCategories = await AsyncStorage.getItem('categories_cache');
        const cachedSubcategories = await AsyncStorage.getItem('subcategories_cache');
        
        if (cachedCategories && cachedSubcategories) {
          categoriesData = JSON.parse(cachedCategories);
          subcategoriesData = JSON.parse(cachedSubcategories);
          setCategories(categoriesData);
          setTotalDuas(subcategoriesData.length);
          fromCache = true;
          console.log('Loaded categories from cache on home screen');
        }
        
        // Check network state
        const netInfo = await NetInfo.fetch();
        
        // If online, try to fetch fresh data in the background
        if (netInfo.isConnected) {
          try {
            const categoriesResponse = await fetch(`${API_URL}/api/categories`);
            if (categoriesResponse.ok) {
              categoriesData = await categoriesResponse.json();
              
              const subcategoriesResponse = await fetch(`${API_URL}/api/subcategories`);
              if (subcategoriesResponse.ok) {
                subcategoriesData = await subcategoriesResponse.json();
                
                // Cache the fresh data
                await AsyncStorage.setItem('categories_cache', JSON.stringify(categoriesData));
                await AsyncStorage.setItem('subcategories_cache', JSON.stringify(subcategoriesData));
                
                // Only update UI if we didn't already set from cache
                if (!fromCache) {
                  setCategories(categoriesData);
                  setTotalDuas(subcategoriesData.length);
                }
                
                console.log('Successfully fetched fresh data from network on home screen');
              }
            }
          } catch (networkError) {
            console.log('Network error (silent):', networkError);
            // Don't set error state if we already have cached data
            if (!fromCache) {
              console.log('No cached data available and network failed on home screen');
              setError('Could not connect to server. Check your internet connection and try again.');
            }
          }
        } else if (!fromCache) {
          // If we're offline and have no cache, show a message
          setError('No internet connection and no cached data available. Please connect to the internet and try again.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
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

  useEffect(() => {
    // Animation for the search bar glow effect
    const startGlowAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    
    startGlowAnimation();
  }, []);

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

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsAISearching(true);
      const data = await searchDuaWithAI(searchQuery);
      setDuaResult(data);
      setShowDuaModal(true);
      setSearchQuery(''); // Clear the search input
    } catch (error) {
      console.error('Search error:', error);
      // You could show an error toast here
    } finally {
      setIsAISearching(false);
    }
  };

  // Gemini logo SVG
  const geminiLogoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em">
      <title>Gemini</title>
      <defs>
        <linearGradient id="lobe-icons-gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
          <stop offset="0%" stop-color="#1C7DFF"/>
          <stop offset="52.021%" stop-color="#1C69FF"/>
          <stop offset="100%" stop-color="#F0DCD6"/>
        </linearGradient>
      </defs>
      <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#lobe-icons-gemini-fill)" fill-rule="nonzero"/>
    </svg>
  `;
  
  // Shadow interpolation for the glow effect
  const glowShadow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0px 0px 5px rgba(28, 125, 255, 0.3)', '0px 0px 10px rgba(28, 125, 255, 0.7)']
  });

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <SafeAreaView style={styles.safeArea}>
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
              </View>
            </View>
            <Animated.View 
              style={[
                styles.searchBar,
                {
                  shadowColor: '#1C7DFF',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, 8]
                  }),
                  elevation: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 6]
                  }),
                }
              ]}
            >
              <Ionicons name="search-outline" size={20} color="#88A398" style={styles.searchIcon} />
              <TextInput 
                placeholder={translations['home.search_placeholder'] || 'Search dua by AI'}
                placeholderTextColor="#88A398"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity 
                  onPress={handleSearchSubmit}
                  style={styles.sendButton}
                >
                  <Ionicons name="send" size={20} color="#4CAF50" />
                </TouchableOpacity>
              ) : (
                <View style={styles.geminiLogo}>
                  <SvgXml xml={geminiLogoSvg} width={24} height={24} />
                </View>
              )}
            </Animated.View>
          </SafeAreaView>
        </View>

        {showLogoutMenu && user && (
          <View style={styles.logoutMenuContainer}>
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
          </View>
        )}

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
            <>
              <CalligraphicDuaBox 
                totalDuas={totalDuas} 
                onPress={() => router.push('/duas')}
              />
              
              {/* Namaz Guide Box */}
              <NamazGuideBox 
                onPress={() => router.push('/namaz-guide')}
              />
            </>
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

      <LoadingView 
        visible={isAISearching}
      />
      
      {isSearching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}
      
      <DuaModal
        visible={showDuaModal}
        dua={duaResult}
        onClose={() => setShowDuaModal(false)}
      />
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
  safeArea: {
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  logoContainer: {
    width: 100,
    height: 40,
    marginRight: 16,
  },
  headerLogo: {
    width: '100%',
    height: '100%',
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
  logoutMenuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    right: 16,
    zIndex: 9999,
  },
  logoutMenu: {
    width: 200,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    borderWidth: 1,
    borderColor: '#2A2A2A',
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
  sendButton: {
    padding: 8,
    marginLeft: 4,
  },
  geminiLogo: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
