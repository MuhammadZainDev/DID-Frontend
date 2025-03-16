import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = 'isFirstLaunch';

export const checkIfFirstLaunch = async (): Promise<boolean> => {
  try {
    const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    console.log('First launch check:', hasLaunched);
    
    if (hasLaunched === null) {
      // First time launch - mark as launched
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'launched');
      console.log('First time launch, marking as launched');
      return true;
    }
    
    // Not first launch
    console.log('Not first launch, already launched before');
    return false;
  } catch (error) {
    console.error('Error checking first launch status:', error);
    return false;
  }
};

// Only use this function during development if you need to test the welcome screen
export const resetFirstLaunchStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
    console.log('First launch status has been reset');
  } catch (error) {
    console.error('Error resetting first launch status:', error);
  }
}; 