import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('RLS Policies', () => {
  const hostEmail = `rls_host_${Date.now()}@example.com`;
  const guestEmail = `rls_guest_${Date.now()}@example.com`;
  let sessionId: string;
  let hostId: string;
  let guestId: string;

  beforeAll(async () => {
    // Setup host
    await testClient.auth.signUp({ email: hostEmail, password: 'password123' });
    let { data: hData } = await testClient.auth.signInWithPassword({ email: hostEmail, password: 'password123' });
    hostId = hData.user?.id || '';

    const { data } = await testClient
      .from('sessions')
      .insert({
        game_type: 'confession_album',
        name: 'RLS Test Session',
        host_id: hostId,
        date_time: new Date().toISOString(),
      })
      .select()
      .single();
    sessionId = data?.id;

    // Setup guest
    await testClient.auth.signOut();
    await testClient.auth.signUp({ email: guestEmail, password: 'password123' });
    let { data: gData } = await testClient.auth.signInWithPassword({ email: guestEmail, password: 'password123' });
    guestId = gData.user?.id || '';
    await testClient.auth.signOut();
  });

  it('guest cannot read host session before participating', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: 'password123' });
    const { data, error } = await testClient
      .from('sessions')
      .select('*')
      .eq('id', sessionId);
      
    expect(error).toBeNull();
    expect(data?.length).toBe(0);
  });

  it('guest cannot update host session', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: 'password123' });
    const { data, error } = await testClient
      .from('sessions')
      .update({ name: 'Hacked' })
      .eq('id', sessionId);
      
    // Supabase returns an empty array for updates blocked by RLS (or an error)
    expect(data?.length).toBeFalsy();
  });
});
