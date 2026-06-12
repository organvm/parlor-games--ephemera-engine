import { calculateTargetCount } from '../../src/features/confession-album/utils/targetCountCalculator';

describe('targetCountCalculator', () => {
  it('calculates minimum 5', () => {
    expect(calculateTargetCount(2)).toBe(5);
  });
  it('calculates based on guests', () => {
    expect(calculateTargetCount(8)).toBe(8);
  });
});
