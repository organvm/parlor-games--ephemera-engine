import { supabase } from '../../../lib/supabase';
import { MurderMysteryData, GameNightState } from '../types/murder-mystery';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export class ClueService {
  /**
   * Records that a clue has been found/distributed to the group.
   */
  static async distributeClue(
    sessionId: string,
    scenario: MurderMysteryData,
    clueId: string,
    foundByCharacterId?: string
  ): Promise<MurderMysteryData> {
    const newDistribution = {
      clue_id: clueId,
      found_by: foundByCharacterId,
      found_at: new Date().toISOString()
    };
    
    const currentGameNight = scenario.game_night || {
      act_timestamps: [],
      clues_distributed: [],
      evidence_reveals: [],
      accusations: []
    };

    const updatedGameNight: GameNightState = {
      ...currentGameNight,
      clues_distributed: [
        ...currentGameNight.clues_distributed.filter(c => c.clue_id !== clueId),
        newDistribution
      ]
    };

    const updatedScenario: MurderMysteryData = {
      ...scenario,
      game_night: updatedGameNight
    };

    // Optimistic local save
    const storageKey = `mm_scenario_${sessionId}`;
    storage.set(storageKey, JSON.stringify(updatedScenario));

    // Try to sync
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ config: updatedScenario as any })
        .eq('id', sessionId);

      if (error) {
        console.warn(`Failed to sync clue distribution to Supabase: ${error.message}`);
      }
    } catch (err) {
      console.warn('Network error while syncing clue distribution', err);
    }

    return updatedScenario;
  }
}
