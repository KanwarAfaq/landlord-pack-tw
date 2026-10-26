import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.warn('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY: sign-in is disabled until they are set.');
}

// createClient throws on an empty URL, which would blank the whole site (including the public
// landing page). Fall back to inert placeholders so the page still renders without configuration.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'missing-anon-key',
);
