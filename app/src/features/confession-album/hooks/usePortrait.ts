import { useChainStore } from '../stores/chainStore';

export const usePortrait = () => {
  const { entries } = useChainStore();
  // Simplified grouping
  const pairs = entries.map(e => ({
    id: e.id,
    questionId: e.questionId,
    chooser: e.playerId,
    chooserAnswer: e.answerText || '...',
    inheritor: 'Someone',
    inheritorAnswer: '...'
  }));

  return { pairs, completeSession: () => console.log('Session complete') };
};
