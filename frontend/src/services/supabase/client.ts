import { createClient } from '@supabase/supabase-js';

// Type definition for runtime config
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}

// Get configuration from runtime config or build-time env variables
const getRuntimeConfig = () => {
  // Check if runtime config exists and is valid
  if (
    typeof window !== 'undefined' &&
    window.__RUNTIME_CONFIG__ &&
    window.__RUNTIME_CONFIG__.SUPABASE_URL !== '__SUPABASE_URL__' &&
    window.__RUNTIME_CONFIG__.SUPABASE_ANON_KEY !== '__SUPABASE_ANON_KEY__'
  ) {
    return {
      url: window.__RUNTIME_CONFIG__.SUPABASE_URL,
      key: window.__RUNTIME_CONFIG__.SUPABASE_ANON_KEY,
    };
  }

  // Fallback to build-time environment variables
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
};

const config = getRuntimeConfig();

if (!config.url || !config.key) {
  throw new Error(
    'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables when running the container, or configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file for development.'
  );
}

export const supabase = createClient(config.url, config.key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
