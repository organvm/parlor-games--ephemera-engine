import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('Role Assignments & Character Preferences RLS', () => {
  const hostEmail = `host_ra_${Date.now()}@example.com`;
  const guestEmail = `guest_ra_${Date.now()}@example.com`;
  const otherGuestEmail = `guest_other_ra_${Date.now()}@example.com`;
  // allow-secret
  const testPassword = 'password123';
  
  let hostId: string;
  let guestId: string;
  let otherGuestId: string;
  let sessionId: string;
  let guestParticipationId: string;

  beforeAll(async () => {
    // Setup host
    await testClient.auth.signUp({ email: hostEmail, password: testPassword });
    const { data: hData } = await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    hostId = hData.user?.id || '';

    // Create session
    const { data: sessionData } = await testClient
      .from('sessions')
      .insert({
        game_type: 'murder_mystery',
        name: 'Test Role Assignments Session',
        host_id: hostId,
        date_time: new Date().toISOString(),
      })
      .select()
      .single();
    sessionId = sessionData?.id;

    // Setup guest
    await testClient.auth.signOut();
    await testClient.auth.signUp({ email: guestEmail, password: testPassword });
    const { data: gData } = await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    guestId = gData.user?.id || '';

    // Join session
    const { data: partData } = await testClient
      .from('session_participations')
      .insert({
        session_id: sessionId,
        user_id: guestId,
        display_name: 'Test Guest',
      })
      .select()
      .single();
    guestParticipationId = partData?.id;

    // Setup other guest
    await testClient.auth.signOut();
    await testClient.auth.signUp({ email: otherGuestEmail, password: testPassword });
    const { data: ogData } = await testClient.auth.signInWithPassword({ email: otherGuestEmail, password: testPassword });
    otherGuestId = ogData.user?.id || '';

    await testClient.auth.signOut();
  });

  it('player can submit their own character preferences', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    
    const { data, error } = await testClient
      .from('character_preferences')
      .insert({
        session_id: sessionId,
        participant_id: guestParticipationId,
        rankings: [{ archetype_id: 'the-artist', rank: 1 }, { archetype_id: 'the-merchant', rank: 2 }],
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.rankings[0].archetype_id).toBe('the-artist');
  });

  it('host can read all preferences for their session', async () => {
    await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    
    const { data, error } = await testClient
      .from('character_preferences')
      .select('*')
      .eq('session_id', sessionId);

    expect(error).toBeNull();
    expect(data?.length).toBe(1);
    expect(data?.[0].participant_id).toBe(guestParticipationId);
  });

  it('player cannot read other players preferences', async () => {
    await testClient.auth.signInWithPassword({ email: otherGuestEmail, password: testPassword });
    
    const { data, error } = await testClient
      .from('character_preferences')
      .select('*')
      .eq('session_id', sessionId);

    expect(error).toBeNull();
    expect(data?.length).toBe(0);
  });

  it('player cannot update other players preferences', async () => {
    await testClient.auth.signInWithPassword({ email: otherGuestEmail, password: testPassword });
    
    const { data, error } = await testClient
      .from('character_preferences')
      .update({
        rankings: [{ archetype_id: 'the-detective', rank: 1 }],
      })
      .eq('participant_id', guestParticipationId)
      .select();

    expect(error).toBeNull();
    expect(data?.length).toBe(0);
    
    await testClient.auth.signOut();
  });
});
