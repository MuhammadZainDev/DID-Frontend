import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function CustomButton({ 
  title, 
  variant = 'primary', 
  loading = false,
  style,
  textStyle,
  disabled,
  ...props 
}: CustomButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const buttonStyles = [
    styles.button,
    variant === 'primary' && {
      backgroundColor: colors.tint,
    },
    variant === 'secondary' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.tint,
    },
    disabled ? styles.disabledButton : null,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && {
      color: '#FFFFFF',
    },
    variant === 'secondary' && {
      color: colors.tint,
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : colors.tint} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 