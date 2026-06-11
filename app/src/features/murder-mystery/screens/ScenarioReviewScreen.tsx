import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MurderMysteryData, Character, TimelineEvent } from '../types/murder-mystery';

export interface ScenarioReviewScreenProps {
  scenario: MurderMysteryData;
  onConfirm: (scenario: MurderMysteryData) => void;
  onRegenerate: () => void;
}

export const ScenarioReviewScreen: React.FC<ScenarioReviewScreenProps> = ({
  scenario,
  onConfirm,
  onRegenerate
}) => {
  const [editedScenario, setEditedScenario] = useState<MurderMysteryData>(scenario);
  const [editingField, setEditingField] = useState<string | null>(null);

  const victim = editedScenario.characters.find(c => c.id === editedScenario.crime.victim_id);
  const murderer = editedScenario.characters.find(c => c.id === editedScenario.crime.murderer_id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Review Scenario</Text>
      <Text style={styles.headerSubtitle}>Review the generated mystery. You can confirm it or regenerate a new one.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>The Setting</Text>
        <Text style={styles.settingText}><Text style={styles.bold}>Era:</Text> {editedScenario.setting_seed.era}</Text>
        <Text style={styles.settingText}><Text style={styles.bold}>Location:</Text> {editedScenario.setting_seed.location}</Text>
        <Text style={styles.settingText}><Text style={styles.bold}>Tension:</Text> {editedScenario.setting_seed.tension}</Text>
        <Text style={styles.descriptionText}>{editedScenario.setting_seed.setting_description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>The Crime</Text>
        <View style={styles.crimeHeader}>
          <Text style={styles.crimeRole}>Victim: <Text style={styles.bold}>{victim?.name}</Text></Text>
          <Text style={styles.crimeRole}>Murderer: <Text style={styles.bold}>{murderer?.name}</Text></Text>
        </View>
        <Text style={styles.settingText}><Text style={styles.bold}>Weapon:</Text> {editedScenario.crime.weapon}</Text>
        <Text style={styles.settingText}><Text style={styles.bold}>Motive:</Text> {editedScenario.crime.motive}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>The Roster</Text>
        {editedScenario.characters.map(char => (
          <View key={char.id} style={styles.characterItem}>
            <Text style={styles.characterName}>{char.name} <Text style={styles.characterOccupation}>- {char.occupation}</Text></Text>
            <Text style={styles.characterBio}>{char.personality}</Text>
            <Text style={styles.characterSecret}><Text style={styles.bold}>Secret:</Text> {char.secret}</Text> // allow-secret
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        {editedScenario.crime.timeline.sort((a, b) => a.order - b.order).map((event, index) => (
          <View key={index} style={styles.timelineEvent}>
            <View style={styles.timelineOrder}><Text style={styles.timelineOrderText}>{event.order}</Text></View>
            <Text style={styles.timelineDescription}>{event.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.regenerateButton} onPress={onRegenerate}>
          <Text style={styles.regenerateButtonText}>Regenerate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(editedScenario)}>
          <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 8,
    lineHeight: 22,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
    fontStyle: 'italic',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  bold: {
    fontWeight: '700',
    color: '#222222',
  },
  crimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  crimeRole: {
    fontSize: 16,
    color: '#991B1B',
  },
  characterItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  characterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },
  characterOccupation: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
  },
  characterBio: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 8,
  },
  characterSecret: {
    fontSize: 14,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  timelineOrderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineDescription: {
    flex: 1,
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  regenerateButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  regenerateButtonText: {
    color: '#555555',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
