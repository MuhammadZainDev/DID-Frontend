import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert } from 'react-native';
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
        {/* Location Banner with Mosque Image */}
        <View style={styles.locationBanner}>
          <View style={styles.mosqueImagePlaceholder}>
            <Ionicons name="business-outline" size={80} color="white" style={styles.mosqueIcon} />
          </View>
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          >
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
          </LinearGradient>
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
            name={translations['prayer.sunrise']} 
            time={prayerTimes.timings.Sunrise} 
            icon="sunny-outline" 
            isActive={false}
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
            icon="partly-sunny-outline" 
            isActive={nextPrayer.name === 'Maghrib'}
          />
          <PrayerTimeItem 
            name={translations['prayer.isha']} 
            time={prayerTimes.timings.Isha} 
            icon="cloudy-night-outline" 
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

  return (
    <View style={[styles.prayerTimeItem, isActive && styles.activePrayerItem]}>
      <View style={styles.prayerNameContainer}>
        <Ionicons name={icon as any} size={20} color={isActive ? "#0E8A3E" : "#666"} />
        <Text style={[styles.prayerName, isActive && styles.activePrayerText]}>{name}</Text>
      </View>
      <View style={styles.prayerTimeRight}>
        <Text style={[styles.prayerTime, isActive && styles.activePrayerText]}>{formatTime(time)}</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={toggleNotification}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={notificationEnabled ? "notifications" : "notifications-off-outline"} 
            size={26} 
            color={notificationEnabled ? "#0E8A3E" : "#666"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0E8A3E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  locationBanner: {
    height: 200,
    position: 'relative',
  },
  mosqueImagePlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#0E8A3E',
  },
  mosqueIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    opacity: 0.5,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerContent: {
    justifyContent: 'flex-end',
  },
  locationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  nextPrayerName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  nextPrayerTime: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  remainingTime: {
    color: 'white',
    fontSize: 16,
  },
  dateContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  gregorianDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  hijriDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  prayerTimesContainer: {
    backgroundColor: 'white',
    marginTop: 8,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  activePrayerItem: {
    backgroundColor: '#E8F5ED',
  },
  prayerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  prayerTimeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerTime: {
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  activePrayerText: {
    color: '#0E8A3E',
    fontWeight: '600',
  },
  notificationButton: {
    padding: 6,
  },
}); 