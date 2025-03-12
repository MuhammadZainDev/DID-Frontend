import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface Star {
  key: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  blinkSpeed: number;
  blinkDelay: number;
}

const createStarPath = (x: number, y: number, size: number, rotation: number) => {
  const points = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  let path = `M ${x} ${y - outerRadius} `;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2 + rotation;
    const nextX = x + radius * Math.cos(angle);
    const nextY = y + radius * Math.sin(angle);
    path += `L ${nextX} ${nextY} `;
  }

  path += 'Z';
  return path;
};

export default function CustomSplash() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const [time, setTime] = useState(0);

  // Generate stars with better distribution across the entire screen
  const stars = useMemo(() => {
    const starsArray: Star[] = [];
    const numStars = 70;
    
    const canvasWidth = width;
    const canvasHeight = height * 0.8;
    
    const gridCellsX = 10;
    const gridCellsY = 15;
    const cellWidth = canvasWidth / gridCellsX;
    const cellHeight = canvasHeight / gridCellsY;
    
    for (let i = 0; i < numStars; i++) {
      const gridX = Math.floor(Math.random() * gridCellsX);
      const gridY = Math.floor(Math.random() * gridCellsY);
      
      const offsetX = Math.random() * cellWidth * 0.8;
      const offsetY = Math.random() * cellHeight * 0.8;
      
      const x = gridX * cellWidth + offsetX + cellWidth * 0.1;
      const y = gridY * cellHeight + offsetY + cellHeight * 0.1;
      
      let starSize;
      const sizeRandom = Math.random();
      if (sizeRandom > 0.9) {
        starSize = Math.random() * 2 + 3;
      } else if (sizeRandom > 0.6) {
        starSize = Math.random() * 1.5 + 2;
      } else {
        starSize = Math.random() * 0.8 + 0.8;
      }
      
      const shouldBlink = Math.random() < 0.4;
      
      let blinkSpeed;
      if (shouldBlink) {
        if (starSize < 1.5) {
          blinkSpeed = Math.random() * 0.3 + 0.1; // Slower for small stars
        } else {
          blinkSpeed = Math.random() * 0.5 + 0.3; // Faster for larger stars
        }
      } else {
        blinkSpeed = 0;
      }
      
      starsArray.push({
        key: `star-${i}`,
        x,
        y,
        size: starSize,
        rotation: Math.random() * Math.PI * 2,
        blinkSpeed,
        blinkDelay: Math.random() * Math.PI * 2,
      });
    }
    
    return starsArray;
  }, []);

  useEffect(() => {
    // Start animations immediately when component mounts
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
    ]).start();

    // Animation loop for stars
    const interval = setInterval(() => {
      setTime(t => t + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getStarOpacity = (star: Star) => {
    if (star.blinkSpeed === 0) return 0.8;
    return 0.3 + Math.abs(Math.sin((time * star.blinkSpeed) + star.blinkDelay)) * 0.7;
  };

  return (
    <LinearGradient
      colors={['#1A1B4B', '#2E0854', '#0C0522']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Svg width={width} height={height} style={styles.starsContainer}>
        {stars.map((star) => (
          <Path
            key={star.key}
            d={createStarPath(star.x, star.y, star.size, star.rotation)}
            fill="white"
            opacity={getStarOpacity(star)}
          />
        ))}
      </Svg>
      
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
}); 