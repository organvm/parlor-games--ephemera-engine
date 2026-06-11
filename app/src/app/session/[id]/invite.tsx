import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { shareInviteLink, generateInviteCode } from '../../../utils/deep-link';

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSession, updateSession } = useSession();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initInvite = async () => {
      if (id) {
        const data = await getSession(id);
        if (data) {
          // If no invite code exists and state is INVITING, generate one
          if (!data.invite_code && data.state === 'INVITING') {
            const code = generateInviteCode();
            const updated = await updateSession(id, { invite_code: code });
            setSession(updated || data);
          } else {
            setSession(data);
          }
        }
      }
      setLoading(false);
    };
    initInvite();
  }, [id]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (!session) {
    return <View style={styles.centered}><Text>Session not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite Players</Text>
      <Text style={styles.subtitle}>Session: {session.name}</Text>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Invite Code</Text>
        <Text style={styles.code}>{session.invite_code}</Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => shareInviteLink(session.invite_code, session.name)}
      >
        <Text style={styles.primaryButtonText}>Share Invite Link</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryButtonText}>Back to Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  codeContainer: {
    backgroundColor: '#f5f5f5',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  code: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#007AFF',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
