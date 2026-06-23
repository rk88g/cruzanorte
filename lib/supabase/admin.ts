import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Server-only helper. Never import this file from client components.
function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return {
    supabaseUrl,
    serviceRoleKey
  };
}

export function createSupabaseAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
