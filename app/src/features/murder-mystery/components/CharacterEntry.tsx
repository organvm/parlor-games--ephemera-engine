import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Character } from '../types/murder-mystery';

export interface CharacterEntryProps {
  character: Character;
  assignedGuestName?: string;
  onPress?: () => void;
  showSecret?: boolean;
}

export const CharacterEntry: React.FC<CharacterEntryProps> = ({ 
  character, 
  assignedGuestName,
  onPress,
  showSecret = false
}) => {
  const initials = character.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.mugshot}>
          <Text style={styles.mugshotText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{character.name}</Text>
          <Text style={styles.occupation}>{character.occupation}</Text>
        </View>
        {assignedGuestName && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{assignedGuestName}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.bio}>{character.personality}</Text>
      
      {showSecret && (
        <View style={styles.secretContainer}>
          <Text style={styles.secretLabel}>Secret</Text>
          <Text style={styles.secretText}>{character.secret}</Text>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mugshot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mugshotText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  occupation: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
  },
  secretContainer: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  secretLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  secretText: {
    fontSize: 14,
    color: '#7F1D1D',
    fontStyle: 'italic',
  }
});
