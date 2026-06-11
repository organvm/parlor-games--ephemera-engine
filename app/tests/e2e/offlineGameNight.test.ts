// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

(global as any).__DEV__ = true;

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  StyleSheet: { create: vi.fn((obj) => obj) },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Alert: { alert: vi.fn() },
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }
}));
import { useGameNight } from '../../src/features/murder-mystery/hooks/useGameNight';
import { useClues } from '../../src/features/murder-mystery/hooks/useClues';
import { useAccusations } from '../../src/features/murder-mystery/hooks/useAccusations';
import { useAwards } from '../../src/features/murder-mystery/hooks/useAwards';
import { supabase } from '../../src/lib/supabase';
import { MurderMysteryData } from '../../src/features/murder-mystery/types/murder-mystery';

// Mock Supabase to simulate offline state that syncs when updated
const mocks = vi.hoisted(() => ({
  mockSessionState: null as any,
  setMockState: (state: any) => { mocks.mockSessionState = state; }
}));

vi.mock('../../src/lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: { config: mocks.mockSessionState }, error: null })),
        update: vi.fn().mockImplementation((payload: any) => {
          if (payload.config) {
            mocks.mockSessionState = payload.config;
          }
          return {
            eq: vi.fn().mockResolvedValue({ error: null })
          };
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }),
      })
    }
  };
});

const baseScenario: MurderMysteryData = {
  setting_seed: {
    source: 'curated',
    era: '1920s',
    location: 'Manor',
    milieu: 'High Society',
    tension: 'Greed',
    setting_description: 'A dark and stormy night.',
    crime_scene: 'Library',
    generated_by: 'human'
  },
  characters: [
    {
      id: 'c1',
      name: 'Lord Arthur',
      occupation: 'Aristocrat',
      personality: 'Snobby',
      secret: 'Broke',
      relationship: { target_character_id: 'c2', description: 'Rivals' },
      is_murderer: true,
      is_victim: false,
      contribution_brief: { food: 'Caviar', dress: 'Tuxedo', prop: 'Cane' },
      preparation_prompts: [],
      assigned_to: 'p1'
    },
    {
      id: 'c2',
      name: 'Lady Eleanor',
      occupation: 'Heiress',
      personality: 'Charming',
      secret: 'Affair',
      relationship: { target_character_id: 'c1', description: 'Lovers' },
      is_murderer: false,
      is_victim: true,
      contribution_brief: { food: 'Champagne', dress: 'Gown', prop: 'Fan' },
      preparation_prompts: [],
      assigned_to: 'p2'
    }
  ],
  crime: {
    victim_id: 'c2',
    murderer_id: 'c1',
    weapon: 'Poison',
    motive: 'Inheritance',
    red_herrings: [],
    timeline: []
  },
  clues: [
    { id: 'clue1', name: 'Empty Vial', description: 'Traces of poison.', act_revealed: 2, condition: 'time', content: 'It smells like almonds.' }
  ],
  game_night: {
    act_timestamps: [],
    clues_distributed: [],
    evidence_reveals: [],
    accusations: [],
    award_votes: []
  },
  awards: [
    { id: 'award1', title: 'Best Dressed', description: 'Who wore it best?' }
  ],
  sealed_envelopes: []
};

describe('E2E Offline Game Night Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setMockState(baseScenario);
  });

  it('should progress through the entire game night lifecycle', async () => {
    // 1. Host starts the game (Act 1)
    const { result: gameNightResult } = renderHook(() => useGameNight('session1', baseScenario));
    
    await act(async () => {
      await gameNightResult.current.advanceAct(1);
    });
    expect(gameNightResult.current.currentAct).toBe(1);

    // 2. Host distributes a clue
    const { result: clueResult } = renderHook(() => useClues('session1', baseScenario));
    await act(async () => {
      await clueResult.current.distributeClue('clue1');
    });
    expect(clueResult.current.getDistributedClues().length).toBe(1);

    // 3. Advance to Act 2 (Accusations)
    await act(async () => {
      await gameNightResult.current.advanceAct(2);
    });
    expect(gameNightResult.current.currentAct).toBe(2);

    // 4. Players make accusations
    const { result: accResult } = renderHook(() => useAccusations('session1', baseScenario));
    await act(async () => {
      await accResult.current.submitAccusation({
        accuser_id: 'c2',
        accused_id: 'c1',
        motive_theory: 'Wanted money',
        weapon_theory: 'Poison'
      });
    });
    expect(accResult.current.accusations.length).toBe(1);
    expect(accResult.current.accusations[0].accused_id).toBe('c1');

    // 5. Advance to Act 3 (Awards & Epilogue)
    await act(async () => {
      await gameNightResult.current.advanceAct(3);
    });
    expect(gameNightResult.current.currentAct).toBe(3);

    // 6. Players vote on awards
    const { result: awardResult } = renderHook(() => useAwards('session1', baseScenario));
    await act(async () => {
      await awardResult.current.submitVotes([{
        voter_id: 'c2',
        award_id: 'award1',
        nominee_character_id: 'c1'
      }]);
    });
    expect(awardResult.current.votes.length).toBe(1);

    // 7. Verify Supabase was called with updates
    expect(supabase.from).toHaveBeenCalledWith('sessions');
  });
});
