import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface NamazGuideBoxProps {
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const boxWidth = width - 40; // 20px padding on each side

const NamazGuideBox = ({ onPress }: NamazGuideBoxProps) => {
  const { colors } = useTheme();
  
  // Create darker and lighter shades of the primary color for gradient
  const darkerPrimary = colors.primaryDark || '#0A1C33';
  const lighterPrimary = colors.primary;
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        colors={[lighterPrimary, darkerPrimary]}
        style={styles.gradientBackground}
      >
        <View style={styles.borderContainer}>
          <View style={[styles.blueBorder, { borderColor: colors.primary }]}>
            <View style={styles.contentContainer}>
              <Text style={[styles.arabicTitle, { color: colors.primary }]}>صلاة</Text>
              <Text style={styles.subtitle}>Complete Guide to Prayer Methods</Text>
              <View style={[styles.divider, { backgroundColor: colors.primary }]} />
              <Text style={[styles.namazText, { borderColor: colors.primary }]}>Learn Step-by-Step</Text>
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
    backgroundColor: '#14223A',
    borderRadius: 6,
  },
  blueBorder: {
    width: '94%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    marginBottom: 12,
  },
  namazText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});

export default NamazGuideBox; 