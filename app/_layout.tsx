/*
 * NOTE: About App Initialization
 * 
 * This file handles the root layout and initialization of the app.
 * It loads fonts, sets up providers, and handles the initial splash screen.
 */

import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Animated, Dimensions, Image, Text, Platform } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Prefetch all needed data to improve first load experience
const prefetchAllData = async () => {
  try {
    // Check network connection
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('No internet connection, skipping prefetch');
      return;
    }

    // Fetch categories
    const categoriesResponse = await fetch(`${API_URL}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    await AsyncStorage.setItem('categories_cache', JSON.stringify(categoriesData));
    console.log('Categories data prefetched and cached');

    // Fetch featured duas
    const featuredResponse = await fetch(`${API_URL}/api/duas/featured`);
    const featuredData = await featuredResponse.json();
    await AsyncStorage.setItem('featured_duas_cache', JSON.stringify(featuredData));
    console.log('Featured duas prefetched and cached');

    // Store timestamp of last prefetch
    await AsyncStorage.setItem('last_prefetch_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error during data prefetch:', error);
  }
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Jameel-Noori-Nastaleeq': require('../assets/fonts/Jameel-Noori-Nastaleeq-Regular.ttf'),
    'NotoKufi-Arabic': require('../assets/fonts/NotoKufi-Arabic-Variable-Font.ttf'),
  });

  // Remove unnecessary states
  const [appReady, setAppReady] = useState(false);

  // Prefetch all data when app starts
  useEffect(() => {
    const checkAndPrefetchData = async () => {
      if (fontsLoaded) {
        try {
          // Check when was the last prefetch
          const lastPrefetch = await AsyncStorage.getItem('last_prefetch_timestamp');
          const shouldPrefetch = !lastPrefetch || 
                                (Date.now() - parseInt(lastPrefetch)) > 24 * 60 * 60 * 1000; // 24 hours
          
          if (shouldPrefetch) {
            console.log('Starting data prefetch');
            // Start prefetching data in background
            prefetchAllData();
          } else {
            console.log('Skipping prefetch, data is recent');
          }
        } catch (error) {
          console.error('Error during prefetch check:', error);
        }
      }
    };
    
    checkAndPrefetchData();
  }, [fontsLoaded]);

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded) {
          // Hide splash screen immediately after fonts are loaded
          await SplashScreen.hideAsync();
          setAppReady(true);
        }
      } catch (e) {
        console.warn('Error in prepare:', e);
        setAppReady(true);
      }
    }

    prepare();
  }, [fontsLoaded]);

  // Show nothing until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <NavigationThemeProvider value={DefaultTheme}>
            {!appReady ? (
              <View style={styles.loadingContainer}>
                <Image
                  source={require('../assets/images/adaptive-icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <React.Fragment>
                <Stack 
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'white' },
                    animation: 'fade_from_bottom',
                    presentation: 'fullScreenModal',
                    animationDuration: 200,
                  }}
                >
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="dua" options={{ headerShown: false }} />
                  <Stack.Screen name="subcategory" options={{ headerShown: false }} />
                  <Stack.Screen name="delete-account" options={{ headerShown: false }} />
                  <Stack.Screen 
                    name="welcome" 
                    options={{ 
                      headerShown: false, 
                      gestureEnabled: false,
                      animation: 'fade',
                    }} 
                  />
                  <Stack.Screen 
                    name="welcome-options" 
                    options={{ 
                      headerShown: false, 
                      gestureEnabled: false,
                      animation: 'slide_from_right',
                    }} 
                  />
                  <Stack.Screen name="(policy)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="login"
                    options={{
                      animation: 'slide_from_right',
                      presentation: 'card',
                      animationDuration: 200,
                    }}
                  />
                  <Stack.Screen
                    name="signup"
                    options={{
                      animation: 'slide_from_right',
                      presentation: 'card',
                      animationDuration: 200,
                    }}
                  />
                </Stack>
                <StatusBar style="light" />
              </React.Fragment>
            )}
          </NavigationThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    maxWidth: 120,
    maxHeight: 120,
  },
});
