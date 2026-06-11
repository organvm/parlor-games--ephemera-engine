import { describe, it, expect, beforeAll } from 'vitest';
import { testClient, checkSupabaseReachability } from './setup';

const isDBReachable = await checkSupabaseReachability();

describe.skipIf(!isDBReachable)('Invitation Tokens & RLS', () => {
  const hostEmail = `host_${Date.now()}@example.com`;
  const guestEmail = `guest_${Date.now()}@example.com`;
  // allow-secret
  const testPassword = 'password123';
  
  let hostId: string;
  let guestId: string;
  let sessionId: string;
  let tokenId: string;
  let tokenValue: string;

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
        name: 'Test Murder Mystery',
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
    await testClient.auth.signOut();
  });

  it('host can create an invitation token for their session', async () => {
    await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    
    // Generate a random 22 character token
    tokenValue = Math.random().toString(36).substring(2, 13) + Math.random().toString(36).substring(2, 13);
    if (tokenValue.length < 22) tokenValue = tokenValue.padEnd(22, 'a');
    tokenValue = tokenValue.substring(0, 22);

    const { data, error } = await testClient
      .from('invitation_tokens')
      .insert({
        session_id: sessionId,
        token: tokenValue,
        is_shared: true,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.token).toBe(tokenValue);
    
    tokenId = data.id;

    // Update session to link the token
    const { error: updateError } = await testClient
      .from('sessions')
      .update({ invitation_token_shared: tokenId })
      .eq('id', sessionId);
      
    expect(updateError).toBeNull();
    
    await testClient.auth.signOut();
  });

  it('anyone (unauthenticated) can read a token by value', async () => {
    // Unauthenticated request
    const { data, error } = await testClient
      .from('invitation_tokens')
      .select('*')
      .eq('token', tokenValue)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.session_id).toBe(sessionId);
  });

  it('guest cannot manage tokens for another host\'s session', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    
    let newToken = tokenValue.substring(0, 21) + 'b';
    
    const { data, error } = await testClient
      .from('invitation_tokens')
      .insert({
        session_id: sessionId,
        token: newToken,
        is_shared: true,
      })
      .select();

    // RLS should prevent this
    expect(error).toBeNull(); // Insert returns empty array on RLS fail instead of explicit error sometimes in anon context, or it throws error if no policy allows insert. Let's assert based on expected RLS behavior.
    expect(data?.length).toBeFalsy();
    
    await testClient.auth.signOut();
  });
});
