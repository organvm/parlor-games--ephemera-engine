import { create } from 'zustand';

interface ChainState {
  currentTurn: number;
  players: string[];
  currentPlayerIndex: number;
  entries: any[];
  addEntry: (entry: any) => void;
  advanceTurn: () => void;
}

export const useChainStore = create<ChainState>((set) => ({
  currentTurn: 1,
  players: ['Player 1', 'Player 2', 'Player 3'],
  currentPlayerIndex: 0,
  entries: [],
  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
  advanceTurn: () => set((state) => ({
    currentTurn: state.currentTurn + 1,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length
  }))
}));
