import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

export const ephemeraPrintService = {
  generateHTML: (artifactType: string, artifactData: any) => {
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
              <div class="title">${artifactData.title}</div>
              <div class="stamp">TOP SECRET // CONFIDENTIAL</div>
            </div>
            
            <div class="section">
              <div class="section-title">CASE OVERVIEW: THE CRIME</div>
              <div class="content">
                <strong>Victim:</strong> ${artifactData.crime.victim}<br/>
                <strong>Method:</strong> ${artifactData.crime.method}<br/>
                <strong>Location:</strong> ${artifactData.crime.location}<br/><br/>
                <em>${artifactData.crime.description}</em>
              </div>
            </div>

            <div class="section">
              <div class="section-title">SETTING BRIEFING</div>
              <div class="content">
                <strong>Era:</strong> ${artifactData.setting.era}<br/>
                <strong>Locale:</strong> ${artifactData.setting.location}<br/>
              </div>
            </div>

            <div class="section">
              <div class="section-title">PERSONS OF INTEREST</div>
              ${artifactData.characters.map((c: any) => `
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
              <div class="title">${artifactData.title}</div>
              <div class="subtitle">An Evening to Remember</div>
              
              ${artifactData.recipes?.length ? artifactData.recipes.map((r: any, i: number) => `
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

    if (artifactType === 'envelope' && artifactData.envelope) {
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
            
            <div class="salutation">${artifactData.title}</div>
            <div class="content">
              ${artifactData.envelope.content}
              <br/><br/>
              <strong>Condition:</strong> ${artifactData.envelope.condition}
            </div>
          </body>
        </html>
      `;
    }
    
    if (artifactType === 'report') {
      return `
        <html>
          <head>
            <style>
              body { font-family: 'Courier New', Courier, monospace; padding: 40px; background-color: #fdfbf7; color: #1a1a1a; }
              .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 20px; font-weight: bold; background-color: #1a1a1a; color: white; padding: 5px 10px; display: inline-block; margin-bottom: 15px; }
              .content { line-height: 1.6; }
              .winner-box { border: 2px solid #d4af37; padding: 15px; margin-bottom: 15px; background-color: #fff9e6; text-align: center; }
              .winner-category { font-size: 18px; font-weight: bold; color: #8b6508; }
              .winner-name { font-size: 24px; margin-top: 10px; }
              .winner-votes { font-size: 14px; color: #666; margin-top: 5px; }
              .accusation-box { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${artifactData.title}</div>
            </div>
            
            <div class="section">
              <div class="section-title">THE TRUTH REVEALED</div>
              <div class="content">
                <strong>The Murderer:</strong> ${artifactData.characters.find((c: any) => c.is_murderer)?.name || 'Unknown'}<br/>
                <strong>The Motive:</strong> ${artifactData.crime.motive || 'A tale as old as time...'}<br/>
              </div>
            </div>

            <div class="section">
              <div class="section-title">AWARDS & HONORS</div>
              ${artifactData.awards && artifactData.awards.length > 0 ? artifactData.awards.map((a: any) => `
                <div class="winner-box">
                  <div class="winner-category">${a.category}</div>
                  <div class="winner-name">${a.winner}</div>
                  <div class="winner-votes">with ${a.votes} votes</div>
                </div>
              `).join('') : '<div class="content">No awards recorded.</div>'}
            </div>

            <div class="section">
              <div class="section-title">ACCUSATIONS RENDERED</div>
              ${artifactData.accusations && artifactData.accusations.length > 0 ? artifactData.accusations.map((acc: any) => {
                const accuserName = artifactData.characters.find((c: any) => c.assigned_to === acc.player_id)?.name || 'Someone';
                const accusedName = artifactData.characters.find((c: any) => c.id === acc.accused_character_id)?.name || 'Someone';
                return `
                <div class="accusation-box">
                  <strong>${accuserName}</strong> accused <strong>${accusedName}</strong><br/>
                  <em>Method:</em> ${acc.method}<br/>
                  <em>Motive:</em> ${acc.motive}
                </div>
              `}).join('') : '<div class="content">No accusations recorded.</div>'}
            </div>
          </body>
        </html>
      `;
    }
    
    return '<html><body>Error generating PDF</body></html>';
  },

  printHtmlAsync: async (html: string) => {
    try {
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return true;
      }

      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Share or Save Generated Ephemera'
        });
      } else {
        Alert.alert('PDF Saved', \`Your file has been saved to: \${uri}\`);
      }
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF.');
      return false;
    }
  }
};
