import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Supabase storage adapter that uses Expo SecureStore for native platforms
 * and localStorage for web.
 */
export const supabaseStorage = {
  getItem: (key: string): string | null => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      }
      return SecureStore.getItem(key);
    } catch (e) {
      console.error('Error getting item from storage', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }
      SecureStore.setItem(key, value);
    } catch (e) {
      console.error('Error setting item in storage', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }
      SecureStore.deleteItem(key);
    } catch (e) {
      console.error('Error removing item from storage', e);
    }
  },
};
