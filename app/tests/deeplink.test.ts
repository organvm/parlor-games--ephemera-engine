import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { testClient } from './setup';

vi.mock('../src/lib/supabase', () => ({
  supabase: testClient
}));

import { resolveInvitationToken } from '../src/services/deeplink.service';

describe('DeepLink Service', () => {
  let hostId: string;
  let guestId: string;
  let sessionId: string;
  let validToken: string;
  let expiredToken: string;
  let redeemedToken: string;
  
  const hostEmail = `host_dl_${Date.now()}@example.com`;
  const guestEmail = `guest_dl_${Date.now()}@example.com`;
  // allow-secret
  const testPassword = 'password123';

  beforeAll(async () => {
    // Setup users
    await testClient.auth.signUp({ email: hostEmail, password: testPassword });
    const { data: hData } = await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    hostId = hData.user?.id || '';

    await testClient.auth.signUp({ email: guestEmail, password: testPassword });
    const { data: gData } = await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    guestId = gData.user?.id || '';

    // Create session (as host)
    await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    const { data: sessionData } = await testClient
      .from('sessions')
      .insert({
        game_type: 'confession_album',
        name: 'DeepLink Session',
        host_id: hostId,
        date_time: new Date().toISOString(),
      })
      .select()
      .single();
    sessionId = sessionData?.id || '';

    // Create a valid shared token
    validToken = 'VALID' + Date.now().toString().slice(-10) + 'ABCDE12';
    await testClient.from('invitation_tokens').insert({
      session_id: sessionId,
      token: validToken,
      is_shared: true,
    });

    // Create an expired token
    expiredToken = 'EXPIR' + Date.now().toString().slice(-10) + 'ABCDE12';
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await testClient.from('invitation_tokens').insert({
      session_id: sessionId,
      token: expiredToken,
      is_shared: true,
      expires_at: pastDate.toISOString(),
    });

    // Create an individual redeemed token
    redeemedToken = 'REDEE' + Date.now().toString().slice(-10) + 'ABCDE12';
    await testClient.from('invitation_tokens').insert({
      session_id: sessionId,
      token: redeemedToken,
      is_shared: false, // individual link
      redeemed_at: new Date().toISOString(),
      redeemed_by: hostId,
    });
    
    await testClient.auth.signOut();
  });

  afterAll(async () => {
    // We do not strictly need cleanup for testing local supabase
  });

  it('validates a correct token for unauthenticated user', async () => {
    // ensure signed out
    await testClient.auth.signOut();
    const result = await resolveInvitationToken(validToken);
    expect(result.valid).toBe(true);
    expect(result.session?.id).toBe(sessionId);
    expect(result.alreadyRsvped).toBe(false);
  });

  it('rejects an invalid token', async () => {
    const result = await resolveInvitationToken('invalid_token123');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/Invalid or missing/);
  });

  it('rejects an expired token', async () => {
    const result = await resolveInvitationToken(expiredToken);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/expired/);
  });

  it('rejects an already redeemed individual token', async () => {
    const result = await resolveInvitationToken(redeemedToken);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/already been redeemed/);
  });

  it('reports alreadyRsvped when user has joined session', async () => {
    // guest joins the session
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    await testClient.from('session_participations').insert({
      session_id: sessionId,
      user_id: guestId,
      display_name: 'DL Guest',
    });

    // now resolve the valid token
    const result = await resolveInvitationToken(validToken);
    expect(result.valid).toBe(true);
    expect(result.alreadyRsvped).toBe(true);
    
    await testClient.auth.signOut();
  });
});
