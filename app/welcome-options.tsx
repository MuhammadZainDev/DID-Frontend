import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Google logo SVG component
const GoogleLogo = () => (
  <Svg width={20} height={20} viewBox="-3 0 262 262" preserveAspectRatio="xMidYMid">
    <Path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/>
    <Path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/>
    <Path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/>
    <Path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/>
  </Svg>
);

// Simple star SVG component
const Star = ({ x, y, size, opacity }: { x: number, y: number, size: number, opacity: number }) => (
  <Path
    d={`M ${x} ${y-size} L ${x+size/4} ${y-size/4} L ${x+size} ${y} L ${x+size/4} ${y+size/4} L ${x} ${y+size} L ${x-size/4} ${y+size/4} L ${x-size} ${y} L ${x-size/4} ${y-size/4} Z`}
    fill="white"
    opacity={opacity}
  />
);

export default function WelcomeOptionsScreen() {
  const router = useRouter();

  const handleSkip = () => {
    router.replace('/(tabs)');
  };


  const handleEmailSignup = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      {/* Solid background instead of gradients */}
      <View style={styles.solidBackground} />
      
      <View style={styles.contentContainer}>
        {/* Welcome text at top */}
        <View style={styles.topTextContainer}>
          <Text style={styles.welcomeText}>Welcome to Duaon</Text>
          <Text style={styles.subtitleText}>Your complete guide to daily prayers</Text>
        </View>
        
        {/* Logo in center */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Content and buttons at bottom */}
        <View style={styles.bottomContent}>
          <Text style={styles.descriptionText}>
            Sign up to access all features including personalized recommendations and saving your favorite duas.
          </Text>
          
          
          <TouchableOpacity
            style={styles.emailButton}
            onPress={handleEmailSignup}
          >
            <View style={styles.emailButtonContent}>
              <Ionicons name="mail-outline" size={18} color="#FFFFFF" style={styles.emailIcon} />
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  solidBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTextContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#BBBBBB',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  bottomContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  descriptionText: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  googleButton: {
    backgroundColor: '#1A7F4B',
    borderRadius: 4,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 16,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  emailButton: {
    backgroundColor: '#1A7F4B',
    borderRadius: 4,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 24,
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIcon: {
    marginRight: 10,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#AAAAAA',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});