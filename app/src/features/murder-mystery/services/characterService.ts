import { supabase } from '../../../lib/supabase';
import { MurderMysteryData, Character } from '../types/murder-mystery';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export class CharacterService {
  /**
   * Assigns multiple users (by SessionParticipation.id) to characters.
   */
  static async assignCharacters(
    sessionId: string,
    scenario: MurderMysteryData,
    assignments: Record<string, string>
  ): Promise<MurderMysteryData> {
    const updatedCharacters = scenario.characters.map(char => {
      if (assignments[char.id] !== undefined) {
        return { ...char, assigned_to: assignments[char.id] };
      }
      return char;
    });

    const updatedScenario: MurderMysteryData = {
      ...scenario,
      characters: updatedCharacters
    };

    // Optimistic local save
    const storageKey = `mm_scenario_${sessionId}`;
    storage.set(storageKey, JSON.stringify(updatedScenario));

    // Try to sync with Supabase
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ config: updatedScenario as any })
        .eq('id', sessionId);

      if (error) {
        console.warn(`Failed to sync character assignments to Supabase: ${error.message}`);
      }
    } catch (err) {
      console.warn('Network error while syncing character assignments', err);
    }

    return updatedScenario;
  }

  /**
   * Auto-assigns characters to participants.
   * Simple logic: assigns in order.
   */
  static autoAssign(
    scenario: MurderMysteryData,
    participantIds: string[]
  ): Record<string, string> {
    const assignments: Record<string, string> = {};
    const unassignedChars = scenario.characters.filter(c => !c.assigned_to);
    
    // Assign up to the number of participants or characters
    const count = Math.min(unassignedChars.length, participantIds.length);
    for (let i = 0; i < count; i++) {
      assignments[unassignedChars[i].id] = participantIds[i];
    }
    
    return assignments;
  }

  /**
   * Delivers character packets to all assigned players via notifications.
   */
  static async deliverPackets(
    sessionId: string,
    scenario: MurderMysteryData
  ): Promise<void> {
    const notifications = scenario.characters
      .filter(c => c.assigned_to)
      .map(char => ({
        user_id: char.assigned_to,
        type: 'CHARACTER_DELIVERY',
        title: `Your Character Packet: ${char.name}`,
        body: `You are playing ${char.name}. Open your packet to review your background and objectives.`,
        data: { session_id: sessionId, character_id: char.id },
        status: 'PENDING'
      }));

    if (notifications.length > 0) {
      const { error } = await supabase.from('notification_queue').insert(notifications);
      if (error) {
        console.error('Failed to deliver character packets:', error.message);
        throw new Error(`Failed to deliver character packets: ${error.message}`);
      }
    }
  }
}
