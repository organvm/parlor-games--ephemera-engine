import { useState } from 'react';
import { distributeArchetypes } from '../utils/archetypeDistributor';

export const useContributionArchetypes = (players: string[], archetypes: string[]) => {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  
  const autoAssign = () => {
    setAssignments(distributeArchetypes(players, archetypes));
  };
  
  const manualAssign = (playerId: string, archetype: string) => {
    setAssignments(prev => ({ ...prev, [playerId]: archetype }));
  };

  return { assignments, autoAssign, manualAssign };
};
