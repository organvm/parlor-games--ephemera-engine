import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';

export function usePushRegistration(userId?: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function registerForPushNotificationsAsync() {
      let token;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.warn('Failed to get push token for push notification!');
          return;
        }
        
        try {
          // You need to pass projectId here if using EAS build, but let's assume it's in app.config
          const tokenResponse = await Notifications.getExpoPushTokenAsync();
          token = tokenResponse.data; // allow-secret
        } catch (e) {
          console.warn(e);
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      return token;
    }

    if (userId) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (token && isMounted) {
          setExpoPushToken(token);
          // Save to database
          await supabase.from('users').update({ push_token: token }).eq('id', userId);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { expoPushToken };
}
