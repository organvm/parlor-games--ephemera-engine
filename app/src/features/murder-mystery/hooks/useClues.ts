import { useState } from 'react';
import { MurderMysteryData } from '../types/murder-mystery';
import { ClueService } from '../services/clueService';

export const useClues = (sessionId: string, initialScenario: MurderMysteryData) => {
  const [scenario, setScenario] = useState<MurderMysteryData>(initialScenario);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distributeClue = async (clueId: string, foundByCharacterId?: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const updatedScenario = await ClueService.distributeClue(sessionId, scenario, clueId, foundByCharacterId);
      setScenario(updatedScenario);
    } catch (err: any) {
      setError(err.message || 'Failed to distribute clue');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDistributedClues = () => {
    return scenario.game_night?.clues_distributed || [];
  };

  const isClueDistributed = (clueId: string) => {
    return getDistributedClues().some(c => c.clue_id === clueId);
  };

  return {
    scenario,
    isProcessing,
    error,
    distributeClue,
    getDistributedClues,
    isClueDistributed
  };
};
