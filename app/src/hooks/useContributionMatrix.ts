import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RsvpRecord } from './useRsvpStatus';
import { ContributionData } from './useContribution';

export type MatrixRow = RsvpRecord & {
  contribution?: ContributionData;
};

export function useContributionMatrix(sessionId: string) {
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      // Load participations
      const { data: participations } = await supabase
        .from('session_participations')
        .select('*')
        .eq('session_id', sessionId);

      // Load contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select('*')
        .eq('session_id', sessionId);

      if (isMounted && participations) {
        const rows = participations.map((p) => {
          const contrib = (contributions || []).find((c) => c.participant_id === p.id);
          return { ...p, contribution: contrib } as MatrixRow;
        });
        setMatrix(rows);
        setLoading(false);
      }
    }

    loadInitialData();

    const channel = supabase
      .channel(`public:contributions:session_id=eq.${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contributions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMatrix((prev) => {
            return prev.map((row) => {
              if (row.id === payload.new.participant_id) {
                return { ...row, contribution: payload.new as ContributionData };
              }
              return row;
            });
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { matrix, loading };
}
