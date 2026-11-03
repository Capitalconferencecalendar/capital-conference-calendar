import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "../components/AppShell";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import MyViewClient from "./MyViewClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My View | Capital Conference Database",
};

export default async function MyViewPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = supabase ? await supabase.auth.getClaims() : { data: null, error: null };
  if (error || !data?.claims) redirect("/account/sign-in?next=%2Fmy-view");

  return (
    <AppShell active="account" workspaceMode="myview">
      <MyViewClient />
    </AppShell>
  );
}
