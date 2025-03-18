/*
 * NOTE: About Push Notifications in Expo
 * 
 * The warning about "Push notifications functionality provided by expo-notifications will be removed from Expo Go in SDK 53" 
 * means that to use push notifications properly, we need to create a development build instead of using Expo Go.
 * 
 * To create a development build, run:
 * npx expo prebuild 
 * npx expo run:android  (for Android)
 * npx expo run:ios      (for iOS)
 * 
 * This will create native builds with full notification support.
 * See: https://docs.expo.dev/develop/development-builds/introduction/
 */

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import CustomSplash from '../components/CustomSplash';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Jameel-Noori-Nastaleeq': require('../assets/fonts/Jameel-Noori-Nastaleeq-Regular.ttf'),
    'NotoKufi-Arabic': require('../assets/fonts/NotoKufi-Arabic-Variable-Font.ttf'),
  });

  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded) {
          // Hide native splash screen
          await SplashScreen.hideAsync();
          
          // Show custom splash for 4 seconds
          await new Promise(resolve => setTimeout(resolve, 4000));
          
          // Hide custom splash
          setShowCustomSplash(false);
        }
      } catch (e) {
        console.warn('Error in prepare:', e);
        setShowCustomSplash(false);
      }
    }

    prepare();
  }, [fontsLoaded]);

  // Show nothing until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  // Show custom splash while loading
  if (showCustomSplash) {
    return <CustomSplash />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <NavigationThemeProvider value={DefaultTheme}>
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
          </NavigationThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
