import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DuaResponse } from '@/services/geminiService';

interface DuaModalProps {
  visible: boolean;
  dua: DuaResponse | null;
  onClose: () => void;
}

export default function DuaModal({ visible, dua, onClose }: DuaModalProps) {
  if (!dua) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{dua.title}</Text>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.arabicContainer}>
              <Text style={styles.arabicText}>{dua.arabic_text}</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Translation</Text>
            <Text style={styles.englishText}>{dua.english_translation}</Text>
            
            <Text style={styles.sectionTitle}>Urdu Translation</Text>
            <Text style={styles.urduText}>{dua.urdu_translation}</Text>
            
            <Text style={styles.sectionTitle}>Reference</Text>
            <Text style={styles.referenceText}>{dua.reference}</Text>
            
            {dua.note && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>Note</Text>
                <Text style={styles.noteText}>{dua.note}</Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#121212',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 12,
    backgroundColor: '#121212',
    borderBottomColor: '#222',
    borderBottomWidth: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 0,
    backgroundColor: '#121212',
  },
  arabicContainer: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    paddingVertical: 20,
  },
  arabicText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'right',
    lineHeight: 36,
    fontFamily: Platform.OS === 'ios' ? 'NotoKufi-Arabic' : 'NotoKufi-Arabic',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8BC34A',
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 16,
  },
  englishText: {
    fontSize: 14,
    color: '#CCCCCC',
    padding: 16,
    paddingTop: 5,
    lineHeight: 22,
  },
  urduText: {
    fontSize: 14,
    color: '#CCCCCC',
    padding: 16,
    paddingTop: 5,
    textAlign: 'right',
    lineHeight: 22,
  },
  referenceText: {
    fontSize: 13,
    color: '#999999',
    fontStyle: 'italic',
    padding: 16,
    paddingTop: 5,
  },
  noteContainer: {
    backgroundColor: '#1F1F1F',
    margin: 16,
    marginTop: 5,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#FFC107',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#333333',
    padding: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
}); 