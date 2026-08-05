"use client";

import { useEffect, useMemo, useState } from "react";
import AddToCalendar from "../../components/AddToCalendar";
import type {
  PreviewDatasetContext,
  PublicWorkspaceEvent,
} from "../../../lib/airtablePublicDataset";

type DiscoveryPreviewClientProps = {
  events: PublicWorkspaceEvent[];
  initialCity: string;
  initialSearchQuery?: string;
  initialEventId?: string;
  previewContext: PreviewDatasetContext;
};

type ViewMode = "database" | "calendar";

type FilterState = {
  search: string;
  dateTiming: string[];
  location: string[];
  marketSegments: string[];
  participation: string[];
  organizers: string[];
};

type SavedFilter = {
  id: string;
  name: string;
  summary: string;
  createdAt: string;
};

type SavedList = {
  id: string;
  name: string;
  eventIds: string[];
  createdAt: string;
};

type FilterGroupKey =
  | "dateTiming"
  | "location"
  | "marketSegments"
  | "participation"
  | "organizers"
  | "quickFeeds";

type QuickFeed = {
  key: string;
  label: string;
  color: string;
  icon: FilterIconName;
  count: number;
  apply: (current: FilterState) => FilterState;
};

type FilterIconName =
  | "calendar"
  | "location"
  | "segments"
  | "audience"
  | "organizer"
  | "feed"
  | "database"
  | "signal"
  | "save"
  | "mail"
  | "collapse"
  | "expand"
  | "check"
  | "panel"
  | "list";

const INITIAL_EXPANDED: Record<FilterGroupKey, boolean> = {
  dateTiming: true,
  location: true,
  marketSegments: true,
  participation: true,
  organizers: true,
  quickFeeds: true,
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  dateTiming: [],
  location: [],
  marketSegments: [],
  participation: [],
  organizers: [],
};

const SAVED_FILTERS_KEY = "ccc_preview_saved_filters";
const SAVED_LISTS_KEY = "ccc_preview_saved_lists";

const TODAY = new Date("2026-08-05T00:00:00Z");

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatMonthDay(dateOnly: string) {
  if (!dateOnly) return "";
  const date = new Date(`${dateOnly}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthDayYear(dateOnly: string) {
  if (!dateOnly) return "";
  const date = new Date(`${dateOnly}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatWeekday(dateOnly: string) {
  if (!dateOnly) return "";
  const date = new Date(`${dateOnly}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function diffDays(from: string, to: string) {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((end - start) / 86400000);
}

function addDays(dateOnly: string, days: number) {
  const date = new Date(`${dateOnly}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getWeekStart(dateOnly: string) {
  const date = new Date(`${dateOnly}T00:00:00Z`);
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  return date.toISOString().slice(0, 10);
}

function getQuarterEnd() {
  const year = TODAY.getUTCFullYear();
  const month = TODAY.getUTCMonth();
  const quarterEndMonth = Math.floor(month / 3) * 3 + 2;
  const date = new Date(Date.UTC(year, quarterEndMonth + 1, 0));
  return date.toISOString().slice(0, 10);
}

function countBy(items: string[]) {
  return items.reduce((map, item) => {
    if (!item) return map;
    map.set(item, (map.get(item) || 0) + 1);
    return map;
  }, new Map<string, number>());
}

function topRanked(items: string[], limit = 8) {
  return Array.from(countBy(items).entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function eventLocationLabel(event: PublicWorkspaceEvent) {
  return [event.city, event.state].filter(Boolean).join(", ") || event.country || "Location TBD";
}

function eventDateRangeLabel(event: PublicWorkspaceEvent) {
  if (!event.startDate) return "";
  if (!event.endDate || event.endDate === event.startDate) {
    return `${formatMonthDayYear(event.startDate)} · ${formatWeekday(event.startDate)}`;
  }
  return `${formatMonthDay(event.startDate)}–${formatMonthDayYear(event.endDate)} · ${formatWeekday(
    event.startDate
  )}–${formatWeekday(event.endDate)}`;
}

function eventDurationLabel(event: PublicWorkspaceEvent) {
  if (!event.startDate || !event.endDate) return "1 day";
  const days = diffDays(event.startDate, event.endDate) + 1;
  return `${days} day${days === 1 ? "" : "s"}`;
}

function isFutureEvent(event: PublicWorkspaceEvent) {
  const end = new Date(`${event.endDate || event.startDate}T23:59:59Z`).getTime();
  return end >= TODAY.getTime();
}

function isInvestorHeavy(event: PublicWorkspaceEvent) {
  const haystack = [
    event.primaryCategory,
    event.marketFocus,
    event.issuerParticipation,
    event.eventCharacter,
  ]
    .join(" ")
    .toLowerCase();
  return /institutional investors|investor|family office|lp|limited partner|retail investors/.test(
    haystack
  );
}

function isIssuerAccess(event: PublicWorkspaceEvent) {
  const haystack = [
    event.issuerParticipation,
    event.primaryCategory,
    event.eventCharacter,
    event.additionalPublicCompanySectors,
  ]
    .join(" ")
    .toLowerCase();
  return /issuer|public company|company presentations|1x1|1×1|one-on-one|one on one/.test(
    haystack
  );
}

function isPrivateMarkets(event: PublicWorkspaceEvent) {
  return /private markets|private equity|venture/i.test(
    `${event.marketFocus} ${event.sectorThemes} ${event.primaryCategory}`
  );
}

function buildEventDescription(event: PublicWorkspaceEvent) {
  const lines = [
    event.organizer ? `Organizer: ${event.organizer}` : "",
    event.venue ? `Venue: ${event.venue}` : "",
    event.primaryCategory ? `Primary Category: ${event.primaryCategory}` : "",
    event.marketFocus ? `Market Focus: ${event.marketFocus}` : "",
    event.sectorThemes ? `Sector / Themes: ${event.sectorThemes}` : "",
    event.issuerParticipation ? `Participation: ${event.issuerParticipation}` : "",
    event.region ? `Region: ${event.region}` : "",
  ].filter(Boolean);

  if (event.website) {
    lines.push("", "Event Link:", event.website);
  }

  return lines.join("\n");
}

function buildFeedUrl(filters: FilterState) {
  const params = new URLSearchParams();
  filters.marketSegments.forEach((value) => params.append("sectorTheme", value));
  filters.participation.forEach((value) => params.append("issuerParticipation", value));
  filters.organizers.forEach((value) => params.append("organizer", value));
  filters.location.forEach((value) => params.append("region", value));
  if (filters.search) params.set("q", filters.search);
  const query = params.toString();
  return `/api/ics${query ? `?${query}` : ""}`;
}

function buildFeedName(filters: FilterState) {
  const parts = [
    filters.marketSegments[0],
    filters.participation[0],
    filters.location[0],
    filters.organizers[0],
  ].filter(Boolean);
  return parts.length ? `CCC — ${parts.join(" · ")}` : "CCC — Conference Intelligence Feed";
}

function formatFreshnessDate(value: string | null) {
  if (!value) return "Awaiting verification stamps";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function hasVerificationStamp(event: PublicWorkspaceEvent) {
  return Boolean(event.lastVerified);
}

function Icon({
  name,
  color = "currentColor",
}: {
  name: FilterIconName;
  color?: string;
}) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "calendar":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      );
    case "location":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 21s-6-4.6-6-10a6 6 0 1 1 12 0c0 5.4-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      );
    case "segments":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 18V6M10 18V10M16 18V4M22 18H2" />
        </svg>
      );
    case "audience":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3 19c0-3 2.4-5 5-5s5 2 5 5" />
          <path d="M13 19c.2-2 1.8-3.5 4-3.5 2.1 0 3.8 1.4 4 3.5" />
        </svg>
      );
    case "organizer":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="3" width="6" height="18" rx="1.5" />
          <rect x="14" y="7" width="6" height="14" rx="1.5" />
          <path d="M6 7h2M6 11h2M6 15h2M16 11h2M16 15h2" />
        </svg>
      );
    case "feed":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 19a2 2 0 1 0 0 .01Z" />
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 5a15 15 0 0 1 15 15" />
        </svg>
      );
    case "database":
      return (
        <svg {...common} aria-hidden="true">
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
        </svg>
      );
    case "signal":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 18V9M10 18V5M16 18v-7M22 18v-3" />
        </svg>
      );
    case "save":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 4h11l3 3v13H5Z" />
          <path d="M8 4v6h8V4M9 20v-6h6v6" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "collapse":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "expand":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m5 13 4 4L19 7" />
        </svg>
      );
    case "panel":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16M14 9h4M14 13h4" />
        </svg>
      );
    case "list":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M9 6h11M9 12h11M9 18h11" />
          <circle cx="5" cy="6" r="1" fill={color} stroke="none" />
          <circle cx="5" cy="12" r="1" fill={color} stroke="none" />
          <circle cx="5" cy="18" r="1" fill={color} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DiscoveryPreviewClient({
  events,
  initialCity,
  initialSearchQuery = "",
  initialEventId = "",
  previewContext,
}: DiscoveryPreviewClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("database");
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    search: initialSearchQuery,
    location: initialCity ? [initialCity] : [],
  });
  const [collapsedRail, setCollapsedRail] = useState(false);
  const [collapsedRightRail, setCollapsedRightRail] = useState(false);
  const [expandedGroups, setExpandedGroups] =
    useState<Record<FilterGroupKey, boolean>>(INITIAL_EXPANDED);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>(initialEventId);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [feedback, setFeedback] = useState("");
  const [viewportWidth, setViewportWidth] = useState(1440);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncViewport = () => setViewportWidth(window.innerWidth);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (viewportWidth <= 1280) {
      setCollapsedRightRail(true);
      setCollapsedRail(true);
    }
  }, [viewportWidth]);

  useEffect(() => {
    try {
      const loadedFilters = window.localStorage.getItem(SAVED_FILTERS_KEY);
      const loadedLists = window.localStorage.getItem(SAVED_LISTS_KEY);
      if (loadedFilters) setSavedFilters(JSON.parse(loadedFilters) as SavedFilter[]);
      if (loadedLists) setSavedLists(JSON.parse(loadedLists) as SavedList[]);
    } catch {
      setSavedFilters([]);
      setSavedLists([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
  }, [savedFilters]);

  useEffect(() => {
    window.localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(savedLists));
  }, [savedLists]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const optionSets = useMemo(() => {
    const sectorOptions = topRanked(
      events.flatMap((event) => splitCsv(event.sectorThemes || event.primaryCategory))
    ).map(([value]) => value);
    const participationOptions = topRanked(
      events.flatMap((event) => splitCsv(event.issuerParticipation))
    ).map(([value]) => value);
    const organizerOptions = topRanked(events.map((event) => event.organizer).filter(Boolean), 10).map(
      ([value]) => value
    );
    const locationOptions = topRanked(
      events.map((event) => event.region || event.state || event.city).filter(Boolean),
      10
    ).map(([value]) => value);

    return {
      dateTiming: ["Upcoming 30 Days", "This Quarter", "Hot Weeks"],
      location: locationOptions,
      marketSegments: sectorOptions,
      participation: participationOptions,
      organizers: organizerOptions,
    };
  }, [events]);

  const weekCounts = useMemo(() => {
    return Array.from(
      events.reduce((map, event) => {
        if (!isFutureEvent(event)) return map;
        const key = getWeekStart(event.startDate);
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map<string, number>())
    )
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStart, count]) => ({ weekStart, count }));
  }, [events]);

  const hotWeekThreshold = useMemo(() => {
    if (weekCounts.length === 0) return Number.POSITIVE_INFINITY;
    const counts = weekCounts.map((entry) => entry.count).sort((a, b) => a - b);
    const percentileIndex = Math.max(0, Math.floor(counts.length * 0.75) - 1);
    return Math.max(2, counts[percentileIndex] || 2);
  }, [weekCounts]);

  const hotWeekKeys = useMemo(
    () => new Set(weekCounts.filter((entry) => entry.count >= hotWeekThreshold).map((entry) => entry.weekStart)),
    [weekCounts, hotWeekThreshold]
  );

  const topCities = useMemo(() => {
    return topRanked(events.map((event) => eventLocationLabel(event))).slice(0, 3);
  }, [events]);

  const quickFeeds = useMemo<QuickFeed[]>(() => {
    const investorCount = events.filter(isInvestorHeavy).length;
    const issuerAccessCount = events.filter(isIssuerAccess).length;
    const privateMarketsCount = events.filter(isPrivateMarkets).length;
    const hotWeekCount = events.filter((event) => hotWeekKeys.has(getWeekStart(event.startDate))).length;
    const upcoming30Count = events.filter((event) => {
      const start = new Date(`${event.startDate}T00:00:00Z`).getTime();
      return start >= TODAY.getTime() && start <= TODAY.getTime() + 30 * 86400000;
    }).length;

    return [
      {
        key: "investor",
        label: "Investor Conferences",
        color: "#7dbbff",
        icon: "audience",
        count: investorCount,
        apply: (current) => ({ ...current, participation: ["Institutional Investors"] }),
      },
      {
        key: "issuer-access",
        label: "Issuer Access",
        color: "#9a86ff",
        icon: "signal",
        count: issuerAccessCount,
        apply: (current) => ({ ...current, participation: ["Company Presentations"] }),
      },
      {
        key: "private",
        label: "Private Markets",
        color: "#2dd4bf",
        icon: "segments",
        count: privateMarketsCount,
        apply: (current) => ({ ...current, marketSegments: ["Private Markets"] }),
      },
      {
        key: "upcoming30",
        label: "Next 30 Days",
        color: "#f59e0b",
        icon: "calendar",
        count: upcoming30Count,
        apply: (current) => ({ ...current, dateTiming: ["Upcoming 30 Days"] }),
      },
      {
        key: "hot",
        label: "Hot Weeks",
        color: "#ef7d5a",
        icon: "feed",
        count: hotWeekCount,
        apply: (current) => ({ ...current, dateTiming: ["Hot Weeks"] }),
      },
    ];
  }, [events, hotWeekKeys]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchHaystack = [
        event.title,
        event.city,
        event.state,
        event.organizer,
        event.primaryCategory,
        event.marketFocus,
        event.sectorThemes,
        event.issuerParticipation,
      ]
        .join(" ")
        .toLowerCase();

      if (filters.search && !searchHaystack.includes(filters.search.toLowerCase())) return false;

      if (
        filters.location.length > 0 &&
        !filters.location.some((value) =>
          [event.region, event.state, event.city, event.country].filter(Boolean).includes(value)
        )
      ) {
        return false;
      }

      if (
        filters.marketSegments.length > 0 &&
        !filters.marketSegments.some((value) =>
          splitCsv(`${event.sectorThemes},${event.primaryCategory},${event.marketFocus}`).includes(value)
        )
      ) {
        return false;
      }

      if (
        filters.participation.length > 0 &&
        !filters.participation.some((value) => splitCsv(event.issuerParticipation).includes(value))
      ) {
        return false;
      }

      if (filters.organizers.length > 0 && !filters.organizers.includes(event.organizer)) return false;

      if (filters.dateTiming.includes("Upcoming 30 Days")) {
        const start = new Date(`${event.startDate}T00:00:00Z`).getTime();
        if (!(start >= TODAY.getTime() && start <= TODAY.getTime() + 30 * 86400000)) return false;
      }

      if (filters.dateTiming.includes("This Quarter")) {
        if (event.startDate < TODAY.toISOString().slice(0, 10) || event.startDate > getQuarterEnd()) return false;
      }

      if (filters.dateTiming.includes("Hot Weeks") && !hotWeekKeys.has(getWeekStart(event.startDate))) {
        return false;
      }

      return true;
    });
  }, [events, filters, hotWeekKeys]);

  const filteredTopCities = useMemo(() => topRanked(filteredEvents.map((event) => eventLocationLabel(event)), 3), [filteredEvents]);

  const activeEvent = useMemo(() => {
    return (
      filteredEvents.find((event) => event.id === activeEventId) ||
      filteredEvents[0] ||
      null
    );
  }, [filteredEvents, activeEventId]);

  useEffect(() => {
    if (!activeEvent && filteredEvents.length > 0) {
      setActiveEventId(filteredEvents[0].id);
    }
  }, [activeEvent, filteredEvents]);

  const filteredCounts = useMemo(() => {
    return {
      conferences: filteredEvents.length,
      cities: unique(filteredEvents.map((event) => eventLocationLabel(event))).length,
      organizers: unique(filteredEvents.map((event) => event.organizer).filter(Boolean)).length,
      themes: unique(filteredEvents.flatMap((event) => splitCsv(event.sectorThemes))).length,
      investorHeavy: filteredEvents.filter(isInvestorHeavy).length,
      issuerAccess: filteredEvents.filter(isIssuerAccess).length,
    };
  }, [filteredEvents]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.search ||
          filters.dateTiming.length ||
          filters.location.length ||
          filters.marketSegments.length ||
          filters.participation.length ||
          filters.organizers.length
      ),
    [filters]
  );

  const weeklyGroups = useMemo(() => {
    return Array.from(
      filteredEvents.reduce((map, event) => {
        const weekStart = getWeekStart(event.startDate);
        const bucket = map.get(weekStart) || [];
        bucket.push(event);
        map.set(weekStart, bucket);
        return map;
      }, new Map<string, PublicWorkspaceEvent[]>())
    )
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStart, weekEvents]) => ({
        weekStart,
        weekEnd: addDays(weekStart, 6),
        events: weekEvents.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title)),
      }));
  }, [filteredEvents]);

  const selectedEvents = useMemo(
    () => filteredEvents.filter((event) => selectedEventIds.includes(event.id)),
    [filteredEvents, selectedEventIds]
  );

  const liveFeedUrl = useMemo(() => buildFeedUrl(filters), [filters]);
  const liveFeedName = useMemo(() => buildFeedName(filters), [filters]);

  const intelligenceStrip = useMemo(() => {
    const inViewValue = hasActiveFilters
      ? `${filteredCounts.conferences} records in current view`
      : `${previewContext.publicCounts.approvedVisibleRecords} website-visible records`;
    const topCitiesValue =
      filteredTopCities.length > 0
        ? filteredTopCities.map(([city]) => city).join(" · ")
        : "City coverage building";

    return [
      {
        label: hasActiveFilters ? "Current View" : "Approved Coverage",
        value: inViewValue,
        icon: "database" as const,
        tone: "#60a5fa",
      },
      {
        label: "Top Cities",
        value: topCitiesValue,
        icon: "location" as const,
        tone: "#2dd4bf",
      },
      {
        label: "Audience Signals",
        value: `${filteredCounts.investorHeavy} investor-heavy · ${filteredCounts.issuerAccess} issuer-access`,
        icon: "audience" as const,
        tone: "#8b5cf6",
      },
      {
        label: "Verified Approved",
        value: `${previewContext.publicCounts.verifiedApprovedRecords} approved records carry a verification status`,
        icon: "check" as const,
        tone: "#22c55e",
      },
      {
        label: "Source Dataset",
        value: `${previewContext.publicCounts.totalRecords} source records reviewed for website approval`,
        icon: "panel" as const,
        tone: "#7dbbff",
      },
    ];
  }, [
    filteredCounts.conferences,
    filteredCounts.investorHeavy,
    filteredCounts.issuerAccess,
    filteredTopCities,
    hasActiveFilters,
    previewContext.publicCounts.approvedVisibleRecords,
    previewContext.publicCounts.totalRecords,
    previewContext.publicCounts.verifiedApprovedRecords,
  ]);

  const toggleSelection = (eventId: string) => {
    setSelectedEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  };

  const persistFilter = () => {
    const summaryParts = [
      filters.marketSegments[0],
      filters.participation[0],
      filters.location[0],
      filters.dateTiming[0],
    ].filter(Boolean);
    const suggested = summaryParts.join(" · ") || "Conference intelligence filter";
    const name = window.prompt("Save filter as", suggested)?.trim();
    if (!name) return;
    setSavedFilters((current) => [
      {
        id: slugify(`${name}-${Date.now()}`),
        name,
        summary: `${filteredCounts.conferences} conferences · ${filteredCounts.cities} cities`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setFeedback(`Saved filter: ${name}`);
  };

  const persistList = () => {
    if (selectedEvents.length === 0) {
      setFeedback("Select one or more conferences first.");
      return;
    }
    const suggested = selectedEvents.length === 1 ? selectedEvents[0].title : `Selected conferences (${selectedEvents.length})`;
    const name = window.prompt("Save list as", suggested)?.trim();
    if (!name) return;
    setSavedLists((current) => [
      {
        id: slugify(`${name}-${Date.now()}`),
        name,
        eventIds: selectedEvents.map((event) => event.id),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setFeedback(`Saved list: ${name}`);
  };

  const emailShare = () => {
    const shareSource = selectedEvents.length > 0 ? selectedEvents : activeEvent ? [activeEvent] : [];
    if (shareSource.length === 0) {
      setFeedback("Pick a conference or select a list first.");
      return;
    }
    const subject = encodeURIComponent(`CCC Discovery — ${shareSource.length} conference${shareSource.length === 1 ? "" : "s"}`);
    const body = encodeURIComponent(
      shareSource
        .slice(0, 20)
        .map(
          (event) =>
            `${event.title}\n${eventDateRangeLabel(event)}\n${eventLocationLabel(event)}\n${event.website || "No event link available"}`
        )
        .join("\n\n")
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const toggleGroup = (key: FilterGroupKey) => {
    setExpandedGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  const applyQuickFeed = (feed: QuickFeed) => {
    setFilters((current) => feed.apply({ ...current }));
    if (collapsedRail) setCollapsedRail(false);
  };

  const filterBadgeCount = (key: FilterGroupKey) => {
    switch (key) {
      case "dateTiming":
        return filters.dateTiming.length;
      case "location":
        return filters.location.length;
      case "marketSegments":
        return filters.marketSegments.length;
      case "participation":
        return filters.participation.length;
      case "organizers":
        return filters.organizers.length;
      case "quickFeeds":
        return quickFeeds.length;
      default:
        return 0;
    }
  };

  const getWhyItMatters = (event: PublicWorkspaceEvent) => {
    const reasons: string[] = [];
    const location = eventLocationLabel(event);
    const weekStart = getWeekStart(event.startDate);
    const weekCount = weekCounts.find((entry) => entry.weekStart === weekStart)?.count || 0;

    if (hotWeekKeys.has(weekStart)) reasons.push(`${formatMonthDay(weekStart)} starts one of the stronger future activity weeks`);
    if (topCities.some(([city]) => city === location)) reasons.push(`${location} is a leading city cluster in approved coverage`);
    if (isIssuerAccess(event)) reasons.push("issuer-access participation is explicitly tagged");
    if (isInvestorHeavy(event)) reasons.push("institutional audience signals are present");
    if (event.marketFocus) reasons.push(`${splitCsv(event.marketFocus)[0]} is part of the visible market-focus mix`);
    if (weekCount > 0 && reasons.length < 3) reasons.push(`${weekCount} approved conferences are active in this same week`);

    return reasons.slice(0, 2).join(" · ") || "Structured classification and timing data make this record actionable.";
  };

  const getSupportedSignals = (event: PublicWorkspaceEvent) => {
    const weekStart = getWeekStart(event.startDate);
    const signals: Array<{ label: string; tone: string }> = [];

    if (hotWeekKeys.has(weekStart)) {
      signals.push({ label: "Hot week timing", tone: "#f59e0b" });
    }
    if (filteredTopCities.some(([city]) => city === eventLocationLabel(event))) {
      signals.push({ label: "Top city cluster", tone: "#2dd4bf" });
    }
    if (isInvestorHeavy(event)) {
      signals.push({ label: "Investor-heavy audience", tone: "#22c55e" });
    }
    if (isIssuerAccess(event)) {
      signals.push({ label: "Issuer-access format", tone: "#8b5cf6" });
    }
    if (hasVerificationStamp(event)) {
      signals.push({ label: "Verification stamped", tone: "#60a5fa" });
    }
    if (event.organizerType) {
      signals.push({ label: event.organizerType, tone: "#7dbbff" });
    }
    if (event.format) {
      signals.push({ label: event.format, tone: "#94a3b8" });
    }

    return signals.slice(0, 5);
  };

  const internalNavButton = (label: string, active: boolean) => (
    <button
      type="button"
      disabled
      aria-pressed={active}
      style={{
        height: "36px",
        padding: "0 14px",
        borderRadius: "999px",
        border: active ? "1px solid rgba(96,165,250,0.42)" : "1px solid rgba(107,157,210,0.18)",
        background: active ? "linear-gradient(180deg, rgba(35,86,154,0.9), rgba(22,57,109,0.92))" : "rgba(8,31,55,0.46)",
        color: active ? "#ffffff" : "#8fb8ff",
        fontSize: "12px",
        fontWeight: 900,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        opacity: active ? 1 : 0.75,
      }}
    >
      {label}
    </button>
  );

  const FilterPanel = ({
    groupKey,
    title,
    icon,
    children,
  }: {
    groupKey: FilterGroupKey;
    title: string;
    icon: FilterIconName;
    children: React.ReactNode;
  }) => {
    const count = filterBadgeCount(groupKey);

    if (collapsedRail) {
      return (
        <button
          type="button"
          onClick={() => {
            setCollapsedRail(false);
            setExpandedGroups((current) => ({ ...current, [groupKey]: true }));
          }}
          title={title}
          aria-label={`${title}${count ? `, ${count} active` : ""}`}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            border: count ? "1px solid rgba(96,165,250,0.34)" : "1px solid rgba(107,157,210,0.16)",
            background: count ? "rgba(20,49,82,0.88)" : "rgba(7,24,42,0.88)",
            color: count ? "#dbeafe" : "#8fb8ff",
            display: "grid",
            placeItems: "center",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <Icon name={icon} color={count ? "#dbeafe" : "#8fb8ff"} />
          {count ? (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-2px",
                minWidth: "18px",
                height: "18px",
                borderRadius: "999px",
                background: "#3b82f6",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 900,
                display: "grid",
                placeItems: "center",
                padding: "0 5px",
              }}
            >
              {count}
            </span>
          ) : null}
        </button>
      );
    }

    return (
      <section
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(107,157,210,0.16)",
          background: "linear-gradient(180deg, rgba(8,30,52,0.9), rgba(5,20,37,0.92))",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={() => toggleGroup(groupKey)}
          style={{
            width: "100%",
            height: "46px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "0 14px",
            border: "none",
            background: "transparent",
            color: "#dbeafe",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "20px", height: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#8fb8ff" }}>
              <Icon name={icon} color="#8fb8ff" />
            </span>
            <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {count > 0 ? (
              <span
                style={{
                  minWidth: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  background: "rgba(59,130,246,0.16)",
                  color: "#dbeafe",
                  fontSize: "11px",
                  fontWeight: 900,
                  display: "grid",
                  placeItems: "center",
                  padding: "0 6px",
                }}
              >
                {count}
              </span>
            ) : null}
            <span style={{ color: "#8fb8ff" }}>{expandedGroups[groupKey] ? "−" : "+"}</span>
          </span>
        </button>
        {expandedGroups[groupKey] ? <div style={{ padding: "0 14px 14px" }}>{children}</div> : null}
      </section>
    );
  };

  const ChipButton = ({
    label,
    active,
    tone = "#8fb8ff",
    onClick,
    secondary,
  }: {
    label: string;
    active: boolean;
    tone?: string;
    onClick: () => void;
    secondary?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: "999px",
        border: active ? `1px solid ${tone}` : "1px solid rgba(107,157,210,0.18)",
        background: active ? "rgba(26,63,104,0.92)" : "rgba(7,24,42,0.74)",
        color: active ? "#ffffff" : "#c8d8ec",
        minHeight: "34px",
        padding: "6px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        fontWeight: 800,
        cursor: "pointer",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <span>{label}</span>
      {secondary ? <span style={{ color: active ? "#dbeafe" : "#8fb8ff", fontSize: "11px" }}>{secondary}</span> : null}
    </button>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${collapsedRail ? "72px" : viewportWidth <= 1360 ? "246px" : "282px"} minmax(0, 1fr) ${collapsedRightRail ? "72px" : viewportWidth <= 1360 ? "262px" : "310px"}`,
        gap: "16px",
        height: "100%",
        minHeight: 0,
      }}
      className="ccc-preview-discovery-layout"
    >
      <aside
        style={{
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: "22px",
          border: "1px solid rgba(107,157,210,0.16)",
          background: "linear-gradient(180deg, rgba(5,20,37,0.98), rgba(3,16,30,0.98))",
          padding: collapsedRail ? "14px 10px" : "16px",
          display: "grid",
          alignContent: "start",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsedRail ? "center" : "space-between", gap: "8px" }}>
          {collapsedRail ? null : (
            <div>
              <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900, lineHeight: 1.1 }}>
                Refine Discovery
              </div>
              <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.4, marginTop: "5px" }}>
                Existing filters and feed shortcuts for the website-visible conference universe.
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsedRail((value) => !value)}
            aria-label={collapsedRail ? "Expand filter rail" : "Collapse filter rail"}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              border: "1px solid rgba(107,157,210,0.18)",
              background: "rgba(8,31,55,0.62)",
              color: "#8fb8ff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Icon name={collapsedRail ? "expand" : "collapse"} color="#8fb8ff" />
          </button>
        </div>

        {!collapsedRail ? (
          <div style={{ borderRadius: "14px", border: "1px solid rgba(107,157,210,0.16)", background: "rgba(7,24,42,0.78)", padding: "12px" }}>
            <div style={{ color: "#8fb8ff", fontSize: "10px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
              Search
            </div>
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search titles, organizers, cities, sectors..."
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "10px",
                border: "1px solid rgba(107,157,210,0.18)",
                background: "rgba(2,14,24,0.66)",
                color: "#f8fbff",
                fontSize: "13px",
                padding: "0 12px",
                outline: "none",
              }}
            />
          </div>
        ) : null}

        <FilterPanel groupKey="dateTiming" title="Date & Timing" icon="calendar">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {optionSets.dateTiming.map((option) => (
              <ChipButton
                key={option}
                label={option}
                active={filters.dateTiming.includes(option)}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    dateTiming: current.dateTiming.includes(option)
                      ? current.dateTiming.filter((item) => item !== option)
                      : [...current.dateTiming, option],
                  }))
                }
              />
            ))}
          </div>
        </FilterPanel>

        <FilterPanel groupKey="location" title="Location" icon="location">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {optionSets.location.map((option) => (
              <ChipButton
                key={option}
                label={option}
                active={filters.location.includes(option)}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    location: current.location.includes(option)
                      ? current.location.filter((item) => item !== option)
                      : [...current.location, option],
                  }))
                }
              />
            ))}
          </div>
        </FilterPanel>

        <FilterPanel groupKey="marketSegments" title="Market Segments" icon="segments">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {optionSets.marketSegments.map((option) => (
              <ChipButton
                key={option}
                label={option}
                active={filters.marketSegments.includes(option)}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    marketSegments: current.marketSegments.includes(option)
                      ? current.marketSegments.filter((item) => item !== option)
                      : [...current.marketSegments, option],
                  }))
                }
              />
            ))}
          </div>
        </FilterPanel>

        <FilterPanel groupKey="participation" title="Participation" icon="audience">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {optionSets.participation.map((option) => (
              <ChipButton
                key={option}
                label={option}
                active={filters.participation.includes(option)}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    participation: current.participation.includes(option)
                      ? current.participation.filter((item) => item !== option)
                      : [...current.participation, option],
                  }))
                }
              />
            ))}
          </div>
        </FilterPanel>

        <FilterPanel groupKey="organizers" title="Organizers" icon="organizer">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {optionSets.organizers.map((option) => (
              <ChipButton
                key={option}
                label={option}
                active={filters.organizers.includes(option)}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    organizers: current.organizers.includes(option)
                      ? current.organizers.filter((item) => item !== option)
                      : [...current.organizers, option],
                  }))
                }
              />
            ))}
          </div>
        </FilterPanel>

        <FilterPanel groupKey="quickFeeds" title="Quick Feeds" icon="feed">
          <div style={{ display: "grid", gap: "8px" }}>
            {quickFeeds.map((feed) => (
              <ChipButton
                key={feed.key}
                label={feed.label}
                active={false}
                tone={feed.color}
                secondary={`${feed.count}`}
                onClick={() => applyQuickFeed(feed)}
              />
            ))}
          </div>
        </FilterPanel>
      </aside>

      <section
        style={{
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          display: "grid",
          alignContent: "start",
          gap: "16px",
          paddingRight: "4px",
        }}
      >
        <div
          style={{
            borderRadius: "22px",
            border: "1px solid rgba(107,157,210,0.16)",
            background:
              "radial-gradient(circle at 18% 0%, rgba(37,99,235,0.14), transparent 34%), linear-gradient(180deg, rgba(7,26,46,0.88), rgba(4,18,34,0.9))",
            padding: "18px 20px",
            display: "grid",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {internalNavButton("Get Started", false)}
                {internalNavButton("Discovery", true)}
                {internalNavButton("Market View", false)}
              </div>
              <div>
                <div style={{ color: "#8fb8ff", fontSize: "10px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Discovery
                </div>
                <div style={{ color: "#ffffff", fontSize: "28px", lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.03em" }}>
                  Conference Intelligence Discovery
                </div>
                <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.45, marginTop: "6px", maxWidth: "820px" }}>
                  Explore verified conferences with timing, audience, participation, and market-context signals.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px",
                borderRadius: "14px",
                background: "rgba(3,20,38,0.76)",
                border: "1px solid rgba(107,157,210,0.18)",
              }}
            >
              {[
                { key: "database" as const, label: "Database" },
                { key: "calendar" as const, label: "Calendar" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setViewMode(item.key)}
                  style={{
                    height: "36px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "none",
                    background:
                      viewMode === item.key
                        ? "linear-gradient(180deg, #3b82f6, #2563eb)"
                        : "transparent",
                    color: viewMode === item.key ? "#ffffff" : "#a9bfd8",
                    fontSize: "12px",
                    fontWeight: 850,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "10px",
            }}
          >
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(107,157,210,0.16)",
                background: "linear-gradient(180deg, rgba(6,24,44,0.62), rgba(4,18,34,0.76))",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: viewportWidth <= 1360 ? "repeat(2, minmax(0, 1fr))" : "repeat(5, minmax(0, 1fr))",
                }}
                className="ccc-preview-intelligence-strip"
              >
                {intelligenceStrip.map((item, index) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "14px 16px",
                      display: "grid",
                      gap: "6px",
                      minWidth: 0,
                      borderLeft:
                        viewportWidth <= 1360
                          ? index % 2 === 0
                            ? "none"
                            : "1px solid rgba(107,157,210,0.12)"
                          : index === 0
                            ? "none"
                            : "1px solid rgba(107,157,210,0.12)",
                      borderTop:
                        viewportWidth <= 1360 && index > 1
                          ? "1px solid rgba(107,157,210,0.12)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        color: item.tone,
                        fontSize: "11px",
                        fontWeight: 900,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      <Icon name={item.icon} color={item.tone} />
                      {item.label}
                    </div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: item.label === "Top Cities" ? "16px" : "17px",
                        fontWeight: 780,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 16px",
              color: "#9fb5cf",
              fontSize: "12px",
              alignItems: "center",
            }}
          >
            <span>
              Website-visible records: <strong style={{ color: "#dbeafe" }}>{previewContext.publicCounts.approvedVisibleRecords}</strong>
            </span>
            <span>
              Verified approved records: <strong style={{ color: "#dbeafe" }}>{previewContext.publicCounts.verifiedApprovedRecords}</strong>
            </span>
            <span>
              Source records: <strong style={{ color: "#dbeafe" }}>{previewContext.publicCounts.totalRecords}</strong>
            </span>
            <span>
              Latest verification stamp: <strong style={{ color: "#dbeafe" }}>{formatFreshnessDate(previewContext.freshness.latestVerifiedDate)}</strong>
            </span>
            <span>
              Coverage window: <strong style={{ color: "#dbeafe" }}>{previewContext.approvedCoverage.earliestDate} – {previewContext.approvedCoverage.latestDate}</strong>
            </span>
          </div>
        </div>

        {viewMode === "database" ? (
          <div style={{ display: "grid", gap: "14px" }}>
            {filteredEvents.map((event) => {
              const isSelected = selectedEventIds.includes(event.id);
              const isActive = activeEvent?.id === event.id;
              const categoryTags = unique(
                [
                  event.primaryCategory,
                  splitCsv(event.issuerParticipation)[0] || "",
                  splitCsv(event.marketFocus)[0] || "",
                  splitCsv(event.sectorThemes)[0] || "",
                ].filter(Boolean)
              ).slice(0, 4);

              return (
                <article
                  key={event.id}
                  onClick={() => setActiveEventId(event.id)}
                  style={{
                    borderRadius: "22px",
                    border: isActive
                      ? "1px solid rgba(96,165,250,0.36)"
                      : "1px solid rgba(107,157,210,0.14)",
                    background:
                      isActive
                        ? "linear-gradient(180deg, rgba(10,39,67,0.96), rgba(6,24,44,0.96))"
                        : "linear-gradient(180deg, rgba(8,30,52,0.86), rgba(4,18,34,0.92))",
                    boxShadow: isActive ? "0 18px 38px rgba(0,0,0,0.18)" : "none",
                    padding: "18px",
                    display: "grid",
                    gridTemplateColumns: `${viewportWidth <= 1280 ? "84px minmax(0, 1fr) 208px" : "100px minmax(0, 1fr) 236px"}`,
                    gap: "16px",
                    alignItems: "start",
                    cursor: "pointer",
                  }}
                  className="ccc-preview-record-card"
                >
                  <div
                    style={{
                      borderRadius: "24px",
                      background: "linear-gradient(180deg, rgba(112,147,214,0.92), rgba(63,91,145,0.88))",
                      minHeight: viewportWidth <= 1280 ? "132px" : "142px",
                      padding: viewportWidth <= 1280 ? "12px 9px" : "14px 10px",
                      display: "grid",
                      alignContent: "center",
                      justifyItems: "center",
                      gap: "6px",
                      textAlign: "center",
                      color: "#f8fbff",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Date</div>
                    <div style={{ width: "64px", borderTop: "1px solid rgba(255,255,255,0.28)" }} />
                    <div style={{ fontSize: "12px", fontWeight: 800, opacity: 0.9 }}>{formatMonthDay(event.startDate)}</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1.05 }}>
                      {event.endDate && event.endDate !== event.startDate
                        ? `${formatMonthDay(event.startDate).split(" ")[1]}–${formatMonthDay(event.endDate).split(" ")[1]}`
                        : formatMonthDay(event.startDate).split(" ")[1]}
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 800, opacity: 0.92 }}>{new Date(`${event.startDate}T00:00:00Z`).getUTCFullYear()}</div>
                    <div style={{ width: "64px", borderTop: "1px solid rgba(255,255,255,0.22)" }} />
                    <div style={{ fontSize: "11px", fontWeight: 800, opacity: 0.92 }}>{eventDurationLabel(event)}</div>
                  </div>

                  <div style={{ minWidth: 0, display: "grid", gap: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "start", gap: "12px" }}>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: "#ffffff",
                            fontSize: viewportWidth <= 1280 ? "22px" : "25px",
                            fontWeight: 900,
                            lineHeight: 1.12,
                            letterSpacing: "-0.03em",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            overflow: "hidden",
                            minHeight: "2.24em",
                          }}
                        >
                          {event.title}
                        </div>
                        <div style={{ marginTop: "8px", color: "#7dbbff", fontSize: "19px", fontWeight: 800 }}>
                          {eventLocationLabel(event)}
                        </div>
                        <div style={{ marginTop: "6px", color: "#c8d8ec", fontSize: "15px", lineHeight: 1.4 }}>
                          {[event.organizer, event.venue].filter(Boolean).join(" · ") || "Organizer and venue information available on the record"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          toggleSelection(event.id);
                        }}
                        aria-pressed={isSelected}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          border: isSelected ? "1px solid rgba(96,165,250,0.8)" : "1px solid rgba(120,138,160,0.55)",
                          background: isSelected ? "rgba(59,130,246,0.22)" : "rgba(8,31,55,0.44)",
                          color: "#ffffff",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          fontSize: "12px",
                          fontWeight: 900,
                        }}
                      >
                        {isSelected ? "✓" : ""}
                      </button>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {categoryTags.map((tag, index) => (
                        <span
                          key={`${event.id}-${tag}-${index}`}
                          style={{
                            borderRadius: "999px",
                            border: "1px solid rgba(107,157,210,0.18)",
                            background: index === 0 ? "rgba(59,130,246,0.14)" : "rgba(7,24,42,0.74)",
                            color: index === 0 ? "#dbeafe" : "#b8cce4",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: 800,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {getSupportedSignals(event).map((signal) => (
                        <span
                          key={`${event.id}-${signal.label}`}
                          style={{
                            borderRadius: "999px",
                            border: `1px solid ${signal.tone}33`,
                            background: `${signal.tone}14`,
                            color: "#dbeafe",
                            padding: "6px 10px",
                            fontSize: "11px",
                            fontWeight: 850,
                          }}
                        >
                          {signal.label}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        borderRadius: "16px",
                        border: "1px solid rgba(107,157,210,0.16)",
                        background: "rgba(5,20,37,0.56)",
                        padding: "12px 14px",
                        display: "grid",
                        gap: "8px",
                      }}
                    >
                      <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Why this record stands out
                      </div>
                      <div style={{ color: "#dbeafe", fontSize: "14px", lineHeight: 1.5, fontWeight: 650 }}>
                        {getWhyItMatters(event)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "12px" }}>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <a
                        href={event.website || "#"}
                        target={event.website ? "_blank" : undefined}
                        rel={event.website ? "noopener noreferrer" : undefined}
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                        style={{
                          height: "34px",
                          borderRadius: "10px",
                          border: "1px solid rgba(107,157,210,0.18)",
                          background: "rgba(8,31,55,0.32)",
                          color: "#c8d8ec",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 720,
                          textDecoration: "none",
                          opacity: event.website ? 1 : 0.6,
                        }}
                      >
                        View Details ↗
                      </a>
                      <div onClick={(clickEvent) => clickEvent.stopPropagation()}>
                        <AddToCalendar
                          compact
                          fullWidth
                          title={event.title}
                          startDate={event.startDate}
                          endDate={event.endDate}
                          location={[event.venue, event.city, event.state, event.country].filter(Boolean).join(", ")}
                          url={event.website}
                          description={buildEventDescription(event)}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: "16px",
                        border: "1px solid rgba(45,212,191,0.18)",
                        background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(45,212,191,0.10))",
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                        Live calendar relevance
                      </div>
                      <div style={{ color: "#dbeafe", fontSize: "13px", lineHeight: 1.45 }}>
                        This record will flow into <strong>{liveFeedName}</strong> if it matches the saved filter you sync.
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {weeklyGroups.map((week) => (
              <section
                key={week.weekStart}
                style={{
                  borderRadius: "22px",
                  border: "1px solid rgba(107,157,210,0.14)",
                  background: "linear-gradient(180deg, rgba(8,30,52,0.86), rgba(4,18,34,0.92))",
                  padding: "18px",
                  display: "grid",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "#ffffff", fontSize: "24px", fontWeight: 900 }}>
                      {formatMonthDay(week.weekStart)}–{formatMonthDayYear(week.weekEnd)}
                    </div>
                    <div style={{ color: "#9fb5cf", fontSize: "13px", marginTop: "6px" }}>
                      {week.events.length} conferences in this week
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {hotWeekKeys.has(week.weekStart) ? (
                      <span style={{ borderRadius: "999px", padding: "7px 12px", border: "1px solid rgba(239,125,90,0.28)", background: "rgba(98,45,32,0.42)", color: "#ffd2bf", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Hot week
                      </span>
                    ) : null}
                    <span style={{ borderRadius: "999px", padding: "7px 12px", border: "1px solid rgba(45,212,191,0.24)", background: "rgba(18,76,72,0.44)", color: "#c7fff5", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      {topRanked(week.events.map((event) => eventLocationLabel(event)), 1)[0]?.[0] || "Mixed cities"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {week.events.map((event) => {
                    const isSelected = selectedEventIds.includes(event.id);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          setActiveEventId(event.id);
                          toggleSelection(event.id);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          borderRadius: "16px",
                          border: isSelected ? "1px solid rgba(96,165,250,0.38)" : "1px solid rgba(107,157,210,0.12)",
                          background: isSelected ? "rgba(11,37,63,0.92)" : "rgba(5,20,37,0.64)",
                          padding: "14px",
                          color: "#f8fbff",
                          cursor: "pointer",
                          display: "grid",
                          gap: "6px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "16px", fontWeight: 900, lineHeight: 1.2 }}>{event.title}</div>
                            <div style={{ marginTop: "4px", color: "#7dbbff", fontSize: "13px", fontWeight: 800 }}>
                              {eventLocationLabel(event)} · {eventDateRangeLabel(event)}
                            </div>
                          </div>
                          <span style={{ color: "#9fb5cf", fontSize: "12px", fontWeight: 800, flexShrink: 0 }}>
                            {eventDurationLabel(event)}
                          </span>
                        </div>
                        <div style={{ color: "#b8cce4", fontSize: "13px", lineHeight: 1.45 }}>{getWhyItMatters(event)}</div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <aside
        style={{
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: "22px",
          border: "1px solid rgba(107,157,210,0.16)",
          background: "linear-gradient(180deg, rgba(5,20,37,0.98), rgba(3,16,30,0.98))",
          padding: "16px",
          display: "grid",
          alignContent: "start",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsedRightRail ? "center" : "space-between", gap: "8px" }}>
          {collapsedRightRail ? null : (
            <div>
              <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900, lineHeight: 1.1 }}>
                Workflow Tools
              </div>
              <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.4, marginTop: "5px" }}>
                Save filters, send lists, and sync the approved conference view.
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsedRightRail((value) => !value)}
            aria-label={collapsedRightRail ? "Expand workflow tools" : "Collapse workflow tools"}
            title={collapsedRightRail ? "Expand workflow tools" : "Collapse workflow tools"}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              border: "1px solid rgba(107,157,210,0.18)",
              background: "rgba(8,31,55,0.62)",
              color: "#8fb8ff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Icon name={collapsedRightRail ? "expand" : "collapse"} color="#8fb8ff" />
          </button>
        </div>

        {collapsedRightRail ? (
          <div style={{ display: "grid", gap: "10px", justifyItems: "center" }}>
            {[
              { label: "Live calendar feed", icon: "calendar" as const },
              { label: "Save filter", icon: "save" as const },
              { label: "Save list", icon: "list" as const },
              { label: "Email share", icon: "mail" as const },
            ].map((item) => (
              <div
                key={item.label}
                title={item.label}
                aria-label={item.label}
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  border: "1px solid rgba(107,157,210,0.16)",
                  background: "rgba(7,24,42,0.88)",
                  color: "#8fb8ff",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name={item.icon} color="#8fb8ff" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <section
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(45,212,191,0.24)",
                background: "linear-gradient(135deg, rgba(12,44,71,0.98), rgba(4,20,36,0.98))",
                padding: "16px",
                display: "grid",
                gap: "12px",
                boxShadow: "0 16px 30px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Live calendar feed
                </div>
                <span style={{ color: "#2dd4bf", fontSize: "12px", fontWeight: 900 }}>Live</span>
              </div>
              <div style={{ color: "#ffffff", fontSize: "20px", fontWeight: 900, lineHeight: 1.1 }}>
                {liveFeedName}
              </div>
              <div style={{ color: "#c8d8ec", fontSize: "13px", lineHeight: 1.5 }}>
                Save this filter, then sync the same approved record set into your calendar workflow.
              </div>
              <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.45 }}>
                Syncs the same conference set shown by your active Discovery filters.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                {[
                  { label: "Google", href: `/help/google-calendar?feedUrl=${encodeURIComponent(liveFeedUrl)}` },
                  { label: "Apple", href: `/help/apple-calendar?feedUrl=${encodeURIComponent(liveFeedUrl)}` },
                  { label: "Outlook", href: `/help/outlook-calendar?feedUrl=${encodeURIComponent(liveFeedUrl)}` },
                ].map((provider) => (
                  <a
                    key={provider.label}
                    href={provider.href}
                    style={{
                      height: "38px",
                      borderRadius: "10px",
                      border: "1px solid rgba(107,157,210,0.18)",
                      background: "rgba(8,31,55,0.78)",
                      color: "#dbeafe",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 850,
                    }}
                  >
                    {provider.label}
                  </a>
                ))}
              </div>
            </section>

            <section
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(107,157,210,0.16)",
                background: "rgba(8,31,55,0.46)",
                padding: "14px",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Actions
              </div>
              <button
                type="button"
                onClick={persistFilter}
                style={{
                  height: "40px",
                  borderRadius: "12px",
                  border: "1px solid rgba(107,157,210,0.18)",
                  background: "rgba(6,24,44,0.86)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Save Filter
              </button>
              <button
                type="button"
                onClick={persistList}
                style={{
                  height: "40px",
                  borderRadius: "12px",
                  border: "1px solid rgba(107,157,210,0.18)",
                  background: "rgba(6,24,44,0.86)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Save List
              </button>
              <button
                type="button"
                onClick={emailShare}
                style={{
                  height: "40px",
                  borderRadius: "12px",
                  border: "1px solid rgba(107,157,210,0.18)",
                  background: "rgba(6,24,44,0.86)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Email Share
              </button>
              <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.45 }}>
                {selectedEvents.length > 0
                  ? `${selectedEvents.length} selected conference${selectedEvents.length === 1 ? "" : "s"} ready for list or email share.`
                  : activeEvent
                    ? `Active record: ${activeEvent.title}`
                    : "No record selected yet."}
              </div>
              {feedback ? (
                <div style={{ color: "#dbeafe", fontSize: "12px", fontWeight: 800 }}>{feedback}</div>
              ) : null}
            </section>

            <section
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(107,157,210,0.16)",
                background: "rgba(8,31,55,0.46)",
                padding: "14px",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Saved filters
              </div>
              {savedFilters.length > 0 ? (
                savedFilters.slice(0, 3).map((item) => (
                  <div key={item.id} style={{ borderRadius: "14px", border: "1px solid rgba(107,157,210,0.14)", background: "rgba(6,24,44,0.78)", padding: "12px" }}>
                    <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: 850 }}>{item.name}</div>
                    <div style={{ color: "#9fb5cf", fontSize: "12px", marginTop: "4px" }}>{item.summary}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.45 }}>
                  No filters saved yet.
                </div>
              )}
            </section>

            <section
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(107,157,210,0.16)",
                background: "rgba(8,31,55,0.46)",
                padding: "14px",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Saved lists
              </div>
              {savedLists.length > 0 ? (
                savedLists.slice(0, 3).map((item) => (
                  <div key={item.id} style={{ borderRadius: "14px", border: "1px solid rgba(107,157,210,0.14)", background: "rgba(6,24,44,0.78)", padding: "12px" }}>
                    <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: 850 }}>{item.name}</div>
                    <div style={{ color: "#9fb5cf", fontSize: "12px", marginTop: "4px" }}>{item.eventIds.length} conference{item.eventIds.length === 1 ? "" : "s"} saved</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.45 }}>
                  Save a selected set for email sharing or follow-up workflows.
                </div>
              )}
            </section>
          </>
        )}
      </aside>
    </div>
  );
}
