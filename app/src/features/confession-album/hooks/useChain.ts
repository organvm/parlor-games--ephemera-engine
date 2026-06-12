import { useChainStore } from '../stores/chainStore';

export const useChain = () => {
  const store = useChainStore();
  const currentPlayer = store.players[store.currentPlayerIndex];
  
  const recordChoice = (questionId: string) => {
    store.addEntry({
      id: Math.random().toString(),
      playerId: currentPlayer,
      questionId,
      turn: store.currentTurn
    });
    store.advanceTurn();
  };

  return { currentPlayer, currentTurn: store.currentTurn, recordChoice };
};
