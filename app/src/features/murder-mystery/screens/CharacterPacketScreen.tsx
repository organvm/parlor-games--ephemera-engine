import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Easing } from 'react-native';
import { Character, MurderMysteryData } from '../types/murder-mystery';

export interface CharacterPacketScreenProps {
  scenario: MurderMysteryData;
  characterId: string;
}

export const CharacterPacketScreen: React.FC<CharacterPacketScreenProps> = ({ scenario, characterId }) => {
  const character = scenario.characters.find(c => c.id === characterId);
  const [isOpen, setIsOpen] = useState(false);
  const sealOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  if (!character) {
    return (
      <View style={styles.center}>
        <Text>Character not found.</Text>
      </View>
    );
  }

  const handleOpen = () => {
    Animated.sequence([
      Animated.timing(sealOpacity, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsOpen(true);
    });
  };

  return (
    <View style={styles.container}>
      {!isOpen && (
        <Animated.View style={[styles.envelopeContainer, { opacity: sealOpacity }]}>
          <TouchableOpacity style={styles.envelope} onPress={handleOpen} activeOpacity={0.8}>
            <Text style={styles.topSecret}>TOP SECRET</Text>
            <View style={styles.waxSeal}>
              <Text style={styles.waxSealText}>TAP TO BREAK SEAL</Text>
            </View>
            <Text style={styles.envelopeName}>For the eyes of: {character.name}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.ScrollView 
        style={[styles.contentContainer, { opacity: contentOpacity, zIndex: isOpen ? 1 : -1 }]}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Your Character Profile</Text>
        
        <View style={styles.card}>
          <Text style={styles.name}>{character.name}</Text>
          <Text style={styles.occupation}>{character.occupation}</Text>
          
          <Text style={styles.sectionHeader}>Personality</Text>
          <Text style={styles.body}>{character.personality}</Text>

          <View style={styles.secretBox}>
            <Text style={styles.secretHeader}>Your Dark Secret</Text>
            <Text style={styles.secretBody}>{character.secret}</Text>
            <Text style={styles.secretWarning}>Do not reveal this unless absolutely forced to!</Text>
          </View>
        </View>

        <Text style={styles.title}>Contribution Brief</Text>
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Food/Drink</Text>
          <Text style={styles.body}>{character.contribution_brief.food || 'None specified'}</Text>
          
          <Text style={styles.sectionHeader}>Costume Suggestions</Text>
          <Text style={styles.body}>{character.contribution_brief.dress || 'None specified'}</Text>
          
          <Text style={styles.sectionHeader}>Props</Text>
          <Text style={styles.body}>{character.contribution_brief.prop || 'None specified'}</Text>
        </View>

        <Text style={styles.title}>Preparation Prompts</Text>
        <View style={styles.card}>
          {character.preparation_prompts.map((prompt, index) => (
            <View key={index} style={styles.promptRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.body}>{prompt}</Text>
            </View>
          ))}
          {character.preparation_prompts.length === 0 && (
            <Text style={styles.body}>None specified</Text>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B', // Dark, mystery background
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelopeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 10,
  },
  envelope: {
    backgroundColor: '#FEF3C7', // Manila folder color
    width: '100%',
    maxWidth: 400,
    aspectRatio: 3/4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  topSecret: {
    fontSize: 32,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 4,
    marginBottom: 60,
    transform: [{ rotate: '-5deg' }],
  },
  waxSeal: {
    backgroundColor: '#991B1B',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#7F1D1D',
    marginBottom: 60,
  },
  waxSealText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
  },
  envelopeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'monospace',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E7FF',
    marginBottom: 16,
    marginTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  occupation: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  secretBox: {
    marginTop: 24,
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  secretHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FCA5A5',
    marginBottom: 8,
  },
  secretBody: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  secretWarning: {
    marginTop: 12,
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#4B5563',
    marginRight: 8,
    lineHeight: 24,
  }
});
