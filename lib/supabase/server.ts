import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

export function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
