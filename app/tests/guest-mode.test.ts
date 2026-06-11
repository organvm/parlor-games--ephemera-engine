import { describe, it, expect, beforeAll } from 'vitest';
import { testClient, checkSupabaseReachability } from './setup';

const isDBReachable = await checkSupabaseReachability();

describe.skipIf(!isDBReachable)('Guest Mode and Web Player', () => {
  let inviteCode = 'TEST1234';
  let sessionId: string;
  let guestId: string;

  beforeAll(async () => {
    // Setup session with invite code as host
    const hostEmail = `host_guest_${Date.now()}@example.com`;
    await testClient.auth.signUp({ email: hostEmail, password: 'password123' });
    await testClient.auth.signInWithPassword({ email: hostEmail, password: 'password123' });
    
    const { data: user } = await testClient.auth.getUser();
    const { data } = await testClient
      .from('sessions')
      .insert({
        game_type: 'confession_album',
        name: 'Guest Test Session',
        host_id: user.user?.id,
        date_time: new Date().toISOString(),
        invite_code: inviteCode,
        state: 'INVITING'
      })
      .select()
      .single();
      
    sessionId = data?.id;
    await testClient.auth.signOut();
  });

  it('should sign in anonymously', async () => {
    const { data, error } = await testClient.auth.signInAnonymously();
    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    guestId = data.user?.id || '';
  });

  it('should RSVP as a web player', async () => {
    const { data, error } = await testClient
      .from('session_participations')
      .insert({
        session_id: sessionId,
        user_id: guestId,
        display_name: 'Guest Player',
        role: 'web_player',
        rsvp_status: 'accepted'
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data.display_name).toBe('Guest Player');
    expect(data.role).toBe('web_player');
  });
});
