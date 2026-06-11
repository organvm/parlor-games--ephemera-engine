import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Generate 22-char base62 token
function generateToken(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let token = '';
  for (let i = 0; i < 22; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function useInvitationToken(sessionId: string) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchToken = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('invitation_token_shared')
      .eq('id', sessionId)
      .single();

    if (!error && data?.invitation_token_shared) {
      const { data: tokenData } = await supabase
        .from('invitation_tokens')
        .select('token')
        .eq('id', data.invitation_token_shared)
        .single();
      
      if (tokenData) {
        setToken(tokenData.token);
      }
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const createSharedToken = async () => {
    setLoading(true);
    try {
      const tokenStr = generateToken();
      // Insert token
      const { data: tokenData, error: tokenError } = await supabase
        .from('invitation_tokens')
        .insert({
          session_id: sessionId,
          token: tokenStr,
          is_shared: true,
        })
        .select()
        .single();

      if (tokenError || !tokenData) throw tokenError;

      // Update session with primary token
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({ invitation_token_shared: tokenData.id })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      setToken(tokenStr);
    } catch (e) {
      console.error('Failed to create token', e);
    } finally {
      setLoading(false);
    }
  };

  return { token, loading, createSharedToken };
}
