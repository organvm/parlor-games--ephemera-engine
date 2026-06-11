import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CreateSessionParams, SessionRow, SessionUpdate } from '../types/session';

export function useSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const listSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      return data as SessionRow[];
    } catch (err: any) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (err) throw err;
      return data as SessionRow;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (params: CreateSessionParams) => {
    setLoading(true);
    setError(null);
    try {
      // First check active sessions limit (max 5 non-terminal)
      const { data: activeSessions, error: countErr } = await supabase
        .from('sessions')
        .select('id')
        .not('state', 'in', '("COMPLETE","ARCHIVED")');
      
      if (countErr) throw countErr;
      if (activeSessions && activeSessions.length >= 5) {
        throw new Error('You have reached the maximum limit of 5 active sessions.');
      }

      const { data, error: err } = await supabase
        .from('sessions')
        .insert({
          ...params,
          state: 'DRAFT',
          host_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (err) throw err;
      return data as SessionRow;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id: string, updates: SessionUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      return data as SessionRow;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    listSessions,
    getSession,
    createSession,
    updateSession,
    loading,
    error,
  };
}
