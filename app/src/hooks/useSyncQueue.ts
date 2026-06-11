import { useState, useEffect } from 'react';
import { syncQueue } from '../lib/offlineSync';
import NetInfo from '@react-native-community/netinfo';

export function useSyncQueue() {
  const [queueLength, setQueueLength] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial check
    const checkQueue = () => {
      setQueueLength(syncQueue.getQueue().length);
    };
    checkQueue();

    // Check periodically since we don't have an event emitter for MMKV readily set up in syncQueue
    const interval = setInterval(checkQueue, 2000);

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected) {
        syncQueue.attemptSync().then(checkQueue);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return { queueLength, isOnline, forceSync: syncQueue.attemptSync };
}
