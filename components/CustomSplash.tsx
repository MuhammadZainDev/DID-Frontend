import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function CustomSplash() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = React.useRef(new Animated.Value(0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start animations with sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        })
      ]),
      // After logo animation, fade in the text
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Then start the glow pulsing
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      )
    ]).start();

    // Simulate loading progress
    let interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.01;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const progressWidth = width * 0.7 * progress;

  return (
    <LinearGradient
      colors={['#121212', '#1e1e1e', '#2a2a2a']}
      locations={[0.1, 0.6, 1.0]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Logo with glow effect */}
      <View style={styles.logoWrapper}>
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Svg height={width * 0.7} width={width * 0.7} style={styles.glow}>
            <Defs>
              <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={width * 0.7}
              height={width * 0.7}
              fill="url(#grad)"
              rx={width * 0.35}
              ry={width * 0.35}
            />
          </Svg>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Image
            source={require('../assets/logo/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.Text 
        style={[
          styles.welcomeText,
          { opacity: textFadeAnim }
        ]}
      >
        Welcome to Duaon AI
      </Animated.Text>
      
      <Animated.Text 
        style={[
          styles.subtitleText,
          { opacity: textFadeAnim }
        ]}
      >
        Your Daily Islamic Companion
      </Animated.Text>
      
      {/* Progress indicator */}
      <Animated.View 
        style={[
          styles.progressContainer,
          { opacity: textFadeAnim }
        ]}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
  },
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitleText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9B9B9B',
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    width: width * 0.7,
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  progress: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  }
}); 