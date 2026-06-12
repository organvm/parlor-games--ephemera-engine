import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SessionInvitation } from '../components/SessionInvitation';
import { ContributionBrief } from '../components/ContributionBrief';
import { SettingCard } from '../features/murder-mystery/components/SettingCard';
import { CharacterEntry } from '../features/murder-mystery/components/CharacterEntry';
import { CharacterCustomizationScreen } from '../features/murder-mystery/screens/CharacterCustomizationScreen';
import { ScenarioSetupScreen } from '../features/murder-mystery/screens/ScenarioSetupScreen';
import { ScenarioReviewScreen } from '../features/murder-mystery/screens/ScenarioReviewScreen';
import { CharacterPacketScreen } from '../features/murder-mystery/screens/CharacterPacketScreen';
import { ThreeActDashboardScreen } from '../features/murder-mystery/screens/ThreeActDashboardScreen';
import { AccusationFormScreen } from '../features/murder-mystery/screens/AccusationFormScreen';
import { AwardsVotingScreen } from '../features/murder-mystery/screens/AwardsVotingScreen';

// Mock data for sandbox
const MOCK_SESSION = {
  id: 'sandbox-123',
  host_id: 'host-1',
  code: 'SDBX',
  status: 'SETUP',
  config: {
    game_type: 'murder_mystery',
    theme: 'sandbox',
    max_players: 8,
    required_contributions: [{ id: 'food', type: 'text', title: 'Food', description: 'What are you bringing?' }],
    custom_rules: {},
    setting_seed: {}
  },
  scheduled_for: new Date(Date.now() + 86400000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const MOCK_SCENARIO: any = {
  setting_seed: {
    source: 'curated',
    era: '1920s Prohibition',
    location: 'A hidden speakeasy beneath a legitimate pharmacy in Chicago',
    milieu: 'High Society meets Organized Crime',
    tension: 'The local mob boss just found out someone has been skimming from the till.',
    setting_description: 'Jazz music blares to cover the sound of hushed, desperate conversations. The air is thick with smoke, cheap perfume, and fear.',
    crime_scene: 'The back office, normally reserved for the boss, now a gruesome spectacle.',
    generated_by: 'human'
  },
  characters: [
    {
      id: 'c1',
      name: 'Vincenzo "Vinnie" Maroni',
      occupation: 'Speakeasy Owner',
      personality: 'Gruff, suspicious, but fiercely loyal to his inner circle. Quick to anger.',
      secret: 'Is secretly cooperating with the police to avoid jail time for tax evasion.',
      is_victim: true,
      is_murderer: false,
      contribution_brief: {
        food: 'A box of cheap cigars',
        dress: 'Pinstripe suit, fedora',
        prop: 'A fake tommy gun'
      },
      preparation_prompts: [
        'How do you feel about Lola?',
        'What will you do if the police raid?'
      ]
    },
    {
      id: 'c2',
      name: 'Lola LaRue',
      occupation: 'Lounge Singer',
      personality: 'Glamorous, perceptive, always knows more than she lets on. Uses charm as a weapon.',
      secret: 'She was skimming the till, not the boss, to pay off her brother\'s gambling debts.',
      is_victim: false,
      is_murderer: true,
      contribution_brief: {
        food: 'Champagne',
        dress: 'Flapper dress, feather boa',
        prop: 'A long cigarette holder'
      },
      preparation_prompts: [
        'How do you feel about Vinnie?',
        'What will you do if he finds out you skimmed the till?'
      ]
    }
  ],
  crime: {
    victim_id: 'c1',
    murderer_id: 'c2',
    weapon: 'Poisoned whiskey glass',
    motive: 'Vinnie discovered Lola was skimming and threatened to hand her over to a rival gang.',
    timeline: [
      { order: 1, description: 'Vinnie confronts Lola in the back office before her 9 PM set.', act: 1 },
      { order: 2, description: 'Lola slips a fast-acting poison into Vinnie\'s scotch while he answers the phone.', act: 2 },
      { order: 3, description: 'Vinnie collapses just as the police raid begins at 10 PM.', act: 3 }
    ]
  }
};

import { EphemeraEngineVisualizer } from '../features/murder-mystery/screens/EphemeraEngineVisualizer';

export default function Sandbox() {
  const [activeTab, setActiveTab] = useState<'ephemera'|'components'|'setup'|'review'|'customization'|'packet'|'dashboard'|'phase6'>('phase6');
  const [selectedSetting, setSelectedSetting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Customization state
  const [scenarioState, setScenarioState] = useState(MOCK_SCENARIO);
  const MOCK_PARTICIPANTS = [
    { id: 'user-1', name: 'Alice', status: 'JOINED' as const },
    { id: 'user-2', name: 'Bob', status: 'JOINED' as const },
    { id: 'user-3', name: 'Charlie', status: 'RSVP' as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Component Sandbox</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('ephemera')} style={[styles.tab, activeTab === 'ephemera' && styles.activeTab]}><Text style={styles.tabText}>Ephemera Engine</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('components')} style={[styles.tab, activeTab === 'components' && styles.activeTab]}><Text style={styles.tabText}>Components</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('setup')} style={[styles.tab, activeTab === 'setup' && styles.activeTab]}><Text style={styles.tabText}>Setup</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('review')} style={[styles.tab, activeTab === 'review' && styles.activeTab]}><Text style={styles.tabText}>Review</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('customization')} style={[styles.tab, activeTab === 'customization' && styles.activeTab]}><Text style={styles.tabText}>Customization</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('packet')} style={[styles.tab, activeTab === 'packet' && styles.activeTab]}><Text style={styles.tabText}>Packet</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('dashboard')} style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}><Text style={styles.tabText}>Dashboard</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('phase6')} style={[styles.tab, activeTab === 'phase6' && styles.activeTab]}><Text style={styles.tabText}>Phase 6</Text></TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'ephemera' && (
          <View style={[styles.componentWrapper, { height: 900, padding: 0 }]}>
            <EphemeraEngineVisualizer scenario={MOCK_SCENARIO} />
          </View>
        )}

        {activeTab === 'dashboard' && (
          <View style={styles.section}>
            <ThreeActDashboardScreen
              sessionId="sandbox-session"
              initialScenario={MOCK_SCENARIO}
              onNavigateToClues={() => console.log('Navigate to clues')}
              onNavigateToReveal={() => console.log('Navigate to reveal')}
              onBeginAccusations={() => setActiveTab('phase6')}
            />
          </View>
        )}

        {activeTab === 'phase6' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accusation Submission</Text>
              <View style={[styles.componentWrapper, { height: 600, padding: 0 }]}>
                <AccusationFormScreen 
                  sessionId="sandbox-session"
                  scenario={MOCK_SCENARIO}
                  currentPlayerId="player-1"
                  onBack={() => alert('Back pressed')}
                  onSubmitSuccess={() => alert('Accusation sealed!')}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Awards Voting</Text>
              <View style={[styles.componentWrapper, { height: 600, padding: 0 }]}>
                <AwardsVotingScreen 
                  sessionId="sandbox-session"
                  scenario={MOCK_SCENARIO}
                  currentPlayerId="player-1"
                  currentPlayerCharacterId="c1"
                  onBack={() => alert('Back pressed')}
                  onSubmitSuccess={() => alert('Votes submitted!')}
                />
              </View>
            </View>
          </>
        )}

        {activeTab === 'packet' && (
          <View style={[styles.componentWrapper, { height: 800, padding: 0 }]}>
            <CharacterPacketScreen 
              scenario={scenarioState}
              characterId="c1"
            />
          </View>
        )}

        {activeTab === 'customization' && (
          <View style={[styles.componentWrapper, { height: 700, padding: 0 }]}>
            <CharacterCustomizationScreen 
              scenario={scenarioState}
              participants={MOCK_PARTICIPANTS}
              onSaveCharacter={(updatedChar) => {
                const chars = scenarioState.characters.map((c: any) => c.id === updatedChar.id ? updatedChar : c);
                setScenarioState({ ...scenarioState, characters: chars });
              }}
              onAssignCharacter={(charId, participantId) => {
                const chars = scenarioState.characters.map((c: any) => c.id === charId ? { ...c, assigned_to: participantId } : c);
                setScenarioState({ ...scenarioState, characters: chars });
              }}
              onDeliverPackets={() => alert('Packets Delivered!')}
            />
          </View>
        )}

        {activeTab === 'review' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Murder Mystery: Scenario Review</Text>
            <View style={[styles.componentWrapper, { height: 600, padding: 0 }]}>
              <ScenarioReviewScreen 
                scenario={MOCK_SCENARIO}
                onConfirm={() => alert('Confirmed!')}
                onRegenerate={() => alert('Regenerating...')}
              />
            </View>
          </View>
        )}

        {activeTab === 'setup' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Murder Mystery: Scenario Setup Screen</Text>
            <View style={[styles.componentWrapper, { height: 600, padding: 0 }]}>
              <ScenarioSetupScreen 
                onGenerate={(seed) => {
                  setIsGenerating(true);
                  setTimeout(() => {
                    alert(`Generating scenario with seed: ${JSON.stringify(seed)}`);
                    setIsGenerating(false);
                  }, 1500);
                }} 
                isGenerating={isGenerating}
              />
            </View>
          </View>
        )}

        {activeTab === 'components' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Murder Mystery: Character Entry</Text>
              <View style={styles.componentWrapper}>
                <CharacterEntry character={MOCK_SCENARIO.characters[0]} showSecret={true} assignedGuestName="John Doe" onPress={() => alert('Clicked!')} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Murder Mystery: SettingCard</Text>
              <View style={styles.componentWrapper}>
                <SettingCard 
                  title="The Velvet Lounge" 
                  era="1920s Prohibition" 
                  location="A hidden speakeasy beneath a legitimate pharmacy in Chicago" 
                  tension="The local mob boss just found out someone has been skimming from the till, and the police are set to raid in 2 hours." 
                  description="Jazz music blares to cover the sound of hushed, desperate conversations. The air is thick with smoke, cheap perfume, and fear. Everyone here has a secret they'd kill to keep." 
                  selected={selectedSetting}
                  onSelect={() => setSelectedSetting(!selectedSetting)}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Invitation</Text>
              <View style={styles.componentWrapper}>
                <SessionInvitation session={MOCK_SESSION as any} onAccept={() => {}} onDecline={() => {}} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contribution Brief</Text>
              <View style={styles.componentWrapper}>
                <ContributionBrief contribution={MOCK_SESSION.config.required_contributions[0]} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  componentWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4338CA',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  content: {
    flex: 1,
  }
});
