import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutUsScreen() {
  const router = useRouter();
  const { language, translations } = useLanguage();
  const { theme, colors } = useTheme();

  const goBack = () => {
    router.back();
  };

  // App features list
  const features = [
    {
      icon: 'book-outline',
      title: 'Authentic Duas Collection',
      description: 'Comprehensive collection of authentic duas for all occasions from Quran and Sunnah.'
    },
    {
      icon: 'time-outline',
      title: 'Prayer Times',
      description: 'Accurate prayer times with notifications and Qibla direction.'
    },
    {
      icon: 'bookmark-outline',
      title: 'Duas Categories',
      description: 'Well-organized categories for easy access to duas for specific situations.'
    },
    {
      icon: 'language-outline',
      title: 'Multilingual Support',
      description: 'Available in English and Urdu with authentic Arabic text and translations.'
    },
    {
      icon: 'moon-outline',
      title: 'Dark Mode',
      description: 'Comfortable reading experience in any lighting condition.'
    },
    {
      icon: 'share-social-outline',
      title: 'Share Duas',
      description: 'Easily share duas with family and friends for spreading beneficial knowledge.'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.header} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Settings</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={60} color={colors.primary} style={styles.logoIcon} />
            <Text style={styles.appName}>Duaon</Text>
          </View>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your essential companion for authentic Islamic supplications (duas) from the Quran and Sunnah. Duaon helps Muslims easily access, memorize and benefit from the beautiful supplications taught by Prophet Muhammad ﷺ.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name={feature.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <View style={styles.developerContainer}>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>Muhammad Zain</Text>
              <Text style={styles.developerRole}>Lead Developer & Designer</Text>
              <Text style={styles.developerBio}>
                Passionate about creating beneficial Islamic applications that help Muslims connect with authentic duas and supplications in their daily lives.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="mail-outline" size={22} color={colors.primary} />
              <Text style={styles.contactText}>support@duaon.com</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="logo-twitter" size={22} color={colors.primary} />
              <Text style={styles.contactText}>@DuaonApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="globe-outline" size={22} color={colors.primary} />
              <Text style={styles.contactText}>www.duaon.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acknowledgements</Text>
          <Text style={styles.acknowledgementText}>
            We thank Allah (SWT) for enabling us to create Duaon. All duas are meticulously sourced from authentic collections of Hadith and Quran to ensure accuracy and reliability. If you find any errors or have suggestions, please contact us.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.copyrightText}>© 2023 Duaon. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 54,
    paddingBottom: 16,
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 54 : 100,
    width: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 16,
    color: '#EEEEEE',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  developerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  developerRole: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  developerBio: {
    fontSize: 14,
    color: '#EEEEEE',
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#EEEEEE',
  },
  acknowledgementText: {
    fontSize: 15,
    color: '#EEEEEE',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 14,
    color: '#888888',
  },
}); 