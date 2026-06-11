import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { usePreferences } from '../hooks/usePreferences';

interface Props {
  sessionId: string;
  participantId: string;
  availableArchetypes: string[];
}

export function PreferenceForm({ sessionId, participantId, availableArchetypes }: Props) {
  const { preferences, submitPreferences, loading } = usePreferences(sessionId, participantId);
  const [ranked, setRanked] = useState<string[]>(preferences?.archetypes || []);

  const toggleArchetype = (arch: string) => {
    if (ranked.includes(arch)) {
      setRanked(ranked.filter(a => a !== arch));
    } else {
      if (ranked.length < 3) {
        setRanked([...ranked, arch]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await submitPreferences({ archetypes: ranked });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Archetype Preferences</Text>
      <Text style={styles.subtitle}>Choose up to 3 archetypes in order of preference.</Text>
      
      <View style={styles.list}>
        {availableArchetypes.map(arch => {
          const rankIndex = ranked.indexOf(arch);
          const isSelected = rankIndex !== -1;
          
          return (
            <TouchableOpacity 
              key={arch} 
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => toggleArchetype(arch)}
            >
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {arch}
              </Text>
              {isSelected && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{rankIndex + 1}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit} 
        disabled={loading || ranked.length === 0}
      >
        {loading ? <ActivityIndicator color="#FAF9F6" /> : <Text style={styles.submitText}>Submit Preferences</Text>}
      </TouchableOpacity>
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
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2C2B29',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A867D',
    marginBottom: 24,
  },
  list: {
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E6E1',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemSelected: {
    borderColor: '#2C2B29',
    backgroundColor: '#F0EFEA',
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#4A4843',
  },
  itemTextSelected: {
    color: '#2C2B29',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#2C2B29',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FAF9F6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2C2B29',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#FAF9F6',
    fontWeight: '600',
    fontFamily: 'serif',
  },
});
