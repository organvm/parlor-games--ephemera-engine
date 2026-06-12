export const distributeArchetypes = (players: string[], archetypes: string[]): Record<string, string> => {
  const result: Record<string, string> = {};
  players.forEach((player, i) => {
    result[player] = archetypes[i % archetypes.length];
  });
  return result;
};
