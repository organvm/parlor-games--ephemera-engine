import { create } from 'zustand';

export interface NotificationPreferences {
  invitations: boolean;
  reminders: boolean;
  game_night: boolean;
  artifacts: boolean;
  delayed_artifacts: boolean;
  web_emails: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // HH:mm format
  quiet_hours_end: string;
}

export interface AccessibilityPreferences {
  text_size: 'system' | 'large' | 'extra_large';
  high_contrast: boolean;
  reduce_motion: boolean;
  written_answer_mode: boolean;
  theme: 'system' | 'warm' | 'dark';
}

interface SettingsState {
  notification_preferences: NotificationPreferences;
  accessibility_preferences: AccessibilityPreferences;
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  setAccessibilityPreferences: (prefs: Partial<AccessibilityPreferences>) => void;
  setAllPreferences: (notif: NotificationPreferences, acc: AccessibilityPreferences) => void;
}

const defaultNotifPrefs: NotificationPreferences = {
  invitations: true,
  reminders: true,
  game_night: true,
  artifacts: true,
  delayed_artifacts: true,
  web_emails: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00'
};

const defaultAccPrefs: AccessibilityPreferences = {
  text_size: 'system',
  high_contrast: false,
  reduce_motion: false,
  written_answer_mode: false,
  theme: 'system'
};

export const useSettingsStore = create<SettingsState>((set) => ({
  notification_preferences: defaultNotifPrefs,
  accessibility_preferences: defaultAccPrefs,
  
  setNotificationPreferences: (prefs) => 
    set((state) => ({
      notification_preferences: { ...state.notification_preferences, ...prefs }
    })),
    
  setAccessibilityPreferences: (prefs) =>
    set((state) => ({
      accessibility_preferences: { ...state.accessibility_preferences, ...prefs }
    })),
    
  setAllPreferences: (notif, acc) =>
    set(() => ({
      notification_preferences: notif,
      accessibility_preferences: acc
    }))
}));
