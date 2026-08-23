"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import SharedFilterRail from "../components/platform/SharedFilterRail";
import FilterMatchingControl, { type FilterMatchMode } from "../components/platform/FilterMatchingControl";

const quickActions = ["Clear", "Share Selected", "Save Market View", "Save Selected"];

type FilterOptions = {
  cities: string[];
  regions: string[];
  countries: string[];
  states: string[];
  themes: string[];
  publicCompanySectors?: string[];
  conferenceTypes: string[];
  issuers: string[];
  organizers: string[];
  marketFocuses: string[];
};

type AggregateStats = {
  events: number;
  issuerAccess: number;
  investorHeavy: number;
  highestActivityWeek: { label: string; count: number } | null;
  leadingSector: { label: string; count: number } | null;
  quickFeeds: {
    investorConferences: number;
    healthcareConferences: number;
    privateMarkets: number;
    canadaEvents: number;
    upcoming30: number;
    hotWeeks: number;
  };
};

type MarketAnalytics = {
  cityCounts: [string, number][];
  organizerCounts: [string, number][];
  themeCounts: [string, number][];
  focusCounts: [string, number][];
  categoryCounts: [string, number][];
  formatCounts: [string, number][];
  sectorCounts: [string, number][];
  eventCharacterCounts: [string, number][];
  issuerParticipationCounts: [string, number][];
  weekCounts: { weekStart: string; count: number }[];
  weekInsights: Record<string, {
    topAudience: string;
    topFocus: string;
    topIssuerParticipation: string;
    topCity: string;
    topCities: string[];
    investorHeavyCount: number;
    issuerHeavyCount: number;
    typeLabel: string;
    actionLine: string;
  }>;
};

type MarketViewPageData = {
  total: number;
  nextCursor: string | null;
  filterOptions: FilterOptions;
  aggregates: AggregateStats;
  allAggregates: AggregateStats;
  marketAnalytics: MarketAnalytics;
  allMarketAnalytics: MarketAnalytics;
  marketViewIntelligence?: any;
  allMarketViewIntelligence?: any;
};

type FiltersState = {
  dateRange: "next30" | "next60" | "next90" | "all";
  country: string[];
  region: string[];
  state: string[];
  cities: string[];
  sectorThemes: string[];
  publicCompanySectors: string[];
  conferenceType: string[];
  issuerParticipation: string[];
  organizer: string[];
  marketFocus: string[];
};

type MultiFilterKey = Exclude<keyof FiltersState, "dateRange">;

const DEFAULT_FILTERS: FiltersState = {
  dateRange: "all",
  country: [],
  region: [],
  state: [],
  cities: [],
  sectorThemes: [],
  publicCompanySectors: [],
  conferenceType: [],
  issuerParticipation: [],
  organizer: [],
  marketFocus: [],
};

type ForecastMode = "hotWeeks" | "clusters";

const forecastModes: Record<ForecastMode, { label: string; title: string; description: string; icon: string }> = {
  hotWeeks: {
    label: "Hot Weeks",
    title: "Market Signal Forecast: Hot Weeks",
    description: "Weeks where event volume, issuer access, investor attendance, and sector signals concentrate around the same dates.",
    icon: "◷",
  },
  clusters: {
    label: "Cluster Forecast",
    title: "Market Signal Forecast: Cluster Forecast",
    description: "Metro-based planning windows where approved future events overlap by timing, sector, access, or audience signal.",
    icon: "◎",
  },
};

type HotWeek = {
  weekStart: string;
  weekEnd: string;
  label: string;
  count: number;
  focus: string;
  signal: string;
  summary: string;
  detail: string;
  supportingContext: string;
};

type HotWeekEvent = {
  id: string;
  title: string;
  startDate: string;
  city: string;
  state: string;
};

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatWeekLabel(weekStart: string, weekEnd: string) {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(`${weekEnd}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return weekStart;
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = month.format(start);
  const endMonth = month.format(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  return startMonth === endMonth ? `${startMonth} ${startDay}-${endDay}` : `${startMonth} ${startDay}-${endMonth} ${endDay}`;
}

function compactForecastText(value: string, maxLength = 132) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}

function Bar({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "amber" | "indigo" }) {
  return (
    <div className="v3-bar-row">
      <span>{label}</span>
      <div className="v3-bar-track"><div className={`v3-bar-fill ${tone}`} style={{ width: `${value}%` }} /></div>
      <strong>{value}%</strong>
    </div>
  );
}

function OpenLink({ children = "Inspect" }: { children?: ReactNode }) {
  return <span className="v3-link">{children}</span>;
}

function QuickActionIcon({ kind }: { kind: "clear" | "share" | "saveView" | "saveSelected" }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "clear") return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>;
  if (kind === "share") return <svg {...common}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M12 16V3" /><path d="m7 8 5-5 5 5" /></svg>;
  if (kind === "saveView") return <svg {...common}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>;
  return <svg {...common}><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
}

function RightRailSectionIcon({ kind }: { kind: "sync" | "actions" | "lists" | "views" | "status" }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "sync") return <svg {...common}><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>;
  if (kind === "actions") return <svg {...common}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" /></svg>;
  if (kind === "lists") return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 1.5 1.5L7.5 5" /><path d="m3.5 12 1.5 1.5L7.5 11" /><path d="m3.5 18 1.5 1.5L7.5 17" /></svg>;
  if (kind === "views") return <svg {...common}><path d="m7 4 5-2 5 2v16l-5-2-5 2Z" /><path d="M12 2v16" /></svg>;
  return <svg {...common}><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>;
}

function FilterSectionIcon({ kind }: { kind: "date" | "location" | "segments" | "participation" | "organizers" }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "date") return <svg {...common} aria-hidden="true"><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
  if (kind === "location") return <svg {...common} aria-hidden="true"><path d="M12 22s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="11" r="2.8" /></svg>;
  if (kind === "segments") return <svg {...common} aria-hidden="true"><path d="M3 3v18h18" /><path d="M7 15v3M12 10v8M17 6v12" /></svg>;
  if (kind === "participation") return <svg {...common} aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="3" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a3 3 0 0 1 0 5.74" /></svg>;
  return <svg {...common} aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1.5" /><rect x="14" y="7" width="7" height="14" rx="1.5" /><path d="M6.5 7h.01M6.5 11h.01M6.5 15h.01M17.5 11h.01M17.5 15h.01" /></svg>;
}

function QuickViewGlyph({
  kind,
  color = "#e6dbff",
}: {
  kind: "city" | "investor" | "health" | "private" | "tech" | "canada" | "next30" | "next60" | "region";
  color?: string;
}) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "city") return <svg {...common} aria-hidden="true"><path d="M12 21s7-4.4 7-10a7 7 0 1 0-14 0c0 5.6 7 10 7 10Z" /><circle cx="12" cy="11" r="2.5" /></svg>;
  if (kind === "investor") return <svg {...common} aria-hidden="true"><path d="M3 21h18M5 21V8l7-4 7 4v13M9 12h.01M15 12h.01M9 16h.01M15 16h.01" /></svg>;
  if (kind === "health") return <svg {...common} aria-hidden="true"><path d="M12 21s-7-4.2-9-9.1A5.8 5.8 0 0 1 12 5a5.8 5.8 0 0 1 9 6.9c-2 4.9-9 9.1-9 9.1Z" /><path d="M12 8v8M8 12h8" /></svg>;
  if (kind === "private") return <svg {...common} aria-hidden="true"><path d="M3 7h18M5 7l1-3h12l1 3M5 7v12h14V7M9 12h6" /></svg>;
  if (kind === "canada") return <svg {...common} aria-hidden="true"><path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z" /><path d="m12 7 1.2 2.4 2.6.3-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.3L12 7Z" /></svg>;
  if (kind === "next60") return <svg {...common} aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18M9 15h6" /></svg>;
  return <svg {...common} aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>;
}

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function pctRows(rows: [string, number][] | undefined, limit = 5) {
  const source = (rows || []).filter(([label, value]) => Boolean(label) && value > 0).slice(0, limit);
  const max = Math.max(...source.map(([, value]) => value), 1);
  return source.map(([label, value]) => ({ label, count: value, pct: Math.max(4, Math.round((value / max) * 100)) }));
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="v3-muted-row" style={{ borderBottom: 0 }}>{children}</div>;
}

function ClusterEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="v3-row" style={{ display: "grid", gap: 6 }}>
      <strong>No qualifying metro planning clusters detected in the current view.</strong>
      <span style={{ color: "#9fb4ca", fontSize: "11px", lineHeight: 1.4 }}>A qualifying cluster requires approved future events in the same metro within an 8-day planning window, with either 3+ distinct events or 2+ events sharing sector, access, investor, or market-focus signals.</span>
      {filtered ? <span style={{ color: "#8fbfff", fontSize: "11px", lineHeight: 1.4 }}>Try Full Market View or broaden filters to see more cluster signals.</span> : null}
    </div>
  );
}

function clusterLabel(clusterType: string) {
  if (clusterType === "Metro Density Cluster") return "Metro Planning Cluster";
  if (clusterType === "Access Cluster") return "Issuer Access Cluster";
  if (clusterType === "Investor Cluster") return "Investor Relevance Cluster";
  if (clusterType === "Deal Cluster") return "Deal-Making Cluster";
  return clusterType;
}

function isDefaultFilters(filters: FiltersState) {
  return (
    filters.dateRange === "all" &&
    filters.country.length === 0 &&
    filters.region.length === 0 &&
    filters.state.length === 0 &&
    filters.cities.length === 0 &&
    filters.sectorThemes.length === 0 &&
    filters.publicCompanySectors.length === 0 &&
    filters.conferenceType.length === 0 &&
    filters.issuerParticipation.length === 0 &&
    filters.organizer.length === 0 &&
    filters.marketFocus.length === 0
  );
}

function appendMany(params: URLSearchParams, key: string, values: string[]) {
  values.forEach((value) => {
    if (value) params.append(key, value);
  });
}

function buildMarketViewRequest(filters: FiltersState, filterMode: FilterMatchMode = "and") {
  const params = new URLSearchParams();
  params.set("limit", "30");
  params.set("dateRange", filters.dateRange);
  params.set("filterMode", filterMode);
  appendMany(params, "country", filters.country);
  appendMany(params, "region", filters.region);
  appendMany(params, "state", filters.state);
  appendMany(params, "city", filters.cities);
  appendMany(params, "sectorTheme", filters.sectorThemes);
  appendMany(params, "publicCompanySector", filters.publicCompanySectors);
  appendMany(params, "conferenceType", filters.conferenceType);
  appendMany(params, "issuerParticipation", filters.issuerParticipation);
  appendMany(params, "organizer", filters.organizer);
  appendMany(params, "marketFocus", filters.marketFocus);
  return params;
}

function optionLabel(count: number, singular: string, plural = `${singular}s`) {
  return count ? `${count} ${count === 1 ? singular : plural} selected` : "";
}

function FilterSelect({
  label,
  emptyLabel,
  values,
  options,
  onToggle,
}: {
  label: string;
  emptyLabel: string;
  values: string[];
  options: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value=""
      onChange={(event) => {
        onToggle(event.target.value);
        event.currentTarget.value = "";
      }}
    >
      <option value="">{values.length ? optionLabel(values.length, label.toLowerCase().replace(/^public company /, "public ")) : emptyLabel}</option>
      {options.map((option, index) => (
        <option key={`${label}-${option}-${index}`} value={option}>
          {values.includes(option) ? `✓ ${option}` : option}
        </option>
      ))}
    </select>
  );
}

function CalendarBrandGlyph({ brand }: { brand: "google" | "apple" | "outlook" }) {
  if (brand === "google") return <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62Z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.82.86-3.06.86-2.35 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18Z" /><path fill="#FBBC05" d="M3.96 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3-2.33Z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3 2.33c.7-2.12 2.69-3.7 5.04-3.7Z" /></svg>;
  if (brand === "apple") return <span style={{ fontSize: "14px", lineHeight: 1, color: "#e2e8f0" }}></span>;
  return <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="none" stroke="#38BDF8" strokeWidth="1.8" /><path d="M3.5 8.5 12 14l8.5-5.5" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function MarketViewClient({ initialPage }: { initialPage: MarketViewPageData }) {
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [filterMode, setFilterMode] = useState<FilterMatchMode>("and");
  const [marketPage, setMarketPage] = useState<MarketViewPageData>(initialPage);
  const [viewScope, setViewScope] = useState<"full" | "filtered">("full");
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
    "Date & Timing": false,
    Location: false,
    "Market Segments": false,
    Participation: false,
    Organizers: false,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [signalTab, setSignalTab] = useState<ForecastMode>("hotWeeks");
  const [selectedHotWeekIndex, setSelectedHotWeekIndex] = useState(0);
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);
  const [hotWeekEvents, setHotWeekEvents] = useState<HotWeekEvent[]>([]);
  const [isLoadingHotWeekEvents, setIsLoadingHotWeekEvents] = useState(false);

  useEffect(() => {
    try {
      const modeFromUrl = new URLSearchParams(window.location.search).get("filterMode");
      const savedMode = localStorage.getItem("ccc_filter_match_mode");
      setFilterMode(modeFromUrl === "or" || (!modeFromUrl && savedMode === "or") ? "or" : "and");
    } catch {
      // Keep the default Match All mode when browser storage is unavailable.
    }
  }, []);

  const updateFilterMode = (nextMode: FilterMatchMode) => {
    setFilterMode(nextMode);
    try {
      localStorage.setItem("ccc_filter_match_mode", nextMode);
    } catch {
      // Browser storage may be unavailable.
    }
  };

  useEffect(() => {
    let active = true;
    const params = buildMarketViewRequest(filters, filterMode);
    setIsFiltering(true);
    fetch(`/api/events?${params.toString()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load Market View filters.");
        return response.json() as Promise<MarketViewPageData>;
      })
      .then((next) => {
        if (!active) return;
        setMarketPage(next);
      })
      .catch(() => {
        if (!active) return;
        setMarketPage(initialPage);
      })
      .finally(() => {
        if (active) setIsFiltering(false);
      });
    return () => {
      active = false;
    };
  }, [filterMode, filters, initialPage]);

  const isHotSignal = signalTab === "hotWeeks";
  const activeForecastMode = forecastModes[signalTab];
  const filterOptions = marketPage.filterOptions || initialPage.filterOptions;
  const hasActiveFilters = !isDefaultFilters(filters);
  const displayPage = viewScope === "filtered" ? marketPage : initialPage;
  const displayAggregates = displayPage.aggregates;
  const displayAnalytics = displayPage.marketAnalytics;
  const displayIntelligence = displayPage.marketViewIntelligence || initialPage.marketViewIntelligence || {};
  const internalIntelligence = displayIntelligence.internalIntelligence || {};
  const intelligenceReadByTitle = new Map(
    ((internalIntelligence.eventReads || []) as any[]).map((read) => [read.title, read])
  );
  const marketWindowReadByWeek = new Map(
    ((internalIntelligence.marketWindowReads || []) as any[]).map((read) => [read.weekStart, read.intelligenceRead])
  );
  const clusterRows = (displayIntelligence.clusterAlerts?.top || displayIntelligence.clusterWeeks?.top || []) as any[];
  const liveClusters = clusterRows.slice(0, 5).map((row) => {
    const eventTitles = (row.events || []).map((event: any) => typeof event === "string" ? event : event?.title).filter(Boolean);
    const cities = row.citiesIncluded || [row.city && row.state ? `${row.city}, ${row.state}` : row.anchorCity].filter(Boolean);
    return {
      comparableRead: eventTitles.map((title: string) => intelligenceReadByTitle.get(title)).find(Boolean),
      metro: row.metroMarket || row.anchorCity || "Unspecified metro",
      events: `${row.eventCount || eventTitles.length || 0} event${(row.eventCount || eventTitles.length || 0) === 1 ? "" : "s"}`,
      type: clusterLabel(row.clusterType || "Metro Planning Cluster"),
      window: row.dateWindow || "",
      signals: (row.sharedSignals || []).join(" · "),
      sector: row.dominantSector || "Not classified",
      focus: row.dominantMarketFocus || "Not classified",
      summary: eventTitles.map((title: string) => intelligenceReadByTitle.get(title)?.comparableRationale).find(Boolean) || row.planningRationale || row.interpretation || `${row.eventCount || eventTitles.length || 0} approved events share timing and location signals.`,
      detail: eventTitles.map((title: string) => intelligenceReadByTitle.get(title)?.whyItMatters).find(Boolean) || row.planningRationale || row.interpretation || "This cluster is derived from approved events with overlapping metro, timing, sector, focus, and access signals.",
      cities: cities.join(" · "),
      eventsIncluded: eventTitles.join(" · "),
      supportingContext: eventTitles.map((title: string) => intelligenceReadByTitle.get(title)?.intelligenceRead).find(Boolean) || row.travelPracticality || row.travelRelationship || row.planningHorizon || "Derived from approved event records.",
    };
  });
  const activeCluster = liveClusters[selectedClusterIndex] ?? liveClusters[0];
  const liveHotWeeks = useMemo<HotWeek[]>(() => {
    return (displayAnalytics.weekCounts || [])
      .filter((row) => row.count > 0)
      .slice()
      .sort((a, b) => b.count - a.count || a.weekStart.localeCompare(b.weekStart))
      .slice(0, 5)
      .map((row) => {
        const weekEnd = addDays(row.weekStart, 6);
        const insight = displayAnalytics.weekInsights?.[row.weekStart];
        const topCity = insight?.topCity && insight.topCity !== "N/A" ? insight.topCity : "the current view";
        const focus = insight?.topFocus || insight?.topAudience || "Classified activity";
        return {
          weekStart: row.weekStart,
          weekEnd,
          label: formatWeekLabel(row.weekStart, weekEnd),
          count: row.count,
          focus,
          signal: insight?.topIssuerParticipation || "Active conference week",
          summary: insight?.actionLine || `${row.count} conference${row.count === 1 ? "" : "s"} are scheduled this week.`,
          detail: `${row.count} conference${row.count === 1 ? " is" : "s are"} scheduled during this week, with activity led by ${topCity}.`,
          supportingContext: marketWindowReadByWeek.get(row.weekStart) || (insight?.topFocus ? `Top market focus: ${insight.topFocus}.` : "This view is based on the current Market View filters."),
        };
      });
  }, [displayAnalytics, internalIntelligence.marketWindowReads]);
  const activeHotWeek = liveHotWeeks[selectedHotWeekIndex] ?? liveHotWeeks[0];

  useEffect(() => {
    if (selectedHotWeekIndex >= liveHotWeeks.length) setSelectedHotWeekIndex(0);
  }, [liveHotWeeks.length, selectedHotWeekIndex]);

  useEffect(() => {
    if (selectedClusterIndex >= liveClusters.length) setSelectedClusterIndex(0);
  }, [liveClusters.length, selectedClusterIndex]);

  useEffect(() => {
    if (!activeHotWeek) {
      setHotWeekEvents([]);
      return;
    }
    let active = true;
    const scopedFilters = viewScope === "filtered" ? filters : DEFAULT_FILTERS;
    const params = buildMarketViewRequest(scopedFilters, filterMode);
    params.set("fromDate", activeHotWeek.weekStart);
    params.set("toDate", activeHotWeek.weekEnd);
    params.set("limit", "4");
    setIsLoadingHotWeekEvents(true);
    fetch(`/api/events?${params.toString()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load hot week events.");
        return response.json() as Promise<{ events?: HotWeekEvent[] }>;
      })
      .then((page) => {
        if (active) setHotWeekEvents(page.events || []);
      })
      .catch(() => {
        if (active) setHotWeekEvents([]);
      })
      .finally(() => {
        if (active) setIsLoadingHotWeekEvents(false);
      });
    return () => {
      active = false;
    };
  }, [activeHotWeek?.weekEnd, activeHotWeek?.weekStart, filterMode, filters, hasActiveFilters, viewScope]);

  const topMetro = displayAnalytics.cityCounts?.[0];
  const topFocus = displayAnalytics.focusCounts?.[0];
  const liveKpis = [
    ["Upcoming Conference Index", formatNumber(displayAggregates.events), "Approved future events"],
    ["Issuer Access", formatNumber(displayAggregates.issuerAccess), "Classified signals"],
    ["Investor-Heavy", formatNumber(displayAggregates.investorHeavy), "Audience signal"],
    ["Peak Week", displayAggregates.highestActivityWeek?.label || "—", displayAggregates.highestActivityWeek ? `${displayAggregates.highestActivityWeek.count} events` : "No dated events"],
    ["Top Metro", topMetro?.[0] || "—", topMetro ? `${topMetro[1]} events` : "No metro signal"],
    ["Top Focus", topFocus?.[0] || displayAggregates.leadingSector?.label || "—", topFocus ? `${topFocus[1]} events` : "No focus signal"],
  ];
  const sectorRows = pctRows(displayAnalytics.sectorCounts || displayAnalytics.themeCounts, 5);
  const focusRows = pctRows(displayAnalytics.focusCounts, 5);
  const characterRows = pctRows(displayAnalytics.eventCharacterCounts, 5);
  const accessRows = pctRows(displayAnalytics.issuerParticipationCounts, 5);
  const mom = displayIntelligence.monthOverMonth || {};
  const notableSignals = [
    mom.readout,
    mom.forwardPipeline?.interpretation,
    mom.signalMixShift?.issuerAccess?.interpretation,
    ...((internalIntelligence.notableSignals || []) as string[]),
  ].filter(Boolean).slice(0, 3);
  const signalChanges = internalIntelligence.signalChanges;
  const accessRead = internalIntelligence.accessRead as string | null | undefined;
  const sectorMomentum = (mom.sectorMomentum || []).filter((row: any) => row.currentCount > 0).slice(0, 5);
  const metroMomentum = (mom.metroMomentum || []).filter((row: any) => row.currentCount > 0).slice(0, 5);
  const organizerMovement = (mom.organizerMomentum || []).filter((row: any) => row.currentCount > 0).slice(0, 5);
  const organizerRows = (displayIntelligence.organizerLeagueTables?.overallVolume || []).slice(0, 6);
  const metroRows = (displayIntelligence.geographyClusters?.topCitiesByTotalEvents || []).slice(0, 6);
  const localSelection = filters.cities[0] || filters.state[0] || filters.region[0] || "";
  const localRows = localSelection
    ? metroRows.filter((row: any) => [row.city, row.state].filter(Boolean).join(", ") === localSelection || row.state === localSelection || filters.region.includes(localSelection)).slice(0, 3)
    : [];
  const quickFeedRows = [
    ["Investor Conferences", String(displayAggregates.quickFeeds.investorConferences), "#3b82f6", "investor", () => setFilters({ ...DEFAULT_FILTERS, conferenceType: filterOptions.conferenceTypes.filter((value) => /investor/i.test(value)).slice(0, 1) })],
    ["Healthcare", String(displayAggregates.quickFeeds.healthcareConferences), "#14b8a6", "health", () => setFilters({ ...DEFAULT_FILTERS, sectorThemes: filterOptions.themes.filter((value) => /health/i.test(value)).slice(0, 1) })],
    ["Private Markets", String(displayAggregates.quickFeeds.privateMarkets), "#7c3aed", "private", () => setFilters({ ...DEFAULT_FILTERS, marketFocus: filterOptions.marketFocuses.filter((value) => /private/i.test(value)).slice(0, 1) })],
    ["Canada Events", String(displayAggregates.quickFeeds.canadaEvents), "#dc2626", "canada", () => setFilters({ ...DEFAULT_FILTERS, country: ["Canada"] })],
    ["Next 30 Days", String(displayAggregates.quickFeeds.upcoming30), "#2563eb", "next30", () => setFilters({ ...DEFAULT_FILTERS, dateRange: "next30" })],
    ["Hot Weeks", String(displayAggregates.quickFeeds.hotWeeks), "#f97316", "next60", () => setFilters({ ...DEFAULT_FILTERS, dateRange: "next60" })],
  ] as const;

  const toggleFilterValue = (key: MultiFilterKey, value: string) => {
    if (!value) return;
    setViewScope("filtered");
    setFilters((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setViewScope("full");
  };

  return (
    <div className="v3-page">
      <style jsx>{`
        .v3-page { height: 100%; overflow: hidden; background: #061421; color: #e6f0fb; font-family: var(--font-body), Arial, sans-serif; }
        .v3-main { overflow: auto; display: grid; gap: 9px; max-width: 1320px; width: 100%; justify-self: center; }
        .v3-brand small, .v3-eyebrow { font-size: 9px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; color: #38bdf8; }
        .v3-brand strong { font-size: 15px; line-height: 1.1; }
        .v3-panel { background: linear-gradient(180deg,rgba(10,27,44,.96),rgba(7,20,34,.96)); border: 1px solid rgba(94,139,184,.28); border-radius: 8px; padding: 12px; box-shadow: 0 18px 40px rgba(0,0,0,.22); }
        .v3-readout { position: relative; overflow: hidden; display: grid; align-items: center; min-height: 252px; padding: 30px 34px; border: 1px solid rgba(213,226,240,.08); border-radius: 22px; background: radial-gradient(circle at 80% 18%,rgba(51,112,160,.26),transparent 36%), linear-gradient(132deg,#030b16 0%,#06182a 43%,#08111f 100%); box-shadow: inset 0 1px 0 rgba(245,250,255,.16), inset 0 -1px 0 rgba(112,146,180,.1), 0 24px 54px rgba(0,0,0,.34), 0 0 48px rgba(144,178,211,.13); }
        .v3-readout:before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 78% 40%,rgba(177,216,245,.24),transparent 3%,transparent 4%), radial-gradient(circle at 88% 20%,rgba(177,216,245,.2),transparent 2.5%,transparent 4%), radial-gradient(circle at 70% 24%,rgba(177,216,245,.18),transparent 2%,transparent 4%), radial-gradient(circle at 91% 55%,rgba(177,216,245,.16),transparent 2.5%,transparent 4%), radial-gradient(circle at 63% 58%,rgba(177,216,245,.14),transparent 2%,transparent 4%), radial-gradient(ellipse at 82% 40%,rgba(103,164,211,.28),transparent 43%), linear-gradient(105deg,rgba(255,255,255,.05),transparent 38%); pointer-events: none; }
        .v3-readout:after { content: ""; position: absolute; inset: 0; opacity: .48; pointer-events: none; background-image: radial-gradient(circle,rgba(207,229,248,.5) 0 1px,transparent 1.5px), linear-gradient(118deg,transparent 0 52%,rgba(166,207,238,.2) 52.2%,transparent 52.8%), linear-gradient(146deg,transparent 0 60%,rgba(166,207,238,.16) 60.2%,transparent 60.8%), linear-gradient(24deg,transparent 0 68%,rgba(166,207,238,.15) 68.2%,transparent 68.8%), radial-gradient(ellipse at 84% 42%,transparent 0 32%,rgba(178,215,241,.22) 32.4%,transparent 33.2%,transparent 42%,rgba(178,215,241,.12) 42.4%,transparent 43.2%); background-size: 36px 36px, 100% 100%, 100% 100%, 100% 100%, 100% 100%; background-position: right center; mask-image: linear-gradient(90deg,transparent 0%,rgba(0,0,0,.08) 36%,rgba(0,0,0,.82) 58%,#000 100%); }
        .v3-readout > * { position: relative; }
        .v3-readout .v3-eyebrow { color: #7dd3fc; font-size: 10px; letter-spacing: .2em; text-shadow: 0 0 18px rgba(56,189,248,.28); }
        .v3-readout h1 { color: #ffffff; font-size: 40px; line-height: .98; font-weight: 950; letter-spacing: 0; text-shadow: 0 18px 32px rgba(0,0,0,.28); }
        h1 { margin: 0; font-size: 29px; line-height: 1.04; letter-spacing: 0; color: #f8fbff; }
        h2 { margin: 0; font-size: 17px; line-height: 1.12; color: #f8fbff; }
        h3 { margin: 0; font-size: 13px; line-height: 1.2; color: #eaf2fb; }
        p { margin: 0; color: #aebfd2; font-size: 12px; line-height: 1.42; }
        .v3-subtitle { max-width: 760px; color: #b8dcff; font-size: 14px; line-height: 1.35; }
        .v3-hero-copy { display: grid; gap: 14px; max-width: 820px; }
        .v3-hero-primary { max-width: 800px; color: #d8ecff; font-size: 17px; line-height: 1.45; font-weight: 700; }
        .v3-hero-body { max-width: 770px; color: #b7c8db; font-size: 13.5px; line-height: 1.68; }
        .v3-metrics { display: grid; gap: 0; border: 1px solid rgba(96,165,250,.2); border-radius: 8px; overflow: hidden; background: rgba(5,15,27,.52); }
        .v3-metric { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 10px; padding: 8px 10px; border-bottom: 1px solid rgba(96,165,250,.14); }
        .v3-metric span { color: #8fb3d4; font-size: 9px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
        .v3-metric strong { color: #f8fbff; font-size: 12px; }
        .v3-metric small { color: #7290ad; font-size: 10px; text-align: right; }
        .v3-kpi-strip { display: grid; grid-template-columns: minmax(120px,1fr) 132px minmax(460px,640px); gap: 10px; align-items: stretch; }
        .v3-kpi-reserve { min-width: 0; }
        .v3-view-toggle { display: grid; grid-template-rows: repeat(2,minmax(0,1fr)); gap: 6px; }
        .v3-view-toggle button { min-height: 42px; border-radius: 9px; border: 1px solid rgba(88,132,180,.26); background: rgba(5,16,29,.92); color: #a9bdd2; font-size: 12px; font-weight: 800; cursor: pointer; }
        .v3-view-toggle button.is-active { background: linear-gradient(180deg,rgba(37,99,235,.95),rgba(29,78,216,.88)); border-color: rgba(147,197,253,.42); color: #f8fbff; box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 0 18px rgba(37,99,235,.22); }
        .v3-kpi-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 0; border-radius: 10px; overflow: hidden; background: linear-gradient(180deg,rgba(8,24,39,.34),rgba(5,17,30,.2)); }
        .v3-kpi { min-height: 40px; padding: 6px 12px; border-radius: 0; border: 0; background: transparent; display: grid; align-content: center; gap: 2px; position: relative; }
        .v3-kpi:not(:nth-child(3n + 1)) { border-left: 1px solid rgba(125,211,252,.32); box-shadow: inset 1px 0 10px rgba(56,189,248,.16); }
        .v3-kpi:nth-child(n + 4) { border-top: 1px solid rgba(125,211,252,.24); box-shadow: inset 0 1px 10px rgba(56,189,248,.12); }
        .v3-kpi:nth-child(n + 4):not(:nth-child(3n + 1)) { box-shadow: inset 1px 0 10px rgba(56,189,248,.16), inset 0 1px 10px rgba(56,189,248,.12); }
        .v3-kpi span { color: var(--kpi-accent,#cbd5e1); font-size: 9px; text-transform: uppercase; letter-spacing: .1em; font-weight: 900; }
        .v3-kpi strong { color: #f7fbff; font-size: 14px; line-height: 1.05; }
        .v3-kpi small { color: #7892ad; font-size: 9.5px; line-height: 1.1; }
        .v3-signal-forecast { position: relative; z-index: 1; overflow: hidden; display: grid; grid-template-rows: auto minmax(0,1fr); height: 620px; min-height: 0; padding: 0; border-radius: 10px; border: 1px solid rgba(121,158,197,.26); background: linear-gradient(180deg,rgba(8,24,40,.98),rgba(5,17,30,.98)); box-shadow: 0 18px 42px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.05); }
        .v3-signal-forecast.hot { border-color: rgba(245,158,11,.4); box-shadow: 0 0 0 1px rgba(245,158,11,.08), 0 18px 42px rgba(0,0,0,.26); }
        .v3-signal-forecast.cluster { border-color: rgba(248,113,113,.46); box-shadow: 0 0 0 1px rgba(248,113,113,.1), 0 18px 42px rgba(0,0,0,.26); }
        .v3-signal-head { padding: 13px 14px; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 14px; align-items: center; border-bottom: 1px solid rgba(125,162,199,.2); }
        .v3-signal-titleline { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .v3-signal-icon { width: 28px; height: 28px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; color: #f8fbff; font-size: 17px; font-weight: 900; }
        .hot .v3-signal-icon { background: rgba(245,158,11,.18); color: #fbbf24; }
        .cluster .v3-signal-icon { background: rgba(220,38,38,.18); color: #fca5a5; }
        .v3-signal-head h2 { font-size: 18px; letter-spacing: .08em; text-transform: uppercase; }
        .v3-signal-head p { margin-top: 7px; max-width: 760px; color: #c4d6e8; font-size: 13px; line-height: 1.42; }
        .v3-signal-tabs { display: inline-flex; gap: 8px; align-items: center; justify-content: flex-end; }
        .v3-signal-tabs button { min-height: 40px; border: 1px solid rgba(125,162,199,.3); border-radius: 10px; padding: 0 16px; background: rgba(9,27,45,.86); color: #d2deea; font-size: 12px; font-weight: 950; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04); }
        .v3-signal-tabs button.is-active.hot { background: linear-gradient(180deg,rgba(245,158,11,.28),rgba(126,62,8,.34)); color: #fff7ed; border-color: rgba(245,158,11,.58); box-shadow: inset 0 0 0 1px rgba(245,158,11,.22), 0 0 20px rgba(245,158,11,.18); }
        .v3-signal-tabs button.is-active.cluster { background: linear-gradient(180deg,rgba(220,38,38,.3),rgba(127,29,29,.36)); color: #fff1f2; border-color: rgba(248,113,113,.62); box-shadow: inset 0 0 0 1px rgba(248,113,113,.18), 0 0 20px rgba(220,38,38,.2); }
        .v3-signal-body { display: grid; grid-template-columns: minmax(320px,.92fr) minmax(360px,1.08fr); gap: 0; min-height: 0; background: rgba(3,12,23,.18); }
        .v3-signal-list { min-height: 0; border-right: 1px solid rgba(125,162,199,.2); overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; }
        .v3-signal-item { width: 100%; border: 0; border-left: 3px solid transparent; border-bottom: 1px solid rgba(117,153,190,.16); background: transparent; color: #dbeafe; text-align: left; padding: 8px 12px 8px 9px; display: grid; grid-template-columns: 30px minmax(0,1fr); gap: 9px; cursor: pointer; }
        .v3-signal-item.is-active { background: linear-gradient(90deg,rgba(245,158,11,.2),rgba(14,165,233,.07)); border-left-color: #f59e0b; box-shadow: inset 0 0 0 1px rgba(245,158,11,.1); }
        .cluster .v3-signal-item.is-active { background: linear-gradient(90deg,rgba(220,38,38,.22),rgba(248,113,113,.08)); border-left-color: #f87171; box-shadow: inset 0 0 0 1px rgba(248,113,113,.12); }
        .v3-rank { width: 24px; height: 24px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; background: rgba(15,35,56,.9); border: 1px solid rgba(125,162,199,.2); color: #dbeafe; }
        .hot .v3-signal-item.is-active .v3-rank { background: rgba(245,158,11,.22); border-color: rgba(245,158,11,.42); color: #fbbf24; }
        .cluster .v3-signal-item.is-active .v3-rank { background: rgba(220,38,38,.24); border-color: rgba(248,113,113,.44); color: #fecaca; }
        .v3-signal-item strong { display: block; overflow: hidden; color: #f8fbff; font-size: 14px; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
        .v3-signal-meta { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 5px; color: #91a8bf; font-size: 10.5px; font-weight: 750; }
        .v3-signal-meta span { border: 1px solid rgba(125,162,199,.18); background: rgba(4,15,27,.48); border-radius: 999px; padding: 2px 6px; }
        .v3-hot-tag { color: #fbbf24 !important; border-color: rgba(245,158,11,.34) !important; background: rgba(245,158,11,.12) !important; }
        .v3-signal-reason { display: -webkit-box; margin-top: 4px; overflow: hidden; color: #aebfd2; font-size: 11.5px; line-height: 1.28; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
        .v3-signal-detail { min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 17px 16px 18px; display: grid; align-content: start; gap: 13px; background: radial-gradient(circle at 92% 12%,rgba(56,189,248,.12),transparent 26%), rgba(4,14,26,.36); }
        .v3-signal-detail h3 { font-size: 13px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; color: #a9c1d8; }
        .v3-detail-summary { display: -webkit-box; overflow: hidden; color: #d9e8f7; font-size: 13.5px; line-height: 1.55; font-weight: 650; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
        .v3-detail-supporting { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        .v3-feature-list { display: grid; gap: 7px; color: #c7d6e7; font-size: 12px; line-height: 1.35; }
        .v3-feature-list div { display: flex; gap: 8px; }
        .v3-feature-list div > span { display: block; color: #94aeca; font-size: 11px; }
        .v3-feature-list div > strong { display: block; color: #e6f0fb; }
        .v3-feature-list div:before { content: ""; width: 5px; height: 5px; margin-top: 6px; border-radius: 999px; background: #38bdf8; flex: 0 0 auto; }
        .hot .v3-feature-list div:before { background: #f59e0b; }
        .cluster .v3-feature-list div:before { background: #ef4444; }
        .v3-detail-label { color: #7dd3fc; font-size: 9.5px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
        .hot .v3-detail-label { color: #fbbf24; }
        .cluster .v3-detail-label { color: #fca5a5; }
        .v3-metric-row { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); border: 1px solid rgba(125,162,199,.18); border-radius: 9px; overflow: hidden; }
        .v3-metric-cell { padding: 8px 9px; display: grid; gap: 3px; background: rgba(7,23,39,.55); border-left: 1px solid rgba(125,162,199,.16); }
        .v3-metric-cell:first-child { border-left: 0; }
        .v3-metric-cell span { color: #91a8bf; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
        .v3-metric-cell strong { color: #f8fbff; font-size: 12px; }
        .v3-primary-stack { display: grid; gap: 9px; }
        .v3-product { overflow: hidden; padding: 0; border-radius: 8px; }
        .v3-product.hot { border-color: rgba(245,158,11,.48); box-shadow: 0 0 0 1px rgba(245,158,11,.12), 0 18px 42px rgba(0,0,0,.24); }
        .v3-product.cluster { border-color: rgba(139,92,246,.5); box-shadow: 0 0 0 1px rgba(34,211,238,.12), 0 18px 42px rgba(0,0,0,.24); }
        .v3-product-head { padding: 11px 13px 10px; display: grid; gap: 5px; border-bottom: 1px solid rgba(125,162,199,.22); }
        .hot .v3-product-head { background: linear-gradient(90deg,rgba(245,158,11,.14),rgba(14,165,233,.08),transparent); }
        .cluster .v3-product-head { background: linear-gradient(90deg,rgba(139,92,246,.16),rgba(34,211,238,.08),transparent); }
        .v3-product-title { display: grid; gap: 4px; }
        .v3-product-title h2 { color: #f8fbff; font-size: 17px; }
        .v3-helper { color: #8fa6bd; font-size: 11px; line-height: 1.35; }
        .v3-marker { display: inline-flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
        .hot .v3-marker { color: #fbbf24; }
        .cluster .v3-marker { color: #c4b5fd; }
        .v3-scroll-list { max-height: 318px; overflow: auto; display: grid; gap: 0; }
        .v3-row { padding: 10px 13px; border-bottom: 1px solid rgba(117,153,190,.18); display: grid; gap: 6px; }
        .v3-row-top { display: grid; grid-template-columns: minmax(190px,.55fr) auto minmax(280px,1fr); gap: 12px; align-items: center; }
        .v3-row-title { font-size: 14px; font-weight: 850; color: #f8fbff; }
        .v3-row-count { color: #b7c6d6; font-size: 11px; font-weight: 850; white-space: nowrap; }
        .v3-chipline { display: flex; flex-wrap: wrap; gap: 6px; color: #9db2c9; font-size: 11px; font-weight: 750; }
        .v3-chipline span { border: 1px solid rgba(121,158,197,.2); background: rgba(11,31,51,.68); border-radius: 5px; padding: 3px 6px; }
        .v3-detail { background: rgba(4,13,24,.44); border-top: 1px solid rgba(113,150,188,.18); padding: 9px 10px; display: grid; gap: 7px; border-radius: 6px; }
        .v3-detail-grid { display: grid; grid-template-columns: 112px minmax(0,1fr); gap: 7px 12px; color: #b4c4d5; font-size: 11px; line-height: 1.35; }
        .v3-detail-grid strong { color: #e4edf7; font-size: 11px; letter-spacing: 0; }
        .v3-link { color: #38bdf8; font-size: 11px; font-weight: 850; white-space: nowrap; }
        .v3-inspect { display: grid; gap: 7px; }
        .v3-inspect summary { width: fit-content; color: #38bdf8; font-size: 11px; font-weight: 850; cursor: pointer; list-style: none; }
        .v3-inspect summary::-webkit-details-marker { display: none; }
        .v3-support { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-top: 18px; }
        .v3-support-card { background: linear-gradient(180deg,rgba(9,27,45,.94),rgba(6,19,34,.94)); border: 1px solid rgba(121,158,197,.22); border-radius: 10px; padding: 13px; display: grid; gap: 8px; box-shadow: 0 10px 24px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04); }
        .v3-muted-row { padding: 7px 0; border-bottom: 1px solid rgba(121,158,197,.16); font-size: 12px; color: #b5c8dc; }
        .v3-analytics { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; }
        .v3-data-card { background: linear-gradient(180deg,rgba(9,27,45,.94),rgba(6,19,34,.94)); border: 1px solid rgba(121,158,197,.22); border-radius: 10px; padding: 13px; display: grid; gap: 10px; }
        .v3-bar-row { display: grid; grid-template-columns: minmax(110px,.85fr) minmax(0,1fr) 38px; gap: 10px; align-items: center; font-size: 12px; color: #c0d1e4; }
        .v3-bar-track { height: 8px; border-radius: 999px; background: rgba(14,39,63,.9); overflow: hidden; }
        .v3-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#2563eb,#0ea5e9); }
        .v3-bar-fill.amber { background: #b7791f; }
        .v3-bar-fill.indigo { background: #4f46a5; }
        .v3-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .v3-tabs span { padding: 6px 9px; border-radius: 999px; background: rgba(9,27,45,.92); border: 1px solid rgba(121,158,197,.18); color: #aebfd2; font-size: 11px; font-weight: 800; }
        .v3-tabs span:first-child { background: rgba(37,99,235,.72); color: #fff; border-color: rgba(147,197,253,.32); }
        table { width: 100%; border-collapse: collapse; background: rgba(7,22,37,.92); border: 1px solid rgba(121,158,197,.22); border-radius: 14px; overflow: hidden; }
        th { text-align: left; padding: 12px 10px; color: #91a8bf; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; background: rgba(10,31,50,.96); border-bottom: 1px solid rgba(121,158,197,.18); }
        td { padding: 12px 10px; color: #dbeafe; font-size: 13px; border-bottom: 1px solid rgba(121,158,197,.14); }
        .v3-metro-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }
        .v3-metro-card { background: linear-gradient(180deg,rgba(9,27,45,.94),rgba(6,19,34,.94)); border: 1px solid rgba(121,158,197,.22); border-radius: 10px; padding: 13px; display: grid; gap: 5px; }
        .v3-watch { display: grid; grid-template-columns: minmax(240px,.35fr) minmax(0,1fr); gap: 14px; }
        select { height: 36px; border-radius: 10px; border: 1px solid rgba(121,158,197,.28); background: rgba(5,16,29,.94); color: #dbeafe; padding: 0 10px; font-weight: 800; }
        .v3-info { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border-radius: 999px; background: #f6f8fb; border: 1px solid #cbd8e6; color: #41546d; font-size: 10px; font-weight: 900; cursor: help; }
        .v3-tooltip { position: absolute; z-index: 10; right: 0; bottom: calc(100% + 8px); width: 260px; border-radius: 10px; background: #102136; color: #fff; padding: 10px; font-size: 12px; line-height: 1.35; box-shadow: 0 16px 32px rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity 120ms ease; }
        .v3-info:hover .v3-tooltip, .v3-info:focus .v3-tooltip { opacity: 1; }
        @media (max-width: 1180px) { .v3-page { overflow: auto; } .v3-main { overflow: visible; } .v3-readout, .v3-primary-row, .v3-kpi-strip, .v3-support, .v3-analytics, .v3-watch { grid-template-columns: 1fr; } .v3-signal-forecast { height: auto; } .v3-signal-body { grid-template-columns: 1fr; } .v3-signal-list { max-height: 360px; border-right: 0; border-bottom: 1px solid rgba(125,162,199,.2); } .v3-signal-detail { max-height: none; overflow: visible; } }
        @media (max-width: 760px) { h1 { font-size: 31px; } .v3-metro-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="workspace-shell" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 290px) minmax(0, 1fr) minmax(300px, 320px)", gridTemplateRows: "minmax(0, 1fr)", gap: "18px", alignItems: "stretch", width: "100%", height: "calc(100vh - 126px)", maxWidth: "100%", minWidth: 0, minHeight: 0, overflow: "hidden", justifyContent: "center" }}>
        <aside
          className="ccc-scroll-rail ccc-scroll-rail-left"
          style={{ position: "relative", alignSelf: "stretch", display: "grid", gap: "8px", minWidth: 0, minHeight: 0, width: "100%", maxWidth: "280px", height: "calc(100vh - 126px)", maxHeight: "calc(100vh - 126px)", overflow: "hidden", paddingRight: "2px" }}
        >
          <div style={{ height: "100%", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", paddingRight: "4px", paddingBottom: "6px" }}>
            <SharedFilterRail
              filters={filters}
              filterOptions={filterOptions}
              openSections={{
                dateTiming: openFilters["Date & Timing"],
                location: openFilters.Location,
                marketSegments: openFilters["Market Segments"],
                participation: openFilters.Participation,
                organizers: openFilters.Organizers,
              }}
              onToggleSection={(section) => {
                const labels = { dateTiming: "Date & Timing", location: "Location", marketSegments: "Market Segments", participation: "Participation", organizers: "Organizers" } as const;
                const label = labels[section];
                setOpenFilters((current) => ({ ...current, [label]: !current[label] }));
              }}
              onDateRangeChange={(dateRange) => { setViewScope("filtered"); setFilters((current) => ({ ...current, dateRange })); }}
              onToggleFilter={toggleFilterValue}
              onClear={clearFilters}
              filterMatchingControl={<FilterMatchingControl value={filterMode} onChange={updateFilterMode} minimal />}
              quickFeeds={quickFeedRows.map(([title, count, color, icon, onClick]) => ({ key: title, title, count, color, icon, onClick }))}
            />
          </div>
        </aside>

        <main className="v3-main">
          <section className="v3-panel v3-readout">
            <div className="v3-hero-copy">
              <div className="v3-eyebrow">Market View Intelligence</div>
              <h1>Capital Markets Conference Intelligence</h1>
              <p className="v3-hero-primary">A forward-looking view of where issuer access, investor concentration, sector activity, and market attention are building across the conference landscape.</p>
              <p className="v3-hero-body">Capital Conference Calendar transforms conference records into market-intelligence signals for investor relations, business development, bankers, and capital markets teams. Instead of only showing what events exist, Market View helps surface where attention is concentrating, where activity is clustering, and where the strongest market signals are emerging.</p>
            </div>
          </section>

          <section className="v3-kpi-strip" aria-label="Market View KPI strip">
            <div className="v3-kpi-reserve" aria-hidden="true" />
            <div className="v3-view-toggle" aria-label="Market view scope">
              <button type="button" className={viewScope === "full" ? "is-active" : ""} onClick={() => setViewScope("full")}>Full Market View</button>
              <button type="button" className={viewScope === "filtered" ? "is-active" : ""} onClick={() => setViewScope("filtered")}>Current Filter View</button>
            </div>
            <div className="v3-kpi-grid">
              {liveKpis.map(([label, value, note], index) => (
                <div
                  className="v3-kpi"
                  key={label}
                  style={{ "--kpi-accent": ["#f8fafc", "#67e8f9", "#5eead4", "#fbbf24", "#60a5fa", "#a78bfa"][index] } as CSSProperties}
                >
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </div>
              ))}
            </div>
            {isFiltering ? <div style={{ color: "#8fb3df", fontSize: "11px", fontWeight: 800, gridColumn: "2 / -1" }}>Updating filtered Market View…</div> : null}
          </section>

          <section className={`v3-signal-forecast ${isHotSignal ? "hot" : "cluster"}`}>
            <div className="v3-signal-head">
              <div>
                <div className="v3-signal-titleline">
                  <span className="v3-signal-icon">{activeForecastMode.icon}</span>
                  <h2>{activeForecastMode.title}</h2>
                </div>
                <p>{activeForecastMode.description}</p>
              </div>
              <div className="v3-signal-tabs" aria-label="Market Signal Forecast tabs">
                {(Object.entries(forecastModes) as [ForecastMode, (typeof forecastModes)[ForecastMode]][]).map(([mode, config]) => (
                  <button
                    type="button"
                    key={mode}
                    className={signalTab === mode ? `is-active ${mode === "hotWeeks" ? "hot" : "cluster"}` : ""}
                    onClick={() => setSignalTab(mode)}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="v3-signal-body">
              <div className="v3-signal-list">
                {isHotSignal
                  ? liveHotWeeks.map((row, index) => (
                    <button type="button" className={`v3-signal-item ${index === selectedHotWeekIndex ? "is-active" : ""}`} key={row.weekStart} onClick={() => setSelectedHotWeekIndex(index)}>
                        <span className="v3-rank">{index + 1}</span>
                        <span>
                          <strong>{row.label}</strong>
                        <span className="v3-signal-meta"><span>{row.count} event{row.count === 1 ? "" : "s"}</span><span className={index === selectedHotWeekIndex ? "v3-hot-tag" : ""}>{index === 0 ? "HOT" : row.focus}</span></span>
                        <span className="v3-signal-reason">{compactForecastText(row.summary)}</span>
                      </span>
                    </button>
                  ))
                  : liveClusters.length ? liveClusters.map((row, index) => (
                    <button type="button" className={`v3-signal-item ${index === selectedClusterIndex ? "is-active" : ""}`} key={row.metro} onClick={() => setSelectedClusterIndex(index)}>
                        <span className="v3-rank">{index + 1}</span>
                        <span>
                          <strong>{row.metro}</strong>
                          <span className="v3-signal-meta"><span>{row.events}</span><span>{row.type}</span><span>{row.window}</span></span>
                        <span className="v3-signal-reason">{compactForecastText(row.summary)}</span>
                      </span>
                    </button>
                  )) : <ClusterEmptyState filtered={viewScope === "filtered" && hasActiveFilters} />}
              </div>

              <div className="v3-signal-detail">
                <div>
                  <h3>{isHotSignal ? "Why this week matters" : "Why this cluster matters"}</h3>
                </div>
                <p className="v3-detail-summary">{isHotSignal ? activeHotWeek?.detail || "No dated events are available for this week." : activeCluster?.detail || "No qualifying metro planning clusters detected in the current view."}</p>

                {!isHotSignal && activeCluster ? (
                  <div>
                    <div className="v3-detail-label">Cities Included</div>
                    <p>{activeCluster.cities ?? activeCluster.metro}</p>
                  </div>
                ) : null}

                <div>
                  <div className="v3-detail-label">{isHotSignal ? "Hot Week Events" : "Featured Events"}</div>
                  <div className="v3-feature-list">
                    {isHotSignal ? (
                      isLoadingHotWeekEvents ? <div>Loading events…</div> : hotWeekEvents.length ? hotWeekEvents.map((event) => (
                        <div key={event.id}>
                          <strong>{event.title}</strong>
                          <span>{event.startDate}{event.city ? ` · ${event.city}${event.state ? `, ${event.state}` : ""}` : ""}</span>
                        </div>
                      )) : <div>No events are available for this week.</div>
                    ) : activeCluster ? (
                      (activeCluster.eventsIncluded ?? "").split(" · ").filter(Boolean).slice(0, 5).map((event: string) => <div key={event}>{event}</div>)
                    ) : <ClusterEmptyState filtered={viewScope === "filtered" && hasActiveFilters} />}
                  </div>
                  {isHotSignal && activeHotWeek ? (
                    <a className="v3-link" href={`/discovery?startDate=${activeHotWeek.weekStart}&endDate=${activeHotWeek.weekEnd}`}>
                      See all events →
                    </a>
                  ) : null}
                </div>

                {!isHotSignal && activeCluster ? (
                  <div>
                    <div className="v3-detail-label">Key signals</div>
                    {(() => {
                      const signals = (activeCluster.signals ?? "").split(" · ").filter(Boolean);
                      return <div className="v3-chipline">{signals.slice(0, 3).map((signal: string) => <span key={signal}>{signal}</span>)}{signals.length > 3 ? <span>+{signals.length - 3} more</span> : null}</div>;
                    })()}
                  </div>
                ) : null}

                <div className="v3-metric-row">
                  {(isHotSignal
                    ? [
                      ["Events", String(activeHotWeek?.count || 0)],
                      ["Focus", activeHotWeek?.focus || "Not classified"],
                      ["Access Signal", activeHotWeek?.signal || "Not classified"],
                      ["Top City", displayAnalytics.weekInsights?.[activeHotWeek?.weekStart || ""]?.topCity || "Not available"],
                    ]
                    : [
                      ["Events", activeCluster?.events || "0 events"],
                      ["Sector", activeCluster?.sector || "Not classified"],
                      ["Focus", activeCluster?.focus || "Not classified"],
                      ["Window", activeCluster?.window || "Not available"],
                    ]
                  ).map(([label, value]) => <div className="v3-metric-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}
                </div>

                <div>
                  <div className="v3-detail-label">{isHotSignal ? "Supporting Context" : "Comparable rationale"}</div>
                  <p className="v3-detail-supporting">{isHotSignal ? activeHotWeek?.supportingContext || "This view is based on the current Market View filters." : activeCluster?.supportingContext || "Derived only when approved events share enough cluster signals."}</p>
                </div>

                {!isHotSignal ? <p style={{ color: "#8fa8c3", fontSize: "10px", lineHeight: 1.4 }}>Cluster priority reflects event density, shared signals, access relevance, investor relevance, and timing proximity. It is a planning-priority signal, not a quality ranking.</p> : null}

                {!isHotSignal && activeCluster ? <OpenLink>View all clusters →</OpenLink> : null}
              </div>
            </div>
          </section>

          <section className="v3-support">
            <div className="v3-support-card">
              <div className="v3-eyebrow">Notable Signals</div>
              <h3>Current Readouts</h3>
              {notableSignals.length ? notableSignals.map((signal: string) => <div className="v3-muted-row" key={signal}>{signal}</div>) : <EmptyState>Not enough approved event data to calculate notable movement yet.</EmptyState>}
            </div>
            <div className="v3-support-card">
              <div className="v3-eyebrow">Signal Changes</div>
              <h3>Database Movement</h3>
              {signalChanges ? <>
                <div className="v3-muted-row">{signalChanges.addedInLast30Days} added in the last 30 days</div>
                <div className="v3-muted-row">{signalChanges.updatedInLast30Days} updated in the last 30 days</div>
                {signalChanges.latestActivityDate ? <div className="v3-muted-row">Latest database movement: {signalChanges.latestActivityDate}</div> : null}
              </> : <EmptyState>No Created or Last Modified values are available for this view yet.</EmptyState>}
            </div>
            <div className="v3-support-card">
              <div className="v3-eyebrow">Access Signal Mix</div>
              <h3>Classified Access</h3>
              {accessRows.length ? accessRows.slice(0, 4).map((row) => <div className="v3-muted-row" key={row.label}>{row.label}: {row.count} approved events</div>) : <EmptyState>Issuer Participation is required to calculate access signal mix.</EmptyState>}
              {accessRead ? <p style={{ marginTop: 8 }}>{accessRead}</p> : null}
            </div>
          </section>

          <section className="v3-panel">
            <div style={{ display: "grid", gap: 6, marginBottom: 14 }}><div className="v3-eyebrow">Data / Analytics</div><h2>Signal Breakdowns</h2></div>
            <div className="v3-analytics">
              <div className="v3-data-card"><h3>Sector Breakdown</h3>{sectorRows.length ? sectorRows.map((row) => <Bar key={row.label} label={row.label} value={row.pct} />) : <EmptyState>Sector / Themes or Public Company Sector is required to calculate this signal.</EmptyState>}</div>
              <div className="v3-data-card"><h3>Market Focus Mix</h3>{focusRows.length ? focusRows.map((row) => <Bar key={row.label} label={row.label} value={row.pct} />) : <EmptyState>Market Focus is required to calculate this signal.</EmptyState>}</div>
              <div className="v3-data-card"><h3>Event Character Mix</h3>{characterRows.length ? characterRows.map((row) => <Bar key={row.label} label={row.label} value={row.pct} tone="indigo" />) : <EmptyState>Event Character is required to calculate this signal.</EmptyState>}</div>
              <div className="v3-data-card"><h3>Access / Audience Signal Mix</h3>{accessRows.length ? accessRows.map((row) => <Bar key={row.label} label={row.label} value={row.pct} />) : <EmptyState>Issuer Participation is required to calculate this signal.</EmptyState>}</div>
            </div>
          </section>

          <section className="v3-support">
            <div className="v3-support-card">
              <div className="v3-eyebrow">Sector Momentum</div>
              <h3>Change in Tracked Conference Activity</h3>
              {sectorMomentum.length ? sectorMomentum.map((row: any) => <div className="v3-muted-row" key={row.sector}>{row.sector}: {row.currentCount} current vs {row.priorCount} prior ({row.change >= 0 ? "+" : ""}{row.change})</div>) : <EmptyState>Not enough prior-period data to calculate sector momentum yet.</EmptyState>}
            </div>
            <div className="v3-support-card">
              <div className="v3-eyebrow">Metro Momentum</div>
              <h3>Metro Movement</h3>
              {metroMomentum.length ? metroMomentum.map((row: any) => <div className="v3-muted-row" key={row.metroMarket}>{row.metroMarket}: {row.currentCount} current vs {row.priorCount} prior · {row.topSector || "No sector signal"}</div>) : <EmptyState>Not enough prior-period city data to calculate metro momentum yet.</EmptyState>}
            </div>
            <div className="v3-support-card">
              <div className="v3-eyebrow">Organizer Movement</div>
              <h3>Organizer Activity</h3>
              {organizerMovement.length ? organizerMovement.map((row: any) => <div className="v3-muted-row" key={row.organizer}>{row.organizer}: {row.currentCount} current vs {row.priorCount} prior · {row.topSector || "No sector signal"}</div>) : <EmptyState>Not enough prior-period organizer data to calculate organizer movement yet.</EmptyState>}
            </div>
          </section>

          <section className="v3-panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end", marginBottom: 14, flexWrap: "wrap" }}><div><div className="v3-eyebrow">Organizer League Table</div><h2>Organizer Supply</h2></div><div className="v3-tabs">{["Overall Supply", "Issuer Access", "Investor Relevant", "Structured Access", "Deal / BD"].map((tab) => <span key={tab}>{tab}</span>)}</div></div>
            {organizerRows.length ? <table><thead><tr>{["Rank", "Organizer", "Events", "Access Signals", "Top Metro", "Next Event"].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{organizerRows.map((row: any) => <tr key={row.organizer}><td>{row.rank}</td><td>{row.organizer}</td><td>{row.totalEvents}</td><td>{row.issuerAccessEvents}</td><td>{row.nextEventCity || "N/A"}</td><td>{row.nextEventTitle || "N/A"}</td></tr>)}</tbody></table> : <EmptyState>Organizer is required to calculate organizer supply.</EmptyState>}
          </section>

          <section className="v3-panel">
            <div style={{ display: "grid", gap: 6, marginBottom: 14 }}><div className="v3-eyebrow">Geography / Metro</div><h2>Metro Analytics</h2></div>
            {metroRows.length ? <div className="v3-metro-grid">{metroRows.map((row: any) => <div className="v3-metro-card" key={`${row.city}-${row.state}`}><h3>{[row.city, row.state].filter(Boolean).join(", ")}</h3><strong>{row.totalEvents} events</strong><span>{row.topSector || "No sector signal"}</span><span>{row.topMarketFocus || "No focus signal"}</span></div>)}</div> : <EmptyState>City, state, and region are required to calculate metro analytics.</EmptyState>}
          </section>

          <section className="v3-panel v3-watch">
            <div style={{ display: "grid", gap: 8 }}><div className="v3-eyebrow">Local Market View</div><h2>Region / Metro Signals</h2><p>Uses selected region, state, or metro filters from approved event records.</p></div>
            <div className="v3-analytics" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>{localSelection ? (localRows.length ? localRows.map((row: any) => <div className="v3-data-card" key={`${row.city}-${row.state}`}><h3>{[row.city, row.state].filter(Boolean).join(", ")}</h3><div className="v3-muted-row">{row.totalEvents} approved events</div><div className="v3-muted-row">{row.issuerAccessEvents} issuer-access signals</div><div className="v3-muted-row">{row.nextEvent?.title || "No upcoming event title available"}</div></div>) : <div className="v3-data-card" style={{ gridColumn: "1 / -1" }}>No approved events match the selected local market view.</div>) : <div className="v3-data-card" style={{ gridColumn: "1 / -1" }}>Select a region, state, or metro to view local conference signals.</div>}</div>
          </section>
        </main>

        <aside
          className="right-rail ccc-scroll-rail ccc-scroll-rail-right"
          style={{ position: "relative", alignSelf: "stretch", display: "grid", gap: "10px", minWidth: 0, minHeight: 0, width: "100%", maxWidth: "320px", height: "calc(100vh - 126px)", maxHeight: "calc(100vh - 126px)", overflow: "hidden", paddingRight: "1px" }}
        >
          <div style={{ width: "100%", height: "100%", maxHeight: "100%", overflow: "hidden" }}>
            <div style={{ height: "100%", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", padding: "10px 16px 16px", display: "grid", gap: "4px" }}>
              <div style={{ marginBottom: 2, textAlign: "center", display: "grid", justifyItems: "center" }}>
                <div style={{ color: "#dbeafe", fontWeight: 900, fontSize: "20px", lineHeight: 1.05, marginBottom: "6px" }}>Control Panel</div>
                <div style={{ color: "#9db4d3", fontSize: "13px", lineHeight: 1.35, maxWidth: "230px", width: "100%", textAlign: "left", justifySelf: "stretch" }}>Export, save, sync, and manage this market view.</div>
              </div>

              <div
                style={{
                  padding: 0,
                  overflow: "visible",
                  position: "sticky",
                  top: 0,
                  zIndex: 8,
                  background: "linear-gradient(180deg, rgba(13,35,62,0.98) 0%, rgba(8,25,46,0.96) 100%)",
                  border: "1px solid rgba(88, 145, 230, 0.34)",
                  borderRadius: "10px",
                  boxShadow: "0 0 0 1px rgba(70,120,220,0.12), 0 12px 24px rgba(0,0,0,0.18)",
                }}
              >
                <div style={{ width: "100%", minHeight: "42px", padding: "0 14px", color: "#dbeafe", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", display: "inline-flex", alignItems: "center", gap: "9px", textTransform: "uppercase" }}>
                    <span style={{ width: "18px", height: "18px", color: "#8fc2ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><RightRailSectionIcon kind="sync" /></span>
                    SYNC CALENDAR
                  </span>
                </div>
                <div style={{ padding: "0 14px 14px" }}>
                  <div style={{ color: "#c6d7ee", fontSize: 13, marginBottom: 12, lineHeight: 1.4 }}>Turn this market view into a live calendar workflow.</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginBottom: "2px" }}>
                    {[
                      { label: "Google", brand: "google" as const },
                      { label: "Apple", brand: "apple" as const },
                      { label: "Outlook", brand: "outlook" as const },
                    ].map((platform) => (
                      <button
                        type="button"
                        key={platform.label}
                        style={{ height: "36px", borderRadius: "10px", border: platform.label === "Outlook" ? "1px solid rgba(86, 180, 220, 0.34)" : "1px solid rgba(105, 153, 205, 0.28)", background: platform.label === "Apple" ? "rgba(8, 24, 43, 0.92)" : "rgba(11, 32, 56, 0.82)", color: "#dbeafe", fontSize: "12.5px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: 800 }}
                      >
                        <span style={{ width: "16px", height: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <CalendarBrandGlyph brand={platform.brand} />
                        </span>
                        {platform.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: 0, overflow: "visible", background: "transparent", border: "none", boxShadow: "none", borderRadius: 0 }}>
                <div style={{ width: "100%", height: "40px", padding: "0 4px", color: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", display: "inline-flex", alignItems: "center", gap: "9px", textTransform: "uppercase" }}>
                    <span style={{ width: "18px", height: "18px", color: "#9ec5ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><RightRailSectionIcon kind="actions" /></span>
                    QUICK ACTIONS
                  </span>
                  <span style={{ fontSize: "12px", color: "#8fb3df", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>0 selected</span>
                </div>
                <div style={{ display: "grid", gap: 8, padding: "0 4px 8px" }}>
                  {quickActions.map((action, index) => (
                    <button
                      type="button"
                      key={action}
                      style={{ height: "38px", borderRadius: "10px", border: "1px solid rgba(92,136,184,0.28)", background: "rgba(17,38,67,0.9)", color: "#e7f2ff", fontSize: "13px", fontWeight: 800, cursor: "pointer", boxShadow: "0 0 10px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)", transition: "all 140ms ease", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px 0 12px" }}
                    >
                      <span>{action}</span>
                      <span style={{ opacity: 0.95, display: "inline-flex", alignItems: "center" }}>
                        <span style={{ color: ["#9fc3ff", "#8fd0ff", "#7ad6c8", "#ffbf66"][index] }}>
                          <QuickActionIcon kind={["clear", "share", "saveView", "saveSelected"][index] as "clear" | "share" | "saveView" | "saveSelected"} />
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {([
                ["Saved Lists", "lists" as const],
                ["Saved Views", "views" as const],
              ] as const).map(([section, icon]) => (
                <div key={section} style={{ width: "100%", minHeight: "48px", padding: 0, overflow: "visible", border: "1px solid rgba(205,220,239,0.18)", borderRadius: "10px", background: "linear-gradient(180deg, rgba(12,34,60,0.42), rgba(7,24,44,0.32))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 8px rgba(205,220,239,0.06)" }}>
                  <button type="button" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", border: "none", background: "transparent", color: "#dbeafe", cursor: "pointer", padding: "0 14px", textAlign: "left", height: "48px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f1f7ff" }}>
                      <span style={{ width: "18px", height: "18px", color: "#9ec5ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><RightRailSectionIcon kind={icon} /></span>
                      {section}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#9fc3e7", fontSize: 12, fontWeight: 700 }}>0 saved</span>
                      <span style={{ color: "#9fb6d4", fontSize: 14, lineHeight: 1 }}>▸</span>
                    </span>
                  </button>
                </div>
              ))}

              <div style={{ marginTop: "auto", padding: "18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                <a className="right-rail-utility-pill" href="/subscribe">Subscribe</a>
                <a className="right-rail-utility-pill" href="/legal">Legal</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
