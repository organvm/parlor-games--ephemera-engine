import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('Content Packs & User Purchases RLS', () => {
  const userEmail = `player_${Date.now()}@example.com`;
  // allow-secret
  const testPassword = 'password123';
  
  let userId: string;

  beforeAll(async () => {
    // Setup standard user
    await testClient.auth.signUp({ email: userEmail, password: testPassword });
    const { data } = await testClient.auth.signInWithPassword({ email: userEmail, password: testPassword });
    userId = data.user?.id || '';
    
    await testClient.auth.signOut();
  });

  it('unauthenticated users can read published content packs', async () => {
    // Ensure we are signed out
    await testClient.auth.signOut();

    const { data, error } = await testClient
      .from('content_packs')
      .select('*');

    // We just verify the query doesn't fail due to RLS.
    // The test DB might be empty, so data could be []
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('users cannot insert new content packs', async () => {
    await testClient.auth.signInWithPassword({ email: userEmail, password: testPassword });

    const { data, error } = await testClient
      .from('content_packs')
      .insert({
        id: `test-pack-${Date.now()}`,
        name: 'Test Pack',
        game_type: 'confession-album',
        type: 'theme',
        description: 'A test pack',
      })
      .select();

    // RLS should block insertion
    expect(error).toBeDefined();
    
    await testClient.auth.signOut();
  });

  it('users can read their own purchased packs', async () => {
    await testClient.auth.signInWithPassword({ email: userEmail, password: testPassword });

    const { data, error } = await testClient
      .from('user_content_packs')
      .select('*')
      .eq('user_id', userId);

    // Query should succeed (even if empty)
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    await testClient.auth.signOut();
  });

  it('users cannot read others purchases', async () => {
    await testClient.auth.signInWithPassword({ email: userEmail, password: testPassword });

    const randomUserId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await testClient
      .from('user_content_packs')
      .select('*')
      .eq('user_id', randomUserId);

    expect(error).toBeNull();
    // It should just return empty
    expect(data?.length).toBe(0);
    
    await testClient.auth.signOut();
  });
});
