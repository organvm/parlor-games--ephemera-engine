import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MurderMysteryData, SealedEnvelope } from '../types/murder-mystery';
import { supabase } from '../../../lib/supabase';
import { ArtifactDataAssemblyService } from '../services/artifactDataAssemblyService';

interface EpilogueWritingScreenProps {
  sessionId: string;
  scenario: MurderMysteryData;
  onBack: () => void;
}

export const EpilogueWritingScreen: React.FC<EpilogueWritingScreenProps> = ({
  sessionId,
  scenario,
  onBack
}) => {
  const [epilogues, setEpilogues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (characterId: string, text: string) => {
    setEpilogues(prev => ({
      ...prev,
      [characterId]: text
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      const newEnvelopes: SealedEnvelope[] = Object.entries(epilogues).map(([charId, text]) => {
        const char = scenario.characters.find(c => c.id === charId);
        return {
          character_id: charId,
          player_id: char?.assigned_to || '',
          text: text.trim(),
          delivered: false
        };
      });

      const updatedScenario = {
        ...scenario,
        sealed_envelopes: newEnvelopes
      };

      const { error } = await supabase
        .from('sessions')
        .update({ config: updatedScenario })
        .eq('id', sessionId);

      if (error) throw error;
      
      Alert.alert('Saved', 'Epilogues have been sealed and scheduled for delivery.');

      // Trigger mm_dossier artifact generation (T044)
      try {
        const payload = ArtifactDataAssemblyService.assembleDossierPayload(sessionId, updatedScenario);
        const { error: invokeError } = await supabase.functions.invoke('render-artifact', {
          body: { sessionId, artifactPayload: payload }
        });
        
        if (invokeError) {
          console.error('Failed to trigger dossier artifact generation:', invokeError);
        }
      } catch (artifactErr) {
        console.error('Artifact generation error:', artifactErr);
      }
      
    } catch (e) {
      console.error('Failed to save epilogues', e);
      Alert.alert('Error', 'Failed to save epilogues.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fcd34d" />
        </TouchableOpacity>
        <Text style={styles.title}>The Sealed Envelopes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.instruction}>
          Write a short epilogue for each character detailing what happened to them after the events of the murder.
        </Text>

        {scenario.characters.map(char => (
          <View key={char.id} style={styles.characterBlock}>
            <Text style={styles.charName}>{char.name}</Text>
            <Text style={styles.charRole}>{char.occupation}</Text>
            
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder={`What became of ${char.name}?`}
              placeholderTextColor="#6b7280"
              value={epilogues[char.id] || ''}
              onChangeText={(text) => handleTextChange(char.id, text)}
            />
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Sealing...' : 'Seal & Schedule Delivery'}
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
    color: '#eab308',
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
  characterBlock: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  charName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  charRole: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
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
  saveButton: {
    backgroundColor: '#eab308',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#854d0e',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#713f12',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
