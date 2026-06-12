import { distributeArchetypes } from '../../src/features/confession-album/utils/archetypeDistributor';

describe('archetypeDistributor', () => {
  it('distributes evenly', () => {
    const result = distributeArchetypes(['p1', 'p2', 'p3'], ['a1', 'a2']);
    expect(result).toEqual({ p1: 'a1', p2: 'a2', p3: 'a1' });
  });
});
