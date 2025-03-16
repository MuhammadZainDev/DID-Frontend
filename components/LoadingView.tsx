import React from 'react';
import { Modal, View, StyleSheet, Image } from 'react-native';

interface LoadingViewProps {
  visible: boolean;
  message?: string;
}

export default function LoadingView({ visible }: LoadingViewProps) {
  if (!visible) return null;
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Image 
          source={require('../assets/GIF/gemeni.gif')}
          style={styles.gifLoader}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifLoader: {
    width: 100,
    height: 100,
  },
}); 