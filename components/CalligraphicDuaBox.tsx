import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface CalligraphicDuaBoxProps {
  totalDuas: number;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const boxWidth = width - 40; // 20px padding on each side

const CalligraphicDuaBox = ({ totalDuas, onPress }: CalligraphicDuaBoxProps) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#1A1A1A', '#121212']}
        style={styles.gradientBackground}
      >
        <View style={styles.borderContainer}>
          <View style={styles.goldBorder}>
            <View style={styles.contentContainer}>
              <Text style={styles.arabicTitle}>دعاء</Text>
              <Text style={styles.subtitle}>Collection of Islamic Supplications</Text>
              <View style={styles.divider} />
              <Text style={styles.duaCount}>{totalDuas} Duas Available</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: boxWidth,
    height: boxWidth * 0.56,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2, // Small padding to show background as a subtle shadow
  },
  borderContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 6,
  },
  goldBorder: {
    width: '94%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 4,
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  arabicTitle: {
    fontSize: 48,
    fontFamily: 'NotoKufi-Arabic',
    color: '#D4AF37',
    marginBottom: 14,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    width: '40%',
    height: 1,
    backgroundColor: '#D4AF37',
    marginBottom: 12,
  },
  duaCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});

export default CalligraphicDuaBox; 