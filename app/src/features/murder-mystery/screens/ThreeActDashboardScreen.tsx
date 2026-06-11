import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { MurderMysteryData } from '../types/murder-mystery';
import { useGameNight } from '../hooks/useGameNight';
import { useClues } from '../hooks/useClues';
import { ActProgressIndicator } from '../components/ActProgressIndicator';

interface ThreeActDashboardScreenProps {
  sessionId: string;
  initialScenario: MurderMysteryData;
  onNavigateToClues: () => void;
  onNavigateToReveal: () => void;
}

export const ThreeActDashboardScreen: React.FC<ThreeActDashboardScreenProps> = ({
  sessionId,
  initialScenario,
  onNavigateToClues,
  onNavigateToReveal
}) => {
  // Ambient mode wake lock
  useKeepAwake();

  const { scenario, currentAct, advanceAct, isProcessing } = useGameNight(sessionId, initialScenario);
  const { getDistributedClues } = useClues(sessionId, scenario);
  
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const [undoToastVisible, setUndoToastVisible] = useState(false);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [previousAct, setPreviousAct] = useState<number>(0);

  const displayAct = currentAct === 0 ? 1 : currentAct;

  const handleAdvanceAct = async (nextAct: number) => {
    setPreviousAct(currentAct);
    await advanceAct(nextAct);
    
    // Show undo toast
    setUndoToastVisible(true);
    if (undoTimer) clearTimeout(undoTimer);
    const timer = setTimeout(() => {
      setUndoToastVisible(false);
    }, 5000); // 5 seconds for toast in this demo
    setUndoTimer(timer);
  };

  const handleUndo = async () => {
    if (undoTimer) clearTimeout(undoTimer);
    setUndoToastVisible(false);
    await advanceAct(previousAct);
  };

  // Act Views
  const renderAct1View = () => (
    <View style={styles.actContainer}>
      <Text style={styles.actHeader}>Act I: The Gathering</Text>
      <Text style={styles.actDescription}>
        Guests arrive, mingle, and introduce themselves. They must complete their character introduction checklists.
      </Text>
      
      <View style={styles.rosterContainer}>
        <Text style={styles.sectionTitle}>Player Roster ({scenario.characters.length})</Text>
        {scenario.characters.map((char) => (
          <View key={char.id} style={styles.rosterItem}>
            <Text style={styles.rosterName}>{char.name}</Text>
            <Text style={styles.rosterRole}>{char.occupation}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => handleAdvanceAct(2)}
        disabled={isProcessing}
      >
        <Text style={styles.primaryButtonText}>Begin Act II</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAct2View = () => (
    <View style={styles.actContainer}>
      <Text style={styles.actHeader}>Act II: The Investigation</Text>
      <Text style={styles.actDescription}>
        The crime is revealed! Guests must now find clues and interrogate each other.
      </Text>
      
      <TouchableOpacity style={styles.dangerButton}>
        <Text style={styles.dangerButtonText}>Reveal the Crime</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{getDistributedClues().length} / {scenario.clues.length}</Text>
          <Text style={styles.statLabel}>Clues Found</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={onNavigateToClues}
      >
        <Text style={styles.secondaryButtonText}>Manage Clues</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.primaryButton, { marginTop: 24 }]}
        onPress={() => handleAdvanceAct(3)}
        disabled={isProcessing}
      >
        <Text style={styles.primaryButtonText}>Begin Act III</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAct3View = () => (
    <View style={styles.actContainer}>
      <Text style={styles.actHeader}>Act III: The Accusation</Text>
      <Text style={styles.actDescription}>
        All evidence is laid bare. Guests must lock in their final accusations and vote for awards.
      </Text>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Begin Accusations</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{scenario.game_night.accusations?.length || 0}</Text>
          <Text style={styles.statLabel}>Submissions</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={onNavigateToReveal}
      >
        <Text style={styles.primaryButtonText}>The Reveal</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Host Dashboard</Text>
        <TouchableOpacity onPress={() => setShowEmergencyOverlay(true)}>
          <Ionicons name="help-buoy-outline" size={24} color="#fcd34d" />
        </TouchableOpacity>
      </View>

      <ActProgressIndicator currentAct={displayAct} />

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ padding: 20 }}>
        {displayAct === 1 && renderAct1View()}
        {displayAct === 2 && renderAct2View()}
        {displayAct === 3 && renderAct3View()}
      </ScrollView>

      {undoToastVisible && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>Act Advanced</Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoText}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Emergency Overlay */}
      <Modal visible={showEmergencyOverlay} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.emergencyContainer}>
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyTitle}>Emergency Reference</Text>
            <TouchableOpacity onPress={() => setShowEmergencyOverlay(false)}>
              <Ionicons name="close-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.emergencyContent}>
            <Text style={styles.emergencyText}>
              Victim: {scenario.characters.find(c => c.is_victim)?.name}
            </Text>
            <Text style={styles.emergencyText}>
              Murderer: {scenario.characters.find(c => c.is_murderer)?.name}
            </Text>
            <Text style={styles.emergencyText}>
              Weapon: {scenario.crime.weapon}
            </Text>
            <Text style={styles.emergencyText}>
              Motive: {scenario.crime.motive}
            </Text>
            {/* Full raw dump for safety */}
            <Text style={styles.codeText}>{JSON.stringify(scenario, null, 2)}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Dark bg for ambient mode
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  scrollContent: {
    flex: 1,
  },
  actContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  actHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 8,
  },
  actDescription: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  rosterContainer: {
    marginBottom: 24,
  },
  rosterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  rosterName: {
    color: '#f3f4f6',
    fontSize: 16,
  },
  rosterRole: {
    color: '#9ca3af',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fcd34d',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#fcd34d', // Warm amber
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#92400e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  toastText: {
    color: '#f3f4f6',
    fontSize: 16,
    marginRight: 16,
  },
  undoText: {
    color: '#fcd34d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emergencyContainer: {
    flex: 1,
    backgroundColor: '#991b1b', // Red bg for emergency
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#b91c1c',
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyContent: {
    padding: 20,
  },
  emergencyText: {
    fontSize: 18,
    color: '#fecaca',
    marginBottom: 12,
    fontWeight: '600',
  },
  codeText: {
    marginTop: 24,
    fontFamily: 'monospace',
    color: '#fca5a5',
    fontSize: 12,
  }
});
