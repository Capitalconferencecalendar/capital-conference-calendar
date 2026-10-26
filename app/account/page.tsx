import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams?: Promise<{ password?: string; setup?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = supabase ? await supabase.auth.getClaims() : { data: null, error: null };
  if (error || !data?.claims) redirect("/account/sign-in");

  const params = await searchParams;
  const email = typeof data.claims.email === "string" ? data.claims.email : "Your account";
  const { data: profile } = await supabase!.from("profiles").select("user_id").eq("user_id", data.claims.sub).maybeSingle();

  return (
    <section style={{ display: "grid", gap: "20px" }}>
      <div style={{ borderBottom: "1px solid rgba(147,197,253,0.2)", paddingBottom: "18px" }}>
        <div style={{ color: "#7dc6ff", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Account</div>
        <h1 style={{ margin: "7px 0 0", color: "#f8fbff", fontSize: "28px" }}>Your Account</h1>
      </div>
      <div style={{ color: "#dbeafe", fontSize: "14px", overflowWrap: "anywhere" }}>{email}</div>
      {params?.password === "updated" ? <p role="status" style={{ color: "#86efac", margin: 0 }}>Your password has been updated.</p> : null}
      {!profile || params?.setup === "failed" ? (
        <p role="alert" style={{ color: "#fca5a5", margin: 0, fontSize: "13px" }}>
          Your account is signed in, but profile setup did not finish. Sign out and sign in again to retry.
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link href="/discovery" style={{ color: "#91c8ff", fontSize: "14px" }}>Discovery</Link>
        <Link href="/market-view" style={{ color: "#91c8ff", fontSize: "14px" }}>Market View</Link>
      </div>
      <form action={signOut}>
        <button type="submit" style={{ height: "38px", padding: "0 14px", borderRadius: "6px", border: "1px solid rgba(147,197,253,0.35)", background: "#102c49", color: "#f8fbff", fontWeight: 700, cursor: "pointer" }}>
          Sign Out
        </button>
      </form>
    </section>
  );
}
