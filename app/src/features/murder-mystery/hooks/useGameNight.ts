import { useState, useEffect } from 'react';
import { MurderMysteryData } from '../types/murder-mystery';
import { GameNightService } from '../services/gameNightService';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const useGameNight = (sessionId: string, initialScenario: MurderMysteryData) => {
  const [scenario, setScenario] = useState<MurderMysteryData>(initialScenario);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount if it exists and is newer
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const localDataString = storage.getString(`mm_scenario_${sessionId}`);
        if (localDataString) {
          const localData = JSON.parse(localDataString) as MurderMysteryData;
          
          // Basic conflict resolution: if local data has more acts recorded, use local
          const localActs = localData.game_night?.act_timestamps?.length || 0;
          const remoteActs = initialScenario.game_night?.act_timestamps?.length || 0;
          
          if (localActs > remoteActs) {
            setScenario(localData);
          }
        }
      } catch (err) {
        console.error('Failed to load local scenario data:', err);
      }
    };
    
    loadLocalData();
  }, [sessionId, initialScenario]);

  const currentAct = () => {
    if (!scenario.game_night?.act_timestamps?.length) return 0;
    return Math.max(...scenario.game_night.act_timestamps.map(a => a.act));
  };

  const advanceAct = async (newAct: number) => {
    setIsProcessing(true);
    setError(null);
    try {
      const updatedScenario = await GameNightService.advanceAct(sessionId, scenario, newAct);
      setScenario(updatedScenario);
    } catch (err: any) {
      setError(err.message || 'Failed to advance act');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    scenario,
    currentAct: currentAct(),
    isProcessing,
    error,
    advanceAct
  };
};
