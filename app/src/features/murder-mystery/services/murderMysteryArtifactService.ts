import { MurderMysteryData } from '../types/murder-mystery';

export interface ArtifactPayload {
  artifact_type: string;
  title: string;
  setting: any;
  characters: any[];
  crime: any;
  clues: any[];
  accusations: any[];
  awards: any[];
  recipes?: any[];
  envelope?: any;
}

export const murderMysteryArtifactService = {
  assembleDossierData: (scenario: MurderMysteryData): ArtifactPayload => {
    return {
      artifact_type: 'mm_dossier',
      title: 'The Official Case Dossier',
      setting: scenario.setting_seed,
      characters: scenario.characters,
      crime: scenario.crime,
      clues: scenario.clues,
      accusations: scenario.game_night?.accusations || [],
      awards: scenario.game_night?.award_votes || []
    };
  },

  assembleMenuData: (scenario: MurderMysteryData): ArtifactPayload => {
    const recipes = scenario.characters
      .filter(c => c.contribution_brief?.food)
      .map(c => ({
        contributor: c.name,
        recipe: c.contribution_brief.food
      }));

    return {
      artifact_type: 'mm_menu',
      title: 'Menu of the Damned',
      setting: scenario.setting_seed,
      characters: scenario.characters,
      crime: scenario.crime,
      clues: [],
      accusations: [],
      awards: [],
      recipes
    };
  },

  assembleSealedEnvelopeData: (scenario: MurderMysteryData, characterId: string): ArtifactPayload | null => {
    const envelope = scenario.sealed_envelopes?.find(e => e.character_id === characterId);
    if (!envelope) return null;

    const character = scenario.characters.find(c => c.id === characterId);

    return {
      artifact_type: 'mm_sealed_envelope',
      title: `Epilogue: ${character?.name}`,
      setting: scenario.setting_seed,
      characters: scenario.characters,
      crime: scenario.crime,
      clues: [],
      accusations: [],
      awards: [],
      envelope
    };
  },

  assembleFinalReportData: (scenario: MurderMysteryData): ArtifactPayload => {
    // Tally awards to find winners
    const awardVotes = scenario.game_night?.award_votes || [];
    const voteTallies: Record<string, Record<string, number>> = {};
    
    awardVotes.forEach(vote => {
      if (!voteTallies[vote.category]) {
        voteTallies[vote.category] = {};
      }
      voteTallies[vote.category][vote.nominee_character_id] = (voteTallies[vote.category][vote.nominee_character_id] || 0) + 1;
    });

    const calculatedAwards = Object.keys(voteTallies).map(category => {
      const nominees = voteTallies[category];
      const winnerId = Object.keys(nominees).reduce((a, b) => nominees[a] > nominees[b] ? a : b);
      const winnerChar = scenario.characters.find(c => c.id === winnerId);
      return {
        category,
        winner: winnerChar?.name || 'Unknown',
        votes: nominees[winnerId]
      };
    });

    return {
      artifact_type: 'mm_final_report',
      title: 'The Ephemera Post-Mortem',
      setting: scenario.setting_seed,
      characters: scenario.characters,
      crime: scenario.crime,
      clues: scenario.clues,
      accusations: scenario.game_night?.accusations || [],
      awards: calculatedAwards
    };
  }
};
