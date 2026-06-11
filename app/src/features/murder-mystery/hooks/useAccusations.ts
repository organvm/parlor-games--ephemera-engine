import { useState, useEffect } from 'react';
import { MurderMysteryData, Accusation } from '../types/murder-mystery';
import { supabase } from '../../../lib/supabase';

export const useAccusations = (sessionId: string, initialScenario: MurderMysteryData) => {
  const [accusations, setAccusations] = useState<Accusation[]>(initialScenario.game_night?.accusations || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Optionally fetch latest from local cache or remote
  }, [sessionId]);

  const submitAccusation = async (accusation: Accusation) => {
    setIsSubmitting(true);
    try {
      const newAccusations = [...accusations, accusation];
      setAccusations(newAccusations);
      
      const updatedScenario = {
        ...initialScenario,
        game_night: {
          ...initialScenario.game_night,
          accusations: newAccusations
        }
      };

      // Best effort update remote
      await supabase
        .from('sessions')
        .update({ config: updatedScenario })
        .eq('id', sessionId);
        
      return true;
    } catch (e) {
      console.error('Failed to submit accusation:', e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    accusations,
    submitAccusation,
    isSubmitting
  };
};
