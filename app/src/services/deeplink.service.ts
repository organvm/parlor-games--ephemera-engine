import { supabase } from '../lib/supabase';

export type TokenResolution = {
  valid: boolean;
  message?: string;
  alreadyRsvped?: boolean;
  session?: {
    id: string;
    name: string;
    game_type: string;
    host_id: string;
  };
  tokenRecord?: any;
};

export async function resolveInvitationToken(token: string): Promise<TokenResolution> {
  try {
    const { data, error } = await supabase
      .from('invitation_tokens')
      .select(`
        *,
        sessions (
          id,
          name,
          game_type,
          host_id
        )
      `)
      .eq('token', token)
      .single();

    if (error || !data) {
      return { valid: false, message: 'Invalid or missing invitation token.' };
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, message: 'This invitation has expired.' };
    }

    // Check if redeemed
    if (data.redeemed_at) {
      if (!data.is_shared) {
        return { valid: false, message: 'This invitation has already been redeemed.' };
      }
    }

    const sessionData = Array.isArray(data.sessions) ? data.sessions[0] : data.sessions;

    // Check if current user is already RSVPed
    const { data: userData } = await supabase.auth.getUser();
    let alreadyRsvped = false;
    
    if (userData.user) {
      const { data: partData } = await supabase
        .from('session_participations')
        .select('id')
        .eq('session_id', sessionData.id)
        .eq('user_id', userData.user.id)
        .maybeSingle();
      
      if (partData) {
        alreadyRsvped = true;
      }
    }

    return {
      valid: true,
      session: sessionData,
      tokenRecord: data,
      alreadyRsvped,
    };
  } catch (err) {
    return { valid: false, message: 'An unexpected error occurred resolving the invitation.' };
  }
}
