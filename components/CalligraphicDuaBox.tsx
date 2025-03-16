import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

interface CalligraphicDuaBoxProps {
  totalDuas: number;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const boxWidth = width - 40; // 20px padding on each side

const CalligraphicDuaBox = ({ onPress }: CalligraphicDuaBoxProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.touchable} 
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Image
          source={require('../assets/img/dua.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: boxWidth,
    height: boxWidth * 0.56,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CalligraphicDuaBox; 