import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';

interface CornerBordersProps {
  color?: string;
  size?: number;
  style?: any;
}

/**
 * CornerBorders component adds elegant Islamic-style decorative corners to any container
 */
export function CornerBorders({ color = '#4CAF50', size = 30, style }: CornerBordersProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Top Left Corner */}
      <View style={[styles.corner, styles.topLeft]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <G>
            <Path
              d="M0 0 L12 0 Q6 0 6 6 L6 12 Q6 6 0 6 Z"
              fill="transparent"
              stroke={color}
              strokeWidth={1.2}
            />
            <Circle cx="4" cy="4" r="1" fill={color} />
          </G>
        </Svg>
      </View>

      {/* Top Right Corner */}
      <View style={[styles.corner, styles.topRight]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <G>
            <Path
              d="M24 0 L12 0 Q18 0 18 6 L18 12 Q18 6 24 6 Z"
              fill="transparent"
              stroke={color}
              strokeWidth={1.2}
            />
            <Circle cx="20" cy="4" r="1" fill={color} />
          </G>
        </Svg>
      </View>

      {/* Bottom Left Corner */}
      <View style={[styles.corner, styles.bottomLeft]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <G>
            <Path
              d="M0 24 L12 24 Q6 24 6 18 L6 12 Q6 18 0 18 Z"
              fill="transparent"
              stroke={color}
              strokeWidth={1.2}
            />
            <Circle cx="4" cy="20" r="1" fill={color} />
          </G>
        </Svg>
      </View>

      {/* Bottom Right Corner */}
      <View style={[styles.corner, styles.bottomRight]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <G>
            <Path
              d="M24 24 L12 24 Q18 24 18 18 L18 12 Q18 18 24 18 Z"
              fill="transparent"
              stroke={color}
              strokeWidth={1.2}
            />
            <Circle cx="20" cy="20" r="1" fill={color} />
          </G>
        </Svg>
      </View>
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
    zIndex: 1,
    pointerEvents: 'none',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  topLeft: {
    top: -2,
    left: -2,
  },
  topRight: {
    top: -2,
    right: -2,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
  },
}); 