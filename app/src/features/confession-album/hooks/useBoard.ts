import { useState } from 'react';

export const useBoard = (initialQuestions: any[]) => {
  const [questions, setQuestions] = useState(initialQuestions);
  
  const removeQuestion = (id: string) => {
    setQuestions(q => q.filter(x => x.id !== id));
  };
  
  return { questions, removeQuestion, remaining: questions.length };
};
