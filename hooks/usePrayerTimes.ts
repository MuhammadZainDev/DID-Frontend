import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { Alert, Platform, Linking } from 'react-native';

const ALADHAN_API = 'https://api.aladhan.com/v1/timings';

export interface PrayerTimes {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: {
        number: number;
        en: string;
      };
      year: string;
    };
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: {
        number: number;
        en: string;
        ar: string;
      };
      year: string;
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

// Separate function to fetch prayer times that can be reused anywhere
export const fetchPrayerTimes = async (latitude: number, longitude: number): Promise<PrayerTimes | null> => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const apiUrl = `${ALADHAN_API}/${timestamp}`;

    const response = await axios.get(apiUrl, {
      params: {
        latitude: latitude,
        longitude: longitude,
        method: 2, // ISNA
        school: 1, // Hanafi
        tune: "0,0,0,0,0,0"
      },
      timeout: 10000
    });

    if (response.data && response.data.code === 200 && response.data.data) {
      const prayerData: PrayerTimes = {
        timings: {
          Fajr: response.data.data.timings.Fajr,
          Sunrise: response.data.data.timings.Sunrise,
          Dhuhr: response.data.data.timings.Dhuhr,
          Asr: response.data.data.timings.Asr,
          Maghrib: response.data.data.timings.Maghrib,
          Isha: response.data.data.timings.Isha
        },
        date: response.data.data.date,
        meta: {
          latitude: latitude,
          longitude: longitude,
          timezone: response.data.data.meta.timezone
        }
      };

      return prayerData;
    } else {
      console.error('Invalid response from prayer times API');
      return null;
    }
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
};

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: string;
    remaining: string;
    totalSeconds: number;
  } | null>(null);

  // Function to convert 24h time to 12h format
  const convertTo12Hour = (time24h: string): string => {
    // If already in 12-hour format, return as is
    if (time24h.includes('AM') || time24h.includes('PM')) {
      return time24h;
    }

    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Function to convert prayer time to Date object
  const getPrayerTimeAsDate = (timeStr: string) => {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':');
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
  };

  // Function to calculate time remaining
  const getTimeRemaining = (targetTime: Date) => {
    const now = new Date();
    let diff = targetTime.getTime() - now.getTime();
    
    // If difference is negative, add 24 hours (for next day prayers)
    if (diff < 0) {
      const tomorrow = new Date(targetTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      diff = tomorrow.getTime() - now.getTime();
    }
    
    // Ensure we're never showing more than 24 hours
    const totalSeconds = Math.min(diff / 1000, 24 * 60 * 60);
    
    const hours = Math.floor(totalSeconds / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return {
      timeString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      totalSeconds
    };
  };

  // Function to update current and next prayer times
  const updatePrayerStatus = () => {
    if (!prayerTimes) return;

    const now = new Date();
    
    // Define prayers with their times in order
    const prayers = [
      { name: 'Fajr', time: prayerTimes.timings.Fajr },
      { name: 'Sunrise', time: prayerTimes.timings.Sunrise },
      { name: 'Dhuhr', time: prayerTimes.timings.Dhuhr },
      { name: 'Asr', time: prayerTimes.timings.Asr },
      { name: 'Maghrib', time: prayerTimes.timings.Maghrib },
      { name: 'Isha', time: prayerTimes.timings.Isha }
    ];

    // Convert all prayer times to Date objects for today
    const prayerDates = prayers.map(prayer => ({
      ...prayer,
      date: getPrayerTimeAsDate(prayer.time)
    }));
    
    // Find the next prayer (first prayer time that's after current time)
    let nextPrayerIndex = -1;
    for (let i = 0; i < prayerDates.length; i++) {
      if (now < prayerDates[i].date) {
        nextPrayerIndex = i;
        break;
      }
    }
    
    // If no next prayer found today, next prayer is first prayer tomorrow (Fajr)
    if (nextPrayerIndex === -1) {
      nextPrayerIndex = 0;
    }
    
    // Determine current prayer (previous prayer before next)
    let currentPrayerIndex = nextPrayerIndex - 1;
    
    // If currentPrayerIndex is -1, it means we're before Fajr, so current prayer is Isha from yesterday
    if (currentPrayerIndex < 0) {
      currentPrayerIndex = prayerDates.length - 1;
    }
    
    // Get the current and next prayer objects
    const current = prayerDates[currentPrayerIndex];
    const next = prayerDates[nextPrayerIndex];

    // Update state with the details
    setCurrentPrayer(current.name);
    const remaining = getTimeRemaining(next.date);
    setNextPrayer({
      name: next.name,
      time: convertTo12Hour(next.time),
      remaining: remaining.timeString,
      totalSeconds: remaining.totalSeconds
    });
  };

  const refreshPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission is required for prayer times');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      const prayerData = await fetchPrayerTimes(
        location.coords.latitude,
        location.coords.longitude
      );
      
      if (prayerData) {
        setPrayerTimes(prayerData);
        updatePrayerStatus();
      } else {
        throw new Error('Invalid response from prayer times API');
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setError('Connection timeout. Please check your internet connection.');
        } else if (error.response?.status === 404) {
          setError('Could not find prayer times for your location.');
        } else {
          setError(`Unable to fetch prayer times: ${error.message}`);
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPrayerTimes();
  }, []);

  // Update prayer status every second
  useEffect(() => {
    if (prayerTimes) {
      const interval = setInterval(updatePrayerStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  return {
    prayerTimes,
    loading,
    error,
    currentPrayer,
    nextPrayer,
    refreshPrayerTimes
  };
} 