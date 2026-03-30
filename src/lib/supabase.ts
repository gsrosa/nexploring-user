import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** True when real Supabase credentials are set (optional for local layout-only dev). */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Browser client — only valid when `isSupabaseConfigured`. Otherwise a no-op placeholder
 * so the bundle never throws on import (avoids blank screen without `.env`).
 */
export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      persistSession: Boolean(url && anonKey),
      autoRefreshToken: Boolean(url && anonKey),
      detectSessionInUrl: Boolean(url && anonKey),
    },
  },
);
