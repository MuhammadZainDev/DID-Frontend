import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const router = useRouter();
  const { translations } = useLanguage();
  const { colors } = useTheme();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#AAAAAA',
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: '#121212',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 80 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 0,
            paddingTop: 0,
            fontWeight: '500',
          },
          tabBarIconStyle: {
            marginBottom: 0,
          }
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="prayers"
          options={{
            title: 'Prayer Times',
            tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="duas"
          options={{
            title: 'Duas',
            tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color }) => <Ionicons name="bookmark-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
