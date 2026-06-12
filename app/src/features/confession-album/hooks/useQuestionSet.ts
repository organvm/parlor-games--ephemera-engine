import { useQuestionSetStore } from '../stores/questionSetStore';

export const useQuestionSet = () => {
  const store = useQuestionSetStore();
  return {
    selectedQuestions: store.questions,
    toggleQuestion: (q: any) => {
      const exists = store.questions.find((x) => x.id === q.id);
      if (exists) {
        store.removeQuestion(q.id);
      } else {
        store.addQuestion(q);
      }
    }
  };
};
