import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MurderMysteryData, Accusation } from '../types/murder-mystery';
import { useAccusations } from '../hooks/useAccusations';

interface AccusationFormScreenProps {
  sessionId: string;
  scenario: MurderMysteryData;
  currentPlayerId: string;
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export const AccusationFormScreen: React.FC<AccusationFormScreenProps> = ({
  sessionId,
  scenario,
  currentPlayerId,
  onBack,
  onSubmitSuccess
}) => {
  const { submitAccusation, isSubmitting } = useAccusations(sessionId, scenario);
  
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [method, setMethod] = useState('');
  const [motive, setMotive] = useState('');

  const handleSubmit = async () => {
    if (!selectedCharacterId) {
      Alert.alert('Missing Field', 'Please select a suspect.');
      return;
    }
    if (!method.trim()) {
      Alert.alert('Missing Field', 'Please describe the method.');
      return;
    }
    if (!motive.trim()) {
      Alert.alert('Missing Field', 'Please describe the motive.');
      return;
    }

    Alert.alert(
      'Seal Accusation',
      'Once sealed, your accusation cannot be changed. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Seal It', 
          style: 'destructive',
          onPress: async () => {
            const accusation: Accusation = {
              player_id: currentPlayerId,
              accused_character_id: selectedCharacterId,
              method: method.trim(),
              motive: motive.trim()
            };
            
            const success = await submitAccusation(accusation);
            if (success) {
              onSubmitSuccess();
            } else {
              Alert.alert('Error', 'Failed to submit accusation. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fcd34d" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Accusation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.instruction}>
          The evidence has been presented. It is time to make your formal accusation.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Who is the murderer?</Text>
          <View style={styles.suspectGrid}>
            {scenario.characters.map(char => (
              <TouchableOpacity
                key={char.id}
                style={[
                  styles.suspectButton,
                  selectedCharacterId === char.id && styles.suspectButtonSelected
                ]}
                onPress={() => setSelectedCharacterId(char.id)}
              >
                <Text style={[
                  styles.suspectName,
                  selectedCharacterId === char.id && styles.suspectNameSelected
                ]}>
                  {char.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>How did they do it? (Method)</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Describe the weapon and opportunity..."
            placeholderTextColor="#6b7280"
            value={method}
            onChangeText={setMethod}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Why did they do it? (Motive)</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Describe their reason for killing..."
            placeholderTextColor="#6b7280"
            value={motive}
            onChangeText={setMotive}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Sealing...' : 'Seal Accusation'}
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
    color: '#ef4444',
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
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  suspectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suspectButton: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  suspectButtonSelected: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
  },
  suspectName: {
    color: '#d1d5db',
    fontSize: 14,
  },
  suspectNameSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#374151',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#991b1b',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
