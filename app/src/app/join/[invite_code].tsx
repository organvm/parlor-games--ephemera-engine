import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { signInGuest } from '../../lib/guest-auth';

export default function JoinScreen() {
  const { invite_code } = useLocalSearchParams<{ invite_code: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessionAndAuth = async () => {
      try {
        await signInGuest();
        const { data, error: fetchError } = await supabase
          .from('sessions')
          .select('*')
          .eq('invite_code', invite_code)
          .single();
          
        if (fetchError) throw fetchError;
        setSession(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };
    if (invite_code) {
      fetchSessionAndAuth();
    }
  }, [invite_code]);

  const handleRsvp = async (status: 'accepted' | 'declined' | 'maybe') => {
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: rsvpError } = await supabase
        .from('session_participations')
        .insert({
          session_id: session.id,
          user_id: userData.user?.id,
          display_name: displayName,
          role: 'web_player',
          rsvp_status: status
        });
        
      if (rsvpError) throw rsvpError;
      
      if (status === 'accepted') {
        router.push(`/contribute/${session.id}`);
      } else {
        alert('RSVP recorded. Thank you!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to RSVP');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  if (error || !session) return <View style={styles.centered}><Text style={styles.errorText}>{error || 'Session not found'}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're Invited!</Text>
      <Text style={styles.subtitle}>Join {session.name}</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />
        
        <Text style={styles.label}>RSVP</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.rsvpButton, styles.acceptBtn]} onPress={() => handleRsvp('accepted')}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rsvpButton, styles.maybeBtn]} onPress={() => handleRsvp('maybe')}>
            <Text style={styles.buttonText}>Maybe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rsvpButton, styles.declineBtn]} onPress={() => handleRsvp('declined')}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40, textAlign: 'center' },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  rsvpButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#34C759' },
  maybeBtn: { backgroundColor: '#FF9500' },
  declineBtn: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});
