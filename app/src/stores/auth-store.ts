import { create } from 'zustand';
import { AuthStore, PublicUser } from '../types/auth';
import { supabase } from '../lib/supabase';

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  publicUser: null,
  initialized: false,
  isLoading: false,

  setSession: (session) => {
    set({ session, user: session?.user || null });
    if (session?.user) {
      get().refreshProfile();
    } else {
      set({ publicUser: null });
    }
  },

  setPublicUser: (publicUser) => set({ publicUser }),
  
  setInitialized: (initialized) => set({ initialized }),

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, publicUser: null, isLoading: false });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        set({ publicUser: data as PublicUser });
      } else if (error && error.code === 'PGRST116') {
        // Record not found - trigger creation (usually handled by DB trigger, 
        // but as a fallback we could call an upsert here if needed)
      }
    } catch (e) {
      console.error('Failed to fetch public profile', e);
    }
  },
}));
