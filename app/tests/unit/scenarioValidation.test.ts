import { validateScenario } from '../../src/features/murder-mystery/utils/scenarioValidation';
import { MurderMysteryData } from '../../src/features/murder-mystery/types/murder-mystery';

describe('scenarioValidation', () => {
  const createValidScenario = (): MurderMysteryData => ({
    setting_seed: {
      source: 'curated',
      era: '1920s',
      location: 'Mansion',
      milieu: 'High Society',
      tension: 'Financial Ruin',
      setting_description: 'A grand mansion',
      crime_scene: 'Library',
      generated_by: 'human'
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
      },
      {
        id: 'c3', name: 'Guest 1', occupation: 'Socialite', personality: 'Vain', secret: /* allow-secret */ 'Broke',
        relationship: { target_character_id: 'c1', description: 'Friend' },
        is_victim: false, is_murderer: false,
        contribution_brief: { food: '', dress: '', prop: '' },
        preparation_prompts: [], assigned_to: null
      },
      {
        id: 'c4', name: 'Guest 2', occupation: 'Doctor', personality: 'Quiet', secret: /* allow-secret */ 'Addict',
        relationship: { target_character_id: 'c3', description: 'Brother' },
        is_victim: false, is_murderer: false,
        contribution_brief: { food: '', dress: '', prop: '' },
        preparation_prompts: [], assigned_to: null
      }
    ],
    crime: {
      victim_id: 'c1',
      murderer_id: 'c2',
      weapon: 'Poison',
      motive: 'Revenge',
      red_herrings: [
        { character_id: 'c3', description: 'Was seen near the library' }
      ],
      timeline: [
        { order: 1, description: 'Dinner', act: 1 },
        { order: 2, description: 'Murder', act: 2 },
        { order: 3, description: 'Body found', act: 3 }
      ]
    },
    clues: [],
    game_night: { act_timestamps: [], clues_distributed: [], evidence_reveals: [], accusations: [] },
    awards: [],
    sealed_envelopes: []
  });

  it('passes a valid scenario', () => {
    const scenario = createValidScenario();
    const issues = validateScenario(scenario);
    expect(issues).toHaveLength(0);
  });

  it('fails if less than 4 characters', () => {
    const scenario = createValidScenario();
    scenario.characters.pop();
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path === 'characters' && i.message.includes('At least 4'))).toBe(true);
  });

  it('fails if no murderer', () => {
    const scenario = createValidScenario();
    scenario.characters[1].is_murderer = false;
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path === 'characters' && i.message.includes('Exactly one character must be the murderer'))).toBe(true);
  });

  it('fails if multiple murderers', () => {
    const scenario = createValidScenario();
    scenario.characters[2].is_murderer = true;
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path === 'characters' && i.message.includes('Exactly one character must be the murderer'))).toBe(true);
  });

  it('fails if victim and murderer are the same (violates exactly one victim rule check)', () => {
    const scenario = createValidScenario();
    scenario.characters[1].is_murderer = false;
    scenario.characters[0].is_murderer = true;
    scenario.crime.murderer_id = 'c1';
    
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path === 'characters' && i.message.includes('The murderer and the victim cannot be the same person'))).toBe(true);
  });

  it('fails if relationship target is invalid', () => {
    const scenario = createValidScenario();
    scenario.characters[0].relationship.target_character_id = 'invalid_id';
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path.includes('relationship.target_character_id'))).toBe(true);
  });

  it('fails if crime references invalid victim', () => {
    const scenario = createValidScenario();
    scenario.crime.victim_id = 'invalid_id';
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path === 'crime.victim_id')).toBe(true);
  });

  it('fails if crime victim_id does not match is_victim flag', () => {
    const scenario = createValidScenario();
    scenario.crime.victim_id = 'c3';
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path === 'crime.victim_id' && i.message.includes('does not match character'))).toBe(true);
  });

  it('fails if timeline acts are out of order', () => {
    const scenario = createValidScenario();
    scenario.crime.timeline[0].act = 2;
    scenario.crime.timeline[1].act = 1;
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path === 'crime.timeline' && i.message.includes('strictly non-decreasing'))).toBe(true);
  });

  it('fails if red herring character is invalid', () => {
    const scenario = createValidScenario();
    scenario.crime.red_herrings[0].character_id = 'ghost';
    const issues = validateScenario(scenario);
    expect(issues.some(i => i.path.includes('red_herrings'))).toBe(true);
  });
});
