import { create } from 'zustand';

interface QuestionSetState {
  questions: any[];
  addQuestion: (q: any) => void;
  removeQuestion: (id: string) => void;
}

export const useQuestionSetStore = create<QuestionSetState>((set) => ({
  questions: [],
  addQuestion: (q) => set((state) => ({ questions: [...state.questions, q] })),
  removeQuestion: (id) => set((state) => ({ questions: state.questions.filter(q => q.id !== id) }))
}));
