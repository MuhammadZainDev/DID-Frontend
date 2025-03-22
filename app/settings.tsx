import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, StatusBar, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, themeColors } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, translations } = useLanguage();
  const { theme, colors, setTheme } = useTheme();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('warning');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Check authentication status whenever the component is focused
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        
        console.log('Auth check - Token exists:', !!token);
        console.log('Auth check - User exists:', !!userStr);
        
        setIsAuthenticated(!!(token && userStr && user));
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [user]); // Re-check whenever user changes

  const goBack = () => {
    router.back();
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'ur' : 'en';
    await setLanguage(newLanguage);
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Animate toast in
    slideAnim.setValue(50);
    fadeAnim.setValue(0);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Hide toast after appropriate time
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowToast(false);
      });
    }, 2000);
  };

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ icon, title, value, onToggle, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <Ionicons 
          name={icon} 
          size={22} 
          color="#FFFFFF" 
          style={styles.settingIcon} 
        />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#444', true: colors.track }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : type === 'language' ? (
        <TouchableOpacity onPress={onToggle} style={styles.languageButton}>
          <Text style={styles.languageButtonText}>
            {language === 'en' ? 'English' : 'اردو'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#AAAAAA" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onToggle} style={styles.navigationButton}>
          <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Color Theme Component
  const ThemeOption = ({ colorKey }) => {
    const handlePress = () => {
      setTheme(colorKey);
    };
    
    return (
      <TouchableOpacity 
        style={[
          styles.themeOption, 
          { backgroundColor: themeColors[colorKey].primary },
          theme === colorKey && styles.selectedThemeOption
        ]}
        onPress={handlePress}
      >
        {theme === colorKey && (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.header} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {translations['settings.title']}
        </Text>
        <View style={{width: 70}} />
      </View>
      
      <ScrollView style={[styles.scrollView, { backgroundColor: '#121212' }]} contentContainerStyle={styles.scrollContent}>
        <SettingsSection title={translations['settings.appSettings']}>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons 
                name="color-palette-outline" 
                size={22} 
                color="#FFFFFF" 
                style={styles.settingIcon} 
              />
              <Text style={styles.settingTitle}>Theme Color</Text>
            </View>
            <View style={styles.themeOptions}>
              <ThemeOption colorKey="green" />
              <ThemeOption colorKey="blue" />
              <ThemeOption colorKey="purple" />
            </View>
          </View>
          <SettingsItem
            icon="language-outline"
            title={translations['settings.language']}
            value={language}
            onToggle={toggleLanguage}
            type="language"
          />
        </SettingsSection>

        <SettingsSection title={translations['settings.aboutApp']}>
          <SettingsItem
            icon="information-circle-outline"
            title="About Us"
            onToggle={() => router.push('/about-us')}
            type="navigation"
            value={false}
          />
          <SettingsItem
            icon="mail-outline"
            title={translations['settings.contactUs']}
            onToggle={() => router.push('/contact-us')}
            type="navigation"
            value={false}
          />
          <SettingsItem
            icon="star-outline"
            title={translations['settings.rate']}
            onToggle={() => {}}
            type="navigation"
            value={false}
          />
          <SettingsItem
            icon="share-social-outline"
            title={translations['settings.share']}
            onToggle={() => {}}
            type="navigation"
            value={false}
          />
        </SettingsSection>
        
        <SettingsSection title="Account Management">
          <SettingsItem
            icon="trash-outline"
            title="Delete Account"
            onToggle={() => {
              console.log("Delete Account clicked - Auth state:", isAuthenticated ? "Authenticated" : "Not authenticated");
              console.log("User state:", user ? `User exists (email: ${user.email})` : "No user");
              
              if (isAuthenticated) {
                console.log("User is authenticated, navigating to delete account screen");
                router.push('/delete-account');
              } else {
                console.log("User is not authenticated, showing toast and redirecting to login");
                showToastMessage('You must be logged in to delete your account', 'warning');
                setTimeout(() => {
                  router.push({
                    pathname: '/login',
                    params: { from: 'delete-account' }
                  });
                }, 2000);
              }
            }}
            type="navigation"
            value={false}
          />
        </SettingsSection>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            {translations['app.name']} v1.0.0
          </Text>
        </View>
      </ScrollView>

      {showToast && (
        <Animated.View 
          style={[
            styles.toast, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: toastType === 'success' ? '#4CAF50' : 
                              toastType === 'error' ? '#FF3B30' : 
                              toastType === 'warning' ? '#FF9500' : 
                              colors.primary
            }
          ]}
        >
          <Ionicons 
            name={
              toastType === 'success' ? "checkmark-circle" : 
              toastType === 'error' ? "alert-circle" :
              toastType === 'warning' ? "warning" : 
              "information-circle"
            } 
            size={20} 
            color="white" 
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 54,
    paddingBottom: 16,
    height: Platform.OS === 'android' ? 100 : 100,
    backgroundColor: '#0E8A3E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  sectionContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThemeOption: {
    borderColor: '#FFFFFF',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#FFFFFF',
    marginRight: 8,
  },
  navigationButton: {
    padding: 4,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
}); 