import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Ionicons } from '@expo/vector-icons';

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

  console.log('Prayer Times Component:', { prayerTimes, nextPrayer, loading, error });

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
        <Text style={styles.errorText}>Error loading prayer times</Text>
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

      <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
      
      <View style={styles.prayerRow}>
        <Text style={styles.prayerName}>{nextPrayer.name}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.prayerTime}>{formatTime(nextPrayer.time)}</Text>
          <Text style={styles.remainingTime}>{nextPrayer.remaining} remaining</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.otherPrayers}>
        <View style={styles.prayerTimeRow}>
          <View style={styles.prayerLabel}>
            <Ionicons name="sunny-outline" size={18} color="#666666" />
            <Text style={styles.prayerText}>Sunrise:</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(prayerTimes.timings.Sunrise)}</Text>
        </View>

        <View style={styles.prayerTimeRow}>
          <View style={styles.prayerLabel}>
            <Ionicons name="moon-outline" size={18} color="#666666" />
            <Text style={styles.prayerText}>Maghrib:</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(prayerTimes.timings.Maghrib)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  hijriDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0E8A3E',
    marginBottom: 4,
  },
  gregorianDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: '#666666',
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
    color: '#0E8A3E',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  remainingTime: {
    fontSize: 12,
    color: '#666666',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0E8A3E',
    borderRadius: 2,
  },
  otherPrayers: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
    color: '#666666',
  },
  timeText: {
    fontSize: 14,
    color: '#333333',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
});