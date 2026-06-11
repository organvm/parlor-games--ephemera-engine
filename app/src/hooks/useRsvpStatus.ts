import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type RsvpRecord = {
  id: string;
  user_id: string;
  display_name: string;
  status: string; // From session_state_log maybe, or just existence of participation
  created_at: string;
};

export function useRsvpStatus(sessionId: string) {
  const [participants, setParticipants] = useState<RsvpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchParticipants() {
      const { data, error } = await supabase
        .from('session_participations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (isMounted && data) {
        setParticipants(data);
      }
      if (isMounted) setLoading(false);
    }

    fetchParticipants();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`public:session_participations:session_id=eq.${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participations',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setParticipants((prev) => [...prev, payload.new as RsvpRecord]);
          } else if (payload.eventType === 'DELETE') {
            setParticipants((prev) => prev.filter((p) => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setParticipants((prev) => prev.map((p) => p.id === payload.new.id ? (payload.new as RsvpRecord) : p));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { participants, count: participants.length, loading };
}
