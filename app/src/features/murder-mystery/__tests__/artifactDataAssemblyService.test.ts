import { ArtifactDataAssemblyService } from '../../services/artifactDataAssemblyService';
import { MurderMysteryData } from '../../types/murder-mystery';

describe('ArtifactDataAssemblyService', () => {
  const mockScenario: MurderMysteryData = {
    title: 'Mystery at the Manor',
    theme: '1920s',
    scenario_type: 'SEALED_ENVELOPE',
    setting: {
      location: 'Manor',
      year: '1920',
      description: 'A spooky manor',
      background_secrets: []
    },
    characters: [
      {
        id: 'c1', name: 'Alice', occupation: 'Maid', background: 'x', public_description: 'y',
        secret_objective: { target_character_id: 'c2', description: 'z' },
        is_murderer: false, is_victim: false,
        contribution_brief: { food: 'a', dress: 'b', prop: 'c' },
        preparation_prompts: [], assigned_to: 'user1'
      },
      {
        id: 'c2', name: 'Bob', occupation: 'Butler', background: 'x', public_description: 'y',
        secret_objective: { target_character_id: 'c1', description: 'z' },
        is_murderer: true, is_victim: false,
        contribution_brief: { food: 'a', dress: 'b', prop: 'c' },
        preparation_prompts: [], assigned_to: 'user2'
      },
      {
        id: 'c3', name: 'Charlie', occupation: 'Lord', background: 'x', public_description: 'y',
        secret_objective: { target_character_id: 'c1', description: 'z' },
        is_murderer: false, is_victim: true,
        contribution_brief: { food: 'a', dress: 'b', prop: 'c' },
        preparation_prompts: [], assigned_to: 'user3'
      }
    ],
    crime: {
      victim_id: 'c3',
      murderer_id: 'c2',
      weapon: 'Candlestick',
      motive: 'Revenge',
      red_herrings: [],
      timeline: [{ order: 1, description: 'Lights went out' }]
    },
    acts: [],
    awards: [],
    game_night: {
      act_timestamps: [],
      clues_distributed: ['clue1', 'clue2'],
      evidence_reveals: [],
      accusations: [
        { accuser_id: 'c1', accused_id: 'c2', theory: 'Saw him!', timestamp: 'time' },
        { accuser_id: 'c3', accused_id: 'c1', theory: 'Revenge', timestamp: 'time' }
      ]
    }
  };

  it('assembles dossier payload correctly', () => {
    const payload = ArtifactDataAssemblyService.assembleDossierPayload('session123', mockScenario);

    expect(payload.session_id).toBe('session123');
    expect(payload.artifact_type).toBe('mm_dossier');
    expect(payload.data.title).toBe('Mystery at the Manor');
    expect(payload.data.outcome.murderer).toBe('Bob');
    expect(payload.data.outcome.victim).toBe('Charlie');
    expect(payload.data.outcome.total_accusations).toBe(2);
    expect(payload.data.outcome.correct_accusations).toBe(1); // c1 guessed c2
    expect(payload.data.timeline.length).toBe(1);
    expect(payload.data.clues_found).toBe(2);
  });
});
