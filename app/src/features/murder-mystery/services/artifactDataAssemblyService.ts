import { MurderMysteryData } from '../types/murder-mystery';

export class ArtifactDataAssemblyService {
  /**
   * Assembles the payload for the mm_dossier artifact generation edge function.
   * This strips out unnecessary fields and formats the timeline, accusations, and outcome.
   */
  static assembleDossierPayload(sessionId: string, scenario: MurderMysteryData): any {
    const { title, game_night, crime, characters, theme } = scenario;
    
    // Format accusations
    const formattedAccusations = (game_night?.accusations || []).map(acc => {
      const accuser = characters.find(c => c.id === acc.accuser_id)?.name || 'Unknown';
      const accused = characters.find(c => c.id === acc.accused_id)?.name || 'Unknown';
      return {
        accuser,
        accused,
        theory: acc.theory,
        is_correct: acc.accused_id === crime.murderer_id
      };
    });

    const murderer = characters.find(c => c.id === crime.murderer_id)?.name || 'Unknown';
    const victim = characters.find(c => c.id === crime.victim_id)?.name || 'Unknown';

    return {
      session_id: sessionId,
      artifact_type: 'mm_dossier',
      data: {
        title,
        theme,
        outcome: {
          victim,
          murderer,
          weapon: crime.weapon,
          motive: crime.motive,
          total_accusations: formattedAccusations.length,
          correct_accusations: formattedAccusations.filter(a => a.is_correct).length
        },
        accusations: formattedAccusations,
        timeline: crime.timeline.map(t => ({
          order: t.order,
          description: t.description
        })),
        evidence_revealed: game_night?.evidence_reveals?.length || 0,
        clues_found: game_night?.clues_distributed?.length || 0
      }
    };
  }
}
