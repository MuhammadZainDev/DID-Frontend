import React, { useState, useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLanguage } from '../../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';

export default function PrayerTimesScreen() {
  const { prayerTimes, loading, error, nextPrayer, currentPrayer, refreshPrayerTimes } = usePrayerTimes();
  const [location, setLocation] = useState('Loading location...');
  const { translations } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
    async function getLocationName() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocation('Location permission not granted');
          return;
        }
        
        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;
        
        // Get location name from coordinates
        const geoCodeResult = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });
        
        if (geoCodeResult && geoCodeResult.length > 0) {
          const { city, country } = geoCodeResult[0];
          setLocation(`${city || ''}, ${country || ''}`);
        } else {
          setLocation('Unknown location');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocation('Error getting location');
      }
    }
    
    getLocationName();
  }, []);

  // Helper function to convert prayer time string to Date object
  const getPrayerTimeAsDate = (timeStr: string): Date => {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':');
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshPrayerTimes}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!prayerTimes || !nextPrayer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Format the date
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = date.toLocaleDateString('en-US', options);
  
  // Get Hijri date from the API response
  const hijriDate = `${prayerTimes.date.hijri.day} ${prayerTimes.date.hijri.month.en} ${prayerTimes.date.hijri.year}`;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Location Banner with Background GIF */}
        <View style={styles.locationBanner}>
          <ImageBackground 
            source={require('@/assets/namazTime/prayerBG.gif')} 
            style={styles.bannerBackground}
          >
            <View style={styles.bannerOverlay}>
            <View style={styles.bannerContent}>
              <Text style={styles.locationText}>{location}</Text>
              <View style={styles.nextPrayerInfo}>
             
                <Text style={styles.nextPrayerName}>
                  {translations[`prayer.${currentPrayer?.toLowerCase()}`] || currentPrayer}
                </Text>
                <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
                <Text style={styles.remainingTime}>
                  {translations['prayer.in']} {nextPrayer.remaining}
                </Text>
              </View>
            </View>
            </View>
          </ImageBackground>
        </View>

        {/* Date Display */}
        <View style={styles.dateContainer}>
          <Text style={styles.gregorianDate}>{formattedDate}</Text>
          <Text style={[styles.dateText, { color: colors.primary }]}>
            {hijriDate}
          </Text>
        </View>

        {/* Prayer Times List */}
        <View style={styles.prayerTimesContainer}>
          <PrayerTimeItem 
            name={translations['prayer.fajr']} 
            time={prayerTimes.timings.Fajr} 
            icon="sunny-outline" 
            isActive={nextPrayer.name === 'Fajr'}
            isCurrent={currentPrayer === 'Fajr'}
          />
          <PrayerTimeItem 
            name={translations['prayer.dhuhr']} 
            time={prayerTimes.timings.Dhuhr} 
            icon="sunny-outline" 
            isActive={nextPrayer.name === 'Dhuhr'}
            isCurrent={currentPrayer === 'Dhuhr'}
          />
          <PrayerTimeItem 
            name={translations['prayer.asr']} 
            time={prayerTimes.timings.Asr} 
            icon="partly-sunny-outline" 
            isActive={nextPrayer.name === 'Asr'}
            isCurrent={currentPrayer === 'Asr'}
          />
          <PrayerTimeItem 
            name={translations['prayer.maghrib']} 
            time={prayerTimes.timings.Maghrib} 
            icon="moon-outline" 
            isActive={nextPrayer.name === 'Maghrib'}
            isCurrent={currentPrayer === 'Maghrib'}
          />
          <PrayerTimeItem 
            name={translations['prayer.isha']} 
            time={prayerTimes.timings.Isha} 
            icon="moon-outline" 
            isActive={nextPrayer.name === 'Isha'}
            isCurrent={currentPrayer === 'Isha'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function PrayerTimeItem({ 
  name, 
  time, 
  icon, 
  isActive,
  isCurrent
}: { 
  name: string; 
  time: string; 
  icon: string; 
  isActive: boolean;
  isCurrent: boolean;
}) {
  const { colors } = useTheme();
  // Format time to 12-hour format
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get the correct background image based on prayer name
  const getBackgroundImage = () => {
    const prayerName = name.toLowerCase();
    
    // Map prayer names to their image file names
    if (prayerName.includes('fajr')) return require('@/assets/namazTime/fajr.jpg');
    if (prayerName.includes('dhuhr')) return require('@/assets/namazTime/dhuhr.jpg');
    if (prayerName.includes('asr')) return require('@/assets/namazTime/asr.jpg');
    if (prayerName.includes('maghrib')) return require('@/assets/namazTime/maghrib.jpg');
    if (prayerName.includes('isha')) return require('@/assets/namazTime/isha.jpg');
    
    // Default return for any other prayer
    return null;
  };

  const backgroundImage = getBackgroundImage();

  return (
    <View style={[
      styles.prayerTimeItem, 
      isActive && [styles.activePrayerItem]
    ]}>
      {backgroundImage ? (
        <Image source={backgroundImage} style={styles.prayerBackgroundImage} />
      ) : null}
      <View style={styles.prayerItemOverlay}>
        <View style={styles.prayerNameContainer}>
          <Ionicons name={icon as any} size={20} color="#FFFFFF" />
          <Text style={[styles.prayerName, { color: '#FFFFFF' }]}>{name}</Text>
          {isCurrent && (
            <View style={styles.currentPrayerBadge}>
              <Text style={styles.currentPrayerBadgeText}>Current</Text>
            </View>
          )}
        </View>
        <View style={styles.prayerTimeRight}>
          <Text style={[styles.prayerTime, { color: '#FFFFFF' }]}>{formatTime(time)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background for loading screen
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background for error screen
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0E8A3E',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  locationBanner: {
    height: 200,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bannerBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent overlay to ensure text readability
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  currentPrayerInfo: {
    alignItems: 'flex-start',
  },
  currentPrayerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  prayerDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 10,
  },
  nextPrayerInfo: {
    alignItems: 'flex-start',
  },
  nextPrayerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  nextPrayerTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  remainingTime: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  dateContainer: {
    padding: 16,
    backgroundColor: '#1E1E1E', // Dark background for date section
    marginVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gregorianDate: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50', // Brighter green color for better visibility
  },
  prayerTimesContainer: {
    padding: 16,
  },
  prayerTimeItem: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    height: 80,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  activePrayerItem: {
    borderLeftWidth: 3,
  },
  prayerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  prayerItemOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  prayerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prayerName: {
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  prayerTimeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prayerTime: {
    fontSize: 20,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  currentPrayerBadge: {
    backgroundColor: '#0E8A3E',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentPrayerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  currentPrayerItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#0E8A3E',
  },
}); 