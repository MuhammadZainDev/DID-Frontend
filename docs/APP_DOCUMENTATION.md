# DuaonAI Frontend Documentation

## App Overview
DuaonAI is a comprehensive Islamic app designed to provide users with authentic duas (supplications) from the Quran and Sunnah. The app features prayer times, a categorized collection of duas, multilingual support (English and Urdu), favorites functionality, and more.

## Tech Stack
- React Native with Expo (SDK version 52.0.38)
- TypeScript
- Expo Router for navigation
- Context API for state management
- Async Storage for local data persistence
- Axios for API requests
- Various Expo packages for features like notifications, location, and audio

## Application Architecture

### 1. Navigation Structure
The app uses Expo Router for navigation with the following structure:
- **Tabs Navigation**: Main app sections (Home, Duas, Prayer Times, Favorites, Settings)
- **Stack Navigation**: For screens like Dua detail, Subcategory, Login, Signup, etc.

### 2. State Management
The app uses React Context API for global state management:
- **AuthContext**: Handles user authentication, login, signup, and session management
- **ThemeContext**: Manages app theme (light/dark mode)
- **LanguageContext**: Handles language switching between English and Urdu

### 3. Main Features

#### Authentication System
- User registration and login
- Password reset functionality
- JWT token-based authentication with secure storage

#### Home Screen
- AI-powered dua search
- Featured duas and categories
- Quick access to prayer times

#### Duas Section
- Categories and subcategories of duas
- Each dua includes Arabic text, translations (English/Urdu), and references
- Features for sharing, copying, and favoriting duas

#### Prayer Times
- Location-based accurate prayer times
- Prayer time notifications
- Visual indicators for current prayer time
- Calculation method settings

#### Favorites
- Save favorite duas for quick access
- Syncs with user account when logged in
- Local storage for offline access

#### Settings
- Language selection (English/Urdu)
- Theme selection (Light/Dark)
- Prayer calculation method settings
- Notification preferences
- User profile management

### 4. Key Components

#### DuaCard
- Displays a dua with all its details
- Handles conditional rendering of Urdu translation based on language setting
- Includes action buttons for sharing, copying, and favoriting

#### DuaModal
- Modal view for detailed dua display
- Used for AI search results
- Includes sharing functionality

#### PrayerTimes
- Displays daily prayer times
- Shows countdown to next prayer
- Visual indicators for current prayer status

#### ThemedText/ThemedView
- Components that respect the app's theme settings
- Automatically adjust colors based on theme

### 5. Language Support
- Full bilingual support for English and Urdu
- Context-based language switching that affects the entire app
- Properly formatted Urdu text with appropriate font styling

### 6. Data Management

#### API Integration
- Connects to backend API for duas data, authentication, and user management
- Uses Axios for API requests with error handling
- Implements token refresh for authentication

#### Offline Support
- Caches duas and prayer times for offline access
- Syncs favorites when coming back online
- Error handling for network issues

#### Storage Strategy
- AsyncStorage for local data persistence
- JWT tokens stored securely
- User preferences saved locally

### 7. UI/UX Design

#### Theming
- Dark mode and light mode support
- Consistent color palette throughout the app
- Smooth transitions between screens

#### User Experience
- Loading states with appropriate indicators
- Error handling with user-friendly messages
- Toast notifications for user actions
- Animation for better visual feedback

### 8. Special Features

#### AI Integration
- AI-powered dua search functionality
- Gemini service integration for intelligent dua recommendations

#### Dua Sharing
- Generate and share beautiful dua cards
- Copy duas to clipboard with proper formatting
- Share via social media or messaging apps

#### Prayer Notifications
- Configurable notifications for prayer times
- Custom sounds for adhan
- Background tasks for timely notifications

## Publishing Requirements

### Android Publication Checklist
1. App icon and adaptive icons are properly configured
2. App permissions are correctly set in app.json
   - Location permissions for prayer times
   - Notification permissions
3. App version and build number are configured in eas.json
4. Proper app bundleId is set (com.muhammadzainraza.duaonai)
5. The app has been configured for auto-increment versioning

### iOS Publication Checklist
1. App icon and splash screen are correctly configured
2. Required permissions are set in the Info.plist section:
   - Location permissions for prayer times
3. Proper bundleIdentifier is set (com.muhammadzainraza.duaonai)
4. iPad support is enabled

### General Publication Requirements
1. Privacy policy is included
2. App metadata (description, screenshots, etc.) is prepared
3. Content ratings are determined
4. EAS build configuration is set up for production builds

## Potential Issues to Check

1. **Performance Optimization**:
   - Check for memory leaks in components with useEffect cleanup functions
   - Ensure large lists use proper virtualization
   - Verify image optimization for faster loading

2. **Error Handling**:
   - Comprehensive error handling for API requests
   - Graceful degradation when offline
   - User-friendly error messages

3. **Edge Cases**:
   - Test behavior with slow network connections
   - Verify functionality when switching between online/offline
   - Test with various device sizes and orientations

4. **Accessibility**:
   - Font scaling support
   - Color contrast for visually impaired users
   - Screen reader compatibility

5. **Internationalization**:
   - Ensure proper RTL layout for Urdu text
   - Verify translations are complete and accurate
   - Check font rendering for Arabic and Urdu text

## Directory Structure

```
DuaonAI-Frontend/
├── app/                   # Main application screens
│   ├── (tabs)/            # Tab-based screens
│   │   ├── _layout.tsx    # Tab navigation configuration
│   │   ├── index.tsx      # Home screen
│   │   ├── duas.tsx       # Duas categories screen
│   │   ├── prayers.tsx    # Prayer times screen
│   │   └── favorites.tsx  # Favorites screen
│   ├── dua.tsx            # Individual dua screen
│   ├── subcategory.tsx    # Duas subcategory screen
│   ├── settings.tsx       # Settings screen
│   ├── login.tsx          # Login screen
│   ├── signup.tsx         # Signup screen
│   └── ...                # Other screens
├── components/            # Reusable UI components
│   ├── DuaCard.js         # Dua display component
│   ├── DuaModal.tsx       # Dua detail modal
│   ├── ThemedText.tsx     # Theme-aware text component
│   └── ...                # Other components
├── context/               # Context providers
│   ├── AuthContext.tsx    # Authentication context
│   ├── ThemeContext.tsx   # Theme context
│   └── LanguageContext.tsx # Language context
├── services/              # API and service functions
│   ├── api.ts             # API client and requests
│   ├── favorites.ts       # Favorites management
│   └── geminiService.ts   # AI service integration
├── styles/                # Global styles and themes
│   └── fonts.css          # Font definitions for Arabic/Urdu
├── assets/                # Static assets (images, fonts)
│   ├── fonts/             # Custom fonts
│   └── images/            # App images
└── config/                # Configuration files
    └── constants.ts       # App constants
```

## Maintenance Guidelines

1. **Code Structure**:
   - Follow existing patterns for new features
   - Maintain separation of concerns
   - Use contexts for global state

2. **Styling Conventions**:
   - Use StyleSheet for component styles
   - Follow the existing color scheme
   - Use ThemedComponents for theme-aware UI

3. **Component Reusability**:
   - Create reusable components for common UI elements
   - Keep components focused on single responsibilities
   - Document component props

4. **Testing**:
   - Test across multiple devices
   - Check both online and offline functionality
   - Verify language switching works throughout the app

## Known Issues and Fixes

### 1. Urdu Translation Display
- **Issue**: Urdu translations were not displaying correctly on some screens
- **Fix**: Added language context check in DuaModal.tsx and dua.tsx to conditionally display Urdu translations based on selected language
- **Affected Files**:
  - DuaonAI-Frontend/app/dua.tsx
  - DuaonAI-Frontend/components/DuaModal.tsx
  - DuaonAI-Frontend/components/DuaCard.js

### 2. API Error Handling
- Always check for network connectivity before making API requests
- Implement proper error boundaries for failed API calls
- Provide user-friendly error messages in the UI

### 3. Language Selection
- Ensure all UI elements respect the selected language
- Test translation completeness across all screens
- Properly format RTL text for Arabic and Urdu content

## Conclusion
The DuaonAI app provides a comprehensive Islamic resource with a focus on duas, prayer times, and multilingual support. This documentation aims to provide a clear understanding of the app's architecture, features, and guidelines for maintenance and future development. 