import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function PolicyLayout() {
  useEffect(() => {
    console.log('Policy layout mounted - THIS IS KEY FOR NAVIGATION');
    
    // Return cleanup function
    return () => {
      console.log('Policy layout unmounted');
    };
  }, []);

  return (
    <Stack
      initialRouteName="privacy" // Set an initial route
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#1A1B4B' },
        // Prevent automatic redirects by disabling gesture navigation
        gestureEnabled: false,
        // Ensure the screen stays visible
        presentation: 'card',
        // Prevent automatic pushing of screens onto stack
        animationTypeForReplace: 'push',
        // Keep screens mounted to prevent navigation issues
        unmountOnBlur: false,
      }}
    >
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacy Policy',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="disclaimer"
        options={{
          title: 'Disclaimer',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
} 