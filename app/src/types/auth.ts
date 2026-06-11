import { Session, User } from '@supabase/supabase-js';
import { Database } from './database';

export type PublicUser = Database['public']['Tables']['users']['Row'];

export interface AuthState {
  session: Session | null;
  user: User | null;
  publicUser: PublicUser | null;
  initialized: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setSession: (session: Session | null) => void;
  setPublicUser: (user: PublicUser | null) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
