import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { fetchPrayerTimes } from '@/hooks/usePrayerTimes';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// Define background task name
const PRAYER_NOTIFICATION_TASK = 'PRAYER_NOTIFICATION_TASK';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register background task if not already registered
export const registerBackgroundTask = async (): Promise<void> => {
  try {
    // Check if task is already defined
    const isTaskDefined = TaskManager.isTaskDefined(PRAYER_NOTIFICATION_TASK);
    if (!isTaskDefined) {
      TaskManager.defineTask(PRAYER_NOTIFICATION_TASK, async () => {
        try {
          // This function will be called in the background
          const notificationsScheduled = await schedulePrayerNotifications();
          return notificationsScheduled
            ? BackgroundFetch.BackgroundFetchResult.NewData
            : BackgroundFetch.BackgroundFetchResult.NoData;
        } catch (error) {
          console.error('Error in background notification task:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });
      
      // Register the task to run in background
      await BackgroundFetch.registerTaskAsync(PRAYER_NOTIFICATION_TASK, {
        minimumInterval: 60 * 15, // 15 minutes minimum
        stopOnTerminate: false,    // Continue task when app is terminated
        startOnBoot: true,         // Run task when device restarts
      });
      
      console.log('Successfully registered background prayer notification task');
    }
  } catch (error) {
    console.error('Error registering background task:', error);
  }
};

// Global notification toggle functions
export const saveGlobalNotificationPreference = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('global_prayer_notifications', enabled ? 'enabled' : 'disabled');
  } catch (error) {
    console.error('Error saving global notification preference:', error);
  }
};

export const getGlobalNotificationPreference = async (): Promise<boolean> => {
  try {
    const preference = await AsyncStorage.getItem('global_prayer_notifications');
    // Default to enabled unless explicitly disabled
    return preference !== 'disabled';
  } catch (error) {
    console.error('Error retrieving global notification preference:', error);
    return true; // Default to enabled
  }
};

// Store and retrieve user notification preferences for each prayer
export const savePrayerNotificationPreference = async (prayerName: string, enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(`prayer_notification_${prayerName.toLowerCase()}`, enabled ? 'enabled' : 'disabled');
  } catch (error) {
    console.error('Error saving prayer notification preference:', error);
  }
};

export const getPrayerNotificationPreference = async (prayerName: string): Promise<boolean> => {
  try {
    const preference = await AsyncStorage.getItem(`prayer_notification_${prayerName.toLowerCase()}`);
    // Always return true (enabled) unless explicitly disabled
    return preference !== 'disabled';
  } catch (error) {
    console.error('Error retrieving prayer notification preference:', error);
    return true; // Default to enabled
  }
};

// Helper function to convert prayer time string to Date object
const getPrayerTimeAsDate = (timeStr: string): Date => {
  const today = new Date();
  const [hours, minutes] = timeStr.split(':');
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
};

// Helper function to schedule a notification
const scheduleNotification = async (title: string, body: string, scheduledTime: Date, identifier: string): Promise<void> => {
  try {
    // Check if the notification time is in the future before scheduling
    const now = new Date();
    if (scheduledTime <= now) {
      console.log(`Skipping notification ${identifier} as scheduled time has passed`);
      return;
    }
    
    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: Platform.OS === 'android' ? 'adhan.mp3' : true,
        priority: Notifications.AndroidNotificationPriority.MAX, // Set to MAX priority
        data: {
          type: 'prayer-time',
          prayerName: identifier.split('-')[0]
        },
      },
      trigger: {
        date: scheduledTime,
        channelId: 'prayer-times',
      },
      identifier: identifier,
    });
    
    console.log(`Successfully scheduled notification: ${identifier} at ${scheduledTime.toLocaleTimeString()}`);
  } catch (error) {
    console.error(`Error scheduling notification ${identifier}:`, error);
  }
};

// Create Android notification channel for prayer times
export const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Prayer Times',
      importance: Notifications.AndroidImportance.MAX, // Use MAX importance
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0E8A3E',
      sound: 'adhan.mp3', // This should match the filename in app.json
      enableVibrate: true,
    });
    console.log('Created notification channel for prayer times');
  }
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync({
    android: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
  return status === 'granted';
};

// Function to check if a prayer time has just started (within the last minute)
const hasPrayerJustStarted = (prayerTime: Date): boolean => {
  const now = new Date();
  const diffMs = now.getTime() - prayerTime.getTime();
  // Check if prayer started within the last minute
  return diffMs >= 0 && diffMs < 60000; // 60000ms = 1 minute
};

// Function to immediately show a notification for a prayer that just started
const showImmediatePrayerNotification = async (prayerName: string, translatedName: string, translations: any = {}): Promise<void> => {
  try {
    await Notifications.presentNotificationAsync({
      content: {
        title: `${translatedName} ${translations['prayer.time'] || 'Prayer Time'}`,
        body: `${translatedName} ${translations['prayer.time'] || 'Prayer Time'} ${translations['prayer.started'] || 'has started'}`,
        sound: Platform.OS === 'android' ? 'adhan.mp3' : true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          type: 'prayer-time',
          prayerName: prayerName.toLowerCase()
        },
      },
      trigger: null, // null trigger means show immediately
    });
    console.log(`Showed immediate notification for ${prayerName}`);
  } catch (error) {
    console.error(`Error showing immediate notification for ${prayerName}:`, error);
  }
};

// Main function to schedule all prayer notifications
export const schedulePrayerNotifications = async (translations: any = {}): Promise<boolean> => {
  try {
    // Cancel any existing notifications before creating new ones
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Check if global notifications are enabled
    const globalNotificationsEnabled = await getGlobalNotificationPreference();
    if (!globalNotificationsEnabled) {
      console.log('Global notifications are disabled. Not scheduling any prayer notifications.');
      return false;
    }
    
    // Get location for prayer times
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission not granted. Cannot schedule notifications.');
      return false;
    }
    
    const userLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = userLocation.coords;
    
    // Fetch prayer times
    const prayerTimes = await fetchPrayerTimes(latitude, longitude);
    if (!prayerTimes || !prayerTimes.timings) {
      console.log('Failed to fetch prayer times. Cannot schedule notifications.');
      return false;
    }
    
    // Define prayers list
    const prayersList = [
      { name: 'Fajr', time: prayerTimes.timings.Fajr },
      { name: 'Dhuhr', time: prayerTimes.timings.Dhuhr },
      { name: 'Asr', time: prayerTimes.timings.Asr },
      { name: 'Maghrib', time: prayerTimes.timings.Maghrib },
      { name: 'Isha', time: prayerTimes.timings.Isha }
    ];
    
    // Load notification preferences for each prayer
    const notificationPreferences: Record<string, boolean> = {};
    for (const prayer of prayersList) {
      notificationPreferences[prayer.name] = await getPrayerNotificationPreference(prayer.name);
    }
    
    // Get current time
    const now = new Date();
    let notificationScheduled = false;
    
    // Check if any prayer time has just started
    for (const prayer of prayersList) {
      const prayerTime = getPrayerTimeAsDate(prayer.time);
      
      // If this prayer has just started (within the last minute) and notification is enabled
      if (hasPrayerJustStarted(prayerTime) && notificationPreferences[prayer.name]) {
        const translatedPrayerName = translations[`prayer.${prayer.name.toLowerCase()}`] || prayer.name;
        await showImmediatePrayerNotification(prayer.name, translatedPrayerName, translations);
      }
    }
    
    // Find the next upcoming prayer
    let nextUpcomingPrayer = null;
    for (const prayer of prayersList) {
      const prayerTime = getPrayerTimeAsDate(prayer.time);
      
      // Only consider future prayer times
      if (prayerTime > now) {
        // Check if this prayer's notifications are enabled
        if (notificationPreferences[prayer.name]) {
          // If we haven't found a next prayer yet, or if this prayer is earlier than our current next prayer
          if (!nextUpcomingPrayer || prayerTime < getPrayerTimeAsDate(nextUpcomingPrayer.time)) {
            nextUpcomingPrayer = prayer;
          }
        }
      }
    }
    
    // If we found an upcoming prayer, schedule a notification for it
    if (nextUpcomingPrayer) {
      const prayerTime = getPrayerTimeAsDate(nextUpcomingPrayer.time);
      const translatedPrayerName = translations[`prayer.${nextUpcomingPrayer.name.toLowerCase()}`] || nextUpcomingPrayer.name;
      
      // Generate a unique identifier that includes the date to prevent duplicates
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const notificationId = `${nextUpcomingPrayer.name.toLowerCase()}-${today}`;
      
      // Schedule notification exactly at prayer time
      await scheduleNotification(
        `${translatedPrayerName} ${translations['prayer.time'] || 'Prayer Time'}`, // Title
        `${translatedPrayerName} ${translations['prayer.time'] || 'Prayer Time'} ${translations['prayer.started'] || 'has started'}`, // Body
        prayerTime, // Exact prayer time
        notificationId // Unique ID
      );
      
      console.log(`Scheduled notification for next prayer: ${nextUpcomingPrayer.name} at ${prayerTime.toLocaleTimeString()}`);
      notificationScheduled = true;
    } else {
      console.log('No upcoming prayers found for today. Not scheduling any notifications.');
    }
    return notificationScheduled;
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    return false;
  }
};

// Function to monitor app state changes
let appStateSubscription: any = null;

export const startAppStateMonitoring = (): void => {
  if (appStateSubscription) {
    return; // Already monitoring
  }
  
  appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
    // When app comes to foreground
    if (nextAppState === 'active') {
      // Schedule notifications every time the app becomes active
      await schedulePrayerNotifications();
    }
  });
  
  console.log('Started app state monitoring for prayer notifications');
};

export const stopAppStateMonitoring = (): void => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
    console.log('Stopped app state monitoring for prayer notifications');
  }
}; 