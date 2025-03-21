import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  // Prevent auto-redirect by handling back button and screen focus
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>      
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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.policyText}>
            Welcome to DuaonAI. We respect your privacy and are committed to protecting your personal data.
          </Text>
          
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• Personal data:</Text> We may collect your name, email, and device information when you create an account or contact us.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• Usage data:</Text> We collect information about how you use our app, including features accessed and time spent.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• Location data:</Text> With your permission, we access your location to provide accurate prayer times.
          </Text>
          
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• To provide services:</Text> We use your information to deliver our services, including personalized duas and prayer times.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• To improve our app:</Text> We analyze usage patterns to enhance app functionality and user experience.
          </Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>• To communicate:</Text> We may contact you regarding app updates, new features, or changes to our terms or policies.
          </Text>
          
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.policyText}>
            We implement appropriate security measures to protect your personal data against unauthorized access or disclosure.
          </Text>
          
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.policyText}>
            You have the right to access, correct, or delete your personal data. You can also withdraw consent for certain processing activities.
          </Text>
          
          <Text style={styles.sectionTitle}>Policy Updates</Text>
          <Text style={styles.policyText}>
            We may update this privacy policy periodically. We will notify you of significant changes through the app or via email.
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.policyText}>
            If you have questions about this policy or our data practices, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>duaonai.official@gmail.com</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: 'bold',
  },
}); 