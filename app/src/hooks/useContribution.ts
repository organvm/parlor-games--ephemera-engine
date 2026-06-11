import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { syncQueue } from '../lib/offlineSync';
import NetInfo from '@react-native-community/netinfo';

export type ContributionData = {
  id: string;
  session_id: string;
  participant_id: string;
  content: any;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export function useContribution(sessionId: string, participantId: string) {
  const [contribution, setContribution] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchContribution = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('participant_id', participantId)
      .maybeSingle();

    if (!error && data) {
      setContribution(data as ContributionData);
    }
    setLoading(false);
  }, [sessionId, participantId]);

  const saveDraft = async (content: any) => {
    setLoading(true);
    const payload = {
      session_id: sessionId,
      participant_id: participantId,
      content,
      status: 'draft',
    };

    const { data, error } = await supabase
      .from('contributions')
      .upsert(payload, { onConflict: 'session_id,participant_id' })
      .select()
      .single();

    if (!error && data) {
      setContribution(data as ContributionData);
    }
    setLoading(false);
    if (error) throw error;
    return data;
  };

  const submitContribution = async (content: any) => {
    setLoading(true);
    const payload = {
      session_id: sessionId,
      participant_id: participantId,
      content,
      status: 'submitted',
    };

    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      syncQueue.enqueue('CONTRIBUTION_SUBMIT', payload);
      setContribution(payload as any);
      setLoading(false);
      return payload;
    }

    const { data, error } = await supabase
      .from('contributions')
      .upsert(payload, { onConflict: 'session_id,participant_id' })
      .select()
      .single();

    if (!error && data) {
      setContribution(data as ContributionData);
    } else if (error) {
      // If error (like timeout), fallback to queue
      syncQueue.enqueue('CONTRIBUTION_SUBMIT', payload);
      setContribution(payload as any);
    }
    
    setLoading(false);
    return data || payload;
  };

  return { contribution, fetchContribution, saveDraft, submitContribution, loading };
}
