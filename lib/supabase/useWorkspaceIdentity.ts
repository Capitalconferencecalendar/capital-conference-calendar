"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "./browser";
import type { WorkspaceIdentity } from "./workspacePreferences";

export function useWorkspaceIdentity() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [identity, setIdentity] = useState<WorkspaceIdentity | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIdentity("anonymous");
      return;
    }
    let active = true;
    let version = 0;
    const resolve = async () => {
      const current = ++version;
      const { data, error } = await supabase.auth.getUser();
      if (active && current === version) setIdentity(!error && data.user ? data.user.id : "anonymous");
    };
    void resolve();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        version += 1;
        setIdentity("anonymous");
      } else if (event === "SIGNED_IN") {
        setIdentity((current) => current === session?.user.id ? current : null);
        window.setTimeout(() => { if (active) void resolve(); }, 0);
      }
    });
    const onFocus = () => { void resolve(); };
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [supabase]);

  return identity;
}
