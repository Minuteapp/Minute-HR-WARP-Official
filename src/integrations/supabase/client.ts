import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase-Umgebungsvariablen fehlen. Bitte stellen Sie sicher, dass VITE_SUPABASE_URL und VITE_SUPABASE_PUBLISHABLE_KEY in der .env Datei definiert sind.'
  );
}

console.log('Supabase URL:', supabaseUrl);

// Erstellen des Supabase Clients, REST und Realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const initializeSupabase = () => {
  // Hier können zusätzliche Initialisierungsschritte stattfinden
  console.log('Supabase client initialized');
  return supabase;
};
