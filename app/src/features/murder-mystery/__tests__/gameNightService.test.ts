import { GameNightService } from '../../services/gameNightService';
import { MurderMysteryData } from '../../types/murder-mystery';

describe('GameNightService', () => {
  const mockScenario: MurderMysteryData = {
    title: 'Mystery',
    theme: 'Theme',
    scenario_type: 'SEALED_ENVELOPE',
    setting: { location: 'L', year: 'Y', description: 'D', background_secrets: [] },
    characters: [],
    crime: { victim_id: 'v', murderer_id: 'm', weapon: 'w', motive: 'm', red_herrings: [], timeline: [] },
    acts: [],
    awards: [],
  };

  it('advances acts and records timestamps', async () => {
    const updated1 = await GameNightService.advanceAct('session_1', mockScenario, 1);
    expect(updated1.game_night?.act_timestamps.length).toBe(1);
    expect(updated1.game_night?.act_timestamps[0].act).toBe(1);

    const updated2 = await GameNightService.advanceAct('session_1', updated1, 2);
    expect(updated2.game_night?.act_timestamps.length).toBe(2);
    expect(updated2.game_night?.act_timestamps[1].act).toBe(2);
  });
});
