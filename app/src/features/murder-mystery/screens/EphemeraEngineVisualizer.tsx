import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MurderMysteryData } from '../types/murder-mystery';
import { ephemeraPrintService } from '../services/ephemeraPrintService';

interface EphemeraEngineVisualizerProps {
  scenario: MurderMysteryData;
}

export const EphemeraEngineVisualizer: React.FC<EphemeraEngineVisualizerProps> = ({ scenario }) => {
  const [activeArtifact, setActiveArtifact] = useState<'dossier' | 'menu' | 'envelope' | 'report'>('dossier');
  
  const generateHTML = (artifactType: string) => {
    let data;
    switch(artifactType) {
      case 'dossier':
        data = murderMysteryArtifactService.assembleDossierData(scenario);
        break;
      case 'menu':
        data = murderMysteryArtifactService.assembleMenuData(scenario);
        break;
      case 'envelope':
        const characterId = scenario.characters[0]?.id;
        data = characterId ? murderMysteryArtifactService.assembleSealedEnvelopeData(scenario, characterId) : null;
        break;
      case 'report':
        data = murderMysteryArtifactService.assembleFinalReportData(scenario);
        break;
      default:
        data = {};
    }
    return ephemeraPrintService.generateHTML(artifactType, data);
  };

  const printArtifact = async () => {
    const html = generateHTML(activeArtifact);
    await ephemeraPrintService.printHtmlAsync(html);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Ephemera Engine</Text>
        <Text style={styles.sidebarSubtitle}>Printable Artifact Generation</Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, activeArtifact === 'dossier' && styles.menuItemActive]}
          onPress={() => setActiveArtifact('dossier')}
        >
          <Ionicons name="folder-open-outline" size={20} color={activeArtifact === 'dossier' ? '#4338CA' : '#666'} />
          <Text style={[styles.menuText, activeArtifact === 'dossier' && styles.menuTextActive]}>Case Dossier</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, activeArtifact === 'menu' && styles.menuItemActive]}
          onPress={() => setActiveArtifact('menu')}
        >
          <Ionicons name="restaurant-outline" size={20} color={activeArtifact === 'menu' ? '#4338CA' : '#666'} />
          <Text style={[styles.menuText, activeArtifact === 'menu' && styles.menuTextActive]}>Event Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, activeArtifact === 'envelope' && styles.menuItemActive]}
          onPress={() => setActiveArtifact('envelope')}
        >
          <Ionicons name="mail-outline" size={20} color={activeArtifact === 'envelope' ? '#4338CA' : '#666'} />
          <Text style={[styles.menuText, activeArtifact === 'envelope' && styles.menuTextActive]}>Sealed Envelopes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, activeArtifact === 'report' && styles.menuItemActive]}
          onPress={() => setActiveArtifact('report')}
        >
          <Ionicons name="document-text-outline" size={20} color={activeArtifact === 'report' ? '#4338CA' : '#666'} />
          <Text style={[styles.menuText, activeArtifact === 'report' && styles.menuTextActive]}>Final Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.printButton} onPress={printArtifact}>
          <Ionicons name="print-outline" size={20} color="#FFF" />
          <Text style={styles.printButtonText}>Generate PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewArea}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>
            {activeArtifact === 'dossier' && 'Dossier Preview'}
            {activeArtifact === 'menu' && 'Menu Preview'}
            {activeArtifact === 'envelope' && 'Envelope Preview'}
            {activeArtifact === 'report' && 'Final Report Preview'}
          </Text>
        </View>
        
        <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewContent}>
          {/* We use an iframe on web to render the exact HTML that will be printed */}
          {Platform.OS === 'web' ? (
            <iframe 
              srcDoc={generateHTML(activeArtifact)} 
              style={{ width: '100%', height: '800px', border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#fff' }} 
            />
          ) : (
            <View style={styles.fallbackPreview}>
              <Text>Preview requires Web platform or react-native-webview.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    padding: 20,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sidebarSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  menuText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
  },
  menuTextActive: {
    color: '#4338CA',
    fontWeight: '600',
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4338CA',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 'auto',
  },
  printButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  previewArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  previewHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    padding: 40,
    alignItems: 'center',
  },
  fallbackPreview: {
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  }
});
