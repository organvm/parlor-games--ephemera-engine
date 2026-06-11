import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSettingsStore, NotificationPreferences, AccessibilityPreferences } from '../stores/settings-store';
import { useAuth } from './use-auth';

export const useSettings = () => {
  const { user } = useAuth();
  const { 
    notification_preferences, 
    accessibility_preferences, 
    setNotificationPreferences, 
    setAccessibilityPreferences,
    setAllPreferences
  } = useSettingsStore();

  useEffect(() => {
    if (user) {
      // Load user preferences from DB on mount
      const loadPreferences = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('notification_preferences, accessibility_preferences')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          if (data.notification_preferences || data.accessibility_preferences) {
            setAllPreferences(
              (data.notification_preferences as NotificationPreferences) || notification_preferences,
              (data.accessibility_preferences as AccessibilityPreferences) || accessibility_preferences
            );
          }
        }
      };
      
      loadPreferences();
    }
  }, [user?.id]);

  const updateNotificationPrefs = async (prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prefs);
    if (user) {
      const updated = { ...notification_preferences, ...prefs };
      await supabase
        .from('users')
        .update({ notification_preferences: updated })
        .eq('id', user.id);
    }
  };

  const updateAccessibilityPrefs = async (prefs: Partial<AccessibilityPreferences>) => {
    setAccessibilityPreferences(prefs);
    if (user) {
      const updated = { ...accessibility_preferences, ...prefs };
      await supabase
        .from('users')
        .update({ accessibility_preferences: updated })
        .eq('id', user.id);
    }
  };

  return {
    notificationPrefs: notification_preferences,
    accessibilityPrefs: accessibility_preferences,
    updateNotificationPrefs,
    updateAccessibilityPrefs
  };
};
