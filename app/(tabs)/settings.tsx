import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

const SettingItem = ({ icon, title, subtitle, onPress }: { icon: string, title: string, subtitle?: string, onPress?: () => void }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingIcon}>
      <Ionicons name={icon as any} size={24} color="#0E8A3E" />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#666666" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { translations, language, setLanguage } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translations['settings.prayerSettings']}</Text>
        <SettingItem 
          icon="notifications-outline" 
          title={translations['settings.prayerNotifications']}
          subtitle={translations['settings.manageNotifications']}
        />
        <SettingItem 
          icon="location-outline" 
          title={translations['settings.location']}
          subtitle={translations['settings.setLocation']}
        />
        <SettingItem 
          icon="time-outline" 
          title={translations['settings.calculationMethod']}
          subtitle="ISNA"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translations['settings.appSettings']}</Text>
        <SettingItem 
          icon="moon-outline" 
          title={translations['settings.darkMode']}
          subtitle={translations['settings.off']}
        />
        <SettingItem 
          icon="language-outline" 
          title={translations['settings.language']}
          subtitle={language === 'en' ? translations['language.english'] : translations['language.urdu']}
          onPress={() => setLanguageModalVisible(true)}
        />
        <SettingItem 
          icon="notifications-circle-outline" 
          title={translations['settings.soundSettings']}
          subtitle={translations['settings.adhanNotifications']}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translations['settings.about']}</Text>
        <SettingItem 
          icon="information-circle-outline" 
          title={translations['settings.aboutApp']}
          subtitle={`${translations['settings.version']} 1.0.0`}
        />
        <SettingItem 
          icon="mail-outline" 
          title={translations['settings.contactUs']}
        />
        <SettingItem 
          icon="star-outline" 
          title={translations['settings.rate']}
        />
      </View>
      
      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{translations['language.select']}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setLanguageModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
              onPress={() => {
                setLanguage('en');
                setLanguageModalVisible(false);
              }}
            >
              <Text style={[styles.languageText, language === 'en' && styles.selectedLanguageText]}>
                English
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark" size={20} color="#0E8A3E" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.languageOption, language === 'ur' && styles.selectedLanguage]}
              onPress={() => {
                setLanguage('ur');
                setLanguageModalVisible(false);
              }}
            >
              <Text style={[styles.languageText, language === 'ur' && styles.selectedLanguageText]}>
                اردو
              </Text>
              {language === 'ur' && (
                <Ionicons name="checkmark" size={20} color="#0E8A3E" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E8A3E',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedLanguage: {
    backgroundColor: '#F0F8F4',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#0E8A3E',
    fontWeight: '600',
  },
}); 