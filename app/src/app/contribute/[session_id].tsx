import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ContributeScreen() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', session_id)
          .single();
          
        if (error) throw error;
        setSession(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };
    if (session_id) fetchSession();
  }, [session_id]);

  const handleSubmitEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from('session_participations')
        .update({ email })
        .eq('session_id', session_id)
        .eq('user_id', userData.user?.id);
        
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save email');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  if (error && !session) return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contributions</Text>
      <Text style={styles.subtitle}>{session?.name}</Text>
      
      {!success ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Where should we send your game artifacts?</Text>
          <Text style={styles.cardText}>Enter your email below to receive the final artifacts. This email is only used for this session.</Text>
          
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          {error ? <Text style={styles.errorTextSmall}>{error}</Text> : null}
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitEmail}>
            <Text style={styles.primaryButtonText}>Save Email</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.successCard}>
          <Text style={styles.successText}>Email saved! You will receive your artifacts when the session completes.</Text>
        </View>
      )}
      
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Contribution forms will be available when the host opens them.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 },
  input: { backgroundColor: '#f5f5f5', padding: 14, borderRadius: 8, fontSize: 16, marginBottom: 16 },
  primaryButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  successCard: { backgroundColor: '#E8F5E9', padding: 20, borderRadius: 12, marginBottom: 20 },
  successText: { color: '#2E7D32', fontSize: 16, textAlign: 'center', fontWeight: '500' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  errorTextSmall: { color: 'red', fontSize: 14, marginBottom: 12 },
  placeholderCard: { backgroundColor: '#fff', padding: 30, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  placeholderText: { color: '#999', fontSize: 16, textAlign: 'center' },
});
