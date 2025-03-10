import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = 'isFirstLaunch';
const FORCE_WELCOME_KEY = 'forceWelcomeScreen';

// TEMPORARY: For UI testing - always return true
export const checkIfFirstLaunch = async (): Promise<boolean> => {
  // Check if we should force the welcome screen (used for testing)
  try {
    const forceWelcome = await AsyncStorage.getItem(FORCE_WELCOME_KEY);
    if (forceWelcome === 'true') {
      // Reset the force flag after checking it
      await AsyncStorage.setItem(FORCE_WELCOME_KEY, 'false');
      console.log('Forcing welcome screen to appear (TEST MODE)');
      return true;
    }
  } catch (error) {
    console.error('Error checking force welcome flag:', error);
  }
  
  // Always return true for testing
  console.log('Always returning true for welcome screen (TEST MODE)');
  return true;
  
  /* ORIGINAL IMPLEMENTATION - Uncomment when testing is complete
  try {
    const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    
    if (hasLaunched === null) {
      // It's the first launch
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking first launch status:', error);
    return false;
  }
  */
};

export const resetFirstLaunchStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
    // Set force welcome screen flag for testing
    await AsyncStorage.setItem(FORCE_WELCOME_KEY, 'true');
    console.log('Reset first launch status and set force welcome flag');
  } catch (error) {
    console.error('Error resetting first launch status:', error);
  }
}; 