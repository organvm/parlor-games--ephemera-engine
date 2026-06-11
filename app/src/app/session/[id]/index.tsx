import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { SessionRow } from '../../types/session';

export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSession, updateSession } = useSession();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (id) {
        const data = await getSession(id);
        setSession(data);
      }
      setLoading(false);
    };
    fetchSession();
  }, [id]);

  const handleUpdateState = async (newState: string) => {
    if (!session || !id) return;
    const updated = await updateSession(id, { state: newState });
    if (updated) setSession(updated);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (!session) {
    return <View style={styles.centered}><Text>Session not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.name}</Text>
        <Text style={styles.badge}>{session.state}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Game Type: <Text style={styles.value}>{session.game_type}</Text></Text>
        <Text style={styles.label}>Date: <Text style={styles.value}>{new Date(session.date_time).toLocaleString()}</Text></Text>
        <Text style={styles.label}>Invite Code: <Text style={styles.value}>{session.invite_code || 'Not generated'}</Text></Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push(`/session/${session.id}/edit`)}
        >
          <Text style={styles.primaryButtonText}>Edit Configuration</Text>
        </TouchableOpacity>

        {session.state === 'DRAFT' && (
          <TouchableOpacity 
            style={[styles.primaryButton, styles.successButton]}
            onPress={() => handleUpdateState('INVITING')}
          >
            <Text style={styles.primaryButtonText}>Start Inviting</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
    fontWeight: 'normal',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
