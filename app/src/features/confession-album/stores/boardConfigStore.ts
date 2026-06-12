import { create } from 'zustand';
import { BoardFormat, BoardLayout } from '../types/confession-album';

interface BoardConfigState {
  format: BoardFormat;
  layout: BoardLayout;
  setFormat: (f: BoardFormat) => void;
  setLayout: (l: BoardLayout) => void;
}

export const useBoardConfigStore = create<BoardConfigState>((set) => ({
  format: BoardFormat.CLASSIC,
  layout: BoardLayout.GRID,
  setFormat: (f) => set({ format: f }),
  setLayout: (l) => set({ layout: l })
}));
