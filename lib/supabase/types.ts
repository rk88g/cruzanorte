import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type SupabaseDatabase = Database;
export type TypedSupabaseClient = SupabaseClient<Database>;
