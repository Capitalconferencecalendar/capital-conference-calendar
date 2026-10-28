"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "./browser";

export type SavedViewFilters = {
  dateRange: "next30" | "next60" | "next90" | "all";
  country: string[]; region: string[]; state: string[]; cities: string[];
  sectorThemes: string[]; publicCompanySectors: string[]; conferenceType: string[];
  issuerParticipation: string[]; targetAudience: string[]; companyParticipants: string[];
  eventFeatures: string[]; accessModel: string[]; marketCap: string[];
  organizer: string[]; marketFocus: string[];
};

export type SavedView = {
  id: string;
  name: string;
  source: "discovery" | "market-view";
  filters: SavedViewFilters;
  filterMode: "and" | "or";
  searchQuery: string;
  fromDate: string;
  toDate: string;
  eventCount: number | null;
  createdAt: string;
};

export type SavedViewInput = Omit<SavedView, "id" | "createdAt">;
type SavedViewsStatus = "loading" | "anonymous" | "ready" | "error";
const filterKeys = ["country", "region", "state", "cities", "sectorThemes", "publicCompanySectors", "conferenceType", "issuerParticipation", "targetAudience", "companyParticipants", "eventFeatures", "accessModel", "marketCap", "organizer", "marketFocus"] as const;

export function normalizeSavedViewFilters(value: unknown): SavedViewFilters {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const filters = { dateRange: (["next30", "next60", "next90", "all"] as unknown[]).includes(source.dateRange) ? source.dateRange as SavedViewFilters["dateRange"] : "all" } as SavedViewFilters;
  for (const key of filterKeys) {
    const raw = source[key];
    filters[key] = Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string" && Boolean(item)) : [];
  }
  return filters;
}

export function useSavedViews() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [views, setViews] = useState<SavedView[]>([]);
  const [status, setStatus] = useState<SavedViewsStatus>("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const readVersion = useRef(0);

  const refreshSavedViews = useCallback(async () => {
    const version = ++readVersion.current;
    if (!supabase) {
      setViews([]); setStatus("error"); setError("Saved Views is unavailable right now."); return false;
    }
    setStatus("loading"); setError("");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (version !== readVersion.current) return false;
    if (sessionError) {
      setViews([]); setStatus("error"); setError("Could not check your account session. Try again."); return false;
    }
    if (!sessionData.session) {
      setViews([]); setStatus("anonymous"); return false;
    }
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (version !== readVersion.current) return false;
    if (userError || !userData.user) {
      setViews([]); setStatus("anonymous"); return false;
    }
    const { data, error: readError } = await supabase.from("saved_views")
      .select("id,name,filters,search_query,filter_mode,from_date,to_date,event_count,created_at")
      .eq("user_id", userData.user.id).order("created_at", { ascending: false });
    if (version !== readVersion.current) return false;
    if (readError) {
      setViews([]); setStatus("error"); setError("Could not load Saved Views. Try again."); return false;
    }
    setViews((data || []).map((row) => {
      const metadata = row.filters && typeof row.filters === "object" && !Array.isArray(row.filters) ? row.filters as Record<string, unknown> : {};
      return {
        id: row.id, name: row.name,
        source: metadata.source === "market-view" ? "market-view" as const : "discovery" as const,
        filters: normalizeSavedViewFilters(row.filters),
        filterMode: row.filter_mode === "or" ? "or" as const : "and" as const,
        searchQuery: row.search_query || "", fromDate: row.from_date || "", toDate: row.to_date || "",
        eventCount: row.event_count, createdAt: row.created_at,
      };
    }));
    setStatus("ready");
    return true;
  }, [supabase]);

  useEffect(() => {
    void refreshSavedViews();
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        readVersion.current += 1;
        setViews([]);
        setStatus(event === "SIGNED_OUT" ? "anonymous" : "loading");
        window.setTimeout(() => { void refreshSavedViews(); }, 0);
      }
    });
    const onFocus = () => { void refreshSavedViews(); };
    window.addEventListener("focus", onFocus);
    return () => { subscription.unsubscribe(); window.removeEventListener("focus", onFocus); };
  }, [refreshSavedViews, supabase]);

  const currentUserId = useCallback(async () => {
    if (!supabase) throw new Error("Saved Views is unavailable right now.");
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      const path = window.location.pathname;
      const next = path === "/discovery" || path === "/market-view" ? `${path}${window.location.search}` : "/discovery";
      window.location.assign(`/account/sign-in?next=${encodeURIComponent(next)}`);
      return null;
    }
    return data.user.id;
  }, [supabase]);

  const createSavedView = useCallback(async (input: SavedViewInput) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return null;
    const name = input.name.trim();
    if (!name || name.length > 120) throw new Error("Enter a view name of 1 to 120 characters.");
    if (input.fromDate && input.toDate && input.fromDate > input.toDate) throw new Error("The end date must be on or after the start date.");
    setBusy(true);
    try {
      const { data, error: writeError } = await supabase.from("saved_views").insert({
        user_id: userId, name, filters: { ...normalizeSavedViewFilters(input.filters), source: input.source },
        filter_mode: input.filterMode, search_query: input.searchQuery,
        from_date: input.fromDate || null, to_date: input.toDate || null,
        event_count: input.eventCount,
      }).select("id").single();
      if (writeError || !data) throw new Error("Could not save this view. Try again.");
      if (!await refreshSavedViews()) throw new Error("View saved, but could not refresh Saved Views. Try again.");
      return data.id as string;
    } finally { setBusy(false); }
  }, [currentUserId, refreshSavedViews, supabase]);

  const renameSavedView = useCallback(async (viewId: string, name: string) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 120) throw new Error("Enter a view name of 1 to 120 characters.");
    setBusy(true);
    try {
      const { data, error: writeError } = await supabase.from("saved_views").update({ name: trimmed })
        .eq("id", viewId).eq("user_id", userId).select("id").maybeSingle();
      if (writeError || !data) throw new Error("Could not rename this view. Try again.");
      if (!await refreshSavedViews()) throw new Error("View renamed, but could not refresh Saved Views. Try again.");
      return true;
    } finally { setBusy(false); }
  }, [currentUserId, refreshSavedViews, supabase]);

  const deleteSavedView = useCallback(async (viewId: string) => {
    const userId = await currentUserId();
    if (!userId || !supabase) return false;
    setBusy(true);
    try {
      const { data, error: writeError } = await supabase.from("saved_views").delete()
        .eq("id", viewId).eq("user_id", userId).select("id").maybeSingle();
      if (writeError || !data) throw new Error("Could not delete this view. Try again.");
      if (!await refreshSavedViews()) throw new Error("View deleted, but could not refresh Saved Views. Try again.");
      return true;
    } finally { setBusy(false); }
  }, [currentUserId, refreshSavedViews, supabase]);

  return { views, status, error, busy, refreshSavedViews, createSavedView, renameSavedView, deleteSavedView };
}
