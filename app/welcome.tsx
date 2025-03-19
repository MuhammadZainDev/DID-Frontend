import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  
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
    <View style={styles.container}>
      {/* Solid background instead of gradients */}
      <View style={styles.solidBackground} />
      
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#1A7F4B',
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