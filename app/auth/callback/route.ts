import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { ensureProfile } from "../../../lib/supabase/profile";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") === "/account/reset-password"
    ? "/account/reset-password"
    : "/account";
  const supabase = await createSupabaseServerClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getClaims();
      if (data?.claims) {
        const profileError = await ensureProfile(supabase, data.claims.sub);
        const response = NextResponse.redirect(new URL(profileError ? "/account?setup=failed" : next, request.url));
        response.headers.set("Cache-Control", "private, no-store");
        return response;
      }
    }
  }

  const response = NextResponse.redirect(new URL("/account/sign-in?error=link", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
