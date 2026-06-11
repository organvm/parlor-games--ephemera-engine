import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SettingCard } from '../components/SettingCard';

// Mock data representing curated seeds
const CURATED_SEEDS = [
  {
    id: 'seed-1',
    title: 'The Velvet Lounge',
    era: '1920s Prohibition',
    location: 'A hidden speakeasy beneath a legitimate pharmacy in Chicago',
    tension: 'The local mob boss just found out someone has been skimming from the till, and the police are set to raid in 2 hours.',
    description: 'Jazz music blares to cover the sound of hushed, desperate conversations. The air is thick with smoke, cheap perfume, and fear. Everyone here has a secret they\'d kill to keep.'
  },
  {
    id: 'seed-2',
    title: 'The Midnight Express',
    era: '1890s Victorian',
    location: 'A luxury train car traveling through the Swiss Alps',
    tension: 'An avalanche has blocked the tracks ahead and behind. The temperature is dropping, and the conductor has gone missing.',
    description: 'The Orient Express meets a blizzard. Wealthy aristocrats, a disgraced doctor, and a mysterious widow are trapped together as the opulent train slowly turns into an icy tomb.'
  }
];

export interface ScenarioSetupScreenProps {
  onGenerate: (seed: any) => void;
  isGenerating?: boolean;
}

export const ScenarioSetupScreen: React.FC<ScenarioSetupScreenProps> = ({ 
  onGenerate,
  isGenerating = false 
}) => {
  const [selectedSeedId, setSelectedSeedId] = useState<string | null>(null);
  const [customSetting, setCustomSetting] = useState('');

  const handleGenerate = () => {
    if (selectedSeedId) {
      const seed = CURATED_SEEDS.find(s => s.id === selectedSeedId);
      onGenerate({ ...seed, source: 'curated' });
    } else if (customSetting.trim()) {
      onGenerate({ description: customSetting, source: 'generated' });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Select a Scenario</Text>
      <Text style={styles.headerSubtitle}>Choose a curated setting or describe your own to generate a unique mystery.</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Curated Settings</Text>
        {CURATED_SEEDS.map((seed) => (
          <SettingCard
            key={seed.id}
            {...seed}
            selected={selectedSeedId === seed.id}
            onSelect={() => {
              setSelectedSeedId(seed.id);
              setCustomSetting('');
            }}
          />
        ))}
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Setting</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="E.g., A 1980s slasher summer camp where the counselors are snowed in..."
          value={customSetting}
          onChangeText={(text) => {
            setCustomSetting(text);
            if (text.length > 0) setSelectedSeedId(null);
          }}
        />
      </View>

      <TouchableOpacity 
        style={[styles.generateButton, (!selectedSeedId && !customSetting.trim() || isGenerating) && styles.generateButtonDisabled]} 
        onPress={handleGenerate}
        disabled={(!selectedSeedId && !customSetting.trim()) || isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Scenario</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#999999',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#A0C6F2',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
