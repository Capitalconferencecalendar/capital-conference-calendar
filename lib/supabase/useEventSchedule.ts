"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "./browser";

type ScheduleStatus = "loading" | "anonymous" | "ready" | "error";

export function useEventSchedule() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [status, setStatus] = useState<ScheduleStatus>("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const readVersion = useRef(0);

  const refreshSchedule = useCallback(async () => {
    const version = ++readVersion.current;
    if (!supabase) {
      setStatus("error");
      setError("My Event Schedule is unavailable right now.");
      return;
    }
    setStatus("loading");
    setError("");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (version !== readVersion.current) return;
    if (sessionError) {
      setStatus("error");
      setError("Could not check your account session. Try again.");
      return;
    }
    if (!sessionData.session) {
      setEventIds([]);
      setStatus("anonymous");
      return;
    }
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (version !== readVersion.current) return;
    if (userError || !userData.user) {
      setEventIds([]);
      setStatus("anonymous");
      return;
    }
    const { data, error: readError } = await supabase
      .from("user_schedule")
      .select("event_id")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: true });
    if (version !== readVersion.current) return;
    if (readError) {
      setStatus("error");
      setError("Could not load My Event Schedule. Try again.");
      return;
    }
    setEventIds((data || []).map((row) => row.event_id));
    setStatus("ready");
  }, [supabase]);

  useEffect(() => {
    void refreshSchedule();
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        readVersion.current += 1;
        setEventIds([]);
        setStatus("loading");
      }
      if (event === "SIGNED_OUT") {
        readVersion.current += 1;
        setEventIds([]);
        setStatus("anonymous");
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        window.setTimeout(() => { void refreshSchedule(); }, 0);
      }
    });
    const onFocus = () => { void refreshSchedule(); };
    window.addEventListener("focus", onFocus);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshSchedule, supabase]);

  const currentUserId = useCallback(async () => {
    if (!supabase) throw new Error("My Event Schedule is unavailable right now.");
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      const next = window.location.pathname === "/discovery" || window.location.pathname === "/market-view"
        ? `${window.location.pathname}${window.location.search}`
        : "/discovery";
      window.location.assign(`/account/sign-in?next=${encodeURIComponent(next)}`);
      return null;
    }
    return data.user.id;
  }, [supabase]);

  const addToSchedule = useCallback(async (ids: string[]) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (!uniqueIds.length) return true;
    setBusy(true);
    try {
      const { error: writeError } = await supabase.from("user_schedule").upsert(
        uniqueIds.map((eventId) => ({ user_id: userId, event_id: eventId })),
        { onConflict: "user_id,event_id", ignoreDuplicates: true }
      );
      if (writeError) throw writeError;
      await refreshSchedule();
      return true;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshSchedule, supabase]);

  const removeFromSchedule = useCallback(async (eventId: string) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    setBusy(true);
    try {
      const { error: writeError } = await supabase.from("user_schedule")
        .delete().eq("user_id", userId).eq("event_id", eventId);
      if (writeError) throw writeError;
      await refreshSchedule();
      return true;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshSchedule, supabase]);

  const clearSchedule = useCallback(async () => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    setBusy(true);
    try {
      const { error: writeError } = await supabase.from("user_schedule")
        .delete().eq("user_id", userId);
      if (writeError) throw writeError;
      await refreshSchedule();
      return true;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshSchedule, supabase]);

  return { eventIds, status, error, busy, refreshSchedule, addToSchedule, removeFromSchedule, clearSchedule };
}
