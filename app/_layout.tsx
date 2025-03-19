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

import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Animated, Dimensions, Image, Text } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

const { width } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Jameel-Noori-Nastaleeq': require('../assets/fonts/Jameel-Noori-Nastaleeq-Regular.ttf'),
    'NotoKufi-Arabic': require('../assets/fonts/NotoKufi-Arabic-Variable-Font.ttf'),
  });

  const [appReady, setAppReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded) {
          // Fade in animation for logo and text
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
          
          // Start progress animation
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }).start();

          // Simulate loading progress
          let interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 1) {
                clearInterval(interval);
                return 1;
              }
              return prev + 0.02;
            });
          }, 30);

          // Wait for fonts and a minimum duration
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Once everything is ready, hide the splash screen
          await SplashScreen.hideAsync();
          
          setAppReady(true);
          clearInterval(interval);
        }
      } catch (e) {
        console.warn('Error in prepare:', e);
        setAppReady(true);
      }
    }

    prepare();
  }, [fontsLoaded]);

  // This value is used by <Animated.View> for the width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7],
  });

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
                <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                  <Image
                    source={require('../assets/logo/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </Animated.View>
                
                <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
                  Welcome to Duaon AI
                </Animated.Text>
                
                <Animated.Text style={[styles.subtitleText, { opacity: fadeAnim }]}>
                  Your Daily Islamic Companion
                </Animated.Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progress, 
                        { width: progressWidth }
                      ]} 
                    />
                  </View>
                </View>
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
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#9B9B9B',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    width: width * 0.7,
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  progress: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  }
});
