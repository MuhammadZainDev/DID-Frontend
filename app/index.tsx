import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { checkIfFirstLaunch } from '../utils/storage';

export default function Index() {
  // This screen will redirect to the welcome screen
  return <Redirect href="/welcome" />;
} 