import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { MurderMysteryData } from '../types/murder-mystery';
import { murderMysteryArtifactService } from '../services/murderMysteryArtifactService';

interface EphemeraEngineVisualizerProps {
  scenario: MurderMysteryData;
}

export const EphemeraEngineVisualizer: React.FC<EphemeraEngineVisualizerProps> = ({ scenario }) => {
  const [activeArtifact, setActiveArtifact] = useState<'dossier' | 'menu' | 'envelope'>('dossier');
  
  const dossierData = murderMysteryArtifactService.assembleDossierData(scenario);
  const menuData = murderMysteryArtifactService.assembleMenuData(scenario);
  // Pick the first character's envelope for visualization
  const characterId = scenario.characters[0]?.id;
  const envelopeData = characterId ? murderMysteryArtifactService.assembleSealedEnvelopeData(scenario, characterId) : null;

  const generateHTML = (artifactType: string) => {
    // Generate beautiful HTML for PDF printing based on the artifact type
    if (artifactType === 'dossier') {
      return `
        <html>
          <head>
            <style>
              body { font-family: 'Courier New', Courier, monospace; padding: 40px; background-color: #fdfbf7; color: #1a1a1a; }
              .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
              .stamp { color: #8b0000; font-size: 24px; font-weight: bold; border: 3px solid #8b0000; padding: 10px; display: inline-block; transform: rotate(-5deg); margin: 20px 0; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 20px; font-weight: bold; background-color: #1a1a1a; color: white; padding: 5px 10px; display: inline-block; margin-bottom: 15px; }
              .content { line-height: 1.6; }
              .character-box { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; background-color: white; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${dossierData.title}</div>
              <div class="stamp">TOP SECRET // CONFIDENTIAL</div>
            </div>
            
            <div class="section">
              <div class="section-title">CASE OVERVIEW: THE CRIME</div>
              <div class="content">
                <strong>Victim:</strong> ${dossierData.crime.victim}<br/>
                <strong>Method:</strong> ${dossierData.crime.method}<br/>
                <strong>Location:</strong> ${dossierData.crime.location}<br/><br/>
                <em>${dossierData.crime.description}</em>
              </div>
            </div>

            <div class="section">
              <div class="section-title">SETTING BRIEFING</div>
              <div class="content">
                <strong>Era:</strong> ${dossierData.setting.era}<br/>
                <strong>Locale:</strong> ${dossierData.setting.location}<br/>
              </div>
            </div>

            <div class="section">
              <div class="section-title">PERSONS OF INTEREST</div>
              ${dossierData.characters.map(c => `
                <div class="character-box">
                  <strong>${c.name} (${c.archetype})</strong><br/>
                  <em>Motive: ${c.motive}</em><br/><br/>
                  Public Info: ${c.public_knowledge}
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `;
    }
    
    if (artifactType === 'menu') {
      return `
        <html>
          <head>
            <style>
              body { font-family: 'Georgia', serif; padding: 60px; background-color: #faf9f6; text-align: center; color: #2c3e50; }
              .border { border: 4px double #2c3e50; padding: 40px; min-height: 800px; }
              .title { font-size: 48px; font-weight: normal; font-style: italic; margin-bottom: 40px; }
              .subtitle { font-size: 20px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 60px; }
              .course { margin-bottom: 40px; }
              .course-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #2c3e50; display: inline-block; padding-bottom: 5px; margin-bottom: 20px; }
              .dish { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .contributor { font-size: 14px; font-style: italic; color: #7f8c8d; }
            </style>
          </head>
          <body>
            <div class="border">
              <div class="title">${menuData.title}</div>
              <div class="subtitle">An Evening to Remember</div>
              
              ${menuData.recipes?.length ? menuData.recipes.map((r, i) => `
                <div class="course">
                  <div class="course-title">Course ${i + 1}</div>
                  <div class="dish">${r.recipe}</div>
                  <div class="contributor">Prepared by ${r.contributor}</div>
                </div>
              `).join('') : '<div class="course"><div class="dish">A surprise awaits...</div></div>'}
            </div>
          </body>
        </html>
      `;
    }

    if (artifactType === 'envelope' && envelopeData) {
      return `
        <html>
          <head>
            <style>
              body { font-family: 'Times New Roman', Times, serif; padding: 40px; background-color: #e8dcc4; color: #3d2b1f; }
              .wax-seal { text-align: center; color: #8b0000; font-size: 60px; margin-bottom: 40px; }
              .warning { text-align: center; font-weight: bold; font-size: 20px; text-transform: uppercase; border: 2px solid #3d2b1f; padding: 15px; margin-bottom: 50px; }
              .content { font-size: 18px; line-height: 1.8; text-align: justify; }
              .salutation { font-size: 24px; font-style: italic; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="wax-seal">♚</div>
            <div class="warning">Do Not Open Until Act 3</div>
            
            <div class="salutation">${envelopeData.title}</div>
            <div class="content">
              ${envelopeData.envelope.content}
              <br/><br/>
              <strong>Condition:</strong> ${envelopeData.envelope.condition}
            </div>
          </body>
        </html>
      `;
    }
    
    return '<html><body>Error generating PDF</body></html>';
  };

  const printArtifact = async () => {
    try {
      const html = generateHTML(activeArtifact);
      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console.');
    }
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
