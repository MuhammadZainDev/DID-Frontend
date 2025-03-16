import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 100, 
  color = '#0E8A3E' 
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer circle */}
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        
        {/* Inner circle */}
        <Circle
          cx="50"
          cy="50"
          r="40"
          stroke={color}
          strokeWidth="1"
          fill="none"
        />
        
        {/* Crescent */}
        <Path
          d="M50 20C36.2 20 25 31.2 25 45c0 13.8 11.2 25 25 25 3.8 0 7.4-0.8 10.6-2.3C52.4 72.2 45 64.8 45 55c0-9.8 7.4-17.2 15.6-17.7-3.2-1.5-6.8-2.3-10.6-2.3z"
          fill={color}
        />
        
        {/* Star */}
        <Path
          d="M70 45l-3.5 3.5L63 45l3.5-3.5L70 45zm-3.5 0l1.8-1.8-1.8-1.7-1.7 1.7 1.7 1.8z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default Logo; 