import React, { useState, useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView, Platform, Clipboard, Animated, Share, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DuaResponse } from '@/services/geminiService';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { captureRef } from 'react-native-view-shot';

interface DuaModalProps {
  visible: boolean;
  dua: DuaResponse | null;
  onClose: () => void;
}

export default function DuaModal({ visible, dua, onClose }: DuaModalProps) {
  const { colors } = useTheme();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const viewShotRef = useRef<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  if (!dua) return null;
  
  const copyToClipboard = () => {
    const textToCopy = `${dua.arabic_text}\n\n${dua.english_translation}\n\n${dua.urdu_translation ? dua.urdu_translation + '\n\n' : ''}Reference: ${dua.reference}`;
    
    Clipboard.setString(textToCopy);
    
    // Show custom toast
    setToastMessage("Dua copied to clipboard");
    setShowToast(true);
    
    // Animate toast in
    slideAnim.setValue(50);
    fadeAnim.setValue(0);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Hide toast after 2 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowToast(false);
      });
    }, 2000);
  };

  const handleShare = async () => {
    try {
      // Set sharing mode to hide UI elements
      setIsSharing(true);
      
      // Small delay to ensure state update has been rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the dua card as an image
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: "jpg",
          quality: 0.9,
          result: "data-uri"
        });
        
        // Turn off sharing mode to restore UI
        setIsSharing(false);
        
        if (uri) {
          // Share the captured image
          const result = await Share.share({
            title: dua.title,
            message: `${dua.title} - Shared from Duaon AI`,
            url: uri,
          });
          
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              console.log('Shared with activity type:', result.activityType);
            } else {
              console.log('Shared successfully');
            }
          } else if (result.action === Share.dismissedAction) {
            console.log('Share dismissed');
          }
        }
      }
    } catch (error) {
      // Ensure UI is restored even if an error occurs
      setIsSharing(false);
      console.error('Error sharing dua:', error);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {!isSharing && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={onClose}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            
            <View 
              style={[
                styles.duaCardContainer,
                isSharing && { borderRadius: 0 }
              ]}
              ref={viewShotRef}
            >
              <LinearGradient
                colors={['#202020', '#141414']}
                style={[styles.duaCard, isSharing && { borderRadius: 0 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.duaHeader}>
                  <ThemedText style={styles.duaTitle}>{dua.title}</ThemedText>
                </View>
                
                <View style={[
                  styles.arabicContainer,
                  isSharing && { borderRadius: 0 }
                ]}>
                  <ThemedText style={styles.arabicText}>{dua.arabic_text}</ThemedText>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.translationContainer}>
                  <ThemedText style={styles.translationText}>{dua.english_translation}</ThemedText>
                  <View style={styles.translationDivider} />
                  <ThemedText style={[styles.translationText, styles.urduText]}>
                    {dua.urdu_translation}
                  </ThemedText>
                </View>
                
                <View style={styles.referenceContainer}>
                  <ThemedText style={styles.referenceText}>Reference: {dua.reference}</ThemedText>
                </View>
                
                {dua.note && (
                  <View style={[
                    styles.noteContainer,
                    isSharing && { borderRadius: 0, borderLeftWidth: 0 }
                  ]}>
                    <ThemedText style={styles.noteTitle}>Note</ThemedText>
                    <ThemedText style={styles.noteText}>{dua.note}</ThemedText>
                  </View>
                )}
                
                {!isSharing && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { marginRight: 16 }]}
                      onPress={copyToClipboard}
                    >
                      <Ionicons name="copy-outline" size={20} color="#E0E0E0" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={handleShare}
                    >
                      <Ionicons name="share-social-outline" size={20} color="#E0E0E0" />
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            </View>
          </ScrollView>
          
          {showToast && (
            <Animated.View 
              style={[
                styles.toast, 
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: colors.primary
                }
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          )}
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
    width: '100%',
    height: '100%',
    backgroundColor: '#121212',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'ios' ? 50 : 25,
    marginLeft: 15,
    marginBottom: 15,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  duaCardContainer: {
    marginBottom: 24,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  duaCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  duaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arabicContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginVertical: 8,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  arabicText: {
    fontSize: 28,
    lineHeight: 46,
    textAlign: 'center',
    color: '#E0E0E0',
    fontFamily: Platform.OS === 'ios' ? 'NotoKufi-Arabic' : 'NotoKufi-Arabic',
    writingDirection: 'rtl',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  translationContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#EEEEEE',
  },
  urduText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translationDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 16,
  },
  referenceContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  referenceText: {
    fontSize: 14,
    color: 'rgba(200, 200, 200, 0.6)',
    fontStyle: 'italic',
  },
  noteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#FFC107',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#EEEEEE',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingRight: 8,
  },
  actionButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  }
}); 