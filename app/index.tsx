import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { checkIfFirstLaunch } from '../utils/storage';

type RouteType = '/welcome' | '/(tabs)' | null;

export default function Index() {
  const [route, setRoute] = useState<RouteType>(null);

  useEffect(() => {
    async function checkRoute() {
      try {
        const isFirst = await checkIfFirstLaunch();
        console.log('First launch check in index:', isFirst);
        setRoute(isFirst ? '/welcome' : '/(tabs)');
      } catch (error) {
        console.error('Error in index first launch check:', error);
        setRoute('/(tabs)'); // Default to tabs on error
      }
    }

    checkRoute();
  }, []);

  // Show nothing while checking
  if (!route) {
    return <View />;
  }

  // Redirect once we have the route
  return <Redirect href={route} />;
} 