import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MurderMysteryData } from '../types/murder-mystery';
import { murderMysteryArtifactService } from '../services/murderMysteryArtifactService';
import { ephemeraPrintService } from '../services/ephemeraPrintService';

interface FinalReportScreenProps {
  scenario: MurderMysteryData;
  isHost: boolean;
  onExit: () => void;
}

export const FinalReportScreen: React.FC<FinalReportScreenProps> = ({ scenario, isHost, onExit }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  
  const reportData = murderMysteryArtifactService.assembleFinalReportData(scenario);

  const handlePrint = async () => {
    setIsPrinting(true);
    const html = ephemeraPrintService.generateHTML('report', reportData);
    await ephemeraPrintService.printHtmlAsync(html);
    setIsPrinting(false);
  };

  const trueMurderer = scenario.characters.find(c => c.is_murderer);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>The Ephemera</Text>
        <TouchableOpacity onPress={onExit}>
          <Ionicons name="close" size={28} color="#fcd34d" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.subtitle}>The Post-Mortem</Text>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>The Truth Revealed</Text>
          <Text style={styles.textLabel}>The Murderer:</Text>
          <Text style={styles.textValue}>{trueMurderer?.name || 'Unknown'}</Text>
          <Text style={styles.textLabel}>The True Motive:</Text>
          <Text style={styles.textValue}>{scenario.crime.motive}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Awards & Honors</Text>
          {reportData.awards && reportData.awards.length > 0 ? (
            reportData.awards.map((award: any, i: number) => (
              <View key={i} style={styles.awardItem}>
                <Ionicons name="trophy" size={24} color="#d4af37" />
                <View style={styles.awardInfo}>
                  <Text style={styles.awardCategory}>{award.category}</Text>
                  <Text style={styles.awardWinner}>{award.winner} ({award.votes} votes)</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No awards were voted on.</Text>
          )}
        </View>

        {isHost && (
          <TouchableOpacity 
            style={styles.printButton}
            onPress={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="print" size={20} color="#fff" />
                <Text style={styles.printButtonText}>Generate Official PDF</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fcd34d',
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 8,
  },
  textLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    marginBottom: 4,
  },
  textValue: {
    fontSize: 18,
    color: '#f3f4f6',
    fontWeight: '500',
  },
  awardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
  },
  awardInfo: {
    marginLeft: 16,
  },
  awardCategory: {
    fontSize: 14,
    color: '#d1d5db',
  },
  awardWinner: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fcd34d',
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  printButton: {
    flexDirection: 'row',
    backgroundColor: '#4338ca',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  }
});
