"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "./browser";

export type MyList = { id: string; name: string; eventIds: string[]; createdAt: string };
type ListsStatus = "loading" | "anonymous" | "ready" | "error";

export function useMyLists() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [lists, setLists] = useState<MyList[]>([]);
  const [status, setStatus] = useState<ListsStatus>("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const readVersion = useRef(0);

  const refreshLists = useCallback(async () => {
    const version = ++readVersion.current;
    if (!supabase) {
      setLists([]);
      setStatus("error");
      setError("My Lists is unavailable right now.");
      return false;
    }
    setStatus("loading");
    setError("");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (version !== readVersion.current) return false;
    if (sessionError) {
      setLists([]);
      setStatus("error");
      setError("Could not check your account session. Try again.");
      return false;
    }
    if (!sessionData.session) {
      setLists([]);
      setStatus("anonymous");
      return false;
    }
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (version !== readVersion.current) return false;
    if (userError || !userData.user) {
      setLists([]);
      setStatus("anonymous");
      return false;
    }
    const { data: listRows, error: listError } = await supabase.from("lists")
      .select("id,name,created_at").eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });
    if (version !== readVersion.current) return false;
    if (listError) {
      setLists([]);
      setStatus("error");
      setError("Could not load My Lists. Try again.");
      return false;
    }
    const ids = (listRows || []).map((row) => row.id);
    const { data: eventRows, error: eventsError } = ids.length
      ? await supabase.from("list_events").select("list_id,event_id").in("list_id", ids)
      : { data: [], error: null };
    if (version !== readVersion.current) return false;
    if (eventsError) {
      setLists([]);
      setStatus("error");
      setError("Could not load events in My Lists. Try again.");
      return false;
    }
    const eventsByList = new Map<string, string[]>();
    for (const row of eventRows || []) {
      const values = eventsByList.get(row.list_id) || [];
      values.push(row.event_id);
      eventsByList.set(row.list_id, values);
    }
    setLists((listRows || []).map((row) => ({
      id: row.id, name: row.name, createdAt: row.created_at,
      eventIds: eventsByList.get(row.id) || [],
    })));
    setStatus("ready");
    return true;
  }, [supabase]);

  useEffect(() => {
    void refreshLists();
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        readVersion.current += 1;
        setLists([]);
        setStatus(event === "SIGNED_OUT" ? "anonymous" : "loading");
        window.setTimeout(() => { void refreshLists(); }, 0);
      }
    });
    const onFocus = () => { void refreshLists(); };
    window.addEventListener("focus", onFocus);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshLists, supabase]);

  const currentUserId = useCallback(async () => {
    if (!supabase) throw new Error("My Lists is unavailable right now.");
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      const next = window.location.pathname === "/discovery" || window.location.pathname === "/market-view"
        ? `${window.location.pathname}${window.location.search}` : "/discovery";
      window.location.assign(`/account/sign-in?next=${encodeURIComponent(next)}`);
      return null;
    }
    return data.user.id;
  }, [supabase]);

  const createList = useCallback(async (name: string, eventIds: string[] = []) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return null;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 120) throw new Error("Enter a list name of 1 to 120 characters.");
    setBusy(true);
    try {
      const { data, error: createError } = await supabase.from("lists")
        .insert({ user_id: userId, name: trimmed }).select("id").single();
      if (createError || !data) throw new Error("Could not create the list. Try again.");
      const uniqueIds = [...new Set(eventIds.filter(Boolean))];
      if (uniqueIds.length) {
        const { error: addError } = await supabase.from("list_events")
          .insert(uniqueIds.map((eventId) => ({ list_id: data.id, event_id: eventId })));
        if (addError) {
          await supabase.from("lists").delete().eq("id", data.id).eq("user_id", userId);
          throw new Error("Could not save the selected events. Try again.");
        }
      }
      if (!await refreshLists()) throw new Error("List saved, but could not refresh My Lists. Try again.");
      return data.id as string;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshLists, supabase]);

  const renameList = useCallback(async (listId: string, name: string) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 120) throw new Error("Enter a list name of 1 to 120 characters.");
    setBusy(true);
    try {
      const { data, error: writeError } = await supabase.from("lists")
        .update({ name: trimmed }).eq("id", listId).eq("user_id", userId).select("id").maybeSingle();
      if (writeError || !data) throw new Error("Could not rename the list. Try again.");
      if (!await refreshLists()) throw new Error("List renamed, but could not refresh My Lists. Try again.");
      return true;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshLists, supabase]);

  const deleteList = useCallback(async (listId: string) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    setBusy(true);
    try {
      const { data, error: writeError } = await supabase.from("lists")
        .delete().eq("id", listId).eq("user_id", userId).select("id").maybeSingle();
      if (writeError || !data) throw new Error("Could not delete the list. Try again.");
      if (!await refreshLists()) throw new Error("List deleted, but could not refresh My Lists. Try again.");
      return true;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshLists, supabase]);

  const addEventsToList = useCallback(async (listId: string, eventIds: string[]) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    const uniqueIds = [...new Set(eventIds.filter(Boolean))];
    if (!uniqueIds.length) return true;
    setBusy(true);
    try {
      const { data: owner, error: ownerError } = await supabase.from("lists")
        .select("id").eq("id", listId).eq("user_id", userId).maybeSingle();
      if (ownerError || !owner) throw new Error("This list is unavailable.");
      const { error: writeError } = await supabase.from("list_events").upsert(
        uniqueIds.map((eventId) => ({ list_id: listId, event_id: eventId })),
        { onConflict: "list_id,event_id", ignoreDuplicates: true }
      );
      if (writeError) throw new Error("Could not add events to the list. Try again.");
      if (!await refreshLists()) throw new Error("Events saved, but could not refresh My Lists. Try again.");
      return true;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshLists, supabase]);

  const removeEventsFromList = useCallback(async (listId: string, eventIds: string[]) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    const uniqueIds = [...new Set(eventIds.filter(Boolean))];
    if (!uniqueIds.length) return true;
    setBusy(true);
    try {
      const { data: owner, error: ownerError } = await supabase.from("lists")
        .select("id").eq("id", listId).eq("user_id", userId).maybeSingle();
      if (ownerError || !owner) throw new Error("This list is unavailable.");
      const { error: writeError } = await supabase.from("list_events")
        .delete().eq("list_id", listId).in("event_id", uniqueIds);
      if (writeError) throw new Error("Could not remove events from the list. Try again.");
      if (!await refreshLists()) throw new Error("Events removed, but could not refresh My Lists. Try again.");
      return true;
    } finally {
      setBusy(false);
    }
  }, [currentUserId, refreshLists, supabase]);

  const getListEventIds = useCallback((listId: string) => lists.find((list) => list.id === listId)?.eventIds || [], [lists]);

  return { lists, status, error, busy, refreshLists, createList, renameList, deleteList, addEventsToList, removeEventsFromList, getListEventIds };
}
