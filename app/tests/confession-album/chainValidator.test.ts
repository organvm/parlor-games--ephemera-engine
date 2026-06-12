import { validateChain } from '../../src/features/confession-album/utils/chainValidator';

describe('chainValidator', () => {
  it('validates a correct chain', () => {
    expect(validateChain([{ questionId: 'q1', turn: 1 }, { questionId: 'q2', turn: 2 }])).toBe(true);
  });
  
  it('fails on duplicates', () => {
    expect(validateChain([{ questionId: 'q1', turn: 1 }, { questionId: 'q1', turn: 2 }])).toBe(false);
  });
});
