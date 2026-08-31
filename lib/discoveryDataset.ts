import "server-only";
import type { MarketViewIntelligence } from "./marketViewIntelligence";
import type { InternalMarketIntelligence } from "./internalMarketIntelligence";

export type DiscoveryEvent = {
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
  conferenceType?: string;
  industry?: string;
  investmentFocus?: string;
  targetAudience?: string;
  companyParticipants?: string;
  eventFeatures?: string;
  accessModel?: string;
  marketCap?: string;
  audience: string;
  region: string;
  format: string;
  publicCompanySector?: string;
  additionalPublicCompanySectors?: string;
  eventCharacter?: string;
  organizerType?: string;
  verificationStatus?: string;
  dataCompletenessScore?: string;
  websiteApproval?: string;
  verificationStamp?: string;
};

type InternalDiscoveryEvent = DiscoveryEvent & {
  classificationEvidence?: string;
  eventIntelligenceProfile?: string;
  organizerPositioningSummary?: string;
  promotionalClaims?: string;
  notes?: string;
  createdAt?: string;
  lastModifiedAt?: string;
};

type MarketViewIntelligenceWithInternal = MarketViewIntelligence & {
  internalIntelligence: InternalMarketIntelligence;
};

export type DiscoveryFilterOptions = {
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

export type DiscoveryAggregateStats = {
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
type MonthMovementRow = { label: string; count: number; change: number | null; pct: number | null };
type LeaderboardContextCard = {
  leadLabel: string;
  leadCount: number;
  leadDetail?: string;
  rowContext: Record<string, string>;
  signalRead: string;
};
type LeaderboardWindowAnalytics = {
  total: number;
  startDate: string;
  endDate: string;
  cityCounts: RankedCount[];
  organizerCounts: RankedCount[];
  sectorCounts: RankedCount[];
  focusCounts: RankedCount[];
  eventCharacterCounts: RankedCount[];
  issuerParticipationCounts: RankedCount[];
  leaderboardContext: Record<string, LeaderboardContextCard>;
};
type RollingWindowRow = {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  rangeLabel: string;
  count: number;
  change: number | null;
  pct: number | null;
};

export type MarketViewAnalytics = {
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
  monthMovement: {
    windows: RollingWindowRow[];
    sectorMovers: MonthMovementRow[];
    characterMovers: MonthMovementRow[];
    accessMovers: MonthMovementRow[];
  };
  leaderboardContext?: Record<string, LeaderboardContextCard>;
  leaderboardWindows?: Record<"30" | "60" | "90", LeaderboardWindowAnalytics>;
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

export type DiscoveryPage = {
  events: DiscoveryEvent[];
  total: number;
  nextCursor: string | null;
  filterOptions: DiscoveryFilterOptions;
  aggregates: DiscoveryAggregateStats;
  allAggregates: DiscoveryAggregateStats;
  marketAnalytics: MarketViewAnalytics;
  allMarketAnalytics: MarketViewAnalytics;
  marketViewIntelligence?: MarketViewIntelligenceWithInternal;
  allMarketViewIntelligence?: MarketViewIntelligenceWithInternal;
};

export type DiscoveryQuery = {
  cursor?: string | null;
  limit?: number;
  q?: string;
  dateRange?: "next30" | "next60" | "next90" | "all";
  fromDate?: string;
  toDate?: string;
  country?: string[];
  region?: string[];
  state?: string[];
  cities?: string[];
  sectorThemes?: string[];
  publicCompanySectors?: string[];
  conferenceType?: string[];
  issuerParticipation?: string[];
  targetAudience?: string[];
  companyParticipants?: string[];
  eventFeatures?: string[];
  accessModel?: string[];
  marketCap?: string[];
  organizer?: string[];
  marketFocus?: string[];
  eventIds?: string[];
  sort?: "soonest" | "city";
  filterMode?: "and" | "or";
};

type AirtableRecord = {
  id: string;
  fields?: Record<string, unknown>;
  cellValuesByFieldId?: Record<string, unknown>;
};

const EVENTS_2_TABLE_ID = "tblHIRpnJtYoxuavI";
const EVENTS_2_FIELDS = {
  eventName: "fldy8rJpqxTX0G9Yo",
  organizerName: "fldVJ2BVaJz7zkbS6",
  startDate: "fldfbCxuvgWNE25s1",
  endDate: "fldGfgdWQ9FyZEhs2",
  format: "fldz5UYpueuVJn9OK",
  venueName: "fldqLJdzKuArBRW0O",
  city: "fldT8yuLQknEQhNFP",
  state: "fldXrWpcMRXgH9Cy2",
  country: "fld27vgEbRyK7GqJk",
  region: "fldbc3ysFHX6DeZ4c",
  eventWebsite: "fld3MAzPbVUPd6OdD",
  sourcePage: "fldrgPjz0FmDElmF9",
  verificationStatus: "fld6pKru0id1AXI5q",
  websiteApproval: "fldd3GA3YQ5lu2Uzp",
  classificationEvidence: "fld9um4kpHeIkNM1k",
  eventIntelligenceProfile: "fldQS8lnbM8VcQN7q",
  organizerPositioningSummary: "flduTn4KuFcuwRdaY",
  promotionalClaims: "fldu3cETGpl1Ri3yp",
  notes: "fldjdRS6mtNAEdrHH",
  createdAt: "fld33nekgxDo94wAx",
  lastModifiedAt: "fldMgIj2Ukefk9HB0",
  conferenceType: "fldIZERGXRiF1Bj8U",
  industry: "fldDO1Zwqfeq1n2ZB",
  investmentFocus: "fldBvbn7q8IkJddzl",
  targetAudience: "fldrNvJvDpCNrpn59",
  companyParticipants: "fldbGMj5uNASq3dF5",
  eventActivities: "fldA0TvvcnwEFPtQB",
  accessModel: "fldkKfvYJMQPOzHmZ",
  marketCap: "fld4dwlngajokiB2n",
} as const;

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const record = value as {
      name?: unknown;
      valuesByLinkedRecordId?: Record<string, unknown>;
      linkedRecordIds?: string[];
    };
    if (record.name) return toText(record.name);
    if (record.valuesByLinkedRecordId) {
      const linkedValues = record.linkedRecordIds?.length
        ? record.linkedRecordIds.flatMap((id) => record.valuesByLinkedRecordId?.[id] || [])
        : Object.values(record.valuesByLinkedRecordId).flat();
      return linkedValues.map(toText).filter(Boolean).join(", ");
    }
  }
  return "";
}

function firstText(fields: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = toText(fields[key]);
    if (value) return value;
  }
  return "";
}

function cleanDateOnly(value: unknown) {
  return toText(value).slice(0, 10);
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function isWebsiteApproved(fields: Record<string, unknown>) {
  const approvalKey = Object.keys(fields).find(
    (key) => key.replace(/[^a-z]/gi, "").toLowerCase() === "websiteapproval"
  ) || "Website Approval";
  const normalized = toText(fields[EVENTS_2_FIELDS.websiteApproval] || fields[approvalKey]).toLowerCase().replace(/\s+/g, "");
  return (normalized.includes("approved") || normalized.includes("appoved")) &&
    !/(notapproved|unapproved|pending|rejected)/.test(normalized);
}

function mapRecord(record: AirtableRecord): InternalDiscoveryEvent {
  const fields = record.cellValuesByFieldId || record.fields || {};
  const startDate = cleanDateOnly(fields[EVENTS_2_FIELDS.startDate]);
  const conferenceType = toText(fields[EVENTS_2_FIELDS.conferenceType]);
  const industry = toText(fields[EVENTS_2_FIELDS.industry]);
  const investmentFocus = toText(fields[EVENTS_2_FIELDS.investmentFocus]);
  const targetAudience = toText(fields[EVENTS_2_FIELDS.targetAudience]);
  const companyParticipants = toText(fields[EVENTS_2_FIELDS.companyParticipants]);
  const eventFeatures = toText(fields[EVENTS_2_FIELDS.eventActivities]);
  const accessModel = toText(fields[EVENTS_2_FIELDS.accessModel]);
  const marketCap = toText(fields[EVENTS_2_FIELDS.marketCap]);
  return {
    id: record.id,
    title: toText(fields[EVENTS_2_FIELDS.eventName]) || "Untitled Event",
    eventSeries: "",
    startDate,
    endDate: cleanDateOnly(fields[EVENTS_2_FIELDS.endDate] || fields[EVENTS_2_FIELDS.startDate]),
    city: toText(fields[EVENTS_2_FIELDS.city]),
    state: toText(fields[EVENTS_2_FIELDS.state]),
    country: toText(fields[EVENTS_2_FIELDS.country]),
    venue: toText(fields[EVENTS_2_FIELDS.venueName]),
    website: toText(fields[EVENTS_2_FIELDS.eventWebsite]),
    sourcePage: toText(fields[EVENTS_2_FIELDS.sourcePage]),
    organizer: toText(fields[EVENTS_2_FIELDS.organizerName]),
    primaryCategory: conferenceType,
    marketFocus: investmentFocus,
    sectorThemes: industry,
    issuerParticipation: companyParticipants,
    conferenceType,
    industry,
    investmentFocus,
    targetAudience,
    companyParticipants,
    eventFeatures,
    accessModel,
    marketCap,
    audience: targetAudience,
    region: toText(fields[EVENTS_2_FIELDS.region]),
    format: toText(fields[EVENTS_2_FIELDS.format]),
    publicCompanySector: industry,
    additionalPublicCompanySectors: "",
    eventCharacter: eventFeatures,
    organizerType: "",
    verificationStatus: toText(fields[EVENTS_2_FIELDS.verificationStatus]),
    dataCompletenessScore: "",
    websiteApproval: toText(fields[EVENTS_2_FIELDS.websiteApproval]),
    verificationStamp: "",
    classificationEvidence: toText(fields[EVENTS_2_FIELDS.classificationEvidence]),
    eventIntelligenceProfile: toText(fields[EVENTS_2_FIELDS.eventIntelligenceProfile]),
    organizerPositioningSummary: toText(fields[EVENTS_2_FIELDS.organizerPositioningSummary]),
    promotionalClaims: toText(fields[EVENTS_2_FIELDS.promotionalClaims]),
    notes: toText(fields[EVENTS_2_FIELDS.notes]),
    createdAt: toText(fields[EVENTS_2_FIELDS.createdAt]),
    lastModifiedAt: toText(fields[EVENTS_2_FIELDS.lastModifiedAt]),
  };
}

async function fetchApprovedEvents(): Promise<InternalDiscoveryEvent[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_TOKEN;
  if (!baseId || !token) throw new Error("Missing Airtable environment variables.");

  // Airtable cursors can be invalidated while a table is being updated. Restart
  // the read-only collection once instead of letting that transient 422 take the
  // whole application down.
  let records: AirtableRecord[] = [];
  let lastError: unknown;
  for (let collectionAttempt = 0; collectionAttempt < 2; collectionAttempt += 1) {
    records = [];
    let offset: string | undefined;
    try {
      do {
        const url = new URL(`https://api.airtable.com/v0/${baseId}/${EVENTS_2_TABLE_ID}`);
        url.searchParams.set("pageSize", "100");
        url.searchParams.set("returnFieldsByFieldId", "true");
        if (offset) url.searchParams.set("offset", offset);
        let response: Response | undefined;
        let pageError: unknown;
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            response = await fetch(url.toString(), {
              headers: { Authorization: `Bearer ${token}` },
              cache: "force-cache",
              next: { revalidate: 60 },
            });
            if (response.ok) break;
            pageError = new Error(`Airtable fetch failed: ${response.status} ${response.statusText}`);
          } catch (error) {
            pageError = error;
          }
        }
        if (!response?.ok) throw pageError || new Error("Airtable request did not return a response.");
        const data = await response.json();
        records.push(...(data.records || []));
        offset = data.offset;
      } while (offset);
      break;
    } catch (error) {
      lastError = error;
      if (collectionAttempt === 1) throw error;
    }
  }

  if (!records.length && lastError) throw lastError;

  return records
    .filter((record) => isWebsiteApproved(record.fields || {}))
    .map(mapRecord)
    .filter((event) => event.startDate)
    .sort((a, b) => a.startDate === b.startDate ? a.title.localeCompare(b.title) : a.startDate.localeCompare(b.startDate));
}

function buildFilterOptions(events: DiscoveryEvent[]): DiscoveryFilterOptions {
  return {
    cities: unique(events.map((event) => [event.city, event.state].filter(Boolean).join(", "))),
    regions: unique(events.map((event) => event.region)),
    countries: unique(events.map((event) => event.country)),
    states: unique(events.map((event) => event.state)),
    themes: unique(events.flatMap((event) => splitCsv(event.industry || ""))),
    publicCompanySectors: [],
    conferenceTypes: unique(events.flatMap((event) => splitCsv(event.conferenceType || ""))),
    issuers: [],
    targetAudiences: unique(events.flatMap((event) => splitCsv(event.targetAudience || ""))),
    companyParticipants: unique(events.flatMap((event) => splitCsv(event.companyParticipants || ""))),
    eventFeatures: unique(events.flatMap((event) => splitCsv(event.eventFeatures || ""))),
    accessModels: unique(events.flatMap((event) => splitCsv(event.accessModel || ""))),
    marketCaps: unique(events.flatMap((event) => splitCsv(event.marketCap || ""))),
    organizers: unique(events.map((event) => event.organizer)),
    marketFocuses: unique(events.flatMap((event) => splitCsv(event.investmentFocus || ""))),
  };
}

function ranked(values: string[]): RankedCount[] {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => {
    const label = value.trim();
    if (label) counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function weekStart(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return date.toISOString().slice(0, 10);
}

function dateKeyForOffset(offset: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatRangeLabel(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startDate}–${endDate}`;
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = monthFormatter.format(start);
  const endMonth = monthFormatter.format(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  return startMonth === endMonth ? `${startMonth} ${startDay}–${endDay}` : `${startMonth} ${startDay}–${endMonth} ${endDay}`;
}

function buildMonthMovement(events: DiscoveryEvent[]) {
  const add = (map: Map<string, number>, value: string) => {
    splitCsv(value || "").forEach((item) => map.set(item, (map.get(item) || 0) + 1));
  };
  const windows = [
    { key: "prior", label: "Prior 30D", startDate: dateKeyForOffset(-30), endDate: dateKeyForOffset(-1) },
    { key: "current", label: "Current 30D", startDate: dateKeyForOffset(0), endDate: dateKeyForOffset(29) },
    { key: "next", label: "Next 30D", startDate: dateKeyForOffset(30), endDate: dateKeyForOffset(59) },
    { key: "following", label: "Following 30D", startDate: dateKeyForOffset(60), endDate: dateKeyForOffset(89) },
  ];
  const buckets = new Map<string, {
    count: number;
    sectors: Map<string, number>;
    characters: Map<string, number>;
    access: Map<string, number>;
  }>();

  windows.forEach((window) => {
    buckets.set(window.key, {
      count: 0,
      sectors: new Map<string, number>(),
      characters: new Map<string, number>(),
      access: new Map<string, number>(),
    });
  });

  events.forEach((event) => {
    const startDate = event.startDate.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return;
    const window = windows.find((item) => startDate >= item.startDate && startDate <= item.endDate);
    if (!window) return;
    const bucket = buckets.get(window.key);
    if (!bucket) return;
    bucket.count += 1;
    const sectorValue = event.industry || "";
    add(bucket.sectors, sectorValue);
    add(bucket.characters, event.eventFeatures || "");
    add(bucket.access, event.companyParticipants || "");
  });

  const movementWindows = windows.map((window) => {
    const count = buckets.get(window.key)?.count || 0;
    const comparisonKey = window.key === "next" ? "current" : window.key === "following" ? "next" : null;
    const comparisonCount = comparisonKey ? buckets.get(comparisonKey)?.count || 0 : null;
    const change = comparisonCount === null ? null : count - comparisonCount;
    const pct = change === null || !comparisonCount ? null : Math.round((change / comparisonCount) * 100);
    return { ...window, rangeLabel: formatRangeLabel(window.startDate, window.endDate), count, change, pct };
  });

  const current = buckets.get("current");
  const next = buckets.get("next");
  const movers = (key: "sectors" | "characters" | "access"): MonthMovementRow[] => {
    const labels = new Set<string>([
      ...Array.from(current?.[key].keys() || []),
      ...Array.from(next?.[key].keys() || []),
    ]);
    return Array.from(labels)
      .map((label) => {
        const count = next?.[key].get(label) || 0;
        const currentCount = current?.[key].get(label) || 0;
        const change = count - currentCount;
        return { label, count, change, pct: currentCount ? Math.round((change / currentCount) * 100) : null };
      })
      .filter((row) => row.count > 0 || row.change !== 0)
      .sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0) || b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 6);
  };

  return {
    windows: movementWindows,
    sectorMovers: movers("sectors"),
    characterMovers: movers("characters"),
    accessMovers: movers("access").map((row) => ({
      ...row,
      label: /no issuer participation/i.test(row.label) ? "Limited Issuer Access" : row.label,
    })),
  };
}

function displayAccessProfile(label: string) {
  return /no issuer participation/i.test(label) ? "Limited Issuer Access" : label;
}

function sectorLabels(event: DiscoveryEvent) {
  return splitCsv(event.industry || "");
}

function focusLabels(event: DiscoveryEvent) {
  return splitCsv(event.investmentFocus || "");
}

function eventCountLabel(count: number) {
  return `${count} ${count === 1 ? "conference" : "conferences"}`;
}

function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

function firstUpcomingTitle(events: DiscoveryEvent[]) {
  const today = dateKeyForOffset(0);
  return events
    .filter((event) => event.startDate >= today)
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title))[0]?.title || "";
}

function buildLeaderboardContext(events: DiscoveryEvent[], counts: {
  cityCounts: RankedCount[];
  organizerCounts: RankedCount[];
  sectorCounts: RankedCount[];
  focusCounts: RankedCount[];
  eventCharacterCounts: RankedCount[];
  issuerParticipationCounts: RankedCount[];
}): Record<string, LeaderboardContextCard> {
  const total = events.length;
  const lead = (rows: RankedCount[]) => rows[0] || ["", 0] as RankedCount;
  const topRows = (rows: RankedCount[]) => rows.slice(0, 5);
  const top3Share = (rows: RankedCount[]) => percent(rows.slice(0, 3).reduce((sum, [, count]) => sum + count, 0), total);
  const top5Count = (rows: RankedCount[]) => rows.slice(0, 5).reduce((sum, [, count]) => sum + count, 0);
  const rowContext = (rows: RankedCount[], contextFor: (label: string, index: number, count: number) => string) => Object.fromEntries(
    topRows(rows)
      .map(([label, count], index) => [label, contextFor(label, index, count)] as const)
      .filter(([, context]) => Boolean(context))
  );
  const byCity = (label: string) => events.filter((event) => cityValue(event) === label);
  const byOrganizer = (label: string) => events.filter((event) => event.organizer === label);
  const byCharacter = (label: string) => events.filter((event) => splitCsv(event.eventCharacter || "").includes(label));
  const bySector = (label: string) => events.filter((event) => sectorLabels(event).includes(label));
  const byFocus = (label: string) => events.filter((event) => focusLabels(event).includes(label));
  const byAccess = (label: string) => events.filter((event) => splitCsv(event.companyParticipants || "").map(displayAccessProfile).includes(label));
  const leadSector = (items: DiscoveryEvent[]) => ranked(items.flatMap(sectorLabels))[0]?.[0] || "";
  const leadCharacter = (items: DiscoveryEvent[]) => ranked(items.flatMap((event) => splitCsv(event.eventCharacter || "")))[0]?.[0] || "";
  const leadMetro = (items: DiscoveryEvent[]) => ranked(items.map(cityValue))[0]?.[0] || "";

  const metroLead = lead(counts.cityCounts);
  const metroSecond = counts.cityCounts[1];
  const organizerLead = lead(counts.organizerCounts);
  const characterLead = lead(counts.eventCharacterCounts);
  const sectorLead = lead(counts.sectorCounts);
  const focusLead = lead(counts.focusCounts);
  const accessCounts = counts.issuerParticipationCounts.map(([label, count]) => [displayAccessProfile(label), count] as RankedCount);
  const accessLead = lead(accessCounts);
  const accessSecond = accessCounts[1];

  return {
    "Top Metros": {
      leadLabel: metroLead[0],
      leadCount: metroLead[1],
      leadDetail: metroSecond?.[1] ? `No. 2: ${metroSecond[0]} (${eventCountLabel(metroSecond[1])})` : undefined,
      rowContext: rowContext(counts.cityCounts, (label) => {
        const items = byCity(label);
        const sector = leadSector(items);
        const character = leadCharacter(items);
        return sector ? `Lead sector: ${sector}` : character ? `Lead character: ${character}` : "";
      }),
      signalRead: metroLead[1] && metroSecond?.[1] && metroLead[1] >= metroSecond[1] * 3
        ? `${metroLead[0]} has more than 3x the conferences of the second-ranked metro.`
        : `Top 3 metros account for ${top3Share(counts.cityCounts)}% of the current index.`,
    },
    "Top Organizers": {
      leadLabel: organizerLead[0],
      leadCount: organizerLead[1],
      leadDetail: `Top 5 account for ${eventCountLabel(top5Count(counts.organizerCounts))}`,
      rowContext: rowContext(counts.organizerCounts, (label) => {
        const items = byOrganizer(label);
        const metro = leadMetro(items);
        const nextEvent = firstUpcomingTitle(items);
        return metro ? `Top metro: ${metro}` : nextEvent ? `Next event: ${nextEvent}` : "";
      }),
      signalRead: counts.organizerCounts.length > 5
        ? `Top 5 organizers account for ${eventCountLabel(top5Count(counts.organizerCounts))}.`
        : `${organizerLead[0] || "The leading organizer"} leads the current organizer table.`,
    },
    "Top Event Features": {
      leadLabel: characterLead[0],
      leadCount: characterLead[1],
      leadDetail: `${percent(characterLead[1], total)}% of the current index`,
      rowContext: rowContext(counts.eventCharacterCounts, (label, _index, count) => {
        const sector = leadSector(byCharacter(label));
        return sector ? `Lead industry: ${sector}` : `Share of index: ${percent(count, total)}%`;
      }),
      signalRead: characterLead[0] ? `${characterLead[0]} is the leading event-feature signal at ${eventCountLabel(characterLead[1])}.` : "Event-feature data is still building across the current index.",
    },
    "Top Industries": {
      leadLabel: sectorLead[0],
      leadCount: sectorLead[1],
      leadDetail: `${percent(sectorLead[1], total)}% of the current index`,
      rowContext: rowContext(counts.sectorCounts, (label) => {
        const items = bySector(label);
        const metro = leadMetro(items);
        const character = leadCharacter(items);
        return metro ? `Top metro: ${metro}` : character ? `Lead character: ${character}` : "";
      }),
      signalRead: counts.sectorCounts[1]
        ? `${sectorLead[0]} leads industry exposure, followed by ${counts.sectorCounts[1][0]}.`
        : `${sectorLead[0] || "Industry exposure"} leads the current industry table.`,
    },
    "Top Investment Focuses": {
      leadLabel: focusLead[0],
      leadCount: focusLead[1],
      leadDetail: `${percent(focusLead[1], total)}% of the current index`,
      rowContext: rowContext(counts.focusCounts, (label, index) => {
        if (index === 0) return "Most common investment focus";
        const sector = leadSector(byFocus(label));
        return sector ? `Lead industry: ${sector}` : "";
      }),
      signalRead: counts.focusCounts[1]
        ? `${focusLead[0]} and ${counts.focusCounts[1][0]} are the strongest investment focuses in the current index.`
        : `${focusLead[0] || "Investment focus"} leads the current focus table.`,
    },
    "Top Company Participant Profiles": {
      leadLabel: accessLead[0],
      leadCount: accessLead[1],
      leadDetail: accessSecond ? `No. 2: ${accessSecond[0]} (${eventCountLabel(accessSecond[1])})` : undefined,
      rowContext: rowContext(accessCounts, (label, index) => {
        if (/limited issuer access/i.test(label)) return "Corporate access not clearly indicated";
        if (index === 0) return "Most common company participant profile";
        const character = leadCharacter(byAccess(label));
        return character ? `Lead character: ${character}` : `Share of index: ${percent(accessCounts[index]?.[1] || 0, total)}%`;
      }),
      signalRead: accessLead[1] && accessSecond?.[1] && Math.abs(accessLead[1] - accessSecond[1]) <= 5
        ? `The top two company participant profiles are nearly even in the current index.`
        : `${accessLead[0] || "The leading company participant profile"} accounts for ${eventCountLabel(accessLead[1])}.`,
    },
  };
}

function buildLeaderboardWindow(events: DiscoveryEvent[], days: 30 | 60 | 90): LeaderboardWindowAnalytics {
  const startDate = dateKeyForOffset(0);
  const endDate = dateKeyForOffset(days - 1);
  const windowEvents = events.filter((event) => {
    const eventStart = event.startDate.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(eventStart) && eventStart >= startDate && eventStart <= endDate;
  });
  const cityCounts = ranked(windowEvents.map(cityValue));
  const organizerCounts = ranked(windowEvents.map((event) => event.organizer));
  const sectorCounts = ranked(windowEvents.flatMap(sectorLabels));
  const focusCounts = ranked(windowEvents.flatMap(focusLabels));
  const eventCharacterCounts = ranked(windowEvents.flatMap((event) => splitCsv(event.eventFeatures || "")));
  const issuerParticipationCounts = ranked(windowEvents.flatMap((event) => splitCsv(event.companyParticipants || "")));
  const leaderboardContext = buildLeaderboardContext(windowEvents, { cityCounts, organizerCounts, sectorCounts, focusCounts, eventCharacterCounts, issuerParticipationCounts });
  return { total: windowEvents.length, startDate, endDate, cityCounts, organizerCounts, sectorCounts, focusCounts, eventCharacterCounts, issuerParticipationCounts, leaderboardContext };
}

function eventText(event: DiscoveryEvent) {
  return [event.conferenceType, event.industry, event.investmentFocus, event.targetAudience, event.companyParticipants, event.eventFeatures, event.accessModel, event.marketCap]
    .filter(Boolean)
    .join(", ")
    .toLowerCase();
}

function eventIsInvestorHeavy(event: DiscoveryEvent) {
  const conferenceTypes = splitCsv(event.conferenceType || "").map((value) => value.toLowerCase());
  const targetAudiences = splitCsv(event.targetAudience || "").map((value) => value.toLowerCase());
  return conferenceTypes.includes("allocator / manager forum") ||
    targetAudiences.some((value) => ["institutional investors / asset managers", "family offices", "allocators / pensions / endowments"].includes(value));
}

function eventHasNoIssuer(event: DiscoveryEvent) {
  return /no issuer participation|without issuer participation|issuer not participating/i.test(eventText(event));
}

function eventHasIssuerAccess(event: DiscoveryEvent) {
  const conferenceTypes = splitCsv(event.conferenceType || "").map((value) => value.toLowerCase());
  const features = splitCsv(event.eventFeatures || "").map((value) => value.toLowerCase());
  const participants = splitCsv(event.companyParticipants || "").map((value) => value.toLowerCase());
  const hasIssuerType = conferenceTypes.some((value) => value === "issuer access conference" || value === "sell-side / corporate access");
  const hasStructuredFeature = features.some((value) => value === "company presentations" || value === "1x1 meetings");
  const hasPublicCompanyParticipant = participants.some((value) => value === "public company executives" || value === "public company ir / corporate access");
  return !eventHasNoIssuer(event) && (hasIssuerType || (hasStructuredFeature && hasPublicCompanyParticipant));
}

const structuredAccessLabels = ["Company Presentations", "1x1 Meetings"];

function structuredAccessValues(event: DiscoveryEvent) {
  const values = splitCsv(event.eventFeatures || "");
  return structuredAccessLabels.filter((label) => values.some((value) => value.toLowerCase() === label.toLowerCase()));
}

function eventIsDealMaking(event: DiscoveryEvent) {
  const conferenceTypes = splitCsv(event.conferenceType || "").map((value) => value.toLowerCase());
  const features = splitCsv(event.eventFeatures || "").map((value) => value.toLowerCase());
  const participants = splitCsv(event.companyParticipants || "").map((value) => value.toLowerCase());
  const hasPrivateParticipant = participants.some((value) => [
    "private company founders / executives",
    "private / portfolio company management",
    "project developers / sponsors",
  ].includes(value));
  return conferenceTypes.includes("private markets / deal-making") ||
    features.includes("partnering / deal-making") ||
    (features.includes("1x1 meetings") && hasPrivateParticipant);
}

function eventIsIssuerHeavy(event: DiscoveryEvent) {
  return eventHasIssuerAccess(event);
}

function cityValue(event: DiscoveryEvent) {
  return [event.city, event.state].filter(Boolean).join(", ");
}

function windowStats(events: DiscoveryEvent[]): MarketWindow {
  const byWeek = new Map<string, DiscoveryEvent[]>();
  events.forEach((event) => {
    const week = weekStart(event.startDate);
    if (!week) return;
    const items = byWeek.get(week) || [];
    items.push(event);
    byWeek.set(week, items);
  });
  const best = Array.from(byWeek.entries()).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))[0];
  if (!best) return { count: 0, bestWeek: { weekStart: "", count: 0 }, bestWeekCity: { city: "N/A" }, bestWeekCities: [] };
  const cities = ranked(best[1].map(cityValue));
  return {
    count: events.length,
    bestWeek: { weekStart: best[0], count: best[1].length },
    bestWeekCity: { city: cities[0]?.[0] || "N/A" },
    bestWeekCities: cities.slice(0, 3).map(([city]) => city),
  };
}

function buildMarketViewAnalytics(events: DiscoveryEvent[]): MarketViewAnalytics {
  const cityCounts = ranked(events.map(cityValue));
  const organizerCounts = ranked(events.map((event) => event.organizer));
  const themeCounts = ranked(events.flatMap((event) => splitCsv(event.industry || "")));
  const focusCounts = ranked(events.flatMap((event) => {
    return splitCsv(event.investmentFocus || "");
  }));
  const categoryCounts = ranked(events.map((event) => event.conferenceType || ""));
  const formatCounts = ranked(events.map((event) => event.format));
  const sectorCounts = ranked(events.flatMap((event) => splitCsv(event.industry || "")));
  const audienceCounts = ranked(events.flatMap((event) => unique([
    ...splitCsv(event.targetAudience || ""),
    ...splitCsv(event.companyParticipants || ""),
    ...splitCsv(event.eventFeatures || ""),
    ...splitCsv(event.accessModel || ""),
  ]).filter((value) => /(institutional investors?|family offices?|private equity|venture capital|retail investors?|public company|issuer|mixed participation|company presentations|1x1|one-on-one|industry networking|public markets|private markets)/i.test(value))));
  const eventCharacterCounts = ranked(events.flatMap((event) => splitCsv(event.eventFeatures || "")));
  const issuerParticipationCounts = ranked(events.flatMap((event) => splitCsv(event.companyParticipants || "")));
  const leaderboardContext = buildLeaderboardContext(events, { cityCounts, organizerCounts, sectorCounts, focusCounts, eventCharacterCounts, issuerParticipationCounts });
  const leaderboardWindows = {
    "30": buildLeaderboardWindow(events, 30),
    "60": buildLeaderboardWindow(events, 60),
    "90": buildLeaderboardWindow(events, 90),
  };
  const verificationStatusCounts = ranked(events.map((event) => event.verificationStatus || ""));
  const weeks = new Map<string, number>();
  const months = new Map<string, number>();
  events.forEach((event) => {
    const week = weekStart(event.startDate);
    if (week) weeks.set(week, (weeks.get(week) || 0) + 1);
    const date = new Date(`${event.startDate}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      months.set(month, (months.get(month) || 0) + 1);
    }
  });
  const weekCounts = Array.from(weeks.entries()).map(([weekStart, count]) => ({ weekStart, count })).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const monthCounts = Array.from(months.entries()).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));
  const issuerAccess = events.filter(eventHasIssuerAccess);
  const institutional = events.filter(eventIsInvestorHeavy);
  const mixed = events.filter((event) => eventHasIssuerAccess(event) && eventIsInvestorHeavy(event));
  const presentation = events.filter((event) => splitCsv(event.eventFeatures || "").some((value) => value.toLowerCase() === "company presentations"));
  const oneOnOne = events.filter((event) => splitCsv(event.eventFeatures || "").some((value) => value.toLowerCase() === "1x1 meetings"));
  const organizerCityMap = new Map<string, Set<string>>();
  events.forEach((event) => {
    const organizer = event.organizer.trim();
    const city = cityValue(event);
    if (!organizer || !city) return;
    const cities = organizerCityMap.get(organizer) || new Set<string>();
    cities.add(city);
    organizerCityMap.set(organizer, cities);
  });
  const mostGeographicOrganizer = Array.from(organizerCityMap.entries())
    .map(([organizer, cities]) => ({ organizer, cities: cities.size }))
    .sort((a, b) => b.cities - a.cities || a.organizer.localeCompare(b.organizer))[0] || null;
  const focusIntelligence = focusCounts.slice(0, 5).map(([label, count]) => {
    const matches = events.filter((event) => {
      return splitCsv(event.investmentFocus || "").includes(label);
    });
    const window = windowStats(matches);
    return { label, count, topCity: window.bestWeekCity.city, peakWeek: window.bestWeek, issuerAccessCount: matches.filter(eventHasIssuerAccess).length };
  });
  const sectorWindows = sectorCounts.slice(0, 4).map(([sector, count]) => {
    const matches = events.filter((event) => {
      return splitCsv(event.industry || "").includes(sector);
    });
    const window = windowStats(matches);
    return { sector, count, peakWeek: window.bestWeek, topCity: window.bestWeekCity.city, topCities: window.bestWeekCities, issuerAccessCount: matches.filter(eventHasIssuerAccess).length, investorHeavyCount: matches.filter(eventIsInvestorHeavy).length };
  });
  const weekInsights: MarketViewAnalytics["weekInsights"] = {};
  weekCounts.forEach(({ weekStart: week }) => {
    const weekEvents = events.filter((event) => weekStart(event.startDate) === week);
    const cities = ranked(weekEvents.map(cityValue));
    const audiences = ranked(weekEvents.flatMap((event) => splitCsv(event.targetAudience || "")));
    const focuses = ranked(weekEvents.flatMap((event) => splitCsv(event.investmentFocus || "")));
    const participation = ranked(weekEvents.flatMap((event) => splitCsv(event.companyParticipants || "")));
    const investorHeavyCount = weekEvents.filter(eventIsInvestorHeavy).length;
    const issuerHeavyCount = weekEvents.filter(eventIsIssuerHeavy).length;
    const topCity = cities[0]?.[0] || "N/A";
    const topCities = cities.slice(0, 3).map(([city]) => city);
    const typeLabel = investorHeavyCount > issuerHeavyCount && investorHeavyCount > 0
      ? "Investor-heavy"
      : issuerHeavyCount > 0
        ? "Issuer-heavy"
        : cities[0]?.[1] >= 2
          ? `${topCity.split(",")[0]} cluster`
          : focuses[0]?.[0] ? `${focuses[0][0]} focus` : "Active week";
    const actionLine = investorHeavyCount && topCity !== "N/A"
      ? `${audiences[0]?.[0] || "Investor"} activity is clustering across ${topCities.join(", ")}.`
      : issuerHeavyCount && topCity !== "N/A"
        ? `Issuer-access activity is strongest across ${topCities.join(", ")}.`
        : focuses[0]?.[0] && topCity !== "N/A"
          ? `${focuses[0][0]} activity is clustering across ${topCities.join(", ")}.`
          : topCity !== "N/A" ? `Conference activity is concentrated across ${topCities.join(", ")}.` : "Use this week to plan outreach, travel, and meeting density.";
    weekInsights[week] = { topAudience: audiences[0]?.[0] || "", topFocus: focuses[0]?.[0] || "", topIssuerParticipation: participation[0]?.[0] || "", topCity, topCities, investorHeavyCount, issuerHeavyCount, typeLabel, actionLine };
  });
  const verifiedCount = events.filter((event) => /verified|approved|reviewed/i.test(event.verificationStatus || "")).length;
  const websiteApprovedCount = events.filter((event) => /approved/i.test(event.websiteApproval || "")).length;
  const eventCharacterCoverage = events.filter((event) => splitCsv(event.eventCharacter || "").length > 0).length;
  const venueCount = events.filter((event) => Boolean(event.venue.trim())).length;
  const eventLinkCount = events.filter((event) => Boolean(event.website.trim() || event.sourcePage?.trim())).length;
  const formatTaggedCount = events.filter((event) => Boolean(event.format.trim())).length;
  const dealMakingEvents = events.filter(eventIsDealMaking);
  const structuredAccessEvents = events.filter((event) => structuredAccessValues(event).length > 0);
  const dealMakingWithAccess = dealMakingEvents.filter((event) => structuredAccessValues(event).length > 0);
  const dealSource = events.filter((event) => eventIsDealMaking(event) || structuredAccessValues(event).length > 0);
  const accessBreakdown = structuredAccessLabels.map((label) => ({
    label,
    count: events.filter((event) => structuredAccessValues(event).includes(label)).length,
  }));
  const accessTypeRows = [
    ...accessBreakdown,
    { label: "Partnering / Deal-Making", count: dealMakingEvents.length },
    { label: "Company Participants + Allocators", count: mixed.length },
    { label: "No Corporate Access Signal", count: events.filter((event) => !eventHasIssuerAccess(event)).length },
  ];
  const dealCityMap = new Map<string, DiscoveryEvent[]>();
  const dealWeekMap = new Map<string, DiscoveryEvent[]>();
  dealSource.forEach((event) => {
    const city = cityValue(event);
    if (city) dealCityMap.set(city, [...(dealCityMap.get(city) || []), event]);
    const week = weekStart(event.startDate);
    if (week) dealWeekMap.set(week, [...(dealWeekMap.get(week) || []), event]);
  });
  const dealCities = Array.from(dealCityMap.entries()).map(([city, items]) => {
    const dealItems = items.filter(eventIsDealMaking);
    const accessItems = items.filter((event) => structuredAccessValues(event).length > 0);
    return { city, dealMakingEvents: dealItems.length, structuredAccessEvents: accessItems.length, combinedEvents: items.length, topWeek: windowStats(items).bestWeek };
  }).sort((a, b) => b.combinedEvents - a.combinedEvents || a.city.localeCompare(b.city)).slice(0, 6);
  const dealWeeks = Array.from(dealWeekMap.entries()).map(([weekStart, items]) => ({
    weekStart,
    dealMakingEvents: items.filter(eventIsDealMaking).length,
    structuredAccessEvents: items.filter((event) => structuredAccessValues(event).length > 0).length,
    combinedEvents: items.length,
    cities: ranked(items.map(cityValue)).slice(0, 3).map(([city]) => city),
  })).sort((a, b) => b.combinedEvents - a.combinedEvents || a.weekStart.localeCompare(b.weekStart)).slice(0, 6);
  const dealExamples = dealSource.slice().sort((a, b) => {
    const priority = (item: DiscoveryEvent) => structuredAccessValues(item).length + (eventIsDealMaking(item) ? 1 : 0);
    return priority(b) - priority(a) || a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title);
  }).slice(0, 4).map((event) => ({
    id: event.id, title: event.title, startDate: event.startDate, endDate: event.endDate, city: event.city, state: event.state,
    organizer: event.organizer, issuerParticipation: event.companyParticipants || "", audience: event.targetAudience || "", eventCharacter: event.eventFeatures || "", sectorThemes: event.industry || "", marketFocus: event.investmentFocus || "",
  }));
  const monthMovement = buildMonthMovement(events);
  return {
    total: events.length, cityCounts, organizerCounts, themeCounts, focusCounts, categoryCounts, formatCounts, sectorCounts, audienceCounts, eventCharacterCounts, issuerParticipationCounts, verificationStatusCounts, weekCounts, monthCounts, monthMovement, leaderboardContext, leaderboardWindows,
    statesCount: new Set(events.map((event) => event.state).filter(Boolean)).size,
    citiesCount: new Set(events.map(cityValue).filter(Boolean)).size,
    organizersCount: new Set(events.map((event) => event.organizer).filter(Boolean)).size,
    themesCount: new Set(events.flatMap((event) => splitCsv(event.industry || ""))).size,
    issuerAccessCount: issuerAccess.length,
    issuerOnlyCount: issuerAccess.filter((event) => !eventIsInvestorHeavy(event)).length,
    noIssuerCount: events.filter(eventHasNoIssuer).length,
    institutionalCount: institutional.length,
    investorOnlyCount: institutional.filter((event) => !eventHasIssuerAccess(event)).length,
    mixedCount: mixed.length,
    presentationCount: presentation.length,
    oneOnOneCount: oneOnOne.length,
    presentationAndOneOnOneCount: events.filter((event) => eventHasIssuerAccess(event) && structuredAccessValues(event).length >= 2).length,
    issuerWindow: windowStats(issuerAccess), institutionalWindow: windowStats(institutional), sectorWindows, focusIntelligence,
    topRegion: ranked(events.map((event) => event.region))[0]?.[0] || "",
    canadaCount: events.filter((event) => /canada/i.test(event.country)).length,
    usCount: events.filter((event) => /united states|usa|us/i.test(event.country) || (!event.country && event.state)).length,
    organizerInvestorHeavy: ranked(institutional.map((event) => event.organizer))[0]?.[0] || "",
    organizerIssuerAccess: ranked(issuerAccess.map((event) => event.organizer))[0]?.[0] || "",
    mostGeographicOrganizer, verifiedCount, websiteApprovedCount, eventCharacterCoverage,
    coverageMetrics: [
      { label: "Investment Focus tagged", count: events.filter((event) => splitCsv(event.investmentFocus || "").length > 0).length },
      { label: "Industry tagged", count: events.filter((event) => splitCsv(event.industry || "").length > 0).length },
      { label: "Company Participants tagged", count: events.filter((event) => Boolean((event.companyParticipants || "").trim())).length },
      { label: "Format tagged", count: formatTaggedCount },
      { label: "Character tagged", count: eventCharacterCoverage },
      { label: "Venue listed", count: venueCount },
      { label: "Event link live", count: eventLinkCount },
      { label: "Verified / reviewed", count: verifiedCount },
      { label: "Website approved", count: websiteApprovedCount },
    ],
    venueCount, eventLinkCount, formatTaggedCount, weekInsights,
    dealClientPulse: {
      dealMakingEvents: dealMakingEvents.length,
      structuredAccessEvents: structuredAccessEvents.length,
      dealMakingWithAccess: dealMakingWithAccess.length,
      accessBreakdown: accessTypeRows,
      audienceCounts: ranked(events.flatMap((event) => splitCsv(event.audience))),
      topWeek: windowStats(dealSource).bestWeek,
      topCities: ranked(dealSource.map(cityValue)).slice(0, 3),
      examples: dealExamples,
    },
    dealLocations: { cities: dealCities, weeks: dealWeeks },
  };
}

function aggregate(events: DiscoveryEvent[]): DiscoveryAggregateStats {
  const participationText = (event: DiscoveryEvent) => [
    event.conferenceType,
    event.industry,
    event.investmentFocus,
    event.targetAudience,
    event.companyParticipants,
    event.eventFeatures,
    event.accessModel,
    event.marketCap,
  ].filter(Boolean).join(", ").toLowerCase();
  const isInvestorHeavy = (event: DiscoveryEvent) =>
    eventIsInvestorHeavy(event);
  const hasIssuerAccess = (event: DiscoveryEvent) => {
    return eventHasIssuerAccess(event);
  };
  const weekCounts = new Map<string, number>();
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const upcoming30End = todayUtc + 30 * 86_400_000;

  events.forEach((event) => {
    const start = new Date(`${event.startDate}T00:00:00Z`);
    const timestamp = start.getTime();
    if (!Number.isFinite(timestamp) || timestamp < todayUtc) return;
    const day = start.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setUTCDate(start.getUTCDate() + mondayOffset);
    const weekStart = start.toISOString().slice(0, 10);
    weekCounts.set(weekStart, (weekCounts.get(weekStart) || 0) + 1);
  });

  const rankedWeeks = Array.from(weekCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const highestWeek = rankedWeeks[0];
  const lowestWeek = rankedWeeks.slice().sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0];
  const hotWeekCount = Array.from(weekCounts.values()).filter((count) => count >= 8).length;
  const sectorCounts = new Map<string, number>();
  events.forEach((event) => {
    const sectors = splitCsv(event.industry || "");
    sectors.forEach((sector) => sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1));
  });
  const leadingSector = Array.from(sectorCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  const formatWeek = (week: [string, number]) => {
    const start = new Date(`${week[0]}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}–${end.toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" })}`;
  };
  const dealWeekCounts = new Map<string, number>();
  events
    .filter(eventIsDealMaking)
    .forEach((event) => {
      const start = new Date(`${event.startDate}T00:00:00Z`);
      const timestamp = start.getTime();
      if (!Number.isFinite(timestamp) || timestamp < todayUtc) return;
      const day = start.getUTCDay();
      start.setUTCDate(start.getUTCDate() + (day === 0 ? -6 : 1 - day));
      const week = start.toISOString().slice(0, 10);
      dealWeekCounts.set(week, (dealWeekCounts.get(week) || 0) + 1);
    });
  const mostActiveDealWeek = Array.from(dealWeekCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  const dated = events.filter((event) => event.startDate).slice().sort((a, b) => a.startDate.localeCompare(b.startDate));
  const verificationStamps = unique(events.map((event) => event.verificationStamp?.slice(0, 10) || "")).sort((a, b) => a.localeCompare(b));

  return {
    events: events.length,
    organizers: new Set(events.map((event) => event.organizer).filter(Boolean)).size,
    states: new Set(events.map((event) => event.state).filter(Boolean)).size,
    cities: new Set(events.map((event) => [event.city, event.state].filter(Boolean).join(", ")).filter(Boolean)).size,
    themes: new Set(events.flatMap((event) => splitCsv(event.industry || ""))).size,
    focus: new Set(events.flatMap((event) => splitCsv(event.investmentFocus || ""))).size,
    investorHeavy: events.filter(isInvestorHeavy).length,
    issuerAccess: events.filter(hasIssuerAccess).length,
    verified: events.filter((event) => /verified|approved|reviewed/i.test(event.verificationStatus || "") || /approved|appoved/i.test(event.websiteApproval || "")).length,
    hotWeeks: hotWeekCount,
    highestActivityWeek: highestWeek
      ? {
          label: formatWeek(highestWeek),
          count: highestWeek[1],
        }
      : null,
    lowestActivityWeek: lowestWeek ? { label: formatWeek(lowestWeek), count: lowestWeek[1] } : null,
    leadingSector: leadingSector ? { label: leadingSector[0], count: leadingSector[1] } : null,
    mostActiveDealWeek: mostActiveDealWeek ? { label: formatWeek(mostActiveDealWeek), count: mostActiveDealWeek[1] } : null,
    earliestDate: dated[0]?.startDate || null,
    latestDate: dated[dated.length - 1]?.endDate || dated[dated.length - 1]?.startDate || null,
    latestVerificationStamp: verificationStamps[verificationStamps.length - 1] || null,
    quickFeeds: {
      investorConferences: events.filter((event) => `${event.conferenceType} ${event.targetAudience}`.toLowerCase().includes("investor")).length,
      healthcareConferences: events.filter((event) => (event.industry || "").toLowerCase().includes("health")).length,
      privateMarkets: events.filter((event) => `${event.conferenceType} ${event.investmentFocus}`.toLowerCase().includes("private")).length,
      canadaEvents: events.filter((event) => event.country.toLowerCase() === "canada").length,
      upcoming30: events.filter((event) => {
        const timestamp = new Date(`${event.startDate}T00:00:00Z`).getTime();
        return Number.isFinite(timestamp) && timestamp >= todayUtc && timestamp <= upcoming30End;
      }).length,
      hotWeeks: hotWeekCount,
    },
  };
}

function decodeCursor(cursor?: string | null) {
  if (!cursor) return 0;
  try {
    const value = Number(Buffer.from(cursor, "base64url").toString("utf8"));
    return Number.isInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function encodeCursor(index: number) {
  return Buffer.from(String(index), "utf8").toString("base64url");
}

function hasAnyMatch(values: string[], candidates: string[]) {
  return values.length === 0 || values.some((value) => candidates.includes(value));
}

function hasSelectedFilterMatches(values: string[], candidates: string[]) {
  return values.length > 0 && values.some((value) => candidates.includes(value));
}

function filterEvents(events: InternalDiscoveryEvent[], query: DiscoveryQuery) {
  const today = new Date();
  const todayTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = query.dateRange === "next30" ? 30 : query.dateRange === "next60" ? 60 : query.dateRange === "next90" ? 90 : 3650;
  const maxTime = todayTime + days * 86400000;
  const hasExplicitDateWindow = Boolean(query.fromDate || query.toDate);
  const futureOnly = (query.dateRange || "all") === "all" && !hasExplicitDateWindow;
  const search = (query.q || "").trim().toLowerCase();
  const ids = new Set(query.eventIds || []);
  const useOrFilters = query.filterMode === "or";

  return events.filter((event) => {
    const startTime = new Date(`${event.startDate}T00:00:00Z`).getTime();
    if (!Number.isFinite(startTime)) return false;
    if (query.dateRange && query.dateRange !== "all" && (startTime < todayTime || startTime > maxTime)) return false;
    if (futureOnly && startTime < todayTime) return false;
    if (query.fromDate && event.startDate < query.fromDate) return false;
    if (query.toDate && event.startDate > query.toDate) return false;

    const conferenceTypeCandidates = splitCsv(event.conferenceType || "");
    const industryCandidates = splitCsv(event.industry || "");
    const investmentFocusCandidates = splitCsv(event.investmentFocus || "");
    const targetAudienceCandidates = splitCsv(event.targetAudience || "");
    const companyParticipantCandidates = splitCsv(event.companyParticipants || "");
    const eventFeatureCandidates = splitCsv(event.eventFeatures || "");
    const accessModelCandidates = splitCsv(event.accessModel || "");
    const marketCapCandidates = splitCsv(event.marketCap || "");
    const cityLabel = [event.city, event.state].filter(Boolean).join(", ");
    const selectedLocationGroups = [
      query.country || [],
      query.region || [],
      query.state || [],
      query.cities || [],
    ];
    const hasSelectedLocationFilters = selectedLocationGroups.some((values) => values.length > 0);
    const matchesAnySelectedLocation =
      !hasSelectedLocationFilters ||
      hasSelectedFilterMatches(query.country || [], [event.country]) ||
      hasSelectedFilterMatches(query.region || [], [event.region]) ||
      hasSelectedFilterMatches(query.state || [], [event.state]) ||
      hasSelectedFilterMatches(query.cities || [], [cityLabel]);

    if (useOrFilters) {
      const selectedFilterGroups = [
        query.country || [],
        query.region || [],
        query.state || [],
        query.cities || [],
        query.conferenceType || [],
        query.issuerParticipation || [],
        query.targetAudience || [],
        query.companyParticipants || [],
        query.eventFeatures || [],
        query.accessModel || [],
        query.marketCap || [],
        query.organizer || [],
        query.marketFocus || [],
        query.sectorThemes || [],
      ];
      const hasSelectedFilters = selectedFilterGroups.some((values) => values.length > 0);
      const matchesAnySelectedFilter =
        !hasSelectedFilters ||
        hasSelectedFilterMatches(query.country || [], [event.country]) ||
        hasSelectedFilterMatches(query.region || [], [event.region]) ||
        hasSelectedFilterMatches(query.state || [], [event.state]) ||
        hasSelectedFilterMatches(query.cities || [], [cityLabel]) ||
        hasSelectedFilterMatches(query.conferenceType || [], conferenceTypeCandidates) ||
        hasSelectedFilterMatches(query.issuerParticipation || [], companyParticipantCandidates) ||
        hasSelectedFilterMatches(query.targetAudience || [], targetAudienceCandidates) ||
        hasSelectedFilterMatches(query.companyParticipants || [], companyParticipantCandidates) ||
        hasSelectedFilterMatches(query.eventFeatures || [], eventFeatureCandidates) ||
        hasSelectedFilterMatches(query.accessModel || [], accessModelCandidates) ||
        hasSelectedFilterMatches(query.marketCap || [], marketCapCandidates) ||
        hasSelectedFilterMatches(query.organizer || [], [event.organizer]) ||
        hasSelectedFilterMatches(query.marketFocus || [], investmentFocusCandidates) ||
        hasSelectedFilterMatches(query.publicCompanySectors || [], industryCandidates) ||
        hasSelectedFilterMatches(query.sectorThemes || [], industryCandidates);
      if (!matchesAnySelectedFilter) return false;
    } else {
      if (!matchesAnySelectedLocation) return false;
      if (!hasAnyMatch(query.conferenceType || [], conferenceTypeCandidates)) return false;
      if (!hasAnyMatch(query.issuerParticipation || [], companyParticipantCandidates)) return false;
      if (!hasAnyMatch(query.targetAudience || [], targetAudienceCandidates)) return false;
      if (!hasAnyMatch(query.companyParticipants || [], companyParticipantCandidates)) return false;
      if (!hasAnyMatch(query.eventFeatures || [], eventFeatureCandidates)) return false;
      if (!hasAnyMatch(query.accessModel || [], accessModelCandidates)) return false;
      if (!hasAnyMatch(query.marketCap || [], marketCapCandidates)) return false;
      if (!hasAnyMatch(query.organizer || [], [event.organizer])) return false;
      if (!hasAnyMatch(query.marketFocus || [], investmentFocusCandidates)) return false;
      if (!hasAnyMatch(query.publicCompanySectors || [], industryCandidates)) return false;
      if (!hasAnyMatch(query.sectorThemes || [], industryCandidates)) return false;
    }
    if (ids.size && !ids.has(event.id)) return false;
    if (!search) return true;
    return [event.title, event.organizer, event.city, event.state, event.conferenceType, event.industry, event.investmentFocus, event.targetAudience, event.companyParticipants, event.eventFeatures, event.accessModel, event.marketCap, event.format]
      .join(" ")
      .toLowerCase()
      .includes(search);
  }).sort((a, b) => {
    if (query.sort === "city") return [a.city, a.startDate, a.title].join("|").localeCompare([b.city, b.startDate, b.title].join("|"));
    return a.startDate === b.startDate ? a.title.localeCompare(b.title) : a.startDate.localeCompare(b.startDate);
  });
}

function toPublicEvent(event: InternalDiscoveryEvent): DiscoveryEvent {
  const {
    classificationEvidence,
    eventIntelligenceProfile,
    organizerPositioningSummary,
    promotionalClaims,
    notes,
    createdAt,
    lastModifiedAt,
    ...publicEvent
  } = event;
  void [classificationEvidence, eventIntelligenceProfile, organizerPositioningSummary, promotionalClaims, notes, createdAt, lastModifiedAt];
  return publicEvent;
}

async function buildMarketViewIntelligenceWithInternal(events: InternalDiscoveryEvent[]): Promise<MarketViewIntelligenceWithInternal> {
  const [{ buildMarketViewIntelligence }, { buildInternalMarketIntelligence }] = await Promise.all([
    import("./marketViewIntelligence"),
    import("./internalMarketIntelligence"),
  ]);

  return {
    ...buildMarketViewIntelligence(events),
    internalIntelligence: buildInternalMarketIntelligence(events),
  };
}

export async function getDiscoveryPage(
  query: DiscoveryQuery = {},
  options: { includeMarketAnalytics?: boolean; includeMarketViewIntelligence?: boolean } = {}
): Promise<DiscoveryPage> {
  const approvedEvents = await fetchApprovedEvents();
  const filtered = filterEvents(approvedEvents, query);
  const limit = Math.min(Math.max(query.limit || 30, 1), 30);
  const start = decodeCursor(query.cursor);
  const nextIndex = start + limit;
  const page: Omit<DiscoveryPage, "marketAnalytics" | "allMarketAnalytics" | "marketViewIntelligence" | "allMarketViewIntelligence"> &
    Partial<Pick<DiscoveryPage, "marketAnalytics" | "allMarketAnalytics" | "marketViewIntelligence" | "allMarketViewIntelligence">> = {
    events: filtered.slice(start, nextIndex).map(toPublicEvent),
    total: filtered.length,
    nextCursor: nextIndex < filtered.length ? encodeCursor(nextIndex) : null,
    filterOptions: buildFilterOptions(approvedEvents),
    aggregates: aggregate(filtered),
    allAggregates: aggregate(approvedEvents),
  };

  if (options.includeMarketAnalytics !== false) {
    page.marketAnalytics = buildMarketViewAnalytics(filtered);
    page.allMarketAnalytics = buildMarketViewAnalytics(approvedEvents);
  }

  if (options.includeMarketViewIntelligence !== false) {
    page.marketViewIntelligence = await buildMarketViewIntelligenceWithInternal(filtered);
    page.allMarketViewIntelligence = await buildMarketViewIntelligenceWithInternal(approvedEvents);
  }

  return page as DiscoveryPage;
}
