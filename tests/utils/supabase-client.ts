import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://teydpbqficbdgqovoqlo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

/**
 * Creates an admin client with service role key for test setup
 */
export const createAdminClient = (): SupabaseClient => {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY is required for admin operations');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Creates an authenticated client for a specific user
 */
export const getAuthenticatedClient = async (
  email: string,
  password: string
): Promise<SupabaseClient> => {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
  
  return client;
};

/**
 * Creates an anonymous client for testing public access
 */
export const createAnonClient = (): SupabaseClient => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};
