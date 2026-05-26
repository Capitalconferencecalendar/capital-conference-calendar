"use client";

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AddToCalendar from "../components/AddToCalendar";
import ConcentrationStrip from "../components/ConcentrationStrip";
import type { ConcentrationItem } from "../components/ConcentrationStrip";
import AreaEventsPanel from "../components/AreaEventsPanel";

export type WorkspaceEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  country: string;
  venue: string;
  website: string;
  sourcePage?: string;
  organizer: string;
  eventSeries: string;
  primaryCategory: string;
  marketFocus: string;
  sectorThemes: string;
  issuerParticipation: string;
  region: string;
  format: string;
};

type SavedList = { id: string; name: string; eventIds: string[]; createdAt: string };
type SavedView = { id: string; name: string; filters: FiltersState; createdAt: string; eventCount?: number };
type RecentActivity = { id: string; type: "event" | "feed" | "view"; label: string; detail?: string; at: string };

type FiltersState = {
  dateRange: "next30" | "next60" | "next90" | "all";
  country: string;
  region: string;
  state: string;
  cities: string[];
  sectorThemes: string[];
  conferenceType: string[];
  issuerParticipation: string[];
  organizer: string[];
  marketFocus: string[];
};

type AnalysisAction =
  | { type: "sectorTheme"; value: string }
  | { type: "conferenceType"; value: string }
  | { type: "marketFocus"; value: string }
  | { type: "city"; value: string }
  | { type: "organizer"; value: string }
  | { type: "week"; from: string; to: string };

type Props = {
  events: WorkspaceEvent[];
  initialCity: string;
  initialSearchQuery?: string;
  initialMode?: "market" | "about" | "contact" | "subscribe" | "submit";
};

const DEFAULT_FILTERS: FiltersState = {
  dateRange: "all",
  country: "",
  region: "",
  state: "",
  cities: [],
  sectorThemes: [],
  conferenceType: [],
  issuerParticipation: [],
  organizer: [],
  marketFocus: [],
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function splitCsv(value: string) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function getWeekStart(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function toDateRangeParts(startDate: string, endDate: string) {
  const s = new Date(`${startDate}T00:00:00`);
  const e = new Date(`${(endDate || startDate)}T00:00:00`);
  if (Number.isNaN(s.getTime())) return { month: "TBD", dayRange: "", dowRange: "" };
  const sm = s.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const sd = s.getDate();
  const ed = Number.isNaN(e.getTime()) ? sd : e.getDate();
  const sdow = s.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const edow = Number.isNaN(e.getTime()) ? sdow : e.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  return { month: sm, dayRange: sd === ed ? String(sd) : `${sd}–${ed}`, dowRange: sdow === edow ? sdow : `${sdow}–${edow}` };
}

function buildDescription(e: WorkspaceEvent) {
  return [
    e.organizer ? `Organizer: ${e.organizer}` : "",
    e.primaryCategory ? `Primary Category: ${e.primaryCategory}` : "",
    e.marketFocus ? `Market Focus: ${e.marketFocus}` : "",
    e.issuerParticipation ? `Issuer Participation: ${e.issuerParticipation}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function AboutIcon({ kind, color }: { kind: "radar" | "calendar" | "layers" | "globe" | "zap" | "headset" | "building" | "messages" | "mail"; color: string }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 40,
    height: 40,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "radar") {
    return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 12 16.5 7.5" /><circle cx="12" cy="12" r="2" /></svg>;
  }
  if (kind === "calendar") {
    return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></svg>;
  }
  if (kind === "layers") {
    return <svg {...common}><path d="M12 4 3 9l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /></svg>;
  }
  if (kind === "globe") {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13.5 13.5 0 0 1 0 18" /><path d="M12 3a13.5 13.5 0 0 0 0 18" /></svg>;
  }
  if (kind === "headset") {
    return <svg {...common}><path d="M4 12a8 8 0 0 1 16 0" /><rect x="3" y="12" width="4" height="6" rx="2" /><rect x="17" y="12" width="4" height="6" rx="2" /><path d="M8 20h8" /></svg>;
  }
  if (kind === "building") {
    return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" /><path d="M10 21v-3h4v3" /></svg>;
  }
  if (kind === "messages") {
    return <svg {...common}><path d="M7 8h10M7 12h7" /><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></svg>;
  }
  if (kind === "mail") {
    return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
  }
  return <svg {...common}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" /></svg>;
}

function normalizeExternalUrl(raw: string) {
  const value = (raw || "").trim();
  if (!value) return "";

  const parts = value
    .split(/[\s,|]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const direct = parts.find((p) => /^https?:\/\//i.test(p) || /^www\./i.test(p));
  const matched =
    direct ||
    value.match(/https?:\/\/[^\s,|)]+/i)?.[0] ||
    value.match(/www\.[^\s,|)]+/i)?.[0] ||
    "";

  const candidate = matched.replace(/[).,;]+$/g, "");
  if (!candidate) return "";
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (/^www\./i.test(candidate)) return `https://${candidate}`;
  return "";
}

function buildEventLink(e: WorkspaceEvent) {
  const normalizedWebsite = normalizeExternalUrl(e.website || "");
  if (normalizedWebsite) return normalizedWebsite;
  const normalizedSource = normalizeExternalUrl(e.sourcePage || "");
  if (normalizedSource) return normalizedSource;
  const query = [e.title, e.organizer, [e.city, e.state].filter(Boolean).join(", ")].filter(Boolean).join(" ");
  if (!query) return "";
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function StatGlyph({ kind }: { kind: "total" | "cities" | "next30" | "hot" }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#d8ccff",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "total") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 13h6V4H4v9ZM14 20h6V4h-6v16ZM4 20h6v-3H4v3Z" />
      </svg>
    );
  }
  if (kind === "cities") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 21s7-4.4 7-10a7 7 0 1 0-14 0c0 5.6 7 10 7 10Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    );
  }
  if (kind === "next30") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="m12 3 2.4 4.8L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.6-1.2L12 3Z" />
    </svg>
  );
}

function QuickViewGlyph({
  kind,
}: {
  kind:
    | "city"
    | "investor"
    | "health"
    | "private"
    | "tech"
    | "canada"
    | "next30"
    | "next60"
    | "region";
}) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#e6dbff",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "city") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 21s7-4.4 7-10a7 7 0 1 0-14 0c0 5.6 7 10 7 10Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    );
  }
  if (kind === "investor") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 21h18M5 21V8l7-4 7 4v13M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      </svg>
    );
  }
  if (kind === "health") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 21s-7-4.2-9-9.1A5.8 5.8 0 0 1 12 5a5.8 5.8 0 0 1 9 6.9c-2 4.9-9 9.1-9 9.1Z" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  if (kind === "private") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 7h18M5 7l1-3h12l1 3M5 7v12h14V7M9 12h6" />
      </svg>
    );
  }
  if (kind === "tech") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9 9h6v6H9zM3 10h2M3 14h2M19 10h2M19 14h2M10 3v2M14 3v2M10 19v2M14 19v2" />
      </svg>
    );
  }
  if (kind === "canada") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z" />
        <path d="m12 7 1.2 2.4 2.6.3-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.3L12 7Z" />
      </svg>
    );
  }
  if (kind === "next60") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18M9 15h6" />
      </svg>
    );
  }
  if (kind === "region") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 7h6l2-3 3 2h7v3l-4 1-2 4-5 1-2 4-5-3z" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}

function CalendarBrandGlyph({ brand }: { brand: "google" | "apple" | "outlook" }) {
  if (brand === "google") {
    return (
      <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.82.86-3.06.86-2.35 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.96 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3-2.33Z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3 2.33c.7-2.12 2.69-3.7 5.04-3.7Z" />
      </svg>
    );
  }
  if (brand === "apple") {
    return <span style={{ fontSize: "14px", lineHeight: 1, color: "#e2e8f0" }}></span>;
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="none" stroke="#38BDF8" strokeWidth="1.8" />
      <path d="M3.5 8.5 12 14l8.5-5.5" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EventsClient({ events, initialCity, initialSearchQuery = "", initialMode = "market" }: Props) {
  const PANEL_HEIGHT = "calc(100vh - 126px)";
  const centerWorkspaceRef = useRef<HTMLElement | null>(null);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [activeSavedListId, setActiveSavedListId] = useState<string | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const searchQuery = initialSearchQuery;
  const [activeQuickView, setActiveQuickView] = useState("");
  const [nearbyCity, setNearbyCity] = useState(initialCity || "New York");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"soonest" | "city">("soonest");
  const [urlSeeded, setUrlSeeded] = useState(false);
  const [activeToolbarAction, setActiveToolbarAction] = useState<string>("");
  const [toolbarHelpText, setToolbarHelpText] = useState<string>("");
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [savedConferenceListsOpen, setSavedConferenceListsOpen] = useState(true);
  const [savedMarketViewsOpen, setSavedMarketViewsOpen] = useState(true);
  const [dashboardMode, setDashboardMode] = useState<"market" | "about" | "contact" | "subscribe" | "submit">(initialMode);
  const subscribeEmailRef = useRef<HTMLInputElement | null>(null);
  const submitUrlRef = useRef<HTMLInputElement | null>(null);
  const [submitForm, setSubmitForm] = useState({
    url: "",
    email: "",
    conferenceName: "",
    organizer: "",
    startDate: "",
    endDate: "",
    location: "",
    notes: "",
  });
  const [submitFormMessage, setSubmitFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saveListChoice, setSaveListChoice] = useState<string>("new");
  const saveMenuRef = useRef<HTMLDivElement | null>(null);
  const toolbarActionTimerRef = useRef<number | null>(null);

  const controlStyle: CSSProperties = {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
    height: "36px",
    borderRadius: "8px",
    background: "#08223d",
    color: "#e2e8f0",
    border: "1px solid rgba(96,165,250,0.3)",
  };

  useEffect(() => {
    try {
      const lists = localStorage.getItem("ccc_saved_lists");
      const views = localStorage.getItem("ccc_saved_views");
      const selected = localStorage.getItem("ccc_selected_events");
      const recentFilters = localStorage.getItem("ccc_recent_filters");
      const recentActivityRaw = localStorage.getItem("ccc_recent_activity");
      if (lists) setSavedLists(JSON.parse(lists));
      if (views) setSavedViews(JSON.parse(views));
      if (selected) setSelectedEvents(JSON.parse(selected));
      if (recentFilters) setFilters({ ...DEFAULT_FILTERS, ...JSON.parse(recentFilters) });
      if (recentActivityRaw) setRecentActivity(JSON.parse(recentActivityRaw));
    } catch {
      // ignore local storage parse issues
    }
  }, []);

  useEffect(() => {
    setDashboardMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const scroller = centerWorkspaceRef.current;
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [dashboardMode]);

  const markToolbarAction = (key: string) => {
    setActiveToolbarAction(key);
    if (toolbarActionTimerRef.current) {
      window.clearTimeout(toolbarActionTimerRef.current);
    }
    toolbarActionTimerRef.current = window.setTimeout(() => setActiveToolbarAction(""), 1400);
  };

  useEffect(() => () => {
    if (toolbarActionTimerRef.current) {
      window.clearTimeout(toolbarActionTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!saveMenuRef.current) return;
      const target = event.target as Node;
      if (!saveMenuRef.current.contains(target)) {
        setSaveMenuOpen(false);
      }
    };
    if (saveMenuOpen) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [saveMenuOpen]);

  const scrollToResultsAnchor = () => {
    const scroller = centerWorkspaceRef.current;
    const anchor = resultsAnchorRef.current;
    if (!scroller || !anchor) return;
    const targetTop = Math.max(0, anchor.offsetTop - 8);
    scroller.scrollTo({ top: targetTop, behavior: "smooth" });
    window.requestAnimationFrame(() => {
      scroller.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  };

  const recordActivity = useCallback((type: "event" | "feed" | "view", label: string, detail?: string) => {
    const next: RecentActivity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      label,
      detail,
      at: new Date().toISOString(),
    };
    setRecentActivity((prev) => [next, ...prev].slice(0, 12));
  }, []);

  useEffect(() => localStorage.setItem("ccc_selected_events", JSON.stringify(selectedEvents)), [selectedEvents]);
  useEffect(() => localStorage.setItem("ccc_saved_lists", JSON.stringify(savedLists)), [savedLists]);
  useEffect(() => localStorage.setItem("ccc_saved_views", JSON.stringify(savedViews)), [savedViews]);
  useEffect(() => localStorage.setItem("ccc_recent_filters", JSON.stringify(filters)), [filters]);
  useEffect(() => localStorage.setItem("ccc_recent_activity", JSON.stringify(recentActivity)), [recentActivity]);
  useLayoutEffect(() => {
    const el = centerWorkspaceRef.current;
    if (!el) return;
    el.scrollTop = 0;
    window.requestAnimationFrame(() => {
      el.scrollTop = 0;
    });
  }, []);

  useEffect(() => {
    const resetAllScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (centerWorkspaceRef.current) {
        centerWorkspaceRef.current.scrollTop = 0;
      }
    };

    resetAllScroll();
    const t1 = window.setTimeout(resetAllScroll, 50);
    const t2 = window.setTimeout(resetAllScroll, 250);
    const t3 = window.setTimeout(resetAllScroll, 700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    if (urlSeeded || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get("city") || "";
    const startDateParam = params.get("startDate") || "";
    const endDateParam = params.get("endDate") || "";
    if (cityParam || startDateParam || endDateParam) {
      setFilters((prev) => ({ ...prev, cities: cityParam ? [cityParam] : prev.cities }));
      if (startDateParam) setFromDate(startDateParam);
      if (endDateParam) setToDate(endDateParam);
    }
    setUrlSeeded(true);
  }, [urlSeeded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`
      );
    }
    const forceTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (centerWorkspaceRef.current) {
        centerWorkspaceRef.current.scrollTop = 0;
      }
    };
    forceTop();
    const r1 = window.requestAnimationFrame(forceTop);
    const t = window.setTimeout(forceTop, 180);
    return () => {
      window.cancelAnimationFrame(r1);
      window.clearTimeout(t);
    };
  }, []);

  const cities = useMemo(() => unique(events.map((e) => [e.city, e.state].filter(Boolean).join(", "))), [events]);
  const regions = useMemo(() => unique(events.map((e) => e.region)), [events]);
  const countries = useMemo(() => unique(events.map((e) => e.country)), [events]);
  const states = useMemo(() => unique(events.map((e) => e.state)), [events]);
  const themes = useMemo(() => unique(events.flatMap((e) => splitCsv(e.sectorThemes))), [events]);
  const conferenceTypes = useMemo(() => unique(events.map((e) => e.primaryCategory)), [events]);
  const issuers = useMemo(() => unique(events.map((e) => e.issuerParticipation)), [events]);
  const organizers = useMemo(() => unique(events.map((e) => e.organizer)), [events]);
  const marketFocusOptions = useMemo(() => unique(events.flatMap((e) => splitCsv(e.marketFocus))), [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const nowTime = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const daysByRange = filters.dateRange === "next30" ? 30 : filters.dateRange === "next60" ? 60 : filters.dateRange === "next90" ? 90 : 3650;
    const max = nowTime + daysByRange * 86400000;
    const q = searchQuery.trim().toLowerCase();

    let list = events.filter((e) => {
      const start = new Date(`${e.startDate}T00:00:00Z`).getTime();
      if (filters.dateRange !== "all" && (start < nowTime || start > max)) return false;
      if (fromDate) { const min = new Date(`${fromDate}T00:00:00Z`).getTime(); if (start < min) return false; }
      if (toDate) { const maxDate = new Date(`${toDate}T23:59:59Z`).getTime(); if (start > maxDate) return false; }
      if (filters.country && e.country !== filters.country) return false;
      if (filters.region && e.region !== filters.region) return false;
      if (filters.state && e.state !== filters.state) return false;
      if (filters.cities.length && !filters.cities.includes([e.city, e.state].filter(Boolean).join(", "))) return false;
      if (filters.conferenceType.length && !filters.conferenceType.includes(e.primaryCategory)) return false;
      if (filters.issuerParticipation.length && !filters.issuerParticipation.includes(e.issuerParticipation)) return false;
      if (filters.organizer.length && !filters.organizer.includes(e.organizer)) return false;
      if (filters.marketFocus.length && !filters.marketFocus.some((f) => splitCsv(e.marketFocus).includes(f))) return false;
      if (filters.sectorThemes.length && !filters.sectorThemes.some((f) => splitCsv(e.sectorThemes).includes(f))) return false;
      if (q) {
        const hay = [e.title, e.organizer, e.city, e.state, e.primaryCategory, e.marketFocus, e.sectorThemes].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortMode === "city") {
        return [a.city, a.startDate, a.title].join("|").localeCompare([b.city, b.startDate, b.title].join("|"));
      }
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return a.title.localeCompare(b.title);
    });

    if (activeSavedListId) {
      const activeList = savedLists.find((l) => l.id === activeSavedListId);
      if (activeList) {
        const idSet = new Set(activeList.eventIds);
        list = list.filter((e) => idSet.has(e.id));
      }
    }

    return list;
  }, [events, filters, searchQuery, sortMode, fromDate, toDate, activeSavedListId, savedLists]);

  const selectedSet = useMemo(() => new Set(selectedEvents), [selectedEvents]);

  const buildWeeks = useCallback((source: WorkspaceEvent[]) => {
    const map = new Map<string, WorkspaceEvent[]>();
    source.forEach((e) => {
      const key = getWeekStart(e.startDate);
      map.set(key, [...(map.get(key) || []), e]);
    });

    return Array.from(map.entries())
      .map(([weekStart, list]) => ({
        weekStart,
        weekEnd: new Date(new Date(`${weekStart}T00:00:00`).getTime() + 6 * 86400000).toISOString().slice(0, 10),
        count: list.length,
        cities: unique(list.map((e) => [e.city, e.state].filter(Boolean).join(", ")))
          .slice(0, 3)
          .map((label) => ({ label, count: list.filter((e) => [e.city, e.state].filter(Boolean).join(", ") === label).length })),
        topTheme:
          unique(
            list
              .flatMap((e) => splitCsv(e.sectorThemes))
              .filter(Boolean)
          )[0] || "",
        events: list.slice(0, 3).map((e) => ({ id: e.id, title: e.title, startDate: e.startDate, city: e.city, state: e.state })),
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.weekStart.localeCompare(b.weekStart);
      });
  }, []);

  const buildCityClusters = useCallback((source: WorkspaceEvent[]) => {
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const endUtc = todayUtc + 120 * 86400000;

    const byCity = new Map<string, WorkspaceEvent[]>();
    source.forEach((e) => {
      const t = new Date(`${e.startDate}T00:00:00Z`).getTime();
      if (Number.isNaN(t) || t < todayUtc || t > endUtc) return;
      const cityLabel = [e.city, e.state].filter(Boolean).join(", ").trim();
      if (!cityLabel) return;
      byCity.set(cityLabel, [...(byCity.get(cityLabel) || []), e]);
    });

    const clusters: ConcentrationItem[] = [];

    byCity.forEach((cityEvents, cityLabel) => {
      const sorted = [...cityEvents].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const candidates: { start: number; end: number }[] = [];

      for (let i = 0; i < sorted.length; i += 1) {
        const anchorTime = new Date(`${sorted[i].startDate}T00:00:00Z`).getTime();
        const start = anchorTime - 2 * 86400000;
        const end = anchorTime + 2 * 86400000;
        const countInWindow = sorted.filter((e) => {
          const t = new Date(`${e.startDate}T00:00:00Z`).getTime();
          return t >= start && t <= end;
        }).length;
        if (countInWindow >= 3) candidates.push({ start, end });
      }

      if (!candidates.length) return;

      candidates.sort((a, b) => a.start - b.start);
      const merged: { start: number; end: number }[] = [];
      candidates.forEach((c) => {
        const last = merged[merged.length - 1];
        if (!last || c.start > last.end) {
          merged.push({ ...c });
        } else {
          last.end = Math.max(last.end, c.end);
        }
      });

      merged.forEach((window) => {
        const members = sorted.filter((e) => {
          const t = new Date(`${e.startDate}T00:00:00Z`).getTime();
          return t >= window.start && t <= window.end;
        });
        if (members.length < 3) return;
        const organizersRanked = Array.from(
          members.reduce((m, e) => {
            const k = e.organizer || "";
            if (!k) return m;
            m.set(k, (m.get(k) || 0) + 1);
            return m;
          }, new Map<string, number>())
        ).sort((a, b) => b[1] - a[1]);
        const topTheme =
          unique(members.flatMap((e) => splitCsv(e.sectorThemes)).filter(Boolean))[0] || "";
        const weekStart = new Date(window.start).toISOString().slice(0, 10);
        const weekEnd = new Date(window.end).toISOString().slice(0, 10);

        clusters.push({
          type: "cluster",
          label: cityLabel,
          weekStart,
          weekEnd,
          count: members.length,
          cities: [{ label: cityLabel, count: members.length }],
          topTheme,
          topOrganizer: organizersRanked[0]?.[0] || "",
          events: members.slice(0, 3).map((e) => ({
            id: e.id,
            title: e.title,
            startDate: e.startDate,
            city: e.city,
            state: e.state,
          })),
        });
      });
    });

    return clusters.sort((a, b) => {
      if (a.weekStart !== b.weekStart) return a.weekStart.localeCompare(b.weekStart);
      return b.count - a.count;
    });
  }, []);

  const buildHotWeeksByMonth = useCallback((source: WorkspaceEvent[]) => {
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

    const futureEvents = source.filter((e) => {
      const t = new Date(`${e.startDate}T00:00:00Z`).getTime();
      return !Number.isNaN(t) && t >= todayUtc;
    });

    const weekRows = buildWeeks(futureEvents);
    const monthToBestWeek = new Map<string, (typeof weekRows)[number]>();

    weekRows.forEach((w) => {
      const month = w.weekStart.slice(0, 7);
      const current = monthToBestWeek.get(month);
      if (!current) {
        monthToBestWeek.set(month, w);
        return;
      }
      if (w.count > current.count) {
        monthToBestWeek.set(month, w);
        return;
      }
      if (w.count === current.count && w.weekStart < current.weekStart) {
        monthToBestWeek.set(month, w);
      }
    });

    const qualifying = Array.from(monthToBestWeek.values())
      .filter((w) => w.count >= 8)
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    return qualifying.slice(0, 3);
  }, [buildWeeks]);

  const allEventTopWeeks = useMemo(() => buildHotWeeksByMonth(events), [events, buildHotWeeksByMonth]);
  const viewTopWeeks = useMemo(() => buildHotWeeksByMonth(filteredEvents), [filteredEvents, buildHotWeeksByMonth]);
  const allEventClusters = useMemo(() => buildCityClusters(events), [events, buildCityClusters]);
  const viewClusters = useMemo(() => buildCityClusters(filteredEvents), [filteredEvents, buildCityClusters]);

  const buildConcentrationCards = useCallback((hot: Omit<ConcentrationItem, "type" | "label">[], clusters: ConcentrationItem[]) => {
    const hotCards: ConcentrationItem[] = hot.map((h) => ({
      ...h,
      type: "hotweek",
      label: "",
      activeClusters: clusters.filter(
        (c) =>
          c.weekStart <= h.weekEnd &&
          c.weekEnd >= h.weekStart
      ).length,
    }));
    const cards: ConcentrationItem[] = [...hotCards];
    if (cards.length < 3) {
      clusters.forEach((c) => {
        if (cards.length >= 3) return;
        const duplicate = cards.some(
          (x) =>
            x.type === "cluster" &&
            x.label === c.label &&
            x.weekStart === c.weekStart &&
            x.weekEnd === c.weekEnd
        );
        if (!duplicate) cards.push(c);
      });
    }
    return cards.slice(0, 3);
  }, []);

  const allConcentrationCards = useMemo(
    () => buildConcentrationCards(allEventTopWeeks, allEventClusters),
    [allEventTopWeeks, allEventClusters, buildConcentrationCards]
  );
  const viewConcentrationCards = useMemo(
    () => buildConcentrationCards(viewTopWeeks, viewClusters),
    [viewTopWeeks, viewClusters, buildConcentrationCards]
  );

  const hotWeekKeys = useMemo(
    () => new Set(allEventTopWeeks.map((w) => w.weekStart)),
    [allEventTopWeeks]
  );

  const topCity = useMemo(() => {
    const counts = new Map<string, number>();
    filteredEvents.forEach((e) => {
      const key = [e.city, e.state].filter(Boolean).join(", ");
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  }, [filteredEvents]);

  const analysisCards = useMemo(() => {
    const source = filteredEvents;

    if (!source.length) {
      return [
        {
          t: "No matches in this exact view",
          b: "This filter combination currently has no conferences. Adjust one or two filters to surface activity.",
          action: { type: "week", from: "", to: "" } as AnalysisAction,
        },
      ];
    }

    const countBy = (items: string[]) => {
      const map = new Map<string, number>();
      items.filter(Boolean).forEach((k) => map.set(k, (map.get(k) || 0) + 1));
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    };

    const themesRanked = countBy(source.flatMap((e) => splitCsv(e.sectorThemes)));
    const categoriesRanked = countBy(source.map((e) => e.primaryCategory));
    const focusRanked = countBy(source.flatMap((e) => splitCsv(e.marketFocus)));
    const organizerRanked = countBy(source.map((e) => e.organizer));
    const cityRanked = countBy(source.map((e) => [e.city, e.state].filter(Boolean).join(", ")));
    const regionRanked = countBy(source.map((e) => e.region));
    const stateRanked = countBy(source.map((e) => e.state));
    const issuerRanked = countBy(source.map((e) => e.issuerParticipation));
    const countryRanked = countBy(source.map((e) => e.country));

    const themeTop = themesRanked[0];
    const themeSecond = themesRanked[1];
    const categoryTop = categoriesRanked[0];
    const categorySecond = categoriesRanked[1];
    const focusTop = focusRanked[0];
    const focusSecond = focusRanked[1];
    const organizerTop = organizerRanked[0];
    const organizerSecond = organizerRanked[1];
    const cityTop = cityRanked[0];
    const citySecond = cityRanked[1];
    const regionTop = regionRanked[0];
    const stateTop = stateRanked[0];
    const issuerTop = issuerRanked[0];
    const countryTop = countryRanked[0];
    const bestWeek = viewTopWeeks[0];
    const secondWeek = viewTopWeeks[1];
    const upcoming30 = source.filter((e) => {
      const t = new Date(`${e.startDate}T00:00:00Z`).getTime();
      return t <= Date.now() + 30 * 86400000;
    }).length;
    const multiDayCount = source.filter((e) => e.endDate && e.endDate > e.startDate).length;
    const venueKnownCount = source.filter((e) => e.venue && e.venue.trim()).length;
    const uniqueOrganizers = organizerRanked.length;
    const uniqueThemes = themesRanked.length;
    const uniqueCities = cityRanked.length;
    const uniqueCountries = countryRanked.length;

    const candidatePool: { t: string; b: string; action: AnalysisAction; score: number; key: string; group: string }[] = [];

    const pushCandidate = (
      key: string,
      t: string,
      b: string,
      action: AnalysisAction,
      score: number,
      group: string,
    ) => {
      if (!t || !b || score <= 0) return;
      candidatePool.push({ key, t, b, action, score, group });
    };

    const monthKey = (date: string) => date.slice(0, 7);
    const latestMonth = [...source]
      .map((e) => monthKey(e.startDate))
      .sort()
      .at(-1);
    const previousMonth = latestMonth
      ? (() => {
          const d = new Date(`${latestMonth}-01T00:00:00Z`);
          d.setUTCMonth(d.getUTCMonth() - 1);
          return d.toISOString().slice(0, 7);
        })()
      : "";
    const countByMonth = (predicate: (e: WorkspaceEvent) => boolean) => {
      if (!latestMonth || !previousMonth) return { current: 0, previous: 0, pct: 0 };
      const current = source.filter((e) => monthKey(e.startDate) === latestMonth && predicate(e)).length;
      const previous = source.filter((e) => monthKey(e.startDate) === previousMonth && predicate(e)).length;
      const pct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
      return { current, previous, pct };
    };

    if (themeTop) {
      pushCandidate(
        "theme_top",
        `${themeTop[0]} leads this view`,
        `${themeTop[0]} is driving this filtered set with ${themeTop[1]} scheduled conferences.`,
        { type: "sectorTheme", value: themeTop[0] },
        themeTop[1],
        "theme",
      );
    }
    if (themeSecond && themeTop && themeTop[1] > themeSecond[1]) {
      pushCandidate(
        "theme_gap",
        `${themeTop[0]} outpaces ${themeSecond[0]}`,
        `${themeTop[0]} appears ${themeTop[1] - themeSecond[1]} more times than ${themeSecond[0]} in this view.`,
        { type: "sectorTheme", value: themeTop[0] },
        themeTop[1] - themeSecond[1],
        "theme",
      );
    }
    if (themeTop) {
      const trend = countByMonth((e) => splitCsv(e.sectorThemes).includes(themeTop[0]));
      if (trend.current > 0 || trend.previous > 0) {
        const dir = trend.pct >= 0 ? "up" : "down";
        pushCandidate(
          "theme_mom",
          `${themeTop[0]} trend is ${dir} month-over-month`,
          `${themeTop[0]} activity is ${Math.abs(trend.pct)}% ${dir} versus last month in this view.`,
          { type: "sectorTheme", value: themeTop[0] },
          Math.abs(trend.pct) + trend.current,
          "theme-trend",
        );
      }
    }
    if (categoryTop) {
      pushCandidate(
        "category_top",
        `${categoryTop[0]} is driving volume`,
        `${categoryTop[0]} remains the strongest conference type in this exact filter set.`,
        { type: "conferenceType", value: categoryTop[0] },
        categoryTop[1],
        "category",
      );
    }
    if (categoryTop && categorySecond && categorySecond[1] > 0) {
      pushCandidate(
        "category_pair",
        `${categoryTop[0]} and ${categorySecond[0]} are co-leading`,
        `These two conference types combine for ${categoryTop[1] + categorySecond[1]} events in this view.`,
        { type: "conferenceType", value: categoryTop[0] },
        categoryTop[1] + categorySecond[1],
        "category",
      );
    }
    if (focusTop) {
      pushCandidate(
        "focus_top",
        `${focusTop[0]} dominates market focus`,
        `${focusTop[0]} appears most often and is shaping this market slice.`,
        { type: "marketFocus", value: focusTop[0] },
        focusTop[1],
        "focus",
      );
    }
    if (focusTop) {
      const trend = countByMonth((e) => splitCsv(e.marketFocus).includes(focusTop[0]));
      if (trend.current > 0 || trend.previous > 0) {
        const dir = trend.pct >= 0 ? "up" : "down";
        pushCandidate(
          "focus_mom",
          `${focusTop[0]} is ${dir} month-over-month`,
          `${focusTop[0]} mentions are ${Math.abs(trend.pct)}% ${dir} versus last month in this filtered view.`,
          { type: "marketFocus", value: focusTop[0] },
          Math.abs(trend.pct) + trend.current,
          "focus-trend",
        );
      }
    }
    if (focusTop && focusSecond) {
      pushCandidate(
        "focus_stack",
        `${focusTop[0]} + ${focusSecond[0]} set the tone`,
        `The top two focus areas account for ${focusTop[1] + focusSecond[1]} conferences in this view.`,
        { type: "marketFocus", value: focusTop[0] },
        focusTop[1] + focusSecond[1],
        "focus",
      );
    }
    if (cityTop) {
      pushCandidate(
        "city_top",
        `${cityTop[0]} is the activity anchor`,
        `${cityTop[0]} currently leads this view by scheduled conference count.`,
        { type: "city", value: cityTop[0] },
        cityTop[1],
        "location",
      );
    }
    if (cityTop && citySecond) {
      pushCandidate(
        "city_comp",
        `${cityTop[0]} stays ahead of ${citySecond[0]}`,
        `${cityTop[0]} leads by ${cityTop[1] - citySecond[1]} events in this filtered market view.`,
        { type: "city", value: cityTop[0] },
        cityTop[1] - citySecond[1] + 1,
        "location",
      );
    }
    if (regionTop) {
      pushCandidate(
        "region_top",
        `${regionTop[0]} region has the strongest concentration`,
        `${regionTop[1]} events in this view are clustered in ${regionTop[0]}.`,
        { type: "city", value: cityTop?.[0] || "" },
        regionTop[1],
        "location",
      );
    }
    if (stateTop) {
      pushCandidate(
        "state_top",
        `${stateTop[0]} is the top state signal`,
        `${stateTop[1]} conferences in this view are scheduled in ${stateTop[0]}.`,
        { type: "city", value: cityTop?.[0] || "" },
        stateTop[1],
        "location",
      );
    }
    if (issuerTop) {
      pushCandidate(
        "issuer_top",
        `${issuerTop[0]} is the leading issuer profile`,
        `${issuerTop[1]} events in this exact view align with ${issuerTop[0]}.`,
        { type: "conferenceType", value: categoryTop?.[0] || "" },
        issuerTop[1],
        "issuer",
      );
    }
    if (organizerTop) {
      pushCandidate(
        "org_top",
        `${organizerTop[0]} appears repeatedly`,
        `${organizerTop[0]} is present across ${organizerTop[1]} conferences in your current view.`,
        { type: "organizer", value: organizerTop[0] },
        organizerTop[1],
        "organizer",
      );
    }
    if (organizerTop && organizerSecond) {
      pushCandidate(
        "org_pair",
        `Top organizers are clustering in this slice`,
        `${organizerTop[0]} and ${organizerSecond[0]} combine for ${organizerTop[1] + organizerSecond[1]} events.`,
        { type: "organizer", value: organizerTop[0] },
        organizerTop[1] + organizerSecond[1],
        "organizer",
      );
    }
    if (bestWeek) {
      pushCandidate(
        "week_top",
        `Week of ${bestWeek.weekStart} is most concentrated`,
        `${bestWeek.count} events overlap during this window, creating the highest planning density.`,
        { type: "week", from: bestWeek.weekStart, to: bestWeek.weekEnd },
        bestWeek.count,
        "timing",
      );
    }
    if (bestWeek && secondWeek) {
      pushCandidate(
        "week_pair",
        "Two concentration windows are emerging",
        `${bestWeek.count + secondWeek.count} events fall across the two highest-density weeks.`,
        { type: "week", from: bestWeek.weekStart, to: bestWeek.weekEnd },
        bestWeek.count + secondWeek.count,
        "timing",
      );
    }
    if (upcoming30 > 0) {
      pushCandidate(
        "next30",
        `${upcoming30} events land in the next 30 days`,
        "Near-term activity remains elevated for conference planning and scheduling.",
        { type: "week", from: bestWeek?.weekStart || "", to: bestWeek?.weekEnd || "" },
        upcoming30,
        "timing",
      );
    }
    if (multiDayCount > 0) {
      pushCandidate(
        "multiday",
        `${multiDayCount} multi-day conferences are in view`,
        "Extended event windows are meaningful in this filter set, increasing overlap risk.",
        { type: "week", from: bestWeek?.weekStart || "", to: bestWeek?.weekEnd || "" },
        multiDayCount,
        "timing",
      );
    }
    if (venueKnownCount > 0) {
      pushCandidate(
        "venue",
        `${venueKnownCount} conferences have confirmed venues`,
        "Venue-level details are available for most events in this slice, supporting planning accuracy.",
        { type: "city", value: cityTop?.[0] || "" },
        venueKnownCount,
        "logistics",
      );
    }
    if (uniqueOrganizers > 0) {
      pushCandidate(
        "org_diversity",
        `${uniqueOrganizers} organizers are active in this view`,
        "Organizer diversity is a key signal in this filtered market selection.",
        { type: "organizer", value: organizerTop?.[0] || "" },
        uniqueOrganizers,
        "breadth",
      );
    }
    if (uniqueThemes > 0) {
      pushCandidate(
        "theme_diversity",
        `${uniqueThemes} themes are represented`,
        "Thematic breadth in this slice supports multi-angle conference coverage.",
        { type: "sectorTheme", value: themeTop?.[0] || "" },
        uniqueThemes,
        "breadth",
      );
    }
    if (uniqueCities > 0) {
      pushCandidate(
        "city_diversity",
        `${uniqueCities} cities are represented`,
        "Geographic spread is a defining characteristic of this filtered set.",
        { type: "city", value: cityTop?.[0] || "" },
        uniqueCities,
        "breadth",
      );
    }
    if (countryTop && uniqueCountries > 1) {
      pushCandidate(
        "country_mix",
        `${countryTop[0]} leads cross-border activity`,
        `${countryTop[1]} events are in ${countryTop[0]}, with ${uniqueCountries} countries represented overall.`,
        { type: "city", value: cityTop?.[0] || "" },
        countryTop[1],
        "location",
      );
    }

    const uniqueTitles = new Set<string>();
    const deduped = candidatePool.filter((c) => {
      if (uniqueTitles.has(c.t)) return false;
      uniqueTitles.add(c.t);
      return true;
    });
    deduped.sort((a, b) => b.score - a.score);
    const byGroup = new Map<string, { t: string; b: string; action: AnalysisAction; score: number; key: string; group: string }[]>();
    deduped.forEach((c) => {
      byGroup.set(c.group, [...(byGroup.get(c.group) || []), c]);
    });

    const signature = source.slice(0, 60).map((e) => `${e.id}:${e.startDate}`).join("|");
    let hash = 0;
    for (let i = 0; i < signature.length; i += 1) {
      hash = (hash * 31 + signature.charCodeAt(i)) >>> 0;
    }
    const groups = Array.from(byGroup.keys()).sort();
    const rotateOffset = groups.length ? hash % groups.length : 0;
    const rotatedGroups = [...groups.slice(rotateOffset), ...groups.slice(0, rotateOffset)];

    const picked: { t: string; b: string; action: AnalysisAction; score: number; key: string; group: string }[] = [];
    rotatedGroups.forEach((g) => {
      const first = byGroup.get(g)?.[0];
      if (first) picked.push(first);
    });

    if (picked.length < 5) {
      deduped.forEach((c) => {
        if (picked.length >= 5) return;
        if (!picked.some((p) => p.key === c.key)) picked.push(c);
      });
    }

    const locationLimit = 1;
    const locationPicked = picked.filter((p) => p.group === "location");
    if (locationPicked.length > locationLimit) {
      const keep = locationPicked
        .sort((a, b) => b.score - a.score)
        .slice(0, locationLimit)
        .map((l) => l.key);
      const filtered = picked.filter((p) => p.group !== "location" || keep.includes(p.key));
      if (filtered.length < 5) {
        deduped.forEach((c) => {
          if (filtered.length >= 5) return;
          if (c.group === "location" && keep.includes(c.key)) return;
          if (!filtered.some((p) => p.key === c.key)) filtered.push(c);
        });
      }
      return filtered.slice(0, 5).map(({ t, b, action }) => ({ t, b, action }));
    }

    return picked.slice(0, 5).map(({ t, b, action }) => ({ t, b, action }));
  }, [filteredEvents, viewTopWeeks]);

  const inViewStats = useMemo(() => {
    const organizersCount = new Set(filteredEvents.map((e) => e.organizer).filter(Boolean)).size;
    const statesCount = new Set(filteredEvents.map((e) => e.state).filter(Boolean)).size;
    const citiesCount = new Set(filteredEvents.map((e) => [e.city, e.state].filter(Boolean).join(", ")).filter(Boolean)).size;
    const themesCount = new Set(filteredEvents.flatMap((e) => splitCsv(e.sectorThemes))).size;
    const focusCount = new Set(filteredEvents.flatMap((e) => splitCsv(e.marketFocus))).size;
    return {
      events: filteredEvents.length,
      organizers: organizersCount,
      states: statesCount,
      cities: citiesCount,
      themes: themesCount,
      focus: focusCount,
    };
  }, [filteredEvents]);

  const applyHeroQuickView = (key: string) => {
    const applyPreset = (next: Partial<FiltersState>) => {
      setFilters({
        ...DEFAULT_FILTERS,
        ...next,
      });
      setFromDate("");
      setToDate("");
      setActiveSavedListId(null);
      recordActivity("feed", `Quick feed: ${key.replace(/-/g, " ")}`);
      setActiveQuickView(key);
      scrollToResultsAnchor();
    };

    if (key === "most-active-cities") {
      applyPreset({ cities: topCity ? [topCity] : [] });
      return;
    }
    if (key === "institutional-investor-events") {
      applyPreset({ conferenceType: conferenceTypes.filter((c) => c.toLowerCase().includes("investor")).slice(0, 1) });
      return;
    }
    if (key === "healthcare-conferences") {
      applyPreset({ sectorThemes: themes.filter((t) => t.toLowerCase().includes("health")).slice(0, 1) });
      return;
    }
    if (key === "private-markets") {
      applyPreset({ marketFocus: marketFocusOptions.filter((t) => t.toLowerCase().includes("private")).slice(0, 1) });
      return;
    }
    if (key === "tech-ai") {
      applyPreset({ sectorThemes: themes.filter((t) => t.toLowerCase().includes("ai") || t.toLowerCase().includes("tech")).slice(0, 1) });
      return;
    }
    if (key === "canada-events") {
      applyPreset({ country: "Canada" });
      return;
    }
    if (key === "upcoming-30-days") {
      applyPreset({ dateRange: "next30" });
      return;
    }
    if (key === "upcoming-60-days") {
      applyPreset({ dateRange: "next60" });
      return;
    }
    if (key === "u-s-markets") {
      applyPreset({ country: "United States", region: "" });
      return;
    }
    if (key === "west-coast") {
      const westCity = cities.find((c) => /san francisco|los angeles|seattle|san diego|vancouver/i.test(c));
      if (westCity) {
        applyPreset({ cities: [westCity] });
      } else {
        const westRegion = regions.find((r) => /west/i.test(r));
        if (westRegion) {
          applyPreset({ region: westRegion });
        } else {
          applyPreset({});
        }
      }
      return;
    }
    if (key === "investor-conferences") {
      applyPreset({ conferenceType: conferenceTypes.filter((c) => c.toLowerCase().includes("investor")).slice(0, 1) });
    }
  };

  const applyAnalysisView = (action: AnalysisAction) => {
    if (action.type !== "week" && !action.value) return;
    if (action.type === "week" && !action.from && !action.to) {
      return;
    }
    if (action.type === "sectorTheme") {
      setFilters({ ...DEFAULT_FILTERS, sectorThemes: [action.value] });
      setFromDate("");
      setToDate("");
      scrollToResultsAnchor();
      return;
    }
    if (action.type === "conferenceType") {
      setFilters({ ...DEFAULT_FILTERS, conferenceType: [action.value] });
      setFromDate("");
      setToDate("");
      scrollToResultsAnchor();
      return;
    }
    if (action.type === "marketFocus") {
      setFilters({ ...DEFAULT_FILTERS, marketFocus: [action.value] });
      setFromDate("");
      setToDate("");
      scrollToResultsAnchor();
      return;
    }
    if (action.type === "city") {
      setFilters({ ...DEFAULT_FILTERS, cities: [action.value] });
      setFromDate("");
      setToDate("");
      scrollToResultsAnchor();
      return;
    }
    if (action.type === "organizer") {
      setFilters({ ...DEFAULT_FILTERS, organizer: [action.value] });
      setFromDate("");
      setToDate("");
      scrollToResultsAnchor();
      return;
    }
    setFilters({ ...DEFAULT_FILTERS });
    setFromDate(action.from);
    setToDate(action.to);
    scrollToResultsAnchor();
  };

  const toggleSelect = (id: string) =>
    setSelectedEvents((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 20) {
        window.alert("You can select up to 20 events at one time.");
        return prev;
      }
      return [...prev, id];
    });

  const getSavableEventIds = () => {
    return selectedEvents;
  };

  const addSelectedToNewList = () => {
    const eventIds = getSavableEventIds();
    if (!eventIds.length) {
      window.alert("Select at least one conference to save.");
      return;
    }
    const defaultName = `Saved Conference List ${savedLists.length + 1}`;
    const name = window.prompt("List name", defaultName);
    if (!name) return;
    setSavedLists((prev) => [{ id: `${Date.now()}`, name, eventIds, createdAt: new Date().toISOString() }, ...prev]);
    setActiveSavedListId(null);
    recordActivity("view", `Saved list: ${name}`, `${eventIds.length} events`);
    scrollToResultsAnchor();
  };

  const addSelectedToExistingList = (listId: string) => {
    const eventIds = getSavableEventIds();
    if (!eventIds.length) {
      window.alert("Select at least one conference to save.");
      return;
    }
    setSavedLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, eventIds: unique([...list.eventIds, ...eventIds]) }
          : list
      )
    );
    setActiveSavedListId(listId);
    const target = savedLists.find((l) => l.id === listId);
    recordActivity("view", `Updated list: ${target?.name || "Saved list"}`, `${eventIds.length} events added`);
    scrollToResultsAnchor();
  };

  const loadSavedList = (listId: string) => {
    const list = savedLists.find((l) => l.id === listId);
    if (!list) return;
    setFilters(DEFAULT_FILTERS);
    setFromDate("");
    setToDate("");
    setActiveQuickView("");
    setActiveSavedListId(listId);
    setSelectedEvents([]);
    recordActivity("view", `Loaded conference list: ${list.name}`, `${list.eventIds.length} events`);
    scrollToResultsAnchor();
  };

  const deleteSavedList = (listId: string) => {
    const target = savedLists.find((l) => l.id === listId);
    if (!target) return;
    const confirmed = window.confirm(`Delete saved conference list "${target.name}"?`);
    if (!confirmed) return;
    setSavedLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeSavedListId === listId) {
      setActiveSavedListId(null);
    }
    recordActivity("view", `Deleted conference list: ${target.name}`);
  };

  const saveCurrentView = () => {
    const name = window.prompt("View name", `Saved View ${savedViews.length + 1}`);
    if (!name) return;
    setSavedViews((prev) => [{ id: `${Date.now()}`, name, filters, createdAt: new Date().toISOString(), eventCount: filteredEvents.length }, ...prev]);
    recordActivity("view", `Saved view: ${name}`, `${filteredEvents.length} events`);
  };

  const loadSavedView = (viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (!view) return;
    setActiveSavedListId(null);
    setFilters({ ...DEFAULT_FILTERS, ...view.filters });
    setFromDate("");
    setToDate("");
    setSelectedEvents([]);
    setActiveQuickView("");
    recordActivity("view", `Loaded view: ${view.name}`, `${view.eventCount ?? "Saved"} events`);
    scrollToResultsAnchor();
  };

  const deleteSavedView = (viewId: string) => {
    const target = savedViews.find((v) => v.id === viewId);
    if (!target) return;
    const confirmed = window.confirm(`Delete saved view "${target.name}"?`);
    if (!confirmed) return;
    setSavedViews((prev) => prev.filter((v) => v.id !== viewId));
    recordActivity("view", `Deleted view: ${target.name}`);
  };

  const openCalendarSync = (platform: "Google Calendar" | "Apple Calendar" | "Outlook") => {
    recordActivity("feed", `Sync started: ${platform}`);
    const icsUrl = `${window.location.origin}/api/ics`;
    const webcalUrl = icsUrl.replace(/^https?:\/\//i, "webcal://");
    const feedName = encodeURIComponent("Capital Conference Calendar - Current View");

    if (platform === "Google Calendar") {
      const googleUrl = `https://calendar.google.com/calendar/u/0/r/settings/addbyurl?cid=${encodeURIComponent(webcalUrl)}`;
      window.open(googleUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "Outlook") {
      const outlookUrl = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(icsUrl)}&name=${feedName}`;
      window.open(outlookUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Apple Calendar / generic ICS clients
    window.open(webcalUrl, "_blank", "noopener,noreferrer");
  };

  const createSelectedIcs = () => {
    if (!selectedEvents.length) return;
    const first = filteredEvents.find((e) => e.id === selectedEvents[0]);
    if (!first) return;
    const p = new URLSearchParams({
      title: first.title,
      start: first.startDate,
      end: first.endDate || first.startDate,
      location: [first.venue, first.city, first.state, first.country].filter(Boolean).join(", "),
      description: buildDescription(first),
      url: first.website || "",
    });
    window.open(`/api/ics/ics-single?${p.toString()}`, "_blank");
  };

  const shareSelected = () => {
    const selected = filteredEvents.filter((e) => selectedSet.has(e.id)).slice(0, 20);
    const lines = selected
      .map((e) => {
        const location = [e.city, e.state].filter(Boolean).join(", ") || "Location TBD";
        const eventUrl = buildEventLink(e);
        return [
          `• ${e.title}`,
          `  Date: ${e.startDate}${e.endDate && e.endDate !== e.startDate ? ` to ${e.endDate}` : ""}`,
          `  Location: ${location}`,
          `  Event URL: ${eventUrl || "Not available"}`,
        ].join("\n");
      })
      .join("\n\n");

    const intro = [
      "This list is provided by Capital Conference Calendar (https://capitalconferencecalendar.com).",
      "",
      "Track conference density, active cities, event clusters, and participation trends across the market calendar and convert filtered conference views into continuously updating calendar subscriptions.",
      "",
      "Selected Conferences:",
      "",
    ].join("\n");

    const body = encodeURIComponent(`${intro}${lines}`);
    window.location.href = `mailto:?subject=${encodeURIComponent("Selected conferences")}&body=${body}`;
  };

  const clearWorkspaceView = () => {
    setFilters(DEFAULT_FILTERS);
    setFromDate("");
    setToDate("");
    setSelectedEvents([]);
    setActiveQuickView("");
    setActiveSavedListId(null);
    if (typeof window !== "undefined") {
      const next = new URL(window.location.href);
      if (next.searchParams.has("q")) {
        next.searchParams.delete("q");
        window.location.assign(`${next.pathname}${next.search}${next.hash}`);
        return;
      }
    }
    scrollToResultsAnchor();
  };

  const handleSubmitConferenceUrl = () => {
    const normalized = normalizeExternalUrl(submitForm.url);
    if (!normalized) {
      setSubmitFormMessage({ type: "error", text: "Please enter a valid conference URL." });
      return;
    }
    setSubmitFormMessage({ type: "success", text: "Thank you. Your conference URL has been submitted for review." });
    setSubmitForm({
      url: "",
      email: "",
      conferenceName: "",
      organizer: "",
      startDate: "",
      endDate: "",
      location: "",
      notes: "",
    });
  };

  const applyConcentrationItem = (item: ConcentrationItem) => {
    if (!item) return;
    if (item.type === "cluster") {
      setFilters({
        ...DEFAULT_FILTERS,
        dateRange: "all",
        cities: item.label ? [item.label] : [],
      });
      setFromDate(item.weekStart);
      setToDate(item.weekEnd);
      setSelectedEvents([]);
      setActiveQuickView("");
      scrollToResultsAnchor();
      return;
    }
    setFilters({
      ...DEFAULT_FILTERS,
      dateRange: "all",
    });
    setFromDate(item.weekStart);
    setToDate(item.weekEnd);
    setSelectedEvents([]);
    setActiveQuickView("");
    scrollToResultsAnchor();
  };

  return (
    <div className="workspace-shell" style={{ display: "grid", gridTemplateColumns: "minmax(0, 280px) minmax(0, 1fr) minmax(0, 280px)", gridTemplateRows: "minmax(0, 1fr)", gap: "16px", alignItems: "stretch", width: "100%", height: PANEL_HEIGHT, maxWidth: "100%", minWidth: 0, minHeight: 0, overflow: "hidden" }}>
      <aside
        className="ccc-scroll-rail ccc-scroll-rail-left"
        style={{ position: "relative", alignSelf: "stretch", display: "grid", gap: "14px", minWidth: 0, minHeight: 0, width: "100%", maxWidth: "280px", height: PANEL_HEIGHT, maxHeight: PANEL_HEIGHT, overflow: "hidden", paddingRight: "2px" }}
      >
        <div style={{ height: "100%", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", paddingRight: "4px", paddingBottom: "8px" }}>
        <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden", border: "1px solid rgba(96,165,250,0.12)", borderRadius: "14px", background: "linear-gradient(180deg, rgba(7,27,48,0.84) 0%, rgba(6,24,43,0.8) 100%)", padding: "14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 12px 24px rgba(2,10,24,0.28)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontWeight: 800, color: "#dbeafe" }}>Refine Your Market View</div>
            <button onClick={clearWorkspaceView} style={{ background: "transparent", border: 0, color: "#93c5fd", cursor: "pointer", fontSize: "12px" }}>Clear all</button>
          </div>

          <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Date Range</label>
            <select value={filters.dateRange} onChange={(e) => setFilters((p) => ({ ...p, dateRange: e.target.value as FiltersState["dateRange"] }))} style={controlStyle}>
              <option value="next30">Next 30 Days</option>
              <option value="next60">Next 60 Days</option>
              <option value="next90">Next 90 Days</option>
              <option value="all">All</option>
            </select>

            <div className="ccc-filter-date-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "8px", width: "100%", minWidth: 0, maxWidth: "100%" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#93c5fd", display: "block", marginBottom: "4px" }}>From</label>
                <input type="date" value={fromDate} onChange={(e)=>{setFromDate(e.target.value); if (!toDate || e.target.value > toDate) setToDate(e.target.value);}} style={{ ...controlStyle, minWidth: 0, maxWidth: "100%", padding: "0 8px" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#93c5fd", display: "block", marginBottom: "4px" }}>To</label>
                <input type="date" value={toDate} min={fromDate || undefined} onChange={(e)=>setToDate(e.target.value)} style={{ ...controlStyle, minWidth: 0, maxWidth: "100%", padding: "0 8px" }} />
              </div>
            </div>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Country</label>
            <select value={filters.country} onChange={(e) => setFilters((p) => ({ ...p, country: e.target.value }))} style={controlStyle}>
              <option value="">All Country</option>
              {countries.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Region</label>
            <select value={filters.region} onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value }))} style={controlStyle}>
              <option value="">All Region</option>
              {regions.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>State</label>
            <select value={filters.state} onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))} style={controlStyle}>
              <option value="">All State</option>
              {states.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Cities</label>
            <select
              value={filters.cities[0] || ""}
              onChange={(e) => setFilters((p) => ({ ...p, cities: e.target.value ? [e.target.value] : [] }))}
              style={controlStyle}
            >
              <option value="">All Cities</option>
              {cities.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Sector / Themes</label>
            <select value={filters.sectorThemes[0] || ""} onChange={(e) => setFilters((p) => ({ ...p, sectorThemes: e.target.value ? [e.target.value] : [] }))} style={controlStyle}>
              <option value="">All Sectors / Themes</option>
              {themes.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Conference Type</label>
            <select value={filters.conferenceType[0] || ""} onChange={(e) => setFilters((p) => ({ ...p, conferenceType: e.target.value ? [e.target.value] : [] }))} style={controlStyle}>
              <option value="">All Types</option>
              {conferenceTypes.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Issuer Participation</label>
            <select value={filters.issuerParticipation[0] || ""} onChange={(e) => setFilters((p) => ({ ...p, issuerParticipation: e.target.value ? [e.target.value] : [] }))} style={controlStyle}>
              <option value="">All Issuer Participation</option>
              {issuers.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Organizer</label>
            <select value={filters.organizer[0] || ""} onChange={(e) => setFilters((p) => ({ ...p, organizer: e.target.value ? [e.target.value] : [] }))} style={controlStyle}>
              <option value="">All Organizers</option>
              {organizers.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>

            <label style={{ fontSize: "11px", color: "#93c5fd" }}>Market Focus</label>
            <select value={filters.marketFocus[0] || ""} onChange={(e) => setFilters((p) => ({ ...p, marketFocus: e.target.value ? [e.target.value] : [] }))} style={controlStyle}>
              <option value="">All Market Focus</option>
              {marketFocusOptions.map((o, index) => <option key={`${o}-${index}`} value={o}>{o}</option>)}
            </select>
          </div>

          <button onClick={saveCurrentView} style={{ marginTop: "10px", width: "100%", height: "38px", borderRadius: "9px", border: "1px solid #2563eb", background: "#2563eb", color: "white", fontWeight: 700 }}>Save Current View</button>
          <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
            {[
              { label: "About", href: "/?mode=about" },
              { label: "Contact", href: "/?mode=contact" },
              { label: "Legal", href: "/legal" },
              { label: "Subscribe", href: "/?mode=subscribe" },
              { label: "Submit", href: "/?mode=submit" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  height: "34px",
                  borderRadius: "9px",
                  border: "1px solid rgba(147,197,253,0.28)",
                  background: "rgba(12,40,72,0.8)",
                  color: "#e2ecff",
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 12px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div style={{ marginTop: "8px", border: "1px solid rgba(34,197,94,0.24)", borderRadius: "8px", background: "rgba(22,101,52,0.12)", padding: "8px 10px", color: "#86efac", fontSize: "12px", fontWeight: 700 }}>
            Realtime Updates
          </div>
        </div>
        </div>
      </aside>

      <section ref={centerWorkspaceRef} className="center-workspace ccc-scroll-center" style={{ display: "grid", gap: "18px", minWidth: 0, minHeight: 0, maxWidth: "100%", width: "100%", height: PANEL_HEIGHT, maxHeight: PANEL_HEIGHT, overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", position: "relative", paddingRight: "2px", paddingBottom: "8px" }}>
        <div style={{ position: "relative", zIndex: 1, transition: "opacity 180ms ease-out" }}>
        {dashboardMode === "market" ? (
        <div style={{ display: "grid", gap: "14px", paddingBottom: "10px" }}>
        <div className="ccc-hero-panel" style={{ border: "1px solid rgba(96,165,250,0.24)", borderRadius: "18px", padding: "22px 24px 28px", minHeight: "332px", background: "radial-gradient(140% 130% at 86% -8%, rgba(44,112,248,0.28) 0%, rgba(14,34,62,0.16) 42%, rgba(8,20,38,0) 70%), radial-gradient(95% 88% at 30% 12%, rgba(66,120,194,0.14) 0%, rgba(8,20,38,0.03) 58%, rgba(8,20,38,0) 78%), linear-gradient(180deg, rgba(7,22,42,0.985) 0%, rgba(4,14,28,0.985) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -26px 76px rgba(1,9,20,0.5), 0 16px 34px rgba(1,8,18,0.5)" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "#93c5fd", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span className="ccc-mode-beacon" />
            Live Market Intelligence
          </div>
          <div style={{ marginTop: "4px", fontSize: "38px", fontWeight: 850, color: "#f8fbff", lineHeight: 1.04 }}>US Capital Markets Conference Activity</div>
          <div style={{ marginTop: "6px", color: "#c7dcf6", maxWidth: "840px", lineHeight: 1.42, fontSize: "15px" }}>Real-time intelligence on investor conferences, issuer access, and industry gatherings.</div>
          <div className="hero-stats-compact" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", marginTop: "10px", minWidth: 0, maxWidth: "100%" }}>
            {[
              { label: "Total Conferences", value: events.length, sub: "↑ 12% vs prior 30 days", icon: "total" as const },
              { label: "Active Cities", value: unique(events.map((e) => [e.city, e.state].filter(Boolean).join(", "))).length, sub: "↑ 5 new", icon: "cities" as const },
              { label: "Events Next 30 Days", value: events.filter((e) => new Date(`${e.startDate}T00:00:00Z`) <= new Date(Date.now() + 30 * 86400000)).length, sub: "↑ 18% vs prior 30 days", icon: "next30" as const },
              { label: "High-Intensity Weeks", value: 2, sub: "May 11–17, May 25–31", icon: "hot" as const },
            ].map((item) => (
              <div className="stat-card" key={item.label} style={{ border: "1px solid rgba(147,197,253,0.14)", borderRadius: "12px", padding: "10px 11px", background: "linear-gradient(180deg, rgba(7,24,44,0.9) 0%, rgba(6,20,38,0.92) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: "10px" }}>
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "8px",
                      background: "rgba(76,29,149,0.46)",
                      border: "1px solid rgba(167,139,250,0.55)",
                      boxShadow: "0 0 10px rgba(109,40,217,0.35)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <StatGlyph kind={item.icon} />
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
                      <span style={{ fontSize: "24px", color: "#f8fbff", fontWeight: 850, lineHeight: 1 }}>{item.value}</span>
                      <span style={{ fontSize: "12px", color: "#d9e8fb", fontWeight: 700 }}>{item.label}</span>
                    </div>
                    <div style={{ marginTop: "3px", fontSize: "11px", color: item.sub.startsWith("↑") ? "#4ade80" : "#9fc0df", fontWeight: item.sub.startsWith("↑") ? 700 : 600, lineHeight: 1.25 }}>{item.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "9px" }}>
            <div style={{ color: "#e2ecff", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Quick Views</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { key: "most-active-cities", label: "Most Active Cities", accent: "#38bdf8", icon: "city" as const },
                { key: "institutional-investor-events", label: "Institutional Investor Events", accent: "#8b5cf6", icon: "investor" as const },
                { key: "healthcare-conferences", label: "Healthcare Conferences", accent: "#22c55e", icon: "health" as const },
                { key: "private-markets", label: "Private Markets", accent: "#f59e0b", icon: "private" as const },
                { key: "tech-ai", label: "Tech & AI", accent: "#a78bfa", icon: "tech" as const },
                { key: "investor-conferences", label: "Investor Conferences", accent: "#c084fc", icon: "investor" as const },
                { key: "upcoming-30-days", label: "Upcoming 30 Days", accent: "#60a5fa", icon: "next30" as const },
                { key: "upcoming-60-days", label: "Upcoming 60 Days", accent: "#0ea5e9", icon: "next60" as const },
                { key: "u-s-markets", label: "U.S. Markets", accent: "#93c5fd", icon: "region" as const },
                { key: "canada-events", label: "Canada Events", accent: "#2dd4bf", icon: "canada" as const },
                { key: "west-coast", label: "West Coast", accent: "#fb7185", icon: "city" as const },
              ].map((chip) => {
                const isActive = activeQuickView === chip.key;
                return (
                  <button
                    key={chip.label}
                    onClick={() => applyHeroQuickView(chip.key)}
                    style={{
                      border: isActive ? `1px solid ${chip.accent}` : "1px solid rgba(147,197,253,0.24)",
                      background: isActive ? "rgba(30,64,175,0.28)" : "rgba(12,40,72,0.66)",
                      color: "#dbeafe",
                      borderRadius: "999px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: isActive ? `0 0 14px ${chip.accent}44` : "none",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "6px",
                          background: `${chip.accent}30`,
                          border: `1px solid ${chip.accent}66`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <QuickViewGlyph kind={chip.icon} />
                      </span>
                      {chip.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid rgba(96,165,250,0.2)", borderRadius: "14px", padding: "14px", background: "radial-gradient(120% 110% at 22% 6%, rgba(58,106,188,0.14) 0%, rgba(13,32,55,0.03) 48%, rgba(13,32,55,0) 72%), linear-gradient(180deg, rgba(9,30,54,0.86) 0%, rgba(7,24,44,0.82) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
          <div style={{ marginBottom: "10px" }}>
            <div style={{ color: "#e5f0ff", fontSize: "17px", fontWeight: 800 }}>Market Concentration Windows</div>
            <div style={{ color: "#9fb8d8", fontSize: "12px", marginTop: "2px" }}>
              High-activity conference weeks and same-city event clusters based on the current dataset.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                <div style={{ color: "#e5f0ff", fontSize: "16px", fontWeight: 800 }}>Across All Events</div>
                <div style={{ color: "#9fb8d8", fontSize: "12px" }}>Top concentration windows across the full database.</div>
              </div>
              {allConcentrationCards.length ? (
                <ConcentrationStrip items={allConcentrationCards} onSelect={applyConcentrationItem} />
              ) : (
                <div style={{ color: "#9fb8d8", fontSize: "12px", padding: "8px 4px" }}>
                  <div style={{ color: "#dbeafe", fontWeight: 700, marginBottom: "4px" }}>No concentration windows detected.</div>
                  <div>Try expanding the date range or removing filters.</div>
                </div>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                <div style={{ color: "#e5f0ff", fontSize: "16px", fontWeight: 800 }}>In My View</div>
                <div style={{ color: "#9fb8d8", fontSize: "12px" }}>Concentration windows matching the current filters.</div>
              </div>
              {viewConcentrationCards.length ? (
                <ConcentrationStrip items={viewConcentrationCards} onSelect={applyConcentrationItem} />
              ) : (
                <div style={{ color: "#9fb8d8", fontSize: "12px", padding: "8px 4px" }}>
                  <div style={{ color: "#dbeafe", fontWeight: 700, marginBottom: "4px" }}>No concentration windows detected.</div>
                  <div>Try expanding the date range or removing filters.</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ color: "#9fb8d8", fontSize: "12px", marginTop: "10px" }}>
            Hot Weeks show monthly activity spikes. Clusters show 3+ events in the same city within five days.
          </div>
        </div>
        </div>
        ) : (
        <div style={{ border: "1px solid rgba(110,160,255,.16)", borderRadius: "24px", padding: "18px 22px", minHeight: "0", overflow: "visible", background: "linear-gradient(135deg, rgba(7,24,52,0.96) 0%, rgba(3,16,36,0.98) 45%, rgba(2,10,24,1) 100%)", boxShadow: "0 0 18px rgba(35,98,255,.06), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -20px 46px rgba(1,9,20,0.42)", animation: "cccDeckReveal 180ms ease-out", position: "relative" }}>
          <div style={{ position: "absolute", left: "72px", top: "24px", width: "420px", height: "150px", borderRadius: "999px", background: "radial-gradient(circle, rgba(99,164,255,0.16) 0%, rgba(99,164,255,0.05) 42%, rgba(99,164,255,0) 74%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: "24px", top: "56px", width: "200px", height: "104px", borderRadius: "999px", background: "radial-gradient(circle, rgba(78,227,193,0.13) 0%, rgba(78,227,193,0.04) 44%, rgba(78,227,193,0) 74%)", pointerEvents: "none" }} />
          <div
            style={{
              position: "absolute",
              right: "48px",
              top: "22px",
              width: "260px",
              height: "170px",
              borderRadius: "999px",
              pointerEvents: "none",
              opacity: 0.36,
              background:
                "radial-gradient(circle at 70% 30%, rgba(96,165,250,0.45) 0%, rgba(96,165,250,0.18) 28%, rgba(96,165,250,0) 62%), repeating-radial-gradient(circle at 70% 34%, rgba(140,190,255,0.22) 0 1px, transparent 1px 14px)",
              filter: "blur(.2px)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.08, backgroundImage: "radial-gradient(circle at 82% 12%, rgba(159,214,255,0.8) 0 1px, transparent 1.5px), linear-gradient(120deg, rgba(96,165,250,0.34) 1px, transparent 1px), linear-gradient(160deg, rgba(96,165,250,0.2) 1px, transparent 1px)", backgroundSize: "100% 100%, 180px 120px, 220px 140px", backgroundPosition: "0 0, 78% 0%, 82% 8%" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.035, mixBlendMode: "screen", backgroundImage: "radial-gradient(rgba(170,195,230,0.38) 0.6px, transparent 0.7px)", backgroundSize: "2px 2px" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(140% 120% at 50% 45%, rgba(0,0,0,0) 46%, rgba(0,0,0,0.24) 100%)" }} />
          <button
            type="button"
            aria-label="market activity"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 5,
              width: "34px",
              height: "34px",
              borderRadius: "11px",
              border: "1px solid rgba(140,190,255,.4)",
              background: "linear-gradient(180deg, rgba(16,45,86,.9), rgba(10,30,58,.92))",
              color: "#dbeafe",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(96,165,250,.22), inset 0 1px 0 rgba(255,255,255,.08)",
              pointerEvents: "none",
            }}
          >
            <span style={{ display: "inline-flex", gap: "2px", alignItems: "flex-end", height: "12px" }}>
              <span style={{ width: "3px", height: "6px", borderRadius: "2px", background: "#93c5fd" }} />
              <span style={{ width: "3px", height: "10px", borderRadius: "2px", background: "#93c5fd" }} />
              <span style={{ width: "3px", height: "8px", borderRadius: "2px", background: "#93c5fd" }} />
            </span>
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "62% 38%", gap: "16px", marginBottom: "8px", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#7EA8FF", display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <span className="ccc-mode-beacon" />
                {dashboardMode === "contact" ? "Contact Mode" : dashboardMode === "subscribe" ? "Subscribe Mode" : dashboardMode === "submit" ? "Submit Mode" : "About Mode"}
              </div>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: dashboardMode === "contact" ? "36px" : dashboardMode === "subscribe" ? "32px" : "44px",
                  fontWeight: 750,
                  lineHeight: 0.96,
                  letterSpacing: "-0.02em",
                  marginTop: "8px",
                  maxWidth: "680px",
                }}
              >
                {dashboardMode === "contact"
                  ? "Contact Capital Conference Calendar"
                  : dashboardMode === "subscribe"
                    ? "Subscribe to Conference Updates"
                    : dashboardMode === "submit"
                      ? "Submit a Conference"
                      : "Capital Conference Calendar"}
              </div>
              <div style={{ color: "rgba(220,230,255,.88)", marginTop: "8px", fontSize: "16px", lineHeight: 1.38, maxWidth: "700px" }}>
                {dashboardMode === "contact"
                  ? "Connect with the Capital Conference Calendar team for platform support, conference submissions, data questions, workflow assistance, and partnership inquiries."
                  : dashboardMode === "subscribe"
                    ? "Receive curated updates on upcoming capital markets conferences, investor events, active market weeks, and new conference coverage."
                    : dashboardMode === "submit"
                      ? "Share a conference URL for review, verification, and potential inclusion in Capital Conference Calendar."
                  : "A live intelligence workspace for capital markets conferences, investor events, and market activity across North America."}
              </div>
              <div style={{ color: "rgba(170,190,225,.82)", marginTop: "6px", fontSize: "14px", lineHeight: 1.42, maxWidth: "700px" }}>
                {dashboardMode === "contact"
                  ? "We respond to most inquiries within 24 hours and support conference organizers, investors, public companies, IR professionals, and capital markets service providers."
                  : dashboardMode === "subscribe"
                    ? "Use the weekly briefing to monitor events, discover market concentration windows, and stay informed as new conferences are added to the calendar."
                    : dashboardMode === "submit"
                      ? "Only the conference URL is required. Optional details help us review the event faster."
                  : "Track conference activity, market concentration, organizer density, and live calendar workflows from structured event data."}
              </div>
              <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {(dashboardMode === "contact"
                  ? ["SUPPORT ONLINE", "24 HOUR RESPONSE", "NEW YORK BASED"]
                  : dashboardMode === "subscribe"
                    ? ["WEEKLY BRIEFING", "MARKET ACTIVITY UPDATES", "FREE SUBSCRIPTION"]
                    : dashboardMode === "submit"
                      ? ["URL REQUIRED", "REVIEWED BY CCC", "COVERAGE EXPANDING"]
                    : ["LIVE INDEX", "FEED SYSTEM ONLINE", "COVERAGE EXPANDING"]).map((pill) => (
                  <span key={pill} style={{ height: "36px", padding: "0 14px", borderRadius: "999px", background: "rgba(9,25,55,.78)", border: "1px solid rgba(110,160,255,.20)", fontSize: "12px", fontWeight: 700, letterSpacing: ".06em", color: "#ffffff", display: "inline-flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#63A4FF" }} />
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(180deg, rgba(10,24,52,.96) 0%, rgba(4,14,34,.98) 100%)", border: "1px solid rgba(130,180,255,.12)", borderRadius: "24px", padding: "16px", backdropFilter: "blur(14px)", boxShadow: "0 20px 50px rgba(0,0,0,.42), 0 0 0 1px rgba(110,160,255,.12), 0 0 30px rgba(80,120,255,.06), inset 0 1px 0 rgba(255,255,255,.05)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-40px", left: "16px", right: "16px", height: "120px", opacity: 0.18, filter: "blur(60px)", background: "#3B82F6", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, letterSpacing: ".12em", color: "rgba(220,230,255,.95)", textTransform: "uppercase" }}>
                  {dashboardMode === "contact" ? "Contact Snapshot" : dashboardMode === "subscribe" ? "Briefing Snapshot" : dashboardMode === "submit" ? "Submission Snapshot" : "Collapsed Market Snapshot"}
                </div>
                <button
                  type="button"
                  onClick={() => setDashboardMode("market")}
                  style={{ height: "36px", padding: "0 14px", background: "rgba(70,110,190,.20)", border: "1px solid rgba(130,180,255,.24)", borderRadius: "12px", fontWeight: 700, fontSize: "12px", color: "#dbeafe", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {dashboardMode === "contact" ? "Support Center" : dashboardMode === "subscribe" ? "Weekly Updates" : dashboardMode === "submit" ? "Submission Queue" : "Market Intelligence"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", position: "relative", zIndex: 1 }}>
                {(dashboardMode === "contact"
                  ? [
                      { label: "Response Time", value: "24h", kind: "calendar" as const, accent: "#63A4FF" },
                      { label: "Coverage", value: "North America", kind: "globe" as const, accent: "#4EE3C1" },
                      { label: "Support Types", value: "6", kind: "layers" as const, accent: "#A77DFF" },
                      { label: "Inbox Status", value: "Active", kind: "messages" as const, accent: "#22c55e" },
                    ]
                  : dashboardMode === "subscribe"
                    ? [
                        { label: "Upcoming Events", value: events.filter((e) => new Date(`${e.startDate}T00:00:00Z`) <= new Date(Date.now() + 30 * 86400000)).length, kind: "mail" as const, accent: "#63A4FF" },
                        { label: "Active Cities", value: unique(events.map((e) => [e.city, e.state].filter(Boolean).join(", "))).length, kind: "globe" as const, accent: "#4EE3C1" },
                        { label: "Hot Weeks", value: allConcentrationCards.filter((x) => x.type === "hotweek").length, kind: "zap" as const, accent: "#FFB357" },
                        { label: "Clusters", value: allConcentrationCards.filter((x) => x.type === "cluster").length, kind: "layers" as const, accent: "#A77DFF" },
                      ]
                    : dashboardMode === "submit"
                      ? [
                          { label: "Required Fields", value: "1", kind: "mail" as const, accent: "#63A4FF" },
                          { label: "Review Status", value: "Pending", kind: "calendar" as const, accent: "#A77DFF" },
                          { label: "Coverage", value: "North America", kind: "globe" as const, accent: "#4EE3C1" },
                          { label: "Submission Type", value: "Conference URL", kind: "layers" as const, accent: "#22c55e" },
                        ]
                  : [
                      { label: "Conferences Tracked", value: events.length, kind: "radar" as const, accent: "#63A4FF" },
                      { label: "Active Cities", value: unique(events.map((e) => [e.city, e.state].filter(Boolean).join(", "))).length, kind: "globe" as const, accent: "#4EE3C1" },
                      { label: "Hot Weeks", value: allConcentrationCards.filter((x) => x.type === "hotweek").length, kind: "zap" as const, accent: "#FFB357" },
                      { label: "Clusters", value: allConcentrationCards.filter((x) => x.type === "cluster").length, kind: "layers" as const, accent: "#FF5E7A" },
                    ]).map((item) => (
                  <div key={item.label} style={{ height: "76px", padding: "10px 12px", background: "rgba(5,20,44,.92)", border: "1px solid rgba(120,160,255,.16)", borderRadius: "16px", display: "grid", alignContent: "center" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", alignItems: "center", columnGap: "10px" }}>
                      <span style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(80,120,255,.24), rgba(28,48,110,.16))", border: "1px solid rgba(160,200,255,.18)", boxShadow: `0 0 24px ${item.accent}29, inset 0 1px 0 rgba(255,255,255,.08)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <AboutIcon kind={item.kind} color={item.accent} />
                      </span>
                      <div style={{ display: "grid", rowGap: "3px" }}>
                        <div
                          style={{
                            color: "#ffffff",
                            fontSize:
                              dashboardMode === "submit"
                                ? "14px"
                                : dashboardMode === "contact" && item.label === "Coverage"
                                  ? "10px"
                                  : "19px",
                            fontWeight: dashboardMode === "submit" ? 700 : 760,
                            lineHeight: dashboardMode === "contact" && item.label === "Coverage" ? 1.12 : 1.1,
                            whiteSpace: dashboardMode === "contact" && item.label === "Coverage" ? "normal" : "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: dashboardMode === "contact" && item.label === "Coverage" ? "70px" : "none",
                          }}
                        >
                          {dashboardMode === "contact" && item.label === "Coverage" ? (
                            <>
                              North
                              <br />
                              America
                            </>
                          ) : (
                            item.value
                          )}
                        </div>
                        <div style={{ color: "#9ec4e9", fontSize: "10px", fontWeight: 600, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "8px", marginBottom: "8px", position: "relative" }}>
            <div style={{ position: "absolute", inset: "-12px -8px", pointerEvents: "none", opacity: 0.08, background: "radial-gradient(72% 68% at 42% 40%, rgba(75,137,250,0.22) 0%, rgba(75,137,250,0.04) 52%, rgba(0,0,0,0) 82%)" }} />
            {(dashboardMode === "contact"
              ? [
                  { t: "Technical & Platform Support", b: "Get help with calendar feeds, filters, dashboard tools, subscriptions, exports, and platform workflows.", f: "Live workspace support", kind: "headset" as const, accent: "#6EA8FF" },
                  { t: "Organizer & Company Inquiries", b: "Conference organizers, public companies, IR teams, and service providers can contact us regarding coverage, submissions, and platform visibility.", f: "Coverage & organizer support", kind: "building" as const, accent: "#A77DFF" },
                  { t: "Market & Data Questions", b: "Reach out with questions regarding event classification, market tracking, conference clustering, or platform data coverage.", f: "Market intelligence support", kind: "messages" as const, accent: "#53E0C1" },
                ]
              : dashboardMode === "subscribe"
                ? [
                    { t: "Weekly Conference Briefing", b: "A curated weekly summary of notable upcoming conferences, investor events, and market activity.", f: "Delivered by email", kind: "mail" as const, accent: "#6EA8FF" },
                    { t: "Market Activity Highlights", b: "Track hot weeks, active cities, clusters, and new periods of elevated conference concentration.", f: "Market intelligence updates", kind: "zap" as const, accent: "#FFB357" },
                    { t: "Coverage Updates", b: "Stay informed as new conferences, organizers, sectors, and regions are added to the platform.", f: "Expanding event coverage", kind: "layers" as const, accent: "#53E0C1" },
                  ]
              : dashboardMode === "submit"
                ? [
                    { t: "Submit the Event URL", b: "Paste the conference website link so CCC can review the event details, organizer, dates, location, and fit.", f: "URL-first submission", kind: "mail" as const, accent: "#6EA8FF" },
                    { t: "Reviewed Before Inclusion", b: "Submitted conferences are reviewed before they are added to protect data quality and user trust.", f: "Verification workflow", kind: "calendar" as const, accent: "#A77DFF" },
                    { t: "Added to Market Coverage", b: "Qualified events may be added to the database, market views, concentration windows, and calendar feeds.", f: "Coverage expansion", kind: "layers" as const, accent: "#53E0C1" },
                  ]
              : [
                  { t: "Market Intelligence", b: "Track density, active cities, hot weeks, clusters, and participation trends.", f: "Live analysis layer", kind: "radar" as const, accent: "#6EA8FF" },
                  { t: "Live Calendar Feeds", b: "Turn filtered market views into continuously updating calendar feeds.", f: "Google · Apple · Outlook", kind: "calendar" as const, accent: "#A77DFF" },
                  { t: "Workflow Infrastructure", b: "Built for investors, IR teams, public companies, and capital markets workflows.", f: "Workspace tools", kind: "layers" as const, accent: "#53E0C1" },
                ]).map((card) => (
              <div key={card.t} className="ccc-about-feature" style={{ height: "145px", borderRadius: "22px", background: "rgba(4,14,32,.92)", border: "1px solid rgba(110,160,255,.12)", padding: "11px", boxShadow: "0 8px 18px rgba(3,10,24,0.3)", position: "relative", zIndex: 1, display: "grid", gridTemplateRows: "auto auto 1fr auto", rowGap: "4px", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "10px", alignItems: "start", marginBottom: "2px" }}>
                  <span style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(80,120,255,.24), rgba(28,48,110,.16))", border: "1px solid rgba(160,200,255,.18)", boxShadow: `0 0 24px ${card.accent}, inset 0 1px 0 rgba(255,255,255,.08)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <AboutIcon kind={card.kind} color={card.accent} />
                  </span>
                  <div style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, marginTop: "4px", lineHeight: 1.12, textShadow: "0 1px 8px rgba(255,255,255,0.05)" }}>{card.t}</div>
                </div>
                <div style={{ fontSize: "12px", lineHeight: 1.3, color: "rgba(190,205,230,.72)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{card.b}</div>
                <div style={{ height: "1px", background: "rgba(110,160,255,.16)", marginTop: "6px" }} />
                <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(120,150,190,.65)", marginTop: "auto", paddingTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.f}</div>
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid rgba(147,197,253,0.1)", borderRadius: "18px", background: "rgba(4,14,32,.92)", padding: "12px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: "12px", marginBottom: "10px", boxShadow: "0 8px 20px rgba(2,9,20,0.28)" }}>
            <div>
              <div style={{ color: "#e7f1ff", fontWeight: 760, fontSize: "14px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "999px", background: "rgba(45,212,191,0.24)", border: "1px solid rgba(45,212,191,0.4)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>◈</span>
                {dashboardMode === "contact" ? "Support Categories" : dashboardMode === "subscribe" ? "Subscribe to Weekly Briefing" : dashboardMode === "submit" ? "Submit Conference URL" : "Conference Coverage"}
              </div>
              <div style={{ color: "#a9c4e2", fontSize: "11px", marginBottom: "7px" }}>
                {dashboardMode === "contact"
                  ? "CCC supports platform users, conference organizers, investors, and market participants across multiple workflows."
                  : dashboardMode === "subscribe"
                    ? "Enter your email to receive conference updates and market activity highlights."
                    : dashboardMode === "submit"
                      ? "Submit a conference website link for review, verification, and potential inclusion in the platform."
                  : "CCC tracks investor and capital markets activity across public and private markets."}
              </div>
              {dashboardMode === "subscribe" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (subscribeEmailRef.current) subscribeEmailRef.current.focus();
                  }}
                  style={{ display: "grid", gap: "8px" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                    <input type="text" placeholder="First Name" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                    <input type="text" placeholder="Last Name" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  </div>
                  <input ref={subscribeEmailRef} type="email" placeholder="Email Address" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  <input type="text" placeholder="Company (optional)" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  <input type="text" placeholder="Role (optional)" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  <button type="submit" style={{ height: "36px", borderRadius: "9px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, rgba(44,107,255,0.92), rgba(36,88,216,0.92))", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                    Subscribe to Weekly Briefing
                  </button>
                  <div style={{ color: "#8fb3d7", fontSize: "10px" }}>No spam. Unsubscribe anytime.</div>
                </form>
              ) : dashboardMode === "submit" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitConferenceUrl();
                  }}
                  style={{ display: "grid", gap: "8px" }}
                >
                  <input
                    ref={submitUrlRef}
                    type="url"
                    value={submitForm.url}
                    onChange={(e) => {
                      setSubmitForm((prev) => ({ ...prev, url: e.target.value }));
                      if (submitFormMessage) setSubmitFormMessage(null);
                    }}
                    placeholder="Conference URL (required)"
                    style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }}
                  />
                  <input type="email" value={submitForm.email} onChange={(e) => setSubmitForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Submitter Email (optional)" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  <input type="text" value={submitForm.conferenceName} onChange={(e) => setSubmitForm((prev) => ({ ...prev, conferenceName: e.target.value }))} placeholder="Conference Name (optional)" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  <input type="text" value={submitForm.organizer} onChange={(e) => setSubmitForm((prev) => ({ ...prev, organizer: e.target.value }))} placeholder="Organizer (optional)" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                    <input type="date" value={submitForm.startDate} onChange={(e) => setSubmitForm((prev) => ({ ...prev, startDate: e.target.value }))} aria-label="Conference Start Date" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                    <input type="date" value={submitForm.endDate} onChange={(e) => setSubmitForm((prev) => ({ ...prev, endDate: e.target.value }))} aria-label="Conference End Date" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  </div>
                  <input type="text" value={submitForm.location} onChange={(e) => setSubmitForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location (optional)" style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", outline: "none" }} />
                  <textarea value={submitForm.notes} onChange={(e) => setSubmitForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes (optional)" style={{ minHeight: "62px", borderRadius: "8px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "8px 10px", fontSize: "12px", outline: "none", resize: "vertical" }} />
                  <button type="submit" style={{ height: "36px", borderRadius: "9px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, rgba(44,107,255,0.92), rgba(36,88,216,0.92))", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                    Submit Conference
                  </button>
                  <div style={{ color: submitFormMessage?.type === "error" ? "#fca5a5" : submitFormMessage?.type === "success" ? "#86efac" : "#8fb3d7", fontSize: "10px", minHeight: "14px" }}>
                    {submitFormMessage?.text || "Submitting a URL does not guarantee inclusion. CCC reviews events for relevance, accuracy, and coverage fit."}
                  </div>
                </form>
              ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(dashboardMode === "contact"
                  ? [
                      { label: "Conference submissions", dot: "rgba(96,165,250,0.95)" },
                      { label: "Calendar feed support", dot: "rgba(251,191,36,0.95)" },
                      { label: "Platform questions", dot: "rgba(167,139,250,0.95)" },
                      { label: "Investor workflows", dot: "rgba(45,212,191,0.95)" },
                      { label: "Organizer support", dot: "rgba(99,102,241,0.95)" },
                      { label: "Market data questions", dot: "rgba(96,165,250,0.95)" },
                    ]
                  : [
                      { label: "Investor conferences", dot: "rgba(96,165,250,0.95)" },
                      { label: "Roadshows", dot: "rgba(251,191,36,0.95)" },
                      { label: "Public company events", dot: "rgba(167,139,250,0.95)" },
                      { label: "Private market gatherings", dot: "rgba(45,212,191,0.95)" },
                      { label: "Industry conferences", dot: "rgba(99,102,241,0.95)" },
                      { label: "Capital markets events", dot: "rgba(96,165,250,0.95)" },
                    ]).map((chip) => (
                  <span key={chip.label} style={{ height: "36px", padding: "0 14px", borderRadius: "999px", background: "rgba(8,22,48,.72)", border: "1px solid rgba(120,160,255,.16)", fontSize: "12px", fontWeight: 600, color: "#d6e7fb", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 150ms ease" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: chip.dot }} />
                    {chip.label}
                  </span>
                ))}
              </div>
              )}
            </div>
            <div>
              <div style={{ color: "#e7f1ff", fontWeight: 760, fontSize: "14px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "999px", background: "rgba(96,165,250,0.22)", border: "1px solid rgba(96,165,250,0.4)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>▣</span>
                {dashboardMode === "contact" ? "Office & Response Snapshot" : dashboardMode === "subscribe" ? "What You'll Receive" : dashboardMode === "submit" ? "What qualifies?" : "Coverage Snapshot"}
              </div>
              {(dashboardMode === "contact"
                ? [
                    { label: "Location", value: "New York, NY" },
                    { label: "Coverage", value: "United States & Canada" },
                    { label: "Typical Response", value: "Within 24 Hours" },
                    { label: "Support Availability", value: "Business Days" },
                  ]
                : dashboardMode === "subscribe"
                  ? [
                      { label: "Upcoming Conferences", value: "Notable events coming up across capital markets." },
                      { label: "Hot Weeks & Clusters", value: "Periods of elevated activity and overlapping events." },
                      { label: "New Coverage", value: "Recently added conferences, organizers, and sectors." },
                      { label: "Calendar Workflow Tips", value: "Practical ways to build and maintain live conference feeds." },
                    ]
                : dashboardMode === "submit"
                  ? [
                      { label: "Investor conferences", value: "" },
                      { label: "Industry conferences", value: "" },
                      { label: "Roadshows and investor access events", value: "" },
                      { label: "Private market gatherings", value: "" },
                      { label: "Public company investor events", value: "" },
                      { label: "Capital markets events", value: "" },
                    ]
                : [
                    { label: "United States", value: 78 },
                    { label: "Canada", value: 22 },
                  ]).map((row) => (
                <div key={row.label} style={{ marginBottom: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#cde0f4", fontSize: "15px", marginBottom: "4px" }}>
                    <span>{row.label}</span>
                    <span>{dashboardMode === "contact" || dashboardMode === "submit" ? row.value : `${row.value}%`}</span>
                  </div>
                  {dashboardMode === "contact" || dashboardMode === "submit" ? (
                    <div style={{ height: "6px", borderRadius: "999px", background: "rgba(12,34,56,0.5)", border: "1px solid rgba(147,197,253,0.08)" }}>
                      <div style={{ width: dashboardMode === "submit" ? "16%" : "24%", height: "100%", borderRadius: "999px", boxShadow: "0 0 10px rgba(59,130,246,0.24)", background: "linear-gradient(90deg, rgba(45,212,191,0.6), rgba(96,165,250,0.72))" }} />
                    </div>
                  ) : (
                    <div style={{ height: "6px", borderRadius: "999px", background: "rgba(12,34,56,0.78)", border: "1px solid rgba(147,197,253,0.12)" }}>
                      <div style={{ width: `${row.value}%`, height: "100%", borderRadius: "999px", boxShadow: "0 0 10px rgba(59,130,246,0.34)", background: "linear-gradient(90deg, rgba(45,212,191,0.82), rgba(96,165,250,0.92))" }} />
                    </div>
                  )}
                </div>
              ))}
              <div style={{ color: "#8fb3d7", fontSize: "10px", lineHeight: 1.3, marginTop: "2px" }}>
                {dashboardMode === "contact"
                  ? "Support availability reflects business-day operations with fast response coverage."
                  : dashboardMode === "subscribe"
                    ? "Weekly briefings and market updates are designed for practical conference planning workflows."
                    : dashboardMode === "submit"
                      ? "Submissions are reviewed before any event is added to market coverage."
                  : "Coverage expands through ongoing research, organizer discovery, and submitted conference URLs."}
              </div>
            </div>
          </div>

          <div style={{ height: "88px", borderRadius: "22px", padding: "0 20px", background: "rgba(4,14,32,.92)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", columnGap: "10px" }}>
              <span style={{ width: "40px", height: "40px", borderRadius: "999px", background: "rgba(70,120,255,.18)", color: "#FFCC66", boxShadow: "0 0 14px rgba(255,200,90,.28)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>{dashboardMode === "contact" ? "✉" : dashboardMode === "subscribe" ? "🔔" : dashboardMode === "submit" ? "📝" : "⚡"}</span>
              <div>
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px" }}>{dashboardMode === "contact" ? "Contact the CCC Team" : dashboardMode === "subscribe" ? "Stay Connected to the Market Calendar" : dashboardMode === "submit" ? "Help Expand Conference Coverage" : "Build Your Live Conference Calendar"}</div>
                <div style={{ color: "#a6c3e2", fontSize: "10px", marginTop: "1px" }}>{dashboardMode === "contact" ? "Questions, support requests, submissions, and platform inquiries." : dashboardMode === "subscribe" ? "Subscribe for weekly updates or build a live calendar feed from your current market view." : dashboardMode === "submit" ? "Submit conference URLs so CCC can review and expand the market calendar over time." : "Create a filtered view and subscribe to it as a live feed."}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", borderLeft: "1px solid rgba(110,160,255,.16)", paddingLeft: "14px" }}>
              {dashboardMode === "contact" ? (
                <>
                  <a href="mailto:info@capitalconferencecalendar.com" style={{ height: "48px", padding: "0 18px", background: "linear-gradient(180deg, #2C6BFF, #2458D8)", color: "#fff", fontWeight: 700, borderRadius: "14px", boxShadow: "0 0 18px rgba(70,120,255,.18)", border: "1px solid rgba(96,165,250,0.44)", fontSize: "14px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Send Email</a>
                  <a href="/submit" style={{ height: "48px", padding: "0 18px", background: "rgba(7,20,44,.88)", border: "1px solid rgba(120,160,255,.18)", color: "#fff", borderRadius: "14px", fontSize: "14px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Conference Submissions</a>
                </>
              ) : dashboardMode === "subscribe" ? (
                <>
                  <button
                    type="button"
                    onClick={() => subscribeEmailRef.current?.focus()}
                    style={{ height: "48px", padding: "0 18px", background: "linear-gradient(180deg, #2C6BFF, #2458D8)", color: "#fff", fontWeight: 700, borderRadius: "14px", boxShadow: "0 0 18px rgba(70,120,255,.18)", border: "1px solid rgba(96,165,250,0.44)", fontSize: "14px", cursor: "pointer" }}
                  >
                    Subscribe
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardMode("market")}
                    style={{ height: "48px", padding: "0 18px", background: "rgba(7,20,44,.88)", border: "1px solid rgba(120,160,255,.18)", color: "#fff", borderRadius: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Build Live Calendar Feed
                  </button>
                </>
              ) : dashboardMode === "submit" ? (
                <>
                  <button
                    type="button"
                    onClick={() => submitUrlRef.current?.focus()}
                    style={{ height: "48px", padding: "0 18px", background: "linear-gradient(180deg, #2C6BFF, #2458D8)", color: "#fff", fontWeight: 700, borderRadius: "14px", boxShadow: "0 0 18px rgba(70,120,255,.18)", border: "1px solid rgba(96,165,250,0.44)", fontSize: "14px", cursor: "pointer" }}
                  >
                    Submit Conference URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardMode("market")}
                    style={{ height: "48px", padding: "0 18px", background: "rgba(7,20,44,.88)", border: "1px solid rgba(120,160,255,.18)", color: "#fff", borderRadius: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                  >
                    View Market Calendar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setDashboardMode("market")}
                    style={{ height: "48px", padding: "0 18px", background: "linear-gradient(180deg, #2C6BFF, #2458D8)", color: "#fff", fontWeight: 700, borderRadius: "14px", boxShadow: "0 0 18px rgba(70,120,255,.18)", border: "1px solid rgba(96,165,250,0.44)", fontSize: "14px", cursor: "pointer" }}
                  >
                    Open Calendar Feed Builder
                  </button>
                  <a href="/submit" style={{ height: "48px", padding: "0 18px", background: "rgba(7,20,44,.88)", border: "1px solid rgba(120,160,255,.18)", color: "#fff", borderRadius: "14px", fontSize: "14px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                    Submit a Conference
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        )}
        </div>

        <div ref={resultsAnchorRef} style={{ marginTop: "8px", border: "1px solid rgba(96,165,250,0.16)", borderRadius: "14px", background: "linear-gradient(180deg, rgba(8,30,53,0.84) 0%, rgba(7,26,47,0.82) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <div style={{ padding: "12px", borderBottom: "1px solid rgba(96,165,250,0.16)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", width: "100%", maxWidth: "100%", overflow: "visible", position: "relative", zIndex: 8 }}>
            <div style={{ color: "#dbeafe", fontWeight: 700 }}>{selectedEvents.length ? `${selectedEvents.length} selected` : `Showing ${filteredEvents.length} of ${events.length} conferences`}</div>
            <div style={{ display: "grid", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  markToolbarAction("clear");
                  clearWorkspaceView();
                }}
                aria-label="Clear workspace view"
                onMouseEnter={() => setToolbarHelpText("Reset filters, selections, and quick views to default.")}
                onMouseLeave={() => setToolbarHelpText("")}
                onFocus={() => setToolbarHelpText("Reset filters, selections, and quick views to default.")}
                onBlur={() => setToolbarHelpText("")}
                style={{
                  border: activeToolbarAction === "clear" ? "1px solid rgba(147,197,253,0.7)" : "1px solid rgba(147,197,253,0.24)",
                  borderRadius: "8px",
                  background: activeToolbarAction === "clear" ? "rgba(59,130,246,0.25)" : "rgba(147,197,253,0.08)",
                  color: "#dbeafe",
                  height: "34px",
                  padding: "0 10px",
                  cursor: "pointer",
                  transition: "all 140ms ease",
                  boxShadow: activeToolbarAction === "clear" ? "0 0 0 2px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                Clear
              </button>
              <button
                onClick={() => {
                  markToolbarAction("share");
                  shareSelected();
                }}
                aria-label="Share selected conferences"
                onMouseEnter={() => setToolbarHelpText("Open an email draft with up to 20 selected events and links.")}
                onMouseLeave={() => setToolbarHelpText("")}
                onFocus={() => setToolbarHelpText("Open an email draft with up to 20 selected events and links.")}
                onBlur={() => setToolbarHelpText("")}
                style={{
                  border: activeToolbarAction === "share" ? "1px solid rgba(147,197,253,0.7)" : "1px solid rgba(147,197,253,0.24)",
                  borderRadius: "8px",
                  background: activeToolbarAction === "share" ? "rgba(59,130,246,0.25)" : "rgba(147,197,253,0.08)",
                  color: "#dbeafe",
                  height: "34px",
                  padding: "0 10px",
                  cursor: "pointer",
                  transition: "all 140ms ease",
                  boxShadow: activeToolbarAction === "share" ? "0 0 0 2px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                Share Selected
              </button>
              <button
                onClick={() => {
                  markToolbarAction("view");
                  saveCurrentView();
                }}
                aria-label="Save current market view"
                onMouseEnter={() => setToolbarHelpText("Save your current filters as a local market view preset.")}
                onMouseLeave={() => setToolbarHelpText("")}
                onFocus={() => setToolbarHelpText("Save your current filters as a local market view preset.")}
                onBlur={() => setToolbarHelpText("")}
                style={{
                  border: activeToolbarAction === "view" ? "1px solid rgba(147,197,253,0.7)" : "1px solid rgba(147,197,253,0.24)",
                  borderRadius: "8px",
                  background: activeToolbarAction === "view" ? "rgba(59,130,246,0.25)" : "rgba(147,197,253,0.08)",
                  color: "#dbeafe",
                  height: "34px",
                  padding: "0 10px",
                  cursor: "pointer",
                  transition: "all 140ms ease",
                  boxShadow: activeToolbarAction === "view" ? "0 0 0 2px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                Save Market View
              </button>
              <div ref={saveMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    markToolbarAction("save");
                    setSaveMenuOpen((v) => !v);
                  }}
                  aria-label="Save selected conferences to list"
                  onMouseEnter={() => setToolbarHelpText("Save selected conferences to a new or existing local list.")}
                  onMouseLeave={() => setToolbarHelpText("")}
                  onFocus={() => setToolbarHelpText("Save selected conferences to a new or existing local list.")}
                  onBlur={() => setToolbarHelpText("")}
                  style={{
                    border: activeToolbarAction === "save" || saveMenuOpen ? "1px solid rgba(147,197,253,0.7)" : "1px solid rgba(147,197,253,0.24)",
                    borderRadius: "8px",
                    background: activeToolbarAction === "save" || saveMenuOpen ? "rgba(59,130,246,0.25)" : "rgba(147,197,253,0.08)",
                    color: "#dbeafe",
                    height: "34px",
                    padding: "0 10px",
                    cursor: "pointer",
                    transition: "all 140ms ease",
                    boxShadow: activeToolbarAction === "save" || saveMenuOpen ? "0 0 0 2px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  Save Selected
                </button>
                {saveMenuOpen ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "40px",
                      right: 0,
                      width: "260px",
                      zIndex: 400,
                      borderRadius: "10px",
                      border: "1px solid rgba(96,165,250,0.3)",
                      background: "linear-gradient(180deg, rgba(8,30,53,0.98) 0%, rgba(7,25,45,0.98) 100%)",
                      boxShadow: "0 14px 28px rgba(4,12,22,0.38)",
                      padding: "10px",
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#9ec4e9", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                      Save Events To
                    </div>
                    <select
                      value={saveListChoice}
                      onChange={(e) => setSaveListChoice(e.target.value)}
                      style={{
                        height: "34px",
                        borderRadius: "8px",
                        background: "#08223d",
                        color: "#e2e8f0",
                        border: "1px solid rgba(96,165,250,0.3)",
                        padding: "0 8px",
                      }}
                    >
                      <option value="new">Create New List</option>
                      {savedLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (saveListChoice === "new") {
                          addSelectedToNewList();
                        } else {
                          addSelectedToExistingList(saveListChoice);
                        }
                        setSaveMenuOpen(false);
                        setSaveListChoice("new");
                      }}
                      style={{
                        height: "34px",
                        borderRadius: "8px",
                        border: "1px solid rgba(96,165,250,0.44)",
                        background: "rgba(37,99,235,0.24)",
                        color: "#dbeafe",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : null}
              </div>
              </div>
              <div
                style={{
                  minHeight: "16px",
                  fontSize: "11px",
                  color: "rgba(159,184,216,0.95)",
                  lineHeight: 1.35,
                  paddingLeft: "2px",
                  opacity: toolbarHelpText ? 1 : 0,
                  transition: "opacity 140ms ease",
                  pointerEvents: "none",
                }}
              >
                {toolbarHelpText || " "}
              </div>
            </div>
          </div>

          {dashboardMode === "market" ? (
          <div style={{ padding: "12px", borderBottom: "1px solid rgba(96,165,250,0.16)" }}>
            <div style={{ color: "#f8fbff", fontSize: "18px", fontWeight: 750, letterSpacing: "0.01em", marginBottom: "8px" }}>Market View Analysis</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", minWidth: 0, maxWidth: "100%" }}>
              {analysisCards.map((card) => (
                <button key={card.t} onClick={() => applyAnalysisView(card.action)} style={{ textAlign: "left", border: "1px solid rgba(147,197,253,0.2)", borderRadius: "10px", background: "rgba(12,36,61,0.65)", color: "#dbeafe", padding: "10px", cursor: "pointer" }}>
                  <div style={{ fontSize: "13px", lineHeight: 1.35, fontWeight: 700, letterSpacing: "0.005em", marginBottom: "5px", color: "#dbeafe" }}>{card.t}</div>
                  <div style={{ fontSize: "11px", lineHeight: 1.45, color: "#9ec4e9", fontWeight: 500 }}>{card.b}</div>
                </button>
              ))}
            </div>
          </div>
          ) : null}

          <div style={{ padding: "18px 12px 16px", borderBottom: "1px solid rgba(96,165,250,0.2)", borderTop: "1px solid rgba(76,144,255,0.18)", background: "linear-gradient(180deg, rgba(10,34,58,0.68) 0%, rgba(8,28,49,0.58) 100%)", boxShadow: "inset 0 1px 0 rgba(147,197,253,0.08), 0 0 18px rgba(37,99,235,0.08)" }}>
            <div style={{ color: "#8fb6df", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Live Event Workspace</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 20px", color: "#c3d7ee", fontSize: "14px", lineHeight: 1.45, alignItems: "baseline" }}>
              <span style={{ color: "#e2efff", fontSize: "18px", fontWeight: 760, marginRight: "6px" }}>Operational Layer</span>
              <span><strong style={{ color: "#f8fbff", fontSize: "16px", fontWeight: 700 }}>{inViewStats.events}</strong> events</span>
              <span><strong style={{ color: "#f8fbff", fontSize: "16px", fontWeight: 700 }}>{inViewStats.organizers}</strong> organizers</span>
              <span><strong style={{ color: "#f8fbff", fontSize: "16px", fontWeight: 700 }}>{inViewStats.states}</strong> states</span>
              <span><strong style={{ color: "#f8fbff", fontSize: "16px", fontWeight: 700 }}>{inViewStats.cities}</strong> cities</span>
              <span><strong style={{ color: "#f8fbff", fontSize: "16px", fontWeight: 700 }}>{inViewStats.themes}</strong> themes</span>
              <span><strong style={{ color: "#f8fbff", fontSize: "16px", fontWeight: 700 }}>{inViewStats.focus}</strong> market focus areas</span>
            </div>
          </div>

          <div style={{ padding: "26px 12px 14px", background: "linear-gradient(180deg, rgba(7,23,39,0.72) 0%, rgba(6,20,35,0.84) 100%)" }}>
            <div className="event-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "12px", width: "100%", maxWidth: "100%", minWidth: 0 }}>
          {filteredEvents.map((e) => {
            const parts = toDateRangeParts(e.startDate, e.endDate);
            const isMultiDay = parts.dayRange.includes("–");
            const weekStart = getWeekStart(e.startDate);
            const isHot = hotWeekKeys.has(weekStart);
            const selected = selectedSet.has(e.id);
            const cityLabel = [e.city, e.state].filter(Boolean).join(", ");
            const eventTime = new Date(`${e.startDate}T00:00:00Z`).getTime();

            const isCluster = viewClusters.some((cluster) => {
              if (cluster.type !== "cluster") return false;
              if (cluster.label !== cityLabel) return false;
              const start = new Date(`${cluster.weekStart}T00:00:00Z`).getTime();
              const end = new Date(`${cluster.weekEnd}T23:59:59Z`).getTime();
              return eventTime >= start && eventTime <= end;
            });
            const matchedCluster = viewClusters.find((cluster) => {
              if (cluster.type !== "cluster") return false;
              if (cluster.label !== cityLabel) return false;
              const start = new Date(`${cluster.weekStart}T00:00:00Z`).getTime();
              const end = new Date(`${cluster.weekEnd}T23:59:59Z`).getTime();
              return eventTime >= start && eventTime <= end;
            });
            const matchedHotWeek = viewTopWeeks.find((window) => window.weekStart === weekStart);

            const themeTags = splitCsv(e.sectorThemes);
            const focusTags = splitCsv(e.marketFocus);
            const focusTagConferenceType = (e.primaryCategory || "").trim();
            const focusTagSectorTheme = (themeTags[0] || "").trim();
            const focusTagMarketFocus = (focusTags[0] || "").trim();
            const focusTagIssuer = (e.issuerParticipation || "").trim();
            const orderedFocusTags = unique([
              focusTagConferenceType,
              focusTagSectorTheme,
              focusTagMarketFocus,
              focusTagIssuer,
            ].filter(Boolean)).slice(0, 4);
            const classificationTags = orderedFocusTags;
            const classificationDisplayTags = classificationTags.slice(0, 4);

            const signalBadges: { label: string; tone: "hot" | "cluster" | "theme" }[] = [];
            if (isHot) signalBadges.push({ label: "HOT WEEK", tone: "hot" });
            if (isCluster) signalBadges.push({ label: "CLUSTER", tone: "cluster" });
            if (signalBadges.length < 2 && /investor/i.test(`${e.primaryCategory} ${e.marketFocus} ${e.issuerParticipation}`)) signalBadges.push({ label: "INVESTOR HEAVY", tone: "theme" });
            if (signalBadges.length < 2 && /health/i.test(e.sectorThemes)) signalBadges.push({ label: "HEALTHCARE", tone: "theme" });
            if (signalBadges.length < 2 && /private/i.test(e.marketFocus)) signalBadges.push({ label: "PRIVATE MARKETS", tone: "theme" });
            if (signalBadges.length < 2 && /canada/i.test(e.country)) signalBadges.push({ label: "CANADA", tone: "theme" });
            const regionBadge = (e.region || "").trim();
            if (signalBadges.length < 2 && regionBadge) signalBadges.push({ label: regionBadge.toUpperCase(), tone: "theme" });
            const visibleBadges = signalBadges.slice(0, 2);

            const sameCityWeekCount = filteredEvents.filter((x) => x.id !== e.id && [x.city, x.state].filter(Boolean).join(", ") === cityLabel && getWeekStart(x.startDate) === weekStart).length;
            const sameThemeWeekCount = filteredEvents.filter((x) => x.id !== e.id && getWeekStart(x.startDate) === weekStart && splitCsv(x.sectorThemes).some((t) => themeTags.includes(t))).length;

            const marketSignal = (() => {
              if (isHot && isCluster) return "Clustered activity inside a peak conference window";
              if (isHot && /health|biotech/i.test(e.sectorThemes)) return "Peak healthcare scheduling window";
              if (isHot && /investor/i.test(`${e.primaryCategory} ${e.marketFocus}`)) return "Investor participation elevated this week";
              if (isCluster && /public/i.test(e.marketFocus)) return "Public markets overlap detected";
              if (isCluster && /private/i.test(e.marketFocus)) return "Private markets concentration window";
              if (isCluster) return "Same-city overlap across a five-day window";
              if (/investor/i.test(`${e.primaryCategory} ${e.marketFocus} ${e.issuerParticipation}`)) return "Institutional attendance trend";
              if (/health|biotech/i.test(e.sectorThemes)) return "Healthcare participation elevated";
              if (/private/i.test(e.marketFocus)) return "Private markets participation elevated";
              if (/canada/i.test(e.country)) return "Cross-border conference lane active";
              if (/west|california|seattle|vancouver|san diego|san francisco|los angeles/i.test(`${e.region} ${e.city} ${e.state}`)) return "West Coast activity remains elevated";
              return "Conference activity remains above baseline";
            })();

            const signalTone = /cross-border|canada/i.test(`${marketSignal} ${e.country}`)
              ? "teal"
              : isCluster
                ? "cluster"
                : isHot
                  ? "hot"
                  : /investor/i.test(`${marketSignal} ${e.primaryCategory} ${e.marketFocus} ${e.issuerParticipation}`)
                    ? "investor"
                    : /health|biotech/i.test(e.sectorThemes)
                      ? "health"
                      : /private/i.test(e.marketFocus)
                        ? "private"
                        : "default";

            const signalAccent =
              signalTone === "hot"
                ? "rgba(190,136,84,0.8)"
                : signalTone === "cluster"
                  ? "rgba(168,88,106,0.8)"
                  : signalTone === "teal"
                    ? "rgba(72,164,155,0.82)"
                    : signalTone === "health"
                      ? "rgba(86,154,118,0.8)"
                      : signalTone === "private"
                        ? "rgba(137,118,187,0.8)"
                        : signalTone === "investor"
                          ? "rgba(109,149,209,0.82)"
                          : "rgba(108,137,182,0.72)";

            const relatedLine = sameCityWeekCount > 0
              ? `${sameCityWeekCount} overlapping conferences nearby this week`
              : sameThemeWeekCount > 0
                ? `${sameThemeWeekCount} related ${themeTags[0] || "market"} events in the same week`
                : "Concentration signal remains elevated in this city window";
            const hasRelatedMarketView = sameCityWeekCount > 0 || sameThemeWeekCount > 0;
            const eventYear = new Date(`${e.startDate}T00:00:00Z`).getUTCFullYear();
            const dayRangeDisplay = isMultiDay ? parts.dayRange.replace("–", " – ") : parts.dayRange;
            const dowRangeDisplay = isMultiDay ? parts.dowRange.replace("–", " – ") : parts.dowRange;

            const organizerCount = filteredEvents.filter((x) => x.organizer && x.organizer === e.organizer).length;
            const isFeatured = isHot || isCluster || /investor/i.test(`${e.primaryCategory} ${e.marketFocus} ${e.issuerParticipation}`) || organizerCount >= 3;
            const normalizedVenue = (e.venue || "").trim();
            const normalizeLocationText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
            const cityNorm = normalizeLocationText((cityLabel || "").trim());
            const venueNorm = normalizeLocationText(normalizedVenue);
            const venueLine = normalizedVenue && venueNorm && cityNorm && !cityNorm.includes(venueNorm) && !venueNorm.includes(cityNorm) ? normalizedVenue : "";
            const externalUrl = buildEventLink(e);

            return (
              <article
                id={`event-card-${e.id}`}
                className="ccc-workspace-event-card event-card"
                key={e.id}
                onMouseEnter={() => setHoveredCardId(e.id)}
                onMouseLeave={() => setHoveredCardId((prev) => (prev === e.id ? null : prev))}
                onClick={() => {
                  toggleSelect(e.id);
                  recordActivity("event", `Viewed: ${e.title}`, [e.city, e.state].filter(Boolean).join(", "));
                }}
                style={{
                  border: selected ? "1px solid rgba(134,166,201,0.58)" : "1px solid rgba(106,125,148,0.24)",
                  borderLeft: isHot ? "3px solid rgba(182,132,84,0.68)" : isCluster ? "3px solid rgba(160,86,104,0.64)" : "3px solid rgba(90,110,132,0.42)",
                  borderRadius: "14px",
                  background: `radial-gradient(78% 64% at 46% 50%, rgba(76,116,164,0.08) 0%, rgba(76,116,164,0.012) 54%, rgba(76,116,164,0) 82%), radial-gradient(90% 88% at 26% 18%, rgba(98,142,191,0.075) 0%, rgba(98,142,191,0.016) 42%, rgba(98,142,191,0) 70%), radial-gradient(110% 90% at 92% 92%, rgba(6,14,26,0.3) 0%, rgba(6,14,26,0.07) 52%, rgba(6,14,26,0) 74%), radial-gradient(85% 85% at 15% 10%, ${
                    isHot
                      ? "rgba(166,124,84,0.16)"
                    : isCluster
                        ? "rgba(152,84,102,0.16)"
                        : "rgba(101,131,168,0.09)"
                  } 0%, rgba(8,22,36,0.03) 42%, rgba(8,22,36,0) 70%), radial-gradient(70% 80% at 42% 52%, rgba(28,62,96,0.08) 0%, rgba(10,24,40,0.01) 56%, rgba(10,24,40,0) 82%), linear-gradient(132deg, rgba(14,30,50,0.26) 8%, rgba(9,23,39,0.02) 40%, rgba(8,20,36,0.18) 100%), linear-gradient(180deg, rgba(10,26,43,0.97) 0%, rgba(7,20,34,0.98) 100%)`,
                  padding: "12px 16px",
                  minHeight: "148px",
                  height: "auto",
                  display: "grid",
                  gridTemplateColumns: "170px minmax(0, 1fr) 330px",
                  columnGap: "14px",
                  alignItems: "stretch",
                  overflow: "visible",
                  transform: hoveredCardId === e.id ? "translateY(-1px)" : "translateY(0)",
                  transition: "transform 180ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out, filter 180ms ease-out, background 180ms ease-out",
                  filter: hoveredCardId === e.id ? "brightness(1.03)" : "none",
                  animation: isHot ? "cccHotWeekShimmer 11s linear infinite" : isCluster ? "cccClusterShimmer 12.5s linear infinite" : undefined,
                  boxShadow: selected
                    ? "0 0 0 1px rgba(116,149,188,0.45), 0 10px 18px rgba(5,14,26,0.34), inset 0 1px 0 rgba(255,255,255,0.06)"
                    : hoveredCardId === e.id
                      ? "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -12px 22px rgba(3,12,22,0.34), inset 0 0 24px rgba(60,105,168,0.07), 0 10px 18px rgba(4,15,29,0.34)"
                      : isFeatured
                      ? "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -8px 15px rgba(3,11,20,0.26), 0 7px 13px rgba(4,15,29,0.24)"
                      : "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -7px 12px rgba(3,11,20,0.22), 0 5px 10px rgba(4,15,29,0.2)",
                }}
              >
                <div style={{ borderRight: "1px solid rgba(108,128,152,0.013)", paddingRight: "12px", display: "grid", alignContent: "start", gap: "4px", minHeight: 0 }}>
                  <div
                    style={{
                      position: "absolute",
                      width: "100px",
                      height: "100px",
                      transform: "translate(-10px, -6px)",
                      pointerEvents: "none",
                      filter: "blur(16px)",
                      opacity: 0.42,
                      background:
                        isHot
                          ? "radial-gradient(circle, rgba(176,126,82,0.42) 0%, rgba(176,126,82,0) 72%)"
                          : isCluster
                            ? "radial-gradient(circle, rgba(154,77,96,0.38) 0%, rgba(154,77,96,0) 72%)"
                            : /canada/i.test(e.country)
                              ? "radial-gradient(circle, rgba(62,154,145,0.34) 0%, rgba(62,154,145,0) 72%)"
                              : /investor/i.test(`${e.primaryCategory} ${e.marketFocus} ${e.issuerParticipation}`)
                                ? "radial-gradient(circle, rgba(92,132,189,0.34) 0%, rgba(92,132,189,0) 72%)"
                                : "radial-gradient(circle, rgba(101,130,172,0.28) 0%, rgba(101,130,172,0) 72%)",
                    }}
                  />
                  <span
                    style={{
                      display: "inline-grid",
                      placeItems: "center",
                      width: "74px",
                      height: "82px",
                      borderRadius: "12px",
                      background: isHot
                        ? "linear-gradient(180deg, rgba(156,110,78,0.8), rgba(76,52,40,0.84))"
                        : isCluster
                          ? "linear-gradient(180deg, rgba(142,82,100,0.82), rgba(72,42,54,0.86))"
                          : "linear-gradient(180deg, rgba(56,87,133,0.64), rgba(26,44,70,0.76))",
                      border: isCluster ? "1px solid rgba(170,106,126,0.42)" : "1px solid rgba(120,141,166,0.3)",
                      padding: "5px 0",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: "#c8d6e8", fontWeight: 800, letterSpacing: "0.04em" }}>{parts.month}</span>
                    <span style={{ fontSize: "9px", color: "#afc3db", fontWeight: 680, lineHeight: 1, letterSpacing: "0.02em" }}>{Number.isFinite(eventYear) ? eventYear : ""}</span>
                    <span
                      style={{
                        fontSize: isMultiDay ? "18px" : "22px",
                        color: "#f2f7fd",
                        lineHeight: 1,
                        fontWeight: isMultiDay ? 760 : 800,
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: isMultiDay ? "-0.01em" : "0",
                      }}
                    >
                      {dayRangeDisplay}
                    </span>
                    <span
                      style={{
                        fontSize: isMultiDay ? "8px" : "10px",
                        color: "#bfd0e4",
                        fontWeight: isMultiDay ? 650 : 700,
                        letterSpacing: isMultiDay ? "0.01em" : "0.03em",
                      }}
                    >
                      {dowRangeDisplay}
                    </span>
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", minHeight: "18px", alignContent: "flex-start" }}>
                    {visibleBadges.map((badge) => (
                      <button
                        key={badge.label}
                        type="button"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (badge.label === "HOT WEEK") {
                            const hotWeekStart = matchedHotWeek?.weekStart || weekStart;
                            const hotWeekEnd =
                              matchedHotWeek?.weekEnd ||
                              new Date(new Date(`${hotWeekStart}T00:00:00Z`).getTime() + 6 * 86400000)
                                .toISOString()
                                .slice(0, 10);
                            setFilters((prev) => ({ ...prev, dateRange: "all" }));
                            setFromDate(hotWeekStart);
                            setToDate(hotWeekEnd);
                            scrollToResultsAnchor();
                            return;
                          }
                          if (badge.label === "CLUSTER") {
                            const clusterStart =
                              matchedCluster?.weekStart ||
                              new Date(new Date(`${e.startDate}T00:00:00Z`).getTime() - 2 * 86400000)
                                .toISOString()
                                .slice(0, 10);
                            const clusterEnd =
                              matchedCluster?.weekEnd ||
                              new Date(new Date(`${e.startDate}T00:00:00Z`).getTime() + 2 * 86400000)
                                .toISOString()
                                .slice(0, 10);
                            const clusterCity = matchedCluster?.label || cityLabel;
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: "all",
                              cities: clusterCity ? [clusterCity] : prev.cities,
                            }));
                            setFromDate(clusterStart);
                            setToDate(clusterEnd);
                            scrollToResultsAnchor();
                          }
                        }}
                        title={
                          badge.label === "HOT WEEK"
                            ? "Show all events in this hot week"
                            : badge.label === "CLUSTER"
                              ? "Show all events in this cluster"
                              : undefined
                        }
                        style={{
                          fontSize: "9px",
                          fontWeight: 800,
                          letterSpacing: "0.03em",
                          borderRadius: "999px",
                          padding: "3px 8px",
                          cursor: badge.label === "HOT WEEK" || badge.label === "CLUSTER" ? "pointer" : "default",
                          border:
                            badge.tone === "hot"
                              ? "1px solid rgba(186,127,86,0.58)"
                              : badge.tone === "cluster"
                                ? "1px solid rgba(181,91,111,0.62)"
                                : "1px solid rgba(120,131,154,0.5)",
                          color: badge.tone === "hot" ? "#f2cb97" : badge.tone === "cluster" ? "#ebb7c4" : badge.label === "INVESTOR HEAVY" ? "#c8d7f2" : "#c6d3e3",
                          background: badge.tone === "hot"
                            ? "rgba(151,95,48,0.28)"
                            : badge.tone === "cluster"
                              ? "rgba(142,56,78,0.28)"
                              : /canada/i.test(badge.label)
                                ? "rgba(32,132,126,0.3)"
                                : /west coast/i.test(badge.label)
                                  ? "rgba(144,96,66,0.3)"
                                  : badge.label === "INVESTOR HEAVY"
                                    ? "rgba(79,110,150,0.3)"
                                    : "rgba(76,93,117,0.24)",
                          whiteSpace: "nowrap",
                          outline: "none",
                          textAlign: "left",
                        }}
                      >
                        {badge.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ minWidth: 0, minHeight: 0, display: "grid", gridTemplateRows: "auto auto auto auto auto", rowGap: "0px", alignContent: "center", paddingTop: "5px" }}>
                  <div
                    className="event-title"
                    style={{
                      fontSize: "22px",
                      lineHeight: 1.08,
                      color: "#fbfeff",
                      textShadow: "0 0 10px rgba(255,255,255,0.06)",
                      fontWeight: 720,
                      letterSpacing: "-0.004em",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {e.title}
                  </div>

                  <div style={{ marginTop: "6px", color: "rgba(196,214,235,0.86)", fontSize: "18px", fontWeight: 620, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cityLabel || "Location TBD"}</div>
                  <div style={{ marginTop: "6px", color: "rgba(172,192,214,0.74)", fontSize: "15px", fontWeight: 520, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.organizer || "Organizer TBD"}</div>
                  {venueLine ? <div style={{ marginTop: "2px", color: "rgba(142,166,192,0.56)", fontSize: "13px", fontWeight: 450, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>⌂ {venueLine}</div> : null}
                  <div style={{ marginTop: "10px", color: "rgba(147,169,194,0.84)", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 650, borderTop: "1px solid rgba(96,112,130,0.055)", paddingTop: "4px", display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: "2px", height: "12px", borderRadius: "2px", background: signalAccent }} />
                    <span>Market Signal</span>
                  </div>
                  <div style={{ color: isHot ? "#dcc4ac" : "#dde8f6", fontSize: "15px", lineHeight: 1.12, fontWeight: 650, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <span style={{ display: "inline-flex", gap: "2px", flex: "0 0 auto" }}>
                      <span style={{ width: "3px", height: "10px", borderRadius: "2px", background: signalAccent, animation: "cccSignalPulse 1.8s ease-in-out infinite" }} />
                      <span style={{ width: "3px", height: "14px", borderRadius: "2px", background: signalAccent, opacity: 0.9, animation: "cccSignalPulse 1.8s ease-in-out .15s infinite" }} />
                      <span style={{ width: "3px", height: "11px", borderRadius: "2px", background: signalAccent, opacity: 0.82, animation: "cccSignalPulse 1.8s ease-in-out .3s infinite" }} />
                    </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{marketSignal}</span>
                  </div>
                  {hasRelatedMarketView ? (
                    <button
                      type="button"
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        setFilters((prev) => ({
                          ...prev,
                          dateRange: "all",
                          cities: sameCityWeekCount > 0 && cityLabel ? [cityLabel] : prev.cities,
                          sectorThemes: sameCityWeekCount > 0 ? prev.sectorThemes : themeTags[0] ? [themeTags[0]] : prev.sectorThemes,
                        }));
                        setFromDate(weekStart);
                        setToDate(new Date(new Date(`${weekStart}T00:00:00Z`).getTime() + 6 * 86400000).toISOString().slice(0, 10));
                        scrollToResultsAnchor();
                      }}
                      style={{
                        marginTop: "6px",
                        fontSize: "13px",
                        color: "rgba(166,190,218,0.86)",
                        lineHeight: 1.1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      title="View related events in market view"
                    >
                      {relatedLine} <span style={{ opacity: 0.85 }}>→</span>
                    </button>
                  ) : (
                    <div style={{ marginTop: "6px", fontSize: "13px", color: "rgba(156,178,202,0.72)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{relatedLine}</div>
                  )}
                </div>

                <div
                  style={{
                    borderLeft: "1px solid rgba(108,128,152,0.007)",
                    paddingLeft: "12px",
                    display: "grid",
                    gridTemplateRows: "auto 1fr auto",
                    alignContent: "stretch",
                    minHeight: 0,
                    overflow: "visible",
                    background:
                      hoveredCardId === e.id
                        ? "radial-gradient(95% 80% at 52% 52%, rgba(82,126,180,0.08) 0%, rgba(82,126,180,0.01) 58%, rgba(82,126,180,0) 80%), linear-gradient(180deg, rgba(30,47,66,0.05) 0%, rgba(15,29,44,0.1) 72%, rgba(11,23,36,0.14) 100%)"
                        : "radial-gradient(95% 80% at 52% 52%, rgba(82,126,180,0.05) 0%, rgba(82,126,180,0.008) 58%, rgba(82,126,180,0) 80%), linear-gradient(180deg, rgba(30,47,66,0.03) 0%, rgba(15,29,44,0.08) 72%, rgba(11,23,36,0.12) 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(98,120,145,0.03)",
                    boxShadow:
                      hoveredCardId === e.id
                        ? "inset 0 1px 0 rgba(255,255,255,0.045), 0 2px 10px rgba(4,12,22,0.12)"
                        : "inset 0 1px 0 rgba(255,255,255,0.025)",
                    transition: "all 180ms ease-out",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "nowrap" }}>
                      <a
                        href={externalUrl || "#"}
                        target={externalUrl ? "_blank" : undefined}
                        rel={externalUrl ? "noopener noreferrer" : undefined}
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                        style={{ height: "34px", borderRadius: "8px", border: hoveredCardId === e.id ? "1px solid rgba(148,176,208,0.38)" : "1px solid rgba(108,130,154,0.2)", background: "rgba(13,27,42,0.62)", color: "#c3d1e2", padding: "0 14px", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "13px", fontWeight: 600, gap: "6px", whiteSpace: "nowrap", minWidth: "108px", opacity: externalUrl ? 1 : 0.65, transition: "all 180ms ease-out", boxShadow: hoveredCardId === e.id ? "0 0 0 1px rgba(122,149,179,0.14)" : "none" }}
                      >
                        Event Link <span style={{ fontSize: "11px", opacity: 0.76 }}>↗</span>
                      </a>
                      <AddToCalendar compact showIcon title={e.title} startDate={e.startDate} endDate={e.endDate} location={[e.venue, e.city, e.state, e.country].filter(Boolean).join(", ")} url={externalUrl} description={buildDescription(e)} />
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        aria-label={selected ? "Deselect event" : "Select event"}
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSelect(e.id);
                        }}
                        style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "999px",
                        border: selected ? "1px solid rgba(134,165,198,0.74)" : "1px solid rgba(120,138,160,0.5)",
                        background: selected ? "rgba(61,92,126,0.95)" : "rgba(12,30,48,0.66)",
                        color: "#ffffff",
                        fontSize: "10px",
                        boxShadow: selected ? "0 0 0 2px rgba(104,140,180,0.2), 0 0 9px rgba(76,118,168,0.3)" : hoveredCardId === e.id ? "0 0 8px rgba(78,114,156,0.24)" : "0 0 5px rgba(58,88,124,0.18)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                      {selected ? "•" : ""}
                    </button>
                  </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: "auto auto",
                      rowGap: "6px",
                      minHeight: "24px",
                      marginTop: "8px",
                      marginBottom: "0",
                      alignSelf: "start",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div style={{ width: "100%", fontSize: "10px", lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.08em", color: "#92acc8", fontWeight: 700 }}>
                      Conference Classification
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "flex-start", alignContent: "flex-start" }}>
                      {classificationDisplayTags.map((t) => (
                        <span
                          key={`cc-${t}`}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.transform = "translateY(-1px)";
                            event.currentTarget.style.filter = "brightness(1.08)";
                            event.currentTarget.style.borderColor = "rgba(138,157,182,0.4)";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.transform = "translateY(0)";
                            event.currentTarget.style.filter = "none";
                            event.currentTarget.style.borderColor = "rgba(111,128,149,0.32)";
                          }}
                          style={{
                            fontSize: "11px",
                            borderRadius: "999px",
                            border:
                              /institutional investors/i.test(t)
                                ? "1px solid rgba(108,145,192,0.38)"
                                : /mixed participation/i.test(t)
                                  ? "1px solid rgba(122,122,165,0.38)"
                                  : /family offices/i.test(t)
                                    ? "1px solid rgba(156,128,96,0.38)"
                                    : /private markets/i.test(t)
                                      ? "1px solid rgba(111,112,178,0.38)"
                                      : /industry networking/i.test(t)
                                        ? "1px solid rgba(88,146,146,0.36)"
                                        : /health/i.test(t)
                                          ? "1px solid rgba(96,158,122,0.36)"
                                          : "1px solid rgba(114,130,150,0.34)",
                            background:
                              classificationDisplayTags.indexOf(t) < 2
                                ? /institutional investors/i.test(t)
                                  ? "rgba(68,106,155,0.24)"
                                  : /mixed participation/i.test(t)
                                    ? "rgba(96,96,140,0.24)"
                                    : /family offices/i.test(t)
                                      ? "rgba(132,102,72,0.24)"
                                      : /private markets/i.test(t)
                                        ? "rgba(90,90,148,0.24)"
                                        : /industry networking/i.test(t)
                                          ? "rgba(64,122,122,0.24)"
                                          : /health/i.test(t)
                                            ? "rgba(72,132,98,0.24)"
                                            : "rgba(72,98,126,0.22)"
                                : "rgba(18,32,48,0.18)",
                            color: classificationDisplayTags.indexOf(t) < 2 ? "#c4d6eb" : "#adc2d9",
                            padding: "4px 10px",
                            fontWeight: 460,
                            whiteSpace: "nowrap",
                            transition: "all 150ms ease",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid rgba(96,165,250,0.24)", borderRadius: "12px", background: "linear-gradient(180deg, rgba(10,32,56,0.95) 0%, rgba(8,28,49,0.95) 100%)", padding: "14px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: "16px" }}>
          <div>
            <div style={{ color: "#f8fbff", fontSize: "24px", fontWeight: 800 }}>Turn This View Into a Live Calendar Feed</div>
            <div style={{ color: "#bfdbfe", marginTop: "6px", lineHeight: 1.5 }}>Subscribe to this filtered view and get automatically updated events in your calendar.</div>
            <div style={{ color: "#93c5fd", marginTop: "8px", fontSize: "13px" }}>• Instant delivery to your calendar • Updates as new matching events are added • Works with Google, Apple, and Outlook</div>
            <a href="/api/ics" style={{ marginTop: "10px", display: "inline-flex", height: "40px", alignItems: "center", padding: "0 14px", borderRadius: "10px", background: "#2563eb", color: "#fff", textDecoration: "none", fontWeight: 800 }}>Create Live Calendar Feed</a>
          </div>
          <div style={{ border: "1px solid rgba(147,197,253,0.2)", borderRadius: "10px", padding: "10px", color: "#dbeafe", background: "rgba(8,30,53,0.82)" }}>
            <div style={{ fontSize: "12px", color: "#93c5fd", fontWeight: 800, marginBottom: "8px" }}>Works with</div>
            <div style={{ display: "grid", gap: "6px" }}>
              <div>Google Calendar</div>
              <div>Apple Calendar</div>
              <div>Outlook</div>
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid rgba(96,165,250,0.15)", borderRadius: "14px", padding: "14px", background: "linear-gradient(180deg, rgba(8,30,53,0.82) 0%, rgba(7,26,47,0.8) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <div style={{ color: "#f8fbff", fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>Events Nearby</div>
          <div style={{ marginBottom: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
            <label style={{ color: "#93c5fd", fontSize: "12px" }}>Selected city</label>
            <select value={nearbyCity} onChange={(e) => setNearbyCity(e.target.value)} style={{ height: "32px", borderRadius: "8px", background: "#08223d", color: "#e2e8f0", border: "1px solid rgba(96,165,250,0.3)", padding: "0 8px" }}>
              {cities.slice(0, 40).map((c, index) => <option key={`${c}-${index}`} value={c.split(",")[0]?.trim() || c}>{c}</option>)}
            </select>
          </div>
              <AreaEventsPanel
                events={filteredEvents}
                initialCity={nearbyCity}
                _initialState="default"
              />
        </div>
      </section>

      <aside
        className="right-rail ccc-scroll-rail ccc-scroll-rail-right"
        style={{ position: "relative", alignSelf: "stretch", display: "grid", gap: "10px", minWidth: 0, minHeight: 0, width: "100%", maxWidth: "280px", height: PANEL_HEIGHT, maxHeight: PANEL_HEIGHT, overflow: "hidden", paddingRight: "1px" }}
      >
        <div style={{ height: "100%", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", paddingRight: "2px", paddingBottom: "8px", display: "grid", gap: "8px" }}>
          <div style={{ border: "1px solid rgba(96,165,250,0.13)", borderRadius: "11px", background: "rgba(8,30,53,0.76)", padding: "9px" }}>
            <div style={{ color: "#f8fbff", fontWeight: 800, marginBottom: "4px" }}>Sync With Your Calendar</div>
            <div style={{ color: "#97b8d9", fontSize: "12px", marginBottom: "8px", lineHeight: 1.42 }}>
              Turn the current market view into a live calendar workflow.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px", marginBottom: "2px" }}>
              {[
                { label: "Google", brand: "google" as const, platform: "Google Calendar" as const },
                { label: "Apple", brand: "apple" as const, platform: "Apple Calendar" as const },
                { label: "Outlook", brand: "outlook" as const, platform: "Outlook" as const },
              ].map((platform) => (
                <button
                  key={platform.label}
                  type="button"
                  onClick={() => openCalendarSync(platform.platform)}
                  style={{
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid rgba(147,197,253,0.24)",
                    background: "rgba(147,197,253,0.08)",
                    color: "#dbeafe",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    fontWeight: 650,
                  }}
                >
                  <span style={{ width: "16px", height: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <CalendarBrandGlyph brand={platform.brand} />
                  </span>
                  {platform.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(147,197,253,0.12)", margin: "0 4px" }} />

          <div style={{ border: "1px solid rgba(96,165,250,0.13)", borderRadius: "11px", background: "rgba(8,30,53,0.76)", padding: "9px" }}>
            <button
              type="button"
              onClick={() => setSavedConferenceListsOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                border: "none",
                background: "transparent",
                color: "#f8fbff",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
                marginBottom: "6px",
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>Saved Conference Lists</div>
                <div style={{ color: "#97b8d9", fontSize: "11px", marginTop: "2px" }}>
                  {savedLists.length} saved {savedLists.length === 1 ? "list" : "lists"}
                </div>
              </div>
              <span style={{ color: "#93c5fd", fontSize: "14px", lineHeight: 1 }}>{savedConferenceListsOpen ? "▾" : "▸"}</span>
            </button>
            {savedConferenceListsOpen ? (
              savedLists.length ? (
                <div style={{ display: "grid", gap: "6px", maxHeight: "220px", overflowY: "auto", paddingRight: "2px" }}>
                  {savedLists.map((list) => (
                    <div key={list.id} style={{ border: "1px solid rgba(147,197,253,0.18)", borderRadius: "8px", padding: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "2px" }}>
                        <div style={{ color: "#dbeafe", fontSize: "11px", fontWeight: 700 }}>{list.name}</div>
                        <button
                          type="button"
                          onClick={() => deleteSavedList(list.id)}
                          style={{
                            height: "20px",
                            minWidth: "20px",
                            borderRadius: "6px",
                            border: "1px solid rgba(190,102,122,0.36)",
                            background: "rgba(118,46,63,0.18)",
                            color: "#f2b7c4",
                            fontSize: "11px",
                            lineHeight: 1,
                            cursor: "pointer",
                            padding: "0 6px",
                          }}
                          title="Delete saved list"
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ color: "#93c5fd", fontSize: "10px", marginBottom: "5px" }}>
                        {list.eventIds.length} events • Updated {new Date(list.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <button
                        type="button"
                        onClick={() => loadSavedList(list.id)}
                        style={{
                          height: "24px",
                          borderRadius: "6px",
                          border: "1px solid rgba(147,197,253,0.28)",
                          background: "rgba(147,197,253,0.08)",
                          color: "#dbeafe",
                          fontSize: "10px",
                          cursor: "pointer",
                          padding: "0 10px",
                        }}
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#93c5fd", fontSize: "11px", lineHeight: 1.45 }}>
                  No saved conference lists yet.
                  <br />
                  Select events, then use Save Selected.
                </div>
              )
            ) : null}
          </div>
          <div style={{ height: "1px", background: "rgba(147,197,253,0.12)", margin: "0 4px" }} />

          <div style={{ border: "1px solid rgba(96,165,250,0.13)", borderRadius: "11px", background: "rgba(8,30,53,0.76)", padding: "9px" }}>
            <button
              type="button"
              onClick={() => setSavedMarketViewsOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                border: "none",
                background: "transparent",
                color: "#f8fbff",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
                marginBottom: "6px",
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>Saved Market Views</div>
                <div style={{ color: "#97b8d9", fontSize: "11px", marginTop: "2px" }}>
                  {savedViews.length} saved {savedViews.length === 1 ? "view" : "views"}
                </div>
              </div>
              <span style={{ color: "#93c5fd", fontSize: "14px", lineHeight: 1 }}>{savedMarketViewsOpen ? "▾" : "▸"}</span>
            </button>
            {savedMarketViewsOpen ? (
              <>
                <button
                  type="button"
                  onClick={saveCurrentView}
                  style={{ height: "30px", width: "100%", borderRadius: "8px", border: "1px solid rgba(147,197,253,0.34)", background: "rgba(37,99,235,0.18)", color: "#dbeafe", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginBottom: "7px" }}
                >
                  Save Market View
                </button>
                {savedViews.length ? (
                  <div style={{ display: "grid", gap: "6px", maxHeight: "220px", overflowY: "auto", paddingRight: "2px" }}>
                    {savedViews.map((v) => (
                      <div key={v.id} style={{ border: "1px solid rgba(147,197,253,0.18)", borderRadius: "8px", padding: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "2px" }}>
                          <div style={{ color: "#dbeafe", fontSize: "11px", fontWeight: 700 }}>{v.name}</div>
                          <button
                            type="button"
                            onClick={() => deleteSavedView(v.id)}
                            style={{
                              height: "20px",
                              minWidth: "20px",
                              borderRadius: "6px",
                              border: "1px solid rgba(190,102,122,0.36)",
                              background: "rgba(118,46,63,0.18)",
                              color: "#f2b7c4",
                              fontSize: "11px",
                              lineHeight: 1,
                              cursor: "pointer",
                              padding: "0 6px",
                            }}
                            title="Delete saved view"
                          >
                            ✕
                          </button>
                        </div>
                        <div style={{ color: "#93c5fd", fontSize: "10px", marginBottom: "5px" }}>
                          {(v.eventCount ?? 0)} events • Updated {new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <button type="button" onClick={() => loadSavedView(v.id)} style={{ height: "24px", borderRadius: "6px", border: "1px solid rgba(147,197,253,0.28)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10px", cursor: "pointer", padding: "0 10px" }}>Load</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#93c5fd", fontSize: "11px", lineHeight: 1.45 }}>
                    <div style={{ color: "#dbeafe", marginBottom: "3px" }}>No saved views yet.</div>
                    Save your current filters to return to this market view later.
                  </div>
                )}
              </>
            ) : null}
          </div>
          <div style={{ height: "1px", background: "rgba(147,197,253,0.12)", margin: "0 4px" }} />

          <div style={{ border: "1px solid rgba(96,165,250,0.13)", borderRadius: "11px", background: "rgba(8,30,53,0.76)", padding: "9px" }}>
            <div style={{ color: "#f8fbff", fontWeight: 800, marginBottom: "8px" }}>Quick Feeds</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "5px" }}>
              <button type="button" onClick={() => applyHeroQuickView("investor-conferences")} style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.24)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10px", cursor: "pointer" }}>Investor Conferences</button>
              <button type="button" onClick={() => applyHeroQuickView("healthcare-conferences")} style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.24)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10px", cursor: "pointer" }}>Healthcare Events</button>
              <button type="button" onClick={() => applyHeroQuickView("private-markets")} style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.24)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10px", cursor: "pointer" }}>Private Markets</button>
              <button type="button" onClick={() => applyHeroQuickView("canada-events")} style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.24)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10px", cursor: "pointer" }}>Canada Events</button>
              <button type="button" onClick={() => applyHeroQuickView("upcoming-30-days")} style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.24)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10px", cursor: "pointer" }}>Upcoming 30 Days</button>
              <button
                type="button"
                onClick={() => {
                  const firstHot = viewConcentrationCards.find((item) => item.type === "hotweek") || allConcentrationCards.find((item) => item.type === "hotweek");
                  if (firstHot) {
                    applyConcentrationItem(firstHot);
                    recordActivity("feed", "Quick feed: hot weeks");
                  }
                }}
                style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.24)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10px", cursor: "pointer" }}
              >
                Hot Weeks
              </button>
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(147,197,253,0.12)", margin: "0 4px" }} />

          <div style={{ border: "1px solid rgba(96,165,250,0.13)", borderRadius: "11px", background: "rgba(8,30,53,0.76)", padding: "9px" }}>
            <div style={{ color: "#f8fbff", fontWeight: 800, marginBottom: "8px" }}>Workspace Status</div>
            <div style={{ display: "grid", gap: "5px", color: "#bfd6f0", fontSize: "10px" }}>
              <div><span style={{ color: "#4ade80" }}>●</span> Conference index: Live</div>
              <div><span style={{ color: "#60a5fa" }}>●</span> Calendar feed: Ready</div>
              <div><span style={{ color: "#60a5fa" }}>●</span> Saved views: Local browser</div>
              <div><span style={{ color: "#93c5fd" }}>●</span> Last refresh: Recently</div>
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(147,197,253,0.12)", margin: "0 4px" }} />

          <div style={{ border: "1px solid rgba(96,165,250,0.13)", borderRadius: "11px", background: "rgba(8,30,53,0.76)", padding: "9px" }}>
            <div style={{ color: "#f8fbff", fontWeight: 800, marginBottom: "8px" }}>Recent Activity</div>
            {recentActivity.length ? (
              <div style={{ display: "grid", gap: "5px" }}>
                {recentActivity.slice(0, 8).map((item) => (
                  <div key={item.id} style={{ border: "1px solid rgba(147,197,253,0.14)", borderRadius: "7px", padding: "5px" }}>
                    <div style={{ color: "#dbeafe", fontSize: "10px", fontWeight: 700 }}>{item.label}</div>
                    <div style={{ color: "#93c5fd", fontSize: "10px" }}>{item.detail || "Workspace activity"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#93c5fd", fontSize: "11px", lineHeight: 1.45 }}>
                Activity will appear as you explore the market calendar.
              </div>
            )}
          </div>

        </div>
      </aside>
    </div>
  );
}
