import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StatusBarStyle } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { checkIfFirstLaunch } from '../utils/storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Jameel-Noori-Nastaleeq': require('../assets/fonts/Jameel-Noori-Nastaleeq-Regular.ttf'),
    'NotoKufi-Arabic': require('../assets/fonts/NotoKufi-Arabic-Variable-Font.ttf'),
  });
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();
  
  // Add a ref to track if initial navigation has been performed
  const hasNavigated = useRef(false);

  useEffect(() => {
    console.log('Checking if first launch...');
    const checkFirstLaunch = async () => {
      try {
        const isFirstLaunch = await checkIfFirstLaunch();
        console.log('Is first launch?', isFirstLaunch);
        
        if (isFirstLaunch) {
          console.log('Setting initial route to welcome');
          setInitialRoute('/welcome');
        } else {
          console.log('Setting initial route to tabs');
          setInitialRoute('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setInitialRoute('/(tabs)'); // Default to tabs in case of error
      }
    };

    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (loaded && initialRoute && !hasNavigated.current) {
      console.log('Fonts loaded and initialRoute set:', initialRoute);
      SplashScreen.hideAsync();
      
      // Check if we're already in a policy page
      const isInPolicyGroup = segments.some(segment => segment.includes('policy'));
      
      if (isInPolicyGroup) {
        console.log('Already in policy group, not redirecting to welcome');
        return;
      }
      
      // Force navigation to welcome for testing - ONLY ONCE
      if (initialRoute === '/welcome') {
        console.log('Navigating to welcome screen');
        hasNavigated.current = true; // Mark as navigated
        // Add a slight delay to ensure navigation happens after render
        setTimeout(() => {
          router.replace(initialRoute as any);
        }, 100);
      }
      // Navigate to initial route if current route is the root - ONLY ONCE
      else if (segments[0] === undefined || segments.length < 1) {
        console.log('Navigating to initial route:', initialRoute);
        hasNavigated.current = true; // Mark as navigated
        router.replace(initialRoute as any);
      }
    }
  }, [loaded, initialRoute, segments, router]);

  if (!loaded || !initialRoute) {
    return null;
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'white' },
            animation: 'fade_from_bottom',
            presentation: 'fullScreenModal',
            animationDuration: 200,
          }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="dua" options={{ headerShown: false }} />
            <Stack.Screen name="subcategory" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="welcome-options" options={{ headerShown: false, gestureEnabled: false }} />
            
            {/* Policy group screens */}
            <Stack.Screen 
              name="(policy)" 
              options={{ 
                headerShown: false
              }} 
            />
            
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
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
