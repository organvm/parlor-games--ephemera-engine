import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MurderMysteryData, AwardVote } from '../types/murder-mystery';
import { useAwards } from '../hooks/useAwards';
import { AwardCategoryCard } from '../components/AwardCategoryCard';

const AWARD_CATEGORIES = [
  "Best Performance",
  "Best Costume",
  "Most Suspicious",
  "Best Detective",
  "Most Dramatic Death"
];

interface AwardsVotingScreenProps {
  sessionId: string;
  scenario: MurderMysteryData;
  currentPlayerId: string;
  currentPlayerCharacterId?: string; // To prevent self-voting
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export const AwardsVotingScreen: React.FC<AwardsVotingScreenProps> = ({
  sessionId,
  scenario,
  currentPlayerId,
  currentPlayerCharacterId,
  onBack,
  onSubmitSuccess
}) => {
  const { submitVotes, isSubmitting } = useAwards(sessionId, scenario);
  
  const [votes, setVotes] = useState<Record<string, string>>({});

  const handleSelectNominee = (category: string, nomineeId: string) => {
    setVotes(prev => ({
      ...prev,
      [category]: nomineeId
    }));
  };

  const handleSubmit = async () => {
    // Check if all categories have votes
    const missingCategories = AWARD_CATEGORIES.filter(c => !votes[c]);
    
    if (missingCategories.length > 0) {
      Alert.alert(
        'Incomplete Ballot', 
        `Please cast a vote for:\n${missingCategories.join('\n')}`
      );
      return;
    }

    const votesToSubmit: AwardVote[] = Object.entries(votes).map(([category, nomineeId]) => ({
      player_id: currentPlayerId,
      category,
      nominee_character_id: nomineeId
    }));

    const success = await submitVotes(votesToSubmit);
    if (success) {
      onSubmitSuccess();
    } else {
      Alert.alert('Error', 'Failed to submit votes. Please try again.');
    }
  };

  // Filter out the current player's character to prevent self-voting
  const eligibleNominees = scenario.characters.filter(
    char => char.id !== currentPlayerCharacterId
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fcd34d" />
        </TouchableOpacity>
        <Text style={styles.title}>Cast Your Votes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.instruction}>
          The night is coming to a close. Cast your votes for the evening's superlatives! You cannot vote for yourself.
        </Text>

        {AWARD_CATEGORIES.map(category => (
          <AwardCategoryCard
            key={category}
            category={category}
            nominees={eligibleNominees}
            selectedNomineeId={votes[category]}
            onSelect={(nomineeId) => handleSelectNominee(category, nomineeId)}
          />
        ))}

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Ballot'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fcd34d',
  },
  content: {
    flex: 1,
  },
  instruction: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 24,
    lineHeight: 24,
  },
  submitButton: {
    backgroundColor: '#fcd34d',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#92400e',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#92400e',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
