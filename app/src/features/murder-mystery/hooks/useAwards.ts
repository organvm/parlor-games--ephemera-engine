import { useState } from 'react';
import { MurderMysteryData, AwardVote } from '../types/murder-mystery';
import { supabase } from '../../../lib/supabase';

export const useAwards = (sessionId: string, initialScenario: MurderMysteryData) => {
  const [votes, setVotes] = useState<AwardVote[]>(initialScenario.game_night?.award_votes || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitVotes = async (newVotes: AwardVote[]) => {
    setIsSubmitting(true);
    try {
      const allVotes = [...votes, ...newVotes];
      setVotes(allVotes);
      
      const updatedScenario = {
        ...initialScenario,
        game_night: {
          ...initialScenario.game_night,
          award_votes: allVotes
        }
      };

      await supabase
        .from('sessions')
        .update({ config: updatedScenario })
        .eq('id', sessionId);
        
      return true;
    } catch (e) {
      console.error('Failed to submit votes:', e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const aggregateResults = () => {
    const results: Record<string, Record<string, number>> = {};
    
    votes.forEach(vote => {
      if (!results[vote.category]) {
        results[vote.category] = {};
      }
      results[vote.category][vote.nominee_character_id] = (results[vote.category][vote.nominee_character_id] || 0) + 1;
    });

    return Object.keys(results).map(category => {
      const tally = results[category];
      const winnerId = Object.keys(tally).reduce((a, b) => tally[a] > tally[b] ? a : b);
      return {
        category,
        winner_id: winnerId,
        votes: tally[winnerId]
      };
    });
  };

  return {
    votes,
    submitVotes,
    aggregateResults,
    isSubmitting
  };
};
