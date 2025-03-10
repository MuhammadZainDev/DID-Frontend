import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, translations } = useLanguage();
  const [darkMode, setDarkMode] = useState(true);
  const [prayerNotifications, setPrayerNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [adhanSound, setAdhanSound] = useState(true);

  const goBack = () => {
    router.back();
  };

  const toggleLanguage = async () => {
    await setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ icon, title, value, onToggle, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={22} color="#4CAF50" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#444', true: '#4CAF50' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : type === 'language' ? (
        <TouchableOpacity onPress={onToggle} style={styles.languageButton}>
          <Text style={styles.languageButtonText}>
            {language === 'en' ? 'English' : 'اردو'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onToggle} style={styles.navigationButton}>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations['settings.title']}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Ionicons name="person-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.profileName}>Guest User</Text>
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <SettingsSection title={translations['settings.appSettings']}>
          <SettingsItem
            icon="moon-outline"
            title={translations['settings.darkMode']}
            value={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
          />
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
            onToggle={() => setPrayerNotifications(!prayerNotifications)}
          />
          <SettingsItem
            icon="alarm-outline"
            title="Prayer Reminders (15 min before)"
            value={reminderNotifications}
            onToggle={() => setReminderNotifications(!reminderNotifications)}
          />
          <SettingsItem
            icon="volume-high-outline"
            title="Adhan Sound"
            value={adhanSound}
            onToggle={() => setAdhanSound(!adhanSound)}
          />
          <SettingsItem
            icon="location-outline"
            title={translations['settings.location']}
            onToggle={() => {}}
            type="navigation"
          />
        </SettingsSection>

        <SettingsSection title={translations['settings.aboutApp']}>
          <SettingsItem
            icon="information-circle-outline"
            title="About Us"
            onToggle={() => {}}
            type="navigation"
          />
          <SettingsItem
            icon="mail-outline"
            title={translations['settings.contactUs']}
            onToggle={() => {}}
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
    </SafeAreaView>
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
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  signInButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
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
    fontSize: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#888',
    marginRight: 8,
  },
  navigationButton: {
    padding: 4,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    color: '#666',
    fontSize: 14,
  },
}); 