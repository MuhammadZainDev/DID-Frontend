import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function DuasScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to categories screen
    router.replace('/subcategory');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0E8A3E" />
    </View>
  );
} 