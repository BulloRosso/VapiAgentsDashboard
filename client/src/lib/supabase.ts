import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
