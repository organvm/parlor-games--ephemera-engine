import { describe, it, expect, beforeAll } from 'vitest';
import { testClient, checkSupabaseReachability } from './setup';

const isDBReachable = await checkSupabaseReachability();

describe.skipIf(!isDBReachable)('Session State Machine', () => {
  const hostEmail = `host_state_${Date.now()}@example.com`;
  let sessionId: string;

  beforeAll(async () => {
    await testClient.auth.signUp({ email: hostEmail, password: 'password123' });
    await testClient.auth.signInWithPassword({ email: hostEmail, password: 'password123' });
    
    const { data: user } = await testClient.auth.getUser();
    const { data } = await testClient
      .from('sessions')
      .insert({
        game_type: 'confession_album',
        name: 'State Test Session',
        host_id: user.user?.id,
        date_time: new Date().toISOString(),
      })
      .select()
      .single();
      
    sessionId = data?.id;
  });

  it('should transition from DRAFT to INVITING', async () => {
    const { data, error } = await testClient.rpc('transition_session_state', {
      p_session_id: sessionId,
      p_expected_state: 'DRAFT',
      p_new_state: 'INVITING'
    });

    expect(error).toBeNull();
    expect(data).toBe(true);

    // Verify it updated
    const { data: session } = await testClient
      .from('sessions')
      .select('state')
      .eq('id', sessionId)
      .single();
    expect(session?.state).toBe('INVITING');
  });

  it('should reject invalid transitions (e.g. INVITING to ARCHIVED)', async () => {
    const { error } = await testClient.rpc('transition_session_state', {
      p_session_id: sessionId,
      p_expected_state: 'INVITING',
      p_new_state: 'ARCHIVED'
    });

    expect(error).not.toBeNull();
  });

  it('should log the state transition', async () => {
    const { data, error } = await testClient
      .from('session_state_log')
      .select('*')
      .eq('session_id', sessionId)
      .eq('to_state', 'INVITING');
      
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0].from_state).toBe('DRAFT');
  });
});
