import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Platform, 
  StatusBar, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Animated,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@/config/constants';

export default function ContactUsScreen() {
  const router = useRouter();
  const { language, translations } = useLanguage();
  const { theme, colors } = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const popupAnimation = useRef(new Animated.Value(0)).current;
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (showSuccessPopup) {
      Animated.sequence([
        Animated.timing(popupAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(popupAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowSuccessPopup(false);
        // Navigate to home screen after animation completes
        router.push('/');
      });
    }
  }, [showSuccessPopup]);

  const goBack = () => {
    router.back();
  };

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    } else if (message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear form
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        // Show success popup
        setShowSuccessPopup(true);
      } else {
        Alert.alert('Error', data.message || 'Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to server. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Popup Component
  const SuccessPopup = () => {
    const translateY = popupAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    });

    const opacity = popupAnimation;

    return (
      <Animated.View 
        style={[
          styles.successPopup, 
          { 
            transform: [{ translateY }],
            opacity,
          }
        ]}
      >
        <View style={[styles.successPopupContent, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={styles.successPopupText}>Thank you! Your message has been sent.</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.header} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Settings</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 70 }} />
      </View>

      {showSuccessPopup && <SuccessPopup />}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.introSection}>
              <Ionicons name="mail" size={48} color={colors.primary} style={styles.mailIcon} />
              <Text style={styles.introTitle}>Get In Touch</Text>
              <Text style={styles.introText}>
                Have questions, suggestions, or feedback? We'd love to hear from you.
                Fill out the form below and we'll get back to you as soon as possible.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="What is this regarding?"
                placeholderTextColor="#888"
                value={subject}
                onChangeText={setSubject}
              />
              {errors.subject ? <Text style={styles.errorText}>{errors.subject}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Your message here..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
              {errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                isSubmitting && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Send Message</Text>
              )}
            </TouchableOpacity>

            <View style={styles.directContactContainer}>
              <Text style={styles.directContactTitle}>Or reach us directly:</Text>
              
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={22} color={colors.primary} />
                <Text style={styles.contactText}>duaonai.official@gmail.com</Text>
              </View>
              
              <View style={styles.contactItem}>
                <Ionicons name="logo-twitter" size={22} color={colors.primary} />
                <Text style={styles.contactText}>@DuaonApp</Text>
              </View>
              
              <View style={styles.contactItem}>
                <Ionicons name="globe-outline" size={22} color={colors.primary} />
                <Text style={styles.contactText}>www.duaon.com</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 54,
    paddingBottom: 16,
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 54 : 100,
    width: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: 20,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mailIcon: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    color: '#DDDDDD',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    backgroundColor: '#1E1E1E',
    minHeight: 120,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    height: 54,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  directContactContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  directContactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#EEEEEE',
  },
  successPopup: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 120 : 160,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  successPopupContent: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  successPopupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
}); 