import { SeedGenerationService } from '../../src/features/murder-mystery/services/seedGenerationService';
import { supabase } from '../../src/lib/supabase';
import { MurderMysteryData } from '../../src/features/murder-mystery/types/murder-mystery';

// Mock Supabase
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    },
    from: jest.fn()
  }
}));

describe('SeedGenerationService Integration', () => {
  const mockScenario: MurderMysteryData = {
    setting_seed: {
      source: 'generated',
      era: '1920s',
      location: 'Mansion',
      milieu: 'High Society',
      tension: 'Financial Ruin',
      setting_description: 'A grand mansion',
      crime_scene: 'Library',
      generated_by: 'llm'
    },
    characters: [
      {
        id: 'c1', name: 'Victim', occupation: 'Owner', personality: 'Mean', secret: /* allow-secret */ 'None',
        relationship: { target_character_id: 'c2', description: 'Enemies' },
        is_victim: true, is_murderer: false,
        contribution_brief: { food: '', dress: '', prop: '' },
        preparation_prompts: [], assigned_to: null
      },
      {
        id: 'c2', name: 'Murderer', occupation: 'Butler', personality: 'Cold', secret: /* allow-secret */ 'Stole money',
        relationship: { target_character_id: 'c1', description: 'Employee' },
        is_victim: false, is_murderer: true,
        contribution_brief: { food: '', dress: '', prop: '' },
        preparation_prompts: [], assigned_to: null
      }
    ],
    crime: {
      victim_id: 'c1',
      murderer_id: 'c2',
      weapon: 'Poison',
      motive: 'Revenge',
      red_herrings: [],
      timeline: []
    },
    clues: [],
    game_night: { act_timestamps: [], clues_distributed: [], evidence_reveals: [], accusations: [] },
    awards: [],
    sealed_envelopes: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a scenario via edge function', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { scenario: mockScenario },
      error: null
    });

    const result = await SeedGenerationService.generateScenario({
      sessionId: 'session-1',
      playerCount: 1,
      era: '1920s',
      location: 'Mansion'
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('generate-seed', {
      body: {
        session_id: 'session-1',
        player_count: 1,
        era: '1920s',
        location: 'Mansion',
        milieu: undefined,
        tension: undefined
      }
    });

    expect(result).toEqual(mockScenario);
  });

  it('throws an error if edge function fails', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' }
    });

    await expect(SeedGenerationService.generateScenario({
      sessionId: 'session-1',
      playerCount: 1,
      era: '1920s',
      location: 'Mansion'
    })).rejects.toThrow('Rate limit exceeded');
  });

  it('saves scenario to session config', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ error: null });
    const mockEqUpdate = jest.fn().mockReturnValue({ update: mockUpdate });
    
    const mockSingle = jest.fn().mockResolvedValue({ 
      data: { config: { existing: 'value' } }, 
      error: null 
    });
    const mockEqFetch = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEqFetch });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'sessions') {
        // Return object that handles both select and update chains
        return {
          select: mockSelect,
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })
        };
      }
      return {};
    });

    // Mock the update chain more specifically
    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      update: () => ({ eq: mockUpdate })
    });

    await SeedGenerationService.saveScenarioToSession('session-1', mockScenario);

    expect(supabase.from).toHaveBeenCalledWith('sessions');
    expect(mockSelect).toHaveBeenCalledWith('config');
    expect(mockUpdate).toHaveBeenCalled();
  });
});
