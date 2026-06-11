import { useEffect, useRef } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export function useAutoSave<T>(
  key: string,
  data: T,
  delayMs: number = 30000,
  onSave?: (savedData: T) => void
) {
  const savedDataRef = useRef<T>(data);

  useEffect(() => {
    // Attempt to load initial data
    try {
      const stored = storage.getString(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (onSave) onSave(parsed);
      }
    } catch (e) {
      console.error('Failed to load autosave data', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        storage.set(key, JSON.stringify(data));
        savedDataRef.current = data;
      } catch (e) {
        console.error('Failed to autosave data', e);
      }
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [data, key, delayMs]);

  const clearAutoSave = () => {
    storage.delete(key);
  };

  return { clearAutoSave };
}
