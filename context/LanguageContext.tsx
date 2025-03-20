import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define available languages
export type Language = 'en' | 'ur';

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  translations: Record<string, string>;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const enTranslations = {
  // Common
  'app.name': 'Duaon AI',
  
  // Tab names
  'tab.home': 'Home',
  'tab.prayerTimes': 'Prayer Times',
  'tab.favorites': 'Favorites',
  'tab.settings': 'Settings',
  'tab.quran': 'Quran',
  'tab.duas': 'Duas',
  
  // Home Screen
  'home.search_placeholder': 'Find duas with AI guidance...',
  
  // Prayer Times
  'prayer.fajr': 'Fajr',
  'prayer.sunrise': 'Sunrise',
  'prayer.dhuhr': 'Dhuhr',
  'prayer.asr': 'Asr',
  'prayer.maghrib': 'Maghrib',
  'prayer.isha': 'Isha',
  'prayer.nextPrayer': 'Current Prayer',
  'prayer.remaining': 'remaining',
  'prayer.time': 'Prayer Time',
  'prayer.ending': 'Ending Soon',
  'prayer.beginning': 'Beginning Now',
  'prayer.ended': 'has ended',
  'prayer.started': 'has started',
  'prayer.error_loading': 'Error loading prayer times',
  
  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.theme': 'Theme',
  'settings.about': 'About',
  'settings.feedback': 'Send Feedback',
  'settings.rate': 'Rate App',
  'settings.share': 'Share App',
  'settings.version': 'Version',
  'settings.prayerSettings': 'Prayer Settings',
  'settings.appSettings': 'App Settings',
  'settings.location': 'Location',
  'settings.setLocation': 'Set your prayer location',
  'settings.calculationMethod': 'Calculation Method',
  'settings.darkMode': 'Dark Mode',
  'settings.off': 'Off',
  'settings.soundSettings': 'Sound Settings',
  'settings.aboutApp': 'About App',
  'settings.contactUs': 'Contact Us',
  
  // Language selection
  'language.english': 'English',
  'language.urdu': 'Urdu',
  'language.select': 'Select Language',
  
  // Favorites
  'favorites.title': 'Favorites',
  'favorites.empty': 'No favorites yet',
  'favorites.emptySubtext': 'Add prayers and duas to your favorites for quick access',
  'favorites.prayerTime': 'Prayer Time',
  
  // Categories
  'category.daily_worship': 'Daily Worship',
  'category.morning_evening': 'Morning & Evening',
  'category.home_family': 'Home & Family',
  'category.daily_activities': 'Daily Activities',
  'category.travel_journey': 'Travel & Journey',
  'category.forgiveness': 'Seeking Forgiveness',
  'category.protection': 'Protection',
  'category.health_wellbeing': 'Health & Wellbeing',
  'category.success_guidance': 'Success & Guidance',
  'category.food_sustenance': 'Food & Sustenance',
  'category.stress_anxiety': 'Stress & Anxiety',
  'category.sleep_wakeup': 'Sleep & Wake up',
  'category.knowledge_study': 'Knowledge & Study',
  'category.marriage_relationship': 'Marriage & Relations',
  'category.work_business': 'Work & Business',
  'category.difficult_times': 'Difficult Times',
  'category.quran_dhikr': 'Quran & Dhikr',
  'category.entering_leaving': 'Entering & Leaving',
  'category.morning_adhkar': 'Morning Adhkar',
  'category.evening_adhkar': 'Evening Adhkar',
};

// Urdu translations
const urTranslations = {
  // Common
  'app.name': 'روزانہ اسلامی دعا',
  
  // Tab names
  'tab.home': 'ہوم',
  'tab.prayerTimes': 'نماز کے اوقات',
  'tab.favorites': 'پسندیدہ',
  'tab.settings': 'ترتیبات',
  'tab.quran': 'قرآن',
  'tab.duas': 'دعائیں',
  
  // Home Screen
  'home.search_placeholder': 'دعائیں تلاش کریں...',
  
  // Prayer Times
  'prayer.fajr': 'فجر',
  'prayer.sunrise': 'طلوع آفتاب',
  'prayer.dhuhr': 'ظہر',
  'prayer.asr': 'عصر',
  'prayer.maghrib': 'مغرب',
  'prayer.isha': 'عشاء',
  'prayer.nextPrayer': 'موجودہ نماز',
  'prayer.remaining': 'باقی ہے',
  'prayer.time': 'نماز کا وقت',
  'prayer.ending': 'ختم ہونے والا ہے',
  'prayer.beginning': 'شروع ہو رہا ہے',
  'prayer.ended': 'ختم ہو گیا ہے',
  'prayer.started': 'شروع ہو گیا ہے',
  'prayer.error_loading': 'نماز کے اوقات لوڈ کرنے میں خرابی',
  
  // Settings
  'settings.title': 'ترتیبات',
  'settings.language': 'زبان',
  'settings.theme': 'تھیم',
  'settings.about': 'ہمارے بارے میں',
  'settings.feedback': 'رائے بھیجیں',
  'settings.rate': 'ایپ کو ریٹ کریں',
  'settings.share': 'ایپ شیئر کریں',
  'settings.version': 'ورژن',
  'settings.prayerSettings': 'نماز کی ترتیبات',
  'settings.appSettings': 'ایپ کی ترتیبات',
  'settings.location': 'مقام',
  'settings.setLocation': 'اپنا نماز کا مقام سیٹ کریں',
  'settings.calculationMethod': 'حساب کا طریقہ',
  'settings.darkMode': 'ڈارک موڈ',
  'settings.off': 'آف',
  'settings.soundSettings': 'آواز کی ترتیبات',
  'settings.aboutApp': 'ایپ کے بارے میں',
  'settings.contactUs': 'ہم سے رابطہ کریں',
  
  // Language selection
  'language.english': 'انگریزی',
  'language.urdu': 'اردو',
  'language.select': 'زبان منتخب کریں',
  
  // Favorites
  'favorites.title': 'پسندیدہ',
  'favorites.empty': 'ابھی تک کوئی پسندیدہ نہیں',
  'favorites.emptySubtext': 'فوری رسائی کے لیے نمازوں اور دعاؤں کو اپنی پسندیدہ میں شامل کریں',
  'favorites.prayerTime': 'نماز کا وقت',
  
  // Categories
  'category.daily_worship': 'روزانہ عبادت',
  'category.morning_evening': 'صبح و شام',
  'category.home_family': 'گھر اور خاندان',
  'category.daily_activities': 'روزمرہ کی سرگرمیاں',
  'category.travel_journey': 'سفر',
  'category.forgiveness': 'معافی مانگنا',
  'category.protection': 'حفاظت',
  'category.health_wellbeing': 'صحت اور تندرستی',
  'category.success_guidance': 'کامیابی اور رہنمائی',
  'category.food_sustenance': 'کھانا اور رزق',
  'category.stress_anxiety': 'تناؤ اور پریشانی',
  'category.sleep_wakeup': 'سونا اور جاگنا',
  'category.knowledge_study': 'علم اور تعلیم',
  'category.marriage_relationship': 'شادی اور تعلقات',
  'category.work_business': 'کام اور کاروبار',
  'category.difficult_times': 'مشکل اوقات',
  'category.quran_dhikr': 'قرآن اور ذکر',
  'category.entering_leaving': 'داخل ہونا اور نکلنا',
  'category.morning_adhkar': 'صبح کے اذکار',
  'category.evening_adhkar': 'شام کے اذکار',
};

// Create a translations object with all languages
const translations = {
  en: enTranslations,
  ur: urTranslations,
};

// Create the provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage === 'en' || savedLanguage === 'ur') {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Function to change language
  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('language', newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Get current translations
  const currentTranslations = translations[language];

  // Return loading placeholder if still loading
  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translations: currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 