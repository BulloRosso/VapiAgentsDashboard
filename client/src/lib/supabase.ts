
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials');
}

// Initialize with anon key for initial connection
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Function to initialize anonymous session and set auth
export const initSupabaseAuth = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error('Auth error:', error);
    return;
  }

  if (data?.session) {
    supabase.realtime.setAuth(data.session.access_token);
  } else {
    console.log("NO JWT for Supabase")
  }
};

export const subscribeToCallUpdates = (onUpdate: (payload: any) => void) => {
  const subscription = supabase
    .channel('calls')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'calls' },
      (payload) => onUpdate(payload)
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
