import { supabase } from '../../../lib/supabase';
import { MurderMysteryData, Character } from '../types/murder-mystery';

export class CharacterService {
  /**
   * Assigns characters to participants. Can be manual or auto.
   */
  static async assignCharacters(
    sessionId: string,
    scenario: MurderMysteryData,
    assignments: Record<string, string> // characterId -> participantId
  ): Promise<MurderMysteryData> {
    const updatedCharacters = scenario.characters.map(char => ({
      ...char,
      assigned_to: assignments[char.id] || char.assigned_to
    }));

    const updatedScenario: MurderMysteryData = {
      ...scenario,
      characters: updatedCharacters
    };

    const { error } = await supabase
      .from('sessions')
      .update({ config: updatedScenario as any })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to assign characters: ${error.message}`);
    }

    return updatedScenario;
  }

  /**
   * Auto-assigns characters based on participant count.
   */
  static autoAssign(
    scenario: MurderMysteryData,
    participantIds: string[]
  ): Record<string, string> {
    const assignments: Record<string, string> = {};
    const unassignedChars = scenario.characters.filter(c => !c.assigned_to);
    
    // Shuffle arrays
    const shuffledParticipants = [...participantIds].sort(() => 0.5 - Math.random());
    const shuffledChars = [...unassignedChars].sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(shuffledParticipants.length, shuffledChars.length); i++) {
      assignments[shuffledChars[i].id] = shuffledParticipants[i];
    }

    return assignments;
  }

  /**
   * Delivers character packets by triggering notifications and updating game state.
   */
  static async deliverPackets(
    sessionId: string,
    scenario: MurderMysteryData
  ): Promise<void> {
    // 1. Mark characters as delivered in state (optional, could just be a status update on session)
    const { error: sessionError } = await supabase
      .from('sessions')
      .update({ status: 'ACTIVE' }) // Move from SETUP to ACTIVE
      .eq('id', sessionId);

    if (sessionError) {
      throw new Error(`Failed to update session status: ${sessionError.message}`);
    }

    // 2. Queue notifications for each assigned participant
    const assignedCharacters = scenario.characters.filter(c => c.assigned_to);
    
    const notifications = assignedCharacters.map(char => ({
      user_id: char.assigned_to,
      type: 'CHARACTER_PACKET',
      title: 'Your Character Packet is Ready!',
      body: `You have been cast as ${char.name}. Open your secure briefing now.`,
      data: { session_id: sessionId, character_id: char.id },
      status: 'PENDING'
    }));

    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from('notification_queue')
        .insert(notifications);

      if (notifyError) {
        console.error('Failed to queue notifications:', notifyError);
        // We don't throw here to avoid failing the whole transaction if only notifs fail
      }
    }
  }
}
