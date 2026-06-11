import { describe, it, expect } from 'vitest';
import { murderMysteryArtifactService } from '../../src/features/murder-mystery/services/murderMysteryArtifactService';
import { MurderMysteryData } from '../../src/features/murder-mystery/types/murder-mystery';

const mockScenario: MurderMysteryData = {
  setting_seed: {
    source: 'curated',
    era: '1920s',
    location: 'Manor',
    milieu: 'High Society',
    tension: 'Greed',
    setting_description: 'A dark and stormy night.',
    crime_scene: 'Library',
    generated_by: 'human'
  },
  characters: [
    {
      id: 'c1',
      name: 'Lord Arthur',
      occupation: 'Aristocrat',
      personality: 'Snobby',
      secret: 'Broke',
      relationship: { target_character_id: 'c2', description: 'Rivals' },
      is_murderer: true,
      is_victim: false,
      contribution_brief: { food: 'Caviar', dress: 'Tuxedo', prop: 'Cane' },
      preparation_prompts: [],
      assigned_to: 'p1'
    },
    {
      id: 'c2',
      name: 'Lady Eleanor',
      occupation: 'Heiress',
      personality: 'Charming',
      secret: 'Affair',
      relationship: { target_character_id: 'c1', description: 'Lovers' },
      is_murderer: false,
      is_victim: true,
      contribution_brief: { food: 'Champagne', dress: 'Gown', prop: 'Fan' },
      preparation_prompts: [],
      assigned_to: 'p2'
    }
  ],
  crime: {
    victim_id: 'c2',
    murderer_id: 'c1',
    weapon: 'Poison',
    motive: 'Inheritance',
    red_herrings: [],
    timeline: []
  },
  clues: [],
  game_night: {
    act_timestamps: [],
    clues_distributed: [],
    evidence_reveals: [],
    accusations: [],
    award_votes: []
  },
  awards: [],
  sealed_envelopes: [
    {
      character_id: 'c1',
      player_id: 'p1',
      text: 'Arthur was caught at the border.',
      delivered: false
    }
  ]
};

describe('Artifact Generation Integration', () => {
  it('should assemble Dossier artifact payload correctly', () => {
    const payload = murderMysteryArtifactService.assembleDossierData(mockScenario);
    
    expect(payload.artifact_type).toBe('mm_dossier');
    expect(payload.characters.length).toBe(2);
    expect(payload.crime.weapon).toBe('Poison');
  });

  it('should assemble Menu of the Damned artifact payload correctly', () => {
    const payload = murderMysteryArtifactService.assembleMenuData(mockScenario);
    
    expect(payload.artifact_type).toBe('mm_menu');
    expect(payload.recipes?.length).toBe(2);
    expect(payload.recipes?.[0].recipe).toBe('Caviar');
  });

  it('should assemble Sealed Envelope artifact payload correctly', () => {
    const payload = murderMysteryArtifactService.assembleSealedEnvelopeData(mockScenario, 'c1');
    
    expect(payload).not.toBeNull();
    expect(payload?.artifact_type).toBe('mm_sealed_envelope');
    expect(payload?.envelope.text).toBe('Arthur was caught at the border.');
  });
});
