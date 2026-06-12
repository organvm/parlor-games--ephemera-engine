import { CharacterService } from '../../services/characterService';
import { MurderMysteryData } from '../../types/murder-mystery';

describe('CharacterService', () => {
  const mockScenario: MurderMysteryData = {
    title: 'Mystery',
    theme: 'Theme',
    scenario_type: 'SEALED_ENVELOPE',
    setting: { location: 'L', year: 'Y', description: 'D', background_secrets: [] },
    characters: [
      {
        id: 'c1', name: 'Alice', occupation: 'Maid', background: 'x', public_description: 'y',
        secret_objective: { target_character_id: 'c2', description: 'z' },
        is_murderer: false, is_victim: false,
        contribution_brief: { food: 'a', dress: 'b', prop: 'c' },
        preparation_prompts: [], assigned_to: null
      },
      {
        id: 'c2', name: 'Bob', occupation: 'Butler', background: 'x', public_description: 'y',
        secret_objective: { target_character_id: 'c1', description: 'z' },
        is_murderer: true, is_victim: false,
        contribution_brief: { food: 'a', dress: 'b', prop: 'c' },
        preparation_prompts: [], assigned_to: null
      }
    ],
    crime: { victim_id: 'v', murderer_id: 'm', weapon: 'w', motive: 'm', red_herrings: [], timeline: [] },
    acts: [],
    awards: [],
  };

  it('assigns characters manually', async () => {
    const updated = await CharacterService.assignCharacters('session_1', mockScenario, { 'c1': 'user_1' });
    expect(updated.characters.find(c => c.id === 'c1')?.assigned_to).toBe('user_1');
    expect(updated.characters.find(c => c.id === 'c2')?.assigned_to).toBe(null);
  });

  it('auto-assigns characters', () => {
    const assignments = CharacterService.autoAssign(mockScenario, ['user_1', 'user_2', 'user_3']);
    // Since there are only 2 characters, only 2 get assigned
    expect(assignments['c1']).toBe('user_1');
    expect(assignments['c2']).toBe('user_2');
    expect(Object.keys(assignments).length).toBe(2);
  });
});
