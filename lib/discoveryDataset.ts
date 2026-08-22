import "server-only";
import { buildMarketViewIntelligence, type MarketViewIntelligence } from "./marketViewIntelligence";

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

export type DiscoveryFilterOptions = {
  cities: string[];
  regions: string[];
  countries: string[];
  states: string[];
  themes: string[];
  publicCompanySectors: string[];
  conferenceTypes: string[];
  issuers: string[];
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
  marketViewIntelligence: MarketViewIntelligence;
  allMarketViewIntelligence: MarketViewIntelligence;
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
  organizer?: string[];
  marketFocus?: string[];
  eventIds?: string[];
  sort?: "soonest" | "city";
  filterMode?: "and" | "or";
};

type AirtableRecord = { id: string; fields: Record<string, unknown> };

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
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
  const normalized = toText(fields[approvalKey]).toLowerCase().replace(/\s+/g, "");
  return (normalized.includes("approved") || normalized.includes("appoved")) &&
    !/(notapproved|unapproved|pending|rejected)/.test(normalized);
}

function mapRecord(record: AirtableRecord): DiscoveryEvent {
  const fields = record.fields || {};
  const startDate = cleanDateOnly(fields["Start Date"]);
  return {
    id: record.id,
    title: toText(fields["Event Name"]) || "Untitled Event",
    eventSeries: toText(fields["Event Series"]),
    startDate,
    endDate: cleanDateOnly(fields["End Date"] || fields["Start Date"]),
    city: toText(fields["City"]),
    state: toText(fields["State/Province"]),
    country: toText(fields["Country"]),
    venue: toText(fields["Venue Name"]),
    website: firstText(fields, ["Event Website", "Website", "Event Link", "Conference URL"]),
    sourcePage: firstText(fields, ["Source Page (event-specific)", "Source Page", "Source URL"]),
    organizer: toText(fields["Organizer Name (from Organizer)"]),
    primaryCategory: toText(fields["Primary Category"]),
    marketFocus: toText(fields["Market Focus"]),
    sectorThemes: toText(fields["Sector / Themes"]) || toText(fields["Sector / Theme"]),
    issuerParticipation: toText(fields["Issuer Participation"]),
    audience: toText(fields["Audience"]),
    region: toText(fields["Region"]),
    format: toText(fields["Format"]),
    publicCompanySector: toText(fields["Public Company Sector"]),
    additionalPublicCompanySectors: toText(fields["Additional Public Company Sectors"]),
    eventCharacter: toText(fields["Event Character"]),
    organizerType: toText(fields["Organizer Type / Type from Organizer"]) || toText(fields["Type from Organizer"]),
    verificationStatus: toText(fields["Verification Status"]),
    dataCompletenessScore: toText(fields["Data Completeness Score copy"]) || toText(fields["Data Completeness Score"]),
    websiteApproval: toText(fields["Website Approval"]),
    verificationStamp: firstText(fields, ["Latest Verification Date", "Last Verified", "Verification Date", "Verified At", "Reviewed At"]),
  };
}

async function fetchApprovedEvents(): Promise<DiscoveryEvent[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const token = process.env.AIRTABLE_TOKEN;
  if (!baseId || !tableName || !token) throw new Error("Missing Airtable environment variables.");

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
        const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
        url.searchParams.set("pageSize", "100");
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
    themes: unique(events.flatMap((event) => splitCsv(event.sectorThemes))),
    publicCompanySectors: unique(events.flatMap((event) => [
      ...splitCsv(event.publicCompanySector || ""),
      ...splitCsv(event.additionalPublicCompanySectors || ""),
    ])),
    conferenceTypes: unique(events.map((event) => event.primaryCategory)),
    issuers: unique(events.map((event) => event.issuerParticipation)),
    organizers: unique(events.map((event) => event.organizer)),
    marketFocuses: unique(events.flatMap((event) => splitCsv(event.marketFocus))),
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

function eventText(event: DiscoveryEvent) {
  return [event.issuerParticipation, event.primaryCategory, event.marketFocus, event.sectorThemes, event.publicCompanySector, event.additionalPublicCompanySectors, event.eventCharacter]
    .filter(Boolean)
    .join(", ")
    .toLowerCase();
}

function eventIsInvestorHeavy(event: DiscoveryEvent) {
  return /(institutional investors|investor conference|investor-heavy|family office|private equity|venture capital|lp\/gp|investor access|retail investors)/i.test(eventText(event));
}

function eventHasNoIssuer(event: DiscoveryEvent) {
  return /no issuer participation|without issuer participation|issuer not participating/i.test(eventText(event));
}

function eventHasIssuerAccess(event: DiscoveryEvent) {
  return !eventHasNoIssuer(event) && /(company presentations|public company presentations|presentations \+ 1x1 meetings|1x1 meetings only|1x1 meetings|one-on-one|issuer participation|mixed participation|public company|issuer access|roadshow)/i.test(eventText(event));
}

const structuredAccessLabels = ["Presentations + 1x1 Meetings", "1x1 Meetings Only", "Company Presentations"];

function structuredAccessValues(event: DiscoveryEvent) {
  const values = splitCsv(event.issuerParticipation);
  return structuredAccessLabels.filter((label) => values.some((value) => value.toLowerCase() === label.toLowerCase()));
}

function eventIsDealMaking(event: DiscoveryEvent) {
  return splitCsv(event.eventCharacter || "").some((value) => value.toLowerCase() === "deal-making and partnering");
}

function eventIsIssuerHeavy(event: DiscoveryEvent) {
  return !eventHasNoIssuer(event) && /(public company|issuer participation|company presentations|presentations \+ 1x1 meetings|1x1 meetings|public markets|micro-cap|small-cap|issuer-heavy)/i.test(eventText(event));
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
  const themeCounts = ranked(events.flatMap((event) => splitCsv(event.sectorThemes)));
  const focusCounts = ranked(events.flatMap((event) => {
    const values = splitCsv(event.marketFocus);
    return values.length ? values : splitCsv(event.sectorThemes);
  }));
  const categoryCounts = ranked(events.map((event) => event.primaryCategory));
  const formatCounts = ranked(events.map((event) => event.format));
  const sectorCounts = ranked(events.flatMap((event) => {
    const sectors = splitCsv(event.publicCompanySector || "");
    return sectors.length ? sectors : splitCsv(event.sectorThemes);
  }));
  const audienceCounts = ranked(events.flatMap((event) => unique([
    ...splitCsv(event.issuerParticipation),
    ...splitCsv(event.marketFocus),
    ...splitCsv(event.primaryCategory),
  ]).filter((value) => /(institutional investors?|family offices?|private equity|venture capital|retail investors?|public company|issuer|mixed participation|company presentations|1x1|one-on-one|industry networking|public markets|private markets)/i.test(value))));
  const eventCharacterCounts = ranked(events.flatMap((event) => splitCsv(event.eventCharacter || "")));
  const issuerParticipationCounts = ranked(events.flatMap((event) => splitCsv(event.issuerParticipation)));
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
  const mixed = events.filter((event) => /mixed participation|mixed|presentations \+ 1x1 meetings/i.test(eventText(event)) || (eventHasIssuerAccess(event) && eventIsInvestorHeavy(event)));
  const presentation = events.filter((event) => /company presentations|public company presentations|presentations/i.test(event.issuerParticipation));
  const oneOnOne = events.filter((event) => /1x1|1×1|one-on-one|one on one/i.test(event.issuerParticipation));
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
      const focus = splitCsv(event.marketFocus);
      return focus.length ? focus.includes(label) : splitCsv(event.sectorThemes).includes(label);
    });
    const window = windowStats(matches);
    return { label, count, topCity: window.bestWeekCity.city, peakWeek: window.bestWeek, issuerAccessCount: matches.filter(eventHasIssuerAccess).length };
  });
  const sectorWindows = sectorCounts.slice(0, 4).map(([sector, count]) => {
    const matches = events.filter((event) => {
      const labels = splitCsv(event.publicCompanySector || "");
      return (labels.length ? labels : splitCsv(event.sectorThemes)).includes(sector);
    });
    const window = windowStats(matches);
    return { sector, count, peakWeek: window.bestWeek, topCity: window.bestWeekCity.city, topCities: window.bestWeekCities, issuerAccessCount: matches.filter(eventHasIssuerAccess).length, investorHeavyCount: matches.filter(eventIsInvestorHeavy).length };
  });
  const weekInsights: MarketViewAnalytics["weekInsights"] = {};
  weekCounts.forEach(({ weekStart: week }) => {
    const weekEvents = events.filter((event) => weekStart(event.startDate) === week);
    const cities = ranked(weekEvents.map(cityValue));
    const audiences = ranked(weekEvents.flatMap((event) => splitCsv(event.issuerParticipation)));
    const focuses = ranked(weekEvents.flatMap((event) => splitCsv(event.marketFocus)));
    const participation = ranked(weekEvents.flatMap((event) => splitCsv(event.issuerParticipation)));
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
    { label: "Deal-Making and Partnering", count: dealMakingEvents.length },
    { label: "Mixed Participation", count: events.filter((event) => splitCsv(event.issuerParticipation).some((value) => value.toLowerCase() === "mixed participation")).length },
    { label: "No Issuer Participation", count: events.filter((event) => splitCsv(event.issuerParticipation).some((value) => value.toLowerCase() === "no issuer participation")).length },
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
    organizer: event.organizer, issuerParticipation: event.issuerParticipation, audience: event.audience, eventCharacter: event.eventCharacter || "", sectorThemes: event.sectorThemes, marketFocus: event.marketFocus,
  }));
  return {
    total: events.length, cityCounts, organizerCounts, themeCounts, focusCounts, categoryCounts, formatCounts, sectorCounts, audienceCounts, eventCharacterCounts, issuerParticipationCounts, verificationStatusCounts, weekCounts, monthCounts,
    statesCount: new Set(events.map((event) => event.state).filter(Boolean)).size,
    citiesCount: new Set(events.map(cityValue).filter(Boolean)).size,
    organizersCount: new Set(events.map((event) => event.organizer).filter(Boolean)).size,
    themesCount: new Set(events.flatMap((event) => splitCsv(event.sectorThemes))).size,
    issuerAccessCount: issuerAccess.length,
    issuerOnlyCount: issuerAccess.filter((event) => !eventIsInvestorHeavy(event)).length,
    noIssuerCount: events.filter(eventHasNoIssuer).length,
    institutionalCount: institutional.length,
    investorOnlyCount: institutional.filter((event) => !eventHasIssuerAccess(event)).length,
    mixedCount: mixed.length,
    presentationCount: presentation.length,
    oneOnOneCount: oneOnOne.length,
    presentationAndOneOnOneCount: events.filter((event) => /presentations \+ 1x1 meetings/i.test(event.issuerParticipation)).length,
    issuerWindow: windowStats(issuerAccess), institutionalWindow: windowStats(institutional), sectorWindows, focusIntelligence,
    topRegion: ranked(events.map((event) => event.region))[0]?.[0] || "",
    canadaCount: events.filter((event) => /canada/i.test(event.country)).length,
    usCount: events.filter((event) => /united states|usa|us/i.test(event.country) || (!event.country && event.state)).length,
    organizerInvestorHeavy: ranked(institutional.map((event) => event.organizer))[0]?.[0] || "",
    organizerIssuerAccess: ranked(issuerAccess.map((event) => event.organizer))[0]?.[0] || "",
    mostGeographicOrganizer, verifiedCount, websiteApprovedCount, eventCharacterCoverage,
    coverageMetrics: [
      { label: "Market focus tagged", count: events.filter((event) => splitCsv(event.marketFocus).length > 0).length },
      { label: "Sector tagged", count: events.filter((event) => splitCsv(event.publicCompanySector || "").length > 0 || splitCsv(event.sectorThemes).length > 0).length },
      { label: "Issuer tagged", count: events.filter((event) => Boolean(event.issuerParticipation.trim())).length },
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
    event.issuerParticipation,
    event.primaryCategory,
    event.marketFocus,
    event.sectorThemes,
    event.publicCompanySector,
    event.additionalPublicCompanySectors,
    event.eventCharacter,
  ].filter(Boolean).join(", ").toLowerCase();
  const isInvestorHeavy = (event: DiscoveryEvent) =>
    /(institutional investors|investor conference|investor-heavy|family office|private equity|venture capital|lp\/gp|investor access|retail investors)/i.test(participationText(event));
  const hasIssuerAccess = (event: DiscoveryEvent) => {
    const text = participationText(event);
    return !/no issuer participation|without issuer participation|issuer not participating/i.test(text) &&
      /(company presentations|public company presentations|presentations \+ 1x1 meetings|1x1 meetings only|1x1 meetings|one-on-one|issuer participation|mixed participation|public company|issuer access|roadshow)/i.test(text);
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
    const sectors = splitCsv(event.publicCompanySector || "").length
      ? splitCsv(event.publicCompanySector || "")
      : splitCsv(event.sectorThemes);
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
    .filter((event) => splitCsv(event.eventCharacter || "").some((value) => value.toLowerCase() === "deal-making and partnering"))
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
    themes: new Set(events.flatMap((event) => splitCsv(event.sectorThemes))).size,
    focus: new Set(events.flatMap((event) => splitCsv(event.marketFocus))).size,
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
      investorConferences: events.filter((event) => event.primaryCategory.toLowerCase().includes("investor")).length,
      healthcareConferences: events.filter((event) => event.sectorThemes.toLowerCase().includes("health")).length,
      privateMarkets: events.filter((event) => event.marketFocus.toLowerCase().includes("private")).length,
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

function filterEvents(events: DiscoveryEvent[], query: DiscoveryQuery) {
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

    const publicCompanySectorCandidates = [
      ...splitCsv(event.publicCompanySector || ""),
      ...splitCsv(event.additionalPublicCompanySectors || ""),
    ];
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
        query.organizer || [],
        query.marketFocus || [],
        query.publicCompanySectors || [],
        query.sectorThemes || [],
      ];
      const hasSelectedFilters = selectedFilterGroups.some((values) => values.length > 0);
      const matchesAnySelectedFilter =
        !hasSelectedFilters ||
        hasSelectedFilterMatches(query.country || [], [event.country]) ||
        hasSelectedFilterMatches(query.region || [], [event.region]) ||
        hasSelectedFilterMatches(query.state || [], [event.state]) ||
        hasSelectedFilterMatches(query.cities || [], [cityLabel]) ||
        hasSelectedFilterMatches(query.conferenceType || [], [event.primaryCategory]) ||
        hasSelectedFilterMatches(query.issuerParticipation || [], splitCsv(event.issuerParticipation)) ||
        hasSelectedFilterMatches(query.organizer || [], [event.organizer]) ||
        hasSelectedFilterMatches(query.marketFocus || [], splitCsv(event.marketFocus)) ||
        hasSelectedFilterMatches(query.publicCompanySectors || [], publicCompanySectorCandidates) ||
        hasSelectedFilterMatches(query.sectorThemes || [], splitCsv(event.sectorThemes));
      if (!matchesAnySelectedFilter) return false;
    } else {
      if (!matchesAnySelectedLocation) return false;
      if (!hasAnyMatch(query.conferenceType || [], [event.primaryCategory])) return false;
      if (!hasAnyMatch(query.issuerParticipation || [], splitCsv(event.issuerParticipation))) return false;
      if (!hasAnyMatch(query.organizer || [], [event.organizer])) return false;
      if (!hasAnyMatch(query.marketFocus || [], splitCsv(event.marketFocus))) return false;
      if (!hasAnyMatch(query.publicCompanySectors || [], publicCompanySectorCandidates)) return false;
      if (!hasAnyMatch(query.sectorThemes || [], splitCsv(event.sectorThemes))) return false;
    }
    if (ids.size && !ids.has(event.id)) return false;
    if (!search) return true;
    return [event.title, event.organizer, event.city, event.state, event.primaryCategory, event.marketFocus, event.sectorThemes]
      .join(" ")
      .toLowerCase()
      .includes(search);
  }).sort((a, b) => {
    if (query.sort === "city") return [a.city, a.startDate, a.title].join("|").localeCompare([b.city, b.startDate, b.title].join("|"));
    return a.startDate === b.startDate ? a.title.localeCompare(b.title) : a.startDate.localeCompare(b.startDate);
  });
}

export async function getDiscoveryPage(query: DiscoveryQuery = {}): Promise<DiscoveryPage> {
  const approvedEvents = await fetchApprovedEvents();
  const filtered = filterEvents(approvedEvents, query);
  const limit = Math.min(Math.max(query.limit || 30, 1), 30);
  const start = decodeCursor(query.cursor);
  const nextIndex = start + limit;
  return {
    events: filtered.slice(start, nextIndex),
    total: filtered.length,
    nextCursor: nextIndex < filtered.length ? encodeCursor(nextIndex) : null,
    filterOptions: buildFilterOptions(approvedEvents),
    aggregates: aggregate(filtered),
    allAggregates: aggregate(approvedEvents),
    marketAnalytics: buildMarketViewAnalytics(filtered),
    allMarketAnalytics: buildMarketViewAnalytics(approvedEvents),
    marketViewIntelligence: buildMarketViewIntelligence(filtered),
    allMarketViewIntelligence: buildMarketViewIntelligence(approvedEvents),
  };
}
