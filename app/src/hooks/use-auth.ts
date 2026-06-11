import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';
import { AppState, AppStateStatus } from 'react-native';

export function useAuth() {
  const { 
    session, 
    user, 
    publicUser, 
    initialized, 
    setSession, 
    setInitialized,
    signOut 
  } = useAuthStore();

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Auto-refresh token on app foreground
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.unsubscribe();
      appStateSub.remove();
    };
  }, []);

  return {
    session,
    user,
    publicUser,
    initialized,
    signOut,
    isAuthenticated: !!session,
  };
}
