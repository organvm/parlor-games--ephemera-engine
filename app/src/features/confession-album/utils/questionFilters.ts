export const filterQuestionsByLineage = (questions: any[], lineage: string) => {
  if (lineage === 'surprise_me') return questions;
  return questions.filter(q => q.metadata.lineage === lineage);
};
