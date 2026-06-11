import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type RoleAssignment = {
  id: string;
  session_id: string;
  participant_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string;
};

export type Role = {
  id: string;
  name: string;
  archetype: string;
};

export function useCharacterAssignment(sessionId: string) {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { data } = await supabase
        .from('role_assignments')
        .select('*')
        .eq('session_id', sessionId);
      
      if (isMounted && data) {
        setAssignments(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [sessionId]);

  const assignRole = async (participantId: string, roleId: string, assignedBy: string) => {
    const { data, error } = await supabase
      .from('role_assignments')
      .upsert({
        session_id: sessionId,
        participant_id: participantId,
        role_id: roleId,
        assigned_by: assignedBy,
      }, { onConflict: 'session_id,participant_id' })
      .select()
      .single();

    if (!error && data) {
      setAssignments(prev => {
        const filtered = prev.filter(a => a.participant_id !== participantId);
        return [...filtered, data];
      });
    }
    if (error) throw error;
  };

  const autoAssign = async (participants: { id: string }[], roles: Role[], hostId: string) => {
    // Simple round-robin for auto
    const unassignedParticipants = participants.filter(
      p => !assignments.find(a => a.participant_id === p.id)
    );
    const unassignedRoles = roles.filter(
      r => !assignments.find(a => a.role_id === r.id)
    );

    const payload = [];
    for (let i = 0; i < unassignedParticipants.length; i++) {
      if (i < unassignedRoles.length) {
        payload.push({
          session_id: sessionId,
          participant_id: unassignedParticipants[i].id,
          role_id: unassignedRoles[i].id,
          assigned_by: hostId,
        });
      }
    }

    if (payload.length > 0) {
      const { data, error } = await supabase
        .from('role_assignments')
        .upsert(payload, { onConflict: 'session_id,participant_id' })
        .select();

      if (!error && data) {
        setAssignments(prev => [...prev, ...data]);
      }
    }
  };

  return { assignments, assignRole, autoAssign, loading };
}
