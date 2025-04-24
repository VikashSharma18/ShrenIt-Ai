import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client instance
let supabaseInstance = null;
let supabaseAdminInstance = null;

// Regular client with a retry mechanism
export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      fetch: (...args) => {
        // Add fetch timeout to prevent hanging requests
        return Promise.race([
          fetch(...args),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
      }
    }
  });
  
  return supabaseInstance;
};

// Admin client with RLS bypass
export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  
  supabaseAdminInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        "x-bypass-rls": "true",
      },
      fetch: (...args) => {
        // Add fetch timeout to prevent hanging requests
        return Promise.race([
          fetch(...args),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
      }
    }
  });
  
  return supabaseAdminInstance;
};

// For backward compatibility
export const supabase = getSupabase();
export const supabaseAdmin = getSupabaseAdmin();
