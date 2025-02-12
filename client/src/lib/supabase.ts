import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
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