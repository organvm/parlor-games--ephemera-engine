import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type PreferenceData = {
  archetypes: string[];
  notes?: string;
};

export function usePreferences(sessionId: string, participantId: string) {
  const [preferences, setPreferences] = useState<PreferenceData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contributions')
      .select('content')
      .eq('session_id', sessionId)
      .eq('participant_id', participantId)
      .maybeSingle();

    if (!error && data?.content?.preferences) {
      setPreferences(data.content.preferences);
    }
    setLoading(false);
  }, [sessionId, participantId]);

  const submitPreferences = async (prefs: PreferenceData) => {
    setLoading(true);
    // Merge preferences into contribution content
    const { data: existing } = await supabase
      .from('contributions')
      .select('content, status')
      .eq('session_id', sessionId)
      .eq('participant_id', participantId)
      .maybeSingle();

    const newContent = {
      ...(existing?.content || {}),
      preferences: prefs,
    };

    const payload = {
      session_id: sessionId,
      participant_id: participantId,
      content: newContent,
      status: existing?.status || 'draft',
    };

    const { error } = await supabase
      .from('contributions')
      .upsert(payload, { onConflict: 'session_id,participant_id' });

    if (!error) {
      setPreferences(prefs);
    }
    setLoading(false);
    if (error) throw error;
  };

  return { preferences, fetchPreferences, submitPreferences, loading };
}
