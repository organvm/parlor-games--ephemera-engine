import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SessionState } from '../types/session';
import { canTransition } from '../utils/session-state-machine';

export function useSessionState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const transitionState = async (
    sessionId: string,
    currentState: SessionState,
    targetState: SessionState,
    triggeredBy: string
  ) => {
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!canTransition(currentState, targetState)) {
      const err = new Error(`Invalid transition from ${currentState} to ${targetState}`);
      setError(err);
      setLoading(false);
      return { success: false, error: err };
    }

    try {
      // Call Supabase RPC
      const { data, error: rpcError } = await supabase.rpc('transition_session_state', {
        p_session_id: sessionId,
        p_expected_state: currentState,
        p_new_state: targetState,
        p_triggered_by: triggeredBy
      });

      if (rpcError) throw rpcError;

      // TODO: Notification dispatch stubs could go here or be handled by Postgres triggers

      return { success: true, data };
    } catch (err: any) {
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    transitionState,
    loading,
    error
  };
}
