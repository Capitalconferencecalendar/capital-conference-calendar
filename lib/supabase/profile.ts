import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureProfile(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  return error;
}
