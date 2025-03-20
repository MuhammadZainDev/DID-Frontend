import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, themeColors } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, translations } = useLanguage();
  const { theme, colors, setTheme } = useTheme();

  const goBack = () => {
    router.back();
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'ur' : 'en';
    await setLanguage(newLanguage);
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
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            {translations['app.name']} v1.0.0
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
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
}); 