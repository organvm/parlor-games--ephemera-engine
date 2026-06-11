import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('Authentication Flow', () => {
  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  it('should sign up a new user with email and password', async () => {
    const { data, error } = await testClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Test User'
        }
      }
    });

    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    expect(data.user?.email).toBe(testEmail);
    // Since autoConfirm is enabled for tests, session might be returned
    // or we might need to sign in
  });

  it('should sign in with email and password', async () => {
    const { data, error } = await testClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    expect(error).toBeNull();
    expect(data.session).not.toBeNull();
    expect(data.user?.email).toBe(testEmail);
  });

  it('should fail with invalid credentials', async () => {
    const { error } = await testClient.auth.signInWithPassword({
      email: testEmail,
      password: 'wrongpassword',
    });

    expect(error).not.toBeNull();
  });

  it('should sign out successfully', async () => {
    const { error } = await testClient.auth.signOut();
    expect(error).toBeNull();
  });
});
