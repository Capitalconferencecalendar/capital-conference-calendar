import { redirect } from "next/navigation";
import AuthForm from "../AuthForm";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = supabase ? await supabase.auth.getClaims() : { data: null, error: null };
  if (error || !data?.claims) redirect("/account/forgot-password");
  return <AuthForm mode="reset-password" />;
}
