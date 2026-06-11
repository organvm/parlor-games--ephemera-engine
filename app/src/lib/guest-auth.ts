import { supabase } from './supabase';

export const signInGuest = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
};

export const getGuestSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};
