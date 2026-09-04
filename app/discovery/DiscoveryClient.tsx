"use client";

import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AddToCalendar from "../components/AddToCalendar";
import ConcentrationStrip from "../components/ConcentrationStrip";
import type { ConcentrationItem } from "../components/ConcentrationStrip";
import SharedFilterRail from "../components/platform/SharedFilterRail";
import FilterMatchingControl, { type FilterMatchMode } from "../components/platform/FilterMatchingControl";
import ControlPanel from "../components/platform/ControlPanel";
import ContextHelpIcon from "../components/platform/ContextHelpIcon";
import { getCachedEventPage, getOrFetchEventPage, seedEventPage } from "../components/platform/eventDataCache";

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
  audience: string;
  region: string;
  format: string;
  publicCompanySector?: string;
  conferenceType?: string;
  industry?: string;
  investmentFocus?: string;
  targetAudience?: string;
  companyParticipants?: string;
  eventFeatures?: string;
  accessModel?: string;
  marketCap?: string;
  additionalPublicCompanySectors?: string;
  eventCharacter?: string;
  organizerType?: string;
  verificationStatus?: string;
  dataCompletenessScore?: string;
  websiteApproval?: string;
  verificationStamp?: string;
};

type SavedList = { id: string; name: string; eventIds: string[]; createdAt: string };
type SavedView = { id: string; name: string; filters: FiltersState; filterMode?: FilterMatchMode; createdAt: string; eventCount?: number };
type RecentActivity = { id: string; type: "event" | "feed" | "view"; label: string; detail?: string; at: string };

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
  targetAudience: string[];
  companyParticipants: string[];
  eventFeatures: string[];
  accessModel: string[];
  marketCap: string[];
  organizer: string[];
  marketFocus: string[];
};

type AnalysisAction =
  | { type: "sectorTheme"; value: string }
  | { type: "conferenceType"; value: string }
  | { type: "marketFocus"; value: string }
  | { type: "issuerParticipation"; value: string }
  | { type: "city"; value: string }
  | { type: "organizer"; value: string }
  | { type: "week"; from: string; to: string };

type MarketSignalType = "hotweek" | "cluster" | "issuerAccess" | "allocator" | "dealMaking" | "investmentFocus" | "industry" | "organizer";

type MarketSignalAction =
  | { kind: "analysis"; action: AnalysisAction }
  | { kind: "cluster"; item: ConcentrationItem };

type MarketSignalStrip = {
  id: string;
  type: MarketSignalType;
  family: MarketSignalType;
  score: number;
  eventIds: string[];
  label: string;
  badge?: string;
  headline: string;
  body: string;
  cta: string;
  action: MarketSignalAction;
};

type Props = {
  events: WorkspaceEvent[];
  initialPage: {
    total: number;
    nextCursor: string | null;
    filterOptions: DiscoveryFilterOptions;
    aggregates: DiscoveryAggregateStats;
    allAggregates: DiscoveryAggregateStats;
    marketAnalytics?: MarketViewAnalytics;
    allMarketAnalytics?: MarketViewAnalytics;
  };
  initialCity: string;
  initialSearchQuery?: string;
  initialEventId?: string;
  initialMode?: "getstarted" | "market" | "marketview" | "about" | "contact" | "legal" | "subscribe" | "submit";
  previewContext?: {
    generatedAt: string;
    publicCounts: {
      totalRecords: number;
      approvedVisibleRecords: number;
      verifiedApprovedRecords: number;
      pendingApprovalRecords: number;
    };
    freshness: {
      latestVerifiedDate: string | null;
      approvedRecordsWithVerificationStamp: number;
      approvedRecordsMissingVerificationStamp: number;
    };
    approvedCoverage: {
      earliestDate: string | null;
      latestDate: string | null;
      monthsCovered: number;
      meaningfulCoverageMonths: number;
      strongestConsecutiveRun: {
        startMonth: string | null;
        endMonth: string | null;
        length: number;
      };
    };
  } | null;
};

const INITIAL_VISIBLE_EVENTS = 20;
const LOAD_MORE_INCREMENT = INITIAL_VISIBLE_EVENTS;

type DiscoveryFilterOptions = {
  cities: string[];
  regions: string[];
  countries: string[];
  states: string[];
  themes: string[];
  publicCompanySectors: string[];
  conferenceTypes: string[];
  issuers: string[];
  targetAudiences: string[];
  companyParticipants: string[];
  eventFeatures: string[];
  accessModels: string[];
  marketCaps: string[];
  organizers: string[];
  marketFocuses: string[];
};

type DiscoveryAggregateStats = {
  events: number;
  organizers: number;
  states: number;
  cities: number;
  themes: number;
  focus: number;
  investorHeavy: number;
  issuerAccess: number;
  verified: number;
  hotWeeks: number;
  highestActivityWeek: { label: string; count: number } | null;
  lowestActivityWeek: { label: string; count: number } | null;
  leadingSector: { label: string; count: number } | null;
  mostActiveDealWeek: { label: string; count: number } | null;
  earliestDate: string | null;
  latestDate: string | null;
  latestVerificationStamp: string | null;
  quickFeeds: {
    investorConferences: number;
    healthcareConferences: number;
    privateMarkets: number;
    canadaEvents: number;
    upcoming30: number;
    hotWeeks: number;
  };
};

type RankedCount = [string, number];
type MarketWeek = { weekStart: string; count: number };
type MarketWindow = {
  count: number;
  bestWeek: MarketWeek;
  bestWeekCity: { city: string };
  bestWeekCities: string[];
};
type MarketViewAnalytics = {
  total: number;
  cityCounts: RankedCount[];
  organizerCounts: RankedCount[];
  themeCounts: RankedCount[];
  focusCounts: RankedCount[];
  categoryCounts: RankedCount[];
  formatCounts: RankedCount[];
  sectorCounts: RankedCount[];
  audienceCounts: RankedCount[];
  eventCharacterCounts: RankedCount[];
  issuerParticipationCounts: RankedCount[];
  verificationStatusCounts: RankedCount[];
  weekCounts: MarketWeek[];
  monthCounts: { month: string; count: number }[];
  statesCount: number;
  citiesCount: number;
  organizersCount: number;
  themesCount: number;
  issuerAccessCount: number;
  issuerOnlyCount: number;
  noIssuerCount: number;
  institutionalCount: number;
  investorOnlyCount: number;
  mixedCount: number;
  presentationCount: number;
  oneOnOneCount: number;
  presentationAndOneOnOneCount: number;
  issuerWindow: MarketWindow;
  institutionalWindow: MarketWindow;
  sectorWindows: { sector: string; count: number; peakWeek: MarketWeek; topCity: string; topCities: string[]; issuerAccessCount: number; investorHeavyCount: number }[];
  focusIntelligence: { label: string; count: number; topCity: string; peakWeek: MarketWeek; issuerAccessCount: number }[];
  topRegion: string;
  canadaCount: number;
  usCount: number;
  organizerInvestorHeavy: string;
  organizerIssuerAccess: string;
  mostGeographicOrganizer: { organizer: string; cities: number } | null;
  verifiedCount: number;
  websiteApprovedCount: number;
  eventCharacterCoverage: number;
  coverageMetrics: { label: string; count: number }[];
  venueCount: number;
  eventLinkCount: number;
  formatTaggedCount: number;
  weekInsights: Record<string, { topAudience: string; topFocus: string; topIssuerParticipation: string; topCity: string; topCities: string[]; investorHeavyCount: number; issuerHeavyCount: number; typeLabel: string; actionLine: string }>;
  dealClientPulse: {
    dealMakingEvents: number;
    structuredAccessEvents: number;
    dealMakingWithAccess: number;
    accessBreakdown: { label: string; count: number }[];
    audienceCounts: RankedCount[];
    topWeek: MarketWeek;
    topCities: RankedCount[];
    examples: { id: string; title: string; startDate: string; endDate: string; city: string; state: string; organizer: string; issuerParticipation: string; audience: string; eventCharacter: string; sectorThemes: string; marketFocus: string }[];
  };
  dealLocations: {
    cities: { city: string; dealMakingEvents: number; structuredAccessEvents: number; combinedEvents: number; topWeek: MarketWeek }[];
    weeks: { weekStart: string; dealMakingEvents: number; structuredAccessEvents: number; combinedEvents: number; cities: string[] }[];
  };
};

type DiscoveryPageResponse = {
  events: WorkspaceEvent[];
  total: number;
  nextCursor: string | null;
  filterOptions: DiscoveryFilterOptions;
  aggregates: DiscoveryAggregateStats;
  allAggregates: DiscoveryAggregateStats;
  marketAnalytics?: MarketViewAnalytics;
  allMarketAnalytics?: MarketViewAnalytics;
};

function normalizeDiscoveryAggregateStats(stats?: Partial<DiscoveryAggregateStats>): DiscoveryAggregateStats {
  return {
    events: stats?.events || 0,
    organizers: stats?.organizers || 0,
    states: stats?.states || 0,
    cities: stats?.cities || 0,
    themes: stats?.themes || 0,
    focus: stats?.focus || 0,
    investorHeavy: stats?.investorHeavy || 0,
    issuerAccess: stats?.issuerAccess || 0,
    verified: stats?.verified || 0,
    hotWeeks: stats?.hotWeeks || 0,
    highestActivityWeek: stats?.highestActivityWeek || null,
    lowestActivityWeek: stats?.lowestActivityWeek || null,
    leadingSector: stats?.leadingSector || null,
    mostActiveDealWeek: stats?.mostActiveDealWeek || null,
    earliestDate: stats?.earliestDate || null,
    latestDate: stats?.latestDate || null,
    latestVerificationStamp: stats?.latestVerificationStamp || null,
    quickFeeds: {
      investorConferences: stats?.quickFeeds?.investorConferences || 0,
      healthcareConferences: stats?.quickFeeds?.healthcareConferences || 0,
      privateMarkets: stats?.quickFeeds?.privateMarkets || 0,
      canadaEvents: stats?.quickFeeds?.canadaEvents || 0,
      upcoming30: stats?.quickFeeds?.upcoming30 || 0,
      hotWeeks: stats?.quickFeeds?.hotWeeks || 0,
    },
  };
}

function emptyMarketWindow(): MarketWindow {
  return { count: 0, bestWeek: { weekStart: "", count: 0 }, bestWeekCity: { city: "N/A" }, bestWeekCities: [] };
}

function normalizeMarketViewAnalytics(analytics?: Partial<MarketViewAnalytics>): MarketViewAnalytics {
  return {
    total: analytics?.total || 0,
    cityCounts: analytics?.cityCounts || [], organizerCounts: analytics?.organizerCounts || [], themeCounts: analytics?.themeCounts || [],
    focusCounts: analytics?.focusCounts || [], categoryCounts: analytics?.categoryCounts || [], formatCounts: analytics?.formatCounts || [],
    sectorCounts: analytics?.sectorCounts || [], audienceCounts: analytics?.audienceCounts || [], eventCharacterCounts: analytics?.eventCharacterCounts || [],
    issuerParticipationCounts: analytics?.issuerParticipationCounts || [], verificationStatusCounts: analytics?.verificationStatusCounts || [],
    weekCounts: analytics?.weekCounts || [], monthCounts: analytics?.monthCounts || [], statesCount: analytics?.statesCount || 0,
    citiesCount: analytics?.citiesCount || 0, organizersCount: analytics?.organizersCount || 0, themesCount: analytics?.themesCount || 0,
    issuerAccessCount: analytics?.issuerAccessCount || 0, issuerOnlyCount: analytics?.issuerOnlyCount || 0, noIssuerCount: analytics?.noIssuerCount || 0,
    institutionalCount: analytics?.institutionalCount || 0, investorOnlyCount: analytics?.investorOnlyCount || 0, mixedCount: analytics?.mixedCount || 0,
    presentationCount: analytics?.presentationCount || 0, oneOnOneCount: analytics?.oneOnOneCount || 0,
    presentationAndOneOnOneCount: analytics?.presentationAndOneOnOneCount || 0,
    issuerWindow: analytics?.issuerWindow || emptyMarketWindow(), institutionalWindow: analytics?.institutionalWindow || emptyMarketWindow(),
    sectorWindows: analytics?.sectorWindows || [], focusIntelligence: analytics?.focusIntelligence || [], topRegion: analytics?.topRegion || "",
    canadaCount: analytics?.canadaCount || 0, usCount: analytics?.usCount || 0, organizerInvestorHeavy: analytics?.organizerInvestorHeavy || "",
    organizerIssuerAccess: analytics?.organizerIssuerAccess || "", mostGeographicOrganizer: analytics?.mostGeographicOrganizer || null,
    verifiedCount: analytics?.verifiedCount || 0, websiteApprovedCount: analytics?.websiteApprovedCount || 0,
    eventCharacterCoverage: analytics?.eventCharacterCoverage || 0, coverageMetrics: analytics?.coverageMetrics || [],
    venueCount: analytics?.venueCount || 0, eventLinkCount: analytics?.eventLinkCount || 0, formatTaggedCount: analytics?.formatTaggedCount || 0,
    weekInsights: analytics?.weekInsights || {},
    dealClientPulse: analytics?.dealClientPulse || {
      dealMakingEvents: 0, structuredAccessEvents: 0, dealMakingWithAccess: 0, accessBreakdown: [], audienceCounts: [], topWeek: { weekStart: "", count: 0 }, topCities: [], examples: [],
    },
    dealLocations: analytics?.dealLocations || { cities: [], weeks: [] },
  };
}

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
  targetAudience: [],
  companyParticipants: [],
  eventFeatures: [],
  accessModel: [],
  marketCap: [],
  organizer: [],
  marketFocus: [],
};

type MultiFilterKey = Exclude<keyof FiltersState, "dateRange">;

function toFilterValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && Boolean(item));
  return typeof value === "string" && value ? [value] : [];
}

function normalizeFiltersState(value: Partial<FiltersState> | Record<string, unknown>): FiltersState {
  return {
    dateRange: value.dateRange === "next30" || value.dateRange === "next60" || value.dateRange === "next90" || value.dateRange === "all" ? value.dateRange : "all",
    country: toFilterValues(value.country),
    region: toFilterValues(value.region),
    state: toFilterValues(value.state),
    cities: toFilterValues(value.cities),
    sectorThemes: toFilterValues(value.sectorThemes),
    publicCompanySectors: toFilterValues(value.publicCompanySectors),
    conferenceType: toFilterValues(value.conferenceType),
    issuerParticipation: toFilterValues(value.issuerParticipation),
    targetAudience: toFilterValues(value.targetAudience),
    companyParticipants: toFilterValues(value.companyParticipants),
    eventFeatures: toFilterValues(value.eventFeatures),
    accessModel: toFilterValues(value.accessModel),
    marketCap: toFilterValues(value.marketCap),
    organizer: toFilterValues(value.organizer),
    marketFocus: toFilterValues(value.marketFocus),
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function splitCsv(value: string) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function getTopByCount(items: string[]) {
  const map = new Map<string, number>();
  items.filter(Boolean).forEach((item) => map.set(item, (map.get(item) || 0) + 1));
  return Array.from(map.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });
}

function getCityValue(event: WorkspaceEvent) {
  return [event.city, event.state].filter(Boolean).join(", ").trim();
}

function getOrganizerValue(event: WorkspaceEvent) {
  return (event.organizer || "").trim();
}

function getMarketFocusValues(event: WorkspaceEvent) {
  return splitCsv(event.investmentFocus || "");
}

function getThemeValues(event: WorkspaceEvent) {
  return splitCsv(event.industry || "");
}

function formatPreviewDate(value: string | null | undefined) {
  if (!value) return "Not yet stamped";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPublicCompanySectorValues(event: WorkspaceEvent) {
  return splitCsv(event.industry || "");
}

function getSectorLabels(event: WorkspaceEvent) {
  const publicCompanySectors = getPublicCompanySectorValues(event);
  if (publicCompanySectors.length) return publicCompanySectors;
  return getThemeValues(event);
}

function getEventCharacterValues(event: WorkspaceEvent) {
  return splitCsv(event.eventFeatures || "");
}

function getAudienceValues(event: WorkspaceEvent) {
  return unique([
    ...splitCsv(event.targetAudience || ""),
    ...splitCsv(event.companyParticipants || ""),
    ...splitCsv(event.eventFeatures || ""),
    ...splitCsv(event.accessModel || ""),
  ]).filter((value) =>
    /(institutional investors?|family offices?|private equity|venture capital|retail investors?|public company|issuer|mixed participation|company presentations|1x1|one-on-one|industry networking|public markets|private markets)/i.test(
      value
    )
  );
}

function getParticipationText(event: WorkspaceEvent) {
  return [
    event.conferenceType,
    event.industry,
    event.investmentFocus,
    event.targetAudience,
    event.companyParticipants,
    event.eventFeatures,
    event.accessModel,
    event.marketCap,
  ]
    .filter(Boolean)
    .join(", ")
    .toLowerCase();
}

function isInvestorHeavy(event: WorkspaceEvent) {
  const conferenceTypes = splitCsv(event.conferenceType || "").map((value) => value.toLowerCase());
  const targetAudiences = splitCsv(event.targetAudience || "").map((value) => value.toLowerCase());
  return conferenceTypes.includes("allocator / manager forum") ||
    targetAudiences.some((value) => ["institutional investors / asset managers", "family offices", "allocators / pensions / endowments"].includes(value));
}

function isIssuerHeavy(event: WorkspaceEvent) {
  return hasIssuerAccess(event);
}

function hasNoIssuerParticipation(event: WorkspaceEvent) {
  return /no issuer participation|without issuer participation|issuer not participating/i.test(
    getParticipationText(event)
  );
}

function hasIssuerAccess(event: WorkspaceEvent) {
  if (hasNoIssuerParticipation(event)) return false;
  const conferenceTypes = splitCsv(event.conferenceType || "").map((value) => value.toLowerCase());
  const features = splitCsv(event.eventFeatures || "").map((value) => value.toLowerCase());
  const participants = splitCsv(event.companyParticipants || "").map((value) => value.toLowerCase());
  const hasIssuerType = conferenceTypes.some((value) => value === "issuer access conference" || value === "sell-side / corporate access");
  const hasStructuredFeature = features.some((value) => value === "company presentations" || value === "1x1 meetings");
  const hasPublicCompanyParticipant = participants.some((value) => value === "public company executives" || value === "public company ir / corporate access");
  return hasIssuerType || (hasStructuredFeature && hasPublicCompanyParticipant);
}

function isMixedParticipation(event: WorkspaceEvent) {
  return hasIssuerAccess(event) && isInvestorHeavy(event);
}

function getAudienceCounts(events: WorkspaceEvent[]) {
  return getTopByCount(events.flatMap((event) => getAudienceValues(event)));
}

function getIssuerParticipationCounts(events: WorkspaceEvent[]) {
  return getTopByCount(
    events.flatMap((event) => {
      const labels = splitCsv(event.companyParticipants || "");
      return labels.length ? labels : event.companyParticipants ? [event.companyParticipants] : [];
    })
  );
}

function getMarketFocusCounts(events: WorkspaceEvent[]) {
  return getTopByCount(
    events.flatMap((event) => {
      return splitCsv(event.investmentFocus || "");
    })
  );
}

function getSectorCounts(events: WorkspaceEvent[]) {
  return getTopByCount(events.flatMap((event) => getSectorLabels(event)));
}

function getEventCharacterCounts(events: WorkspaceEvent[]) {
  return getTopByCount(events.flatMap((event) => getEventCharacterValues(event)));
}

function buildWindowStats(items: WorkspaceEvent[]) {
  const weekCounts = Array.from(
    items.reduce((map, event) => {
      const week = getWeekStart(event.startDate);
      if (!week) return map;
      map.set(week, (map.get(week) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => b.count - a.count || a.weekStart.localeCompare(b.weekStart));

  const weekCityCounts = Array.from(
    items.reduce((map, event) => {
      const week = getWeekStart(event.startDate);
      const city = [event.city, event.state].filter(Boolean).join(", ");
      if (!week || !city) return map;
      const key = `${week}__${city}`;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([key, count]) => {
      const [weekStart, city] = key.split("__");
      return { weekStart, city, count };
    })
    .sort((a, b) => b.count - a.count || a.weekStart.localeCompare(b.weekStart));

  const bestWeek = weekCounts[0] || { weekStart: "", count: 0 };
  const bestWeekCity =
    weekCityCounts.find((item) => item.weekStart === bestWeek.weekStart) ||
    weekCityCounts[0] ||
    { city: "N/A", count: 0, weekStart: bestWeek.weekStart };
  const bestWeekCities = weekCityCounts
    .filter((item) => item.weekStart === bestWeek.weekStart)
    .slice(0, 3)
    .map((item) => item.city);

  return {
    count: items.length,
    bestWeek,
    bestWeekCity,
    bestWeekCities,
    weekCounts,
  };
}

function buildSectorOpportunityWindows(events: WorkspaceEvent[]) {
  const sectorMap = new Map<string, WorkspaceEvent[]>();
  events.forEach((event) => {
    getSectorLabels(event).forEach((sector) => {
      sectorMap.set(sector, [...(sectorMap.get(sector) || []), event]);
    });
  });

  return Array.from(sectorMap.entries())
    .map(([sector, sectorEvents]) => {
      const issuerAccessEvents = sectorEvents.filter(hasIssuerAccess);
      const investorHeavyEvents = sectorEvents.filter(isInvestorHeavy);
      const cityCounts = getTopByCount(sectorEvents.map(getCityValue));
      const peakWeek = buildWindowStats(sectorEvents).bestWeek;
      return {
        sector,
        count: sectorEvents.length,
        issuerAccessCount: issuerAccessEvents.length,
        investorHeavyCount: investorHeavyEvents.length,
        topCity: cityCounts[0]?.[0] || "N/A",
        topCities: cityCounts.slice(0, 3).map(([city]) => city),
        peakWeek,
      };
    })
    .sort((a, b) => b.count - a.count || a.sector.localeCompare(b.sector))
    .slice(0, 5);
}

function getWeekStart(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getWeekEndFromStart(weekStart: string) {
  const d = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(start.getTime())) return weekStart;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  return startMonth === endMonth ? `${startMonth} ${startDay}-${endDay}` : `${startMonth} ${startDay}-${endMonth} ${endDay}`;
}

function addDaysISO(baseIso: string, days: number) {
  const d = new Date(`${baseIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return baseIso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatMonthDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    e.conferenceType ? `Conference Type: ${e.conferenceType}` : "",
    e.investmentFocus ? `Investment Focus: ${e.investmentFocus}` : "",
    e.companyParticipants ? `Company Participants: ${e.companyParticipants}` : "",
    e.eventFeatures ? `Event Features: ${e.eventFeatures}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

type InsightEvidence = {
  fieldsUsed: string[];
  relatedEventIds?: string[];
  sharedSectorThemes?: string[];
  daysApart?: number;
  sameCity?: boolean;
  sameState?: boolean;
  sameRegion?: boolean;
};

type DetailInsight = {
  type: string;
  title: string;
  explanation: string;
  priority: number;
  confidence: "high" | "medium" | "low";
  evidence: InsightEvidence;
};

type RelatedMatch = {
  related: WorkspaceEvent;
  score: number;
  confidence: "high" | "medium" | "low";
  explanation: string;
  relationshipTypes: string[];
  tags: string[];
  evidence: InsightEvidence;
  sharedThemes: string[];
  sharedFocus: string[];
  sharedIssuerParticipation: string[];
  sameCity: boolean;
  sameState: boolean;
  sameRegion: boolean;
  sameWeek: boolean;
  tripExtension: boolean;
  sameOrganizer: boolean;
  categoryMatch: boolean;
  bothPresentations: boolean;
  bothOneOnOne: boolean;
  daysApart: number;
  meaningfulSignals: number;
};

function parseDateOnly(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function differenceInDays(fromIso: string, toIso: string) {
  const from = parseDateOnly(fromIso);
  const to = parseDateOnly(toIso);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function getMonthKey(iso: string) {
  const date = parseDateOnly(iso);
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getEventEndIso(event: WorkspaceEvent) {
  return event.endDate || event.startDate;
}

function sharedValues(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

function getIssuerValues(event: WorkspaceEvent) {
  return splitCsv(event.companyParticipants || "");
}

function eventHasPresentations(event: WorkspaceEvent) {
  return splitCsv(event.eventFeatures || "").some((value) => value.toLowerCase() === "company presentations");
}

function eventHasOneOnOneAccess(event: WorkspaceEvent) {
  return splitCsv(event.eventFeatures || "").some((value) => value.toLowerCase() === "1x1 meetings");
}

function getDerivedParticipationSignals(event: WorkspaceEvent) {
  const signals: string[] = [];
  if (eventHasPresentations(event)) signals.push("Company Presentations");
  if (eventHasOneOnOneAccess(event)) signals.push("1x1 Meetings");
  return signals;
}

function getPrimaryParticipationLabel(event: WorkspaceEvent) {
  const derived = getDerivedParticipationSignals(event);
  if (derived.length) return derived[0];
  return splitCsv(event.companyParticipants || "")[0] || event.companyParticipants || "";
}

function buildMatchExplanation(base: WorkspaceEvent, match: Omit<RelatedMatch, "explanation" | "confidence" | "tags" | "evidence">) {
  const clauses: string[] = [];
  if (match.sharedThemes.length) clauses.push(`Shares ${match.sharedThemes.slice(0, 2).join(" and ")} industry exposure`);
  else if (match.sharedFocus.length) clauses.push(`Targets the same ${match.sharedFocus.slice(0, 2).join(" and ")} investment focus`);
  else if (match.sharedIssuerParticipation.length) clauses.push(`Uses the same ${match.sharedIssuerParticipation.slice(0, 2).join(" and ")} company participant profile`);
  else if (match.categoryMatch && base.conferenceType) clauses.push(`Matches the ${base.conferenceType} conference type`);

  if (match.bothPresentations) clauses.push("both include public-company presentations");
  if (match.bothOneOnOne) clauses.push("both offer one-on-one access");

  if (match.sameCity) clauses.push(`takes place in ${getCityValue(match.related) || "the same city"}`);
  else if (match.sameState) clauses.push(`takes place elsewhere in ${match.related.state}`);
  else if (match.sameRegion && match.related.region) clauses.push(`stays within the ${match.related.region} region`);

  if (match.tripExtension && match.daysApart >= 0) clauses.push(`${match.daysApart} day${match.daysApart === 1 ? "" : "s"} after this event`);
  else if (match.daysApart >= 0 && match.daysApart <= 45) clauses.push(`${match.daysApart} day${match.daysApart === 1 ? "" : "s"} later`);
  else if (match.daysApart < 0) clauses.push(`${Math.abs(match.daysApart)} day${Math.abs(match.daysApart) === 1 ? "" : "s"} earlier`);
  else if (match.sameWeek) clauses.push("during the same calendar week");

  const first = clauses.shift();
  if (!first) return "Shares relevant timing and conference-profile signals with this event.";
  const tail = clauses.slice(0, 2);
  return `${first}${tail.length ? `, ${tail.join(", ")}` : ""}.`;
}

function buildRelatedMatch(base: WorkspaceEvent, related: WorkspaceEvent): RelatedMatch {
  const baseCity = getCityValue(base);
  const relatedCity = getCityValue(related);
  const sharedThemes = sharedValues(getThemeValues(base), getThemeValues(related));
  const sharedFocus = sharedValues(getMarketFocusValues(base), getMarketFocusValues(related));
  const sharedIssuerParticipation = sharedValues(getIssuerValues(base), getIssuerValues(related));
  const sameCity = Boolean(baseCity && relatedCity && baseCity === relatedCity);
  const sameState = Boolean(base.state && related.state && base.state === related.state && !sameCity);
  const sameRegion = Boolean(base.region && related.region && base.region === related.region && !sameCity && !sameState);
  const sameWeek = getWeekStart(base.startDate) === getWeekStart(related.startDate);
  const sameOrganizer = Boolean(base.organizer && related.organizer && base.organizer === related.organizer);
  const categoryMatch = Boolean(base.primaryCategory && related.primaryCategory && base.primaryCategory === related.primaryCategory);
  const bothPresentations = eventHasPresentations(base) && eventHasPresentations(related);
  const bothOneOnOne = eventHasOneOnOneAccess(base) && eventHasOneOnOneAccess(related);
  const daysFromEndToStart = differenceInDays(getEventEndIso(base), related.startDate);
  const daysBetweenStarts = differenceInDays(base.startDate, related.startDate);
  const daysApart = daysFromEndToStart ?? daysBetweenStarts ?? 999;
  const within7 = daysApart >= 0 && daysApart <= 7;
  const within21 = daysApart >= 0 && daysApart <= 21;
  const tripExtension = daysApart >= 1 && daysApart <= 7 && (sameCity || sameState || sameRegion);

  let score = 0;
  if (sameCity) score += 30;
  if (sameState) score += 20;
  if (sameRegion) score += 10;
  if (within7) score += 25;
  else if (within21) score += 15;
  if (sharedThemes.length) score += 25;
  if (categoryMatch) score += 10;
  if (sharedFocus.length) score += 15;
  if (sharedIssuerParticipation.length) score += 15;
  if (bothPresentations) score += 15;
  if (bothOneOnOne) score += 15;
  if (sameOrganizer) score += 8;

  const meaningfulSignals = [
    sameCity || sameState || sameRegion,
    within7 || within21 || sameWeek,
    sharedThemes.length > 0,
    sharedFocus.length > 0,
    sharedIssuerParticipation.length > 0,
    bothPresentations,
    bothOneOnOne,
    categoryMatch,
  ].filter(Boolean).length;

  const relationshipTypes = unique([
    sameCity ? "same_city" : "",
    sameState ? "same_state" : "",
    sameRegion ? "same_region" : "",
    sameWeek ? "same_week" : "",
    tripExtension ? "trip_extension" : "",
    sharedThemes.length ? "similar_industry" : "",
    sharedFocus.length ? "similar_investment_focus" : "",
    sharedIssuerParticipation.length ? "similar_company_participants" : "",
    sameOrganizer ? "same_organizer" : "",
  ]);

  const tags = [
    sameCity ? "Same City" : "",
    sameState ? "Same State" : "",
    sameRegion ? "Same Region" : "",
    sameWeek ? "Same Week" : "",
    tripExtension ? "Trip Extension" : "",
    sharedThemes.length ? "Similar Industry" : "",
    sharedFocus.length ? "Similar Investment Focus" : "",
    sharedIssuerParticipation.length ? "Similar Company Participants" : "",
    sameOrganizer ? "Same Organizer" : "",
  ].filter(Boolean);

  const explanation = buildMatchExplanation(base, {
    related,
    score,
    sharedThemes,
    sharedFocus,
    sharedIssuerParticipation,
    sameCity,
    sameState,
    sameRegion,
    sameWeek,
    tripExtension,
    sameOrganizer,
    categoryMatch,
    bothPresentations,
    bothOneOnOne,
    daysApart,
    meaningfulSignals,
    relationshipTypes,
  });

  const confidence: "high" | "medium" | "low" = score >= 70 || meaningfulSignals >= 4 ? "high" : score >= 35 || meaningfulSignals >= 3 ? "medium" : "low";

  return {
    related,
    score,
    confidence,
    explanation,
    relationshipTypes,
    tags,
    evidence: {
      fieldsUsed: unique([
        "Start Date",
        "End Date",
        sameCity || sameState || sameRegion ? "City" : "",
        sameState ? "State / Province" : "",
        sameRegion ? "Region" : "",
        sharedThemes.length ? "Industry" : "",
        sharedFocus.length ? "Investment Focus" : "",
        sharedIssuerParticipation.length || bothPresentations || bothOneOnOne ? "Company Participants / Event Features" : "",
        categoryMatch ? "Conference Type" : "",
        sameOrganizer ? "Organizer" : "",
      ]),
      relatedEventIds: [related.id],
      sharedSectorThemes: sharedThemes,
      daysApart,
      sameCity,
      sameState,
      sameRegion,
    },
    sharedThemes,
    sharedFocus,
    sharedIssuerParticipation,
    sameCity,
    sameState,
    sameRegion,
    sameWeek,
    tripExtension,
    sameOrganizer,
    categoryMatch,
    bothPresentations,
    bothOneOnOne,
    daysApart,
    meaningfulSignals,
  };
}

function AboutIcon({ kind, color }: { kind: "radar" | "calendar" | "layers" | "globe" | "zap" | "headset" | "building" | "messages" | "mail" | "warning" | "database" | "shield" | "link"; color: string }) {
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
  if (kind === "link") {
    return <svg {...common}><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.2 4.72" /><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.8 19.3" /></svg>;
  }
  if (kind === "warning") {
    return <svg {...common}><path d="M12 4 3 20h18L12 4Z" /><path d="M12 10v4M12 17h.01" /></svg>;
  }
  if (kind === "database") {
    return <svg {...common}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" /></svg>;
  }
  if (kind === "shield") {
    return <svg {...common}><path d="M12 3 5 6v6c0 5 3.4 8.3 7 9 3.6-.7 7-4 7-9V6l-7-3Z" /><path d="M9 12h6" /></svg>;
  }
  return <svg {...common}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" /></svg>;
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
  // Lucide-like: calendar-days, map-pin, chart-column, users, building-2
  if (kind === "date") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M8 2v4M16 2v4" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    );
  }
  if (kind === "location") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 22s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
        <circle cx="12" cy="11" r="2.8" />
      </svg>
    );
  }
  if (kind === "segments") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 15v3M12 10v8M17 6v12" />
      </svg>
    );
  }
  if (kind === "participation") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a3 3 0 0 1 0 5.74" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <rect x="3" y="3" width="7" height="18" rx="1.5" />
      <rect x="14" y="7" width="7" height="14" rx="1.5" />
      <path d="M6.5 7h.01M6.5 11h.01M6.5 15h.01M17.5 11h.01M17.5 15h.01" />
    </svg>
  );
}

function MarketSignalIcon({ kind, color }: { kind: MarketSignalType; color: string }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.85,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (kind === "hotweek") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3c.7 2 2.3 3.5 3.8 4.8 1.7 1.5 3.2 3.2 3.2 6a7 7 0 1 1-14 0c0-3.4 2.1-5.8 4.7-8.4.9-.9 1.8-1.7 2.3-2.4Z" />
        <path d="M12 13c1 1 1.7 2 1.7 3.1A2.7 2.7 0 0 1 11 18.8a2.6 2.6 0 0 1-2.7-2.7c0-1.6.9-2.6 2.1-3.9" />
      </svg>
    );
  }
  if (kind === "cluster") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 21s6-4.6 6-9.5a6 6 0 1 0-12 0C6 16.4 12 21 12 21Z" />
        <circle cx="12" cy="11" r="2.5" />
        <path d="M18.5 6.5 21 4M2.5 6.5 5 4M20.5 12H23M1 12h2.5" />
      </svg>
    );
  }
  if (kind === "issuerAccess" || kind === "allocator" || kind === "dealMaking") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 18v-5M10 18V8M16 18v-8M22 18v-3" />
        <path d="M3 20h20" />
      </svg>
    );
  }
  if (kind === "investmentFocus" || kind === "industry") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 16l4-4 3 3 7-7" />
        <path d="M14 8h4v4" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
    </svg>
  );
}

function DiscoveryStatIcon({ kind }: { kind: "conferences" | "organizers" | "cities" | "states" | "themes" }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#9ec5ff",
    strokeWidth: 1.85,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  // Lucide-style anchors: CalendarDays, Building2, MapPin, Map, Tags
  if (kind === "conferences") return <svg {...common}><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
  if (kind === "organizers") return <svg {...common}><rect x="3" y="3" width="7" height="18" rx="1.5" /><rect x="14" y="7" width="7" height="14" rx="1.5" /><path d="M6.5 7h.01M6.5 11h.01M6.5 15h.01M17.5 11h.01M17.5 15h.01" /></svg>;
  if (kind === "cities") return <svg {...common}><path d="M12 22s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="11" r="2.8" /></svg>;
  if (kind === "states") return <svg {...common}><path d="m3 7 5-2 4 2 5-2 4 2v10l-4 2-5-2-4 2-5-2V7Z" /><path d="M8 5v12M12 7v12M17 5v12" /></svg>;
  return <svg {...common}><path d="M20 10V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" /><path d="M2 10h20" /><path d="M7 14h.01M12 14h.01M17 14h.01" /><path d="M7 18h.01M12 18h.01M17 18h.01" /></svg>;
}

function MarketViewIcon({
  kind,
  color = "#9ec5ff",
}: {
  kind:
    | "calendar"
    | "building"
    | "mappin"
    | "map"
    | "tag"
    | "target"
    | "clock"
    | "flame"
    | "users"
    | "trend"
    | "layers"
    | "globe";
  color?: string;
}) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.85,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "calendar") return <svg {...common}><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
  if (kind === "building") return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" /><path d="M10 21v-3h4v3" /></svg>;
  if (kind === "mappin") return <svg {...common}><path d="M12 22s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="11" r="2.8" /></svg>;
  if (kind === "map") return <svg {...common}><path d="m3 7 5-2 4 2 5-2 4 2v10l-4 2-5-2-4 2-5-2V7Z" /><path d="M8 5v12M12 7v12M17 5v12" /></svg>;
  if (kind === "tag") return <svg {...common}><path d="M20 10V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" /><path d="M2 10h20" /><path d="M7 14h.01M12 14h.01M17 14h.01" /><path d="M7 18h.01M12 18h.01M17 18h.01" /></svg>;
  if (kind === "target") return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1.5" /></svg>;
  if (kind === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></svg>;
  if (kind === "flame") return <svg {...common}><path d="M12 3c1.4 2.7 3.6 4.2 3.6 7a3.6 3.6 0 1 1-7.2 0c0-1.9 1.1-3.2 2.3-4.7.7-.9 1.3-1.8 1.3-2.3Z" /><path d="M12 13c.8 1 1.8 1.7 1.8 3a1.8 1.8 0 1 1-3.6 0c0-.9.5-1.5 1-2.2.3-.3.6-.6.8-.8Z" /></svg>;
  if (kind === "users") return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="3" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a3 3 0 0 1 0 5.74" /></svg>;
  if (kind === "trend") return <svg {...common}><path d="M3 17 9 11l4 4 8-8" /><path d="M14 7h7v7" /></svg>;
  if (kind === "layers") return <svg {...common}><path d="m12 4-9 5 9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13.5 13.5 0 0 1 0 18" /><path d="M12 3a13.5 13.5 0 0 0 0 18" /></svg>;
}

function WorkspaceViewIcon({ kind }: { kind: "database" | "calendar" | "map" }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "database") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16M15 4v16" /></svg>;
  if (kind === "calendar") return <svg {...common}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>;
  return <svg {...common}><path d="M3 7h6l2-3 3 2h7v3l-4 1-2 4-5 1-2 4-5-3z" /></svg>;
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
  color = "#e6dbff",
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

function DiscoveryEventSkeletonCards() {
  return (
    <div className="event-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "12px", width: "100%", maxWidth: "100%", minWidth: 0 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <article
          key={`discovery-skeleton-${index}`}
          style={{
            minHeight: "154px",
            borderRadius: "16px",
            border: "1px solid rgba(96,165,250,0.16)",
            background: "linear-gradient(180deg, rgba(8,30,53,0.72), rgba(5,21,38,0.82))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            padding: "16px",
            display: "grid",
            gap: "14px",
          }}
        >
          <div style={{ height: "15px", width: index % 2 ? "56%" : "68%", borderRadius: "999px", background: "linear-gradient(90deg, rgba(96,165,250,0.10), rgba(147,197,253,0.24), rgba(96,165,250,0.10))" }} />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[0, 1, 2].map((item) => (
              <span key={item} style={{ height: "22px", width: item === 0 ? "90px" : "118px", borderRadius: "999px", background: "rgba(147,197,253,0.10)", border: "1px solid rgba(147,197,253,0.10)" }} />
            ))}
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ height: "11px", width: "92%", borderRadius: "999px", background: "rgba(203,213,225,0.12)" }} />
            <div style={{ height: "11px", width: "74%", borderRadius: "999px", background: "rgba(203,213,225,0.10)" }} />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function EventsClient({
  events: initialEvents,
  initialPage,
  initialCity: _initialCity,
  initialSearchQuery = "",
  initialEventId = "",
  initialMode = "getstarted",
  previewContext = null,
}: Props) {
  const PANEL_HEIGHT = "calc(100vh - 126px)";
  const centerWorkspaceRef = useRef<HTMLElement | null>(null);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);
  const firstResultCardRef = useRef<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [filterMode, setFilterMode] = useState<FilterMatchMode>("and");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const shouldLoadInitialDiscovery = initialEvents.length === 0 && initialPage.total === 0;
  const [events, setEvents] = useState<WorkspaceEvent[]>(initialEvents);
  const [discoveryPage, setDiscoveryPage] = useState(() => ({
    total: initialPage.total,
    nextCursor: initialPage.nextCursor,
    filterOptions: initialPage.filterOptions,
    aggregates: normalizeDiscoveryAggregateStats(initialPage.aggregates),
    allAggregates: normalizeDiscoveryAggregateStats(initialPage.allAggregates || initialPage.aggregates),
    marketAnalytics: normalizeMarketViewAnalytics(initialPage.marketAnalytics),
    allMarketAnalytics: normalizeMarketViewAnalytics(initialPage.allMarketAnalytics || initialPage.marketAnalytics),
  }));
  const [isLoadingEvents, setIsLoadingEvents] = useState(shouldLoadInitialDiscovery);
  const dataIsBootstrapping = shouldLoadInitialDiscovery && isLoadingEvents && events.length === 0;
  const [eventLoadError, setEventLoadError] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [activeSavedListId, setActiveSavedListId] = useState<string | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeQuickView, setActiveQuickView] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [urlEventIds, setUrlEventIds] = useState<string[]>(initialEventId ? [initialEventId] : []);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"soonest" | "city">("soonest");
  const [urlSeeded, setUrlSeeded] = useState(false);
  const [activeToolbarAction, setActiveToolbarAction] = useState<string>("");
  const [toolbarHelpText, setToolbarHelpText] = useState<string>("");
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(true);
  const [savedConferenceListsOpen, setSavedConferenceListsOpen] = useState(false);
  const [savedMarketViewsOpen, setSavedMarketViewsOpen] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<"getstarted" | "market" | "marketview" | "about" | "contact" | "legal" | "subscribe" | "submit">(initialMode);
  const infoDashboardMode = dashboardMode as "about" | "contact" | "subscribe" | "submit";
  const [workspaceViewMode, setWorkspaceViewMode] = useState<"database" | "calendar" | "map">("database");
  const [calendarSelected, setCalendarSelected] = useState<{ weekStart: string; eventId: string } | null>(null);
  const [calendarDetailDataset, setCalendarDetailDataset] = useState<"filtered" | "all">("filtered");
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [expandedRelatedGroups, setExpandedRelatedGroups] = useState<Record<string, boolean>>({});
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
  const [accessRequestForm, setAccessRequestForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    audience: "Investor",
  });
  const [accessRequestMessage, setAccessRequestMessage] = useState<string>("");
  const [saveListChoice, setSaveListChoice] = useState<string>("new");
  const saveMenuRef = useRef<HTMLDivElement | null>(null);
  const toolbarActionTimerRef = useRef<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isTabletViewport, setIsTabletViewport] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"filters" | "workspace" | "intel" | null>(null);
  const [mobileSearchTerm, setMobileSearchTerm] = useState(initialSearchQuery || "");
  const [marketViewDataset, setMarketViewDataset] = useState<"all" | "filtered">("all");
  const [marketViewRange, setMarketViewRange] = useState<"8w" | "30d" | "90d">("8w");
  const [concentrationExpanded, setConcentrationExpanded] = useState(false);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [filterGroupsOpen, setFilterGroupsOpen] = useState({
    dateTiming: false,
    location: false,
    marketSegments: false,
    participation: false,
    organizers: false,
  });
  const [getStartedStripOpen, setGetStartedStripOpen] = useState(false);

  const controlStyle: CSSProperties = {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
    height: "36px",
    borderRadius: "9px",
    background: "#08223d",
    color: "#e2e8f0",
    border: "1px solid rgba(96,165,250,0.28)",
    fontSize: "14px",
    padding: "0 10px",
  };
  const railSectionCardStyle: CSSProperties = {
    border: "1px solid rgba(96,165,250,0.16)",
    borderRadius: "12px",
    background: "rgba(8,30,53,0.74)",
    padding: "12px",
  };
  const leftRailSectionCardStyle: CSSProperties = {
    ...railSectionCardStyle,
    border: "1px solid rgba(96,165,250,0.06)",
    background: "rgba(8,28,49,0.44)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
  };
  const rightRailSectionCardStyle: CSSProperties = {
    ...railSectionCardStyle,
    border: "1px solid rgba(100,140,190,0.22)",
    borderRadius: "14px",
    background: "rgba(8,27,48,0.72)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    overflow: "hidden",
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
      if (recentFilters) setFilters(normalizeFiltersState(JSON.parse(recentFilters)));
      if (recentActivityRaw) setRecentActivity(JSON.parse(recentActivityRaw));
    } catch {
      // ignore local storage parse issues
    }
  }, []);

  useEffect(() => {
    try {
      const modeFromUrl = new URLSearchParams(window.location.search).get("filterMode");
      const savedMode = localStorage.getItem("ccc_filter_match_mode");
      setFilterMode(modeFromUrl === "or" || (!modeFromUrl && savedMode === "or") ? "or" : "and");
    } catch {
      // Keep the default Match All mode when browser storage is unavailable.
    }
  }, []);

  const updateFilterMode = useCallback((nextMode: FilterMatchMode) => {
    setFilterMode(nextMode);
    try {
      localStorage.setItem("ccc_filter_match_mode", nextMode);
    } catch {
      // Browser storage may be unavailable.
    }
  }, []);

  useEffect(() => {
    setDashboardMode(initialMode);
  }, [initialMode]);

  const toggleFilterValue = useCallback((key: MultiFilterKey, value: string) => {
    if (!value) return;
    setFilters((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }));
  }, []);

  const addFilterValue = useCallback((key: MultiFilterKey, value: string) => {
    if (!value) return;
    setFilters((previous) => (
      previous[key].includes(value)
        ? previous
        : { ...previous, [key]: [...previous[key], value] }
    ));
  }, []);

  useEffect(() => {
    const mobileMq = window.matchMedia("(max-width: 767px)");
    const tabletMq = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const syncViewportMode = () => {
      setIsMobileViewport(mobileMq.matches);
      setIsTabletViewport(tabletMq.matches);
    };
    syncViewportMode();
    mobileMq.addEventListener("change", syncViewportMode);
    tabletMq.addEventListener("change", syncViewportMode);
    return () => {
      mobileMq.removeEventListener("change", syncViewportMode);
      tabletMq.removeEventListener("change", syncViewportMode);
    };
  }, []);

  useEffect(() => {
    const compactViewport = isMobileViewport || isTabletViewport;
    if (!compactViewport) return;
    if (!mobilePanel) return;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isMobileViewport, isTabletViewport, mobilePanel]);

  useEffect(() => {
    const compactViewport = isMobileViewport || isTabletViewport;
    if (!compactViewport) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobilePanel(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileViewport, isTabletViewport]);

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
    const anchor = firstResultCardRef.current || resultsAnchorRef.current;
    if (!scroller || !anchor) return;
    const targetTop = Math.max(0, anchor.offsetTop - 8);
    scroller.scrollTo({ top: targetTop, behavior: "smooth" });
    window.requestAnimationFrame(() => {
      scroller.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  };

  const scrollToWorkspaceTop = () => {
    const scroller = centerWorkspaceRef.current;
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
      window.requestAnimationFrame(() => {
        scroller.scrollTo({ top: 0, behavior: "smooth" });
      });
      return;
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
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
  }, [searchQuery]);

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
  }, [searchQuery]);

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
    const cityParams = params.getAll("city");
    const startDateParam = params.get("startDate") || params.get("fromDate") || "";
    const endDateParam = params.get("endDate") || params.get("toDate") || "";
    const countryParams = params.getAll("country");
    const regionParams = params.getAll("region");
    const stateParams = params.getAll("state");
    const sectorThemeParams = [...params.getAll("industry"), ...params.getAll("sectorTheme")];
    const publicCompanySectorParams = params.getAll("publicCompanySector");
    const conferenceTypeParams = params.getAll("conferenceType");
    const issuerParticipationParams = params.getAll("issuerParticipation");
    const targetAudienceParams = params.getAll("targetAudience");
    const companyParticipantParams = params.getAll("companyParticipants");
    const eventFeatureParams = params.getAll("eventFeatures");
    const accessModelParams = params.getAll("accessModel");
    const marketCapParams = params.getAll("marketCap");
    const organizerParams = params.getAll("organizer");
    const marketFocusParams = [...params.getAll("investmentFocus"), ...params.getAll("marketFocus")];
    const eventIds = params.getAll("eventId").filter(Boolean);
    const searchParam = params.get("q") || "";
    if (searchParam) setSearchQuery(searchParam);
    if (cityParams.length || startDateParam || endDateParam || eventIds.length || countryParams.length || regionParams.length || stateParams.length || sectorThemeParams.length || publicCompanySectorParams.length || conferenceTypeParams.length || issuerParticipationParams.length || targetAudienceParams.length || companyParticipantParams.length || eventFeatureParams.length || accessModelParams.length || marketCapParams.length || organizerParams.length || marketFocusParams.length) {
      setFilters((prev) => ({
        ...prev,
        country: countryParams.length ? countryParams : prev.country,
        region: regionParams.length ? regionParams : prev.region,
        state: stateParams.length ? stateParams : prev.state,
        cities: cityParams.length ? cityParams : prev.cities,
        sectorThemes: sectorThemeParams.length ? sectorThemeParams : prev.sectorThemes,
        publicCompanySectors: publicCompanySectorParams.length ? publicCompanySectorParams : prev.publicCompanySectors,
        conferenceType: conferenceTypeParams.length ? conferenceTypeParams : prev.conferenceType,
        issuerParticipation: issuerParticipationParams.length ? issuerParticipationParams : prev.issuerParticipation,
        targetAudience: targetAudienceParams.length ? targetAudienceParams : prev.targetAudience,
        companyParticipants: companyParticipantParams.length ? companyParticipantParams : prev.companyParticipants,
        eventFeatures: eventFeatureParams.length ? eventFeatureParams : prev.eventFeatures,
        accessModel: accessModelParams.length ? accessModelParams : prev.accessModel,
        marketCap: marketCapParams.length ? marketCapParams : prev.marketCap,
        organizer: organizerParams.length ? organizerParams : prev.organizer,
        marketFocus: marketFocusParams.length ? marketFocusParams : prev.marketFocus,
      }));
      if (startDateParam) setFromDate(startDateParam);
      if (endDateParam) setToDate(endDateParam);
      if (eventIds.length) setUrlEventIds(eventIds);
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
  }, [searchQuery]);

  const activeSavedList = useMemo(
    () => savedLists.find((list) => list.id === activeSavedListId) || null,
    [activeSavedListId, savedLists]
  );

  const discoveryRequest = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(LOAD_MORE_INCREMENT));
    params.set("dateRange", filters.dateRange);
    params.set("filterMode", filterMode);
    params.set("sort", sortMode);
    if (searchQuery) params.set("q", searchQuery);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    filters.country.forEach((value) => params.append("country", value));
    filters.region.forEach((value) => params.append("region", value));
    filters.state.forEach((value) => params.append("state", value));
    filters.cities.forEach((value) => params.append("city", value));
    filters.sectorThemes.forEach((value) => params.append("industry", value));
    filters.publicCompanySectors.forEach((value) => params.append("industry", value));
    filters.conferenceType.forEach((value) => params.append("conferenceType", value));
    filters.issuerParticipation.forEach((value) => params.append("issuerParticipation", value));
    filters.targetAudience.forEach((value) => params.append("targetAudience", value));
    filters.companyParticipants.forEach((value) => params.append("companyParticipants", value));
    filters.eventFeatures.forEach((value) => params.append("eventFeatures", value));
    filters.accessModel.forEach((value) => params.append("accessModel", value));
    filters.marketCap.forEach((value) => params.append("marketCap", value));
    filters.organizer.forEach((value) => params.append("organizer", value));
    filters.marketFocus.forEach((value) => params.append("investmentFocus", value));
    activeSavedList?.eventIds.forEach((value) => params.append("eventId", value));
    urlEventIds.forEach((value) => params.append("eventId", value));
    return params;
  }, [activeSavedList?.eventIds, filterMode, filters, fromDate, searchQuery, sortMode, toDate, urlEventIds]);
  const initialDiscoveryRequestRef = useRef<string | null>(null);

  const applyDiscoveryPage = useCallback((next: DiscoveryPageResponse, append = false) => {
    setEvents((current) => append ? [...current, ...next.events] : next.events);
    setDiscoveryPage({
      total: next.total,
      nextCursor: next.nextCursor,
      filterOptions: next.filterOptions,
      aggregates: normalizeDiscoveryAggregateStats(next.aggregates),
      allAggregates: normalizeDiscoveryAggregateStats(next.allAggregates || next.aggregates),
      marketAnalytics: normalizeMarketViewAnalytics(next.marketAnalytics),
      allMarketAnalytics: normalizeMarketViewAnalytics(next.allMarketAnalytics || next.marketAnalytics),
    });
  }, []);

  const loadDiscoveryPage = useCallback(async (cursor?: string | null, append = false) => {
    const params = new URLSearchParams(discoveryRequest);
    if (cursor) params.set("cursor", cursor);
    const requestKey = params.toString();
    const cachedPage = getCachedEventPage<DiscoveryPageResponse>(requestKey);
    if (cachedPage) {
      applyDiscoveryPage(cachedPage, append);
      setEventLoadError(null);
      setIsLoadingEvents(false);
      return;
    }

    setIsLoadingEvents(true);
    setEventLoadError(null);
    try {
      const next = await getOrFetchEventPage<DiscoveryPageResponse>(requestKey, async () => {
        const response = await fetch(`/api/events?${requestKey}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load conferences.");
        return response.json() as Promise<DiscoveryPageResponse>;
      });
      applyDiscoveryPage(next, append);
    } catch (error) {
      setEventLoadError(error instanceof Error ? error.message : "Unable to load conference index.");
    } finally {
      setIsLoadingEvents(false);
    }
  }, [applyDiscoveryPage, discoveryRequest]);

  useEffect(() => {
    if (shouldLoadInitialDiscovery || initialEvents.length === 0) return;
    const requestKey = discoveryRequest.toString();
    seedEventPage<DiscoveryPageResponse>(requestKey, {
      events: initialEvents,
      total: discoveryPage.total,
      nextCursor: discoveryPage.nextCursor,
      filterOptions: discoveryPage.filterOptions,
      aggregates: discoveryPage.aggregates,
      allAggregates: discoveryPage.allAggregates,
      marketAnalytics: discoveryPage.marketAnalytics,
      allMarketAnalytics: discoveryPage.allMarketAnalytics,
    });
  }, [discoveryPage, discoveryRequest, initialEvents, shouldLoadInitialDiscovery]);

  useEffect(() => {
    if (shouldLoadInitialDiscovery && !urlSeeded) return;
    const requestKey = discoveryRequest.toString();
    if (initialDiscoveryRequestRef.current === null) {
      initialDiscoveryRequestRef.current = requestKey;
      if (shouldLoadInitialDiscovery) {
        void loadDiscoveryPage();
      }
      return;
    }
    void loadDiscoveryPage();
  }, [discoveryRequest, loadDiscoveryPage, shouldLoadInitialDiscovery, urlSeeded]);

  const cities = discoveryPage.filterOptions.cities;
  const regions = discoveryPage.filterOptions.regions;
  const countries = discoveryPage.filterOptions.countries;
  const states = discoveryPage.filterOptions.states;
  const themes = discoveryPage.filterOptions.themes;
  const conferenceTypes = discoveryPage.filterOptions.conferenceTypes;
  const targetAudienceOptions = discoveryPage.filterOptions.targetAudiences || [];
  const companyParticipantOptions = discoveryPage.filterOptions.companyParticipants || [];
  const eventFeatureOptions = discoveryPage.filterOptions.eventFeatures || [];
  const accessModelOptions = discoveryPage.filterOptions.accessModels || [];
  const marketCapOptions = discoveryPage.filterOptions.marketCaps || [];
  const organizers = discoveryPage.filterOptions.organizers;
  const marketFocusOptions = discoveryPage.filterOptions.marketFocuses;

  const focusedEventId = initialEventId || urlEventIds[0] || "";

  const filteredEvents = useMemo(() => {
    const list = [...events];
    if (focusedEventId) {
      const matchedIndex = list.findIndex((event) => event.id === focusedEventId);
      if (matchedIndex > 0) {
        const [matched] = list.splice(matchedIndex, 1);
        list.unshift(matched);
      }
    }
    return list;
  }, [events, focusedEventId]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];
    if (searchQuery.trim()) {
      chips.push({
        key: "search",
        label: `Search: ${searchQuery.trim()}`,
        clear: () => {
          if (typeof window === "undefined") return;
          const params = new URLSearchParams(window.location.search);
          params.delete("q");
          params.set("mode", "market");
          window.location.assign(`${window.location.pathname}?${params.toString()}`);
        },
      });
    }
    const addChips = (key: MultiFilterKey, labelPrefix = "") => {
      filters[key].forEach((value) => {
        chips.push({
          key: `${key}:${value}`,
          label: `${labelPrefix}${value}`,
          clear: () => setFilters((p) => ({ ...p, [key]: p[key].filter((item) => item !== value) })),
        });
      });
    };
    addChips("country");
    addChips("region");
    addChips("state");
    addChips("cities");
    addChips("conferenceType", "Conference Type: ");
    addChips("sectorThemes", "Industry: ");
    addChips("marketFocus", "Investment Focus: ");
    addChips("marketCap", "Market Cap: ");
    addChips("targetAudience", "Target Audience: ");
    addChips("companyParticipants", "Company Participants: ");
    addChips("eventFeatures", "Event Features: ");
    addChips("accessModel", "Access Model: ");
    addChips("organizer");
    if (filters.dateRange !== "all") chips.push({ key: "dateRange", label: `Date: ${filters.dateRange.replace("next", "Next ").toUpperCase()}`, clear: () => setFilters((p) => ({ ...p, dateRange: "all" })) });
    if (fromDate || toDate) {
      const fromLabel = fromDate ? formatMonthDay(fromDate) : "Start";
      const toLabel = toDate ? formatMonthDay(toDate) : "Open";
      chips.push({
        key: "dateWindow",
        label: `${fromLabel} - ${toLabel}`,
        clear: () => {
          setFromDate("");
          setToDate("");
        },
      });
    }
    return chips;
  }, [filterMode, filters, fromDate, searchQuery, toDate]);

  const compactSingleResultLayout =
    dashboardMode === "market" &&
    workspaceViewMode === "database" &&
    filteredEvents.length === 1;

useEffect(() => {
    if (!focusedEventId) return;
    if (dashboardMode !== "market" || workspaceViewMode !== "database") return;
    const matched = filteredEvents.find((event) => event.id === focusedEventId);
    if (!matched) return;

    setSelectedEvents([matched.id]);

    const run = () => {
      scrollToResultsAnchor();
      firstResultCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    const raf = window.requestAnimationFrame(run);
    const timer = window.setTimeout(run, 120);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [focusedEventId, dashboardMode, workspaceViewMode, filteredEvents]);

  const locationActiveCount = filters.country.length + filters.region.length + filters.state.length + filters.cities.length;
  const marketSegmentsActiveCount = filters.sectorThemes.length + filters.publicCompanySectors.length + filters.conferenceType.length + filters.marketFocus.length + filters.marketCap.length;
  const participationActiveCount = filters.targetAudience.length + filters.companyParticipants.length + filters.eventFeatures.length + filters.accessModel.length;
  const organizersActiveCount = filters.organizer.length;

  const selectedSet = useMemo(() => new Set(selectedEvents), [selectedEvents]);
  const buildCalendarWeeks = useCallback((source: WorkspaceEvent[]) => {
    const weeks = new Map<
      string,
      {
        weekStart: string;
        weekEnd: string;
        events: WorkspaceEvent[];
        dayDates: string[];
        byDay: WorkspaceEvent[][];
      }
    >();
    source.forEach((event) => {
      const startWeek = getWeekStart(event.startDate);
      const endWeek = getWeekStart(event.endDate || event.startDate);
      if (!startWeek || !endWeek) return;
      let activeWeek = startWeek;
      while (activeWeek <= endWeek) {
        if (!weeks.has(activeWeek)) {
          weeks.set(activeWeek, {
            weekStart: activeWeek,
            weekEnd: getWeekEndFromStart(activeWeek),
            events: [],
            dayDates: Array.from({ length: 7 }, (_, i) => addDaysISO(activeWeek, i)),
            byDay: [[], [], [], [], [], [], []],
          });
        }
        const bucket = weeks.get(activeWeek)!;
        bucket.events.push(event);
        const weekStartTs = new Date(`${activeWeek}T00:00:00Z`).getTime();
        const weekEndTs = new Date(`${bucket.weekEnd}T23:59:59Z`).getTime();
        const eventStartTs = new Date(`${event.startDate}T00:00:00Z`).getTime();
        const eventEndTs = new Date(`${(event.endDate || event.startDate)}T23:59:59Z`).getTime();
        for (let i = 0; i < 7; i += 1) {
          const dayIso = bucket.dayDates[i];
          const dayStartTs = new Date(`${dayIso}T00:00:00Z`).getTime();
          const dayEndTs = new Date(`${dayIso}T23:59:59Z`).getTime();
          if (dayStartTs > weekEndTs || dayEndTs < weekStartTs) continue;
          if (eventStartTs <= dayEndTs && eventEndTs >= dayStartTs) {
            bucket.byDay[i].push(event);
          }
        }
        activeWeek = addDaysISO(activeWeek, 7);
      }
    });
    return Array.from(weeks.values())
      .map((week) => ({
        ...week,
        events: week.events
          .slice()
          .sort((a, b) => `${a.startDate}-${a.title}`.localeCompare(`${b.startDate}-${b.title}`)),
        byDay: week.byDay.map((day) =>
          day.slice().sort((a, b) => `${a.startDate}-${a.title}`.localeCompare(`${b.startDate}-${b.title}`))
        ),
      }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }, []);

  const calendarWeeks = useMemo(() => buildCalendarWeeks(filteredEvents), [buildCalendarWeeks, filteredEvents]);
  const allCalendarWeeks = useMemo(() => buildCalendarWeeks(events), [buildCalendarWeeks, events]);

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
  const relatedEventCountsById = useMemo(() => {
    const cityWeekCounts = new Map<string, number>();
    const themeWeekEventIds = new Map<string, Set<string>>();
    const eventKeys = new Map<string, { cityWeekKey: string; themeWeekKeys: string[] }>();

    filteredEvents.forEach((event) => {
      const week = getWeekStart(event.startDate);
      const cityLabel = [event.city, event.state].filter(Boolean).join(", ");
      const cityWeekKey = cityLabel && week ? `${cityLabel}||${week}` : "";
      const themeWeekKeys = splitCsv(event.industry || "").map((theme) => `${week}||${theme}`);

      if (cityWeekKey) cityWeekCounts.set(cityWeekKey, (cityWeekCounts.get(cityWeekKey) || 0) + 1);
      themeWeekKeys.forEach((key) => {
        const ids = themeWeekEventIds.get(key) || new Set<string>();
        ids.add(event.id);
        themeWeekEventIds.set(key, ids);
      });
      eventKeys.set(event.id, { cityWeekKey, themeWeekKeys });
    });

    return new Map(
      filteredEvents.map((event) => {
        const keys = eventKeys.get(event.id);
        if (!keys) return [event.id, { sameCityWeekCount: 0, sameThemeWeekCount: 0 }] as const;
        const themeIds = new Set<string>();
        keys.themeWeekKeys.forEach((key) => {
          themeWeekEventIds.get(key)?.forEach((id) => {
            if (id !== event.id) themeIds.add(id);
          });
        });
        return [
          event.id,
          {
            sameCityWeekCount: Math.max(0, (cityWeekCounts.get(keys.cityWeekKey) || 0) - 1),
            sameThemeWeekCount: themeIds.size,
          },
        ] as const;
      })
    );
  }, [filteredEvents]);

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
    return getTopByCount(filteredEvents.map((e) => getCityValue(e)))[0]?.[0] || "";
  }, [filteredEvents]);

  const calendarHotWeeks = useMemo(() => {
    const ranked = calendarWeeks
      .map((week) => ({ weekStart: week.weekStart, weekEnd: week.weekEnd, count: week.events.length }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.weekStart.localeCompare(b.weekStart);
      });
    const top3 = new Set(ranked.slice(0, 3).map((week) => week.weekStart));
    return ranked.filter((week) => week.count >= 3 || top3.has(week.weekStart));
  }, [calendarWeeks]);

  const calendarHotWeekKeys = useMemo(
    () => new Set(calendarHotWeeks.map((week) => week.weekStart)),
    [calendarHotWeeks]
  );

  const allCalendarHotWeeks = useMemo(() => {
    const ranked = allCalendarWeeks
      .map((week) => ({ weekStart: week.weekStart, weekEnd: week.weekEnd, count: week.events.length }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.weekStart.localeCompare(b.weekStart);
      });
    const top3 = new Set(ranked.slice(0, 3).map((week) => week.weekStart));
    return ranked.filter((week) => week.count >= 3 || top3.has(week.weekStart));
  }, [allCalendarWeeks]);

  const allCalendarHotWeekKeys = useMemo(
    () => new Set(allCalendarHotWeeks.map((week) => week.weekStart)),
    [allCalendarHotWeeks]
  );

  const calendarWeekSignals = useMemo(() => {
    const entries = calendarWeeks.map((week) => {
      const citiesRanked = getTopByCount(week.events.map((event) => getCityValue(event)));
      const organizersRanked = getTopByCount(week.events.map((event) => getOrganizerValue(event)));
      const focusRanked = getTopByCount(week.events.flatMap((event) => getMarketFocusValues(event)));
      const themeRanked = getTopByCount(week.events.flatMap((event) => getThemeValues(event)));
      const investorHeavyCount = week.events.filter((event) => isInvestorHeavy(event)).length;
      const issuerHeavyCount = week.events.filter((event) => isIssuerHeavy(event)).length;
      const cityCluster = citiesRanked.find(([, count]) => count >= 2) || null;
      const organizerActivity = organizersRanked.find(([, count]) => count >= 2) || null;
      const topFocus = focusRanked[0]?.[0] || themeRanked[0]?.[0] || "";
      const topOrganizer = organizersRanked[0]?.[0] || "";
      const chips = [
        calendarHotWeekKeys.has(week.weekStart)
          ? { key: "hot", label: "Hot Week", tone: "#f59e0b", detail: `${week.events.length} conferences` }
          : null,
        cityCluster
          ? { key: "cluster", label: `${cityCluster[0].split(",")[0]} Cluster`, tone: "#2dd4bf", detail: `${cityCluster[1]} events` }
          : null,
        investorHeavyCount > 0
          ? { key: "investor", label: "Investor-Heavy", tone: "#22c55e", detail: `${investorHeavyCount}` }
          : issuerHeavyCount > 0
            ? { key: "issuer", label: "Issuer-Heavy", tone: "#8b5cf6", detail: `${issuerHeavyCount}` }
            : null,
        topFocus
          ? { key: "focus", label: `Top focus: ${topFocus}`, tone: "#3b82f6" }
          : null,
        organizerActivity
          ? { key: "organizer", label: `${topOrganizer} activity`, tone: "#60a5fa", detail: `${organizerActivity[1]} events` }
          : null,
      ].filter(Boolean) as Array<{ key: string; label: string; tone: string; detail?: string }>;

      return [
        week.weekStart,
        {
          totalEvents: week.events.length,
          topCity: citiesRanked[0]?.[0] || "",
          topOrganizer,
          topFocus,
          topTheme: themeRanked[0]?.[0] || "",
          investorHeavyCount,
          issuerHeavyCount,
          cityCluster,
          organizerActivity,
          isHotWeek: calendarHotWeekKeys.has(week.weekStart),
          chips: chips.slice(0, 4),
        },
      ] as const;
    });

    return new Map(entries);
  }, [calendarWeeks, calendarHotWeekKeys]);

  const allCalendarWeekSignals = useMemo(() => {
    const entries = allCalendarWeeks.map((week) => {
      const citiesRanked = getTopByCount(week.events.map((event) => getCityValue(event)));
      const organizersRanked = getTopByCount(week.events.map((event) => getOrganizerValue(event)));
      const focusRanked = getTopByCount(week.events.flatMap((event) => getMarketFocusValues(event)));
      const themeRanked = getTopByCount(week.events.flatMap((event) => getThemeValues(event)));
      const investorHeavyCount = week.events.filter((event) => isInvestorHeavy(event)).length;
      const issuerHeavyCount = week.events.filter((event) => isIssuerHeavy(event)).length;
      const cityCluster = citiesRanked.find(([, count]) => count >= 2) || null;
      const organizerActivity = organizersRanked.find(([, count]) => count >= 2) || null;
      const topFocus = focusRanked[0]?.[0] || themeRanked[0]?.[0] || "";
      const topOrganizer = organizersRanked[0]?.[0] || "";
      const chips = [
        allCalendarHotWeekKeys.has(week.weekStart)
          ? { key: "hot", label: "Hot Week", tone: "#f59e0b", detail: `${week.events.length} conferences` }
          : null,
        cityCluster
          ? { key: "cluster", label: `${cityCluster[0].split(",")[0]} Cluster`, tone: "#2dd4bf", detail: `${cityCluster[1]} events` }
          : null,
        investorHeavyCount > 0
          ? { key: "investor", label: "Investor-Heavy", tone: "#22c55e", detail: `${investorHeavyCount}` }
          : issuerHeavyCount > 0
            ? { key: "issuer", label: "Issuer-Heavy", tone: "#8b5cf6", detail: `${issuerHeavyCount}` }
            : null,
        topFocus
          ? { key: "focus", label: `Top focus: ${topFocus}`, tone: "#3b82f6" }
          : null,
        organizerActivity
          ? { key: "organizer", label: `${topOrganizer} activity`, tone: "#60a5fa", detail: `${organizerActivity[1]} events` }
          : null,
      ].filter(Boolean) as Array<{ key: string; label: string; tone: string; detail?: string }>;

      return [
        week.weekStart,
        {
          totalEvents: week.events.length,
          topCity: citiesRanked[0]?.[0] || "",
          topOrganizer,
          topFocus,
          topTheme: themeRanked[0]?.[0] || "",
          investorHeavyCount,
          issuerHeavyCount,
          cityCluster,
          organizerActivity,
          isHotWeek: allCalendarHotWeekKeys.has(week.weekStart),
          chips: chips.slice(0, 4),
        },
      ] as const;
    });

    return new Map(entries);
  }, [allCalendarWeeks, allCalendarHotWeekKeys]);

  const calendarSummary = useMemo(() => {
    const topFocus = getTopByCount(filteredEvents.flatMap((event) => getMarketFocusValues(event)))[0]?.[0] || "N/A";
    const topAudience = getTopByCount(filteredEvents.map((event) => event.issuerParticipation).filter(Boolean))[0]?.[0] || "N/A";
    const topOrganizer = getTopByCount(filteredEvents.map((event) => getOrganizerValue(event)))[0]?.[0] || "N/A";
    const nextHotWeek = calendarHotWeeks[0] || null;
    const investorHeavyCount = filteredEvents.filter((event) => isInvestorHeavy(event)).length;
    const issuerHeavyCount = filteredEvents.filter((event) => isIssuerHeavy(event)).length;
    const clusterWindows = Array.from(calendarWeekSignals.values()).filter((week) => week.cityCluster).length;

    return {
      eventCount: filteredEvents.length,
      activeWeeks: calendarWeeks.length,
      topCity: topCity || "N/A",
      nextHotWeek,
      topFocus,
      topAudience,
      topOrganizer,
      investorHeavyCount,
      issuerHeavyCount,
      clusterWindows,
      limitedData: filteredEvents.length < 4,
    };
  }, [calendarHotWeeks, calendarWeekSignals, calendarWeeks.length, filteredEvents, topCity]);

  useEffect(() => {
    if (!calendarSelected) return;
    const currentWeek = calendarWeeks.find((week) => week.weekStart === calendarSelected.weekStart);
    if (!currentWeek || !currentWeek.events.some((event) => event.id === calendarSelected.eventId)) {
      setCalendarSelected(null);
    }
  }, [calendarSelected, calendarWeeks]);

  useEffect(() => {
    if (workspaceViewMode === "map") {
      setWorkspaceViewMode("database");
    }
  }, [workspaceViewMode]);

  useEffect(() => {
    setDetailExpanded(false);
    setExpandedRelatedGroups({});
  }, [calendarSelected?.weekStart, calendarSelected?.eventId]);

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

  const inViewStats = discoveryPage.aggregates;
  const allStats = discoveryPage.allAggregates;

  const discoveryStats = useMemo(() => {
    const hasManualFilterSelection = activeFilterChips.length > 0 || Boolean(activeSavedListId);
    return hasManualFilterSelection
      ? {
          events: discoveryPage.aggregates.events,
          organizers: inViewStats.organizers,
          cities: inViewStats.cities,
          states: inViewStats.states,
          themes: inViewStats.themes,
          hotWeeks: inViewStats.hotWeeks,
        }
      : {
          events: allStats.events,
          organizers: allStats.organizers,
          cities: allStats.cities,
          states: allStats.states,
          themes: allStats.themes,
          hotWeeks: allStats.hotWeeks,
        };
  }, [activeFilterChips.length, activeSavedListId, discoveryPage.aggregates.events, inViewStats, allStats]);

  const discoveryHeaderMetrics = useMemo(() => {
    const hasManualFilterSelection = activeFilterChips.length > 0 || Boolean(activeSavedListId);
    const stats = hasManualFilterSelection ? discoveryPage.aggregates : discoveryPage.allAggregates;
    const loadingValue = dataIsBootstrapping ? "Loading" : null;
    const loadingCountValue = dataIsBootstrapping ? "—" : null;

    return {
      metrics: [
        {
          label: hasManualFilterSelection ? "Filtered Records" : "Visible Records",
          value: loadingValue || stats.events,
          tone: "#69b7ff",
        },
        { label: "Investor-Heavy", value: loadingCountValue || stats.investorHeavy, tone: "#22c55e" },
        { label: "Issuer Access", value: loadingCountValue || stats.issuerAccess, tone: "#8b5cf6" },
        { label: "Highest Activity Week", value: loadingValue || stats.highestActivityWeek?.label || "—", detail: dataIsBootstrapping ? "" : stats.highestActivityWeek ? `${stats.highestActivityWeek.count} events` : "", tone: "#38d5c4", compact: true },
        { label: "Lowest Activity Week", value: loadingValue || stats.lowestActivityWeek?.label || "—", detail: dataIsBootstrapping ? "" : stats.lowestActivityWeek ? `${stats.lowestActivityWeek.count} events` : "", tone: "#78aaff", compact: true },
        { label: "Leading Sector", value: loadingValue || stats.leadingSector?.label || "Not classified", detail: dataIsBootstrapping ? "" : stats.leadingSector ? `${stats.leadingSector.count} events` : "", tone: "#8fbfff", compact: true },
      ],
      earliestDate: stats.earliestDate,
      latestDate: stats.latestDate,
      latestVerificationStamp: stats.latestVerificationStamp,
      recordCount: stats.events,
    };
  }, [activeFilterChips.length, activeSavedListId, dataIsBootstrapping, discoveryPage.aggregates, discoveryPage.allAggregates]);


  const computeMarketViewAnalytics = useCallback((source: WorkspaceEvent[]) => {
    const cityCounts = Array.from(
      source.reduce((m, e) => {
        const key = [e.city, e.state].filter(Boolean).join(", ");
        if (!key) return m;
        m.set(key, (m.get(key) || 0) + 1);
        return m;
      }, new Map<string, number>())
    ).sort((a, b) => b[1] - a[1]);

    const organizerCounts = Array.from(
      source.reduce((m, e) => {
        const key = e.organizer || "";
        if (!key) return m;
        m.set(key, (m.get(key) || 0) + 1);
        return m;
      }, new Map<string, number>())
    ).sort((a, b) => b[1] - a[1]);

    const themeCounts = Array.from(
      source.reduce((m, e) => {
        splitCsv(e.sectorThemes).forEach((theme) => {
          if (!theme) return;
          m.set(theme, (m.get(theme) || 0) + 1);
        });
        return m;
      }, new Map<string, number>())
    ).sort((a, b) => b[1] - a[1]);

    const durations = source.map((e) => {
      const s = new Date(`${e.startDate}T00:00:00Z`).getTime();
      const en = new Date(`${(e.endDate || e.startDate)}T00:00:00Z`).getTime();
      if (Number.isNaN(s) || Number.isNaN(en)) return 1;
      return Math.max(1, Math.round((en - s) / 86400000) + 1);
    });
    const avgDuration = durations.length ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) : "0";

    const weekCounts = Array.from(
      source.reduce((m, e) => {
        const week = getWeekStart(e.startDate);
        if (!week) return m;
        m.set(week, (m.get(week) || 0) + 1);
        return m;
      }, new Map<string, number>())
    )
      .map(([weekStart, count]) => ({ weekStart, count }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    const topWeeks = [...weekCounts].sort((a, b) => b.count - a.count).slice(0, 3);

    const monthCounts = Array.from(
      source.reduce((m, e) => {
        const d = new Date(`${e.startDate}T00:00:00Z`);
        if (Number.isNaN(d.getTime())) return m;
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        m.set(key, (m.get(key) || 0) + 1);
        return m;
      }, new Map<string, number>())
    )
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const maxWeek = weekCounts.reduce((max, item) => (item.count > max ? item.count : max), 1);
    const maxMonth = monthCounts.reduce((max, item) => (item.count > max ? item.count : max), 1);

    return {
      total: source.length,
      topCity: cityCounts[0]?.[0] || "N/A",
      topCityCount: cityCounts[0]?.[1] || 0,
      peakWeek: topWeeks[0]?.weekStart || "",
      peakWeekCount: topWeeks[0]?.count || 0,
      topOrganizer: organizerCounts[0]?.[0] || "N/A",
      topOrganizerCount: organizerCounts[0]?.[1] || 0,
      topTheme: themeCounts[0]?.[0] || "N/A",
      topThemeCount: themeCounts[0]?.[1] || 0,
      avgDuration,
      weekCounts,
      topWeeks,
      cityCounts: cityCounts.slice(0, 7),
      organizerCounts: organizerCounts.slice(0, 7),
      themeCounts: themeCounts.slice(0, 7),
      monthCounts,
      maxWeek,
      maxMonth,
    };
  }, []);

  const allMarketAnalytics = useMemo(() => computeMarketViewAnalytics(events), [events, computeMarketViewAnalytics]);
  const filteredMarketAnalytics = useMemo(() => computeMarketViewAnalytics(filteredEvents), [filteredEvents, computeMarketViewAnalytics]);
  const marketSignalStrips = useMemo(() => {
    const resultCount = filteredEvents.length;
    if (resultCount < 4) return [] as MarketSignalStrip[];

    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const in90Utc = todayUtc + 90 * 86400000;
    const publicEvents = filteredEvents.filter((event) => {
      const start = new Date(`${event.startDate}T00:00:00Z`).getTime();
      const approval = (event.websiteApproval || "").trim().toLowerCase();
      const evidence = `${event.verificationStatus || ""} ${event.dataCompletenessScore || ""}`.toLowerCase();
      return !Number.isNaN(start) && start >= todayUtc && start <= in90Utc && (!approval || approval === "approved") && !evidence.includes("incomplete");
    });
    const source = publicEvents.length ? publicEvents : filteredEvents.filter((event) => {
      const approval = (event.websiteApproval || "").trim().toLowerCase();
      return !approval || approval === "approved";
    });
    if (source.length < 4) return [] as MarketSignalStrip[];

    const eventSet = (items: WorkspaceEvent[]) => Array.from(new Set(items.map((event) => event.id)));
    const percent = (count: number) => Math.round((count / Math.max(source.length, 1)) * 100);
    const countRanked = (items: { label: string; event: WorkspaceEvent }[]) =>
      Array.from(
        items.reduce((map, item) => {
          const key = item.label.trim();
          if (!key) return map;
          const current = map.get(key) || { label: key, events: [] as WorkspaceEvent[] };
          current.events.push(item.event);
          map.set(key, current);
          return map;
        }, new Map<string, { label: string; events: WorkspaceEvent[] }>())
      )
        .map(([, value]) => value)
        .sort((a, b) => b.events.length - a.events.length || a.label.localeCompare(b.label));

    const eventHas = (event: WorkspaceEvent, field: keyof WorkspaceEvent, labels: string[]) => {
      const values = splitCsv(String(event[field] || "")).map((value) => value.toLowerCase());
      return values.some((value) => labels.some((label) => value === label.toLowerCase()));
    };
    const eventHasPattern = (event: WorkspaceEvent, field: keyof WorkspaceEvent, patterns: RegExp[]) =>
      splitCsv(String(event[field] || "")).some((value) => patterns.some((pattern) => pattern.test(value.toLowerCase())));
    const isIssuerAccessEvent = (event: WorkspaceEvent) =>
      eventHas(event, "conferenceType", ["Issuer Access Conference", "Sell-Side / Corporate Access"]) ||
      (eventHas(event, "eventFeatures", ["Company Presentations", "1x1 Meetings"]) &&
        eventHas(event, "companyParticipants", ["Public Company Executives", "Public Company IR / Corporate Access"]));
    const isAllocatorEvent = (event: WorkspaceEvent) =>
      eventHas(event, "conferenceType", ["Allocator / Manager Forum"]) ||
      eventHas(event, "targetAudience", ["Institutional Investors / Asset Managers", "Family Offices", "Allocators / Pensions / Endowments"]);
    const hasInstitutionalAudience = (event: WorkspaceEvent) =>
      eventHas(event, "targetAudience", ["Institutional Investors / Asset Managers", "Family Offices", "Allocators / Pensions / Endowments"]);
    const hasCuratedAccess = (event: WorkspaceEvent) =>
      eventHas(event, "accessModel", ["Invitation Only", "Curated / Application Required"]);
    const isDealEvent = (event: WorkspaceEvent) =>
      eventHas(event, "conferenceType", ["Private Markets / Deal-Making"]) ||
      eventHas(event, "eventFeatures", ["Partnering / Deal-Making"]) ||
      (eventHas(event, "eventFeatures", ["1x1 Meetings"]) &&
        eventHas(event, "companyParticipants", ["Private Company Founders / Executives", "Private / Portfolio Company Management", "Project Developers / Sponsors"]));
    const hasStructuredMeetings = (event: WorkspaceEvent) => eventHas(event, "eventFeatures", ["1x1 Meetings", "Company Presentations"]);
    const actionability = (items: WorkspaceEvent[]) =>
      items.filter((event) => isIssuerAccessEvent(event) || isAllocatorEvent(event) || isDealEvent(event) || hasStructuredMeetings(event)).length;
    const confidenceBoost = (items: WorkspaceEvent[]) =>
      items.filter((event) => splitCsv(`${event.conferenceType},${event.industry},${event.investmentFocus},${event.targetAudience},${event.eventFeatures}`).length >= 3).length;
    const scoreSignal = (items: WorkspaceEvent[], distinctiveness = 0, extraActionability = 0) =>
      items.length * 10 + distinctiveness * 4 + actionability(items) * 6 + confidenceBoost(items) * 2 + extraActionability;

    const candidates: MarketSignalStrip[] = [];
    const pushSignal = (signal: MarketSignalStrip) => {
      if (signal.eventIds.length < 3 && signal.family !== "hotweek") return;
      candidates.push(signal);
    };
    const sentenceList = (parts: string[]) => {
      if (parts.length <= 1) return parts[0] || "";
      if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
      return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
    };

    const issuerEvents = source.filter(isIssuerAccessEvent);
    if (issuerEvents.length >= 3) {
      const institutionalIssuer = issuerEvents.filter(hasInstitutionalAudience).length;
      const issuerBodyBase = `${issuerEvents.length} upcoming events show issuer-access characteristics, including company presentations, 1x1 meetings, or public-company participation.`;
      const issuerBody = institutionalIssuer === issuerEvents.length
        ? `${issuerBodyBase} The same group also targets institutional, allocator, or family-office audiences.`
        : institutionalIssuer > 0
          ? `${issuerBodyBase} ${institutionalIssuer} also target institutional, allocator, or family-office audiences.`
          : issuerBodyBase;
      pushSignal({
        id: "issuer-access-window",
        type: "issuerAccess",
        family: "issuerAccess",
        score: scoreSignal(issuerEvents, percent(issuerEvents.length), 18),
        eventIds: eventSet(issuerEvents),
        label: "ISSUER ACCESS SIGNAL",
        badge: `${issuerEvents.length} events`,
        headline: "Issuer Access Window",
        body: issuerBody,
        cta: "Explore issuer-access events →",
        action: { kind: "analysis", action: { type: "conferenceType", value: "Issuer Access Conference" } },
      });
    }

    const allocatorEvents = source.filter(isAllocatorEvent);
    if (allocatorEvents.length >= 3) {
      const curatedAccessCount = allocatorEvents.filter(hasCuratedAccess).length;
      const allocatorBody = curatedAccessCount
        ? `${allocatorEvents.length} upcoming conferences target institutional, allocator, pension, endowment, or family-office audiences; ${curatedAccessCount} use invitation-only, curated, or application-based access.`
        : `${allocatorEvents.length} upcoming conferences explicitly target institutional, allocator, pension, endowment, or family-office audiences.`;
      pushSignal({
        id: "allocator-activity",
        type: "allocator",
        family: "allocator",
        score: scoreSignal(allocatorEvents, percent(allocatorEvents.length), 14),
        eventIds: eventSet(allocatorEvents),
        label: "ALLOCATOR SIGNAL",
        badge: `${allocatorEvents.length} events`,
        headline: "Allocator Activity Is Building",
        body: allocatorBody,
        cta: "See allocator-focused events →",
        action: { kind: "analysis", action: { type: "conferenceType", value: "Allocator / Manager Forum" } },
      });
    }

    const dealEvents = source.filter(isDealEvent);
    if (dealEvents.length >= 3) {
      const topDealFocus = countRanked(dealEvents.flatMap((event) => splitCsv(event.investmentFocus || "").map((label) => ({ label, event }))))[0]?.label || "";
      pushSignal({
        id: "private-market-deal-flow",
        type: "dealMaking",
        family: "dealMaking",
        score: scoreSignal(dealEvents, percent(dealEvents.length), 16),
        eventIds: eventSet(dealEvents),
        label: "DEAL-MAKING SIGNAL",
        badge: `${dealEvents.length} events`,
        headline: "Private Markets Deal Flow",
        body: `${dealEvents.length} upcoming conferences feature explicit partnering, deal-making, 1x1, or private-company meeting activity${topDealFocus ? `, led by ${topDealFocus}.` : "."}`,
        cta: "Explore private-market activity →",
        action: { kind: "analysis", action: { type: "conferenceType", value: "Private Markets / Deal-Making" } },
      });
    }

    countRanked(source.flatMap((event) => splitCsv(event.investmentFocus || "").map((label) => ({ label, event })))).slice(0, 4).forEach(({ label, events: focusEvents }) => {
      if (focusEvents.length < 4) return;
      const sortedFocusEvents = [...focusEvents].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const peakWindowCount = sortedFocusEvents.reduce((best, anchor) => {
        const anchorTime = new Date(`${anchor.startDate}T00:00:00Z`).getTime();
        if (Number.isNaN(anchorTime)) return best;
        const endTime = anchorTime + 20 * 86400000;
        const count = sortedFocusEvents.filter((event) => {
          const eventTime = new Date(`${event.startDate}T00:00:00Z`).getTime();
          return !Number.isNaN(eventTime) && eventTime >= anchorTime && eventTime <= endTime;
        }).length;
        return Math.max(best, count);
      }, 0);
      pushSignal({
        id: `focus-${label}`,
        type: "investmentFocus",
        family: "investmentFocus",
        score: scoreSignal(focusEvents, percent(focusEvents.length), label.toLowerCase().includes("private") ? 8 : 4),
        eventIds: eventSet(focusEvents),
        label: "INVESTMENT FOCUS",
        badge: `${percent(focusEvents.length)}% share`,
        headline: `${label} Concentration`,
        body: `${focusEvents.length} upcoming events carry a ${label} focus${peakWindowCount >= 3 ? `, with ${peakWindowCount} clustered inside a three-week window.` : "."}`,
        cta: `See ${label} activity →`,
        action: { kind: "analysis", action: { type: "marketFocus", value: label } },
      });
    });

    countRanked(source.flatMap((event) => splitCsv(event.industry || "").map((label) => ({ label, event })))).slice(0, 4).forEach(({ label, events: industryEvents }) => {
      if (industryEvents.length < 4) return;
      const publicAccess = industryEvents.filter(isIssuerAccessEvent).length;
      pushSignal({
        id: `industry-${label}`,
        type: "industry",
        family: "industry",
        score: scoreSignal(industryEvents, percent(industryEvents.length), publicAccess ? 8 : 2),
        eventIds: eventSet(industryEvents),
        label: "INDUSTRY SIGNAL",
        badge: `${industryEvents.length} events`,
        headline: `${label} Activity`,
        body: `${industryEvents.length} upcoming events are tied to ${label}${publicAccess ? `, including ${publicAccess} with issuer-access characteristics.` : "."}`,
        cta: `Explore ${label} events →`,
        action: { kind: "analysis", action: { type: "sectorTheme", value: label } },
      });
    });

    viewClusters.slice(0, 5).forEach((cluster) => {
      const members = source.filter((event) => {
        const cityLabel = [event.city, event.state].filter(Boolean).join(", ").trim();
        const start = event.startDate;
        return cityLabel === cluster.label && start >= cluster.weekStart && start <= cluster.weekEnd;
      });
      if (members.length < 3) return;
      const issuerCount = members.filter(isIssuerAccessEvent).length;
      const allocatorCount = members.filter(isAllocatorEvent).length;
      const dealCount = members.filter(isDealEvent).length;
      const topIndustry = countRanked(members.flatMap((event) => splitCsv(event.industry || "").map((label) => ({ label, event }))))[0]?.label || "capital markets";
      const descriptionParts = [
        issuerCount ? `${issuerCount} issuer-access` : "",
        allocatorCount ? `${allocatorCount} allocator/institutional` : "",
        dealCount ? `${dealCount} private-market/deal-making` : "",
      ].filter(Boolean);
      const leadCategory = issuerCount >= allocatorCount && issuerCount >= dealCount ? "issuer-access" : allocatorCount >= dealCount ? "allocator/institutional" : "private-market/deal-making";
      pushSignal({
        id: `cluster-${cluster.label}-${cluster.weekStart}`,
        type: "cluster",
        family: "cluster",
        score: scoreSignal(members, issuerCount + allocatorCount + dealCount, 12),
        eventIds: eventSet(members),
        label: "CITY OPPORTUNITY",
        badge: `${members.length} events`,
        headline: `${cluster.label} ${topIndustry} Cluster`,
        body: descriptionParts.length > 1
          ? `${members.length} events are clustered in ${cluster.label}, including ${sentenceList(descriptionParts)} events.`
          : `${members.length} events are clustered in ${cluster.label}, led by ${leadCategory} activity.`,
        cta: `Explore the ${cluster.label.split(",")[0]} cluster →`,
        action: { kind: "cluster", item: cluster },
      });
    });

    viewTopWeeks.slice(0, 5).forEach((week) => {
      const weekEvents = source.filter((event) => {
        const start = event.startDate;
        const end = event.endDate || event.startDate;
        return start <= week.weekEnd && end >= week.weekStart;
      });
      if (weekEvents.length < 4) return;
      const issuerCount = weekEvents.filter(isIssuerAccessEvent).length;
      const allocatorCount = weekEvents.filter(isAllocatorEvent).length;
      const meetingCount = weekEvents.filter(hasStructuredMeetings).length;
      const dealCount = weekEvents.filter(isDealEvent).length;
      const distinctCities = new Set(weekEvents.map((event) => [event.city, event.state].filter(Boolean).join(", ")).filter(Boolean)).size;
      const distinctOrganizers = new Set(weekEvents.map((event) => event.organizer).filter(Boolean)).size;
      const hotWeekParts = [
        issuerCount ? `${issuerCount} issuer-access` : "",
        allocatorCount ? `${allocatorCount} allocator/institutional` : "",
        dealCount ? `${dealCount} private-market/deal-making` : "",
        meetingCount ? `${meetingCount} structured-meeting programs` : "",
      ].filter(Boolean);
      pushSignal({
        id: `hot-${week.weekStart}`,
        type: "hotweek",
        family: "hotweek",
        score: scoreSignal(weekEvents, distinctCities + distinctOrganizers, issuerCount * 4 + allocatorCount * 3 + dealCount * 3 + meetingCount * 2),
        eventIds: eventSet(weekEvents),
        label: "CAPITAL MARKETS WINDOW",
        badge: `${weekEvents.length} events`,
        headline: `Hot Week — ${formatWeekLabel(week.weekStart)}`,
        body: hotWeekParts.length
          ? `${weekEvents.length} events fall in this activity window, including ${sentenceList(hotWeekParts)}.`
          : `${weekEvents.length} events fall in this activity window across ${distinctCities} cities and ${distinctOrganizers} organizers.`,
        cta: "View this activity window →",
        action: { kind: "analysis", action: { type: "week", from: week.weekStart, to: week.weekEnd } },
      });
    });

    countRanked(source.map((event) => ({ label: event.organizer || "", event }))).slice(0, 4).forEach(({ label, events: organizerEvents }) => {
      if (organizerEvents.length < 3 || organizerEvents.length / Math.max(source.length, 1) < 0.08) return;
      const issuerCount = organizerEvents.filter(isIssuerAccessEvent).length;
      const allocatorCount = organizerEvents.filter(isAllocatorEvent).length;
      const dealCount = organizerEvents.filter(isDealEvent).length;
      if (issuerCount + allocatorCount + dealCount < 2) return;
      const focus = issuerCount >= allocatorCount && issuerCount >= dealCount ? "issuer-access" : allocatorCount >= dealCount ? "institutional-investor" : "private-market";
      pushSignal({
        id: `organizer-${label}`,
        type: "organizer",
        family: "organizer",
        score: scoreSignal(organizerEvents, percent(organizerEvents.length), 4),
        eventIds: eventSet(organizerEvents),
        label: "ORGANIZER MOMENTUM",
        badge: `${organizerEvents.length} events`,
        headline: label,
        body: `${organizerEvents.length} upcoming events from ${label} are concentrated in ${focus} programming within this market view.`,
        cta: "View organizer activity →",
        action: { kind: "analysis", action: { type: "organizer", value: label } },
      });
    });

    return candidates.sort((a, b) => b.score - a.score);
  }, [filteredEvents, viewTopWeeks, viewClusters]);

  const marketSignalInsertMap = useMemo(() => {
    const insertMap = new Map<number, MarketSignalStrip>();
    if (!marketSignalStrips.length) return insertMap;
    const eventSeed = filteredEvents.map((event) => event.id).join("|");
    const gapFor = (signal: MarketSignalStrip, sequence: number) => {
      let hash = 0;
      const value = `${eventSeed}:${signal.id}:${sequence}`;
      for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) | 0;
      }
      return 4 + ((hash >>> 0) % 6);
    };

    // Stable variation keeps banners from shifting during ordinary re-renders.
    let targetIndex = gapFor(marketSignalStrips[0], 0);
    let sequence = 0;
    while (targetIndex < filteredEvents.length) {
      const signal = marketSignalStrips[sequence % marketSignalStrips.length];
      insertMap.set(targetIndex, signal);
      sequence += 1;
      targetIndex += gapFor(signal, sequence);
    }
    return insertMap;
  }, [filteredEvents, marketSignalStrips]);

  const firstMarketSignalInsertIndex = useMemo(() => {
    const first = marketSignalInsertMap.keys().next();
    return first.done ? -1 : first.value;
  }, [marketSignalInsertMap]);

  const quickFeedCounts = discoveryPage.aggregates.quickFeeds;

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
      applyPreset({ country: ["Canada"] });
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
      applyPreset({ country: ["United States"], region: [] });
      return;
    }
    if (key === "west-coast") {
      const westCity = cities.find((c) => /san francisco|los angeles|seattle|san diego|vancouver/i.test(c));
      if (westCity) {
        applyPreset({ cities: [westCity] });
      } else {
        const westRegion = regions.find((r) => /west/i.test(r));
        if (westRegion) {
          applyPreset({ region: [westRegion] });
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
    setDashboardMode("market");
    setWorkspaceViewMode("database");
    setSelectedEvents([]);
    setActiveSavedListId(null);
    setActiveQuickView("");
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
    if (action.type === "issuerParticipation") {
      setFilters({ ...DEFAULT_FILTERS, issuerParticipation: [action.value] });
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

  const saveSingleEventToNewList = (event: WorkspaceEvent) => {
    const defaultName = `${event.title} List`;
    const name = window.prompt("List name", defaultName);
    if (!name) return;
    setSavedLists((prev) => [{ id: `${Date.now()}`, name, eventIds: [event.id], createdAt: new Date().toISOString() }, ...prev]);
    recordActivity("view", `Saved list: ${name}`, "1 event");
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
    setFilterMode("and");
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
    setSavedViews((prev) => [{ id: `${Date.now()}`, name, filters, filterMode, createdAt: new Date().toISOString(), eventCount: filteredEvents.length }, ...prev]);
    recordActivity("view", `Saved view: ${name}`, `${filteredEvents.length} events`);
  };

  const loadSavedView = (viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (!view) return;
    setActiveSavedListId(null);
    setFilters({ ...DEFAULT_FILTERS, ...view.filters });
    setFilterMode(view.filterMode || "and");
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

  const buildSuggestedCalendarFeedName = () => {
    const parts: string[] = [];
    const locationLabel =
      filters.cities[0] ||
      filters.state[0] ||
      filters.region[0] ||
      filters.country[0] ||
      "";
    const dateLabel =
      fromDate && toDate
        ? `${formatMonthDay(fromDate)}-${formatMonthDay(toDate)}`
        : filters.dateRange === "next30"
          ? "Next 30 Days"
          : filters.dateRange === "next60"
            ? "Next 60 Days"
            : filters.dateRange === "next90"
              ? "Next 90 Days"
              : "";

    if (filters.marketFocus[0]) parts.push(filters.marketFocus[0]);
    else if (filters.sectorThemes[0]) parts.push(filters.sectorThemes[0]);
    else if (filters.conferenceType[0]) parts.push(filters.conferenceType[0]);

    if (locationLabel) parts.push(locationLabel);
    if (filters.issuerParticipation[0]) parts.push(filters.issuerParticipation[0]);
    if (dateLabel) parts.push(dateLabel);

    const compact = parts.filter(Boolean).slice(0, 3);
    return compact.length ? `CCC · ${compact.join(" · ")}` : "CCC · Current Market View";
  };

  const buildCalendarSyncParams = () => {
    const params = new URLSearchParams();
    const appendMany = (key: string, values: string[]) => {
      values.filter(Boolean).forEach((value) => params.append(key, value));
    };
    const computedRangeEnd = (() => {
      if (fromDate || toDate) return { from: fromDate, to: toDate };
      if (filters.dateRange === "all") return { from: "", to: "" };
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + (filters.dateRange === "next30" ? 30 : filters.dateRange === "next60" ? 60 : 90));
      return {
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10),
      };
    })();

    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    appendMany("country", filters.country);
    appendMany("region", filters.region);
    appendMany("state", filters.state);
    appendMany("city", filters.cities);
    appendMany("industry", filters.sectorThemes);
    appendMany("conferenceType", filters.conferenceType);
    appendMany("targetAudience", filters.targetAudience);
    appendMany("companyParticipants", filters.companyParticipants);
    appendMany("eventFeatures", filters.eventFeatures);
    appendMany("accessModel", filters.accessModel);
    appendMany("marketCap", filters.marketCap);
    appendMany("organizer", filters.organizer);
    appendMany("investmentFocus", filters.marketFocus);
    params.set("filterMode", filterMode);
    if (computedRangeEnd.from) params.set("from", computedRangeEnd.from);
    if (computedRangeEnd.to) params.set("to", computedRangeEnd.to);
    return params;
  };

  const createCalendarFeedKey = (feedName: string, params: URLSearchParams) => {
    const base = `${feedName}::${params.toString()}`;
    let hash = 0;
    for (let i = 0; i < base.length; i += 1) {
      hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    }
    return `feed-${hash.toString(36)}`;
  };

  const launchCalendarSync = (platform: "Google Calendar" | "Apple Calendar" | "Outlook", customFeedName?: string) => {
    recordActivity("feed", `Sync started: ${platform}`, customFeedName?.trim() || undefined);
    const params = buildCalendarSyncParams();
    const feedNameValue = customFeedName?.trim();
    if (feedNameValue) params.set("name", feedNameValue);
    params.set("feedKey", createCalendarFeedKey(feedNameValue || "Capital Conference Calendar - Current View", params));

    const queryString = params.toString();
    const icsPath = queryString ? `/api/ics?${queryString}` : "/api/ics";
    const icsUrl = `${window.location.origin}${icsPath}`;
    const webcalUrl = icsUrl.replace(/^https?:\/\//i, "webcal://");
    const feedName = encodeURIComponent(feedNameValue || "Capital Conference Calendar - Current View");

    if (platform === "Google Calendar") {
      const googleUrl = `https://calendar.google.com/calendar/u/0/r/settings/addbyurl?cid=${encodeURIComponent(webcalUrl)}`;
      window.open(googleUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "Outlook") {
      const outlookHelpUrl = `/help/outlook-calendar?feedUrl=${encodeURIComponent(icsUrl)}`;
      window.open(outlookHelpUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Apple Calendar / generic ICS clients
    window.open(webcalUrl, "_blank", "noopener,noreferrer");
  };

  const openCalendarSync = (platform: "Google Calendar" | "Apple Calendar" | "Outlook") => {
    const suggestedName = buildSuggestedCalendarFeedName();
    const customFeedName = window.prompt("Name this calendar feed", suggestedName);
    if (customFeedName === null) return;
    launchCalendarSync(platform, customFeedName.trim() || suggestedName);
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
    setFilterMode("and");
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
    scrollToWorkspaceTop();
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

  const handleAccessRequest = () => {
    if (!accessRequestForm.name.trim() || !accessRequestForm.email.trim()) {
      setAccessRequestMessage("Please add your name and email so we can review your request.");
      return;
    }
    setAccessRequestMessage("Request received. We’ll review access requests and follow up with approved users.");
    setAccessRequestForm({
      name: "",
      email: "",
      company: "",
      role: "",
      audience: "Investor",
    });
  };

  const applyConcentrationItem = (item: ConcentrationItem) => {
    if (!item) return;
    setDashboardMode("market");
    setWorkspaceViewMode("database");
    setSelectedEvents([]);
    setActiveSavedListId(null);
    setActiveQuickView("");
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

  const handleMarketSignalAction = useCallback((signal: MarketSignalStrip) => {
    if (signal.action.kind === "cluster") {
      applyConcentrationItem(signal.action.item);
      setDashboardMode("marketview");
      return;
    }
    applyAnalysisView(signal.action.action);
    setDashboardMode("marketview");
  }, [applyConcentrationItem, applyAnalysisView]);

  const forceMobile =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("mobile") === "1";
  const isMobile = forceMobile || isMobileViewport;
  const isTablet = !forceMobile && isTabletViewport;

  const mobileEvents = useMemo(() => {
    const q = mobileSearchTerm.trim().toLowerCase();
    if (!q) return filteredEvents;
    return filteredEvents.filter((e) => {
      const haystack = `${e.title} ${e.organizer} ${e.city} ${e.state} ${e.conferenceType} ${e.industry} ${e.investmentFocus} ${e.targetAudience} ${e.companyParticipants} ${e.eventFeatures} ${e.accessModel} ${e.marketCap}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filteredEvents, mobileSearchTerm]);

  const getMobileTags = (event: WorkspaceEvent) => {
    const highValueFeatures = splitCsv(event.eventFeatures || "").filter((feature) =>
      ["Company Presentations", "1x1 Meetings", "Partnering / Deal-Making"].some((allowed) => allowed.toLowerCase() === feature.toLowerCase())
    );
    return unique([
      event.conferenceType || "",
      ...splitCsv(event.industry || "").slice(0, 2),
      ...splitCsv(event.investmentFocus || "").slice(0, 2),
      ...highValueFeatures,
      event.format,
    ]).filter(Boolean);
  };

  if (isMobile || isTablet) {
    const isCompact = isMobile;
    return (
      <div style={{ width: "100%", minHeight: "calc(100vh - 126px)", display: "grid", gap: isCompact ? "10px" : "12px", paddingBottom: "86px", overflowX: "hidden" }}>
        <section style={{ border: "1px solid rgba(96,165,250,0.2)", borderRadius: "14px", background: "linear-gradient(180deg, rgba(7,24,44,0.92) 0%, rgba(5,18,34,0.94) 100%)", padding: "12px 12px 10px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          {forceMobile ? (
            <div
              aria-label="Mobile only marker"
              style={{
                width: "fit-content",
                marginBottom: "9px",
                border: "1px solid rgba(125,211,252,0.42)",
                borderRadius: "999px",
                background: "rgba(14,116,144,0.22)",
                color: "#cffafe",
                fontSize: "10px",
                fontWeight: 850,
                letterSpacing: "0.08em",
                lineHeight: 1,
                padding: "6px 8px",
                textTransform: "uppercase",
              }}
            >
              Mobile Only
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div>
              <div style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span className="ccc-mode-beacon" />
                Live Market View
              </div>
              <div style={{ color: "#f8fbff", fontSize: isCompact ? "17px" : "19px", fontWeight: 800, lineHeight: 1.15, marginTop: "2px" }}>
                {mobileEvents.length} of {events.length} Conferences
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobilePanel("intel");
                setTimeout(() => scrollToResultsAnchor(), 20);
              }}
              style={{ height: "34px", borderRadius: "9px", border: "1px solid rgba(147,197,253,0.3)", background: "rgba(30,64,175,0.2)", color: "#dbeafe", padding: "0 10px", fontSize: "12px", fontWeight: 700 }}
            >
              Market Intel
            </button>
          </div>
          <input
            value={mobileSearchTerm}
            onChange={(e) => setMobileSearchTerm(e.target.value)}
            placeholder="Search in current results..."
            style={{ marginTop: "10px", width: "100%", height: isCompact ? "36px" : "40px", borderRadius: "9px", border: "1px solid rgba(147,197,253,0.26)", background: "rgba(8,22,48,0.72)", color: "#e2e8f0", padding: "0 10px", fontSize: isCompact ? "13px" : "14px", outline: "none" }}
          />
        </section>

        <section ref={resultsAnchorRef} style={{ display: "grid", gap: "10px", gridTemplateColumns: isCompact ? "minmax(0,1fr)" : "repeat(2, minmax(0, 1fr))", minWidth: 0 }}>
          {mobileEvents.map((e) => {
            const parts = toDateRangeParts(e.startDate, e.endDate);
            const isMultiDay = parts.dayRange.includes("–");
            const weekStart = getWeekStart(e.startDate);
            const isHot = hotWeekKeys.has(weekStart);
            const cityLabel = [e.city, e.state].filter(Boolean).join(", ");
            const eventTime = new Date(`${e.startDate}T00:00:00Z`).getTime();
            const isCluster = viewClusters.some((cluster) => {
              if (cluster.type !== "cluster") return false;
              if (cluster.label !== cityLabel) return false;
              const start = new Date(`${cluster.weekStart}T00:00:00Z`).getTime();
              const end = new Date(`${cluster.weekEnd}T23:59:59Z`).getTime();
              return eventTime >= start && eventTime <= end;
            });
            const tags = getMobileTags(e).slice(0, 2);
            const selected = selectedSet.has(e.id);
            const link = buildEventLink(e);
            return (
              <article
                key={`mobile-${e.id}`}
                onClick={() => toggleSelect(e.id)}
                style={{
                  position: "relative",
                  border: selected ? "1px solid rgba(96,165,250,0.8)" : "1px solid rgba(96,165,250,0.22)",
                  borderRadius: "14px",
                  background: "linear-gradient(145deg, rgba(8,28,52,0.95) 0%, rgba(4,14,30,0.98) 100%)",
                  padding: isCompact ? "10px" : "12px",
                  display: "grid",
                  gap: "8px",
                  boxShadow: selected ? "0 0 0 1px rgba(59,130,246,0.25), 0 12px 22px rgba(2,8,18,0.4)" : "0 10px 18px rgba(2,8,18,0.34)",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "66px minmax(0,1fr) auto", gap: "8px", alignItems: "start" }}>
                  <div style={{ height: "66px", borderRadius: "12px", border: "1px solid rgba(147,197,253,0.24)", background: isHot ? "linear-gradient(180deg, rgba(141,99,59,0.45), rgba(68,42,26,0.6))" : isCluster ? "linear-gradient(180deg, rgba(127,53,69,0.44), rgba(58,22,34,0.62))" : "linear-gradient(180deg, rgba(56,88,138,0.52), rgba(22,37,69,0.64))", display: "grid", alignContent: "center", justifyItems: "center", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                    <div style={{ color: "#dbeafe", fontSize: "11px", fontWeight: 800, lineHeight: 1, letterSpacing: "0.04em", minHeight: "11px" }}>{parts.month}</div>
                    <div
                      style={{
                        color: "#f8fbff",
                        fontSize: isMultiDay ? "18px" : "27px",
                        fontWeight: 820,
                        marginTop: "2px",
                        lineHeight: 1,
                        minHeight: isMultiDay ? "20px" : "27px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        whiteSpace: "nowrap",
                        letterSpacing: isMultiDay ? "0.01em" : "0",
                        maxWidth: "100%",
                      }}
                    >
                      {parts.dayRange}
                    </div>
                    <div style={{ color: "#cfe2fb", fontSize: "10px", fontWeight: 700, marginTop: "3px", lineHeight: 1, minHeight: "10px", letterSpacing: "0.03em" }}>{parts.dowRange}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#f8fbff", fontSize: isCompact ? "18px" : "19px", fontWeight: 760, lineHeight: 1.12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.title}</div>
                    <div style={{ color: "#c2d8f3", fontSize: isCompact ? "14px" : "15px", fontWeight: 650, marginTop: "5px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{e.organizer || "Organizer TBD"}</div>
                    <div style={{ color: "#9ec0e4", fontSize: isCompact ? "13px" : "14px", marginTop: "2px" }}>{cityLabel || e.country || "Location TBD"}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelect(e.id);
                  }}
                  aria-label={selected ? "Deselect event" : "Select event"}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    width: "36px",
                    height: "36px",
                    borderRadius: "0 14px 0 14px",
                    border: "none",
                    background: selected
                      ? "linear-gradient(180deg, rgba(47,109,246,0.96), rgba(28,72,170,0.96))"
                      : "transparent",
                    color: selected ? "#ffffff" : "rgba(210,228,248,0.92)",
                    fontSize: "12px",
                    fontWeight: 900,
                    boxShadow: selected
                      ? "inset 1px -1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(120,190,255,0.16), 0 0 14px rgba(85,155,255,0.34)"
                      : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {selected ? "✓" : "+"}
                </button>

                <div style={{ color: "#c9def9", fontSize: isCompact ? "13px" : "14px", lineHeight: 1.3 }}>
                  <strong style={{ color: "#e9f2ff", fontWeight: 760 }}>Market Signal:</strong>{" "}
                  {isCluster ? "Clustered activity in this market window." : isHot ? "Hot week participation is elevated." : "Institutional attendance trend remains active."}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(isHot ? ["HOT WEEK"] : []).concat(isCluster ? ["CLUSTER"] : []).concat(tags).slice(0, 2).map((tag, index) => (
                    <span key={`${e.id}-m-tag-${tag}-${index}`} style={{ height: "24px", padding: "0 9px", borderRadius: "999px", border: "1px solid rgba(147,197,253,0.26)", background: "rgba(10,26,52,0.7)", color: "#dbeafe", fontSize: "11px", fontWeight: 650, display: "inline-flex", alignItems: "center" }}>{tag}</span>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "8px" }}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = "rgba(194, 202, 214, 0.18)";
                      event.currentTarget.style.borderColor = "rgba(196,210,230,0.72)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = "rgba(8,22,48,0.72)";
                      event.currentTarget.style.borderColor = "rgba(120,170,245,0.72)";
                    }}
                    style={{ height: "28px", borderRadius: "9px", border: "1.5px solid rgba(120,170,245,0.72)", background: "rgba(8,22,48,0.72)", color: "#dbeafe", fontSize: "10px", fontWeight: 900, letterSpacing: "0.02em", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    Event Link
                  </a>
                  <div onClick={(event) => event.stopPropagation()} style={{ display: "flex", justifyContent: "stretch", minWidth: 0 }}>
                    <AddToCalendar
                      title={e.title}
                      startDate={e.startDate}
                      endDate={e.endDate}
                      location={[cityLabel, e.venue].filter(Boolean).join(" · ")}
                      description={buildDescription(e)}
                      url={buildEventLink(e)}
                      compact
                      showIcon
                      fullWidth
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {mobilePanel ? (
          <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(2,8,20,0.62)" }} onClick={() => setMobilePanel(null)}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: "72px",
                maxHeight: "70vh",
                overflowY: "auto",
                overscrollBehavior: "contain",
                background: "linear-gradient(180deg, rgba(8,24,46,0.98) 0%, rgba(4,14,30,0.99) 100%)",
                borderTop: "1px solid rgba(147,197,253,0.26)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                padding: "12px",
                display: "grid",
                gap: "10px",
                minWidth: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "#f8fbff", fontWeight: 800 }}>
                  {mobilePanel === "filters" ? "Filters" : mobilePanel === "workspace" ? "Workspace" : "Market Intelligence"}
                </div>
                <button type="button" onClick={() => setMobilePanel(null)} style={{ border: "1px solid rgba(147,197,253,0.28)", background: "rgba(8,22,48,0.6)", color: "#dbeafe", borderRadius: "8px", height: "30px", padding: "0 10px" }}>Done</button>
              </div>

              {mobilePanel === "filters" ? (
                <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
                  <select value={filters.dateRange} onChange={(e) => setFilters((p) => ({ ...p, dateRange: e.target.value as FiltersState["dateRange"] }))} style={controlStyle}>
                    <option value="next30">Next 30 Days</option>
                    <option value="next60">Next 60 Days</option>
                    <option value="next90">Next 90 Days</option>
                    <option value="all">All</option>
                  </select>
                  <input type="date" value={fromDate} onChange={(e)=>{setFromDate(e.target.value); if (!toDate || e.target.value > toDate) setToDate(e.target.value);}} style={{ ...controlStyle, padding: "0 8px" }} />
                  <input type="date" value={toDate} min={fromDate || undefined} onChange={(e)=>setToDate(e.target.value)} style={{ ...controlStyle, padding: "0 8px" }} />
                  <select aria-label="Country" value="" onChange={(e) => { toggleFilterValue("country", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.country.length ? `${filters.country.length} countries selected` : "All Country"}</option>{countries.map((o, i) => <option key={`m-country-${o}-${i}`} value={o}>{filters.country.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Region" value="" onChange={(e) => { toggleFilterValue("region", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.region.length ? `${filters.region.length} regions selected` : "All Region"}</option>{regions.map((o, i) => <option key={`m-region-${o}-${i}`} value={o}>{filters.region.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="State" value="" onChange={(e) => { toggleFilterValue("state", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.state.length ? `${filters.state.length} states selected` : "All State"}</option>{states.map((o, i) => <option key={`m-state-${o}-${i}`} value={o}>{filters.state.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Cities" value="" onChange={(e) => { toggleFilterValue("cities", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.cities.length ? `${filters.cities.length} cities selected` : "All Cities"}</option>{cities.map((o, i) => <option key={`m-city-${o}-${i}`} value={o}>{filters.cities.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Conference Type" value="" onChange={(e) => { toggleFilterValue("conferenceType", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.conferenceType.length ? `${filters.conferenceType.length} types selected` : "All Conference Types"}</option>{conferenceTypes.map((o, i) => <option key={`m-type-${o}-${i}`} value={o}>{filters.conferenceType.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Industry" value="" onChange={(e) => { toggleFilterValue("sectorThemes", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.sectorThemes.length ? `${filters.sectorThemes.length} industries selected` : "All Industries"}</option>{themes.map((o, i) => <option key={`m-theme-${o}-${i}`} value={o}>{filters.sectorThemes.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Investment Focus" value="" onChange={(e) => { toggleFilterValue("marketFocus", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.marketFocus.length ? `${filters.marketFocus.length} investment focuses selected` : "All Investment Focuses"}</option>{marketFocusOptions.map((o, i) => <option key={`m-focus-${o}-${i}`} value={o}>{filters.marketFocus.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Market Cap" value="" onChange={(e) => { toggleFilterValue("marketCap", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.marketCap.length ? `${filters.marketCap.length} market caps selected` : "All Market Caps"}</option>{marketCapOptions.map((o, i) => <option key={`m-market-cap-${o}-${i}`} value={o}>{filters.marketCap.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Target Audience" value="" onChange={(e) => { toggleFilterValue("targetAudience", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.targetAudience.length ? `${filters.targetAudience.length} target audiences selected` : "All Target Audiences"}</option>{targetAudienceOptions.map((o, i) => <option key={`m-target-audience-${o}-${i}`} value={o}>{filters.targetAudience.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Company Participants" value="" onChange={(e) => { toggleFilterValue("companyParticipants", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.companyParticipants.length ? `${filters.companyParticipants.length} company participants selected` : "All Company Participants"}</option>{companyParticipantOptions.map((o, i) => <option key={`m-company-participants-${o}-${i}`} value={o}>{filters.companyParticipants.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Event Features" value="" onChange={(e) => { toggleFilterValue("eventFeatures", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.eventFeatures.length ? `${filters.eventFeatures.length} event features selected` : "All Event Features"}</option>{eventFeatureOptions.map((o, i) => <option key={`m-event-features-${o}-${i}`} value={o}>{filters.eventFeatures.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Access Model" value="" onChange={(e) => { toggleFilterValue("accessModel", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.accessModel.length ? `${filters.accessModel.length} access models selected` : "All Access Models"}</option>{accessModelOptions.map((o, i) => <option key={`m-access-model-${o}-${i}`} value={o}>{filters.accessModel.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <select aria-label="Organizers" value="" onChange={(e) => { toggleFilterValue("organizer", e.target.value); e.currentTarget.value = ""; }} style={controlStyle}><option value="">{filters.organizer.length ? `${filters.organizer.length} organizers selected` : "All Organizers"}</option>{organizers.map((o, i) => <option key={`m-org-${o}-${i}`} value={o}>{filters.organizer.includes(o) ? `✓ ${o}` : o}</option>)}</select>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", position: "sticky", bottom: 0, background: "linear-gradient(180deg, rgba(4,14,30,0), rgba(4,14,30,0.96) 26%)", paddingTop: "8px" }}>
                    <button type="button" onClick={clearWorkspaceView} style={{ height: "36px", borderRadius: "9px", border: "1px solid rgba(147,197,253,0.26)", background: "rgba(8,22,48,0.7)", color: "#dbeafe", fontWeight: 700 }}>Reset</button>
                    <button type="button" onClick={() => setMobilePanel(null)} style={{ height: "36px", borderRadius: "9px", border: "1px solid rgba(59,130,246,0.45)", background: "rgba(37,99,235,0.3)", color: "#fff", fontWeight: 700 }}>Apply</button>
                  </div>
                </div>
              ) : null}

              {mobilePanel === "workspace" ? (
                <div style={{ display: "grid", gap: "8px" }}>
                  <button type="button" onClick={() => openCalendarSync("Google Calendar")} style={{ ...controlStyle, height: "38px", fontWeight: 700 }}>Google Calendar</button>
                  <button type="button" onClick={() => openCalendarSync("Apple Calendar")} style={{ ...controlStyle, height: "38px", fontWeight: 700 }}>Apple Calendar</button>
                  <button type="button" onClick={() => openCalendarSync("Outlook")} style={{ ...controlStyle, height: "38px", fontWeight: 700 }}>Outlook</button>
                  <button type="button" onClick={createSelectedIcs} style={{ ...controlStyle, height: "38px", fontWeight: 700 }}>Download ICS Snapshot</button>
                  <button type="button" onClick={saveCurrentView} style={{ ...controlStyle, height: "38px", fontWeight: 700 }}>Save Current View</button>
                  <button type="button" onClick={shareSelected} style={{ ...controlStyle, height: "38px", fontWeight: 700 }}>Share Current Market View</button>
                  <div style={{ color: "#9ec0e4", fontSize: "11px", marginTop: "4px" }}>Saved views and lists use local browser storage.</div>
                </div>
              ) : null}

              {mobilePanel === "intel" ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  <ConcentrationStrip
                    items={viewConcentrationCards}
                    onSelect={applyConcentrationItem}
                  />
                  <div style={{ border: "1px solid rgba(147,197,253,0.18)", borderRadius: "10px", background: "rgba(8,30,53,0.72)", padding: "10px", color: "#dbeafe", fontSize: "12px", lineHeight: 1.45 }}>
                    <div>Top city: <strong>{inViewStats.cities} active cities</strong></div>
                    <div>Top themes: <strong>{inViewStats.themes}</strong></div>
                    <div>Recent additions: <strong>{events.slice(-5).length}</strong></div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 120, height: isCompact ? "68px" : "72px", paddingBottom: "env(safe-area-inset-bottom)", background: "linear-gradient(180deg, rgba(5,16,32,0.98), rgba(3,12,24,0.99))", borderTop: "1px solid rgba(147,197,253,0.22)", display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
          {[
            { id: "filters" as const, label: "Filters", icon: "◫" },
            { id: "database" as const, label: "Database", icon: "▤" },
            { id: "workspace" as const, label: "Workspace", icon: "⌘" },
            { id: "intel" as const, label: "Market Intel", icon: "◉" },
          ].map((item) => {
            const active = item.id !== "database" ? mobilePanel === item.id : mobilePanel === null;
            return (
              <button
                key={`mobile-nav-${item.id}`}
                type="button"
                onClick={() => {
                  if (item.id === "database") {
                    setMobilePanel(null);
                    scrollToResultsAnchor();
                    return;
                  }
                  setMobilePanel((prev) => (prev === item.id ? null : item.id));
                }}
                style={{ border: "none", background: "transparent", color: active ? "#f8fbff" : "#9fb8d8", display: "grid", justifyItems: "center", alignContent: "center", gap: "4px", fontSize: isCompact ? "11px" : "12px", fontWeight: 700, minHeight: "44px" }}
              >
                <span style={{ fontSize: isCompact ? "15px" : "16px", lineHeight: 1, color: active ? "#93c5fd" : "#7f95b5" }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="workspace-shell" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 290px) minmax(0, 1fr) minmax(300px, 320px)", gridTemplateRows: "minmax(0, 1fr)", gap: "18px", alignItems: "stretch", width: "100%", height: PANEL_HEIGHT, maxWidth: "100%", minWidth: 0, minHeight: 0, overflow: "hidden", justifyContent: "center" }}>
      <aside
        className="ccc-scroll-rail ccc-scroll-rail-left"
        style={{ position: "relative", alignSelf: "stretch", display: "grid", gap: "8px", minWidth: 0, minHeight: 0, width: "100%", maxWidth: "280px", height: PANEL_HEIGHT, maxHeight: PANEL_HEIGHT, overflow: "hidden", paddingRight: "2px" }}
      >
        <div style={{ height: "100%", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", paddingRight: "4px", paddingBottom: "6px" }}>
        <SharedFilterRail
          filters={filters}
          filterOptions={discoveryPage.filterOptions}
          openSections={filterGroupsOpen}
          onToggleSection={(section) => setFilterGroupsOpen((previous) => ({ ...previous, [section]: !previous[section] }))}
          onDateRangeChange={(dateRange) => setFilters((previous) => ({ ...previous, dateRange }))}
          onToggleFilter={toggleFilterValue}
          onClear={clearWorkspaceView}
          filterMatchingControl={<FilterMatchingControl value={filterMode} onChange={updateFilterMode} minimal />}
          dateRangeExtra={
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "6px" }}>
              <input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); if (!toDate || event.target.value > toDate) setToDate(event.target.value); }} style={{ ...controlStyle, padding: "0 30px 0 10px", fontSize: "13px" }} />
              <input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} style={{ ...controlStyle, padding: "0 30px 0 10px", fontSize: "13px" }} />
            </div>
          }
          quickFeeds={[
            { key: "investor-conferences", title: "Investor Conferences", color: "#3b82f6", icon: "investor", count: quickFeedCounts.investorConferences, onClick: () => applyHeroQuickView("investor-conferences") },
            { key: "healthcare-conferences", title: "Healthcare", color: "#14b8a6", icon: "health", count: quickFeedCounts.healthcareConferences, onClick: () => applyHeroQuickView("healthcare-conferences") },
            { key: "private-markets", title: "Private Markets", color: "#7c3aed", icon: "private", count: quickFeedCounts.privateMarkets, onClick: () => applyHeroQuickView("private-markets") },
            { key: "canada-events", title: "Canada Events", color: "#dc2626", icon: "canada", count: quickFeedCounts.canadaEvents, onClick: () => applyHeroQuickView("canada-events") },
            { key: "upcoming-30-days", title: "Next 30 Days", color: "#2563eb", icon: "next30", count: quickFeedCounts.upcoming30, onClick: () => applyHeroQuickView("upcoming-30-days") },
            { key: "hot-weeks", title: "Hot Weeks", color: "#f97316", icon: "next60", count: quickFeedCounts.hotWeeks, onClick: () => { const firstHot = viewConcentrationCards.find((item) => item.type === "hotweek") || allConcentrationCards.find((item) => item.type === "hotweek"); if (firstHot) { applyConcentrationItem(firstHot); recordActivity("feed", "Quick feed: hot weeks"); } } },
          ]}
          isLoading={dataIsBootstrapping}
        />
        </div>
      </aside>

      <section ref={centerWorkspaceRef} className="center-workspace ccc-scroll-center" style={{ display: "grid", alignContent: "start", gap: "22px", minWidth: 0, minHeight: 0, maxWidth: "1240px", width: "100%", height: PANEL_HEIGHT, maxHeight: PANEL_HEIGHT, overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", position: "relative", padding: "0 28px 8px", margin: "0 auto" }}>
        <div style={{ position: "relative", zIndex: 1, transition: "opacity 180ms ease-out" }}>
        {dashboardMode === "getstarted" ? (
        <div
          key="mode-getstarted"
          style={{
            width: "100%",
            maxWidth: "1080px",
            margin: "0 auto",
            padding: "28px 18px 72px",
            background: "linear-gradient(180deg, #edf5ff 0%, #dfeaf7 100%)",
            borderRadius: "28px",
            boxShadow: "0 18px 48px rgba(28, 64, 108, 0.12)",
            display: "grid",
            gap: "26px",
            overflow: "hidden",
          }}
        >
          <section
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(224,239,255,0.86))",
              border: "1px solid rgba(120,150,190,0.24)",
              borderRadius: "30px",
              padding: "42px",
              boxShadow: "0 24px 60px rgba(28,64,108,0.14)",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: "16px", minWidth: 0 }}>
              <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2f6ff3" }}>
                Private Beta · Capital Markets Conference Intelligence
              </div>
              <div style={{ display: "grid", gap: "10px", maxWidth: "760px" }}>
                <div style={{ fontSize: "clamp(34px, 3.4vw, 42px)", lineHeight: 1.03, fontWeight: 950, letterSpacing: "-0.035em", color: "#071a33", textWrap: "balance" as any }}>
                  Capital markets conference intelligence, all in one place.
                </div>
                <div style={{ fontSize: "19px", lineHeight: 1.35, fontWeight: 700, color: "#17345a", maxWidth: "640px" }}>
                  Track, analyze, sync, and share the conferences that matter to you.
                </div>
                <div style={{ fontSize: "clamp(24px, 2.2vw, 30px)", lineHeight: 1.15, fontWeight: 900, letterSpacing: "-0.025em", color: "#071a33" }}>
                  Find the right conferences.
                  <br />
                  Sync them to your calendar.
                  <br />
                  Act before the window closes.
                </div>
              </div>
              <div style={{ fontSize: "17px", lineHeight: 1.45, fontWeight: 500, color: "#415d7d", maxWidth: "700px" }}>
                Capital Conference Calendar helps investors, issuers, sponsors, advisors, and service providers discover relevant capital markets events, save filtered market views, build shareable conference lists, and identify high-density activity windows before planning outreach, travel, sponsorship, or meetings.
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setDashboardMode("market");
                    setWorkspaceViewMode("database");
                  }}
                  style={{
                    height: "46px",
                    padding: "0 22px",
                    background: "linear-gradient(180deg, #3b82f6, #2563eb)",
                    color: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid rgba(47,111,243,0.3)",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 12px 28px rgba(47,111,243,0.24)",
                  }}
                >
                  Enter Discovery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDashboardMode("marketview");
                    setWorkspaceViewMode("database");
                  }}
                  style={{
                    height: "46px",
                    padding: "0 22px",
                    background: "rgba(255,255,255,0.86)",
                    color: "#0d2748",
                    border: "1px solid rgba(120,150,190,0.32)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Explore Market View
                </button>
                <button
                  type="button"
                  onClick={() => centerWorkspaceRef.current?.scrollTo({ top: centerWorkspaceRef.current.scrollHeight, behavior: "smooth" })}
                  style={{ border: "none", background: "transparent", color: "#2f6ff3", fontSize: "14px", fontWeight: 900, cursor: "pointer" }}
                >
                  Request Access →
                </button>
              </div>
            </div>

            <div
              style={{
                minWidth: 0,
                maxWidth: isMobileViewport ? "100%" : "980px",
                justifySelf: "start",
                borderRadius: "0px",
                overflow: "hidden",
              }}
            >
              <img
                src="/onboarding/get-started-hero-reference.png"
                alt="Capital Conference Calendar workspace preview"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </div>
          </section>

          <section style={{ display: "grid", gap: "16px" }}>
            <div style={{ fontSize: "34px", lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.035em", color: "#071a33" }}>What CCC helps you do</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : isTabletViewport ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              {[
                {
                  title: "Sync the conferences that matter",
                  copy: "Create live calendar feeds from the events, cities, sectors, organizers, and market views your team cares about.",
                  bullets: ["Google, Apple, and Outlook", "Live ICS subscription feeds", "Updates as events are added or reclassified"],
                  accent: "#2f6ff3",
                  icon: "sync" as const,
                },
                {
                  title: "Build lists your team can act on",
                  copy: "Save selected conferences into named lists for coverage planning, outreach, sponsorship, travel, or client targeting.",
                  bullets: ["Save selected events", "Name and manage lists", "Share by email"],
                  accent: "#06b6d4",
                  icon: "lists" as const,
                },
                {
                  title: "Find the market before the meeting",
                  copy: "Use Market View to identify hot weeks, city clusters, audience concentration, organizer activity, and market focus trends.",
                  bullets: ["Hot weeks", "City clusters", "Audience and market focus signals"],
                  accent: "#f59e0b",
                  icon: "status" as const,
                },
              ].map((card) => (
                <div key={card.title} style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(120,150,190,0.24)", borderRadius: "22px", padding: "24px", minHeight: "240px", boxShadow: "0 16px 42px rgba(28,64,108,0.10)", display: "grid", alignContent: "start", gap: "14px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: `${card.accent}18`, color: card.accent, display: "grid", placeItems: "center" }}>
                    <RightRailSectionIcon kind={card.icon} />
                  </div>
                  <div style={{ fontSize: "22px", lineHeight: 1.1, fontWeight: 900, color: "#071a33" }}>{card.title}</div>
                  <div style={{ fontSize: "15.5px", lineHeight: 1.45, color: "#415d7d" }}>{card.copy}</div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {card.bullets.map((bullet) => (
                      <div key={bullet} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#415d7d", fontSize: "14px", lineHeight: 1.4 }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: card.accent, flex: "0 0 auto" }} />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ display: "grid", gap: "16px" }}>
            <div style={{ fontSize: "34px", lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.035em", color: "#071a33" }}>How the workspace is organized</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "minmax(0, 1fr) 48px minmax(0, 1.2fr) 48px minmax(0, 1fr)", gap: "0", alignItems: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.84)", border: "1px solid rgba(120,150,190,0.24)", borderRadius: "22px", padding: "22px", display: "grid", gap: "12px", minHeight: "180px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#2f6ff3" }}>
                  <FilterSectionIcon kind="date" />
                  <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Left Rail</div>
                </div>
                <div style={{ fontSize: "22px", lineHeight: 1.1, fontWeight: 900, color: "#071a33" }}>Refine</div>
                <div style={{ fontSize: "15px", lineHeight: 1.45, color: "#415d7d" }}>
                  Filter by date, location, market segment, participation, organizer, and quick-feed presets.
                </div>
              </div>
              {!isMobileViewport ? <div style={{ color: "#5d93e8", fontSize: "28px", fontWeight: 900, textAlign: "center" }}>→</div> : null}
              <div style={{ background: "#061c33", border: "1px solid rgba(120,150,190,0.24)", borderRadius: "24px", padding: "24px", display: "grid", gap: "14px", minHeight: "200px", boxShadow: "0 18px 42px rgba(10,24,42,0.24)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8fc0ff" }}>
                  <WorkspaceViewIcon kind="database" />
                  <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Center Workspace</div>
                </div>
                <div style={{ fontSize: "24px", lineHeight: 1.08, fontWeight: 900, color: "#ffffff" }}>Discover + Analyze</div>
                <div style={{ fontSize: "15px", lineHeight: 1.45, color: "#c6d7ea" }}>
                  Browse conferences in Discovery, review calendar/map views, and use Market View to analyze activity.
                </div>
              </div>
              {!isMobileViewport ? <div style={{ color: "#5d93e8", fontSize: "28px", fontWeight: 900, textAlign: "center" }}>→</div> : null}
              <div style={{ background: "rgba(255,255,255,0.84)", border: "1px solid rgba(120,150,190,0.24)", borderRadius: "22px", padding: "22px", display: "grid", gap: "12px", minHeight: "180px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#06b6d4" }}>
                  <RightRailSectionIcon kind="actions" />
                  <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Right Control Panel</div>
                </div>
                <div style={{ fontSize: "22px", lineHeight: 1.1, fontWeight: 900, color: "#071a33" }}>Act</div>
                <div style={{ fontSize: "15px", lineHeight: 1.45, color: "#415d7d" }}>
                  Sync calendars, save lists, save market views, and share selected events.
                </div>
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gap: "22px" }}>
            <section>
              <img
                src="/onboarding/get-started-refine-reference.png"
                alt="Refine the conference market preview"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  boxShadow: "0 18px 42px rgba(10,24,42,0.18)",
                }}
              />
            </section>

            <section>
              <img
                src="/onboarding/get-started-calendar-reference.png"
                alt="Live calendar workflow preview"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  boxShadow: "0 18px 42px rgba(10,24,42,0.18)",
                }}
              />
            </section>

            <section>
              <img
                src="/onboarding/get-started-lists-reference.png"
                alt="Build and share lists preview"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  boxShadow: "0 18px 42px rgba(10,24,42,0.18)",
                }}
              />
            </section>

            <section style={{ display: "grid", gap: "20px" }}>
              <img
                src="/onboarding/get-started-marketview-reference-1.png"
                alt="Market View analytics preview"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  boxShadow: "0 18px 42px rgba(10,24,42,0.18)",
                }}
              />
              <img
                src="/onboarding/get-started-marketview-reference-2.png"
                alt="Market View intelligence preview"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  boxShadow: "0 18px 42px rgba(10,24,42,0.18)",
                }}
              />
            </section>
          </section>

          <section>
            <img
              src="/onboarding/get-started-living-index-reference.png"
              alt="Living conference index preview"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: "24px",
                boxShadow: "0 18px 42px rgba(10,24,42,0.18)",
              }}
            />
          </section>

        </div>
        ) : dashboardMode === "market" ? (
        <div style={{ display: "grid", gap: "0", paddingBottom: compactSingleResultLayout ? "0" : "2px", marginTop: compactSingleResultLayout ? "2px" : "4px" }}>
          {previewContext ? (
            <div
              style={{
                display: "grid",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "14px",
                marginBottom: "12px",
                background:
                  "linear-gradient(180deg, rgba(8,30,52,0.7), rgba(5,21,38,0.78))",
                border: "1px solid rgba(96,165,250,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px 12px",
                  color: "#dbeafe",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 900,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "#8bbcff",
                  }}
                >
                  Preview Dataset Context
                </span>
                <span style={{ fontSize: "13px", color: "#cfe2f8" }}>
                  Public intelligence uses approved, website-visible records only.
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {[
                  { label: "Total", value: previewContext.publicCounts.totalRecords, tone: "#9fb6cf" },
                  { label: "Approved", value: previewContext.publicCounts.approvedVisibleRecords, tone: "#dbeafe" },
                  { label: "Verified", value: previewContext.publicCounts.verifiedApprovedRecords, tone: "#53e0c1" },
                  { label: "Pending", value: previewContext.publicCounts.pendingApprovalRecords, tone: "#fbbf24" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      height: "28px",
                      padding: "0 10px",
                      borderRadius: "999px",
                      background: "rgba(8, 24, 42, 0.72)",
                      border: "1px solid rgba(96,165,250,0.16)",
                      color: item.tone,
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    <span style={{ color: "#8fa8c3", fontWeight: 700 }}>{item.label}</span>
                    <span style={{ color: item.tone, fontWeight: 900 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "14px 18px",
                  fontSize: "12px",
                  color: "#9fb6d4",
                  lineHeight: 1.45,
                }}
              >
                <span>
                  Freshness:{" "}
                  <strong style={{ color: "#dbeafe", fontWeight: 800 }}>
                    {formatPreviewDate(previewContext.freshness.latestVerifiedDate)}
                  </strong>
                </span>
                <span>
                  Verified stamp coverage:{" "}
                  <strong style={{ color: "#dbeafe", fontWeight: 800 }}>
                    {previewContext.freshness.approvedRecordsWithVerificationStamp}
                  </strong>
                  {" "}of{" "}
                  <strong style={{ color: "#dbeafe", fontWeight: 800 }}>
                    {previewContext.publicCounts.approvedVisibleRecords}
                  </strong>
                </span>
                <span>
                  Coverage window:{" "}
                  <strong style={{ color: "#dbeafe", fontWeight: 800 }}>
                    {previewContext.approvedCoverage.earliestDate
                      ? `${previewContext.approvedCoverage.earliestDate} to ${previewContext.approvedCoverage.latestDate}`
                      : "No approved date range"}
                  </strong>
                </span>
                <span>
                  Strongest continuous run:{" "}
                  <strong style={{ color: "#dbeafe", fontWeight: 800 }}>
                    {previewContext.approvedCoverage.strongestConsecutiveRun.length > 0
                      ? `${previewContext.approvedCoverage.strongestConsecutiveRun.startMonth} – ${previewContext.approvedCoverage.strongestConsecutiveRun.endMonth} (${previewContext.approvedCoverage.strongestConsecutiveRun.length} months)`
                      : "Insufficient coverage"}
                  </strong>
                </span>
              </div>
            </div>
          ) : null}
          <div
            style={{
              padding: "8px 18px 8px",
              marginBottom: "8px",
              display: "grid",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.14em", fontWeight: 900, color: "#8fbfff", textTransform: "uppercase", marginBottom: "4px" }}>
                  Discovery
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, lineHeight: 1.02, color: "#f8fbff", letterSpacing: "-0.03em" }}>
                  Conference Intelligence Discovery
                </div>
                <div style={{ fontSize: "13px", lineHeight: 1.3, color: "#b8cbe0", marginTop: "6px", maxWidth: "720px" }}>
                  Explore verified conferences with timing, audience, participation, and market-context signals.
                </div>
              </div>

              <div>
                <div style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8fbfff", marginBottom: "5px" }}>
                  View Selection
                </div>
                <div style={{ display: "inline-flex", gap: "6px" }}>
                  {[
                    { key: "database" as const, label: "DATABASE", icon: "database" as const },
                    { key: "calendar" as const, label: "CALENDAR", icon: "calendar" as const },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setWorkspaceViewMode(mode.key)}
                      style={{
                        height: "28px",
                        padding: "0 12px",
                        borderRadius: "9px",
                        border: workspaceViewMode === mode.key ? "1px solid #78aaff" : "1px solid rgba(82, 123, 174, .38)",
                        background: workspaceViewMode === mode.key ? "#2f6df6" : "rgba(8, 26, 46, .72)",
                        color: workspaceViewMode === mode.key ? "#eef6ff" : "#aec8e6",
                        fontSize: "10px",
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <span style={{ width: "14px", height: "14px", color: workspaceViewMode === mode.key ? "#cfe4ff" : "#7ea7d2", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <WorkspaceViewIcon kind={mode.icon} />
                      </span>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="discovery-header-metrics"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(0, max-content))",
                width: "100%",
                maxWidth: "100%",
                marginTop: "10px",
              }}
            >
              {discoveryHeaderMetrics.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="discovery-header-metric"
                  style={{
                    padding: "6px 14px",
                    minHeight: "36px",
                    display: "grid",
                    gap: "2px",
                    borderLeft: index === 0 ? "none" : "1px solid rgba(96,165,250,0.45)",
                    boxShadow: index === 0 ? "none" : "-1px 0 10px rgba(59,130,246,0.16)",
                  }}
                >
                  <div style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.1em", lineHeight: 1.05, textTransform: "uppercase", color: metric.tone, marginBottom: "1px" }}>
                    {metric.label}
                  </div>
                  <div style={{ fontSize: metric.compact ? "14px" : "17px", fontWeight: 800, lineHeight: 1.02, color: "#ffffff" }}>
                    {metric.value}
                  </div>
                  {metric.detail ? (
                    <div style={{ fontSize: "9px", fontWeight: 600, color: "#8fa8c3", lineHeight: 1.1, marginTop: "1px" }}>
                      {metric.detail}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : dashboardMode === "submit" ? (
          <div
            style={{
              padding: "32px 24px 72px",
              maxWidth: "1180px",
              margin: "0 auto",
              display: "grid",
              gap: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.75fr)",
                gap: "28px",
                alignItems: "center",
                padding: "28px",
                borderRadius: "28px",
                background: "radial-gradient(circle at 18% 0%, rgba(59,130,246,0.18), transparent 36%), radial-gradient(circle at 82% 18%, rgba(45,212,191,0.08), transparent 28%), linear-gradient(135deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))",
                border: "1px solid rgba(107,157,210,0.28)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fb8ff", marginBottom: "12px" }}>
                  Submit Mode · Conference Coverage
                </div>
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: "48px",
                    lineHeight: 1,
                    fontWeight: 950,
                    letterSpacing: "-0.045em",
                    maxWidth: "760px",
                  }}
                >
                  Submit a conference for review.
                </div>
                <div style={{ color: "#d9e8fb", fontSize: "19px", lineHeight: 1.4, fontWeight: 650, maxWidth: "760px", marginTop: "14px" }}>
                  Share a capital markets conference, investor event, roadshow, or industry gathering for potential inclusion in Capital Conference Calendar.
                </div>
                <div style={{ color: "#a9bfd8", fontSize: "15px", lineHeight: 1.5, maxWidth: "760px", marginTop: "12px" }}>
                  Every submission is reviewed before it is added to the index. Qualified events may appear in Discovery, Market View, live calendar feeds, saved market views, and conference intelligence signals.
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px" }}>
                  <button
                    type="button"
                    onClick={() => submitUrlRef.current?.focus()}
                    style={{
                      height: "46px",
                      padding: "0 22px",
                      background: "linear-gradient(180deg, #3b82f6, #2563eb)",
                      color: "#ffffff",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 900,
                      border: "1px solid rgba(96,165,250,0.45)",
                      cursor: "pointer",
                    }}
                  >
                    Submit Conference URL
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById("submit-qualifies-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    style={{
                      height: "46px",
                      padding: "0 22px",
                      background: "rgba(255,255,255,0.08)",
                      color: "#dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 900,
                      border: "1px solid rgba(120,150,190,0.32)",
                      cursor: "pointer",
                    }}
                  >
                    What qualifies?
                  </button>
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(8,31,55,0.94), rgba(5,20,36,0.98))",
                  border: "1px solid rgba(107,157,210,0.28)",
                  borderRadius: "24px",
                  padding: "28px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
                }}
              >
                <div style={{ color: "#dce9fb", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "18px" }}>
                  Submission Review
                </div>
                <div style={{ color: "#9fb7d2", fontSize: "13px", lineHeight: 1.4, marginBottom: "16px" }}>
                  We review each submitted event before adding it to the live conference index.
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  {[
                    { label: "URL submitted", note: "Conference website received", kind: "link" as const, accent: "#3b82f6" },
                    { label: "Reviewed by CCC", note: "Fit and event relevance checked", kind: "shield" as const, accent: "#22c55e" },
                    { label: "Classified", note: "Tagged by focus, audience, and type", kind: "layers" as const, accent: "#f59e0b" },
                    { label: "Added to coverage", note: "May appear in calendar workflows", kind: "calendar" as const, accent: "#2dd4bf" },
                  ].map((step, index, arr) => (
                    <div key={step.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", alignItems: "center", position: "relative" }}>
                      <span
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "16px",
                          background: "linear-gradient(180deg, rgba(80,120,255,.24), rgba(28,48,110,.16))",
                          border: "1px solid rgba(160,200,255,.18)",
                          boxShadow: `0 0 24px ${step.accent}24`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AboutIcon kind={step.kind} color={step.accent} />
                      </span>
                      <div>
                        <div style={{ color: "#ffffff", fontSize: "16px", fontWeight: 800 }}>{step.label}</div>
                        <div style={{ color: "#9fb7d2", fontSize: "13px", lineHeight: 1.35 }}>{step.note}</div>
                      </div>
                      {index < arr.length - 1 ? (
                        <div
                          style={{
                            position: "absolute",
                            left: "23px",
                            top: "48px",
                            width: "2px",
                            height: "20px",
                            background: "linear-gradient(180deg, rgba(59,130,246,0.6), rgba(45,212,191,0.18))",
                          }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
                Benefits of submitting
              </div>
              <div style={{ color: "#ffffff", fontSize: "26px", lineHeight: 1.1, fontWeight: 900, marginBottom: "6px" }}>Why submit your event?</div>
              <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.45, maxWidth: "860px" }}>
                Qualified events can become part of a searchable conference intelligence workflow used to discover, track, save, sync, and analyze capital markets activity.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
              {[
                {
                  title: "Be discoverable",
                  body: "Help investors, issuers, advisors, sponsors, and service providers find your event through searchable conference records.",
                  icon: "database" as const,
                  accent: "#3b82f6",
                },
                {
                  title: "Reach calendar workflows",
                  body: "Qualified events may appear in calendar feeds and saved market views that users sync to Google, Apple, and Outlook.",
                  icon: "calendar" as const,
                  accent: "#2dd4bf",
                },
                {
                  title: "Support market intelligence",
                  body: "Your event can help power market signals around hot weeks, city clusters, organizer activity, market focus, and audience concentration.",
                  icon: "radar" as const,
                  accent: "#f59e0b",
                },
                {
                  title: "Improve event accuracy",
                  body: "Submission details help CCC verify dates, location, organizer, website, participation type, and classification tags.",
                  icon: "shield" as const,
                  accent: "#22c55e",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: "rgba(8,31,55,0.82)",
                    border: "1px solid rgba(107,157,210,0.22)",
                    borderRadius: "18px",
                    padding: "20px",
                    minHeight: "180px",
                    boxShadow: "0 14px 34px rgba(8,20,36,0.16)",
                    display: "grid",
                    alignContent: "start",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "linear-gradient(180deg, rgba(80,120,255,.24), rgba(28,48,110,.16))",
                      border: "1px solid rgba(160,200,255,.18)",
                      boxShadow: `0 0 22px ${card.accent}24`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AboutIcon kind={card.icon} color={card.accent} />
                  </span>
                  <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900 }}>{card.title}</div>
                  <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.45 }}>{card.body}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
                Review workflow
              </div>
              <div style={{ color: "#ffffff", fontSize: "26px", lineHeight: 1.1, fontWeight: 900, marginBottom: "14px" }}>How the review process works</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                {[
                  ["01", "Submit the URL", "Only the conference website link is required."],
                  ["02", "CCC reviews the event", "We check whether the event fits the capital markets conference index."],
                  ["03", "Details are verified and classified", "Dates, location, organizer, format, participation type, market focus, and event category are reviewed."],
                  ["04", "Qualified events are added", "Approved events may appear in Discovery, Market View, calendar feeds, and market intelligence signals."],
                ].map(([num, title, body], index) => (
                  <div
                    key={num}
                    style={{
                      position: "relative",
                      background: "rgba(8,31,55,0.62)",
                      border: "1px solid rgba(107,157,210,0.18)",
                      borderRadius: "18px",
                      padding: "18px",
                      display: "grid",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "999px",
                        background: "linear-gradient(180deg, rgba(59,130,246,0.22), rgba(45,212,191,0.12))",
                        border: "1px solid rgba(96,165,250,0.34)",
                        color: "#dbeafe",
                        fontSize: "14px",
                        fontWeight: 900,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {num}
                    </span>
                    <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900, lineHeight: 1.15 }}>{title}</div>
                    <div style={{ color: "#c8d8ec", fontSize: "14px", lineHeight: 1.45 }}>{body}</div>
                    {index < 3 ? (
                      <div style={{ position: "absolute", top: "38px", right: "-10px", width: "20px", height: "2px", background: "linear-gradient(90deg, rgba(59,130,246,0.55), rgba(45,212,191,0.45))" }} />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)", gap: "24px" }}>
              <div
                style={{
                  background: "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))",
                  border: "1px solid rgba(107,157,210,0.24)",
                  borderRadius: "22px",
                  padding: "24px",
                }}
              >
                <div style={{ color: "#ffffff", fontSize: "26px", lineHeight: 1.1, fontWeight: 900, marginBottom: "6px" }}>Submit Conference URL</div>
                <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.45, marginBottom: "18px" }}>
                  Start with the event website. Optional details help us review and classify the event faster.
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitConferenceUrl();
                  }}
                  style={{ display: "grid", gap: "12px" }}
                >
                  <div>
                    <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Conference URL</div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", opacity: 0.9 }}>
                        <AboutIcon kind="link" color="#63A4FF" />
                      </span>
                      <input
                        ref={submitUrlRef}
                        type="url"
                        value={submitForm.url}
                        onChange={(e) => {
                          setSubmitForm((prev) => ({ ...prev, url: e.target.value }));
                          if (submitFormMessage) setSubmitFormMessage(null);
                        }}
                        placeholder="Conference website URL — required"
                        style={{
                          height: "48px",
                          width: "100%",
                          borderRadius: "12px",
                          border: "1px solid rgba(96,165,250,0.4)",
                          background: "rgba(8,22,48,0.88)",
                          color: "#dbeafe",
                          padding: "0 14px 0 44px",
                          fontSize: "15px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                    <div>
                      <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Submitter Email</div>
                      <input type="email" value={submitForm.email} onChange={(e) => setSubmitForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Optional" style={{ height: "42px", width: "100%", borderRadius: "10px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 12px", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Conference Name</div>
                      <input type="text" value={submitForm.conferenceName} onChange={(e) => setSubmitForm((prev) => ({ ...prev, conferenceName: e.target.value }))} placeholder="Optional" style={{ height: "42px", width: "100%", borderRadius: "10px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 12px", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Organizer</div>
                      <input type="text" value={submitForm.organizer} onChange={(e) => setSubmitForm((prev) => ({ ...prev, organizer: e.target.value }))} placeholder="Optional" style={{ height: "42px", width: "100%", borderRadius: "10px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 12px", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Location</div>
                      <input type="text" value={submitForm.location} onChange={(e) => setSubmitForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Optional" style={{ height: "42px", width: "100%", borderRadius: "10px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 12px", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Start Date</div>
                      <input type="date" value={submitForm.startDate} onChange={(e) => setSubmitForm((prev) => ({ ...prev, startDate: e.target.value }))} aria-label="Conference Start Date" style={{ height: "42px", width: "100%", borderRadius: "10px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 12px", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>End Date</div>
                      <input type="date" value={submitForm.endDate} onChange={(e) => setSubmitForm((prev) => ({ ...prev, endDate: e.target.value }))} aria-label="Conference End Date" style={{ height: "42px", width: "100%", borderRadius: "10px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "0 12px", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>Notes</div>
                    <textarea value={submitForm.notes} onChange={(e) => setSubmitForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes that help us review the event faster" style={{ minHeight: "86px", width: "100%", borderRadius: "12px", border: "1px solid rgba(120,160,255,.22)", background: "rgba(8,22,48,.72)", color: "#dbeafe", padding: "10px 12px", fontSize: "15px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button
                    type="submit"
                    style={{
                      height: "48px",
                      background: "linear-gradient(180deg, #3b82f6, #2563eb)",
                      color: "#ffffff",
                      borderRadius: "12px",
                      fontWeight: 900,
                      fontSize: "15px",
                      border: "1px solid rgba(96,165,250,0.45)",
                      cursor: "pointer",
                    }}
                  >
                    Submit Conference
                  </button>
                  <div style={{ color: submitFormMessage?.type === "error" ? "#fca5a5" : submitFormMessage?.type === "success" ? "#86efac" : "#8fb3d7", fontSize: "12px", lineHeight: 1.4, minHeight: "18px" }}>
                    {submitFormMessage?.text || "Submitting a URL does not guarantee inclusion. CCC reviews submissions before adding events to market coverage."}
                  </div>
                </form>
              </div>

              <div
                id="submit-qualifies-panel"
                style={{
                  background: "linear-gradient(180deg, rgba(12,39,67,0.96), rgba(8,29,50,0.96))",
                  border: "1px solid rgba(107,157,210,0.24)",
                  borderRadius: "22px",
                  padding: "22px",
                  display: "grid",
                  gap: "16px",
                  alignContent: "start",
                  boxShadow: "0 18px 36px rgba(0,0,0,0.14)",
                }}
              >
                <div>
                  <div style={{ color: "#ffffff", fontSize: "22px", fontWeight: 900, lineHeight: 1.1, marginBottom: "8px" }}>What qualifies?</div>
                  <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.45 }}>
                    CCC focuses on capital markets conferences and investor-facing events across North America.
                  </div>
                </div>
                <div style={{ display: "grid", gap: "10px" }}>
                  {[
                    "Investor conferences",
                    "Public company investor events",
                    "Roadshows and investor access events",
                    "Industry conferences with capital markets relevance",
                    "Private markets gatherings",
                    "Sector conferences with investor, issuer, sponsor, or advisor participation",
                    "Capital markets service provider events",
                  ].map((item) => (
                    <div key={item} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: "10px", alignItems: "start", color: "#dbeafe", fontSize: "14px", lineHeight: 1.4 }}>
                      <span style={{ width: "18px", height: "18px", borderRadius: "999px", background: "rgba(34,197,94,0.16)", border: "1px solid rgba(34,197,94,0.4)", color: "#86efac", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", marginTop: "1px" }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: "1px", background: "rgba(107,157,210,0.18)" }} />
                <div>
                  <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
                    Best submissions include
                  </div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {[
                      "Official event website",
                      "Event dates",
                      "Organizer name",
                      "City and venue",
                      "Audience or participation type",
                      "Market focus or sector theme",
                    ].map((item) => (
                      <div key={item} style={{ color: "#c8d8ec", fontSize: "14px", lineHeight: 1.4, display: "grid", gridTemplateColumns: "16px 1fr", gap: "10px" }}>
                        <span style={{ color: "#63A4FF", fontWeight: 900 }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: "18px",
                background: "rgba(4,14,32,0.86)",
                border: "1px solid rgba(107,157,210,0.18)",
                padding: "18px 20px",
                display: "grid",
                gap: "10px",
                boxShadow: "0 16px 28px rgba(0,0,0,0.12)",
              }}
            >
              <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900 }}>Reviewed before inclusion</div>
              <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.45, maxWidth: "980px" }}>
                Capital Conference Calendar is a curated conference index. Submissions are reviewed for fit, accuracy, and classification before they are added to the database, calendar feeds, or Market View intelligence.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {["URL-first submission", "Reviewed by CCC", "Coverage expanding"].map((badge) => (
                  <span key={badge} style={{ height: "34px", padding: "0 14px", borderRadius: "999px", background: "rgba(9,25,55,.78)", border: "1px solid rgba(110,160,255,.20)", fontSize: "12px", fontWeight: 700, letterSpacing: ".06em", color: "#ffffff", display: "inline-flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#63A4FF" }} />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : dashboardMode === "about" || dashboardMode === "contact" || dashboardMode === "subscribe" ? (
          <div
            style={{
              padding: "0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
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
                  {dashboardMode === "contact" ? "Contact Mode" : dashboardMode === "subscribe" ? "Subscribe Mode" : "About Mode"}
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
                      : "Capital Conference Calendar"}
                </div>
                <div style={{ color: "rgba(220,230,255,.88)", marginTop: "8px", fontSize: "16px", lineHeight: 1.38, maxWidth: "700px" }}>
                  {dashboardMode === "contact"
                    ? "Connect with the Capital Conference Calendar team for platform support, conference submissions, data questions, workflow assistance, and partnership inquiries."
                    : dashboardMode === "subscribe"
                      ? "Receive curated updates on upcoming capital markets conferences, investor events, active market weeks, and new conference coverage."
                      : "A live intelligence workspace for capital markets conferences, investor events, and market activity across North America."}
                </div>
                <div style={{ color: "rgba(170,190,225,.82)", marginTop: "6px", fontSize: "14px", lineHeight: 1.42, maxWidth: "700px" }}>
                  {dashboardMode === "contact"
                    ? "We respond to most inquiries within 24 hours and support conference organizers, investors, public companies, IR professionals, and capital markets service providers."
                    : dashboardMode === "subscribe"
                      ? "Use the weekly briefing to monitor events, discover market concentration windows, and stay informed as new conferences are added to the calendar."
                      : infoDashboardMode === "submit"
                        ? "Only the conference URL is required. Optional details help us review the event faster."
                      : "Track conference activity, market concentration, organizer density, and live calendar workflows from structured event data."}
                </div>
                <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {(dashboardMode === "contact"
                    ? ["SUPPORT ONLINE", "24 HOUR RESPONSE", "NEW YORK BASED"]
                    : dashboardMode === "subscribe"
                      ? ["WEEKLY BRIEFING", "MARKET ACTIVITY UPDATES", "FREE SUBSCRIPTION"]
                      : infoDashboardMode === "submit"
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
                    {dashboardMode === "contact" ? "Contact Snapshot" : dashboardMode === "subscribe" ? "Briefing Snapshot" : infoDashboardMode === "submit" ? "Submission Snapshot" : "Collapsed Market Snapshot"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDashboardMode("market")}
                    style={{ height: "36px", padding: "0 14px", background: "rgba(70,110,190,.20)", border: "1px solid rgba(130,180,255,.24)", borderRadius: "12px", fontWeight: 700, fontSize: "12px", color: "#dbeafe", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {dashboardMode === "contact" ? "Support Center" : dashboardMode === "subscribe" ? "Weekly Updates" : infoDashboardMode === "submit" ? "Submission Queue" : "Market Intelligence"}
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
                      : infoDashboardMode === "submit"
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
                                infoDashboardMode === "submit"
                                  ? "14px"
                                  : dashboardMode === "contact" && item.label === "Coverage"
                                    ? "10px"
                                    : "19px",
                              fontWeight: infoDashboardMode === "submit" ? 700 : 760,
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
                  : infoDashboardMode === "submit"
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
                  {dashboardMode === "contact" ? "Support Categories" : dashboardMode === "subscribe" ? "Subscribe to Weekly Briefing" : infoDashboardMode === "submit" ? "Submit Conference URL" : "Conference Coverage"}
                </div>
                <div style={{ color: "#a9c4e2", fontSize: "11px", marginBottom: "7px" }}>
                  {dashboardMode === "contact"
                    ? "CCC supports platform users, conference organizers, investors, and market participants across multiple workflows."
                    : dashboardMode === "subscribe"
                      ? "Enter your email to receive conference updates and market activity highlights."
                      : infoDashboardMode === "submit"
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
                ) : infoDashboardMode === "submit" ? (
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
                  {dashboardMode === "contact" ? "Office & Response Snapshot" : dashboardMode === "subscribe" ? "What You'll Receive" : infoDashboardMode === "submit" ? "What qualifies?" : "Coverage Snapshot"}
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
                    : infoDashboardMode === "submit"
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
                      <span>{dashboardMode === "contact" || infoDashboardMode === "submit" ? row.value : `${row.value}%`}</span>
                    </div>
                    {dashboardMode === "contact" || infoDashboardMode === "submit" ? (
                      <div style={{ height: "6px", borderRadius: "999px", background: "rgba(12,34,56,0.5)", border: "1px solid rgba(147,197,253,0.08)" }}>
                        <div style={{ width: infoDashboardMode === "submit" ? "16%" : "24%", height: "100%", borderRadius: "999px", boxShadow: "0 0 10px rgba(59,130,246,0.24)", background: "linear-gradient(90deg, rgba(45,212,191,0.6), rgba(96,165,250,0.72))" }} />
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
                      : infoDashboardMode === "submit"
                        ? "Submissions are reviewed before any event is added to market coverage."
                        : "Coverage expands through ongoing research, organizer discovery, and submitted conference URLs."}
                </div>
              </div>
            </div>

          </div>
        ) : dashboardMode === "legal" ? (
          <div
            style={{
              padding: "0",
              display: "grid",
              gap: "10px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "62% 38%", gap: "16px", marginBottom: "8px", position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#7EA8FF", display: "inline-flex", alignItems: "center", gap: "10px" }}>
                  <span className="ccc-mode-beacon" />
                  Legal Mode
                </div>
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: "38px",
                    fontWeight: 760,
                    lineHeight: 0.96,
                    letterSpacing: "-0.02em",
                    marginTop: "8px",
                    maxWidth: "720px",
                  }}
                >
                  Legal & Information Disclaimer
                </div>
                <div style={{ color: "rgba(220,230,255,.88)", marginTop: "8px", fontSize: "16px", lineHeight: 1.38, maxWidth: "720px" }}>
                  Capital Conference Calendar aggregates conference information from public and third-party sources. Users should independently verify all conference details directly with event organizers before making travel, lodging, registration, or business decisions.
                </div>
                <div style={{ color: "rgba(170,190,225,.82)", marginTop: "6px", fontSize: "14px", lineHeight: 1.42, maxWidth: "720px" }}>
                  Conference schedules, locations, speakers, and registration details can change without notice.
                </div>
                <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {["VERIFY WITH ORGANIZERS", "NO FINANCIAL ADVICE", "THIRD-PARTY SOURCES"].map((pill) => (
                    <span key={pill} style={{ height: "36px", padding: "0 14px", borderRadius: "999px", background: "rgba(9,25,55,.78)", border: "1px solid rgba(110,160,255,.20)", fontSize: "12px", fontWeight: 700, letterSpacing: ".06em", color: "#ffffff", display: "inline-flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#63A4FF" }} />
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: "linear-gradient(180deg, rgba(10,24,52,.96) 0%, rgba(4,14,34,.98) 100%)", border: "1px solid rgba(130,180,255,.12)", borderRadius: "24px", padding: "14px", backdropFilter: "blur(14px)", boxShadow: "0 20px 50px rgba(0,0,0,.42), 0 0 0 1px rgba(110,160,255,.12), inset 0 1px 0 rgba(255,255,255,.05)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-40px", left: "16px", right: "16px", height: "120px", opacity: 0.18, filter: "blur(60px)", background: "#3B82F6", pointerEvents: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: ".12em", color: "rgba(220,230,255,.95)", textTransform: "uppercase" }}>
                    Legal Snapshot
                  </div>
                  <a
                    href="mailto:info@capitalconferencecalendar.com"
                    style={{ height: "32px", padding: "0 12px", background: "rgba(70,110,190,.20)", border: "1px solid rgba(130,180,255,.24)", borderRadius: "10px", fontWeight: 700, fontSize: "11px", color: "#dbeafe", textDecoration: "none", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Contact
                  </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", position: "relative", zIndex: 1 }}>
                  {[
                    { label: "Important Notice", value: "Verify first", kind: "warning" as const, accent: "#63A4FF" },
                    { label: "Information Sources", value: "Public & third-party", kind: "globe" as const, accent: "#4EE3C1" },
                    { label: "Financial Advice", value: "None provided", kind: "radar" as const, accent: "#FFB357" },
                    { label: "Liability", value: "Use at your own risk", kind: "layers" as const, accent: "#A77DFF" },
                  ].map((item) => (
                    <div key={item.label} style={{ minHeight: "74px", padding: "10px", background: "rgba(5,20,44,.92)", border: "1px solid rgba(120,160,255,.16)", borderRadius: "16px", display: "grid", alignContent: "center" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", alignItems: "center", columnGap: "10px" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(180deg, rgba(80,120,255,.24), rgba(28,48,110,.16))", border: "1px solid rgba(160,200,255,.18)", boxShadow: `0 0 24px ${item.accent}29, inset 0 1px 0 rgba(255,255,255,.08)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <AboutIcon kind={item.kind} color={item.accent} />
                        </span>
                        <div style={{ display: "grid", rowGap: "4px", minWidth: 0 }}>
                          <div
                            title={item.value}
                            style={{
                              color: "#ffffff",
                              fontSize: "14px",
                              fontWeight: 760,
                              lineHeight: 1.15,
                              whiteSpace: "normal",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.value}
                          </div>
                          <div
                            title={item.label}
                            style={{
                              color: "#9ec4e9",
                              fontSize: "10px",
                              fontWeight: 600,
                              lineHeight: 1.2,
                              whiteSpace: "normal",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ border: "1px solid rgba(147,197,253,0.1)", borderRadius: "18px", background: "rgba(4,14,32,.92)", padding: "12px", display: "grid", gridTemplateColumns: "260px minmax(0,1fr)", gap: "12px", marginBottom: "10px", boxShadow: "0 8px 20px rgba(2,9,20,0.28)" }}>
              <div>
                <div style={{ color: "#e7f1ff", fontWeight: 760, fontSize: "14px", marginBottom: "8px" }}>On This Page</div>
                <div style={{ display: "grid", gap: "6px" }}>
                  {[
                    "Important Notice",
                    "Information Sources",
                    "No Guarantee of Accuracy",
                    "No Financial Advice",
                    "Third-Party Websites",
                    "Limitation of Liability",
                    "Contact",
                  ].map((item) => (
                    <div key={item} style={{ color: "#cde0f4", fontSize: "12px", padding: "8px 10px", borderRadius: "12px", background: "rgba(8,22,48,.68)", border: "1px solid rgba(120,160,255,.14)" }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  {
                    title: "Always Verify Event Information",
                    body:
                      "Conference schedules, locations, speakers, registration details, and event formats can change without notice. Before booking flights, hotels, transportation, conference registration, or meetings, users should confirm all event details directly through the official conference website or organizer.",
                  },
                  {
                    title: "Information Sources",
                    body:
                      "Conference information displayed on Capital Conference Calendar may be collected from public conference websites, organizer announcements, press releases, public filings, marketing materials, third-party sources, and community submissions. While we attempt to maintain accurate and current information, conference details may change, become outdated, or contain errors.",
                  },
                  {
                    title: "No Guarantee of Accuracy",
                    body:
                      "Capital Conference Calendar makes no representations or warranties regarding event accuracy, event timing, conference availability, registration status, speaker participation, venue information, livestream availability, sponsorship participation, or meeting access. Users assume full responsibility for independently verifying all conference information before taking action.",
                  },
                  {
                    title: "No Financial Advice",
                    body:
                      "Capital Conference Calendar does not provide investment advice, securities recommendations, financial analysis, trading guidance, or investment solicitation. Conference listings do not imply endorsement, recommendation, or evaluation of any company, organizer, investment opportunity, or security.",
                  },
                  {
                    title: "Third-Party Websites",
                    body:
                      "The platform may contain links to third-party conference websites and external resources. Capital Conference Calendar is not responsible for third-party content, registration systems, payment processing, website availability, external privacy practices, or event organizer conduct.",
                  },
                  {
                    title: "Limitation of Liability",
                    body:
                      "To the maximum extent permitted by law, Capital Conference Calendar shall not be liable for travel expenses, hotel expenses, registration fees, business interruption, missed meetings, lost opportunities, scheduling conflicts, event cancellations, event modifications, or reliance on displayed information. Use of the platform is at the user’s own discretion and risk.",
                  },
                ].map((section) => (
                  <div key={section.title} style={{ padding: "12px 14px", borderRadius: "16px", background: "rgba(8,22,48,.68)", border: "1px solid rgba(120,160,255,.14)" }}>
                    <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>{section.title}</div>
                    <div style={{ color: "#a9c4e2", fontSize: "12px", lineHeight: 1.5 }}>{section.body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: "88px", borderRadius: "22px", padding: "0 20px", background: "rgba(4,14,32,.92)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", columnGap: "10px" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "999px", background: "rgba(70,120,255,.18)", color: "#FFCC66", boxShadow: "0 0 14px rgba(255,200,90,.28)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>i</span>
                <div>
                  <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px" }}>Contact</div>
                  <div style={{ color: "#a6c3e2", fontSize: "10px", marginTop: "1px" }}>Questions regarding this page may be directed to info@capitalconferencecalendar.com.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", borderLeft: "1px solid rgba(110,160,255,.16)", paddingLeft: "14px" }}>
                <a
                  href="mailto:info@capitalconferencecalendar.com"
                  style={{ height: "48px", padding: "0 18px", background: "linear-gradient(180deg, #2C6BFF, #2458D8)", color: "#fff", fontWeight: 700, borderRadius: "14px", boxShadow: "0 0 18px rgba(70,120,255,.18)", border: "1px solid rgba(96,165,250,0.44)", fontSize: "14px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                >
                  Email CCC
                </a>
              </div>
            </div>
          </div>
        ) : null}
        </div>
        <div
          ref={resultsAnchorRef}
          style={
            dashboardMode === "market" || dashboardMode === "marketview"
              ? { marginTop: "0", border: "none", borderRadius: 0, background: "transparent", boxShadow: "none" }
              : { marginTop: "8px", border: "1px solid rgba(96,165,250,0.16)", borderRadius: "14px", background: "linear-gradient(180deg, rgba(8,30,53,0.84) 0%, rgba(7,26,47,0.82) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }
          }
        >
          <div
            style={{
              padding: dashboardMode === "marketview" ? "0" : "12px",
              borderBottom: "1px solid rgba(96,165,250,0.16)",
              display: dashboardMode === "market" || dashboardMode === "marketview" ? "none" : "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              width: "100%",
              maxWidth: "100%",
              overflow: "visible",
              position: "relative",
              zIndex: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", minWidth: 0 }}>
              <div style={{ color: "#dbeafe", fontWeight: 700 }}>{selectedEvents.length ? `${selectedEvents.length} selected` : dataIsBootstrapping ? "Loading conference index..." : `Showing ${events.length} of ${discoveryHeaderMetrics.recordCount} conferences`}</div>
            </div>
            <div style={{ display: "none", gap: "6px" }}>
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

          <div style={{ padding: dashboardMode === "market" || dashboardMode === "marketview" || dashboardMode === "getstarted" ? "0" : filteredEvents.length === 1 ? "8px 12px 10px" : "12px 12px 14px", marginTop: compactSingleResultLayout ? "-2px" : "0", background: dashboardMode === "market" || dashboardMode === "marketview" || dashboardMode === "getstarted" ? "transparent" : "linear-gradient(180deg, rgba(7,23,39,0.72) 0%, rgba(6,20,35,0.84) 100%)" }}>
            {activeFilterChips.length && dashboardMode !== "marketview" ? (
              <div style={{ marginBottom: compactSingleResultLayout ? "4px" : filteredEvents.length === 1 ? "6px" : "10px", display: "flex", flexWrap: "wrap", gap: compactSingleResultLayout ? "6px" : "8px" }}>
                {activeFilterChips.map((chip) => {
                  const chipKey = chip.key.split(":")[0];
                  const chipIconKind: "date" | "location" | "segments" | "participation" | "organizers" =
                    chipKey === "search" || chipKey === "dateRange" || chipKey === "dateWindow"
                      ? "date"
                      : chipKey === "country" || chipKey === "region" || chipKey === "state" || chipKey === "cities"
                        ? "location"
	                        : chipKey === "sectorThemes" || chipKey === "publicCompanySectors" || chipKey === "conferenceType" || chipKey === "marketFocus" || chipKey === "marketCap"
	                          ? "segments"
	                          : chipKey === "issuerParticipation" || chipKey === "targetAudience" || chipKey === "companyParticipants" || chipKey === "eventFeatures" || chipKey === "accessModel"
                            ? "participation"
                            : "organizers";
                  return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    style={{
                      height: "34px",
                      padding: "0 14px",
                      borderRadius: "999px",
                      border: "1px solid rgba(117,169,255,0.38)",
                      background: "rgba(10,33,58,0.78)",
                      color: "#d9e8fb",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FilterSectionIcon kind={chipIconKind} />
                    {chip.label} ×
                  </button>
                  );
                })}
                <button
                  type="button"
                  onClick={clearWorkspaceView}
                  style={{
                    height: "34px",
                    padding: "0 14px",
                    borderRadius: "999px",
                    border: "1px solid rgba(117,169,255,0.28)",
                    background: "rgba(8,28,49,0.6)",
                    color: "#93c5fd",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Clear all
                </button>
              </div>
            ) : null}
            {dashboardMode === "market" && workspaceViewMode === "map" ? (
              <div style={{ border: "1px solid rgba(96,165,250,0.18)", borderRadius: "14px", background: "linear-gradient(180deg, rgba(8,25,44,0.82), rgba(6,18,33,0.9))", padding: "16px", display: "grid", gap: "10px" }}>
                <div style={{ color: "#e5f0ff", fontSize: "18px", fontWeight: 780 }}>Map</div>
                <div style={{ color: "#9fc0df", fontSize: "12px", lineHeight: 1.45, maxWidth: "760px" }}>
                  Market Map is reserved for geographic visualization. For now, use Database and Calendar in Discovery, or switch to Market View for analytics and concentration insights.
                </div>
              </div>
            ) : null}
            {dashboardMode === "marketview" ? (
              <div
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  margin: "0 auto",
                  padding: "24px 0 64px",
                  display: "grid",
                  gap: "14px",
                  boxSizing: "border-box",
                  overflowX: "hidden",
                }}
              >
                {(() => {
                  const marketAnalytics = marketViewDataset === "all"
                    ? discoveryPage.allMarketAnalytics
                    : discoveryPage.marketAnalytics;
                  const mv = marketAnalytics;
                  // The deal/access layer always reflects the active Discovery filter set.
                  const filteredDealAnalytics = discoveryPage.marketAnalytics;
                  const dealPulse = filteredDealAnalytics.dealClientPulse;
                  const highestVolumeAudience = dealPulse.audienceCounts[0];
                  const mostActiveDealCity = dealPulse.topCities[0];
                  const sourceTotal = marketAnalytics.total;
                  const filteredDealTotal = filteredDealAnalytics.total;
                  const classifiedDealAccessTotal = dealPulse.structuredAccessEvents + dealPulse.dealMakingEvents - dealPulse.dealMakingWithAccess;
                  const audienceClassificationTotal = dealPulse.audienceCounts.reduce((sum, [, count]) => sum + count, 0);
                  const dealAccessPercent = (count: number) => filteredDealTotal ? Math.round((count / filteredDealTotal) * 100) : 0;
                  const focusCountsRaw = marketAnalytics.focusCounts;
                  const categoryCounts = marketAnalytics.categoryCounts.slice(0, 7);
                  const formatCounts = marketAnalytics.formatCounts.slice(0, 6);
                  const sectorCountsRaw = marketAnalytics.sectorCounts;
                  const audienceCounts = marketAnalytics.audienceCounts;
                  const eventCharacterCounts = marketAnalytics.eventCharacterCounts;
                  const issuerParticipationCounts = marketAnalytics.issuerParticipationCounts;
                  const focusTotal = focusCountsRaw.reduce((sum, [, count]) => sum + count, 0) || 1;
                  const focusCounts =
                    focusCountsRaw.length > 6
                      ? [...focusCountsRaw.slice(0, 6), ["Other", focusCountsRaw.slice(6).reduce((sum, [, count]) => sum + count, 0)] as [string, number]]
                      : focusCountsRaw;

                  const statesCount = marketAnalytics.statesCount;
                  const citiesCount = marketAnalytics.citiesCount;
                  const organizersCount = marketAnalytics.organizersCount;
                  const themesCount = marketAnalytics.themesCount;
                  const issuerAccessCount = marketAnalytics.issuerAccessCount;
                  const noIssuerCount = marketAnalytics.noIssuerCount;
                  const institutionalCount = marketAnalytics.institutionalCount;
                  const mixedCount = marketAnalytics.mixedCount;
                  const presentationCount = marketAnalytics.presentationCount;
                  const oneOnOneCount = marketAnalytics.oneOnOneCount;
                  const issuerWindow = marketAnalytics.issuerWindow;
                  const institutionalWindow = marketAnalytics.institutionalWindow;
                  const sectorWindows = marketAnalytics.sectorWindows;

                  const participationBuckets = [
                    { label: "Issuer Access", count: marketAnalytics.issuerOnlyCount, color: "#8b5cf6" },
                    { label: "Mixed", count: mixedCount, color: "#2dd4bf" },
                    { label: "Investor Heavy", count: marketAnalytics.investorOnlyCount, color: "#22c55e" },
                  ];
                  const participationTotal = participationBuckets.reduce((sum, item) => sum + item.count, 0) || 1;
                  const participationTrendCounts = issuerParticipationCounts.slice(0, 7);

                  const rangeDays = marketViewRange === "8w" ? 56 : marketViewRange === "30d" ? 30 : 90;
                  const todayIso = new Date().toISOString().slice(0, 10);
                  const rangeEndIso = addDaysISO(todayIso, rangeDays);
                  const futureWeeks = mv.weekCounts.filter((item) => item.weekStart >= todayIso);
                  const sortedFutureWeeks = [...futureWeeks].sort((a, b) => (b.count === a.count ? a.weekStart.localeCompare(b.weekStart) : b.count - a.count));
                  const timelineWeeks = mv.weekCounts.filter((item) => item.weekStart >= todayIso && item.weekStart <= rangeEndIso);
                  const timelineSource = timelineWeeks.length ? timelineWeeks : mv.weekCounts.slice(0, marketViewRange === "8w" ? 8 : 12);
                  const timelinePeak = timelineSource.reduce((max, item) => (item.count > max ? item.count : max), 1);
                  const sortedTimeline = [...timelineSource].sort((a, b) => b.count - a.count);
                  const peakWeek = sortedFutureWeeks[0] || sortedTimeline[0] || { weekStart: "", count: 0 };
                  const nextHighestWeek = sortedFutureWeeks[1] || sortedTimeline[1] || { weekStart: "", count: 0 };
                  const upcomingHighWeek = sortedFutureWeeks[2] || sortedTimeline[2] || { weekStart: "", count: 0 };
                  const nextUpcomingWeek = sortedFutureWeeks[0] || upcomingHighWeek;
                  const avgPerWeek = timelineSource.length ? (timelineSource.reduce((sum, item) => sum + item.count, 0) / timelineSource.length).toFixed(1) : "0.0";
                  const topMarketFocus = focusCounts[0];
                  const topSectorSignal = sectorCountsRaw[0] || mv.themeCounts[0];
                  const topPrimaryCategory = categoryCounts[0];
                  const topFormat = formatCounts[0];
                  const focusIntelligenceRows = marketAnalytics.focusIntelligence.map((item) => ({
                    ...item,
                    share: Math.round((item.count / focusTotal) * 100),
                    peakWeek: item.peakWeek.weekStart ? formatWeekLabel(item.peakWeek.weekStart) : "N/A",
                  }));
                  const issuerCityLabel = issuerWindow.bestWeekCity.city !== "N/A" ? issuerWindow.bestWeekCity.city : "Insufficient data";
                  const institutionalCityLabel = institutionalWindow.bestWeekCity.city !== "N/A" ? institutionalWindow.bestWeekCity.city : "Insufficient data";
                  const topCityCount = mv.cityCounts[0];
                  const topCities = mv.cityCounts.slice(0, 3);
                  const topCitiesLabel = topCities.length ? topCities.map(([city]) => city).join(" · ") : "Insufficient data";
                  const topCitiesSupport = topCities.length
                    ? topCities.map(([, count]) => `${count}`).join(" / ") + " conferences"
                    : "Insufficient data";
                  const topOrganizer = mv.organizerCounts[0];
                  const topParticipationTrend = participationTrendCounts[0];
                  const dominantAudience = audienceCounts[0] || topMarketFocus;
                  const dominantTheme = sectorCountsRaw[0] || mv.themeCounts[0];
                  const dominantIssuerParticipation = participationTrendCounts[0];
                  const dominantAudienceLabel =
                    [dominantAudience?.[0], dominantTheme?.[0], dominantIssuerParticipation?.[0]]
                      .filter(Boolean)
                      .slice(0, 3)
                      .join(" · ") || "Insufficient data";
                  const dominantAudienceSupport =
                    [
                      dominantAudience ? `${dominantAudience[1]} events` : "",
                      dominantTheme ? `${dominantTheme[0]} theme` : "",
                      dominantIssuerParticipation ? `${dominantIssuerParticipation[0]} participation` : "",
                    ]
                      .filter(Boolean)
                      .slice(0, 2)
                      .join(" · ") || "Awaiting classification";
                  const lightWeek = [...futureWeeks]
                    .filter((week) => week.count > 0)
                    .sort((a, b) => a.count - b.count || a.weekStart.localeCompare(b.weekStart))[0] || { weekStart: "", count: 0 };
                  const crowdedWeek = peakWeek;
                  const topIssuerCity = issuerWindow.bestWeekCity.city === "N/A" ? null : [issuerWindow.bestWeekCity.city, issuerWindow.bestWeek.count] as RankedCount;
                  const topInvestorCity = institutionalWindow.bestWeekCity.city === "N/A" ? null : [institutionalWindow.bestWeekCity.city, institutionalWindow.bestWeek.count] as RankedCount;
                  const topRegion = marketAnalytics.topRegion ? [marketAnalytics.topRegion, 0] as RankedCount : null;
                  const canadaCount = marketAnalytics.canadaCount;
                  const usCount = marketAnalytics.usCount;
                  const organizerInvestorHeavy = marketAnalytics.organizerInvestorHeavy ? [marketAnalytics.organizerInvestorHeavy, 0] as RankedCount : null;
                  const organizerIssuerAccess = marketAnalytics.organizerIssuerAccess ? [marketAnalytics.organizerIssuerAccess, 0] as RankedCount : null;
                  const organizerConcentration = Math.round(((mv.organizerCounts.slice(0, 5).reduce((sum, [, count]) => sum + count, 0) || 0) / Math.max(1, mv.total)) * 100);
                  const mostGeographicOrganizer = marketAnalytics.mostGeographicOrganizer
                    ? [marketAnalytics.mostGeographicOrganizer.organizer, marketAnalytics.mostGeographicOrganizer.cities] as RankedCount
                    : null;
                  const verifiedCount = marketAnalytics.verifiedCount;
                  const websiteApprovedCount = marketAnalytics.websiteApprovedCount;
                  const verificationStatusCounts = marketAnalytics.verificationStatusCounts.slice(0, 4);
                  const eventCharacterCoverage = marketAnalytics.eventCharacterCoverage;
                  const eventCharacterCoverageShare = sourceTotal ? Math.round((eventCharacterCoverage / sourceTotal) * 100) : 0;
                  const topEventCharacter = eventCharacterCounts[0];
                  const weekInsights = new Map(Object.entries(marketAnalytics.weekInsights));
                  const coverageMetrics = marketAnalytics.coverageMetrics;
                  const coverageAverage =
                    coverageMetrics.length && sourceTotal
                      ? Math.round(
                          coverageMetrics.reduce((sum, item) => sum + item.count / Math.max(1, sourceTotal), 0) /
                            coverageMetrics.length *
                            100
                        )
                      : 0;

                  const signalRows = [
                    {
                      color: "#f59e0b",
                      icon: "flame" as const,
                      title: "Hot Week Detected",
                      text: nextUpcomingWeek.weekStart
                        ? `${formatWeekLabel(nextUpcomingWeek.weekStart)} shows the highest upcoming conference density with ${nextUpcomingWeek.count} events.`
                        : "No upcoming hot week detected yet.",
                      action:
                        nextUpcomingWeek.weekStart
                          ? {
                              type: "week" as const,
                              from: nextUpcomingWeek.weekStart,
                              to: addDaysISO(nextUpcomingWeek.weekStart, 6),
                            }
                          : null,
                    },
                    {
                      color: "#8b5cf6",
                      icon: "building" as const,
                      title: "Issuer Access Gap",
                      text: issuerAccessCount && institutionalCount
                        ? `Issuer-access activity appears in ${issuerAccessCount} events versus ${institutionalCount} investor-heavy events, making the strongest issuer windows more valuable for outreach planning.`
                        : "Issuer-access coverage is still too thin to isolate a clear planning gap.",
                      action:
                        issuerWindow.bestWeek.weekStart
                          ? {
                              type: "week" as const,
                              from: issuerWindow.bestWeek.weekStart,
                              to: addDaysISO(issuerWindow.bestWeek.weekStart, 6),
                            }
                          : null,
                    },
                    {
                      color: "#22c55e",
                      icon: "users" as const,
                      title: "Institutional Audience Concentration",
                      text: dominantAudience
                        ? `${dominantAudience[0]} is most often paired with ${dominantTheme?.[0] || "the leading theme"} and ${dominantIssuerParticipation?.[0] || "the leading participation pattern"}, making the audience signal more actionable.`
                        : "Audience concentration is still building out.",
                      action: dominantAudience
                        ? ({ type: "marketFocus", value: dominantAudience[0] } as AnalysisAction)
                        : null,
                    },
                    {
                      color: "#3b82f6",
                      icon: "tag" as const,
	                      title: "Conference Type Lead",
                      text: topPrimaryCategory
                        ? `${topPrimaryCategory[0]} is the leading event type with ${topPrimaryCategory[1]} conferences in the current view.`
	                        : "Conference type labeling is still building out.",
                      action: topPrimaryCategory ? ({ type: "conferenceType", value: topPrimaryCategory[0] } as AnalysisAction) : null,
                    },
                    {
                      color: "#8b5cf6",
                      icon: "target" as const,
                      title: "Sector Opportunity",
                      text: topSectorSignal
                        ? `${topSectorSignal[0]} is showing the strongest sector concentration right now, which may create a tighter outreach and sponsorship window.`
                        : "Sector opportunity signals are still building out.",
                      action: topSectorSignal ? ({ type: "sectorTheme", value: topSectorSignal[0] } as AnalysisAction) : null,
                    },
                    {
                      color: "#2dd4bf",
                      icon: "trend" as const,
                      title: "Organizer Clustering",
                      text: `${organizerConcentration}% of conference activity comes from the top five organizers, which suggests a relatively concentrated organizer landscape.`,
                      action: topOrganizer?.[0] ? ({ type: "organizer", value: topOrganizer[0] } as AnalysisAction) : null,
                    },
                  ];

                  const geoPositions: Record<string, { left: string; top: string }> = {
                    "New York, NY": { left: "77%", top: "40%" },
                    "Washington, DC": { left: "75%", top: "46%" },
                    "Boston, MA": { left: "81%", top: "33%" },
                    "Chicago, IL": { left: "61%", top: "36%" },
                    "Toronto, ON": { left: "67%", top: "28%" },
                    "San Francisco, CA": { left: "18%", top: "45%" },
                    "Las Vegas, NV": { left: "25%", top: "50%" },
                    "Los Angeles, CA": { left: "16%", top: "57%" },
                    "Houston, TX": { left: "47%", top: "66%" },
                    "Miami, FL": { left: "78%", top: "74%" },
                  };

                  const cardBase: CSSProperties = {
                    background: "linear-gradient(180deg, rgba(8, 31, 55, 0.96), rgba(5, 20, 36, 0.98))",
                    border: "1px solid rgba(107, 157, 210, 0.09)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 22px rgba(0, 0, 0, 0.12)",
                    padding: "15px",
                  };
                  const planningCardBase: CSSProperties = {
                    ...cardBase,
                    background: "linear-gradient(180deg, rgba(9, 35, 61, 0.98), rgba(5, 21, 38, 0.98))",
                    border: "1px solid rgba(107,157,210,0.1)",
                    boxShadow: "0 12px 24px rgba(2, 12, 24, 0.16)",
                  };
                  const splitSpan = isMobileViewport || isTabletViewport ? "1 / -1" : "span 6 / span 6";
                  const kpiColumns = isMobileViewport ? "1fr" : isTabletViewport ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))";
                  const donutColumns = isMobileViewport ? "1fr" : "220px minmax(0, 1fr)";
                  const hotWeekColumns = isMobileViewport ? "1fr" : isTabletViewport ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(240px, 1fr))";
                  const metricColumns = isMobileViewport ? "1fr" : "repeat(3, minmax(0, 1fr))";
                  const opportunityColumns = isMobileViewport ? "1fr" : "repeat(2, minmax(0, 1fr))";

                  const ctaStyle: CSSProperties = {
                    height: "34px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 850,
                    color: "#93c5fd",
                    background: "rgba(12, 35, 61, 0.7)",
                    border: "1px solid rgba(96, 165, 250, 0.25)",
                    cursor: "pointer",
                  };

                  const summaryItems =
                    marketViewDataset === "filtered"
                      ? [
                          { icon: "calendar" as const, label: `${sourceTotal} in current view` },
                          { icon: "calendar" as const, label: `${discoveryPage.allMarketAnalytics.total} total conferences` },
                          { icon: "building" as const, label: `${organizersCount} organizers` },
                          { icon: "mappin" as const, label: `${citiesCount} cities` },
                          { icon: "map" as const, label: `${statesCount} states` },
                          { icon: "tag" as const, label: `${themesCount} themes` },
                          { icon: "target" as const, label: `${focusCountsRaw.length} market focus areas` },
                        ]
                      : [
                          { icon: "calendar" as const, label: `${sourceTotal} conferences` },
                          { icon: "building" as const, label: `${organizersCount} organizers` },
                          { icon: "mappin" as const, label: `${citiesCount} cities` },
                          { icon: "map" as const, label: `${statesCount} states` },
                          { icon: "tag" as const, label: `${themesCount} themes` },
                          { icon: "target" as const, label: `${focusCountsRaw.length} market focus areas` },
                        ];

                  const kpis = [
                    {
                      label: "Total Events",
                      value: `${filteredDealTotal}`,
                      support: "current filtered view",
                      icon: "calendar" as const,
                      color: "#3b82f6",
                    },
                    {
                      label: "Structured Access",
                      value: `${dealPulse.structuredAccessEvents}`,
                      support: "approved access classifications",
                      icon: "building" as const,
                      color: "#2dd4bf",
                    },
                    {
                      label: "Deal-Making / Partnering",
                      value: `${dealPulse.dealMakingEvents}`,
                      support: "Event Character classification",
                      icon: "trend" as const,
                      color: "#f59e0b",
                    },
                    {
                      label: "Deal + Structured Access",
                      value: `${dealPulse.dealMakingWithAccess}`,
                      support: "both classifications present",
                      icon: "target" as const,
                      color: "#8b5cf6",
                    },
                    {
                      label: "Most Active Deal Week",
                      value: dealPulse.topWeek.weekStart ? formatWeekLabel(dealPulse.topWeek.weekStart) : "No classified week",
                      support: `${dealPulse.topWeek.count} classified events`,
                      icon: "flame" as const,
                      color: "#f59e0b",
                    },
                    {
                      label: "Most Active Deal City",
                      value: mostActiveDealCity?.[0] || "No classified city",
                      support: mostActiveDealCity ? `${mostActiveDealCity[1]} classified events` : "Awaiting classified records",
                      icon: "mappin" as const,
                      color: "#2dd4bf",
                    },
                    {
                      label: "Highest-Volume Investor Audience",
                      value: highestVolumeAudience?.[0] || "No audience classified",
                      support: highestVolumeAudience ? `${highestVolumeAudience[1]} events` : "Audience field not populated",
                      icon: "users" as const,
                      color: "#22c55e",
                    },
                  ];

                  return (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                          gap: "14px",
                          width: "100%",
                          background: "transparent",
                        }}
                      >
                        <div style={{ gridColumn: "1 / -1", display: "grid", gap: "12px", padding: isMobileViewport ? "16px" : "18px", borderRadius: "18px", background: "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))", border: "1px solid rgba(107,157,210,0.22)", boxShadow: "0 16px 34px rgba(0,0,0,0.16)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "minmax(0, 1fr) auto", gap: "16px", alignItems: "start" }}>
                            <div style={{ display: "grid", gap: "6px" }}>
                              <div style={{ color: "#3b82f6", fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>Market View</div>
                              <div style={{ color: "#f4f8ff", fontSize: "clamp(30px, 2.2vw, 36px)", lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.035em" }}>Deal &amp; Client Intelligence</div>
                              <div style={{ color: "#b8cce4", fontSize: "13px", lineHeight: 1.35 }}>See where deal activity, issuer access, and client audiences are concentrating.</div>
                            </div>
                            <div style={{ display: "inline-flex", maxWidth: "100%", gap: "4px", padding: "4px", borderRadius: "12px", background: "rgba(4, 18, 34, 0.72)", border: "1px solid rgba(107,157,210,0.20)", flexWrap: isMobileViewport ? "wrap" : "nowrap", justifySelf: isMobileViewport ? "stretch" : "end", height: isMobileViewport ? "auto" : "38px" }}>
                              {[
                                { key: "all" as const, label: "All Conferences" },
                                { key: "filtered" as const, label: "Current Filtered View" },
                              ].map((option) => (
                                <button key={option.key} type="button" onClick={() => setMarketViewDataset(option.key)} style={{ height: "30px", padding: "0 13px", borderRadius: "9px", border: option.key === marketViewDataset ? "1px solid rgba(125,180,255,0.22)" : "1px solid transparent", background: option.key === marketViewDataset ? "linear-gradient(180deg, #2f6ff3, #1f55d8)" : "transparent", color: option.key === marketViewDataset ? "#ffffff" : "#a8bdd8", boxShadow: option.key === marketViewDataset ? "0 0 0 1px rgba(125,180,255,0.22)" : "none", fontSize: "12px", fontWeight: 850, letterSpacing: "0.03em", cursor: "pointer" }}>
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ padding: "8px 0", borderTop: "1px solid rgba(107,157,210,0.12)", color: "#8fa8c8", fontSize: "11.5px", fontWeight: 650, lineHeight: 1.35 }}>
                            Coverage: {summaryItems.map((item) => item.label).join(" · ")}
                          </div>

                          <div style={{ color: "#8fbfff", fontSize: "10px", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" }}>Deal &amp; Client Pulse</div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : isTabletViewport ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                            <div style={{ display: "grid", gap: "8px", padding: "12px", borderRadius: "13px", background: "rgba(9,36,61,0.58)", border: "1px solid rgba(45,212,191,0.18)" }}>
                              <div style={{ color: "#5eead4", fontSize: "9px", fontWeight: 900, letterSpacing: "0.13em", textTransform: "uppercase" }}>Access &amp; Deal Activity</div>
                              {[
                                { label: "Structured Access", value: dealPulse.structuredAccessEvents, detail: `${dealAccessPercent(dealPulse.structuredAccessEvents)}% of ${filteredDealTotal} events`, color: "#2dd4bf" },
                                { label: "Deal-Making / Partnering", value: dealPulse.dealMakingEvents, detail: `${dealAccessPercent(dealPulse.dealMakingEvents)}% of ${filteredDealTotal} events`, color: "#f59e0b" },
                                { label: "Deal + Structured Access", value: dealPulse.dealMakingWithAccess, detail: "Both classifications present", color: "#a78bfa" },
                              ].map((metric, index) => (
                                <div key={metric.label} style={{ display: "grid", gap: "3px", paddingTop: index ? "8px" : 0, borderTop: index ? "1px solid rgba(107,157,210,0.12)" : "none" }}>
                                  <div style={{ color: metric.color, fontSize: "11px", fontWeight: 850 }}>{metric.label}</div>
                                  <div style={{ color: "#f4f8ff", fontSize: "21px", lineHeight: 1, fontWeight: 900 }}>{metric.value}</div>
                                  <div style={{ color: "#a8bdd8", fontSize: "11px", lineHeight: 1.25 }}>{metric.detail}</div>
                                </div>
                              ))}
                            </div>

                            <div style={{ display: "grid", gap: "8px", padding: "12px", borderRadius: "13px", background: "rgba(9,36,61,0.58)", border: "1px solid rgba(96,165,250,0.18)" }}>
                              <div style={{ color: "#93c5fd", fontSize: "9px", fontWeight: 900, letterSpacing: "0.13em", textTransform: "uppercase" }}>Where &amp; When</div>
                              <div style={{ display: "grid", gap: "3px" }}>
                                <div style={{ color: "#8fd0ff", fontSize: "11px", fontWeight: 850 }}>Most Active Deal City</div>
                                <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.05, fontWeight: 900 }}>{mostActiveDealCity?.[0] || "No classified city"}</div>
                                <div style={{ color: "#a8bdd8", fontSize: "11px", lineHeight: 1.25 }}>{mostActiveDealCity ? `${mostActiveDealCity[1]} classified events · Highest concentration of classified deal/access events` : "Awaiting classified records"}</div>
                              </div>
                              <div style={{ display: "grid", gap: "3px", paddingTop: "8px", borderTop: "1px solid rgba(107,157,210,0.12)" }}>
                                <div style={{ color: "#fbbf24", fontSize: "11px", fontWeight: 850 }}>Most Active Deal Week</div>
                                <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.05, fontWeight: 900 }}>{dealPulse.topWeek.weekStart ? formatWeekLabel(dealPulse.topWeek.weekStart) : "No classified week"}</div>
                                <div style={{ color: "#a8bdd8", fontSize: "11px", lineHeight: 1.25 }}>{dealPulse.topWeek.weekStart ? `${dealPulse.topWeek.count} classified events · Most active week for classified deal/access events` : "Awaiting classified records"}</div>
                              </div>
                            </div>

                            <div style={{ display: "grid", gap: "8px", padding: "12px", borderRadius: "13px", background: "rgba(9,36,61,0.58)", border: "1px solid rgba(34,197,94,0.18)" }}>
                              <div style={{ color: "#86efac", fontSize: "9px", fontWeight: 900, letterSpacing: "0.13em", textTransform: "uppercase" }}>Client Audience</div>
                              {highestVolumeAudience && audienceClassificationTotal ? (
                                <>
                                  <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>{highestVolumeAudience[0]}</div>
                                  <div style={{ color: "#dbeafe", fontSize: "15px", lineHeight: 1.1, fontWeight: 850 }}>{highestVolumeAudience[1]} classified audience values</div>
                                  <div style={{ color: "#a8bdd8", fontSize: "11px", lineHeight: 1.3 }}>{Math.round((highestVolumeAudience[1] / audienceClassificationTotal) * 100)}% of {audienceClassificationTotal} classified audience values</div>
                                </>
                              ) : <div style={{ color: "#8fa8c8", fontSize: "12px", lineHeight: 1.4 }}>Audience classification coverage unavailable for this view.</div>}
                            </div>
                          </div>

                          <div style={{ borderRadius: "10px", padding: "9px 12px", background: "rgba(37,99,235,0.12)", border: "1px solid rgba(96,165,250,0.18)", color: "#cbe1fb", fontSize: "12.5px", lineHeight: 1.4 }}>
                            {mostActiveDealCity && dealPulse.topWeek.weekStart
                              ? `${classifiedDealAccessTotal} events in this view carry structured-access or deal-making classifications. ${mostActiveDealCity[0]} has the largest concentration with ${mostActiveDealCity[1]} events, while ${formatWeekLabel(dealPulse.topWeek.weekStart)} is the most active week with ${dealPulse.topWeek.count}.`
                              : "Structured-access and deal-making classifications are shown when structured data is available in the current view."}
                          </div>
                        </div>

                        <div style={{ ...planningCardBase, gridColumn: "1 / -1", display: "grid", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Market Intelligence Signals</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Actionable takeaways from the current market view.</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (peakWeek.weekStart) {
                                  applyAnalysisView({
                                    type: "week",
                                    from: peakWeek.weekStart,
                                    to: addDaysISO(peakWeek.weekStart, 6),
                                  });
                                }
                              }}
                              style={ctaStyle}
                            >
                              View All Signals →
                            </button>
                          </div>
                          <div style={{ display: "grid", gap: "12px" }}>
                            {signalRows.map((signal, index) => (
                              <div key={signal.title} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "12px", alignItems: "start", padding: index === 0 ? "0 0 12px" : "10px 0 12px", borderBottom: index === signalRows.length - 1 ? "none" : "1px solid rgba(107,157,210,0.12)" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "11px", display: "grid", placeItems: "center", background: `${signal.color}14` }}>
                                  <MarketViewIcon kind={signal.icon} color={signal.color} />
                                </div>
                                <div style={{ display: "grid", gap: "8px" }}>
                                  <div style={{ color: "#f4f8ff", fontSize: "14px", lineHeight: 1.2, fontWeight: 850 }}>{signal.title}</div>
                                  <div style={{ color: "#b8cce4", fontSize: "12.5px", lineHeight: 1.4 }}>{signal.text}</div>
                                  {signal.action ? (
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => applyAnalysisView(signal.action as AnalysisAction)}
                                        style={{
                                          ...ctaStyle,
                                          height: "26px",
                                          padding: "0 10px",
                                          borderRadius: "8px",
                                          fontSize: "10.5px",
                                        }}
                                      >
                                        View Dataset
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ ...planningCardBase, gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                            <div>
                            <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Upcoming Hot Weeks</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Prepare for high-activity conference windows ahead.</div>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: hotWeekColumns, gap: "12px" }}>
                            {(sortedFutureWeeks.length ? sortedFutureWeeks : sortedTimeline).slice(0, 3).map((week, index) => {
                              const weekInsight = weekInsights.get(week.weekStart);
                              const bestCities = weekInsight?.topCities?.length ? weekInsight.topCities.join(" · ") : weekInsight?.topCity || "N/A";
                              const audienceOrFocus = [weekInsight?.topAudience, weekInsight?.topFocus, weekInsight?.topIssuerParticipation].filter(Boolean).slice(0, 3).join(" · ") || "Market activity";
                              return (
                                <div key={week.weekStart} style={{ height: "220px", background: "linear-gradient(180deg, rgba(9,36,61,0.74), rgba(7,28,49,0.88))", borderRadius: "15px", padding: "15px", display: "grid", gap: "8px", alignContent: "start", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                                  <div style={{ color: index < 2 ? "#f59e0b" : "#c084fc", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{index < 2 ? "Hot Week" : "Upcoming"}</div>
                                  <div style={{ color: "#f4f8ff", fontSize: "19px", fontWeight: 900 }}>{formatWeekLabel(week.weekStart)}</div>
                                  <div style={{ color: "#b8cce4", fontSize: "13px" }}>{week.count} conferences</div>
                                  <div style={{ color: "#b8cce4", fontSize: "12px" }}>Top Cities: {bestCities}</div>
                                  <div style={{ color: "#8fd0ff", fontSize: "12px", fontWeight: 700 }}>{audienceOrFocus}</div>
                                  <div style={{ color: "#a9bdd6", fontSize: "11.5px", lineHeight: 1.35 }}>{weekInsight?.actionLine || "Use this week to plan outreach, travel, and meeting density."}</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: "3px", alignItems: "end", minHeight: "42px" }}>
                                    {Array.from({ length: 8 }).map((_, barIndex) => (
                                      <div key={barIndex} style={{ height: `${8 + Math.round((week.count / Math.max(1, peakWeek.count || 1)) * (barIndex % 2 === 0 ? 22 : 16))}px`, borderRadius: "999px", background: index < 2 ? "linear-gradient(180deg, #f59e0b, #ef4444)" : "linear-gradient(180deg, #8b5cf6, #3b82f6)" }} />
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      applyAnalysisView({
                                        type: "week",
                                        from: week.weekStart,
                                        to: addDaysISO(week.weekStart, 6),
                                      })
                                    }
                                    style={ctaStyle}
                                  >
                                    View Week →
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Hot Weeks / Activity Timeline</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Conference volume by week.</div>
                            </div>
                            <div style={{ display: "inline-flex", gap: "4px", padding: "4px", borderRadius: "12px", background: "rgba(5,20,36,0.72)", border: "1px solid rgba(107,157,210,0.22)" }}>
                              {[
                                { key: "8w" as const, label: "Next 8 Weeks" },
                                { key: "30d" as const, label: "Next 30 Days" },
                                { key: "90d" as const, label: "Next 90 Days" },
                              ].map((option) => (
                                <button
                                  key={option.key}
                                  type="button"
                                  onClick={() => setMarketViewRange(option.key)}
                                  style={{
                                    height: "30px",
                                    padding: "0 12px",
                                    borderRadius: "9px",
                                    border: option.key === marketViewRange ? "1px solid rgba(83,160,255,0.58)" : "1px solid transparent",
                                    background: option.key === marketViewRange ? "rgba(37,99,235,0.28)" : "transparent",
                                    color: option.key === marketViewRange ? "#ffffff" : "#a8bdd8",
                                    fontSize: "12px",
                                    fontWeight: 850,
                                    cursor: "pointer",
                                  }}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(timelineSource.length, 1)}, minmax(0, 1fr))`, alignItems: "end", gap: "8px", minHeight: "138px" }}>
                            {timelineSource.map((week) => {
                              const isPeak = peakWeek.weekStart === week.weekStart;
                              const isElevated = week.count >= Math.max(8, Math.round(timelinePeak * 0.85));
                              const barColor = isPeak ? "linear-gradient(180deg, #ef4444, #f59e0b)" : isElevated ? "linear-gradient(180deg, #60a5fa, #3b82f6)" : "linear-gradient(180deg, #2563eb, #1d4ed8)";
                              return (
                                <div key={week.weekStart} style={{ display: "grid", gap: "8px", alignItems: "end" }}>
                                  <div style={{ color: isPeak ? "#fbbf24" : "#dbeafe", fontSize: "13px", fontWeight: 900, textAlign: "center", minHeight: "18px" }}>{isPeak ? String(week.count) : ""}</div>
                                  <div style={{ height: `${Math.max(16, Math.round((week.count / timelinePeak) * 82))}px`, borderRadius: "10px 10px 4px 4px", background: barColor, boxShadow: isPeak ? "0 0 24px rgba(245,158,11,0.25)" : "none" }} />
                                  <div style={{ color: "#9fc0df", fontSize: "10px", lineHeight: 1.15, textAlign: "center" }}>{formatWeekLabel(week.weekStart)}</div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginTop: "12px" }}>
                            {[
                              {
                                label: "Peak Week",
                                title: peakWeek.weekStart ? formatWeekLabel(peakWeek.weekStart) : "N/A",
                                body: `${peakWeek.count} conferences${peakWeek.weekStart ? ` · ${weekInsights.get(peakWeek.weekStart)?.typeLabel || "Active week"}` : ""}`,
                              },
                              {
                                label: "Next Highest",
                                title: nextHighestWeek.weekStart ? formatWeekLabel(nextHighestWeek.weekStart) : "N/A",
                                body: `${nextHighestWeek.count} conferences${nextHighestWeek.weekStart ? ` · ${weekInsights.get(nextHighestWeek.weekStart)?.typeLabel || "Active week"}` : ""}`,
                              },
                              {
                                label: "Upcoming High",
                                title: upcomingHighWeek.weekStart ? formatWeekLabel(upcomingHighWeek.weekStart) : "N/A",
                                body: `${upcomingHighWeek.count} conferences${upcomingHighWeek.weekStart ? ` · ${weekInsights.get(upcomingHighWeek.weekStart)?.typeLabel || "Active week"}` : ""}`,
                              },
                              { label: "Avg / Week", title: avgPerWeek, body: "conferences" },
                            ].map((item) => (
                              <div key={item.label} style={{ background: "rgba(9,36,61,0.62)", borderRadius: "13px", padding: "12px 13px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                                <div style={{ color: "#7f99b8", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.label}</div>
                                <div style={{ color: "#f4f8ff", fontSize: "18px", fontWeight: 900, marginTop: "6px" }}>{item.title}</div>
                                <div style={{ color: "#b8cce4", fontSize: "12px", marginTop: "4px" }}>{item.body}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: "12px", borderRadius: "12px", padding: "12px 14px", background: "rgba(9,36,61,0.62)", border: "1px solid rgba(107,157,210,0.14)", color: "#cbe1fb", fontSize: "13px", lineHeight: 1.4 }}>
                            Plan ahead: target high-density conference weeks for outreach, meetings, sponsorship, and visibility.
                          </div>
                        </div>

                        <div style={{ ...planningCardBase, gridColumn: "1 / -1", gridRow: "2", display: "grid", gap: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Where Are the Deals?</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Locations and weeks with structured deal-making or company-access classifications.</div>
                            </div>
                            <button type="button" onClick={() => {
                              const week = marketAnalytics.dealClientPulse.topWeek;
                              if (week.weekStart) applyAnalysisView({ type: "week", from: week.weekStart, to: addDaysISO(week.weekStart, 6) });
                            }} style={ctaStyle}>View Dataset →</button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: opportunityColumns, gap: "12px" }}>
                            <div style={{ background: "rgba(45,212,191,0.08)", borderRadius: "15px", padding: "16px", display: "grid", gap: "12px" }}>
                              <div>
                                <div style={{ color: "#f4f8ff", fontSize: "17px", lineHeight: 1.15, fontWeight: 900 }}>Deal Activity by Access Type</div>
                                <div style={{ color: "#b8cce4", fontSize: "12px", lineHeight: 1.35, marginTop: "4px" }}>Exact classifications in the current filtered view.</div>
                              </div>
                              {dealPulse.accessBreakdown.map((item) => {
                                const percentage = Math.round((item.count / Math.max(1, filteredDealTotal)) * 100);
                                const max = Math.max(...dealPulse.accessBreakdown.map((row) => row.count), 1);
                                return (
                                  <div key={item.label} style={{ display: "grid", gap: "6px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", alignItems: "baseline" }}>
                                      <div style={{ color: "#dbeafe", fontSize: "12.5px", fontWeight: 800 }}>{item.label}</div>
                                      <div style={{ color: "#b8cce4", fontSize: "12px", whiteSpace: "nowrap" }}>{item.count} · {percentage}%</div>
                                    </div>
                                    <div style={{ height: "7px", borderRadius: "999px", background: "rgba(11,42,70,0.82)" }}>
	                                      <div style={{ width: `${Math.max(item.count ? 8 : 0, Math.round((item.count / max) * 100))}%`, height: "100%", borderRadius: "999px", background: item.label === "Partnering / Deal-Making" ? "#f59e0b" : item.label === "No Corporate Access Signal" ? "#64748b" : "linear-gradient(90deg, #2dd4bf, #60a5fa)" }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ background: "rgba(139,92,246,0.08)", borderRadius: "15px", padding: "16px", display: "grid", gap: "10px", alignContent: "start" }}>
                              <div>
                                <div style={{ color: "#f4f8ff", fontSize: "17px", lineHeight: 1.15, fontWeight: 900 }}>High-Volume Deal &amp; Access Events</div>
                                <div style={{ color: "#b8cce4", fontSize: "12px", lineHeight: 1.35, marginTop: "4px" }}>Selected only from the listed deal-making and structured-access classifications.</div>
                              </div>
                              {dealPulse.examples.length ? dealPulse.examples.map((event) => (
                                <button key={event.id} type="button" onClick={() => applyAnalysisView({ type: "week", from: event.startDate, to: event.endDate || event.startDate })} style={{ border: "1px solid rgba(147,197,253,0.14)", borderRadius: "10px", background: "rgba(5,20,36,0.32)", padding: "10px", textAlign: "left", cursor: "pointer", display: "grid", gap: "4px" }}>
                                  <div style={{ color: "#f4f8ff", fontSize: "13px", lineHeight: 1.25, fontWeight: 850 }}>{event.title}</div>
                                  <div style={{ color: "#93c5fd", fontSize: "12px", fontWeight: 750 }}>{formatPreviewDate(event.startDate)} · {[event.city, event.state].filter(Boolean).join(", ") || "Location not classified"}</div>
                                  {event.organizer ? <div style={{ color: "#b8cce4", fontSize: "11.5px" }}>{event.organizer}</div> : null}
                                  <div style={{ color: "#cbe1fb", fontSize: "11.5px", lineHeight: 1.35 }}>{[event.issuerParticipation, event.eventCharacter, event.audience, event.marketFocus || event.sectorThemes].filter(Boolean).join(" · ")}</div>
                                </button>
                              )) : <div style={{ color: "#b8cce4", fontSize: "13px" }}>No events match the approved structured classifications in this view.</div>}
                            </div>
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan, minHeight: "420px", display: "grid", alignContent: "start" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>City Cluster Analytics</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Where conference activity is clustering most.</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (topCityCount?.[0]) {
                                  applyAnalysisView({ type: "city", value: topCityCount[0] });
                                }
                              }}
                              style={ctaStyle}
                            >
                              View All Cities →
                            </button>
                          </div>
                          <div style={{ display: "grid", gap: "10px" }}>
                            {mv.cityCounts.slice(0, 8).map(([city, count], index) => {
                              const maxCity = mv.cityCounts[0]?.[1] || 1;
                              return (
                                <div key={city} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                                  <div style={{ color: "#7f99b8", fontSize: "12px", fontWeight: 900 }}>{index + 1}.</div>
                                  <div style={{ display: "grid", gap: "6px", minWidth: 0 }}>
                                    <div title={city} style={{ color: "#f4f8ff", fontSize: "13px", lineHeight: 1.25, fontWeight: 800, whiteSpace: "normal", overflowWrap: "anywhere" }}>{city}</div>
                                    <div style={{ height: "8px", borderRadius: "999px", background: "rgba(11,42,70,0.82)" }}>
                                      <div style={{ width: `${Math.max(10, Math.round((count / maxCity) * 100))}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #2dd4bf, #60a5fa)" }} />
                                    </div>
                                  </div>
                                  <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 850 }}>{count}</div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ marginTop: "14px", borderRadius: "14px", padding: "14px", background: "rgba(45,212,191,0.08)", color: "#cbe7f6", fontSize: "13px", lineHeight: 1.45 }}>
                            {mv.cityCounts[0]
                              ? `${mv.cityCounts[0][0]} leads the current view with ${mv.cityCounts[0][1]} conferences${
                                  mv.cityCounts[1] ? `, more than ${Math.max(1, Math.round(mv.cityCounts[0][1] / Math.max(1, mv.cityCounts[1][1])))}x ${mv.cityCounts[1][0]}.` : "."
                                }`
                              : "Not enough filtered data to calculate this signal."}
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                            <div>
	                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Investment Focus / Industry Intelligence</div>
	                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Which investment and industry themes dominate the current view.</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (topMarketFocus?.[0]) {
                                  applyAnalysisView({ type: "marketFocus", value: topMarketFocus[0] });
                                }
                              }}
                              style={ctaStyle}
                            >
	                              View All Investment Focuses →
                            </button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: donutColumns, gap: "18px", alignItems: "center" }}>
                            <div style={{ width: "220px", height: "220px", margin: "0 auto", borderRadius: "50%", background: `conic-gradient(
                              #22c55e 0 ${Math.round(((focusCounts[0]?.[1] || 0) / focusTotal) * 360)}deg,
                              #06b6d4 ${Math.round(((focusCounts[0]?.[1] || 0) / focusTotal) * 360)}deg ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0)) / focusTotal) * 360)}deg,
                              #3b82f6 ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0)) / focusTotal) * 360)}deg ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0)) / focusTotal) * 360)}deg,
                              #f59e0b ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0)) / focusTotal) * 360)}deg ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0) + (focusCounts[3]?.[1] || 0)) / focusTotal) * 360)}deg,
                              #8b5cf6 ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0) + (focusCounts[3]?.[1] || 0)) / focusTotal) * 360)}deg ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0) + (focusCounts[3]?.[1] || 0) + (focusCounts[4]?.[1] || 0)) / focusTotal) * 360)}deg,
                              #ef4444 ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0) + (focusCounts[3]?.[1] || 0) + (focusCounts[4]?.[1] || 0)) / focusTotal) * 360)}deg ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0) + (focusCounts[3]?.[1] || 0) + (focusCounts[4]?.[1] || 0) + (focusCounts[5]?.[1] || 0)) / focusTotal) * 360)}deg,
                              #64748b ${Math.round((((focusCounts[0]?.[1] || 0) + (focusCounts[1]?.[1] || 0) + (focusCounts[2]?.[1] || 0) + (focusCounts[3]?.[1] || 0) + (focusCounts[4]?.[1] || 0) + (focusCounts[5]?.[1] || 0)) / focusTotal) * 360)}deg 360deg
                            )`, position: "relative" }}>
                              <div style={{ position: "absolute", inset: "28px", borderRadius: "50%", background: "#061c33", display: "grid", placeItems: "center", textAlign: "center" }}>
                                <div>
                                  <div style={{ color: "#7f99b8", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Total</div>
                                  <div style={{ color: "#f4f8ff", fontSize: "30px", fontWeight: 900, marginTop: "6px" }}>{mv.total}</div>
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "grid", gap: "10px" }}>
                              {focusCounts.map(([label, count], index) => {
                                const colors = ["#22c55e", "#06b6d4", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];
                                return (
                                  <div key={label} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: colors[index] }} />
                                    <div title={label} style={{ color: "#f4f8ff", fontSize: "13px", lineHeight: 1.25, fontWeight: 800, whiteSpace: "normal", overflowWrap: "anywhere" }}>{label}</div>
                                    <div style={{ color: "#b8cce4", fontSize: "12px", fontWeight: 800 }}>{count} / {Math.round((count / focusTotal) * 100)}%</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
                            {focusIntelligenceRows.slice(0, 3).map((row) => (
                              <div key={row.label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", padding: "12px 14px", borderRadius: "14px", background: "rgba(9,36,61,0.62)" }}>
                                <div style={{ display: "grid", gap: "4px" }}>
                                  <div style={{ color: "#f4f8ff", fontSize: "13px", fontWeight: 850 }}>{row.label}</div>
                                  <div style={{ color: "#b8cce4", fontSize: "12px", lineHeight: 1.4 }}>
                                    {row.count} events · {row.share}% · Top cities: {row.topCity} · Peak week: {row.peakWeek}
                                  </div>
                                </div>
                                <div style={{ color: "#8fbfff", fontSize: "12px", fontWeight: 800, whiteSpace: "nowrap" }}>
                                  {row.issuerAccessCount} issuer-access
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan, display: "grid", gap: "14px", minHeight: "360px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Sector Opportunity Windows</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Identify where sector activity, issuer access, and investor attention are concentrating.</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (sectorWindows[0]?.sector) {
                                  applyAnalysisView({ type: "sectorTheme", value: sectorWindows[0].sector });
                                }
                              }}
                              style={ctaStyle}
                            >
                              View Sector Windows →
                            </button>
                          </div>
                          {sectorWindows.length ? (
                            <div style={{ display: "grid", gap: "10px" }}>
                              {sectorWindows.map((row, index) => {
                                const maxCount = sectorWindows[0]?.count || 1;
                                return (
                                  <div key={row.sector} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "10px", alignItems: "start" }}>
                                    <div style={{ color: "#7f99b8", fontSize: "12px", fontWeight: 900 }}>{index + 1}.</div>
                                    <div style={{ display: "grid", gap: "6px", minWidth: 0 }}>
                                      <div title={row.sector} style={{ color: "#f4f8ff", fontSize: "13px", lineHeight: 1.25, fontWeight: 800, whiteSpace: "normal", overflowWrap: "anywhere" }}>{row.sector}</div>
                                      <div style={{ color: "#b8cce4", fontSize: "12px", lineHeight: 1.35 }}>
                                        {row.count} events · {row.issuerAccessCount} issuer-access · {row.investorHeavyCount} investor-heavy
                                      </div>
                                      <div style={{ color: "#8fbfff", fontSize: "11px", lineHeight: 1.35 }}>
                                        Top cities: {(row.topCities?.join(" · ") || row.topCity)} · Peak week: {row.peakWeek.weekStart ? formatWeekLabel(row.peakWeek.weekStart) : "N/A"}
                                      </div>
                                      <div style={{ height: "8px", borderRadius: "999px", background: "rgba(11,42,70,0.82)" }}>
                                        <div style={{ width: `${Math.max(10, Math.round((row.count / maxCount) * 100))}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #8b5cf6, #f59e0b)" }} />
                                      </div>
                                    </div>
                                    <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 850 }}>{row.count}</div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ color: "#b8cce4", fontSize: "13px", lineHeight: 1.45 }}>Not enough filtered data to isolate sector opportunity windows yet.</div>
                          )}
                          <div style={{ marginTop: "2px", borderRadius: "14px", padding: "14px", background: "rgba(9,36,61,0.62)", border: "1px solid rgba(107,157,210,0.14)", color: "#cbe7f6", fontSize: "13px", lineHeight: 1.45 }}>
                            {sectorWindows[0]
                              ? `${sectorWindows[0].sector} is the strongest sector window right now, with concentration building around ${sectorWindows[0].topCity} and a peak around ${sectorWindows[0].peakWeek.weekStart ? formatWeekLabel(sectorWindows[0].peakWeek.weekStart) : "this window"}.`
                              : "Sector opportunity intelligence will appear as sector coverage expands."}
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan, display: "grid", gap: "14px", minHeight: "360px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Event Character Mix</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Understand the style of conference activity in the current view.</div>
                            </div>
                            <div style={{ color: "#7f99b8", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Coverage {eventCharacterCoverageShare}%</div>
                          </div>
                          {eventCharacterCounts.length ? (
                            <>
                              <div style={{ display: "grid", gap: "10px" }}>
                                {eventCharacterCounts.slice(0, 5).map(([label, count], index) => {
                                  const maxCount = eventCharacterCounts[0]?.[1] || 1;
                                  return (
                                    <div key={label} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                                      <div style={{ color: "#7f99b8", fontSize: "12px", fontWeight: 900 }}>{index + 1}.</div>
                                      <div style={{ display: "grid", gap: "6px", minWidth: 0 }}>
                                        <div title={label} style={{ color: "#f4f8ff", fontSize: "13px", lineHeight: 1.25, fontWeight: 800, whiteSpace: "normal", overflowWrap: "anywhere" }}>{label}</div>
                                        <div style={{ height: "8px", borderRadius: "999px", background: "rgba(11,42,70,0.82)" }}>
                                          <div style={{ width: `${Math.max(10, Math.round((count / maxCount) * 100))}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #6366f1, #3b82f6)" }} />
                                        </div>
                                      </div>
                                      <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 850 }}>{count} · {Math.round((count / Math.max(1, sourceTotal)) * 100)}%</div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ borderRadius: "14px", padding: "14px", background: "rgba(9,36,61,0.62)", border: "1px solid rgba(107,157,210,0.14)", color: "#cbe7f6", fontSize: "13px", lineHeight: 1.45 }}>
                                {topEventCharacter
                                  ? `This view is mostly ${topEventCharacter[0].toLowerCase()} activity, which helps frame whether the current market is more presentation-led, networking-driven, or theme-led.`
                                  : "Event-character coverage is still building out."}
                              </div>
                            </>
                          ) : (
                            <div style={{ color: "#b8cce4", fontSize: "13px", lineHeight: 1.45 }}>
                              Event-character data is still too limited to show a reliable mix in this view.
                            </div>
                          )}
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan, display: "grid", gap: "14px", minHeight: "360px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Format & Data Readiness</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>How events are structured and how complete the classification is.</div>
                            </div>
                            <div style={{ color: "#7f99b8", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Coverage {coverageAverage}%</div>
                          </div>
                          <div style={{ display: "grid", gap: "10px" }}>
                            {formatCounts.length ? (
                              formatCounts.map(([label, count]) => {
                                const maxCount = formatCounts[0]?.[1] || 1;
                                return (
                                  <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                                    <div style={{ display: "grid", gap: "6px" }}>
                                      <div title={label} style={{ color: "#f4f8ff", fontSize: "13px", lineHeight: 1.25, fontWeight: 800, whiteSpace: "normal", overflowWrap: "anywhere" }}>{label}</div>
                                      <div style={{ height: "8px", borderRadius: "999px", background: "rgba(11,42,70,0.82)" }}>
                                        <div style={{ width: `${Math.max(10, Math.round((count / maxCount) * 100))}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #14b8a6, #2dd4bf)" }} />
                                      </div>
                                    </div>
                                    <div style={{ color: "#dbeafe", fontSize: "13px", fontWeight: 850 }}>{count}</div>
                                  </div>
                                );
                              })
                            ) : (
                              <div style={{ color: "#b8cce4", fontSize: "13px", lineHeight: 1.45 }}>Format tags are still filling in across the current view.</div>
                            )}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "2px" }}>
                            <div style={{ borderRadius: "14px", padding: "14px", background: "rgba(9,36,61,0.62)", border: "1px solid rgba(107,157,210,0.14)", display: "grid", gap: "6px" }}>
                              <div style={{ color: "#5eead4", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>User-facing structure</div>
                              <div style={{ color: "#f4f8ff", fontSize: "15px", fontWeight: 850 }}>
                                {topFormat?.[0] ? `${topFormat[0]} is the dominant format in this view.` : "Format data is still sparse."}
                              </div>
                              <div style={{ color: "#b8cce4", fontSize: "12px", lineHeight: 1.45 }}>
                                {marketAnalytics.venueCount} venues listed · {marketAnalytics.eventLinkCount} live event links · {marketAnalytics.formatTaggedCount} format-tagged records
                              </div>
                            </div>
                            <div style={{ borderRadius: "14px", padding: "14px", background: "rgba(9,36,61,0.62)", border: "1px solid rgba(107,157,210,0.14)", display: "grid", gap: "6px" }}>
                              <div style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Readiness snapshot</div>
                              <div style={{ color: "#f4f8ff", fontSize: "15px", fontWeight: 850 }}>
                                {websiteApprovedCount} website-approved · {verifiedCount} verified or reviewed
                              </div>
                              <div style={{ color: "#b8cce4", fontSize: "12px", lineHeight: 1.45 }}>
                                {verificationStatusCounts[0]?.[0]
                                  ? `Most common review state: ${verificationStatusCounts[0][0]}.`
                                  : "Verification status coverage is still building out."}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "4px" }}>
                            {coverageMetrics.map((item) => {
                              const percentage = Math.round((item.count / Math.max(1, sourceTotal)) * 100);
                              return (
                                <div key={item.label} style={{ background: "rgba(9,36,61,0.62)", borderRadius: "14px", padding: "12px 13px", display: "grid", gap: "6px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                                  <div style={{ color: "#7f99b8", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.label}</div>
                                  <div style={{ color: "#f4f8ff", fontSize: "18px", fontWeight: 900 }}>{percentage}%</div>
                                  <div style={{ color: "#b8cce4", fontSize: "12px" }}>{item.count} of {sourceTotal}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan, display: "grid", gap: "12px", minHeight: "360px" }}>
                          <div>
                            <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Audience & Issuer Access Intelligence</div>
                            <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Understand who the market is serving and where real issuer access exists.</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: metricColumns, gap: "10px" }}>
                            {[
                              { label: "Issuer Access Events", value: issuerAccessCount, detail: `${Math.round((issuerAccessCount / Math.max(1, sourceTotal)) * 100)}% of current view` },
                              { label: "Investor-heavy Events", value: institutionalCount, detail: `${institutionalWindow.bestWeek.count} in best investor window` },
	                              { label: "No Corporate Access Signal", value: noIssuerCount, detail: `${Math.round((noIssuerCount / Math.max(1, sourceTotal)) * 100)}% without access signal` },
                            ].map((item) => (
                              <div key={item.label} style={{ height: "96px", background: "rgba(9,36,61,0.62)", borderRadius: "14px", padding: "14px", display: "grid", alignContent: "space-between", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                                <div style={{ color: "#7f99b8", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.label}</div>
                                <div style={{ color: "#f4f8ff", fontSize: "22px", fontWeight: 900 }}>{item.value}</div>
                                <div style={{ color: "#b8cce4", fontSize: "12px" }}>{item.detail}</div>
                              </div>
                            ))}
                          </div>
                          <div>
	                            <div style={{ color: "#dbeafe", fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>Corporate Access vs. Audience Balance</div>
                            <div style={{ display: "flex", height: "18px", borderRadius: "999px", overflow: "hidden", background: "rgba(11,42,70,0.82)" }}>
                              {participationBuckets.map((bucket) => (
                                <div key={bucket.label} style={{ width: `${(bucket.count / participationTotal) * 100}%`, background: bucket.color }} />
                              ))}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: metricColumns, gap: "10px", marginTop: "18px" }}>
                              {participationBuckets.map((bucket) => (
                                <div key={bucket.label} style={{ display: "grid", gap: "4px" }}>
                                  <div style={{ color: bucket.color, fontSize: "12px", fontWeight: 900 }}>{bucket.label}</div>
                                  <div style={{ color: "#f4f8ff", fontSize: "18px", fontWeight: 900 }}>{Math.round((bucket.count / participationTotal) * 100)}%</div>
                                  <div style={{ color: "#b8cce4", fontSize: "12px" }}>{bucket.count} conferences</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "grid", gap: "10px" }}>
	                            <div style={{ color: "#dbeafe", fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Top Company Participant Labels</div>
                            <div style={{ display: "grid", gap: "8px" }}>
                              {participationTrendCounts.slice(0, 4).map(([label, count]) => (
                                <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                                  <div title={label} style={{ color: "#f4f8ff", fontSize: "13px", fontWeight: 800, whiteSpace: "normal", overflowWrap: "anywhere" }}>{label}</div>
                                  <div style={{ color: "#b8cce4", fontSize: "12px", fontWeight: 800 }}>{count}</div>
                                </div>
                              ))}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (topParticipationTrend?.[0]) {
                                    applyAnalysisView({ type: "issuerParticipation", value: topParticipationTrend[0] });
                                  } else if (institutionalWindow.bestWeek.weekStart) {
                                    applyAnalysisView({
                                      type: "week",
                                      from: institutionalWindow.bestWeek.weekStart,
                                      to: addDaysISO(institutionalWindow.bestWeek.weekStart, 6),
                                    });
                                  }
                                }}
                                style={ctaStyle}
                              >
                                View Audience Signals →
                              </button>
                            </div>
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan, display: "grid", gap: "14px", minHeight: "360px" }}>
                          <div>
                            <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Organizer Activity</div>
                            <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Which organizers are driving conference volume.</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                            {[
                              {
                                label: "Top organizer overall",
                                value: topOrganizer?.[0] || "Insufficient data",
                                detail: topOrganizer ? `${topOrganizer[1]} events in this view` : "Awaiting organizer data",
                                tone: "#93c5fd",
                              },
                              {
                                label: "Geographic spread leader",
                                value: mostGeographicOrganizer?.[0] || "Insufficient data",
                                detail: mostGeographicOrganizer ? `${mostGeographicOrganizer[1]} active cities` : "Awaiting city spread data",
                                tone: "#5eead4",
                              },
                              {
                                label: "Investor-heavy lead",
                                value: organizerInvestorHeavy?.[0] || "Insufficient data",
                                detail: organizerInvestorHeavy ? "Most active across investor-heavy events" : "Investor-heavy organizer concentration is still building out.",
                                tone: "#a5b4fc",
                              },
                              {
                                label: "Issuer-access lead",
                                value: organizerIssuerAccess?.[0] || "Insufficient data",
                                detail: organizerIssuerAccess ? "Most active across issuer-access events" : "Issuer-access organizer concentration is still building out.",
                                tone: "#c4b5fd",
                              },
                            ].map((item) => (
                              <div key={item.label} style={{ borderRadius: "14px", padding: "12px 14px", background: "rgba(9,36,61,0.62)", display: "grid", gap: "5px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                                <div style={{ color: item.tone, fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.label}</div>
                                <div title={item.value} style={{ color: "#f4f8ff", fontSize: "15px", lineHeight: 1.25, fontWeight: 850, whiteSpace: "normal", overflowWrap: "anywhere" }}>{item.value}</div>
                                <div style={{ color: "#b8cce4", fontSize: "12px", lineHeight: 1.4 }}>{item.detail}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "grid", gap: "10px" }}>
                            {mv.organizerCounts.slice(0, 6).map(([org, count]) => {
                              const maxOrganizer = mv.organizerCounts[0]?.[1] || 1;
                              return (
                                <div key={org} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                                  <div style={{ display: "grid", gap: "6px" }}>
                                    <div title={org} style={{ color: "#f4f8ff", fontSize: "13px", lineHeight: 1.25, fontWeight: 800, whiteSpace: "normal", overflowWrap: "anywhere" }}>{org}</div>
                                    <div style={{ height: "8px", borderRadius: "999px", background: "rgba(11,42,70,0.82)" }}>
                                      <div style={{ width: `${Math.max(10, Math.round((count / maxOrganizer) * 100))}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #818cf8, #60a5fa)" }} />
                                    </div>
                                  </div>
                                  <div style={{ color: "#b8cce4", fontSize: "12px", fontWeight: 800 }}>{Math.round((count / Math.max(1, mv.total)) * 100)}%</div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                            <div style={{ borderRadius: "14px", padding: "12px 14px", background: "rgba(129,140,248,0.08)", color: "#cbe7f6", fontSize: "12px", lineHeight: 1.45 }}>
                              <div style={{ color: "#a5b4fc", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>Investor-heavy lead</div>
                              {organizerInvestorHeavy ? `${organizerInvestorHeavy[0]} appears most often in investor-heavy activity.` : "Investor-heavy organizer concentration is still building out."}
                            </div>
                            <div style={{ borderRadius: "14px", padding: "12px 14px", background: "rgba(139,92,246,0.08)", color: "#cbe7f6", fontSize: "12px", lineHeight: 1.45 }}>
                              <div style={{ color: "#c4b5fd", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>Issuer-access lead</div>
                              {organizerIssuerAccess ? `${organizerIssuerAccess[0]} shows the most issuer-access events in this view.` : "Issuer-access organizer concentration is still building out."}
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                if (topOrganizer?.[0]) {
                                  applyAnalysisView({ type: "organizer", value: topOrganizer[0] });
                                }
                              }}
                              style={ctaStyle}
                            >
                              View Full Rankings →
                            </button>
                          </div>
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan, display: "grid", gap: "14px", minHeight: "360px" }}>
                          <div>
                            <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Deal &amp; Client Pulse</div>
                            <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Structured deal-making and company-access classifications in the current view.</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: metricColumns, gap: "10px" }}>
                            {[
	                              { label: "Partnering / Deal-Making", value: dealPulse.dealMakingEvents, detail: "Event Features classification" },
	                              { label: "Structured Access", value: dealPulse.structuredAccessEvents, detail: "Event Features labels" },
                              { label: "Deal + Access", value: dealPulse.dealMakingWithAccess, detail: "both classifications present" },
	                              ...dealPulse.accessBreakdown.map((item) => ({ label: item.label, value: item.count, detail: "Event Features" })),
                            ].map((item) => (
                              <div key={item.label} style={{ background: "rgba(9,36,61,0.62)", borderRadius: "14px", padding: "14px", display: "grid", gap: "6px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                                <div style={{ color: "#7f99b8", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.label}</div>
                                <div style={{ color: "#f4f8ff", fontSize: "18px", fontWeight: 900 }}>{item.value}</div>
                                <div style={{ color: "#b8cce4", fontSize: "12px" }}>{item.detail}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ borderRadius: "14px", padding: "14px", background: "rgba(45,212,191,0.08)", color: "#cbe7f6", fontSize: "13px", lineHeight: 1.45 }}>
                            {dealPulse.topWeek.weekStart
                              ? `${dealPulse.topWeek.count} classified deal or access events fall in ${formatWeekLabel(dealPulse.topWeek.weekStart)}.`
                              : "No structured deal-making or approved access classifications are available in this view yet."}
                          </div>
                          {dealPulse.examples.length ? (
                            <div style={{ display: "grid", gap: "8px" }}>
                              <div style={{ color: "#8fbfff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Example classified events</div>
                              {dealPulse.examples.map((event) => (
                                <button key={event.id} type="button" onClick={() => applyAnalysisView({ type: "week", from: event.startDate, to: event.endDate || event.startDate })} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", alignItems: "center", border: 0, borderRadius: "10px", padding: "9px 10px", background: "rgba(9,36,61,0.62)", textAlign: "left", cursor: "pointer" }}>
                                  <span style={{ minWidth: 0, display: "grid", gap: "3px" }}><span style={{ color: "#f4f8ff", fontSize: "13px", fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span><span style={{ color: "#b8cce4", fontSize: "12px" }}>{[event.city, event.state].filter(Boolean).join(", ")} · {event.issuerParticipation || event.eventCharacter}</span></span>
                                  <span style={{ color: "#93c5fd", fontSize: "12px", fontWeight: 850 }}>View Dataset →</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div style={{ ...cardBase, gridColumn: splitSpan }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                            <div>
                              <div style={{ color: "#f4f8ff", fontSize: "20px", lineHeight: 1.1, fontWeight: 900 }}>Geographic Concentration</div>
                              <div style={{ color: "#b8cce4", fontSize: "14px", lineHeight: 1.35 }}>Conference density by city.</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (topCityCount?.[0]) {
                                  applyAnalysisView({ type: "city", value: topCityCount[0] });
                                }
                              }}
                              style={ctaStyle}
                            >
                              View Full Map →
                            </button>
                          </div>
                          <div style={{ position: "relative", height: "220px", borderRadius: "16px", background: "radial-gradient(circle at 50% 45%, rgba(14,80,130,0.18), rgba(4,19,34,0.98) 70%)", overflow: "hidden", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                            <div style={{ position: "absolute", inset: "12% 8% 16% 8%", borderRadius: "50% 42% 44% 46% / 48% 44% 52% 40%", border: "1px solid rgba(107,157,210,0.08)", opacity: 0.55 }} />
                            <div style={{ position: "absolute", inset: "22% 15% 24% 18%", borderRadius: "48% 36% 48% 40% / 52% 38% 50% 42%", border: "1px solid rgba(107,157,210,0.06)", opacity: 0.45 }} />
                            <div style={{ position: "absolute", left: "12%", top: "16%", color: "#5f7f9f", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 900 }}>North America</div>
                            {mv.cityCounts.slice(0, 10).map(([city, count]) => {
                              const pos = geoPositions[city];
                              if (!pos) return null;
                              const glow = 8 + Math.round((count / Math.max(1, mv.cityCounts[0]?.[1] || 1)) * 12);
                              return (
                                <div key={city} style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translate(-50%, -50%)", display: "grid", gap: "6px", justifyItems: "center" }}>
                                  <div style={{ width: `${glow}px`, height: `${glow}px`, borderRadius: "999px", background: "#60a5fa", boxShadow: `0 0 0 4px rgba(96,165,250,0.15), 0 0 18px rgba(96,165,250,0.45)` }} />
                                  <div style={{ color: "#dbeafe", fontSize: "10px", fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{city.split(",")[0]}</div>
                                </div>
                              );
                            })}
                            <div style={{ position: "absolute", left: "18px", bottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "#7f99b8", fontSize: "11px", fontWeight: 800 }}>
                              <span>Low</span>
                              <div style={{ width: "96px", height: "8px", borderRadius: "999px", background: "linear-gradient(90deg, rgba(45,212,191,0.28), rgba(59,130,246,0.86))" }} />
                              <span>High</span>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "14px" }}>
                            <div style={{ borderRadius: "14px", padding: "12px 14px", background: "rgba(45,212,191,0.08)", color: "#cbe7f6", fontSize: "12px", lineHeight: 1.45 }}>
                              <div style={{ color: "#5eead4", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>Top issuer city</div>
                              {topIssuerCity?.[0] || "Insufficient data"}
                            </div>
                            <div style={{ borderRadius: "14px", padding: "12px 14px", background: "rgba(34,197,94,0.08)", color: "#cbe7f6", fontSize: "12px", lineHeight: 1.45 }}>
                              <div style={{ color: "#86efac", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>Top investor city</div>
                              {topInvestorCity?.[0] || "Insufficient data"}
                            </div>
                            <div style={{ borderRadius: "14px", padding: "12px 14px", background: "rgba(59,130,246,0.08)", color: "#cbe7f6", fontSize: "12px", lineHeight: 1.45 }}>
                              <div style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>Coverage split</div>
                              {usCount} U.S. · {canadaCount} Canada{topRegion?.[0] ? ` · Top region: ${topRegion[0]}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : null}
            {dashboardMode === "market" && workspaceViewMode === "calendar" ? (
              (() => {
                const calendarCompact = isMobile || isTablet;
                const timelineDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                const formatCalendarWeekLabel = (weekStart: string) => {
                  const start = new Date(`${weekStart}T00:00:00`);
                  if (Number.isNaN(start.getTime())) return weekStart;
                  return `${formatWeekLabel(weekStart)}, ${start.getFullYear()}`;
                };

                return (
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      padding: 0,
                      background: "transparent",
                      boxShadow: "none",
                    }}
                  >
                    <div style={{ display: "grid", gap: "1px" }}>
                      <div style={{ color: "#8bbcff", fontSize: "11px", fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }}>Calendar View</div>
                    </div>

                    {filteredEvents.length === 0 ? (
                      <div style={{ border: "1px solid rgba(96,165,250,0.18)", borderRadius: "16px", background: "rgba(6,22,40,0.52)", padding: "20px 18px", color: "#c7dcf6", fontSize: "15px", lineHeight: 1.5 }}>
                        No conferences match this calendar view.
                        <br />
                        Try clearing filters or selecting a broader market view.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "14px", minWidth: 0 }}>
                        {calendarWeeks.map((week) => {
                          const weekSelectedEventId = calendarSelected?.weekStart === week.weekStart ? calendarSelected.eventId : null;
                          const weekSignal = calendarWeekSignals.get(week.weekStart);
                          const isWeekExpanded = !!expandedWeeks[week.weekStart];
                          const maxVisibleLanes = 4;
                          const sortedWeekEvents = week.events
                            .slice()
                            .sort((a, b) => {
                              if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
                              const aDays = Math.max(1, Math.floor((new Date(`${a.endDate || a.startDate}T00:00:00Z`).getTime() - new Date(`${a.startDate}T00:00:00Z`).getTime()) / 86400000) + 1);
                              const bDays = Math.max(1, Math.floor((new Date(`${b.endDate || b.startDate}T00:00:00Z`).getTime() - new Date(`${b.startDate}T00:00:00Z`).getTime()) / 86400000) + 1);
                              if (bDays !== aDays) return bDays - aDays;
                              const aSignal = (calendarHotWeekKeys.has(week.weekStart) ? 1 : 0) + (isInvestorHeavy(a) ? 1 : 0) + (isIssuerHeavy(a) ? 1 : 0);
                              const bSignal = (calendarHotWeekKeys.has(week.weekStart) ? 1 : 0) + (isInvestorHeavy(b) ? 1 : 0) + (isIssuerHeavy(b) ? 1 : 0);
                              if (bSignal !== aSignal) return bSignal - aSignal;
                              return a.title.localeCompare(b.title);
                            });
                          const weekLaneEntries = sortedWeekEvents.map((event) => {
                            const weekStartMs = new Date(`${week.weekStart}T00:00:00Z`).getTime();
                            const eventStartMs = new Date(`${event.startDate}T00:00:00Z`).getTime();
                            const eventEndMs = new Date(`${event.endDate || event.startDate}T00:00:00Z`).getTime();
                            const startOffset = Math.max(0, Math.floor((eventStartMs - weekStartMs) / 86400000));
                            const endOffset = Math.min(6, Math.floor((eventEndMs - weekStartMs) / 86400000));
                            return {
                              event,
                              startOffset,
                              endOffset,
                              durationDays: Math.max(1, endOffset - startOffset + 1),
                            };
                          });
                          const weekLanes = weekLaneEntries.reduce<Array<typeof weekLaneEntries>>((lanes, laneEntry) => {
                            let placed = false;
                            for (const lane of lanes) {
                              const hasConflict = lane.some((existing) => laneEntry.startOffset <= existing.endOffset && existing.startOffset <= laneEntry.endOffset);
                              if (!hasConflict) {
                                lane.push(laneEntry);
                                placed = true;
                                break;
                              }
                            }
                            if (!placed) {
                              lanes.push([laneEntry]);
                            }
                            return lanes;
                          }, []);
                          const visibleWeekLanes = isWeekExpanded ? weekLanes : weekLanes.slice(0, maxVisibleLanes);
                          const hiddenLaneCount = Math.max(0, weekLanes.length - visibleWeekLanes.length);

                          return (
                            <section
                              key={week.weekStart}
                              style={{
                                background: "linear-gradient(180deg, rgba(8,38,61,0.94), rgba(7,31,50,0.96))",
                                border: "1px solid rgba(107,157,210,0.14)",
                                borderRadius: "22px",
                                padding: "13px 15px 14px",
                                boxShadow: "0 14px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.03)",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                                <div>
                                  <div style={{ color: "#ffffff", fontSize: "17px", fontWeight: 900, lineHeight: 1.1 }}>
                                    {formatCalendarWeekLabel(week.weekStart)}
                                  </div>
                                  <div style={{ color: "#86a4c3", fontSize: "12px", fontWeight: 500, marginTop: "4px" }}>
                                    {week.events.length} conferences
                                    {weekSignal?.topCity ? ` · Top city: ${weekSignal.topCity}` : ""}
                                    {weekSignal?.topOrganizer ? ` · Top organizer: ${weekSignal.topOrganizer}` : ""}
                                  </div>
                                </div>
                                {weekSignal?.chips.length ? (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" }}>
                                    {weekSignal.chips.map((signal) => (
                                      <span key={`${week.weekStart}-${signal.key}`} style={{ height: "22px", padding: "0 8px", borderRadius: "999px", fontSize: "9.5px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", color: "#f7fbff", border: `1px solid ${signal.tone}66`, background: `${signal.tone}1c` }}>
                                        {signal.label}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 0, borderBottom: "1px solid rgba(107,157,210,0.08)", paddingBottom: "5px", marginBottom: "6px" }}>
                                {week.dayDates.map((dayIso, idx) => {
                                  const count = week.byDay[idx].length;
                                  return (
                                    <div key={`${week.weekStart}-day-head-${dayIso}`} style={{ minWidth: 0, padding: "0 6px", textAlign: "center" }}>
                                      <div style={{ color: "#94aecb", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 900 }}>{timelineDays[idx]}</div>
                                      <div style={{ color: "#ffffff", fontSize: "12px", fontWeight: 850, marginTop: "3px" }}>{formatMonthDay(dayIso)}</div>
                                      <div style={{ color: count > 1 ? "#56d7c3" : "#6e89a7", fontSize: "9.5px", fontWeight: 800, marginTop: "2px" }}>{count > 0 ? count : ""}</div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div style={{ display: "grid", gap: "7px" }}>
                                {visibleWeekLanes.map((lane, laneIndex) => {
                                  let laneSelectedPanel: ReactNode = null;

                                  return (
                                    <div key={`${week.weekStart}-lane-${laneIndex}`} style={{ display: "grid", gap: "10px" }}>
                                      <div
                                        style={{
                                          position: "relative",
                                          display: "grid",
                                          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                                          minHeight: calendarCompact ? "54px" : "52px",
                                          alignItems: "center",
                                          background: "linear-gradient(180deg, rgba(4,20,35,0.52), rgba(4,20,35,0.34))",
                                          borderRadius: "14px",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {Array.from({ length: 7 }).map((_, idx) => (
                                          <div
                                            key={`${week.weekStart}-lane-${laneIndex}-bg-${idx}`}
                                            style={{
                                              height: "100%",
                                              borderLeft: idx === 0 ? "none" : "1px solid rgba(107,157,210,0.10)",
                                              background: "transparent",
                                            }}
                                          />
                                        ))}
                                        {lane.map(({ event, startOffset, endOffset }) => {
                                  const cityLabel = [event.city, event.state].filter(Boolean).join(", ");
                                  const isSelected = weekSelectedEventId === event.id;
                                  const detailSourceEvents = calendarDetailDataset === "all" ? events : filteredEvents;
                                  const detailWeekSignals = calendarDetailDataset === "all" ? allCalendarWeekSignals : calendarWeekSignals;
                                  const detailHotWeekKeys = calendarDetailDataset === "all" ? allCalendarHotWeekKeys : calendarHotWeekKeys;
                                  const detailScopeLabel = calendarDetailDataset === "all" ? "All Conferences" : "Current Filtered View";
	                                  const barGradient = /private/i.test(event.investmentFocus || "")
	                                    ? "linear-gradient(90deg, rgba(86,99,240,0.88), rgba(92,71,173,0.84))"
	                                    : /industry|thematic/i.test(event.conferenceType || "")
	                                      ? "linear-gradient(90deg, rgba(18,156,184,0.86), rgba(22,115,132,0.82))"
	                                      : /investor|allocator/i.test(`${event.conferenceType} ${event.investmentFocus} ${event.targetAudience}`)
	                                        ? "linear-gradient(90deg, rgba(37,99,235,0.82), rgba(14,116,144,0.76))"
	                                      : /issuer|public company|company presentations|1x1/i.test(`${event.companyParticipants} ${event.eventFeatures}`)
                                          ? "linear-gradient(90deg, rgba(126,79,216,0.82), rgba(83,78,187,0.78))"
                                          : "linear-gradient(90deg, rgba(58,131,226,0.78), rgba(26,90,146,0.76))";
                                  const organizerCount = detailSourceEvents.filter((item) => item.organizer && item.organizer === event.organizer).length;
                                  const sameWeekEvents = detailSourceEvents.filter((item) => item.id !== event.id && getWeekStart(item.startDate) === week.weekStart).slice(0, 4);
                                  const sameCityEvents = detailSourceEvents.filter((item) => item.id !== event.id && [item.city, item.state].filter(Boolean).join(", ") === cityLabel).slice(0, 4);
                                  const sameOrganizerEvents = detailSourceEvents.filter((item) => item.id !== event.id && item.organizer && item.organizer === event.organizer).slice(0, 4);
                                  const sameFocusEvents = detailSourceEvents.filter((item) => item.id !== event.id && splitCsv(item.investmentFocus || "").some((focus) => splitCsv(event.investmentFocus || "").includes(focus))).slice(0, 4);
                                  const sameAudienceEvents = detailSourceEvents.filter((item) => item.id !== event.id && item.targetAudience && item.targetAudience === event.targetAudience).slice(0, 4);
                                  const weekSignalDetail = detailWeekSignals.get(week.weekStart);
                                  const highValueFeatureTags = splitCsv(event.eventFeatures || "").filter((feature) =>
                                    ["Company Presentations", "1x1 Meetings", "Partnering / Deal-Making"].some((allowed) => allowed.toLowerCase() === feature.toLowerCase())
                                  );
                                  const detailTags = unique([
                                    event.conferenceType || "",
                                    ...splitCsv(event.industry || "").slice(0, 2),
                                    ...splitCsv(event.investmentFocus || "").slice(0, 2),
                                    ...highValueFeatureTags,
                                    event.format,
                                  ].filter(Boolean)).slice(0, 7);
                                  const relatedKeyBase = `${week.weekStart}:${event.id}`;
                                  const eventHoverId = `calendar:${week.weekStart}:${event.id}`;
                                  const isHovered = hoveredCardId === eventHoverId;
                                  const allRelatedMatches = detailSourceEvents
                                    .filter((item) => item.id !== event.id)
                                    .map((related) => buildRelatedMatch(event, related))
                                    .filter((match) => match.score > 0);
                                  const bestMatches = allRelatedMatches
                                    .filter((match) => match.meaningfulSignals >= 2 || (match.sameCity && match.daysApart >= 0 && match.daysApart <= 7))
                                    .sort((a, b) => b.score - a.score)
                                    .slice(0, 3);

                                  const sameMonthMatches = allRelatedMatches.filter((match) => getMonthKey(match.related.startDate) === getMonthKey(event.startDate));
                                  const sharedThemeMonthMatches = sameMonthMatches.filter((match) => match.sharedThemes.length > 0);
                                  const issuerAccessMonthMatches = sameMonthMatches.filter((match) => match.bothPresentations || match.bothOneOnOne || match.sharedIssuerParticipation.length > 0);
                                  const sameStateWindowMatches = allRelatedMatches
                                    .filter((match) => match.sameState && match.daysApart >= 0 && match.daysApart <= 45)
                                    .sort((a, b) => a.daysApart - b.daysApart);
                                  const sameRegionWindowMatches = allRelatedMatches
                                    .filter((match) => match.sameRegion && match.daysApart >= 0 && match.daysApart <= 45)
                                    .sort((a, b) => a.daysApart - b.daysApart);

                                  const candidateInsights: DetailInsight[] = [];
                                  const seenEvidence = new Set<string>();
                                  const pushInsight = (insight: DetailInsight | null) => {
                                    if (!insight) return;
                                    const signature = `${insight.type}:${(insight.evidence.relatedEventIds || []).join(",")}:${(insight.evidence.sharedSectorThemes || []).join(",")}:${insight.evidence.daysApart ?? ""}:${insight.evidence.sameCity ? "city" : insight.evidence.sameState ? "state" : insight.evidence.sameRegion ? "region" : ""}`;
                                    if (seenEvidence.has(signature)) return;
                                    seenEvidence.add(signature);
                                    candidateInsights.push(insight);
                                  };

                                  const topTravelMatch = bestMatches.find((match) => match.sameCity && match.daysApart >= 0 && match.daysApart <= 7)
                                    || sameStateWindowMatches[0]
                                    || sameRegionWindowMatches[0]
                                    || bestMatches.find((match) => match.sameWeek);
                                  if (topTravelMatch) {
                                    const timeLabel = topTravelMatch.daysApart <= 7
                                      ? "same-trip opportunity"
                                      : topTravelMatch.daysApart <= 21
                                        ? "regional outreach opportunity"
                                        : "related planning opportunity";
                                    pushInsight({
                                      type: topTravelMatch.sameCity
                                        ? "same_city"
                                        : topTravelMatch.sameState
                                          ? "same_state"
                                          : topTravelMatch.sameRegion
                                            ? "same_region"
                                            : "same_week",
                                      title: topTravelMatch.sameCity
                                        ? "Same-City Trip Opportunity"
                                        : topTravelMatch.sameState
                                          ? "Same-State Planning Opportunity"
                                          : topTravelMatch.sameRegion
                                            ? "Regional Planning Opportunity"
                                            : "Same-Week Conference Window",
                                      explanation: topTravelMatch.sameCity
                                        ? `${topTravelMatch.related.title} is scheduled in ${getCityValue(topTravelMatch.related) || "the same city"} ${topTravelMatch.daysApart} day${topTravelMatch.daysApart === 1 ? "" : "s"} later, creating a ${timeLabel} for meetings, travel, or follow-up coverage.`
                                        : topTravelMatch.sameState
                                          ? `${topTravelMatch.related.title} is scheduled elsewhere in ${topTravelMatch.related.state} ${topTravelMatch.daysApart} day${topTravelMatch.daysApart === 1 ? "" : "s"} later, giving this trip a ${timeLabel}.`
                                          : topTravelMatch.sameRegion
                                            ? `${topTravelMatch.related.title} stays within the ${topTravelMatch.related.region} region ${topTravelMatch.daysApart} day${topTravelMatch.daysApart === 1 ? "" : "s"} later, which can support multi-stop outreach planning.`
                                            : `${sameWeekEvents.length + 1} conferences fall in the same calendar week, making this a denser planning window for travel, sponsor meetings, and client outreach.`,
                                      priority: 100,
                                      confidence: topTravelMatch.confidence,
                                      evidence: {
                                        fieldsUsed: unique(["Start Date", "End Date", topTravelMatch.sameCity || topTravelMatch.sameState ? "City" : "", topTravelMatch.sameState ? "State / Province" : "", topTravelMatch.sameRegion ? "Region" : ""]),
                                        relatedEventIds: [topTravelMatch.related.id],
                                        daysApart: topTravelMatch.daysApart,
                                        sameCity: topTravelMatch.sameCity,
                                        sameState: topTravelMatch.sameState,
                                        sameRegion: topTravelMatch.sameRegion,
                                      },
                                    });
                                  }

                                  const topFitMatch = bestMatches.find((match) => match.sharedThemes.length > 0)
                                    || bestMatches.find((match) => match.sharedFocus.length > 0)
                                    || bestMatches.find((match) => match.sharedIssuerParticipation.length > 0 || match.bothPresentations || match.bothOneOnOne);
                                  if (topFitMatch) {
                                    pushInsight({
	                                      type: topFitMatch.sharedThemes.length
	                                        ? "shared_industry"
	                                        : topFitMatch.sharedFocus.length
	                                          ? "shared_investment_focus"
	                                          : topFitMatch.sharedIssuerParticipation.length
	                                            ? "shared_company_participants"
                                            : topFitMatch.bothPresentations
                                              ? "public_company_presentation_cluster"
                                              : "one_on_one_access_match",
                                      title: topFitMatch.sharedThemes.length
	                                        ? "Shared Industry Match"
	                                        : topFitMatch.sharedFocus.length
	                                          ? "Shared Investment Focus"
	                                          : topFitMatch.sharedIssuerParticipation.length
	                                            ? "Same Company Participants"
	                                            : topFitMatch.bothPresentations
	                                              ? "Company Presentation Match"
	                                              : "1x1 Meeting Match",
                                      explanation: topFitMatch.explanation,
                                      priority: 90,
                                      confidence: topFitMatch.confidence,
                                      evidence: topFitMatch.evidence,
                                    });
                                  }

                                  if (sharedThemeMonthMatches.length >= 2) {
                                    const leadTheme = sharedThemeMonthMatches.flatMap((match) => match.sharedThemes)[0];
                                    pushInsight({
                                      type: "sector_activity_cluster",
	                                      title: leadTheme ? `${sharedThemeMonthMatches.length + 1} ${leadTheme} Events This Month` : "Industry Activity Cluster",
                                      explanation: leadTheme
	                                        ? `${sharedThemeMonthMatches.length + 1} ${leadTheme} events are scheduled in the same month, pointing to a concentrated period for industry-specific meetings and outreach.`
	                                        : `${sharedThemeMonthMatches.length + 1} related events are scheduled in the same month, creating a stronger industry activity window.`,
                                      priority: 80,
                                      confidence: "high",
                                      evidence: {
	                                        fieldsUsed: ["Start Date", "Industry"],
                                        relatedEventIds: sharedThemeMonthMatches.slice(0, 4).map((match) => match.related.id),
                                        sharedSectorThemes: leadTheme ? [leadTheme] : [],
                                      },
                                    });
                                  } else if (issuerAccessMonthMatches.length >= 2) {
                                    pushInsight({
                                      type: "issuer_access_cluster",
                                      title: `${issuerAccessMonthMatches.length + 1} Issuer-Access Events This Month`,
                                      explanation: `${issuerAccessMonthMatches.length + 1} events with similar presentation or one-on-one access signals are scheduled this month, strengthening the case for coordinated banker, advisor, or IR outreach.`,
                                      priority: 80,
                                      confidence: "medium",
                                      evidence: {
	                                        fieldsUsed: ["Start Date", "Company Participants", "Event Features"],
                                        relatedEventIds: issuerAccessMonthMatches.slice(0, 4).map((match) => match.related.id),
                                      },
                                    });
                                  } else if ((detailHotWeekKeys.has(week.weekStart) || sameWeekEvents.length >= 2) && !candidateInsights.some((insight) => insight.type === "same_week")) {
                                    pushInsight({
                                      type: "crowded_calendar_period",
                                      title: "Crowded Calendar Period",
                                      explanation: `${sameWeekEvents.length + 1} conferences sit in the same week, which can help piggyback meetings and sponsor visibility but also increases competition for time and attention.`,
                                      priority: 75,
                                      confidence: "medium",
                                      evidence: {
                                        fieldsUsed: ["Start Date", "End Date"],
                                        relatedEventIds: sameWeekEvents.map((item) => item.id),
                                      },
                                    });
                                  }

                                  if (organizerCount > 1 && event.organizer) {
                                    pushInsight({
                                      type: "same_organizer",
                                      title: `Organizer Hosting ${organizerCount} Upcoming Events`,
                                      explanation: `${event.organizer} appears across ${organizerCount} events in ${calendarDetailDataset === "all" ? "the full conference universe" : "the current filtered view"}, which can signal recurring audience overlap and follow-up planning opportunities.`,
                                      priority: 70,
                                      confidence: organizerCount >= 3 ? "high" : "medium",
                                      evidence: {
                                        fieldsUsed: ["Organizer", "Start Date"],
                                        relatedEventIds: sameOrganizerEvents.map((item) => item.id),
                                      },
                                    });
                                  }

                                  const signalCards = candidateInsights
                                    .sort((a, b) => b.priority - a.priority)
                                    .slice(0, 4)
                                    .map((insight) => ({
                                      ...insight,
                                      tone:
                                        insight.type.includes("state") || insight.type.includes("region") || insight.type.includes("same_city")
                                          ? "#2dd4bf"
                                          : insight.type.includes("issuer") || insight.type.includes("presentation") || insight.type.includes("one_on_one")
                                            ? "#8b5cf6"
                                            : insight.type.includes("organizer")
                                              ? "#60a5fa"
                                              : insight.type.includes("crowded") || insight.type.includes("same_week")
                                                ? "#f59e0b"
                                                : "#3b82f6",
                                    }));

                                  const opportunityChips = unique([
                                    signalCards[0]?.title || "",
                                    weekSignalDetail?.topFocus ? `Leading focus: ${weekSignalDetail.topFocus}` : "",
                                    bestMatches[0]?.tags[0] || "",
                                  ]).filter(Boolean).slice(0, 3);

                                  const groupedRelatedMatches = [
                                    { label: "Same City", items: allRelatedMatches.filter((match) => match.sameCity).sort((a, b) => b.score - a.score) },
                                    { label: "Same State", items: allRelatedMatches.filter((match) => match.sameState).sort((a, b) => b.score - a.score) },
                                    { label: "Same Region", items: allRelatedMatches.filter((match) => match.sameRegion).sort((a, b) => b.score - a.score) },
                                    { label: "Same Week", items: allRelatedMatches.filter((match) => match.sameWeek).sort((a, b) => b.score - a.score) },
	                                    { label: "Similar Industry", items: allRelatedMatches.filter((match) => match.sharedThemes.length > 0).sort((a, b) => b.score - a.score) },
	                                    { label: "Similar Investment Focus", items: allRelatedMatches.filter((match) => match.sharedFocus.length > 0).sort((a, b) => b.score - a.score) },
	                                    { label: "Similar Company Participants", items: allRelatedMatches.filter((match) => match.sharedIssuerParticipation.length > 0 || match.bothPresentations || match.bothOneOnOne).sort((a, b) => b.score - a.score) },
                                    { label: "Same Organizer", items: allRelatedMatches.filter((match) => match.sameOrganizer).sort((a, b) => b.score - a.score) },
                                  ]
                                    .map((group) => ({ ...group, items: group.items.slice(0, 4) }))
                                    .filter((group) => group.items.length);

                                  const organizerOpportunities: DetailInsight[] = [];
                                  const similarCityMatches = allRelatedMatches
                                    .filter((match) => match.sameCity && (match.sharedThemes.length > 0 || match.sharedFocus.length > 0 || match.sharedIssuerParticipation.length > 0 || match.categoryMatch))
                                    .sort((a, b) => new Date(a.related.startDate).getTime() - new Date(b.related.startDate).getTime());
                                  const beforeEvent = similarCityMatches.filter((match) => new Date(getEventEndIso(match.related)).getTime() <= new Date(event.startDate).getTime()).pop();
                                  const afterEvent = similarCityMatches.find((match) => new Date(match.related.startDate).getTime() >= new Date(getEventEndIso(event)).getTime());
                                  if (beforeEvent && afterEvent) {
                                    const gapDays = differenceInDays(getEventEndIso(beforeEvent.related), afterEvent.related.startDate);
                                    const sharedSignals = unique([
                                      ...beforeEvent.sharedThemes,
                                      ...afterEvent.sharedThemes,
                                      ...beforeEvent.sharedFocus,
                                      ...afterEvent.sharedFocus,
                                      beforeEvent.bothPresentations || afterEvent.bothPresentations ? "Presentations" : "",
                                      beforeEvent.bothOneOnOne || afterEvent.bothOneOnOne ? "One-on-One Access" : "",
                                    ].filter(Boolean)).slice(0, 3);
                                    if (gapDays === 2 && sharedSignals.length > 0) {
                                      organizerOpportunities.push({
                                        type: "piggyback_opportunity",
                                        title: "Piggyback Opportunity — One-Day Gap",
                                        explanation: `Two related events in ${cityLabel || "this city"} leave one open day between them, which may support a complementary roundtable, networking event, or smaller add-on while a similar audience is already in market.`,
                                        priority: 95,
                                        confidence: "high",
                                        evidence: {
	                                          fieldsUsed: ["City", "Start Date", "End Date", "Industry", "Investment Focus", "Company Participants", "Event Features"],
                                          relatedEventIds: [beforeEvent.related.id, afterEvent.related.id],
                                          sharedSectorThemes: sharedSignals,
                                          daysApart: gapDays,
                                          sameCity: true,
                                        },
                                      });
                                    }
                                  }

                                  const next21Similar = allRelatedMatches.filter((match) => (match.sameCity || match.sameState || match.sameRegion) && match.daysApart >= 1 && match.daysApart <= 21 && (match.sharedThemes.length > 0 || match.sharedFocus.length > 0 || match.sharedIssuerParticipation.length > 0));
                                  if (next21Similar.length === 0) {
                                    organizerOpportunities.push({
                                      type: "open_window",
                                      title: cityLabel ? `Three-Week ${event.city || "City"} Opening` : "Three-Week Open Window",
                                      explanation: `No comparable events are currently scheduled in the next three weeks for this city-market combination, creating a possible opening for a new event or follow-on gathering.`,
                                      priority: 70,
                                      confidence: "medium",
                                      evidence: {
	                                        fieldsUsed: ["City", "Start Date", "Industry", "Investment Focus", "Company Participants", "Event Features"],
                                        sameCity: Boolean(event.city),
                                        sameState: Boolean(event.state),
                                        sameRegion: Boolean(event.region),
                                      },
                                    });
                                  } else if (next21Similar.length >= 4) {
                                    organizerOpportunities.push({
                                      type: "crowded_window",
                                      title: "Crowded Launch Period",
                                      explanation: `${next21Similar.length} comparable events are already scheduled nearby in the next three weeks, increasing competition for speakers, sponsors, and attendee attention.`,
                                      priority: 65,
                                      confidence: "medium",
                                      evidence: {
	                                        fieldsUsed: ["City", "Start Date", "Industry", "Investment Focus", "Company Participants", "Event Features"],
                                        relatedEventIds: next21Similar.slice(0, 4).map((match) => match.related.id),
                                      },
                                    });
                                  }
                                  const selectedDetailPanel = isSelected ? (
                                    <div
                                      style={{
                                        display: "grid",
                                        gap: "16px",
                                        paddingTop: "14px",
                                        paddingBottom: "6px",
                                        marginTop: "-1px",
                                        background: "linear-gradient(180deg, rgba(9,43,70,0.96), rgba(7,33,56,0.94))",
                                        borderTop: "1px solid rgba(120,184,255,0.26)",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 16px 32px rgba(0,0,0,0.14)",
                                        borderRadius: "18px",
                                        paddingInline: calendarCompact ? "10px" : "14px",
                                      }}
                                    >
                                      <div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                          <div style={{ color: "#8fbfff", fontSize: "11px", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Conference Detail</div>
                                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                            <div style={{ display: "inline-flex", gap: "4px", padding: "4px", borderRadius: "12px", background: "rgba(5,20,36,0.72)", border: "1px solid rgba(107,157,210,0.22)" }}>
                                              {[
                                                { key: "filtered" as const, label: "Filtered View" },
                                                { key: "all" as const, label: "All Conferences" },
                                              ].map((option) => (
                                                <button
                                                  key={option.key}
                                                  type="button"
                                                  onClick={() => setCalendarDetailDataset(option.key)}
                                                  style={{
                                                    height: "28px",
                                                    padding: "0 12px",
                                                    borderRadius: "9px",
                                                    border: option.key === calendarDetailDataset ? "1px solid rgba(125,180,255,0.22)" : "1px solid transparent",
                                                    background: option.key === calendarDetailDataset ? "linear-gradient(180deg, #2f6ff3, #1f55d8)" : "transparent",
                                                    color: option.key === calendarDetailDataset ? "#ffffff" : "#a8bdd8",
                                                    boxShadow: option.key === calendarDetailDataset ? "0 0 0 1px rgba(125,180,255,0.22)" : "none",
                                                    fontSize: "11px",
                                                    fontWeight: 800,
                                                    letterSpacing: "0.03em",
                                                    cursor: "pointer",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  {option.label}
                                                </button>
                                              ))}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => setCalendarSelected(null)}
                                              style={{ height: "32px", padding: "0 12px", borderRadius: "999px", border: "1px solid rgba(96,165,250,0.28)", background: "rgba(12,45,73,0.82)", color: "#d8ebff", fontSize: "12px", fontWeight: 900, cursor: "pointer" }}
                                            >
                                              Close Detail
                                            </button>
                                          </div>
                                        </div>
                                        <div style={{ color: "#9fb5cf", fontSize: "12px", fontWeight: 600, marginTop: "8px" }}>
                                          Intelligence source: {detailScopeLabel}
                                        </div>
                                        <div style={{ color: "#ffffff", fontSize: "23px", lineHeight: 1.08, fontWeight: 900, letterSpacing: "-0.03em", marginTop: "10px" }}>{event.title}</div>
                                        <div style={{ color: "#7dbbff", fontSize: "15px", fontWeight: 850, marginTop: "7px" }}>{cityLabel || "Location TBD"}</div>
                                        <div style={{ color: "#9fb5cf", fontSize: "13px", fontWeight: 500, lineHeight: 1.45, marginTop: "8px" }}>
                                          <div>{formatMonthDay(event.startDate)}{event.endDate && event.endDate !== event.startDate ? ` - ${formatMonthDay(event.endDate)}` : ""}</div>
                                          {event.organizer ? <div>{event.organizer}</div> : null}
                                          {event.venue ? <div>{event.venue}</div> : null}
                                        </div>
                                      </div>

                                      <div style={{ display: "grid", gridTemplateColumns: calendarCompact ? "1fr" : "repeat(4, minmax(0,1fr))", gap: "10px" }}>
                                        {buildEventLink(event) ? (
                                          <a href={buildEventLink(event)} target="_blank" rel="noreferrer" style={{ height: "38px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.28)", background: "rgba(13,36,59,0.72)", color: "#dbeafe", fontSize: "12px", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                            Event Link
                                          </a>
                                        ) : null}
                                        <div style={{ minWidth: 0 }}><AddToCalendar title={event.title} startDate={event.startDate} endDate={event.endDate} location={[cityLabel, event.venue].filter(Boolean).join(" · ")} description={buildDescription(event)} url={buildEventLink(event)} compact fullWidth /></div>
                                        <button
                                          type="button"
                                          onClick={() => saveSingleEventToNewList(event)}
                                          style={{ height: "38px", borderRadius: "10px", border: "1px solid rgba(107,157,210,0.22)", background: "rgba(3,20,38,0.62)", color: "#dbeafe", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
                                        >
                                          Save Event
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => toggleSelect(event.id)}
                                          style={{ height: "38px", borderRadius: "10px", border: selectedSet.has(event.id) ? "1px solid rgba(96,165,250,0.42)" : "1px solid rgba(107,157,210,0.22)", background: selectedSet.has(event.id) ? "rgba(37,99,235,0.22)" : "rgba(3,20,38,0.62)", color: "#dbeafe", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
                                        >
                                          {selectedSet.has(event.id) ? "Selected" : "Select Event"}
                                        </button>
                                      </div>

                                      {detailTags.length ? (
                                        <div style={{ display: "grid", gap: "10px" }}>
                                          <div style={{ color: "#bfdcff", fontSize: "10px", fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }}>
                                            Event Classification
                                          </div>
                                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {detailTags.map((tag) => (
                                              <span
                                                key={`${event.id}-detail-${tag}`}
                                                style={{
                                                  minHeight: "28px",
                                                  padding: "5px 10px",
                                                  borderRadius: "999px",
                                                  border: "1px solid rgba(125,180,255,0.22)",
                                                  background: "linear-gradient(180deg, rgba(11,44,72,0.96), rgba(8,32,53,0.94))",
                                                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                                                  color: "#f4f8ff",
                                                  fontSize: "11px",
                                                  fontWeight: 800,
                                                  lineHeight: 1.2,
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                }}
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null}

                                      <div style={{ display: "grid", gap: "14px" }}>
                                        <div
                                          style={{
                                            display: "grid",
                                            gap: "12px",
                                            padding: "18px 20px",
                                            borderRadius: "18px",
                                            background: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(45,212,191,0.12))",
                                            border: "1px solid rgba(147,197,253,0.30)",
                                            boxShadow: "0 14px 30px rgba(4,18,34,0.22), inset 0 1px 0 rgba(255,255,255,0.04)",
                                          }}
                                        >
                                          <div style={{ color: "#8fbfff", fontSize: "11px", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Opportunity Brief</div>
                                          <div style={{ color: "#eef6ff", fontSize: "14.5px", fontWeight: 600, lineHeight: 1.5 }}>
                                            {signalCards.length
                                              ? signalCards.slice(0, 2).map((item) => item.explanation).join(" ")
                                              : "This event does not yet have enough nearby or comparable records to generate a stronger planning signal."}
                                          </div>
                                          {opportunityChips.length ? (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                              {opportunityChips.map((chip) => (
                                                <span key={`${event.id}-${chip}`} style={{ background: "rgba(5,24,40,0.46)", border: "1px solid rgba(147,197,253,0.22)", borderRadius: "999px", padding: "7px 10px", fontSize: "12px", fontWeight: 800, color: "#dbeafe" }}>
                                                  {chip}
                                                </span>
                                              ))}
                                            </div>
                                          ) : null}
                                        </div>

                                        <div style={{ display: "grid", gap: "10px" }}>
                                          <div style={{ color: "#8fbfff", fontSize: "11px", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Why This Matters</div>
                                          {signalCards.length ? (
                                            <>
                                              <div style={{ display: "grid", gridTemplateColumns: calendarCompact ? "1fr" : "repeat(2, minmax(0,1fr))", gap: "10px" }}>
                                                {(detailExpanded ? signalCards : signalCards.slice(0, 2)).map((item) => (
                                                  <div key={item.title} style={{ display: "grid", gap: "6px", padding: "13px 14px", borderRadius: "14px", background: "linear-gradient(180deg, rgba(7,30,51,0.82), rgba(6,24,42,0.78))", border: "1px solid rgba(107,157,210,0.12)" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                                                      <span style={{ width: "12px", height: "12px", borderRadius: "999px", background: item.tone, boxShadow: `0 0 0 5px ${item.tone}18` }} />
                                                      <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>{item.title}</div>
                                                    </div>
                                                    <div style={{ color: "#c7d8ec", fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}>{item.explanation}</div>
                                                  </div>
                                                ))}
                                              </div>
                                              {signalCards.length > 2 ? (
                                                <button
                                                  type="button"
                                                  onClick={() => setDetailExpanded((value) => !value)}
                                                  style={{ justifySelf: "center", display: "inline-flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 14px", borderRadius: "999px", background: "rgba(37,99,235,0.16)", border: "1px solid rgba(147,197,253,0.38)", color: "#bfdbfe", fontSize: "13px", fontWeight: 900, cursor: "pointer" }}
                                                >
                                                  {detailExpanded ? "Collapse opportunity brief ↑" : "Show full opportunity brief ↓"}
                                                </button>
                                              ) : null}
                                            </>
                                          ) : (
                                            <div style={{ color: "#c7d8ec", fontSize: "14px", fontWeight: 500, lineHeight: 1.45, padding: "13px 14px", borderRadius: "14px", background: "rgba(5,25,44,0.54)", border: "1px solid rgba(107,157,210,0.10)" }}>
                                              No additional market signals available for this event yet.
                                            </div>
                                          )}
                                        </div>

                                        <div style={{ display: "grid", gap: "12px" }}>
                                          <div style={{ color: "#8fbfff", fontSize: "11px", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Related Opportunities</div>
                                          <div style={{ display: "grid", gap: "10px" }}>
                                            <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>Best Matches</div>
                                            {bestMatches.length ? bestMatches.map((match) => {
                                              const { related } = match;
                                              const relatedCityLabel = [related.city, related.state].filter(Boolean).join(", ");
                                              return (
                                                <div key={`best-${related.id}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "center", padding: "12px 15px", borderRadius: "14px", background: "rgba(4,20,35,0.34)", border: "1px solid rgba(107,157,210,0.10)" }}>
                                                  <div style={{ minWidth: 0, display: "grid", gap: "6px" }}>
                                                    <div style={{ fontSize: "14px", fontWeight: 800, lineHeight: 1.25, color: "#f4f8ff" }}>{related.title}</div>
                                                    <div style={{ fontSize: "12px", color: "#9fb5cf", fontWeight: 500 }}>{formatMonthDay(related.startDate)} · {relatedCityLabel || "Location TBD"}</div>
                                                    <div style={{ fontSize: "13px", color: "#c7d8ec", fontWeight: 500, lineHeight: 1.45 }}>{match.explanation}</div>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                      {match.tags.slice(0, 3).map((tag) => (
                                                        <span key={`${related.id}-${tag}`} style={{ background: "rgba(45,212,191,0.10)", border: "1px solid rgba(45,212,191,0.24)", color: "#7dd3fc", borderRadius: "999px", padding: "4px 8px", fontSize: "12px", fontWeight: 800 }}>
                                                          {tag}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => setCalendarSelected({ weekStart: getWeekStart(related.startDate), eventId: related.id })}
                                                    style={{ height: "32px", padding: "0 12px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.20)", background: "rgba(11,34,56,0.56)", color: "#dbeafe", fontSize: "12px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                                                  >
                                                    View
                                                  </button>
                                                </div>
                                              );
                                            }) : (
                                              <div style={{ color: "#c7d8ec", fontSize: "14px", fontWeight: 500, lineHeight: 1.45, padding: "13px 14px", borderRadius: "14px", background: "rgba(5,25,44,0.54)", border: "1px solid rgba(107,157,210,0.10)" }}>
                                                No strong related opportunities surfaced for this event yet.
                                              </div>
                                            )}
                                          </div>

                                          {groupedRelatedMatches.map((group) => {
                                            const groupKey = `${relatedKeyBase}:${group.label}`;
                                            const isGroupExpanded = Boolean(expandedRelatedGroups[groupKey]);
                                            return (
                                              <div key={group.label} style={{ display: "grid", gap: "8px" }}>
                                                <button
                                                  type="button"
                                                  onClick={() => setExpandedRelatedGroups((current) => ({ ...current, [groupKey]: !current[groupKey] }))}
                                                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", minHeight: "36px", padding: "0 14px", borderRadius: "999px", border: "1px solid rgba(107,157,210,0.14)", background: "rgba(8,38,64,0.30)", color: "#f4f8ff", fontSize: "13px", fontWeight: 850, cursor: "pointer", textAlign: "left" }}
                                                >
                                                  <span>{group.label} — {group.items.length}</span>
                                                  <span style={{ color: "#93c5fd", fontSize: "12px" }}>{isGroupExpanded ? "Hide" : "Show"}</span>
                                                </button>
                                                {isGroupExpanded ? (
                                                  <div style={{ display: "grid", gap: "8px" }}>
                                                    {group.items.map((match) => {
                                                      const related = match.related;
                                                      const relatedCityLabel = [related.city, related.state].filter(Boolean).join(", ");
                                                      return (
                                                        <div key={`${group.label}-${related.id}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "center", padding: "12px 15px", borderRadius: "14px", background: "rgba(4,20,35,0.34)", border: "1px solid rgba(107,157,210,0.10)" }}>
                                                          <div style={{ minWidth: 0, display: "grid", gap: "5px" }}>
                                                            <div style={{ fontSize: "14px", fontWeight: 800, lineHeight: 1.25, color: "#f4f8ff" }}>{related.title}</div>
                                                            <div style={{ fontSize: "12px", color: "#9fb5cf", fontWeight: 500 }}>{formatMonthDay(related.startDate)} · {relatedCityLabel || "Location TBD"}</div>
                                                            <div style={{ fontSize: "13px", color: "#c7d8ec", fontWeight: 500, lineHeight: 1.45 }}>{match.explanation}</div>
                                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                              {match.tags.slice(0, 3).map((tag) => (
                                                                <span key={`${group.label}-${related.id}-${tag}`} style={{ background: "rgba(45,212,191,0.10)", border: "1px solid rgba(45,212,191,0.24)", color: "#7dd3fc", borderRadius: "999px", padding: "4px 8px", fontSize: "12px", fontWeight: 800 }}>
                                                                  {tag}
                                                                </span>
                                                              ))}
                                                            </div>
                                                          </div>
                                                          <button
                                                            type="button"
                                                            onClick={() => setCalendarSelected({ weekStart: getWeekStart(related.startDate), eventId: related.id })}
                                                            style={{ height: "32px", padding: "0 12px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.20)", background: "rgba(11,34,56,0.56)", color: "#dbeafe", fontSize: "12px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                                                          >
                                                            View
                                                          </button>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                ) : null}
                                              </div>
                                            );
                                          })}

                                          {organizerOpportunities.length ? (
                                            <div style={{ display: "grid", gap: "10px" }}>
                                              <div style={{ color: "#8fbfff", fontSize: "11px", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Organizer Opportunities</div>
                                              <div style={{ display: "grid", gridTemplateColumns: calendarCompact ? "1fr" : "repeat(2, minmax(0,1fr))", gap: "10px" }}>
                                                {organizerOpportunities.map((item) => (
                                                  <div key={`${event.id}-${item.type}`} style={{ display: "grid", gap: "6px", padding: "14px 15px", borderRadius: "14px", background: "linear-gradient(180deg, rgba(7,30,51,0.82), rgba(6,24,42,0.78))", border: "1px solid rgba(107,157,210,0.12)" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                                                      <span style={{ width: "12px", height: "12px", borderRadius: "999px", background: item.type === "crowded_window" ? "#f59e0b" : "#60a5fa", boxShadow: `0 0 0 5px ${(item.type === "crowded_window" ? "#f59e0b" : "#60a5fa")}18` }} />
                                                      <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>{item.title}</div>
                                                    </div>
                                                    <div style={{ color: "#c7d8ec", fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}>{item.explanation}</div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    </div>
                                  ) : null;

                                  if (selectedDetailPanel) {
                                    laneSelectedPanel = selectedDetailPanel;
                                  }

                                  return (
                                          <button
                                            key={`${week.weekStart}-${event.id}`}
                                            type="button"
                                            onClick={(eventClick) => {
                                              eventClick.stopPropagation();
                                              if (isSelected) {
                                                setCalendarSelected(null);
                                                return;
                                              }
                                              setCalendarSelected({ weekStart: week.weekStart, eventId: event.id });
                                            }}
                                            style={{
                                              gridColumn: `${startOffset + 1} / ${endOffset + 2}`,
                                              zIndex: 2,
                                              margin: "0 4px",
                                              height: calendarCompact ? "44px" : "42px",
                                              borderRadius: "14px",
                                              padding: "7px 12px",
                                              display: "grid",
                                              alignContent: "center",
                                              gap: "1px",
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              cursor: "pointer",
                                              background: barGradient.replace("0.88", "0.74").replace("0.84", "0.72").replace("0.86", "0.74").replace("0.82", "0.72").replace("0.78", "0.70").replace("0.76", "0.68"),
                                              border: isSelected ? "1px solid rgba(255,255,255,0.88)" : isHovered ? "1px solid rgba(173,216,255,0.82)" : "1px solid rgba(147,197,253,0.40)",
                                              boxShadow: isSelected ? "0 0 0 3px rgba(59,130,246,0.20), 0 10px 22px rgba(37,99,235,0.22)" : isHovered ? "0 0 0 2px rgba(120,184,255,0.18), 0 10px 22px rgba(37,99,235,0.18)" : "0 6px 16px rgba(37,99,235,0.10)",
                                              color: "#ffffff",
                                              transition: "all 160ms ease",
                                              textAlign: "left",
                                              transform: isHovered && !isSelected ? "translateY(-1px)" : "translateY(0)",
                                            }}
                                            onMouseEnter={() => setHoveredCardId(eventHoverId)}
                                            onMouseLeave={() => setHoveredCardId((prev) => (prev === eventHoverId ? null : prev))}
                                          >
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                              <span title={`${event.title} · ${formatMonthDay(event.startDate)}${event.endDate && event.endDate !== event.startDate ? ` - ${formatMonthDay(event.endDate)}` : ""} · ${cityLabel || "Location TBD"} · ${event.organizer || ""}`} style={{ fontSize: "11.5px", fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{event.title}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
	                                              <div title={event.investmentFocus || getPrimaryParticipationLabel(event) || event.companyParticipants || cityLabel || "Location TBD"} style={{ fontSize: "10.5px", color: "#e6f3ff", opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
	                                                {cityLabel || "Location TBD"} {(event.investmentFocus || event.companyParticipants) ? `· ${(splitCsv(event.investmentFocus || "")[0] || getPrimaryParticipationLabel(event))}` : ""}
	                                              </div>
                                            </div>
                                          </button>
                                  );
                                })}
                                      </div>
                                      {laneSelectedPanel}
                                    </div>
                                  );
                                })}
                              </div>

                              {weekLanes.length > maxVisibleLanes ? (
                                <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                                  <div style={{ minHeight: "34px", padding: "0 12px", borderRadius: "12px", background: "rgba(3,20,38,0.42)", border: "1px solid rgba(107,157,210,0.10)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", color: "#c8d8ec", fontSize: "12px", fontWeight: 800 }}>
                                    <span>{week.events.length} conferences this week</span>
                                    {weekSignal?.investorHeavyCount ? <span>· {weekSignal.investorHeavyCount} investor-heavy</span> : null}
                                    {weekSignal?.issuerHeavyCount ? <span>· {weekSignal.issuerHeavyCount} issuer-heavy</span> : null}
                                    {weekSignal?.topCity ? <span>· Top city: {weekSignal.topCity}</span> : null}
                                    {weekSignal?.topFocus ? <span>· Top focus: {weekSignal.topFocus}</span> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedWeeks((current) => ({ ...current, [week.weekStart]: !current[week.weekStart] }))}
                                    style={{ justifySelf: "start", height: "34px", padding: "0 14px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.24)", background: "rgba(13,36,59,0.62)", color: "#dbeafe", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
                                  >
                                    {isWeekExpanded ? "Show fewer" : hiddenLaneCount > 0 ? `View ${hiddenLaneCount} more lanes` : `Show all ${week.events.length} conferences`}
                                  </button>
                                </div>
                              ) : null}
                            </section>
                          );
                        })}
                        {discoveryPage.nextCursor ? (
                          <div
                            style={{
                              display: "grid",
                              justifyItems: "center",
                              gap: "9px",
                              padding: "6px 0 2px",
                            }}
                          >
                            <div style={{ color: "#9fb5cf", fontSize: "12px", fontWeight: 700 }}>
                              Showing {filteredEvents.length} of {discoveryPage.total} matching events
                            </div>
                            <button
                              type="button"
                              onClick={() => void loadDiscoveryPage(discoveryPage.nextCursor, true)}
                              disabled={isLoadingEvents}
                              style={{
                                height: "36px",
                                padding: "0 16px",
                                borderRadius: "10px",
                                border: "1px solid rgba(96,165,250,0.35)",
                                background: "rgba(17,48,84,0.72)",
                                color: "#dbeafe",
                                fontSize: "12px",
                                fontWeight: 800,
                                cursor: isLoadingEvents ? "wait" : "pointer",
                              }}
                            >
                              {isLoadingEvents ? "Loading..." : "Show more events"}
                            </button>
                          </div>
                        ) : (
                          <div style={{ color: "#9fb5cf", fontSize: "12px", fontWeight: 700, textAlign: "center", padding: "6px 0 2px" }}>
                            All matching events shown
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()
            ) : null}
            {dashboardMode === "market" && workspaceViewMode === "database" ? (
            dataIsBootstrapping ? (
              <DiscoveryEventSkeletonCards />
            ) : filteredEvents.length === 0 ? (
              <div style={{ border: "1px solid rgba(96,165,250,0.2)", borderRadius: "12px", background: "rgba(8,24,42,0.68)", padding: "18px 16px", color: "#c7dcf6", fontSize: "15px", lineHeight: 1.45 }}>
                No current results for this market view, try refining your search.
              </div>
            ) : (
            <>
            <div className="event-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: compactSingleResultLayout ? "6px" : filteredEvents.length === 1 ? "8px" : "12px", marginTop: compactSingleResultLayout ? "0" : undefined, width: "100%", maxWidth: "100%", minWidth: 0 }}>
          {filteredEvents.map((e, index) => {
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

            const themeTags = splitCsv(e.industry || "");
            const focusTags = splitCsv(e.investmentFocus || "");
            const highValueFeatureTags = splitCsv(e.eventFeatures || "").filter((feature) =>
              ["Company Presentations", "1x1 Meetings", "Partnering / Deal-Making"].some((allowed) => allowed.toLowerCase() === feature.toLowerCase())
            );
            const classificationTags = [
              { label: (e.conferenceType || "").trim(), filterKey: "conferenceType" as const, filterLabel: "Conference Type" },
              ...themeTags.slice(0, 2).map((label) => ({ label, filterKey: "sectorThemes" as const, filterLabel: "Industry" })),
              ...focusTags.slice(0, 2).map((label) => ({ label, filterKey: "marketFocus" as const, filterLabel: "Investment Focus" })),
              ...highValueFeatureTags.map((label) => ({ label, filterKey: "eventFeatures" as const, filterLabel: "Event Features" })),
            ].filter((tag) => tag.label);
            const seenClassificationTags = new Set<string>();
            const classificationDisplayTags = classificationTags.filter((tag) => {
              const normalizedLabel = tag.label.toLowerCase();
              if (seenClassificationTags.has(normalizedLabel)) return false;
              seenClassificationTags.add(normalizedLabel);
              return true;
            }).slice(0, 4);

            const signalBadges: { label: string; tone: "hot" | "cluster" | "theme" }[] = [];
            if (isHot) signalBadges.push({ label: "HOT WEEK", tone: "hot" });
            if (isCluster) signalBadges.push({ label: "CLUSTER", tone: "cluster" });
            if (signalBadges.length < 2 && /canada/i.test(e.country)) signalBadges.push({ label: "CANADA", tone: "theme" });
            const regionBadge = (e.region || "").trim();
            if (signalBadges.length < 2 && regionBadge) signalBadges.push({ label: regionBadge.toUpperCase(), tone: "theme" });
            const visibleBadges = signalBadges.slice(0, 2);

            const relatedEventCounts = relatedEventCountsById.get(e.id);
            const sameCityWeekCount = relatedEventCounts?.sameCityWeekCount || 0;
            const sameThemeWeekCount = relatedEventCounts?.sameThemeWeekCount || 0;

            const marketSignal = (() => {
              const conferenceTypes = splitCsv(e.conferenceType || "").map((value) => value.toLowerCase());
              const industries = splitCsv(e.industry || "").map((value) => value.toLowerCase());
              const investmentFocuses = splitCsv(e.investmentFocus || "").map((value) => value.toLowerCase());
              const targetAudiences = splitCsv(e.targetAudience || "").map((value) => value.toLowerCase());
              const companyParticipants = splitCsv(e.companyParticipants || "").map((value) => value.toLowerCase());
              const eventFeatures = splitCsv(e.eventFeatures || "").map((value) => value.toLowerCase());
              const accessModels = splitCsv(e.accessModel || "").map((value) => value.toLowerCase());
              const marketCaps = splitCsv(e.marketCap || "").map((value) => value.toLowerCase());
              const eventFormats = splitCsv(e.format || "").map((value) => value.toLowerCase());

              const hasConferenceType = (...labels: string[]) => conferenceTypes.some((value) => labels.includes(value));
              const hasIndustry = (...patterns: RegExp[]) => industries.some((value) => patterns.some((pattern) => pattern.test(value)));
              const hasInvestmentFocus = (...patterns: RegExp[]) => investmentFocuses.some((value) => patterns.some((pattern) => pattern.test(value)));
              const hasTargetAudience = (...labels: string[]) => targetAudiences.some((value) => labels.includes(value));
              const hasCompanyParticipant = (...labels: string[]) => companyParticipants.some((value) => labels.includes(value));
              const hasEventFeature = (...labels: string[]) => eventFeatures.some((value) => labels.includes(value));
              const hasAccessModel = accessModels.length > 0;
              const hasMarketCap = marketCaps.length > 0;
              const hasIssuerAccessSignal =
                hasConferenceType("issuer access conference", "sell-side / corporate access") ||
                (hasEventFeature("company presentations", "1x1 meetings") && hasCompanyParticipant("public company executives", "public company ir / corporate access"));
              const hasDealSignal =
                hasConferenceType("private markets / deal-making") ||
                hasEventFeature("partnering / deal-making") ||
                (hasEventFeature("1x1 meetings") && hasCompanyParticipant("private company founders / executives", "private / portfolio company management", "project developers / sponsors"));
              const hasAllocatorSignal =
                hasConferenceType("allocator / manager forum") ||
                hasTargetAudience("institutional investors / asset managers", "family offices", "allocators / pensions / endowments");

              if (isHot && isCluster && hasIssuerAccessSignal) return "Issuer access signal inside clustered hot week";
              if (isHot && isCluster) return "Clustered activity inside a hot conference week";
              if (isHot && hasIssuerAccessSignal) return "Issuer access signal elevated this week";
              if (isHot && hasAllocatorSignal) return "Target Audience shows institutional concentration";
              if (isHot && hasIndustry(/health|biotech/)) return "Industry signal concentrated in healthcare";
              if (isCluster && hasDealSignal) return "Deal-making signal clustered by timing and location";
              if (isCluster && hasIssuerAccessSignal) return "Issuer access cluster forming in this market";
              if (isCluster && hasInvestmentFocus(/public/)) return "Investment Focus points to public-market overlap";
              if (isCluster && hasInvestmentFocus(/private/)) return "Investment Focus points to private-market overlap";
              if (isCluster) return "City and timing cluster detected";
              if (hasIssuerAccessSignal) return "Conference Type and Event Features indicate issuer access";
              if (hasDealSignal) return "Event Features indicate deal-making activity";
              if (hasAllocatorSignal) return "Target Audience indicates institutional relevance";
              if (hasIndustry(/health|biotech/)) return "Industry signal concentrated in healthcare";
              if (hasInvestmentFocus(/private/)) return "Investment Focus indicates private-market relevance";
              if (hasInvestmentFocus(/public/)) return "Investment Focus indicates public-market relevance";
              if (hasAccessModel && hasEventFeature("1x1 meetings", "company presentations")) return "Access Model and Event Features indicate structured access";
              if (hasMarketCap) return "Market Cap classification supports coverage targeting";
              if (eventFormats.some((value) => /virtual|hybrid/.test(value))) return "Event Format supports remote or hybrid access";
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
	                    : /institutional|allocator|target audience/i.test(`${marketSignal} ${e.conferenceType} ${e.investmentFocus} ${e.targetAudience}`)
	                    ? "investor"
	                    : /health|biotech/i.test(e.industry || "")
	                      ? "health"
	                      : /private/i.test(e.investmentFocus || "")
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
	                ? `${sameThemeWeekCount} related ${themeTags[0] || "industry"} events in the same week`
                : "Concentration signal remains elevated in this city window";
            const hasRelatedMarketView = sameCityWeekCount > 0 || sameThemeWeekCount > 0;
            const eventYear = new Date(`${e.startDate}T00:00:00Z`).getUTCFullYear();
            const dayRangeDisplay = isMultiDay ? parts.dayRange.replace("–", " – ") : parts.dayRange;
            const dowRangeDisplay = isMultiDay ? parts.dowRange.replace("–", " – ") : parts.dowRange;

            const organizerCount = filteredEvents.filter((x) => x.organizer && x.organizer === e.organizer).length;
            const isFeatured = isHot || isCluster || /investor|allocator/i.test(`${e.conferenceType} ${e.investmentFocus} ${e.targetAudience}`) || organizerCount >= 3;
            const normalizedVenue = (e.venue || "").trim();
            const normalizeLocationText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
            const cityNorm = normalizeLocationText((cityLabel || "").trim());
            const venueNorm = normalizeLocationText(normalizedVenue);
            const venueLine = normalizedVenue && venueNorm && cityNorm && !cityNorm.includes(venueNorm) && !venueNorm.includes(cityNorm) ? normalizedVenue : "";
            const externalUrl = buildEventLink(e);
            const insertedSignal = marketSignalInsertMap.get(index);
            const stripTone = insertedSignal?.type === "hotweek"
              ? {
                  accent: "#f4a340",
                  border: "rgba(226,150,67,0.4)",
                  glow: "rgba(244,163,64,0.16)",
                  iconBg: "linear-gradient(180deg, rgba(153,92,28,0.68), rgba(92,56,20,0.52))",
                  ctaColor: "#ffc773",
                }
              : insertedSignal?.type === "cluster"
                ? {
                    accent: "#d4a15b",
                    border: "rgba(196,146,74,0.38)",
                    glow: "rgba(184,128,58,0.16)",
                    iconBg: "linear-gradient(180deg, rgba(137,92,39,0.68), rgba(79,51,23,0.5))",
                    ctaColor: "#f6c27d",
                  }
              : insertedSignal?.type === "issuerAccess" || insertedSignal?.type === "allocator"
                  ? {
                      accent: "#66b7ff",
                      border: "rgba(96,168,246,0.38)",
                      glow: "rgba(77,146,255,0.16)",
                      iconBg: "linear-gradient(180deg, rgba(54,102,172,0.68), rgba(27,52,108,0.5))",
                      ctaColor: "#95d1ff",
                    }
                  : insertedSignal?.type === "dealMaking"
                    ? {
                        accent: "#d4a15b",
                        border: "rgba(196,146,74,0.38)",
                        glow: "rgba(184,128,58,0.16)",
                        iconBg: "linear-gradient(180deg, rgba(137,92,39,0.68), rgba(79,51,23,0.5))",
                        ctaColor: "#f6c27d",
                      }
                    : insertedSignal?.type === "investmentFocus" || insertedSignal?.type === "industry"
                    ? {
                        accent: "#4fd7d0",
                        border: "rgba(63,191,183,0.36)",
                        glow: "rgba(42,171,169,0.16)",
                        iconBg: "linear-gradient(180deg, rgba(38,126,122,0.66), rgba(20,74,83,0.5))",
                        ctaColor: "#7de7df",
                      }
                    : {
                        accent: "#9b84ff",
                        border: "rgba(135,111,229,0.36)",
                        glow: "rgba(116,92,214,0.16)",
                        iconBg: "linear-gradient(180deg, rgba(83,67,168,0.68), rgba(41,34,95,0.5))",
                        ctaColor: "#b6a7ff",
                      };

            return [
              insertedSignal ? (
                <div key={`signal-strip-${insertedSignal.id}-${index}`}>
                  {index === firstMarketSignalInsertIndex ? (
                    <div
                      style={{
                        margin: "4px 0 10px",
                        color: "#86b9f4",
                        fontSize: "11px",
                        fontWeight: 900,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      Live Market Signals
                    </div>
                  ) : null}
                  <Link
                    href="/market-view"
                    style={{
                      minHeight: "96px",
                      borderTop: `1px solid ${stripTone.border}`,
                      borderRight: `1px solid ${stripTone.border}`,
                      borderBottom: `1px solid ${stripTone.border}`,
                      borderLeft: `4px solid ${stripTone.accent}`,
                      borderRadius: "16px",
                      background: `linear-gradient(90deg, rgba(10,26,44,0.96) 0%, rgba(7,20,36,0.94) 100%), radial-gradient(60% 120% at 0% 50%, ${stripTone.glow} 0%, rgba(0,0,0,0) 72%)`,
                      padding: "20px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "18px",
                      boxShadow: "0 16px 28px rgba(2,10,24,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          flex: "0 0 auto",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stripTone.accent,
                          border: `1px solid ${stripTone.border}`,
                          background: stripTone.iconBg,
                          boxShadow: `0 0 0 1px ${stripTone.glow}`,
                        }}
                      >
                        <MarketSignalIcon kind={insertedSignal.type} color={stripTone.accent} />
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ color: stripTone.accent, fontSize: "13px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                            {insertedSignal.label}
                          </div>
                          {insertedSignal.badge ? (
                            <span
                              style={{
                                minHeight: "24px",
                                padding: "0 10px",
                                borderRadius: "999px",
                                border: `1px solid ${stripTone.border}`,
                                background: "rgba(11,30,52,0.72)",
                                color: "#e7f1ff",
                                fontSize: "12px",
                                fontWeight: 800,
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                            >
                              {insertedSignal.badge}
                            </span>
                          ) : null}
                        </div>
                        <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginTop: "6px" }}>
                          {insertedSignal.headline}
                        </div>
                        <div style={{ color: "#b9cae1", fontSize: "14px", lineHeight: 1.45, marginTop: "4px" }}>
                          {insertedSignal.body}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        height: "40px",
                        borderRadius: "10px",
                        border: `1px solid ${stripTone.border}`,
                        background: "rgba(11,31,54,0.88)",
                        color: stripTone.ctaColor,
                        fontSize: "14px",
                        fontWeight: 700,
                        padding: "0 16px",
                        whiteSpace: "nowrap",
                        boxShadow: `0 0 18px ${stripTone.glow}`,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {insertedSignal.cta}
                    </span>
                  </Link>
                </div>
              ) : null,
              (
              <article
                id={`event-card-${e.id}`}
                className="ccc-workspace-event-card event-card"
                key={e.id}
                ref={e.id === focusedEventId || (!focusedEventId && index === 0) ? firstResultCardRef : null}
                onMouseEnter={() => setHoveredCardId(e.id)}
                onMouseLeave={() => setHoveredCardId((prev) => (prev === e.id ? null : prev))}
                onClick={() => {
                  toggleSelect(e.id);
                  recordActivity("event", `Viewed: ${e.title}`, [e.city, e.state].filter(Boolean).join(", "));
                }}
                style={{
                  position: "relative",
                  borderTop: selected ? "1px solid rgba(144,178,218,0.56)" : "1px solid rgba(118,142,170,0.2)",
                  borderRight: selected ? "1px solid rgba(144,178,218,0.56)" : "1px solid rgba(118,142,170,0.2)",
                  borderBottom: selected ? "1px solid rgba(144,178,218,0.56)" : "1px solid rgba(118,142,170,0.2)",
                  borderLeft: isHot ? "3px solid rgba(182,132,84,0.68)" : isCluster ? "3px solid rgba(160,86,104,0.64)" : "3px solid rgba(90,110,132,0.42)",
                  borderRadius: "14px",
                  background: `radial-gradient(78% 64% at 46% 50%, rgba(90,136,192,0.1) 0%, rgba(90,136,192,0.02) 54%, rgba(90,136,192,0) 82%), radial-gradient(90% 88% at 26% 18%, rgba(110,156,208,0.09) 0%, rgba(110,156,208,0.02) 42%, rgba(110,156,208,0) 70%), radial-gradient(110% 90% at 92% 92%, rgba(6,14,26,0.24) 0%, rgba(6,14,26,0.06) 52%, rgba(6,14,26,0) 74%), radial-gradient(85% 85% at 15% 10%, ${
                    isHot
                      ? "rgba(166,124,84,0.16)"
                    : isCluster
                        ? "rgba(152,84,102,0.16)"
                        : "rgba(101,131,168,0.09)"
                  } 0%, rgba(8,22,36,0.04) 42%, rgba(8,22,36,0) 70%), radial-gradient(70% 80% at 42% 52%, rgba(28,62,96,0.1) 0%, rgba(10,24,40,0.02) 56%, rgba(10,24,40,0) 82%), linear-gradient(132deg, rgba(14,30,50,0.22) 8%, rgba(9,23,39,0.03) 40%, rgba(8,20,36,0.16) 100%), linear-gradient(180deg, rgba(12,30,50,0.95) 0%, rgba(9,24,41,0.97) 100%)`,
                  padding: "14px 16px",
                  minHeight: "148px",
                  height: "auto",
                  display: "grid",
                  gridTemplateColumns: "150px minmax(0, 1fr) 318px",
                  columnGap: "10px",
                  alignItems: "stretch",
                  overflow: "hidden",
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
                <div style={{ borderRight: "1px solid rgba(108,128,152,0.013)", paddingRight: "8px", display: "grid", alignContent: "start", gap: "4px", minHeight: 0 }}>
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
	                              : /investor|allocator/i.test(`${e.conferenceType} ${e.investmentFocus} ${e.targetAudience}`)
                                ? "radial-gradient(circle, rgba(92,132,189,0.34) 0%, rgba(92,132,189,0) 72%)"
                                : "radial-gradient(circle, rgba(101,130,172,0.28) 0%, rgba(101,130,172,0) 72%)",
                    }}
                  />
                  <span
                    style={{
                      display: "inline-grid",
                      placeItems: "center",
                      width: "74px",
                      height: "90px",
                      borderRadius: "12px",
                      background: isHot
                        ? "linear-gradient(180deg, rgba(156,110,78,0.8), rgba(76,52,40,0.84))"
                        : isCluster
                          ? "linear-gradient(180deg, rgba(142,82,100,0.82), rgba(72,42,54,0.86))"
                          : "linear-gradient(180deg, rgba(56,87,133,0.64), rgba(26,44,70,0.76))",
                      border: isCluster ? "1px solid rgba(170,106,126,0.42)" : "1px solid rgba(120,141,166,0.3)",
                      padding: "6px 0 5px",
                      justifySelf: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#c8d6e8", fontWeight: 800, letterSpacing: "0.04em", lineHeight: 1 }}>{parts.month}</span>
                    <span
                      style={{
                        fontSize: isMultiDay ? "19px" : "20px",
                        color: "#f2f7fd",
                        lineHeight: 1,
                        fontWeight: isMultiDay ? 760 : 800,
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: isMultiDay ? "-0.01em" : "0",
                      }}
                    >
                      {dayRangeDisplay}
                    </span>
                    <span style={{ fontSize: "10px", color: "#afc3db", fontWeight: 700, lineHeight: 1, letterSpacing: "0.03em" }}>{Number.isFinite(eventYear) ? eventYear : ""}</span>
                    <span
                      style={{
                        width: "46px",
                        height: "1px",
                        background: "rgba(196,216,238,0.18)",
                        margin: "2px 0 1px",
                        display: "block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: isMultiDay ? "9px" : "9px",
                        color: "#bfd0e4",
                        fontWeight: isMultiDay ? 650 : 700,
                        letterSpacing: "0.03em",
                        lineHeight: 1.05,
                        textAlign: "center",
                        padding: "0 6px",
                      }}
                    >
                      {dowRangeDisplay}
                    </span>
                  </span>
                  <div style={{ display: "grid", gap: "6px", minHeight: "18px", alignContent: "flex-start", justifyItems: "center", justifySelf: "center", marginTop: "4px" }}>
                    {visibleBadges.map((badge, badgeIndex) => (
                      <button
                        key={`${e.id}-badge-${badge.label}-${badgeIndex}`}
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
                          color: badge.tone === "hot" ? "#f2cb97" : badge.tone === "cluster" ? "#ebb7c4" : "#c6d3e3",
                          background: badge.tone === "hot"
                            ? "rgba(151,95,48,0.28)"
                            : badge.tone === "cluster"
                              ? "rgba(142,56,78,0.28)"
                              : /canada/i.test(badge.label)
                                ? "rgba(32,132,126,0.3)"
                                : /west coast/i.test(badge.label)
                                  ? "rgba(144,96,66,0.3)"
                                  : "rgba(76,93,117,0.24)",
                          whiteSpace: "nowrap",
                          outline: "none",
                          textAlign: "center",
                          justifySelf: "center",
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

                    <div style={{ marginTop: "6px", color: "#7fc1ff", fontSize: "19px", fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cityLabel || "Location TBD"}</div>
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

                <button
                  type="button"
                  aria-label={selected ? "Deselect event" : "Select event"}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelect(e.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    width: "36px",
                    height: "36px",
                    borderRadius: "0 14px 0 14px",
                    border: "none",
                    background: selected
                      ? "linear-gradient(180deg, rgba(47,109,246,0.96), rgba(28,72,170,0.96))"
                      : "transparent",
                    color: selected ? "#ffffff" : "rgba(210,228,248,0.92)",
                    fontSize: "12px",
                    fontWeight: 900,
                    outline: selected ? "1.5px solid rgba(150,205,255,0.88)" : hoveredCardId === e.id ? "1px solid rgba(148,186,228,0.55)" : "1px solid rgba(116,146,182,0.38)",
                    outlineOffset: "-1px",
                    boxShadow: selected
                      ? "inset 1px -1px 0 rgba(255,255,255,0.06), 0 0 16px rgba(85,155,255,0.38)"
                      : hoveredCardId === e.id
                        ? "0 0 10px rgba(78,114,156,0.16)"
                        : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  {selected ? "✓" : "+"}
                </button>

                <div
                  style={{
                    borderLeft: "1px solid rgba(108,128,152,0.007)",
                    paddingLeft: "12px",
                    display: "grid",
                    gridTemplateRows: "auto 1fr auto",
                    alignContent: "stretch",
                    minHeight: 0,
                    overflow: "visible",
                    background: "transparent",
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
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = "rgba(194, 202, 214, 0.18)";
                          event.currentTarget.style.borderColor = "rgba(196,210,230,0.72)";
                          event.currentTarget.style.color = "#eef6ff";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = "rgba(8,22,48,0.72)";
                          event.currentTarget.style.borderColor = "rgba(120,170,245,0.72)";
                          event.currentTarget.style.color = "#dbeafe";
                        }}
                        style={{ height: "28px", borderRadius: "9px", border: "1.5px solid rgba(120,170,245,0.72)", background: "rgba(8,22,48,0.72)", color: "#dbeafe", padding: "0 12px", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "10px", fontWeight: 900, letterSpacing: "0.02em", gap: "5px", whiteSpace: "nowrap", minWidth: "118px", opacity: externalUrl ? 1 : 0.65, transition: "all 180ms ease-out" }}
                      >
                        Event Link <span style={{ fontSize: "11px", opacity: 0.76 }}>↗</span>
                      </a>
                      <AddToCalendar compact showIcon title={e.title} startDate={e.startDate} endDate={e.endDate} location={[e.venue, e.city, e.state, e.country].filter(Boolean).join(", ")} url={externalUrl} description={buildDescription(e)} />
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
                    <div style={{ width: "100%", fontSize: "10px", lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.08em", color: "#bddcff", fontWeight: 800 }}>
                      Conference Classification
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "flex-start", alignContent: "flex-start" }}>
                      {classificationDisplayTags.map((tag, index) => {
                        const t = tag.label;
                        const isActive = filters[tag.filterKey].includes(t);
                        return (
                        <button
                          type="button"
                          key={`cc-${tag.filterKey}-${t}`}
                          aria-label={`Filter by ${tag.filterLabel}: ${t}`}
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            addFilterValue(tag.filterKey, t);
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.transform = "translateY(-1px)";
                            event.currentTarget.style.filter = "brightness(1.08)";
                            event.currentTarget.style.borderColor = "rgba(138,157,182,0.4)";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.transform = "translateY(0)";
                            event.currentTarget.style.filter = "none";
                            event.currentTarget.style.borderColor = isActive ? "rgba(147,197,253,0.68)" : "rgba(111,128,149,0.32)";
                          }}
                          onFocus={(event) => {
                            event.currentTarget.style.transform = "translateY(-1px)";
                            event.currentTarget.style.boxShadow = "0 0 0 2px rgba(147,197,253,0.32)";
                          }}
                          onBlur={(event) => {
                            event.currentTarget.style.transform = "translateY(0)";
                            event.currentTarget.style.boxShadow = isActive ? "0 0 0 1px rgba(147,197,253,0.22)" : "none";
                          }}
                          style={{
                            fontSize: "10px",
                            borderRadius: "999px",
                            border:
                              isActive
                                ? "1px solid rgba(147,197,253,0.68)"
                                : /institutional investors/i.test(t)
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
                              index < 2
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
                            color: index < 2 ? "#c4d6eb" : "#adc2d9",
                            padding: "3px 9px",
                            fontWeight: 460,
                            whiteSpace: "nowrap",
                            transition: "all 150ms ease",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            lineHeight: 1.2,
                            boxShadow: isActive ? "0 0 0 1px rgba(147,197,253,0.22)" : "none",
                          }}
                        >
                          {t}
                        </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "end", marginTop: "8px" }}>
                    <ContextHelpIcon
                      title="How to use event cards"
                      ariaLabel="Help: using event cards"
                      placement="top"
                      items={[
                        { label: "Select events", description: "Select one or more event cards first." },
                        { label: "Use the right control panel", description: "Choose Save Selected, Share Selected, or another available action from the right control panel." },
                        { label: "Verify details", description: "Use Event Link to open the official event page." },
                        { label: "Add to calendar", description: "Use Add to Calendar to add one event at a time." },
                      ]}
                    />
                  </div>
                </div>
              </article>
              ),
            ];
            })}
            </div>
            {discoveryPage.nextCursor ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => void loadDiscoveryPage(discoveryPage.nextCursor, true)}
                  disabled={isLoadingEvents}
                  style={{
                    height: "36px",
                    padding: "0 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(96,165,250,0.35)",
                    background: "rgba(17,48,84,0.72)",
                    color: "#dbeafe",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: isLoadingEvents ? "wait" : "pointer",
                  }}
                >
                  {isLoadingEvents ? "Loading…" : `Load ${LOAD_MORE_INCREMENT} more (${Math.max(discoveryPage.total - events.length, 0)} remaining)`}
                </button>
              </div>
            ) : null}
            {eventLoadError ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", color: "#fcb5c5", fontSize: "12px", textAlign: "center" }}>
                <span>{eventLoadError}</span>
                <button
                  type="button"
                  onClick={() => void loadDiscoveryPage()}
                  style={{ height: "28px", padding: "0 10px", borderRadius: "8px", border: "1px solid rgba(252,181,197,0.32)", background: "rgba(252,181,197,0.08)", color: "#ffd5df", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                >
                  Retry
                </button>
              </div>
            ) : null}
            </>
            )
            ) : null}
            {dashboardMode === "getstarted" || dashboardMode === "market" || dashboardMode === "marketview"
              ? null
              : null}
          </div>
        </div>
      </section>

      <ControlPanel
        description="Export, save, sync, and manage selected conferences."
        syncDescription="Turn this conference view into a live calendar workflow."
        selectedCount={selectedEvents.length}
        calendarSyncHelp={
          <ContextHelpIcon
            title="Calendar Sync"
            ariaLabel="Help: Calendar Sync"
            items={[
              { label: "Current filtered view", description: "Calendar Sync turns the current filtered view into a live calendar feed." },
              { label: "Add to your calendar", description: "Add the feed to Google Calendar, Apple Calendar, or Outlook." },
              { label: "Refresh timing", description: "Matching events appear when your calendar app refreshes the feed. Refresh timing is controlled by your calendar provider." },
            ]}
          />
        }
        quickActionsHelp={
          <ContextHelpIcon
            title="Quick Actions"
            ariaLabel="Help: Quick Actions"
            items={[
              { label: "Save Selected", description: "Save selected event cards into a new or existing list." },
              { label: "Share Selected", description: "Open an email draft with links to the selected events." },
              { label: "Save Market View", description: "Save the current filtered view locally so you can return to it later." },
              { label: "Clear", description: "Clear selected cards, filters, and quick views." },
            ]}
          />
        }
        panelHeight={PANEL_HEIGHT}
        calendarPlatforms={[
          { label: "Google", brand: "google", platform: "Google Calendar", onClick: () => openCalendarSync("Google Calendar") },
          { label: "Apple", brand: "apple", platform: "Apple Calendar", onClick: () => openCalendarSync("Apple Calendar") },
          { label: "Outlook", brand: "outlook", platform: "Outlook", onClick: () => openCalendarSync("Outlook") },
        ]}
        quickActions={[
          {
            label: "Clear",
            kind: "clear",
            accent: "#9fc3ff",
            description: "Clear selected event cards, filters, and quick views.",
            active: activeToolbarAction === "clear",
            onClick: () => {
              markToolbarAction("clear");
              clearWorkspaceView();
            },
            onMouseEnter: () => setToolbarHelpText("Reset filters, selections, and quick views to default."),
            onMouseLeave: () => setToolbarHelpText(""),
          },
          {
            label: "Share Selected",
            kind: "share",
            accent: "#8fd0ff",
            description: "Open an email draft with up to 20 selected event links.",
            active: activeToolbarAction === "share",
            onClick: () => {
              markToolbarAction("share");
              shareSelected();
            },
            onMouseEnter: () => setToolbarHelpText("Open an email draft with up to 20 selected events and links."),
            onMouseLeave: () => setToolbarHelpText(""),
          },
          {
            label: "Save Market View",
            kind: "saveView",
            accent: "#7ad6c8",
            description: "Save the current filtered market view in this browser.",
            active: activeToolbarAction === "view",
            onClick: () => {
              markToolbarAction("view");
              saveCurrentView();
            },
            onMouseEnter: () => setToolbarHelpText("Save your current filters as a local market view preset."),
            onMouseLeave: () => setToolbarHelpText(""),
          },
          {
            label: "Save Selected",
            kind: "saveSelected",
            accent: "#ffbf66",
            description: "Add selected event cards to a new or existing local list.",
            active: activeToolbarAction === "save" || saveMenuOpen,
            containerRef: saveMenuRef,
            onClick: () => {
              markToolbarAction("save");
              setSaveMenuOpen((v) => !v);
            },
            onMouseEnter: () => setToolbarHelpText("Save selected conferences to a new or existing local list."),
            onMouseLeave: () => setToolbarHelpText(""),
            menu: saveMenuOpen ? (
              <div style={{ position: "absolute", top: "35px", left: 0, right: 0, zIndex: 400, borderRadius: "10px", border: "1px solid rgba(96,165,250,0.3)", background: "linear-gradient(180deg, rgba(8,30,53,0.98) 0%, rgba(7,25,45,0.98) 100%)", boxShadow: "0 14px 28px rgba(4,12,22,0.38)", padding: "10px", display: "grid", gap: "8px" }}>
                <div style={{ fontSize: "11px", color: "#9ec4e9", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Save Events To</div>
                <select value={saveListChoice} onChange={(event) => setSaveListChoice(event.target.value)} style={{ height: "34px", borderRadius: "8px", background: "#08223d", color: "#e2e8f0", border: "1px solid rgba(96,165,250,0.3)", padding: "0 8px" }}>
                  <option value="new">Create New List</option>
                  {savedLists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
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
                  style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(96,165,250,0.44)", background: "rgba(37,99,235,0.24)", color: "#dbeafe", fontWeight: 700, cursor: "pointer" }}
                >
                  Save
                </button>
              </div>
            ) : null,
          },
        ]}
        savedSections={[
          {
            title: "Saved Lists",
            icon: "lists",
            count: savedLists.length,
            isOpen: savedConferenceListsOpen,
            onToggle: () => setSavedConferenceListsOpen((value) => !value),
            children: savedLists.length ? (
              <div style={{ display: "grid", gap: "8px", padding: "0 14px 14px" }}>
                {savedLists.map((list) => (
                  <div key={list.id} style={{ border: "1px solid rgba(147,197,253,0.18)", borderRadius: "10px", padding: "10px 10px 9px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                      <div style={{ color: "#dbeafe", fontSize: "12px", lineHeight: 1.3, fontWeight: 700 }}>{list.name}</div>
                      <button type="button" onClick={() => deleteSavedList(list.id)} style={{ height: "20px", minWidth: "20px", borderRadius: "6px", border: "1px solid rgba(190,102,122,0.36)", background: "rgba(118,46,63,0.18)", color: "#f2b7c4", fontSize: "11px", lineHeight: 1, cursor: "pointer", padding: "0 6px" }} title="Delete saved list">✕</button>
                    </div>
                    <div style={{ color: "#93c5fd", fontSize: "10.5px", marginBottom: "8px" }}>{list.eventIds.length} events • Updated {new Date(list.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    <button type="button" onClick={() => loadSavedList(list.id)} style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.28)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10.5px", cursor: "pointer", padding: "0 10px" }}>Load</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#9fb6d4", fontSize: "12.5px", lineHeight: 1.4, padding: "0 14px 14px" }}>
                No saved lists yet.<br />Select events, then use Save Selected.
              </div>
            ),
          },
          {
            title: "Saved Views",
            icon: "views",
            count: savedViews.length,
            isOpen: savedMarketViewsOpen,
            onToggle: () => setSavedMarketViewsOpen((value) => !value),
            children: savedViews.length ? (
              <div style={{ display: "grid", gap: "8px", padding: "0 14px 14px" }}>
                {savedViews.map((view) => (
                  <div key={view.id} style={{ border: "1px solid rgba(147,197,253,0.18)", borderRadius: "10px", padding: "10px 10px 9px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                      <div style={{ color: "#dbeafe", fontSize: "12px", lineHeight: 1.3, fontWeight: 700 }}>{view.name}</div>
                      <button type="button" onClick={() => deleteSavedView(view.id)} style={{ height: "20px", minWidth: "20px", borderRadius: "6px", border: "1px solid rgba(190,102,122,0.36)", background: "rgba(118,46,63,0.18)", color: "#f2b7c4", fontSize: "11px", lineHeight: 1, cursor: "pointer", padding: "0 6px" }} title="Delete saved view">✕</button>
                    </div>
                    <div style={{ color: "#93c5fd", fontSize: "10.5px", marginBottom: "8px" }}>{view.eventCount ?? 0} events • Updated {new Date(view.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    <button type="button" onClick={() => loadSavedView(view.id)} style={{ height: "26px", borderRadius: "7px", border: "1px solid rgba(147,197,253,0.28)", background: "rgba(147,197,253,0.08)", color: "#dbeafe", fontSize: "10.5px", cursor: "pointer", padding: "0 10px" }}>Load</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#9fb6d4", fontSize: "12.5px", lineHeight: 1.4, padding: "0 14px 14px" }}>
                No saved views yet.<br />Save your current filters to return to this market view later.
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
