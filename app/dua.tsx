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
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const viewShotRefs = useRef<{[key: string]: any}>({});
  const [isSharing, setIsSharing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subcategory details
        const subcategoryResponse = await fetch(`${API_URL}/api/subcategories/${subcategoryId}`);
        if (!subcategoryResponse.ok) {
          throw new Error('Failed to fetch subcategory');
        }
        const subcategoryData = await subcategoryResponse.json();
        
        // Fetch duas for this subcategory
        const duasResponse = await fetch(`${API_URL}/api/duas/subcategory/${subcategoryId}`);
        if (!duasResponse.ok) {
          throw new Error('Failed to fetch duas');
        }
        const duasData = await duasResponse.json();
        
        setSubcategory(subcategoryData);
        setSubcategoryDuas(duasData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
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

  const handleFavoriteToggle = async () => {
    if (!subcategoryDuas || subcategoryDuas.length === 0) return;
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(
          'Login Required',
          'You need to login to save favorites',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/login') }
          ]
        );
        return;
      }
      
      const dua = subcategoryDuas[0];
      console.log('Dua being favorited:', dua);
      console.log('SubcategoryId:', subcategoryId);
      
      setFavLoading(true);
      
      if (isFavorite) {
        const result = await removeFavorite(dua.id);
        console.log('Removed favorite result:', result);
        setIsFavorite(false);
      } else {
        // Ensure that subcategoryId is the correct string format
        const subcatId = String(subcategoryId);
        console.log('Adding favorite with duaId:', dua.id, 'subcategoryId:', subcatId);
        
        const result = await addFavorite(dua.id, subcatId);
        console.log('Added favorite result:', result);
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to update favorite status';
      if (error.response) {
        // Server responded with a status code that's not in range 200-299
        console.log('Error data:', error.response.data);
        console.log('Error status:', error.response.status);
        
        if (error.response.data?.error || error.response.data?.message) {
          errorMessage = error.response.data.error || error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setFavLoading(false);
    }
  };

  const copyToClipboard = (dua: Dua) => {
    const textToCopy = `${dua.arabic_text}\n\n${dua.translation}\n\n${dua.urdu_translation ? dua.urdu_translation + '\n\n' : ''}Reference: ${dua.reference}`;
    
    Clipboard.setString(textToCopy);
    
    // Show custom toast instead of Alert
    setToastMessage("Dua copied to clipboard");
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
    
    // Hide toast after 2 seconds
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
    }, 2000);
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
          style={styles.actionButton}
          onPress={() => handleShare(dua, index)}
        >
          <Ionicons name="share-social-outline" size={20} color="#E0E0E0" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>{subcategory?.name || 'Duas'}</ThemedText>
            <View style={styles.iconButton} />
          </View>
        </SafeAreaView>
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
            onPress={() => {
              setLoading(true);
              setError('');
              // Re-fetch data
              fetch(`${API_URL}/api/subcategories/${subcategoryId}`)
                .then(res => res.json())
                .then(data => {
                  setSubcategory(data);
                  return fetch(`${API_URL}/api/duas/subcategory/${subcategoryId}`);
                })
                .then(res => res.json())
                .then(data => {
                  setSubcategoryDuas(data);
                  setLoading(false);
                })
                .catch(err => {
                  console.error(err);
                  setError('Failed to load data. Please try again.');
                  setLoading(false);
                });
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
                {/* Bookmark Button - hide when sharing */}
                {!isSharing && (
                  <TouchableOpacity 
                    style={[styles.bookmarkButton, { backgroundColor: `${colors.primary}20` }]}
                    onPress={handleFavoriteToggle}
                  >
                    <Ionicons 
                      name={isFavorite ? "bookmark" : "bookmark-outline"} 
                      size={22} 
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}

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
              backgroundColor: colors.primary
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
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