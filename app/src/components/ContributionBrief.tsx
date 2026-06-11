import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  gameType: string;
  sessionName: string;
}

export function ContributionBrief({ gameType, sessionName }: Props) {
  // Logic to show narrative brief depending on the gameType
  const getNarrative = () => {
    switch (gameType) {
      case 'confession_album':
        return "We gather our secrets. Anonymously offer a confession, an admission, or a hidden truth. Your submission will be shuffled and read aloud by another during the session.";
      default:
        return "Please provide your contribution for the upcoming game. Keep it thoughtful.";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>The Brief</Text>
      <Text style={styles.title}>{sessionName}</Text>
      <Text style={styles.narrative}>{getNarrative()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#2C2B29',
    marginBottom: 16,
    fontFamily: 'serif',
  },
  narrative: {
    fontSize: 16,
    color: '#4A4843',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'serif',
  },
});
