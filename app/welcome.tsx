import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Simple star SVG component
const Star = ({ x, y, size, opacity }: { x: number, y: number, size: number, opacity: number }) => (
  <Path
    d={`M ${x} ${y-size} L ${x+size/4} ${y-size/4} L ${x+size} ${y} L ${x+size/4} ${y+size/4} L ${x} ${y+size} L ${x-size/4} ${y+size/4} L ${x-size} ${y} L ${x-size/4} ${y-size/4} Z`}
    fill="white"
    opacity={opacity}
  />
);

export default function WelcomeScreen() {
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

  // Prevent auto-navigation when this screen regains focus
  useFocusEffect(
    useCallback(() => {
      // This prevents any potential auto-navigation when the screen regains focus
      console.log('Welcome screen focused');
      
      // Cleanup function that runs when screen loses focus
      return () => {
        console.log('Welcome screen lost focus');
      };
    }, [])
  );
  
  const handleContinue = () => {
    router.push('/welcome-options');
  };

  // Use navigate instead of push for more straightforward navigation
  const handlePolicyPress = () => {
    console.log('Navigating to privacy policy from welcome');
    router.navigate('/(policy)/privacy');
  };

  const handleDisclaimerPress = () => {
    console.log('Navigating to disclaimer from welcome');
    router.navigate('/(policy)/disclaimer');
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
        {/* Logo in center */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Bottom section with buttons */}
        <View style={styles.bottomContainer}>
          <Text style={styles.termsText}>
            By tapping Continue you agree to our
          </Text>
          
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handlePolicyPress}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
            
            <Text style={styles.termsText}> / </Text>
            
            <TouchableOpacity onPress={handleDisclaimerPress}>
              <Text style={styles.linkText}>Disclaimer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
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
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 40,
  },
  termsText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 25,
  },
  linkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  continueButton: {
    backgroundColor: '#5f3dc4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 3,
    width: '80%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 