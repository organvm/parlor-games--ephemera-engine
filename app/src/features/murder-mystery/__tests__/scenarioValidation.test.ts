import { validateScenario } from '../../utils/scenarioValidation';
import { MurderMysteryData } from '../../types/murder-mystery';

describe('scenarioValidation', () => {
  it('returns no issues for a valid scenario', () => {
    const validScenario: MurderMysteryData = {
      title: 'Valid',
      theme: 'Valid',
      scenario_type: 'SEALED_ENVELOPE',
      setting: { location: 'L', year: 'Y', description: 'D', background_secrets: [] },
      characters: [
        { id: 'c1', name: 'Victim', occupation: 'O', background: 'B', public_description: 'P', secret_objective: { target_character_id: 'c2', description: 'D' }, is_murderer: false, is_victim: true, contribution_brief: { food: 'F', dress: 'D', prop: 'P' }, preparation_prompts: [], assigned_to: null },
        { id: 'c2', name: 'Murderer', occupation: 'O', background: 'B', public_description: 'P', secret_objective: { target_character_id: 'c1', description: 'D' }, is_murderer: true, is_victim: false, contribution_brief: { food: 'F', dress: 'D', prop: 'P' }, preparation_prompts: [], assigned_to: null }
      ],
      crime: { victim_id: 'c1', murderer_id: 'c2', weapon: 'W', motive: 'M', red_herrings: [], timeline: [{ order: 1, description: 'Murder happened' }] },
      acts: [],
      awards: []
    };

    const issues = validateScenario(validScenario);
    expect(issues.length).toBe(0);
  });

  it('detects missing victim in crime', () => {
    const invalidScenario: MurderMysteryData = {
      title: 'Invalid',
      theme: 'Invalid',
      scenario_type: 'SEALED_ENVELOPE',
      setting: { location: 'L', year: 'Y', description: 'D', background_secrets: [] },
      characters: [
        { id: 'c1', name: 'Char1', occupation: 'O', background: 'B', public_description: 'P', secret_objective: { target_character_id: 'c2', description: 'D' }, is_murderer: true, is_victim: false, contribution_brief: { food: 'F', dress: 'D', prop: 'P' }, preparation_prompts: [], assigned_to: null }
      ],
      crime: { victim_id: 'c2', murderer_id: 'c1', weapon: 'W', motive: 'M', red_herrings: [], timeline: [] },
      acts: [],
      awards: []
    };

    const issues = validateScenario(invalidScenario);
    expect(issues.some(i => i.severity === 'ERROR' && i.message.includes('victim'))).toBeTruthy();
  });
});
