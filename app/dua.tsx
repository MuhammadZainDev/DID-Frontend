import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  reference: string;
  description: string;
  arabic_text?: string;
};

export default function DuaScreen() {
  const router = useRouter();
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

  const renderActionButtons = (dua: any, index: number) => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="copy-outline" size={20} color="#0E8A3E" />
          <ThemedText style={styles.actionButtonText}>Copy</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#0E8A3E" />
          <ThemedText style={styles.actionButtonText}>Share</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleFavoriteToggle}
          disabled={favLoading}
        >
          {favLoading ? (
            <ActivityIndicator color="#0E8A3E" size="small" />
          ) : (
            <>
              <Ionicons 
                name={isFavorite ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color="#0E8A3E" 
              />
              <ThemedText style={styles.actionButtonText}>
                {isFavorite ? "Saved" : "Save"}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
        {index === 0 && dua.audio_path && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => playSound(require('../assets/audio/morning_dua.m4a'))}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0E8A3E" size="small" />
            ) : (
              <>
                <Ionicons 
                  name={isPlaying ? "pause-outline" : "play-outline"} 
                  size={20} 
                  color="#0E8A3E" 
                />
                <ThemedText style={styles.actionButtonText}>
                  {isPlaying ? "Pause" : "Play"}
                  {playbackDuration > 0 && ` (${formatTime(playbackPosition)})`}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
            <ThemedText style={styles.title}>{subcategory?.name || 'Duas'}</ThemedText>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {subcategoryDuas.map((dua, index) => (
          <View key={dua.id} style={styles.duaCard}>
            <View style={styles.duaHeader}>
              <ThemedText style={styles.duaTitle}>{dua.name}</ThemedText>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons name="bookmark-outline" size={20} color="#0E8A3E" />
              </TouchableOpacity>
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
            
            {renderActionButtons(dua, index)}
          </View>
        ))}
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
  duaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0E8A3E',
  },
  bookmarkButton: {
    padding: 4,
  },
  arabicContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 4,
    width: '100%',
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 42,
    textAlign: 'center',
    color: '#2C3E50',
    fontFamily: 'NotoKufi-Arabic',
    writingDirection: 'rtl',
    paddingHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8F5ED',
    marginVertical: 12,
  },
  translationContainer: {
    paddingVertical: 8,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
  },
  referenceContainer: {
    marginTop: 8,
  },
  referenceText: {
    fontSize: 14,
    color: '#88A398',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5ED',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#0E8A3E',
  },
  bottomPadding: {
    height: 20,
  },
  countContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5ED',
    borderRadius: 4,
  },
  countText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  translationDivider: {
    height: 1,
    backgroundColor: '#E8F5ED',
    marginVertical: 8,
  },
  urduText: {
    fontFamily: 'Jameel-Noori-Nastaleeq',
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: '#2C3E50',
  },
}); 