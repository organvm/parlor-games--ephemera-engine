import { supabase } from '../../../lib/supabase';
import { MurderMysteryData } from '../types/murder-mystery';

export interface GenerateSeedParams {
  sessionId: string;
  playerCount: number;
  era: string;
  location: string;
  milieu?: string;
  tension?: string;
}

export class SeedGenerationService {
  /**
   * Calls the generate-seed Edge Function to create a new murder mystery scenario
   */
  static async generateScenario(params: GenerateSeedParams): Promise<MurderMysteryData> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-seed', {
        body: {
          session_id: params.sessionId,
          player_count: params.playerCount,
          era: params.era,
          location: params.location,
          milieu: params.milieu,
          tension: params.tension,
        },
      });

      if (error || !data || !data.scenario) {
        console.warn('API Generation failed, falling back to curated seed:', error);
        return await import('../data/curatedSeeds').then(m => m.getCuratedSeed(params.playerCount));
      }

      return data.scenario as MurderMysteryData;
    } catch (err: any) {
      console.warn('SeedGenerationService.generateScenario error, using fallback:', err);
      return await import('../data/curatedSeeds').then(m => m.getCuratedSeed(params.playerCount));
    }
  }

  /**
   * Saves the confirmed scenario to the session config
   */
  static async saveScenarioToSession(sessionId: string, scenario: MurderMysteryData): Promise<void> {
    try {
      // First get current session to merge config
      const { data: session, error: fetchError } = await supabase
        .from('sessions')
        .select('config')
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      const updatedConfig = {
        ...(session.config as any),
        murder_mystery_data: scenario, // store the generated data
      };

      const { error: updateError } = await supabase
        .from('sessions')
        .update({ config: updatedConfig })
        .eq('id', sessionId);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('SeedGenerationService.saveScenarioToSession error:', err);
      throw new Error(err.message || 'Failed to save scenario to session');
    }
  }
}
