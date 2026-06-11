import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('Settings and Preferences', () => {
  const userEmail = `settings_${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    await testClient.auth.signUp({ email: userEmail, password: 'password123' });
    await testClient.auth.signInWithPassword({ email: userEmail, password: 'password123' });
    const { data } = await testClient.auth.getUser();
    userId = data.user?.id || '';
  });

  it('should update notification preferences', async () => {
    const prefs = { invitations: false, reminders: true };
    const { data, error } = await testClient
      .from('users')
      .update({ notification_preferences: prefs })
      .eq('id', userId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.notification_preferences).toMatchObject(prefs);
  });

  it('should update accessibility preferences', async () => {
    const prefs = { text_size: 'large', high_contrast: true };
    const { data, error } = await testClient
      .from('users')
      .update({ accessibility_preferences: prefs })
      .eq('id', userId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.accessibility_preferences).toMatchObject(prefs);
  });
});
