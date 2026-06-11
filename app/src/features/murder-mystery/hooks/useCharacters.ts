import { useState } from 'react';
import { MurderMysteryData, Character } from '../types/murder-mystery';
import { CharacterService } from '../services/characterService';

export const useCharacters = (sessionId: string, initialScenario: MurderMysteryData) => {
  const [scenario, setScenario] = useState<MurderMysteryData>(initialScenario);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignCharacters = async (assignments: Record<string, string>) => {
    setIsAssigning(true);
    setError(null);
    try {
      const updatedScenario = await CharacterService.assignCharacters(sessionId, scenario, assignments);
      setScenario(updatedScenario);
    } catch (err: any) {
      setError(err.message || 'Failed to assign characters');
    } finally {
      setIsAssigning(false);
    }
  };

  const autoAssign = async (participantIds: string[]) => {
    const assignments = CharacterService.autoAssign(scenario, participantIds);
    await assignCharacters(assignments);
  };

  const saveCharacterEdit = async (updatedCharacter: Character) => {
    setIsAssigning(true);
    setError(null);
    try {
      const updatedCharacters = scenario.characters.map(c => 
        c.id === updatedCharacter.id ? updatedCharacter : c
      );
      const updatedScenario = { ...scenario, characters: updatedCharacters };
      // Here we trick assignCharacters into saving the whole scenario by passing empty assignments
      // In a real app we'd have a separate updateScenario method.
      const savedScenario = await CharacterService.assignCharacters(sessionId, updatedScenario, {});
      setScenario(savedScenario);
    } catch (err: any) {
      setError(err.message || 'Failed to update character');
    } finally {
      setIsAssigning(false);
    }
  };

  const deliverPackets = async () => {
    setIsDelivering(true);
    setError(null);
    try {
      await CharacterService.deliverPackets(sessionId, scenario);
      // Success callback could be used here
    } catch (err: any) {
      setError(err.message || 'Failed to deliver packets');
    } finally {
      setIsDelivering(false);
    }
  };

  return {
    scenario,
    isAssigning,
    isDelivering,
    error,
    assignCharacters,
    autoAssign,
    saveCharacterEdit,
    deliverPackets
  };
};
