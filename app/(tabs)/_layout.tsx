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
            height: 85,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 28 : 16,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
            fontWeight: '500',
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
            headerShown: true,
            headerStyle: {
              backgroundColor: '#0E8A3E',
            },
            headerRight: () => (
              <View style={{ 
                flexDirection: 'row', 
                marginRight: 16,
                marginTop: Platform.OS === 'ios' ? -8 : 0
              }}>
                <TouchableOpacity 
                  onPress={() => router.push('/login')}
                  style={{ marginRight: 16, padding: 4 }}
                >
                  <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push('/(tabs)/settings')}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ),
            tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
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
            tabBarItemStyle: { display: 'none' },
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
