"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const metroStorageKey = "marketViewV3.primaryMetro";

const filterRows = ["Date & Timing", "Location", "Market Segments", "Participation", "Organizers"];
const quickFeeds = [
  ["Investor Conferences", "115", "#3b82f6", "investor"],
  ["Healthcare", "0", "#14b8a6", "health"],
  ["Private Markets", "154", "#7c3aed", "private"],
  ["Canada Events", "33", "#dc2626", "canada"],
  ["Next 30 Days", "37", "#2563eb", "next30"],
  ["Hot Weeks", "22", "#f97316", "next60"],
];

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
  focusCounts: [string, number][];
};

type MarketViewPageData = {
  total: number;
  nextCursor: string | null;
  filterOptions: FilterOptions;
  aggregates: AggregateStats;
  allAggregates: AggregateStats;
  marketAnalytics: MarketAnalytics;
  allMarketAnalytics: MarketAnalytics;
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
    description: "Metro, timing, sector, focus, and access signals that suggest concentrated conference activity, not just raw city volume.",
    icon: "◎",
  },
};

const hotWeeks = [
  {
    week: "Sep 28-Oct 4, 2025",
    events: "143 events",
    theme: "Healthcare",
    focus: "Institutional Investors",
    signal: "18 issuer-access signals",
    summary: "High investor overlap and sector breadth across major metros.",
    detail: "Concentrated investor attendance across Healthcare, Tech, and Industrials with multiple flagship events drawing senior allocators and corporate access teams.",
    eventsIncluded: "J.P. Morgan Healthcare Conference · LSEG Tech Summit · BofA Industrials Conference · Needham Growth Conference",
    supportingContext: "Issuer access and investor concentration are the lead signals. Meeting-day context is secondary.",
  },
  { week: "Oct 12-Oct 18, 2025", events: "89 events", theme: "Financial Services", focus: "Private Markets", signal: "12 investor-relevant signals", summary: "Capital formation and fund strategy activity rises together.", detail: "Private-markets and financial-services programming compresses into a tighter forward window with investor relevance and banker-facing signal overlap.", eventsIncluded: "Private Markets Forum · Capital Formation Summit · Financial Services Investor Day", supportingContext: "Capital formation and investor concentration are the lead signals. Travel timing is not the primary readout." },
  { week: "Nov 9-Nov 15, 2025", events: "76 events", theme: "Technology", focus: "Growth Equity", signal: "10 issuer-access signals", summary: "Public-company and private-growth signals overlap.", detail: "Technology, growth equity, and public-company programming align in a visible forward window with stronger sector-intelligence and issuer-access signals.", eventsIncluded: "Growth Equity Summit · Software Investor Forum · Public Company Tech Forum", supportingContext: "Sector breadth and issuer access are the lead signals. Meeting-day context is secondary." },
  { week: "Oct 26-Nov 1, 2025", events: "68 events", theme: "Real Estate", focus: "Sponsor Visibility", signal: "9 deal/BD signals", summary: "Real estate and infrastructure forums compress into one window.", detail: "Real estate, infrastructure, and sponsor-visible events appear in the same market window, creating a stronger BD and banker-relevance signal.", eventsIncluded: "Real Estate Capital Forum · Infrastructure Finance Summit · Sponsor Visibility Forum", supportingContext: "Sponsor visibility and relationship density are the lead signals. Travel planning is supporting context only." },
  { week: "Nov 16-Nov 22, 2025", events: "61 events", theme: "Energy", focus: "Industrials", signal: "8 banker-relevant signals", summary: "Energy transition and industrial access signals cluster late in the month.", detail: "Energy transition and industrials programming builds late-month market attention with banker relevance and sector-intelligence overlap.", eventsIncluded: "Energy Transition Forum · Industrials Investor Summit · Infrastructure Access Day", supportingContext: "Banker relevance and sector intelligence are the lead signals. Meeting-day context is secondary." },
];

const clusters = [
  {
    metro: "New York, NY",
    events: "97 events",
    type: "Healthcare issuer-access cluster",
    window: "Sep 28-Oct 4, 2025",
    signals: "Healthcare · Institutional Investors · Issuer Access",
    summary: "Multiple healthcare and investor-access events align across the metro.",
    detail: "Events occur in the same metro and week and share Healthcare, Institutional Investor, and Issuer Access signals.",
    cities: "New York · Jersey City · Stamford",
    eventsIncluded: "J.P. Morgan Healthcare Conference · Barclays Healthcare · TD Cowen Healthcare Innovation Summit",
    supportingContext: "Potential private-meeting days may exist between related events, but meeting-day context is secondary to the cluster signal.",
  },
  { metro: "Boston, MA", events: "22 events", type: "Innovation Cluster", window: "Oct 12-Oct 18", signals: "Biotech · Growth Companies · Investor-Heavy", summary: "Biotech and growth-company forums align with investor-heavy programming.", detail: "Biotech, growth-company, and investor-heavy programming align around the Boston/Cambridge market, creating a stronger sector-intelligence cluster than simple event count.", cities: "Boston · Cambridge", eventsIncluded: "Biotech Growth Forum · Healthcare Innovation Summit · Growth Company Investor Day", supportingContext: "Investor concentration and sector intelligence are the lead signals. Meeting-day context is secondary." },
  { metro: "San Francisco, CA", events: "19 events", type: "Tech & AI Cluster", window: "Oct 13-Oct 17", signals: "AI / Software · Sponsor Visibility · Investor Relevance", summary: "Software, AI, and growth equity activity concentrates.", detail: "Software, AI, and growth-equity events share timing and market focus across the Bay Area, increasing investor relevance and sponsor visibility.", cities: "San Francisco · Palo Alto · San Jose", eventsIncluded: "AI Software Summit · Growth Equity Forum · Technology Investor Conference", supportingContext: "Investor relevance and sponsor visibility are the lead signals. Travel timing is supporting context only." },
  { metro: "Chicago, IL", events: "15 events", type: "Industrials Cluster", window: "Oct 26-Nov 1", signals: "Industrials · Infrastructure · Banker Relevance", summary: "Industrial and infrastructure meetings compress into one market window.", detail: "Industrial and infrastructure programming shares timing, category, and banker relevance, creating a clearer capital-markets cluster.", cities: "Chicago · Rosemont", eventsIncluded: "Industrials Investor Summit · Infrastructure Finance Forum · Manufacturing Outlook Conference", supportingContext: "Banker relevance and market coverage are the lead signals. Meeting-day context is secondary." },
  { metro: "Dallas-Fort Worth", events: "12 events", type: "Deal / BD Cluster", window: "Nov 16-Nov 20", signals: "Private Markets · Sponsor Visibility · BD Coverage", summary: "Sponsor, advisor, and private-markets activity shows a shared commercial reason to watch.", detail: "Private-markets and sponsor-visible programming shares timing and audience signals across Dallas-Fort Worth, producing a stronger BD opportunity cluster.", cities: "Dallas · Fort Worth · Plano", eventsIncluded: "Private Markets Forum · Sponsor BD Summit · Advisor Coverage Day", supportingContext: "Sponsor visibility and BD opportunity are the lead signals. Meeting-day context is secondary." },
];

const sectors = [["Healthcare", 42], ["Financial Services", 31], ["Technology", 28], ["Real Estate", 23], ["Energy Transition", 18]];
const focusMix = [["Institutional Investors", 40], ["Public Company CEOs", 20], ["Private Equity", 12], ["Credit / Fixed Income", 8]];
const characterMix = [["Meeting-Driven", 42], ["Presentation-Heavy", 24], ["Deal / Partnering", 15], ["Networking", 11]];
const accessMix = [["Issuer Access", 55], ["Investor Relevance", 48], ["Structured Access", 22], ["Sponsor / BD", 18]];

const organizers = [
  ["1", "Organizer Alpha", "18", "12", "Healthcare", "New York Metro", "Healthcare Investor Forum"],
  ["2", "Organizer Beta", "14", "9", "Financial Services", "Boston / Cambridge", "Institutional Investor Conference"],
  ["3", "Organizer Gamma", "12", "7", "Real Estate", "Dallas-Fort Worth", "Capital Markets Summit"],
  ["4", "Organizer Delta", "9", "6", "Private Markets", "Miami / South Florida", "Private Markets Forum"],
];

const metros = [
  ["New York Metro", "170 events", "Healthcare", "6 clusters"],
  ["Boston / Cambridge", "48 events", "Healthcare/Biotech", "3 clusters"],
  ["Bay Area", "52 events", "Technology/Growth", "4 clusters"],
];

const metroOptions = ["New York Metro", "Boston / Cambridge", "Bay Area", "Los Angeles / Orange County", "Dallas-Fort Worth", "Miami / South Florida", "Washington DC Metro", "Chicago Metro"];
const metroSchedules: Record<string, Record<string, string[]>> = {
  "New York Metro": { Today: ["Institutional Investor Conference"], "This Week": ["Healthcare Investor Forum"], "Next Two Weeks": ["Capital Markets Summit"] },
  "Boston / Cambridge": { Today: [], "This Week": ["Healthcare Investor Forum"], "Next Two Weeks": ["Institutional Investor Conference"] },
};

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

function buildMarketViewRequest(filters: FiltersState) {
  const params = new URLSearchParams();
  params.set("limit", "30");
  params.set("dateRange", filters.dateRange);
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
  const [primaryMetro, setPrimaryMetro] = useState("");
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(metroStorageKey);
      if (saved) setPrimaryMetro(saved);
    } catch {
      // Browser storage may be unavailable.
    }
  }, []);

  useEffect(() => {
    let active = true;
    const params = buildMarketViewRequest(filters);
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
  }, [filters, initialPage]);

  const metroSchedule = useMemo(() => metroSchedules[primaryMetro] || {
    Today: [],
    "This Week": primaryMetro ? ["Healthcare Investor Forum"] : [],
    "Next Two Weeks": primaryMetro ? ["Private Markets Forum"] : [],
  }, [primaryMetro]);

  const updateMetro = (value: string) => {
    setPrimaryMetro(value);
    try {
      if (value) localStorage.setItem(metroStorageKey, value);
      else localStorage.removeItem(metroStorageKey);
    } catch {
      // Browser storage may be unavailable.
    }
  };

  const activeHotWeek = hotWeeks[selectedHotWeekIndex] ?? hotWeeks[0];
  const activeCluster = clusters[selectedClusterIndex] ?? clusters[0];
  const isHotSignal = signalTab === "hotWeeks";
  const activeForecastMode = forecastModes[signalTab];
  const filterOptions = marketPage.filterOptions || initialPage.filterOptions;
  const hasActiveFilters = !isDefaultFilters(filters);
  const displayPage = viewScope === "filtered" || hasActiveFilters ? marketPage : initialPage;
  const displayAggregates = displayPage.aggregates;
  const displayAnalytics = displayPage.marketAnalytics;
  const topMetro = displayAnalytics.cityCounts?.[0];
  const topFocus = displayAnalytics.focusCounts?.[0];
  const liveKpis = [
    ["Conference Universe", formatNumber(displayAggregates.events), viewScope === "filtered" || hasActiveFilters ? "Current view" : "Approved events"],
    ["Issuer Access", formatNumber(displayAggregates.issuerAccess), "Classified signals"],
    ["Investor-Heavy", formatNumber(displayAggregates.investorHeavy), "Audience signal"],
    ["Peak Week", displayAggregates.highestActivityWeek?.label || "—", displayAggregates.highestActivityWeek ? `${displayAggregates.highestActivityWeek.count} events` : "No dated events"],
    ["Top Metro", topMetro?.[0] || "—", topMetro ? `${topMetro[1]} events` : "No metro signal"],
    ["Top Focus", topFocus?.[0] || displayAggregates.leadingSector?.label || "—", topFocus ? `${topFocus[1]} events` : "No focus signal"],
  ];
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
        .v3-signal-forecast { position: relative; z-index: 1; overflow: visible; display: block; min-height: 760px; padding: 0; border-radius: 10px; border: 1px solid rgba(121,158,197,.26); background: linear-gradient(180deg,rgba(8,24,40,.98),rgba(5,17,30,.98)); box-shadow: 0 18px 42px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.05); }
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
        .v3-signal-body { display: grid; grid-template-columns: minmax(320px,.92fr) minmax(360px,1.08fr); gap: 0; align-items: stretch; min-height: 640px; background: rgba(3,12,23,.18); }
        .v3-signal-list { border-right: 1px solid rgba(125,162,199,.2); overflow: visible; }
        .v3-signal-item { width: 100%; border: 0; border-left: 3px solid transparent; border-bottom: 1px solid rgba(117,153,190,.16); background: transparent; color: #dbeafe; text-align: left; padding: 10px 13px 10px 10px; display: grid; grid-template-columns: 30px minmax(0,1fr); gap: 10px; cursor: pointer; }
        .v3-signal-item.is-active { background: linear-gradient(90deg,rgba(245,158,11,.2),rgba(14,165,233,.07)); border-left-color: #f59e0b; box-shadow: inset 0 0 0 1px rgba(245,158,11,.1); }
        .cluster .v3-signal-item.is-active { background: linear-gradient(90deg,rgba(220,38,38,.22),rgba(248,113,113,.08)); border-left-color: #f87171; box-shadow: inset 0 0 0 1px rgba(248,113,113,.12); }
        .v3-rank { width: 24px; height: 24px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; background: rgba(15,35,56,.9); border: 1px solid rgba(125,162,199,.2); color: #dbeafe; }
        .hot .v3-signal-item.is-active .v3-rank { background: rgba(245,158,11,.22); border-color: rgba(245,158,11,.42); color: #fbbf24; }
        .cluster .v3-signal-item.is-active .v3-rank { background: rgba(220,38,38,.24); border-color: rgba(248,113,113,.44); color: #fecaca; }
        .v3-signal-item strong { color: #f8fbff; font-size: 14px; line-height: 1.15; }
        .v3-signal-meta { margin-top: 5px; display: flex; flex-wrap: wrap; gap: 6px; color: #91a8bf; font-size: 10.5px; font-weight: 750; }
        .v3-signal-meta span { border: 1px solid rgba(125,162,199,.18); background: rgba(4,15,27,.48); border-radius: 999px; padding: 2px 6px; }
        .v3-hot-tag { color: #fbbf24 !important; border-color: rgba(245,158,11,.34) !important; background: rgba(245,158,11,.12) !important; }
        .v3-signal-reason { margin-top: 5px; color: #aebfd2; font-size: 11.5px; line-height: 1.28; }
        .v3-signal-detail { overflow: visible; padding: 17px 16px 18px; display: grid; align-content: start; gap: 13px; background: radial-gradient(circle at 92% 12%,rgba(56,189,248,.12),transparent 26%), rgba(4,14,26,.36); }
        .v3-signal-detail h3 { font-size: 13px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; color: #a9c1d8; }
        .v3-detail-summary { color: #d9e8f7; font-size: 13.5px; line-height: 1.55; font-weight: 650; }
        .v3-feature-list { display: grid; gap: 7px; color: #c7d6e7; font-size: 12px; line-height: 1.35; }
        .v3-feature-list div { display: flex; gap: 8px; }
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
        @media (max-width: 1180px) { .v3-page { overflow: auto; } .v3-main { overflow: visible; } .v3-readout, .v3-primary-row, .v3-kpi-strip, .v3-support, .v3-analytics, .v3-watch { grid-template-columns: 1fr; } }
        @media (max-width: 760px) { h1 { font-size: 31px; } .v3-metro-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="workspace-shell" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 290px) minmax(0, 1fr) minmax(300px, 320px)", gridTemplateRows: "minmax(0, 1fr)", gap: "18px", alignItems: "stretch", width: "100%", height: "calc(100vh - 126px)", maxWidth: "100%", minWidth: 0, minHeight: 0, overflow: "hidden", justifyContent: "center" }}>
        <aside
          className="ccc-scroll-rail ccc-scroll-rail-left"
          style={{ position: "relative", alignSelf: "stretch", display: "grid", gap: "8px", minWidth: 0, minHeight: 0, width: "100%", maxWidth: "280px", height: "calc(100vh - 126px)", maxHeight: "calc(100vh - 126px)", overflow: "hidden", paddingRight: "2px" }}
        >
          <div style={{ height: "100%", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", paddingRight: "4px", paddingBottom: "6px" }}>
            <div style={{ width: "100%", maxWidth: "100%", overflow: "visible", padding: "10px 0" }}>
              <div style={{ marginBottom: "10px" }}>
                <div style={{ fontWeight: 900, color: "#dbeafe", fontSize: "20px", lineHeight: 1.05, marginBottom: "6px", textAlign: "center" }}>Refine Your Market View</div>
                <div style={{ color: "#93aeca", fontSize: "12px", lineHeight: 1.35, marginBottom: "8px" }}>Filter conferences by date, location, theme, and participation.</div>
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    height: "36px",
                    width: "100%",
                    borderRadius: "10px",
                    border: "1px solid rgba(120,160,220,0.2)",
                    background: "rgba(8,26,46,0.42)",
                    color: "#c9dff7",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#9ec2e8" }}>
                    <QuickActionIcon kind="clear" />
                  </span>
                  Clear Filters
                </button>
              </div>

              <div style={{ display: "grid", gap: "6px", minWidth: 0 }}>
                {filterRows.map((row, index) => (
                  <div
                    key={row}
                    style={{
                      border: `1px solid rgba(96,165,250,${0.36 - index * 0.06})`,
                      borderRadius: "10px",
                      background: `linear-gradient(180deg, rgba(12,34,60,${0.52 - index * 0.06}), rgba(7,24,44,${0.4 - index * 0.05}))`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 ${14 - index * 2}px rgba(59,130,246,${0.2 - index * 0.03})`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFilters((current) => ({ ...current, [row]: !current[row] }))}
                      style={{ width: "100%", height: "48px", padding: "0 14px", border: 0, background: "transparent", color: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.07em", display: "inline-flex", alignItems: "center", gap: "9px", color: "#d7e5f5" }}>
                        <span style={{ width: "16px", height: "16px", color: "#b6c6da", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <FilterSectionIcon kind={index === 0 ? "date" : index === 1 ? "location" : index === 2 ? "segments" : index === 3 ? "participation" : "organizers"} />
                        </span>
                        {row.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "14px", color: "#c7dcf6", fontWeight: 800, letterSpacing: "0.01em", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "16px", color: "#dbeafe", lineHeight: 1 }}>{openFilters[row] ? "▾" : "▸"}</span>
                      </span>
                    </button>
                    {openFilters[row] ? (
                      <div style={{ padding: "0 10px 10px", display: "grid", gap: "7px" }}>
                        {row === "Date & Timing" ? (
                          <select value={filters.dateRange} onChange={(event) => { setViewScope("filtered"); setFilters((current) => ({ ...current, dateRange: event.target.value as FiltersState["dateRange"] })); }}>
                            <option value="all">All Dates</option>
                            <option value="next30">Next 30 Days</option>
                            <option value="next60">Next 60 Days</option>
                            <option value="next90">Next 90 Days</option>
                          </select>
                        ) : null}
                        {row === "Location" ? (
                          <>
                            <FilterSelect label="Country" emptyLabel="All Countries" values={filters.country} options={filterOptions.countries} onToggle={(value) => toggleFilterValue("country", value)} />
                            <FilterSelect label="Region" emptyLabel="All Regions" values={filters.region} options={filterOptions.regions} onToggle={(value) => toggleFilterValue("region", value)} />
                            <FilterSelect label="State" emptyLabel="All States" values={filters.state} options={filterOptions.states} onToggle={(value) => toggleFilterValue("state", value)} />
                            <FilterSelect label="City" emptyLabel="All Cities" values={filters.cities} options={filterOptions.cities} onToggle={(value) => toggleFilterValue("cities", value)} />
                          </>
                        ) : null}
                        {row === "Market Segments" ? (
                          <>
                            <FilterSelect label="Sector / Theme" emptyLabel="All Sectors / Themes" values={filters.sectorThemes} options={filterOptions.themes} onToggle={(value) => toggleFilterValue("sectorThemes", value)} />
                            <FilterSelect label="Public Company Sector" emptyLabel="All Public Company Sectors" values={filters.publicCompanySectors} options={filterOptions.publicCompanySectors || []} onToggle={(value) => toggleFilterValue("publicCompanySectors", value)} />
                            <FilterSelect label="Conference Type" emptyLabel="All Types" values={filters.conferenceType} options={filterOptions.conferenceTypes} onToggle={(value) => toggleFilterValue("conferenceType", value)} />
                            <FilterSelect label="Market Focus" emptyLabel="All Market Focus" values={filters.marketFocus} options={filterOptions.marketFocuses} onToggle={(value) => toggleFilterValue("marketFocus", value)} />
                          </>
                        ) : null}
                        {row === "Participation" ? (
                          <FilterSelect label="Issuer Participation" emptyLabel="All Issuer Participation" values={filters.issuerParticipation} options={filterOptions.issuers} onToggle={(value) => toggleFilterValue("issuerParticipation", value)} />
                        ) : null}
                        {row === "Organizers" ? (
                          <FilterSelect label="Organizer" emptyLabel="All Organizers" values={filters.organizer} options={filterOptions.organizers} onToggle={(value) => toggleFilterValue("organizer", value)} />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "6px", padding: "0" }}>
                <div style={{ color: "#f8fbff", fontWeight: 800, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Quick Feeds</div>
                <div style={{ display: "grid", gap: "4px" }}>
                  {quickFeedRows.map(([label, count, color, icon, action]) => (
                    <button key={label} type="button" onClick={action} style={{ height: "38px", borderRadius: "8px", border: "1px solid rgba(147,197,253,0.08)", background: "rgba(147,197,253,0.02)", color: "#dbeafe", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", padding: "0 10px" }}>
                      <span style={{ width: "20px", height: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", color, filter: "brightness(1.2)" }}>
                        <QuickViewGlyph kind={icon as "investor" | "health" | "private" | "canada" | "next30" | "next60"} color={color} />
                      </span>
                      <span style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: "8px", width: "100%", minWidth: 0 }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#dce8f8", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>{label}</span>
                      </span>
                      <strong>({count})</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
              <button type="button" className={viewScope === "full" && !hasActiveFilters ? "is-active" : ""} onClick={() => setViewScope("full")}>Full Market View</button>
              <button type="button" className={viewScope === "filtered" || hasActiveFilters ? "is-active" : ""} onClick={() => setViewScope("filtered")}>Current Filter View</button>
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
                  ? hotWeeks.map((row, index) => (
                    <button type="button" className={`v3-signal-item ${index === selectedHotWeekIndex ? "is-active" : ""}`} key={row.week} onClick={() => setSelectedHotWeekIndex(index)}>
                      <span className="v3-rank">{index + 1}</span>
                      <span>
                        <strong>{row.week}</strong>
                        <span className="v3-signal-meta"><span>{row.events}</span><span className={index === selectedHotWeekIndex ? "v3-hot-tag" : ""}>{index === 0 ? "HOT" : row.focus}</span><span>{row.signal}</span></span>
                        <span className="v3-signal-reason">{row.summary}</span>
                      </span>
                    </button>
                  ))
                  : clusters.map((row, index) => (
                    <button type="button" className={`v3-signal-item ${index === selectedClusterIndex ? "is-active" : ""}`} key={row.metro} onClick={() => setSelectedClusterIndex(index)}>
                      <span className="v3-rank">{index + 1}</span>
                      <span>
                        <strong>{row.metro}</strong>
                        <span className="v3-signal-meta"><span>{row.events}</span><span>{row.type}</span><span>{row.window}</span></span>
                        <span className="v3-signal-reason">{row.summary}</span>
                      </span>
                    </button>
                  ))}
              </div>

              <div className="v3-signal-detail">
                <div>
                  <h3>{isHotSignal ? "Why this week matters" : "Why this cluster matters"}</h3>
                </div>
                <p className="v3-detail-summary">{isHotSignal ? activeHotWeek.detail : activeCluster.detail}</p>

                {!isHotSignal ? (
                  <div>
                    <div className="v3-detail-label">Cities Included</div>
                    <p>{activeCluster.cities ?? activeCluster.metro}</p>
                  </div>
                ) : null}

                <div>
                  <div className="v3-detail-label">Featured Events</div>
                  <div className="v3-feature-list">
                    {(isHotSignal ? activeHotWeek.eventsIncluded ?? "" : activeCluster.eventsIncluded ?? "").split(" · ").filter(Boolean).map((event) => <div key={event}>{event}</div>)}
                  </div>
                </div>

                {!isHotSignal ? (
                  <>
                    <div>
                      <div className="v3-detail-label">Shared signals</div>
                      <div className="v3-feature-list">{(activeCluster.signals ?? "").split(" · ").filter(Boolean).map((signal) => <div key={signal}>{signal}</div>)}</div>
                    </div>
                  </>
                ) : (
                  <div className="v3-metric-row">
                    {[
                      ["Investor Overlap", "78%"],
                      ["Issuer Access", "High"],
                      ["Sector Breadth", "Wide"],
                      ["Relationship Density", "Very High"],
                    ].map(([label, value]) => <div className="v3-metric-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}
                  </div>
                )}

                <div>
                  <div className="v3-detail-label">Supporting Context</div>
                  <p>{isHotSignal ? activeHotWeek.supportingContext : activeCluster.supportingContext}</p>
                </div>

                <OpenLink>{isHotSignal ? "View all hot weeks →" : "View all clusters →"}</OpenLink>
              </div>
            </div>
          </section>

          <section className="v3-support">
            <div className="v3-support-card"><h3>Planning Windows</h3><div className="v3-muted-row">White Space / Lower Conflict: Nov 2-Nov 6</div><div className="v3-muted-row">Meeting-day note: Boston / Cambridge, Sep 22</div><div className="v3-muted-row">Timing note: use only when it changes interpretation</div></div>
            <div className="v3-support-card"><h3>Momentum</h3><p>Tracked September activity is higher than August, with healthcare and institutional-investor focus gaining share in the forward calendar.</p><div className="v3-muted-row">Healthcare +7</div><div className="v3-muted-row">Institutional Investors +5</div></div>
            <div className="v3-support-card"><h3>Dealmaking Context</h3><div className="v3-muted-row">Relationship-density signal: Moderate</div><div className="v3-muted-row">Sponsor / BD opportunity: Strong</div><div className="v3-muted-row">Advisor / banker relevance: Moderate</div></div>
          </section>

          <section className="v3-panel">
            <div style={{ display: "grid", gap: 6, marginBottom: 14 }}><div className="v3-eyebrow">Data / Analytics</div><h2>Signal Breakdowns</h2></div>
            <div className="v3-analytics">
              <div className="v3-data-card"><h3>Sector Breakdown</h3>{sectors.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} />)}</div>
              <div className="v3-data-card"><h3>Market Focus Mix</h3>{focusMix.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} />)}</div>
              <div className="v3-data-card"><h3>Event Character Mix</h3>{characterMix.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} tone="indigo" />)}</div>
              <div className="v3-data-card"><h3>Access / Audience Signal Mix</h3>{accessMix.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} />)}</div>
            </div>
          </section>

          <section className="v3-panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end", marginBottom: 14, flexWrap: "wrap" }}><div><div className="v3-eyebrow">Organizer League Table</div><h2>Organizer Supply</h2></div><div className="v3-tabs">{["Overall Supply", "Issuer Access", "Investor Relevant", "Structured Access", "Deal / BD"].map((tab) => <span key={tab}>{tab}</span>)}</div></div>
            <table><thead><tr>{["Rank", "Organizer", "Events", "Access Signals", "Top Sector", "Top Metro", "Next Event", "Open"].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{organizers.map((row) => <tr key={row[1]}>{[...row, "Open"].map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table>
          </section>

          <section className="v3-panel">
            <div style={{ display: "grid", gap: 6, marginBottom: 14 }}><div className="v3-eyebrow">Geography / Metro</div><h2>Metro Analytics</h2></div>
            <div className="v3-metro-grid">{metros.map(([metro, events, sector, count]) => <div className="v3-metro-card" key={metro}><h3>{metro}</h3><strong>{events}</strong><span>{sector}</span><span>{count}</span></div>)}</div>
          </section>

          <section className="v3-panel v3-watch">
            <div style={{ display: "grid", gap: 8 }}><div className="v3-eyebrow">Metro Watch</div><h2>Primary Work City</h2><p>Near-term placeholder activity around the selected metro.</p><select value={primaryMetro} onChange={(event) => updateMetro(event.target.value)}><option value="">Choose a metro</option>{metroOptions.map((metro) => <option key={metro} value={metro}>{metro}</option>)}</select></div>
            <div className="v3-analytics" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>{primaryMetro ? Object.entries(metroSchedule).map(([group, items]) => <div className="v3-data-card" key={group}><h3>{group}</h3>{items.length ? items.map((item) => <div className="v3-muted-row" key={item}>{item}</div>) : <div className="v3-muted-row">No near-term placeholder activity.</div>}</div>) : <div className="v3-data-card" style={{ gridColumn: "1 / -1" }}>Choose a city to view Today, This Week, and Next Two Weeks.</div>}</div>
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
