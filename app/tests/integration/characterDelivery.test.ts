import { CharacterService } from '../../src/features/murder-mystery/services/characterService';
import { supabase } from '../../src/lib/supabase';
import { MurderMysteryData } from '../../src/features/murder-mystery/types/murder-mystery';

// Mock Supabase
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('CharacterService Integration', () => {
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

  describe('assignCharacters', () => {
    it('assigns characters manually and updates session config', async () => {
      const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await CharacterService.assignCharacters('session-1', mockScenario, {
        'c1': 'user-1',
        'c2': 'user-2'
      });

      expect(supabase.from).toHaveBeenCalledWith('sessions');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        config: expect.objectContaining({
          characters: expect.arrayContaining([
            expect.objectContaining({ id: 'c1', assigned_to: 'user-1' }),
            expect.objectContaining({ id: 'c2', assigned_to: 'user-2' })
          ])
        })
      }));

      expect(result.characters[0].assigned_to).toBe('user-1');
      expect(result.characters[1].assigned_to).toBe('user-2');
    });
  });

  describe('autoAssign', () => {
    it('randomly assigns participants to unassigned characters', () => {
      const assignments = CharacterService.autoAssign(mockScenario, ['user-1', 'user-2']);
      
      const assignedUsers = Object.values(assignments);
      expect(assignedUsers).toHaveLength(2);
      expect(assignedUsers).toContain('user-1');
      expect(assignedUsers).toContain('user-2');
      
      const assignedCharIds = Object.keys(assignments);
      expect(assignedCharIds).toHaveLength(2);
      expect(assignedCharIds).toContain('c1');
      expect(assignedCharIds).toContain('c2');
    });

    it('only assigns to unassigned characters', () => {
      const partiallyAssignedScenario = {
        ...mockScenario,
        characters: [
          { ...mockScenario.characters[0], assigned_to: 'user-1' },
          mockScenario.characters[1]
        ]
      };

      const assignments = CharacterService.autoAssign(partiallyAssignedScenario, ['user-2']);
      
      expect(Object.keys(assignments)).toHaveLength(1);
      expect(assignments['c2']).toBe('user-2');
      expect(assignments['c1']).toBeUndefined(); // Already assigned
    });
  });

  describe('deliverPackets', () => {
    it('updates session status and queues notifications', async () => {
      const mockEqSession = jest.fn().mockResolvedValue({ error: null });
      const mockUpdateSession = jest.fn().mockReturnValue({ eq: mockEqSession });
      
      const mockInsertNotif = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'sessions') return { update: mockUpdateSession };
        if (table === 'notification_queue') return { insert: mockInsertNotif };
        return {};
      });

      const assignedScenario = {
        ...mockScenario,
        characters: [
          { ...mockScenario.characters[0], assigned_to: 'user-1' },
          { ...mockScenario.characters[1], assigned_to: 'user-2' }
        ]
      };

      await CharacterService.deliverPackets('session-1', assignedScenario);

      // Verify Session Status Update
      expect(supabase.from).toHaveBeenCalledWith('sessions');
      expect(mockUpdateSession).toHaveBeenCalledWith({ status: 'ACTIVE' });
      expect(mockEqSession).toHaveBeenCalledWith('id', 'session-1');

      // Verify Notifications Queued
      expect(supabase.from).toHaveBeenCalledWith('notification_queue');
      expect(mockInsertNotif).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ user_id: 'user-1', type: 'CHARACTER_PACKET' }),
        expect.objectContaining({ user_id: 'user-2', type: 'CHARACTER_PACKET' })
      ]));
    });
  });
});
