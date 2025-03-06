import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
}

export function Logo({ size = 100, color = '#007AFF' }: LogoProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
        {/* Outer Circle */}
        <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="2" />
        
        {/* Stylized "D" for Dua */}
        <Path
          d="M35 25C35 25 45 25 55 25C65 25 75 35 75 50C75 65 65 75 55 75C45 75 35 75 35 75"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Prayer Hands Symbol */}
        <Path
          d="M45 40C45 40 50 35 55 40C60 45 55 55 55 55C55 55 50 45 45 40Z"
          fill={color}
        />
        <Path
          d="M55 40C55 40 50 35 45 40C40 45 45 55 45 55C45 55 50 45 55 40Z"
          fill={color}
        />
      </Svg>
    </View>
  );
} 