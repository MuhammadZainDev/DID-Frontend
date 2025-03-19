import React from 'react';
import { View, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DevResetButton = () => {
  // Only show in development mode (__DEV__ is true in Expo development)
  if (!__DEV__) return null;

  const resetFirstLaunch = async () => {
    try {
      // First try the most common key names for first launch
      await AsyncStorage.removeItem('firstLaunch');
      await AsyncStorage.removeItem('isFirstLaunch');
      await AsyncStorage.removeItem('hasLaunched');
      await AsyncStorage.removeItem('firstRun');
      await AsyncStorage.removeItem('appLaunched');
      await AsyncStorage.removeItem('onboarded');
      
      // Also clear the welcome screen keys
      await AsyncStorage.removeItem('hasShownWelcome');
      await AsyncStorage.removeItem('welcomeCompleted');
      
      // Print all keys for debugging
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', allKeys);
      
      Alert.alert(
        'Dev Reset', 
        'First launch state has been reset! Please restart the app.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error resetting first launch:', error);
      Alert.alert('Error', 'Failed to reset first launch state');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={resetFirstLaunch}
      >
        <Text style={styles.buttonText}>Reset First Launch (DEV)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  }
}); 