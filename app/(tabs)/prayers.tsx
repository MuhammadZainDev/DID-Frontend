import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useLanguage } from '../../context/LanguageContext';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerTimesScreen() {
  const { prayerTimes, loading, error, nextPrayer, refreshPrayerTimes } = usePrayerTimes();
  const [location, setLocation] = useState('Loading location...');
  const [notificationsScheduled, setNotificationsScheduled] = useState(false);
  const { translations } = useLanguage();

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

  // Request notification permissions
  useEffect(() => {
    async function requestNotificationPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow notifications to receive prayer time alerts',
          [{ text: 'OK' }]
        );
      }
    }
    
    requestNotificationPermissions();
  }, []);

  // Schedule prayer time notifications
  useEffect(() => {
    async function schedulePrayerNotifications() {
      if (!prayerTimes || notificationsScheduled) return;
      
      try {
        // Cancel any existing notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        const prayers = [
          { name: translations['prayer.fajr'], time: prayerTimes.timings.Fajr },
          { name: translations['prayer.sunrise'], time: prayerTimes.timings.Sunrise },
          { name: translations['prayer.dhuhr'], time: prayerTimes.timings.Dhuhr },
          { name: translations['prayer.asr'], time: prayerTimes.timings.Asr },
          { name: translations['prayer.maghrib'], time: prayerTimes.timings.Maghrib },
          { name: translations['prayer.isha'], time: prayerTimes.timings.Isha }
        ];
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Schedule notifications for each prayer time
        for (let i = 0; i < prayers.length; i++) {
          const prayer = prayers[i];
          
          // Skip Sunrise as it's not a prayer time
          if (prayer.name === translations['prayer.sunrise']) continue;
          
          // Convert prayer time to Date object
          const prayerDate = getPrayerTimeAsDate(prayer.time);
          
          // Calculate 15 minutes before prayer time
          const fifteenMinutesBefore = new Date(prayerDate);
          fifteenMinutesBefore.setMinutes(fifteenMinutesBefore.getMinutes() - 15);
          
          // Only schedule if the time is in the future
          if (fifteenMinutesBefore > now) {
            // Schedule 15 minutes before notification
            await scheduleNotification(
              `${prayer.name} ${translations['prayer.time']}`,
              `15 ${translations['prayer.remaining']} ${prayer.name} ${translations['prayer.time']}`,
              fifteenMinutesBefore
            );
            console.log(`Scheduled 15-min reminder for ${prayer.name} at ${fifteenMinutesBefore.toLocaleTimeString()}`);
          }
          
          // Schedule prayer time start notification
          if (prayerDate > now) {
            await scheduleNotification(
              `${prayer.name} ${translations['prayer.time']}`,
              `${translations['prayer.time']} ${prayer.name}`,
              prayerDate
            );
            console.log(`Scheduled start time notification for ${prayer.name} at ${prayerDate.toLocaleTimeString()}`);
          }
        }
        
        setNotificationsScheduled(true);
        console.log('Prayer notifications scheduled successfully');
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    }
    
    schedulePrayerNotifications();
  }, [prayerTimes, notificationsScheduled, translations]);

  // Helper function to convert prayer time string to Date object
  const getPrayerTimeAsDate = (timeStr: string): Date => {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':');
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
  };

  // Helper function to schedule a notification
  const scheduleNotification = async (title: string, body: string, scheduledTime: Date): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: scheduledTime,
        channelId: 'prayer-times',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0E8A3E" />
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
        <ActivityIndicator size="large" color="#0E8A3E" />
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
                    {translations[`prayer.${nextPrayer.name.toLowerCase()}`] || nextPrayer.name}
                  </Text>
                  <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
                  <Text style={styles.remainingTime}>{nextPrayer.remaining}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Date Display */}
        <View style={styles.dateContainer}>
          <Text style={styles.gregorianDate}>{formattedDate}</Text>
          <Text style={styles.hijriDate}>{hijriDate}</Text>
        </View>

        {/* Prayer Times List */}
        <View style={styles.prayerTimesContainer}>
          <PrayerTimeItem 
            name={translations['prayer.fajr']} 
            time={prayerTimes.timings.Fajr} 
            icon="sunny-outline" 
            isActive={nextPrayer.name === 'Fajr'}
          />
          <PrayerTimeItem 
            name={translations['prayer.dhuhr']} 
            time={prayerTimes.timings.Dhuhr} 
            icon="sunny-outline" 
            isActive={nextPrayer.name === 'Dhuhr'}
          />
          <PrayerTimeItem 
            name={translations['prayer.asr']} 
            time={prayerTimes.timings.Asr} 
            icon="sunny-outline" 
            isActive={nextPrayer.name === 'Asr'}
          />
          <PrayerTimeItem 
            name={translations['prayer.maghrib']} 
            time={prayerTimes.timings.Maghrib} 
            icon="moon-outline" 
            isActive={nextPrayer.name === 'Maghrib'}
          />
          <PrayerTimeItem 
            name={translations['prayer.isha']} 
            time={prayerTimes.timings.Isha} 
            icon="moon-outline" 
            isActive={nextPrayer.name === 'Isha'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function PrayerTimeItem({ name, time, icon, isActive }: { name: string; time: string; icon: string; isActive: boolean }) {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  
  // Format time to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const toggleNotification = () => {
    setNotificationEnabled(prev => !prev);
    // Here you would add code to actually schedule or cancel notifications
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
    <View style={[styles.prayerTimeItem, isActive && styles.activePrayerItem]}>
      {backgroundImage ? (
        <Image source={backgroundImage} style={styles.prayerBackgroundImage} />
      ) : null}
      <View style={styles.prayerItemOverlay}>
        <View style={styles.prayerNameContainer}>
          <Ionicons name={icon as any} size={20} color="#FFFFFF" />
          <Text style={[styles.prayerName, { color: '#FFFFFF' }]}>{name}</Text>
        </View>
        <View style={styles.prayerTimeRight}>
          <Text style={[styles.prayerTime, { color: '#FFFFFF' }]}>{formatTime(time)}</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={toggleNotification}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={notificationEnabled ? "notifications" : "notifications-off-outline"} 
              size={26} 
              color={notificationEnabled ? "#FFFFFF" : "#DDDDDD"} 
            />
          </TouchableOpacity>
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
  nextPrayerInfo: {
    alignItems: 'flex-start',
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
  hijriDate: {
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
    borderLeftColor: '#0E8A3E',
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  notificationButton: {
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
  },
}); 