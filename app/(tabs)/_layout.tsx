import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#0E8A3E',
          tabBarInactiveTintColor: '#666666',
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#0E8A3E',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
            height: Platform.OS === 'ios' ? 80 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 5,
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
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color }) => <Ionicons name="bookmark-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#0E8A3E',
            },
            headerTitleStyle: {
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: 18,
            },
            headerTintColor: '#FFFFFF',
            tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
