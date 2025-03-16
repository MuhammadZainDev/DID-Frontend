import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Text as SvgText, Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WelcomeLogoProps {
  size?: number;
}

interface Star {
  key: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  blinkSpeed: number;
  delay: number;
  rotation: number;
  shouldBlink: boolean;
}

// Function to create a sparkle star path (four-pointed star)
const createStarPath = (cx: number, cy: number, size: number, rotation: number): string => {
  // Create a four-pointed sparkle star
  const longPoint = size;
  const shortPoint = size * 0.3; // Much shorter secondary points for sparkle effect
  
  // Calculate points with rotation
  const p1x = cx + longPoint * Math.cos(rotation);
  const p1y = cy + longPoint * Math.sin(rotation);
  
  const p2x = cx + shortPoint * Math.cos(rotation + Math.PI/4);
  const p2y = cy + shortPoint * Math.sin(rotation + Math.PI/4);
  
  const p3x = cx + longPoint * Math.cos(rotation + Math.PI/2);
  const p3y = cy + longPoint * Math.sin(rotation + Math.PI/2);
  
  const p4x = cx + shortPoint * Math.cos(rotation + 3*Math.PI/4);
  const p4y = cy + shortPoint * Math.sin(rotation + 3*Math.PI/4);
  
  const p5x = cx + longPoint * Math.cos(rotation + Math.PI);
  const p5y = cy + longPoint * Math.sin(rotation + Math.PI);
  
  const p6x = cx + shortPoint * Math.cos(rotation + 5*Math.PI/4);
  const p6y = cy + shortPoint * Math.sin(rotation + 5*Math.PI/4);
  
  const p7x = cx + longPoint * Math.cos(rotation + 3*Math.PI/2);
  const p7y = cy + longPoint * Math.sin(rotation + 3*Math.PI/2);
  
  const p8x = cx + shortPoint * Math.cos(rotation + 7*Math.PI/4);
  const p8y = cy + shortPoint * Math.sin(rotation + 7*Math.PI/4);
  
  // Create the star path
  return `M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y} L ${p4x} ${p4y} L ${p5x} ${p5y} L ${p6x} ${p6y} L ${p7x} ${p7y} L ${p8x} ${p8y} Z`;
};

export default function WelcomeLogo({ size = 200 }: WelcomeLogoProps) {
  const [time, setTime] = useState(0);
  
  // Generate stars with better distribution across the entire screen
  const stars = useMemo(() => {
    const starsArray: Star[] = [];
    // More stars for better effect
    const numStars = 70;
    
    // Use the screen dimensions for star placement
    const canvasWidth = screenWidth;
    const canvasHeight = screenHeight * 0.8; // Top 80% of screen
    
    // Create a grid to ensure better distribution
    const gridCellsX = 10;
    const gridCellsY = 15; // More cells vertically
    const cellWidth = canvasWidth / gridCellsX;
    const cellHeight = canvasHeight / gridCellsY;
    
    for (let i = 0; i < numStars; i++) {
      // Place stars in random cells of the grid to ensure distribution
      const gridX = Math.floor(Math.random() * gridCellsX);
      // Only use the top portion of the screen
      const gridY = Math.floor(Math.random() * gridCellsY);
      
      // Add some randomization within the cell
      const offsetX = Math.random() * cellWidth * 0.8;
      const offsetY = Math.random() * cellHeight * 0.8;
      
      // Final star coordinates
      const x = gridX * cellWidth + offsetX + cellWidth * 0.1;
      const y = gridY * cellHeight + offsetY + cellHeight * 0.1;
      
      // Much smaller stars for sparkle effect - overall smaller than before
      let starSize;
      const sizeRandom = Math.random();
      if (sizeRandom > 0.9) {
        // 10% larger stars (but still relatively small)
        starSize = Math.random() * 2 + 3;
      } else if (sizeRandom > 0.6) {
        // 30% medium stars
        starSize = Math.random() * 1.5 + 2;
      } else {
        // 60% small stars
        starSize = Math.random() * 0.8 + 0.8;
      }
      
      // Only about 40% of stars should blink
      const shouldBlink = Math.random() < 0.4;
      
      // Set blinking properties - different speed and delay for each star
      // Smaller stars should blink more slowly
      let blinkSpeed;
      if (starSize < 1.5) {
        // Slower blinking for small stars
        blinkSpeed = Math.random() * 0.015 + 0.005;
      } else if (starSize < 2.5) {
        // Medium blinking for medium stars
        blinkSpeed = Math.random() * 0.025 + 0.01;
      } else {
        // Faster blinking for larger stars
        blinkSpeed = Math.random() * 0.04 + 0.02;
      }
      
      const delay = Math.random() * 2 * Math.PI; // Random phase offset
      
      // Random rotation for each star
      const rotation = Math.random() * Math.PI/4;
      
      starsArray.push({
        key: i,
        x,
        y,
        size: starSize,
        opacity: 0.8,
        blinkSpeed,
        delay,
        rotation,
        shouldBlink
      });
    }
    
    return starsArray;
  }, []);
  
  // Animation loop for stars blinking - slower update for subtler effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.05);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate current opacity for each star based on its blinking speed and delay
  const getStarOpacity = (star: Star) => {
    // If the star shouldn't blink, return its base opacity
    if (!star.shouldBlink) {
      return star.opacity;
    }
    
    const sinVal = Math.sin(time * star.blinkSpeed + star.delay);
    // Transform the sin value to oscillate for sparkle effect
    return 0.3 + (sinVal + 1) * 0.35; // Subtler blinking range
  };

  return (
    <View style={[styles.container, { width: screenWidth, height: screenHeight }]}>
      <Svg width={screenWidth} height={screenHeight} viewBox={`0 0 ${screenWidth} ${screenHeight}`}>
        {/* Galaxy stars with blinking effect */}
        {stars.map((star) => (
          <Path
            key={star.key}
            d={createStarPath(star.x, star.y, star.size, star.rotation)}
            fill="white"
            opacity={getStarOpacity(star)}
          />
        ))}
        
        {/* Arabic text "اسلام" */}
        <SvgText
          x={screenWidth / 2}
          y={screenHeight / 2 - 20}
          fontSize="40"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          fontFamily="NotoKufi-Arabic"
        >
          اسلام
        </SvgText>
        
        {/* "360" text */}
        <SvgText
          x={screenWidth / 2}
          y={screenHeight / 2 + 40}
          fontSize="48"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          360
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0
  }
}); 