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
  }
};
