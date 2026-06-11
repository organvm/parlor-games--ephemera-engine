import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function NotificationPreferences() {
  const { session } = useAuthStore();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const { status } = await Notifications.getPermissionsAsync();
      setPushEnabled(status === 'granted');
      setLoading(false);
    }
    checkStatus();
  }, []);

  const toggleSwitch = async () => {
    if (pushEnabled) {
      // Opt out
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to your device Settings.',
        [{ text: 'OK' }]
      );
    } else {
      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setPushEnabled(true);
        if (session?.user) {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          if (tokenData) {
            await supabase.from('users').update({ push_token: tokenData.data }).eq('id', session.user.id);
          }
        }
      } else {
        Alert.alert('Permission Denied', 'You must allow notifications in settings.');
      }
    }
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Preferences</Text>
      
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Push Notifications</Text>
          <Text style={styles.description}>
            Receive invites and game updates.
          </Text>
        </View>
        <Switch
          trackColor={{ false: '#D4D2C9', true: '#4A8A63' }}
          thumbColor={pushEnabled ? '#FAF9F6' : '#FAF9F6'}
          ios_backgroundColor="#D4D2C9"
          onValueChange={toggleSwitch}
          value={pushEnabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FAF9F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2B29',
    fontFamily: 'serif',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    color: '#2C2B29',
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8A867D',
  },
});
