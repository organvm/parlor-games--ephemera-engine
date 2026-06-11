import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../../lib/supabase';
import { syncQueue } from '../../../lib/offlineSync';
import { MurderMysteryData, Accusation, Award } from '../types/murder-mystery';

const storage = new MMKV();

export const murderMysterySync = {
  // Pre-cache session config for offline play
  preCacheSession: async (sessionId: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('config')
      .eq('id', sessionId)
      .single();
      
    if (data && data.config) {
      storage.set(`mm_session_${sessionId}`, JSON.stringify(data.config));
    }
  },

  getLocalSession: (sessionId: string): MurderMysteryData | null => {
    const stored = storage.getString(`mm_session_${sessionId}`);
    return stored ? JSON.parse(stored) as MurderMysteryData : null;
  },

  queueAccusation: (sessionId: string, accusation: Accusation) => {
    // Save to local cache immediately
    const session = murderMysterySync.getLocalSession(sessionId);
    if (session) {
      if (!session.game_night) {
        session.game_night = { act_timestamps: [], clues_distributed: [], evidence_reveals: [], accusations: [] };
      }
      session.game_night.accusations.push(accusation);
      storage.set(`mm_session_${sessionId}`, JSON.stringify(session));
    }
    
    // Queue for remote sync
    syncQueue.enqueue('MM_SYNC_CONFIG', { sessionId });
  },

  queueAwardVote: (sessionId: string, award: Award) => {
    // Save to local cache immediately
    const session = murderMysterySync.getLocalSession(sessionId);
    if (session) {
      if (!session.awards) session.awards = [];
      session.awards.push(award);
      storage.set(`mm_session_${sessionId}`, JSON.stringify(session));
    }
    
    // Queue for remote sync
    syncQueue.enqueue('MM_SYNC_CONFIG', { sessionId });
  }
};
