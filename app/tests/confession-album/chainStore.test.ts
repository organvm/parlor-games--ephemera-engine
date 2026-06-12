import { renderHook, act } from '@testing-library/react-hooks';
import { useChainStore } from '../../src/features/confession-album/stores/chainStore';

describe('chainStore', () => {
  it('advances turn', () => {
    const { result } = renderHook(() => useChainStore());
    act(() => {
      result.current.advanceTurn();
    });
    expect(result.current.currentTurn).toBe(2);
  });
});
