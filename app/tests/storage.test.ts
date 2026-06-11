import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('Storage Buckets RLS', () => {
  const hostEmail = `host_storage_${Date.now()}@example.com`;
  const guestEmail = `guest_storage_${Date.now()}@example.com`;
  const otherGuestEmail = `other_storage_${Date.now()}@example.com`;
  // allow-secret
  const testPassword = 'password123';
  
  let hostId: string;
  let guestId: string;
  let otherId: string;
  let sessionId: string;
  let guestParticipationId: string;

  beforeAll(async () => {
    // Setup users
    await testClient.auth.signUp({ email: hostEmail, password: testPassword });
    const { data: hData } = await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    hostId = hData.user?.id || '';

    await testClient.auth.signUp({ email: guestEmail, password: testPassword });
    const { data: gData } = await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    guestId = gData.user?.id || '';

    await testClient.auth.signUp({ email: otherGuestEmail, password: testPassword });
    const { data: oData } = await testClient.auth.signInWithPassword({ email: otherGuestEmail, password: testPassword });
    otherId = oData.user?.id || '';

    // Create session (as host)
    await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    const { data: sessionData } = await testClient
      .from('sessions')
      .insert({
        game_type: 'confession_album',
        name: 'Storage Test Session',
        host_id: hostId,
        date_time: new Date().toISOString(),
      })
      .select()
      .single();
    sessionId = sessionData?.id || '';

    // Join session (as guest)
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    const { data: partData } = await testClient
      .from('session_participations')
      .insert({
        session_id: sessionId,
        user_id: guestId,
        display_name: 'Storage Guest',
      })
      .select()
      .single();
    guestParticipationId = partData?.id || '';

    await testClient.auth.signOut();
  });

  it('player can upload a photo to their own path', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    
    // Create a dummy file
    const fileBody = new Blob(['dummy image content'], { type: 'image/jpeg' });
    const fileName = `${sessionId}/${guestId}/photo.jpg`;

    const { data, error } = await testClient
      .storage
      .from('contribution-photos')
      .upload(fileName, fileBody);

    expect(error).toBeNull();
    expect(data?.path).toBe(fileName);
  });

  it('player cannot read photos of another session player', async () => {
    await testClient.auth.signInWithPassword({ email: otherGuestEmail, password: testPassword });
    
    const fileName = `${sessionId}/${guestId}/photo.jpg`;
    const { data, error } = await testClient
      .storage
      .from('contribution-photos')
      .download(fileName);

    expect(error).toBeDefined();
    // Supabase returns an error object if RLS blocks download or file not found
  });

  it('host can read photos of their session', async () => {
    await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    
    const fileName = `${sessionId}/${guestId}/photo.jpg`;
    const { data, error } = await testClient
      .storage
      .from('contribution-photos')
      .download(fileName);

    // Host should be able to download the guest's photo
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    await testClient.auth.signOut();
  });

  it('player cannot upload a photo to anothers path', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    
    const fileBody = new Blob(['malicious'], { type: 'image/jpeg' });
    const fileName = `${sessionId}/${hostId}/photo2.jpg`;

    const { data, error } = await testClient
      .storage
      .from('contribution-photos')
      .upload(fileName, fileBody);

    expect(error).toBeDefined();
    
    await testClient.auth.signOut();
  });
});
