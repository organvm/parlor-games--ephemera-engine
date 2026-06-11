import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../hooks/use-session';
import { GameType } from '../../types/session';

export default function CreateSession() {
  const router = useRouter();
  const { createSession, loading } = useSession();

  const [name, setName] = useState('');
  const [gameType, setGameType] = useState<GameType>('mystery');
  // Hardcoded date for MVP logic
  const [dateTime, setDateTime] = useState(new Date().toISOString());

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a session name');
      return;
    }

    const session = await createSession({
      name,
      game_type: gameType,
      date_time: dateTime,
      config: {
        guestCount: 8,
        theme: 'default'
      }
    });

    if (session) {
      router.replace(`/session/${session.id}`);
    } else {
      Alert.alert('Error', 'Failed to create session');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Session Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Friday Night Mystery"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Game Type</Text>
        <View style={styles.gameTypes}>
          {(['mystery', 'trivia', 'social'] as GameType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                gameType === type && styles.typeButtonActive
              ]}
              onPress={() => setGameType(type)}
            >
              <Text style={[
                styles.typeButtonText,
                gameType === type && styles.typeButtonTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Creating...' : 'Create Session'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  gameTypes: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    textTransform: 'capitalize',
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
