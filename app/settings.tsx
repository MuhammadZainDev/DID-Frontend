import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, themeColors } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGlobalNotificationPreference, saveGlobalNotificationPreference } from '@/app/(tabs)/prayers';
import { DevResetButton } from '@/components/DevResetButton';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, translations } = useLanguage();
  const { theme, colors, setTheme } = useTheme();
  const [prayerNotifications, setPrayerNotifications] = useState(true);

  // Load global notification preference when component mounts
  useEffect(() => {
    async function loadNotificationPreference() {
      try {
        const isEnabled = await getGlobalNotificationPreference();
        setPrayerNotifications(isEnabled);
      } catch (error) {
        console.error('Error loading notification preference:', error);
      }
    }
    
    loadNotificationPreference();
  }, []);

  const goBack = () => {
    router.back();
  };

  const toggleLanguage = async () => {
    await setLanguage(language === 'en' ? 'ur' : 'en');
  };
  
  // Toggle prayer notifications and save preference
  const togglePrayerNotifications = async () => {
    try {
      const newValue = !prayerNotifications;
      setPrayerNotifications(newValue);
      await saveGlobalNotificationPreference(newValue);
      console.log(`Global prayer notifications ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling prayer notifications:', error);
      // Revert UI change on error
      setPrayerNotifications(prayerNotifications);
    }
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
  const ThemeOption = ({ colorKey }) => (
    <TouchableOpacity 
      style={[
        styles.themeOption, 
        { backgroundColor: themeColors[colorKey].primary },
        theme === colorKey && styles.selectedThemeOption
      ]}
      onPress={() => setTheme(colorKey)}
    >
      {theme === colorKey && (
        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );

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

        <SettingsSection title={translations['settings.prayerSettings']}>
          <SettingsItem
            icon="notifications-outline"
            title={translations['settings.prayerNotifications']}
            value={prayerNotifications}
            onToggle={togglePrayerNotifications}
          />
        </SettingsSection>

        <SettingsSection title={translations['settings.aboutApp']}>
          <SettingsItem
            icon="information-circle-outline"
            title="About Us"
            onToggle={() => router.push('/about-us')}
            type="navigation"
          />
          <SettingsItem
            icon="mail-outline"
            title={translations['settings.contactUs']}
            onToggle={() => router.push('/contact-us')}
            type="navigation"
          />
          <SettingsItem
            icon="star-outline"
            title={translations['settings.rate']}
            onToggle={() => {}}
            type="navigation"
          />
          <SettingsItem
            icon="share-social-outline"
            title={translations['settings.share']}
            onToggle={() => {}}
            type="navigation"
          />
        </SettingsSection>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            {translations['app.name']} v1.0.0
          </Text>
        </View>
      </ScrollView>

      <DevResetButton />
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
    backgroundColor: '#1A7F4B',
    width: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#FFFFFF',
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
    marginTop: 24,
    marginBottom: 40,
  },
  versionText: {
    color: '#888',
    fontSize: 14,
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
}); 