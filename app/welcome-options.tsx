import React, { useEffect, useState } from 'react';
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
  const [stars, setStars] = useState<Array<{ id: number, x: number, y: number, size: number, opacity: number }>>([]);
  
  // Generate random stars
  useEffect(() => {
    const generatedStars = [];
    const numStars = 30;
    
    for (let i = 0; i < numStars; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    
    setStars(generatedStars);
  }, []);

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleGoogleSignup = () => {
    // Implement Google signup logic here
    console.log('Google signup');
  };

  const handleEmailSignup = () => {
    router.push('/login');
  };

  return (
    <LinearGradient
      colors={['#1A1B4B', '#2E0854', '#0C0522']}
      style={styles.container}
    >
      {/* Stars background */}
      <Svg width={width} height={height} style={styles.starsBackground}>
        {stars.map(star => (
          <Star 
            key={star.id} 
            x={star.x} 
            y={star.y} 
            size={star.size} 
            opacity={star.opacity} 
          />
        ))}
      </Svg>
      
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
            Access authentic duas, prayer times, and personalized Islamic content 
            to enhance your spiritual journey.
          </Text>
          
          <View style={styles.buttonsContainer}>
            <Text style={styles.signupText}>Sign up to sync your data across devices</Text>
            
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailSignup}
            >
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topTextContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    top: height * 0.08,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: height * 0.3,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  bottomContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 40,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
    opacity: 0.9,
  },
  descriptionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  signupText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    opacity: 0.8,
  },
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    width: '90%',
    gap: 10,
  },
  googleButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },
  emailButton: {
    backgroundColor: '#5f3dc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    width: '90%',
    gap: 10,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
});