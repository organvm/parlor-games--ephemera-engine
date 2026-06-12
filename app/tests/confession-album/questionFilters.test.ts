import { filterQuestionsByLineage } from '../../src/features/confession-album/utils/questionFilters';

describe('questionFilters', () => {
  it('filters by lineage', () => {
    const q1 = { metadata: { lineage: 'A' } };
    const q2 = { metadata: { lineage: 'B' } };
    expect(filterQuestionsByLineage([q1, q2], 'A')).toEqual([q1]);
  });
});
