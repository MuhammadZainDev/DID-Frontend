import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserAvatarProps {
  name: string;
  size?: number;
}

export default function UserAvatar({ name, size = 32 }: UserAvatarProps) {
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      }
    ]}>
      <Text style={[
        styles.letter,
        {
          fontSize: size * 0.4,
        }
      ]}>
        {firstLetter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  letter: {
    color: '#0E8A3E',
    fontWeight: 'bold',
  },
}); 