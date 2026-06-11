import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('Session CRUD and RLS', () => {
  const hostEmail = `host_${Date.now()}@example.com`;
  let sessionId: string;

  beforeAll(async () => {
    // Create host and sign in
    await testClient.auth.signUp({
      email: hostEmail,
      password: 'password123',
    });
    await testClient.auth.signInWithPassword({
      email: hostEmail,
      password: 'password123',
    });
  });

  it('should create a session', async () => {
    const { data: user } = await testClient.auth.getUser();
    
    const { data, error } = await testClient
      .from('sessions')
      .insert({
        game_type: 'murder_mystery',
        name: 'Test Murder Mystery',
        host_id: user.user?.id,
        date_time: new Date().toISOString(),
        config: { theme: 'classic' }
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data.state).toBe('DRAFT');
    sessionId = data.id;
  });

  it('should read the created session', async () => {
    const { data, error } = await testClient
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    expect(error).toBeNull();
    expect(data.id).toBe(sessionId);
    expect(data.name).toBe('Test Murder Mystery');
  });

  it('should update the session', async () => {
    const { data, error } = await testClient
      .from('sessions')
      .update({ name: 'Updated Murder Mystery' })
      .eq('id', sessionId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe('Updated Murder Mystery');
  });
  
  it('should test RLS isolation (different user cannot read uninvited session)', async () => {
    // Sign in as a different user
    const otherEmail = `other_${Date.now()}@example.com`;
    await testClient.auth.signUp({ email: otherEmail, password: 'password123' });
    await testClient.auth.signInWithPassword({ email: otherEmail, password: 'password123' });
    
    const { data, error } = await testClient
      .from('sessions')
      .select('*')
      .eq('id', sessionId);
      
    // Should return empty array due to RLS
    expect(error).toBeNull();
    expect(data?.length).toBe(0);
  });
});
