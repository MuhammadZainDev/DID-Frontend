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

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  // Prevent auto-redirect by handling back button and screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Privacy Policy screen focused');
      
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
        console.log('Privacy Policy screen unfocused');
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  const handleBack = () => {
    console.log('Back button pressed on Privacy Policy');
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.rightPlaceholder} />
        </View>
        
        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.policyText}>
            Last Updated: 10/03/2025
          </Text>
          
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.policyText}>
            Welcome to Duaon AI ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we handle your personal information when you use our application and tell you about your privacy rights.
          </Text>
          
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>1. Personal Information:</Text> When you create an account, we collect your name, email address, and chosen password.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>2. Location Data:</Text> With your permission, we collect your location data to provide accurate prayer times based on your geographic location.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>3. Usage Data:</Text> We collect information about how you use our app, including favorite duas, language preferences, and feature usage.
          </Text>
          
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• To provide services:</Text> We use your information to deliver our services, including personalized duas, prayer times, and notifications.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• To improve our app:</Text> We analyze usage patterns to enhance app functionality and user experience.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• To communicate:</Text> We may contact you regarding app updates, new features, or changes to our terms or policies.
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.policyText}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>duaonai.official@gmail.com</Text>
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
  policyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: 'white',
  },
  contactEmail: {
    fontSize: 16,
    color: '#7C4DFF',
    marginTop: 8,
    fontWeight: 'bold',
  },
}); 