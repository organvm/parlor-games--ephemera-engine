import { useState, useCallback } from 'react';
import { SeedGenerationService, GenerateSeedParams } from '../services/seedGenerationService';
import { MurderMysteryData } from '../types/murder-mystery';

export function useSettingSeed(sessionId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedScenario, setGeneratedScenario] = useState<MurderMysteryData | null>(null);

  const generateSeed = useCallback(async (params: Omit<GenerateSeedParams, 'sessionId'>) => {
    setIsGenerating(true);
    setError(null);
    try {
      const scenario = await SeedGenerationService.generateScenario({
        ...params,
        sessionId,
      });
      setGeneratedScenario(scenario);
      return scenario;
    } catch (err: any) {
      setError(err.message || 'Failed to generate scenario');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId]);

  const confirmScenario = useCallback(async (scenario: MurderMysteryData) => {
    try {
      await SeedGenerationService.saveScenarioToSession(sessionId, scenario);
      // Optional: Trigger a success toast or navigation here
    } catch (err: any) {
      setError(err.message || 'Failed to save scenario');
      throw err;
    }
  }, [sessionId]);

  const clearScenario = useCallback(() => {
    setGeneratedScenario(null);
  }, []);

  return {
    generateSeed,
    confirmScenario,
    clearScenario,
    generatedScenario,
    isGenerating,
    error,
  };
}
