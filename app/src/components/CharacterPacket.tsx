import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  roleName: string;
  archetype: string;
  brief: string;
  prompts: string[];
}

export function CharacterPacket({ roleName, archetype, brief, prompts }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Your Role</Text>
      <Text style={styles.title}>{roleName}</Text>
      <Text style={styles.archetype}>{archetype}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>The Brief</Text>
      <Text style={styles.bodyText}>{brief}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Prompts</Text>
      {prompts.map((prompt, idx) => (
        <View key={idx} style={styles.promptItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bodyText}>{prompt}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  content: {
    padding: 24,
  },
  eyebrow: {
    fontSize: 12,
    color: '#8A867D',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2C2B29',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  archetype: {
    fontSize: 18,
    color: '#4A4843',
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E6E1',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2B29',
    fontFamily: 'serif',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bodyText: {
    fontSize: 16,
    color: '#4A4843',
    lineHeight: 24,
    fontFamily: 'serif',
  },
  promptItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#8A867D',
    marginRight: 8,
    lineHeight: 24,
  },
});
