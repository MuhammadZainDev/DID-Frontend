import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

const formatTime = (time: string) => {
  // Remove any "(+1)" or similar from the time
  const cleanTime = time.split(' ')[0];
  const [hours, minutes] = cleanTime.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export default function PrayerTimes() {
  const { prayerTimes, loading, error, nextPrayer } = usePrayerTimes();
  const { translations } = useLanguage();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0E8A3E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{translations['prayer.error_loading']}</Text>
      </View>
    );
  }

  if (!prayerTimes || !nextPrayer) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0E8A3E" />
      </View>
    );
  }

  const progress = nextPrayer.totalSeconds 
    ? ((24 * 60 * 60 - nextPrayer.totalSeconds) / (24 * 60 * 60)) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.hijriDate}>
        {prayerTimes.date.hijri.day} {prayerTimes.date.hijri.month.en}, {prayerTimes.date.hijri.year}
      </Text>
      <Text style={styles.gregorianDate}>
        {prayerTimes.date.gregorian.day} {prayerTimes.date.gregorian.month.en} {prayerTimes.date.gregorian.year}
      </Text>

      <Text style={styles.nextPrayerLabel}>{translations['prayer.nextPrayer']}</Text>
      
      <View style={styles.prayerRow}>
        <Text style={styles.prayerName}>
          {translations[`prayer.${nextPrayer.name.toLowerCase()}`] || nextPrayer.name}
        </Text>
        <View style={styles.timeContainer}>
          <Text style={styles.prayerTime}>{formatTime(nextPrayer.time)}</Text>
          <Text style={styles.remainingTime}>{nextPrayer.remaining} {translations['prayer.remaining']}</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.otherPrayers}>
        <View style={styles.prayerTimeRow}>
          <View style={styles.prayerLabel}>
            <Ionicons name="sunny-outline" size={18} color="#EEEEEE" />
            <Text style={styles.prayerText}>{translations['prayer.sunrise']}:</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(prayerTimes.timings.Sunrise)}</Text>
        </View>

        <View style={styles.prayerTimeRow}>
          <View style={styles.prayerLabel}>
            <Ionicons name="moon-outline" size={18} color="#EEEEEE" />
            <Text style={styles.prayerText}>{translations['prayer.maghrib']}:</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(prayerTimes.timings.Maghrib)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
  },
  hijriDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 4,
  },
  gregorianDate: {
    fontSize: 14,
    color: '#EEEEEE',
    marginBottom: 20,
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  prayerName: {
    fontSize: 30,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  remainingTime: {
    fontSize: 12,
    color: '#EEEEEE',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  otherPrayers: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
    gap: 12,
  },
  prayerTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerText: {
    fontSize: 14,
    color: '#EEEEEE',
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
});