import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { ensureProfile } from "../../../lib/supabase/profile";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const supabase = await createSupabaseServerClient();

  if (tokenHash && (type === "email" || type === "recovery") && supabase) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      const { data } = await supabase.auth.getClaims();
      if (data?.claims) {
        const profileError = await ensureProfile(supabase, data.claims.sub);
        const destination = profileError
          ? "/account?setup=failed"
          : type === "recovery" ? "/account/reset-password" : "/account";
        const response = NextResponse.redirect(new URL(destination, request.url));
        response.headers.set("Cache-Control", "private, no-store");
        return response;
      }
    }
  }

  const response = NextResponse.redirect(new URL("/account/sign-in?error=link", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
