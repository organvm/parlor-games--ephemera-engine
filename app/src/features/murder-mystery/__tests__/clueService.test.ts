import { ClueService } from '../../services/clueService';
import { MurderMysteryData } from '../../types/murder-mystery';

describe('ClueService', () => {
  const mockScenario: MurderMysteryData = {
    title: 'Mystery',
    theme: 'Theme',
    scenario_type: 'SEALED_ENVELOPE',
    setting: { location: 'L', year: 'Y', description: 'D', background_secrets: [] },
    characters: [],
    crime: { victim_id: 'v', murderer_id: 'm', weapon: 'w', motive: 'm', red_herrings: [], timeline: [] },
    acts: [],
    awards: [],
    game_night: {
      act_timestamps: [],
      clues_distributed: [],
      evidence_reveals: [],
      accusations: []
    }
  };

  it('distributes a clue to the group', async () => {
    const updated = await ClueService.distributeClue('session_1', mockScenario, 'clue_1', 'char_1');
    expect(updated.game_night?.clues_distributed.length).toBe(1);
    expect(updated.game_night?.clues_distributed[0].clue_id).toBe('clue_1');
    expect(updated.game_night?.clues_distributed[0].found_by).toBe('char_1');
  });

  it('does not duplicate clues if distributed again', async () => {
    const step1 = await ClueService.distributeClue('session_1', mockScenario, 'clue_1', 'char_1');
    const step2 = await ClueService.distributeClue('session_1', step1, 'clue_1', 'char_2');
    
    // It should replace the old one since filter is used
    expect(step2.game_night?.clues_distributed.length).toBe(1);
    expect(step2.game_night?.clues_distributed[0].clue_id).toBe('clue_1');
    expect(step2.game_night?.clues_distributed[0].found_by).toBe('char_2');
  });
});
