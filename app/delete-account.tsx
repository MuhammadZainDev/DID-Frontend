import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, logout, deleteAccount } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('warning');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  console.log("Delete Account Screen - User:", user ? `${user.name} (${user.email})` : "Not logged in");

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
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
    
    // Hide toast after appropriate time
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

  // Redirect if not logged in
  useEffect(() => {
    console.log("Delete Account Screen - Checking authentication");
    if (!user) {
      console.log("Delete Account Screen - No user, redirecting to login");
      
      // Show toast message before redirecting
      showToastMessage('You must be logged in to delete your account', 'warning');
      
      // Redirect after a delay to allow the toast to be seen
      setTimeout(() => {
        router.replace({
          pathname: '/login',
          params: { from: 'delete-account' }
        });
      }, 2000);
    } else {
      console.log("Delete Account Screen - User authenticated, prefilling email");
      // Pre-fill email if user is logged in
      setEmail(user.email || '');
    }
  }, [user]);

  const handleCancel = () => {
    router.back();
  };

  const handleDeleteAccount = async () => {
    if (!email) {
      setError('Please enter your email to confirm');
      return;
    }

    // Verify email matches current user
    if (email !== user?.email) {
      setError('Email address does not match your account');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');

      console.log("Delete Account Screen - Attempting to delete account");

      // Call the deleteAccount method from AuthContext
      await deleteAccount();
      
      console.log("Delete Account Screen - Account deleted successfully");

      // Send feedback about why they're deleting (if provided)
      if (reason.trim()) {
        console.log("Delete Account Screen - Sending deletion reason");
        await fetch('https://duaonai-backend-production.up.railway.app/api/contact/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: user?.name || 'User',
            email: user?.email || 'unknown@email.com',
            message: reason
          })
        });
      }
      
      // Navigate to a thank you screen or back to welcome
      console.log("Delete Account Screen - Redirecting to welcome screen");
      router.replace('/');
      
    } catch (error: any) {
      console.log("Delete Account Screen - Error:", error.message);
      setError(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.header} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Settings</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{width: 70}} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={80} color="#FF3B30" />
            </View>

            <Text style={styles.title}>Delete Your Account</Text>
            
            <Text style={styles.description}>
              This action is permanent and cannot be undone. All your data, including favorites and settings will be permanently deleted.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Reason for leaving (optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us why you're deleting your account..."
                placeholderTextColor="#999"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm with your email address</Text>
              <View style={styles.emailContainer}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showToast && (
        <Animated.View 
          style={[
            styles.toast, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: toastType === 'success' ? '#4CAF50' : 
                              toastType === 'error' ? '#FF3B30' : 
                              toastType === 'warning' ? '#FF9500' : 
                              colors.primary
            }
          ]}
        >
          <Ionicons 
            name={
              toastType === 'success' ? "checkmark-circle" : 
              toastType === 'error' ? "alert-circle" :
              toastType === 'warning' ? "warning" : 
              "information-circle"
            } 
            size={20} 
            color="white" 
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 54,
    paddingBottom: 16,
    height: Platform.OS === 'android' ? 100 : 100,
    backgroundColor: '#0E8A3E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
  },
  emailContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  emailInput: {
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#333333',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    marginLeft: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
}); 