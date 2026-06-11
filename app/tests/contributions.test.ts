import { describe, it, expect, beforeAll } from 'vitest';
import { testClient, checkSupabaseReachability } from './setup';

const isDBReachable = await checkSupabaseReachability();

describe.skipIf(!isDBReachable)('Contributions CRUD & RLS', () => {
  const hostEmail = `host_c_${Date.now()}@example.com`;
  const guestEmail = `guest_c_${Date.now()}@example.com`;
  // allow-secret
  const testPassword = 'password123';
  
  let hostId: string;
  let guestId: string;
  let sessionId: string;
  let participationId: string;
  let contributionId: string;

  beforeAll(async () => {
    // Setup host
    await testClient.auth.signUp({ email: hostEmail, password: testPassword });
    const { data: hData } = await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    hostId = hData.user?.id || '';

    // Create session
    const { data: sessionData } = await testClient
      .from('sessions')
      .insert({
        game_type: 'confession_album',
        name: 'Test Contributions Session',
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

    // Join session (create participation)
    const { data: partData } = await testClient
      .from('session_participations')
      .insert({
        session_id: sessionId,
        user_id: guestId,
        display_name: 'Test Guest',
      })
      .select()
      .single();
    participationId = partData?.id;

    await testClient.auth.signOut();
  });

  it('player can create a contribution as draft', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    
    const { data, error } = await testClient
      .from('contributions')
      .insert({
        session_id: sessionId,
        participant_id: participationId,
        type: 'contribution_description',
        content: { text: 'My draft confession', photo_description: 'Me looking sad' },
        status: 'draft',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.status).toBe('draft');
    expect(data.content.text).toBe('My draft confession');
    
    contributionId = data.id;
  });

  it('player can update their own draft contribution', async () => {
    const { data, error } = await testClient
      .from('contributions')
      .update({
        content: { text: 'My updated confession', photo_description: 'Me looking sad' },
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', contributionId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.status).toBe('submitted');
    expect(data.content.text).toBe('My updated confession');
    
    await testClient.auth.signOut();
  });

  it('host can read and update (review) contributions for their session', async () => {
    await testClient.auth.signInWithPassword({ email: hostEmail, password: testPassword });
    
    // Read
    const { data: readData, error: readError } = await testClient
      .from('contributions')
      .select('*')
      .eq('session_id', sessionId);
      
    expect(readError).toBeNull();
    expect(readData?.length).toBe(1);
    expect(readData?.[0].id).toBe(contributionId);

    // Update status to reviewed
    const { data: updateData, error: updateError } = await testClient
      .from('contributions')
      .update({
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
        reviewed_by: hostId,
      })
      .eq('id', contributionId)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updateData.status).toBe('reviewed');
    
    await testClient.auth.signOut();
  });

  it('player cannot update a reviewed contribution', async () => {
    await testClient.auth.signInWithPassword({ email: guestEmail, password: testPassword });
    
    const { data, error } = await testClient
      .from('contributions')
      .update({
        content: { text: 'I try to sneak an update' },
      })
      .eq('id', contributionId)
      .select();

    // RLS should block the update because status is 'reviewed' (only 'draft', 'submitted' allowed for player)
    expect(error).toBeNull(); // Supabase might return empty array without explicit error on RLS restriction
    expect(data?.length).toBeFalsy();
    
    await testClient.auth.signOut();
  });
});
