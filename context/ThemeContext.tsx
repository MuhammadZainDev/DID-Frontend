import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme type
type ThemeColorKey = 'green' | 'blue' | 'purple';

type ThemeColorData = {
  primary: string;
  header: string;
  track: string;
  name: string;
};

// Define the theme colors
export const themeColors: Record<ThemeColorKey, ThemeColorData> = {
  green: {
    primary: '#4CAF50',
    header: '#1A7F4B',
    track: '#388E3C',
    name: 'Green'
  },
  blue: {
    primary: '#2196F3',
    header: '#1976D2',
    track: '#1565C0',
    name: 'Blue'
  },
  purple: {
    primary: '#9C27B0',
    header: '#7B1FA2',
    track: '#6A1B9A',
    name: 'Purple'
  }
};

type ThemeContextType = {
  theme: ThemeColorKey;
  colors: ThemeColorData;
  setTheme: (theme: ThemeColorKey) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'green',
  colors: themeColors.green,
  setTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeColorKey>('green');
  
  useEffect(() => {
    // Load saved theme on mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme && savedTheme in themeColors) {
          setThemeState(savedTheme as ThemeColorKey);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  const setTheme = async (newTheme: ThemeColorKey) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: themeColors[theme],
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 