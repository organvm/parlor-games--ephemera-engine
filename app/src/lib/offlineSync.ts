import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';

const storage = new MMKV();
const QUEUE_KEY = 'offline_sync_queue';

type QueuedAction = {
  id: string;
  type: 'CONTRIBUTION_SUBMIT' | 'RSVP_SUBMIT' | 'MM_SYNC_CONFIG';
  payload: any;
  timestamp: number;
};

export const syncQueue = {
  enqueue: (type: QueuedAction['type'], payload: any) => {
    const queue = syncQueue.getQueue();
    const action: QueuedAction = {
      id: Math.random().toString(36).substring(7),
      type,
      payload,
      timestamp: Date.now(),
    };
    queue.push(action);
    storage.set(QUEUE_KEY, JSON.stringify(queue));
    syncQueue.attemptSync();
  },

  getQueue: (): QueuedAction[] => {
    const stored = storage.getString(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  clearAction: (id: string) => {
    const queue = syncQueue.getQueue();
    const newQueue = queue.filter(a => a.id !== id);
    storage.set(QUEUE_KEY, JSON.stringify(newQueue));
  },

  attemptSync: async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    const queue = syncQueue.getQueue();
    if (queue.length === 0) return;

    // Process queue
    for (const action of queue) {
      try {
        if (action.type === 'CONTRIBUTION_SUBMIT') {
          await supabase.from('contributions').upsert(action.payload, { onConflict: 'session_id,participant_id' });
        } else if (action.type === 'RSVP_SUBMIT') {
          await supabase.from('session_participations').upsert(action.payload, { onConflict: 'session_id,user_id' });
        } else if (action.type === 'MM_SYNC_CONFIG') {
          // Read local cache and update remote config
          const localStored = storage.getString(`mm_session_${action.payload.sessionId}`);
          if (localStored) {
            await supabase.from('sessions').update({ config: JSON.parse(localStored) }).eq('id', action.payload.sessionId);
          }
        }
        // Success, remove from queue
        syncQueue.clearAction(action.id);
      } catch (e) {
        console.error('Failed to sync action', action, e);
        // We leave it in the queue for the next retry
      }
    }
  }
};

// Setup listener for connectivity changes
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncQueue.attemptSync();
  }
});
