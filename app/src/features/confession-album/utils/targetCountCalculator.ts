export const calculateTargetCount = (guestCount: number): number => {
  return Math.max(guestCount, 5);
};
