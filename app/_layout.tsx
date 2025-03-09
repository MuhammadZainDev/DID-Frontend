import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Jameel-Noori-Nastaleeq': require('../assets/fonts/Jameel-Noori-Nastaleeq-Regular.ttf'),
    'NotoKufi-Arabic': require('../assets/fonts/NotoKufi-Arabic-Variable-Font.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
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
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="dua" options={{ headerShown: false }} />
            <Stack.Screen name="subcategory" options={{ headerShown: false }} />
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
          <StatusBar style="dark" />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
