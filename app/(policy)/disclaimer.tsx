import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function DisclaimerScreen() {
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.rightPlaceholder} />
        </View>
        
        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.policyText}>
            Welcome to DuaonAI. By using our application, you agree to the following terms and conditions.
          </Text>
          
          <Text style={styles.sectionTitle}>Usage Guidelines</Text>
          <Text style={styles.policyText}>
            DuaonAI is designed to provide access to Islamic duas and prayer times. The content is provided for informational and educational purposes only.
          </Text>
          
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.policyText}>
            All content, including duas, translations, and artwork, is either owned by DuaonAI or used with permission. You may not reproduce, distribute, or create derivative works without our consent.
          </Text>
          
          <Text style={styles.sectionTitle}>User Accounts</Text>
          <Text style={styles.policyText}>
            You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>
          
          <Text style={styles.sectionTitle}>Disclaimer of Warranties</Text>
          <Text style={styles.policyText}>
            <Text style={styles.boldText}>DuaonAI is provided "as is" without warranties of any kind.</Text> While we strive for accuracy, we do not guarantee that the content, including prayer times and duas, is completely accurate, current, or error-free.
          </Text>
          
          <Text style={styles.sectionTitle}>Religious Accuracy</Text>
          <Text style={styles.policyText}>
            While we make every effort to ensure the accuracy of religious content, users are encouraged to verify with their local mosques or Islamic centers.
          </Text>
          
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.policyText}>
            Under no circumstances shall DuaonAI be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the application.
          </Text>
          
          <Text style={styles.sectionTitle}>Termination</Text>
          <Text style={styles.policyText}>
            We reserve the right to terminate or suspend access to our application at any time, without prior notice, for conduct that we believe violates these Terms of Service.
          </Text>
          
          <Text style={styles.sectionTitle}>Governing Law</Text>
          <Text style={styles.policyText}>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DuaonAI operates, without regard to its conflict of law provisions.
          </Text>
          
          <Text style={styles.sectionTitle}>Changes to Terms</Text>
          <Text style={styles.policyText}>
            We may update these terms from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "last updated" date.
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.policyText}>
            If you have any questions about these Terms, please contact us at:
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