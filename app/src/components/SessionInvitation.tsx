import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

interface Props {
  sessionId: string;
  sessionName: string;
  gameType: string;
  hostName?: string;
}

export function SessionInvitation({ sessionId, sessionName, gameType, hostName }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRsvp = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('You must be logged in to RSVP.');
      }

      // Default display name could be derived from metadata, fallback to email prefix
      const emailPrefix = userData.user.email?.split('@')[0] || 'Player';
      const displayName = userData.user.user_metadata?.full_name || emailPrefix;

      const { error } = await supabase
        .from('session_participations')
        .insert({
          session_id: sessionId,
          user_id: userData.user.id,
          display_name: displayName,
        });

      if (error) {
        // Handle unique constraint error gracefully
        if (error.code === '23505') {
          Alert.alert('Already joined', "You've already RSVP'd to this session.");
          router.replace(`/(tabs)/session/${sessionId}` as any);
          return;
        }
        throw error;
      }

      // RSVP successful, navigate to session
      router.replace(`/(tabs)/session/${sessionId}` as any);

    } catch (e: any) {
      Alert.alert('RSVP Failed', e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>You are cordially invited to</Text>
        <Text style={styles.title}>{sessionName}</Text>
        <Text style={styles.subtitle}>An evening of {gameType}</Text>
        
        {hostName && (
          <Text style={styles.hostText}>Hosted by {hostName}</Text>
        )}

        <View style={styles.actionContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#4A90E2" />
          ) : (
            <Button title="Accept Invitation" onPress={handleRsvp} color="#4A90E2" />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FAF9F6', // Off-white/cream for "atmosphere"
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  eyebrow: {
    fontSize: 14,
    color: '#8A867D',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    fontFamily: 'serif',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2C2B29',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#5C5A55',
    fontStyle: 'italic',
    marginBottom: 24,
    fontFamily: 'serif',
  },
  hostText: {
    fontSize: 16,
    color: '#4A4843',
    marginBottom: 32,
  },
  actionContainer: {
    width: '100%',
    marginTop: 16,
  },
});
