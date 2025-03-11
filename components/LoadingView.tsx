import React from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingViewProps {
  visible: boolean;
  message?: string;
}

export default function LoadingView({ visible, message = 'Loading...' }: LoadingViewProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  text: {
    marginTop: 10,
    color: '#333333',
    fontSize: 16,
  },
}); 