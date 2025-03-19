import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert, Dimensions, Clipboard, Animated, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import ViewShot, { captureRef } from 'react-native-view-shot';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addFavorite, removeFavorite, checkFavorite } from '@/services/favorites';
import { API_URL } from '@/config/constants';

type Dua = {
  id: string;
  subcategory_id: string;
  name: string;
  arabic_text: string;
  reference: string;
  description: string;
  translation: string;
  urdu_translation?: string;
  count?: string;
  audio_path?: string;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  description: string;
};

export default function DuaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { subcategoryId } = useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryDuas, setSubcategoryDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const viewShotRefs = useRef<{[key: string]: any}>({});
  const [isSharing, setIsSharing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let subcategoryData;
        let duasData;
        let fromCache = false;
        
        // First try to load from cache immediately
        try {
          const cachedSubcategory = await AsyncStorage.getItem(`subcategory_${subcategoryId}`);
          const cachedDuas = await AsyncStorage.getItem(`duas_${subcategoryId}`);
          
          if (cachedSubcategory && cachedDuas) {
            subcategoryData = JSON.parse(cachedSubcategory);
            duasData = JSON.parse(cachedDuas);
            
            // Set data immediately from cache
            setSubcategory(subcategoryData);
            setSubcategoryDuas(duasData);
            fromCache = true;
            console.log('Initially loaded dua data from cache');
          }
        } catch (cacheError) {
          console.log('Error loading dua from cache:', cacheError);
        }
        
        // Then try to fetch fresh data from network
        try {
          const netInfo = await NetInfo.fetch();
          if (!netInfo.isConnected) {
            console.log('No internet connection, using cached dua data only');
            if (fromCache) {
              setLoading(false);
              return; // Use cached data and exit
            } else {
              throw new Error('No internet connection and no cached data');
            }
          }
          
          // Try to fetch from network first
          const subcategoryResponse = await fetch(`${API_URL}/api/subcategories/${subcategoryId}`);
          if (!subcategoryResponse.ok) throw new Error('Failed to fetch subcategory');
          subcategoryData = await subcategoryResponse.json();
          
        const duasResponse = await fetch(`${API_URL}/api/duas/subcategory/${subcategoryId}`);
          if (!duasResponse.ok) throw new Error('Failed to fetch duas');
          duasData = await duasResponse.json();
          
          // Cache the data for offline use
          await AsyncStorage.setItem(`subcategory_${subcategoryId}`, JSON.stringify(subcategoryData));
          await AsyncStorage.setItem(`duas_${subcategoryId}`, JSON.stringify(duasData));
          
          // Update with fresh data
          setSubcategory(subcategoryData);
          setSubcategoryDuas(duasData);
          console.log('Updated dua data from network');
        } catch (networkError) {
          console.log('Network error fetching dua:', networkError);
          
          if (!fromCache) {
            // If we haven't loaded from cache yet and network failed, try cache again
            const cachedSubcategory = await AsyncStorage.getItem(`subcategory_${subcategoryId}`);
            const cachedDuas = await AsyncStorage.getItem(`duas_${subcategoryId}`);
            
            if (cachedSubcategory && cachedDuas) {
              subcategoryData = JSON.parse(cachedSubcategory);
              duasData = JSON.parse(cachedDuas);
              setSubcategory(subcategoryData);
              setSubcategoryDuas(duasData);
              fromCache = true;
              console.log('Loaded dua data from cache after network error');
            } else {
              throw new Error('No internet connection and no cached data available for this dua');
            }
          }
        }
        
        setLoading(false);
        
        if (fromCache && !(await NetInfo.fetch()).isConnected) {
          showToastMessage('Showing cached data (offline mode)', 'warning');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please check your internet connection and try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [subcategoryId]);

  console.log('DuaScreen: Rendering with subcategoryId:', subcategoryId);
  
  console.log('Found subcategory:', subcategory?.name || 'Not found');
  
  // Check if the dua is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (subcategoryDuas && subcategoryDuas.length > 0) {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            setFavLoading(true);
            const status = await checkFavorite(subcategoryDuas[0].id);
            setIsFavorite(status);
          }
        } catch (error) {
          console.error('Error checking favorite status:', error);
        } finally {
          setFavLoading(false);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [subcategoryId, subcategoryDuas]);

  // Initialize Audio on component mount
  useEffect(() => {
    async function initAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          allowsRecordingIOS: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    }
    initAudio();
  }, []);

  // Cleanup sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playSound = async (audioSource: number) => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          // Reset position if the audio has finished playing
          if (playbackPosition >= playbackDuration) {
            await sound.setPositionAsync(0);
          }
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          audioSource,
          {
            volume: 1.0,    // Maximum volume (1.0 = 100%)
            rate: 0.85,     // Slightly slower speed (0.85 = 85% of normal speed)
            shouldCorrectPitch: true,  // Keep the pitch normal even when slowing down
            progressUpdateIntervalMillis: 100,  // Update progress more frequently
          }
        );
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis);
            setPlaybackDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(status.durationMillis || 0);
            }
          }
        });

        await newSound.playAsync();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsLoading(false);
      // If there's an error, cleanup the sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Animate toast in
    slideAnim.setValue(50);
    fadeAnim.setValue(0);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Hide toast after appropriate time
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowToast(false);
      });
    }, type === 'error' ? 3000 : 2000); // Longer time for errors
  };

  const handleFavoriteToggle = async () => {
    if (!subcategoryDuas || subcategoryDuas.length === 0) return;
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showToastMessage('Please log in to save favorites', 'warning');
        setTimeout(() => {
          router.push('/login');
    }, 2000);
        return;
      }
      
      const dua = subcategoryDuas[0];
      
      // Convert IDs to numbers
      const duaId = parseInt(dua.id);
      const subcatId = parseInt(subcategoryId as string);
      
      console.log('Favoriting - duaId:', duaId, 'subcategoryId:', subcatId);
      
      setFavLoading(true);
      
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(
          `${API_URL}/api/favorites/${duaId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsFavorite(false);
        
        showToastMessage('Removed from favorites', 'success');
      } else {
        // Add to favorites
        await axios.post(
          `${API_URL}/api/favorites`,
          { duaId, subcategoryId: subcatId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setIsFavorite(true);
        
        showToastMessage('Added to favorites', 'success');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to update favorite status';
      if (axios.isAxiosError(error)) {
        console.log('Error status:', error.response?.status);
        console.log('Error data:', error.response?.data);
        
        if (error.response?.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToastMessage(errorMessage, 'error');
    } finally {
      setFavLoading(false);
    }
  };

  const copyToClipboard = (dua: Dua) => {
    const textToCopy = `${dua.arabic_text}\n\n${dua.translation}\n\n${dua.urdu_translation ? dua.urdu_translation + '\n\n' : ''}Reference: ${dua.reference}`;
    
    Clipboard.setString(textToCopy);
    
    showToastMessage("Dua copied to clipboard", "success");
  };

  const handleShare = async (dua: Dua, index: number) => {
    try {
      // Set sharing mode to hide UI elements
      setIsSharing(true);
      
      // Small delay to ensure state update has been rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the dua card as an image
      if (viewShotRefs.current[dua.id]) {
        const uri = await captureRef(viewShotRefs.current[dua.id], {
          format: "jpg",
          quality: 0.9,
          result: "data-uri"
        });
        
        // Turn off sharing mode to restore UI
        setIsSharing(false);
        
        if (uri) {
          // Share the captured image
          const result = await Share.share({
            title: dua.name,
            message: `${dua.name} - Shared from Duaon AI`,
            url: uri,
          });
          
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              console.log('Shared with activity type:', result.activityType);
            } else {
              console.log('Shared successfully');
            }
          } else if (result.action === Share.dismissedAction) {
            console.log('Share dismissed');
          }
        }
      }
    } catch (error) {
      // Ensure UI is restored even if an error occurs
      setIsSharing(false);
      console.error('Error sharing dua:', error);
    }
  };

  const renderActionButtons = (dua: any, index: number) => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { marginRight: 16 }]}
          onPress={() => copyToClipboard(dua)}
        >
          <Ionicons name="copy-outline" size={20} color="#E0E0E0" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { marginRight: 16 }]}
          onPress={() => handleShare(dua, index)}
        >
          <Ionicons name="share-social-outline" size={20} color="#E0E0E0" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleFavoriteToggle}
          disabled={favLoading}
        >
          {favLoading ? (
            <ActivityIndicator size="small" color="#E0E0E0" />
          ) : (
            <Ionicons 
              name={isFavorite ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color="#E0E0E0" 
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          <Text style={styles.headerTitle}>{subcategory?.name || 'Duas'}</Text>
          <View style={{width: 70}} />
          </View>
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading duas...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={async () => {
              setLoading(true);
              setError('');
              
              try {
                // Try to fetch from network
                const subcategoryResponse = await fetch(`${API_URL}/api/subcategories/${subcategoryId}`);
                if (!subcategoryResponse.ok) throw new Error('Network request failed');
                const subcategoryData = await subcategoryResponse.json();
                
                const duasResponse = await fetch(`${API_URL}/api/duas/subcategory/${subcategoryId}`);
                if (!duasResponse.ok) throw new Error('Network request failed');
                const duasData = await duasResponse.json();
                
                // Cache the new data
                await AsyncStorage.setItem(`subcategory_${subcategoryId}`, JSON.stringify(subcategoryData));
                await AsyncStorage.setItem(`duas_${subcategoryId}`, JSON.stringify(duasData));
                
                setSubcategory(subcategoryData);
                setSubcategoryDuas(duasData);
                  setLoading(false);
              } catch (networkError) {
                console.log('Network error in retry, trying cache:', networkError);
                
                // Try to load from cache
                try {
                  const cachedSubcategory = await AsyncStorage.getItem(`subcategory_${subcategoryId}`);
                  const cachedDuas = await AsyncStorage.getItem(`duas_${subcategoryId}`);
                  
                  if (cachedSubcategory && cachedDuas) {
                    setSubcategory(JSON.parse(cachedSubcategory));
                    setSubcategoryDuas(JSON.parse(cachedDuas));
                    showToastMessage('Showing cached data (offline mode)', 'warning');
                  } else {
                    setError('No internet connection and no cached data available.');
                  }
                } catch (cacheError) {
                  setError('Failed to load data. Please check your connection and try again.');
                }
                
                  setLoading(false);
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Content - Only show when not loading */
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {subcategoryDuas.map((dua, index) => (
            <View 
              key={dua.id} 
              ref={(ref) => { viewShotRefs.current[dua.id] = ref; }}
              style={[
                styles.duaCardContainer,
                isSharing && { borderRadius: 0 }
              ]}
            >
              <LinearGradient
                colors={['#202020', '#141414']}
                style={[styles.duaCard, isSharing && { borderRadius: 0 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.duaHeader}>
                  <ThemedText style={styles.duaTitle}>{dua.name}</ThemedText>
                </View>
                
                <View style={styles.arabicContainer}>
                  <ThemedText style={styles.arabicText}>{dua.arabic_text}</ThemedText>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.translationContainer}>
                  <ThemedText style={styles.translationText}>{dua.translation}</ThemedText>
                  {dua.urdu_translation && (
                    <>
                      <View style={styles.translationDivider} />
                      <ThemedText style={[styles.translationText, styles.urduText]}>
                        {dua.urdu_translation}
                      </ThemedText>
                    </>
                  )}
                </View>
                
                <View style={styles.referenceContainer}>
                  <ThemedText style={styles.referenceText}>Reference: {dua.reference}</ThemedText>
                </View>
                
                {dua.count && (
                  <View style={styles.countContainer}>
                    <ThemedText style={styles.countText}>Recite: {dua.count}</ThemedText>
                  </View>
                )}
                
                {/* Action buttons - hide when sharing */}
                {!isSharing && renderActionButtons(dua, index)}
              </LinearGradient>
            </View>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
      
      {showToast && (
        <Animated.View 
          style={[
            styles.toast, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: toastType === 'success' ? '#4CAF50' : 
                               toastType === 'error' ? '#FF3B30' : 
                               toastType === 'warning' ? '#FF9500' : 
                               colors.primary
            }
          ]}
        >
          <Ionicons 
            name={
              toastType === 'success' ? "checkmark-circle" : 
              toastType === 'error' ? "alert-circle" :
              toastType === 'warning' ? "warning" : 
              "information-circle"
            } 
            size={20} 
            color="white" 
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
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
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  duaCardContainer: {
    marginBottom: 24,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  duaCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  duaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginVertical: 8,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  arabicText: {
    fontSize: 28,
    lineHeight: 46,
    textAlign: 'center',
    color: '#E0E0E0',
    fontFamily: 'NotoKufi-Arabic',
    writingDirection: 'rtl',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  translationContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#EEEEEE',
  },
  referenceContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  referenceText: {
    fontSize: 14,
    color: 'rgba(200, 200, 200, 0.6)',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingRight: 8,
  },
  actionButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 40,
  },
  countContainer: {
    marginTop: 16,
    marginHorizontal: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  translationDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  urduText: {
    fontFamily: 'Jameel-Noori-Nastaleeq',
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: '#EEEEEE',
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
}); 