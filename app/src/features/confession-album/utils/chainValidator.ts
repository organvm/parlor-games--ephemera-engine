export const validateChain = (entries: any[]) => {
  if (entries.length === 0) return true;
  
  const ids = new Set();
  let valid = true;
  
  entries.forEach((entry, i) => {
    if (ids.has(entry.questionId)) valid = false;
    ids.add(entry.questionId);
    if (entry.turn !== i + 1) valid = false;
  });
  
  return valid;
};
