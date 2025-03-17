import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

// Create a simplified star background without logo text
const StarBackground = () => {
  return (
    <View style={styles.starsBackground}>
      {/* Just a colored background - no stars or text */}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

export default function DisclaimerScreen() {
  const router = useRouter();

  // Prevent auto-redirect by handling back button and screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Disclaimer screen focused');
      
      // Handle hardware back button (Android)
      const onBackPress = () => {
        console.log('Back button pressed on Android');
        handleBack();
        return true; // Prevent default behavior
      };
      
      // Add event listener for hardware back button
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Cleanup function
      return () => {
        console.log('Disclaimer screen unfocused');
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  const handleBack = () => {
    console.log('Back button pressed on Disclaimer');
    // Use router.back() instead of navigate/push to ensure proper navigation
    router.back();
  };

  return (
    <LinearGradient
      colors={['#1A1B4B', '#2E0854', '#0C0522']}
      style={styles.container}
    >
      {/* Simple background without logo text */}
      <StarBackground />
      
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Disclaimer</Text>
          <View style={styles.rightPlaceholder} />
        </View>
        
        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.disclaimerText}>
            Last Updated: 10/03/2025
          </Text>
          
          <Text style={styles.sectionTitle}>App Information</Text>
          <Text style={styles.disclaimerText}>
            Duaon AIis a mobile application designed to provide Islamic duas (supplications), prayer times, and related content for informational and educational purposes only.
          </Text>
          
          <Text style={styles.sectionTitle}>Content Accuracy</Text>
          <Text style={styles.disclaimerText}>
            While we make every effort to ensure the accuracy of the content provided in this application, we make no guarantees regarding the completeness, reliability, or accuracy of this information. The duas, translations, and Islamic content are compiled from various authentic sources, but any perceived errors or inaccuracies should be brought to our attention.
          </Text>
          
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          <Text style={styles.disclaimerText}>
            Prayer times are calculated based on geographical location and astronomical calculations. These times should be considered approximate, and users are encouraged to verify with their local mosques or Islamic centers.
          </Text>
          
          <Text style={styles.sectionTitle}>User Responsibility</Text>
          <Text style={styles.disclaimerText}>
            Users are responsible for how they use this application and the information it provides. We are not liable for any misuse, misinterpretation, or any consequences arising from the use of this application.
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.disclaimerText}>
            If you have any questions or concerns about this disclaimer or any aspect of the application, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>support@dailyislamicdua.com</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 24,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 24,
  },
  contactEmail: {
    fontSize: 16,
    color: '#7C4DFF',
    marginTop: 8,
    fontWeight: 'bold',
  },
}); 