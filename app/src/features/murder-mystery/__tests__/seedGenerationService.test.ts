import { SeedGenerationService } from '../../services/seedGenerationService';

describe('SeedGenerationService', () => {
  it('generates a curated scenario as fallback when no AI is present', async () => {
    // The service falls back to a curated scenario
    const scenario = await SeedGenerationService.generateScenario({
      sessionId: 'test_session',
      theme: 'Any',
      playerCount: 5,
      scenarioType: 'SEALED_ENVELOPE'
    });

    expect(scenario).toBeDefined();
    expect(scenario.setting_seed.source).toBe('curated');
    expect(scenario.characters.length).toBeGreaterThan(0);
    expect(scenario.crime.murderer_id).toBeDefined();
    expect(scenario.crime.victim_id).toBeDefined();
  });
});
