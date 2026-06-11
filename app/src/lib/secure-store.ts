import * as SecureStore from 'expo-secure-store';

/**
 * Supabase storage adapter that uses Expo SecureStore for native platforms
 * and localStorage for web.
 */
export const supabaseStorage = {
  getItem: (key: string): string | null => {
    try {
      return SecureStore.getItem(key);
    } catch (e) {
      console.error('Error getting item from SecureStore', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      SecureStore.setItem(key, value);
    } catch (e) {
      console.error('Error setting item in SecureStore', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      SecureStore.deleteItem(key);
    } catch (e) {
      console.error('Error removing item from SecureStore', e);
    }
  },
};
