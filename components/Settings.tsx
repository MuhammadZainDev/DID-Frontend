import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function Settings() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prayer Settings</Text>
        <SettingItem 
          icon="notifications-outline" 
          title="Prayer Notifications"
          subtitle="Manage prayer time notifications"
        />
        <SettingItem 
          icon="location-outline" 
          title="Location"
          subtitle="Set your prayer location"
        />
        <SettingItem 
          icon="time-outline" 
          title="Calculation Method"
          subtitle="ISNA"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <SettingItem 
          icon="moon-outline" 
          title="Dark Mode"
          subtitle="Off"
        />
        <SettingItem 
          icon="language-outline" 
          title="Language"
          subtitle="English"
        />
        <SettingItem 
          icon="notifications-circle-outline" 
          title="Sound Settings"
          subtitle="Adhan and notifications"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem 
          icon="information-circle-outline" 
          title="About App"
          subtitle="Version 1.0.0"
        />
        <SettingItem 
          icon="mail-outline" 
          title="Contact Us"
        />
        <SettingItem 
          icon="star-outline" 
          title="Rate App"
        />
      </View>
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
}); 