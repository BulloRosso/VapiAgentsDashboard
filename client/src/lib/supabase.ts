
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  console.warn('Missing Supabase URL');
}

// Initialize with empty auth, will be set after getting JWT
export const supabase = createClient(
  supabaseUrl || '',
  '', // Empty anon key, will use JWT instead
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Function to set JWT token
export const setSupabaseAuth = async (jwt: string) => {
  if (jwt) {
    supabase.realtime.setAuth(jwt);
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
