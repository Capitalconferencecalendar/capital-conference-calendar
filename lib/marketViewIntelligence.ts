export type MarketViewEventInput = {
  id?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  state?: string;
  country?: string;
  venue?: string;
  website?: string;
  sourcePage?: string;
  organizer?: string;
  eventSeries?: string;
  primaryCategory?: string;
  marketFocus?: string;
  sectorThemes?: string;
  issuerParticipation?: string;
  audience?: string;
  region?: string;
  format?: string;
  publicCompanySector?: string;
  additionalPublicCompanySectors?: string;
  eventCharacter?: string;
  organizerType?: string;
  verificationStatus?: string;
  dataCompletenessScore?: string;
  websiteApproval?: string;
  verificationStamp?: string;
};

export type MarketViewIntelligenceOptions = {
  asOfDate?: string;
  upcomingDays?: number;
};

type CountRow = { label: string; count: number };
type WeekRange = { weekKey: string; weekStart: string; weekEnd: string; label: string };
type ScoredEvent = MarketViewEventInput & {
  intelligenceId: string;
  dealAccessScore: number;
};

type TopDealAccessEvent = {
  title: string;
  date: string;
  city: string;
  state: string;
  organizer: string;
  marketFocus: string;
  issuerParticipation: string;
  eventCharacter: string;
  publicCompanySector: string;
  dealAccessScore: number;
  website: string;
};

export type WeeklyIntensityRow = WeekRange & {
  totalEvents: number;
  cityCount: number;
  topCities: string[];
  issuerAccessEvents: number;
  investorHeavyEvents: number;
  structuredAccessEvents: number;
  dealMakingEvents: number;
  companyPresentationEvents: number;
  oneOnOneEvents: number;
  averageDealAccessScore: number;
  topMarketFocus: string;
  topSector: string;
  topEventCharacter: string;
  topEventCharacterShare: number;
  topPublicCompanySector: string;
  topPublicCompanySectorShare: number;
  topOrganizer: string;
  topCity: string;
  seasonLanguage: string;
  intensityScore: number;
  readThrough: string;
};

type RankedWeek = WeeklyIntensityRow & {
  primaryReason: string;
  planningInterpretation: string;
  planningHorizon: string;
  daysFromNow: number;
  relativeMonthRank: number;
  relativeWindowRank: number;
  planningAdjustedScore: number;
};

type WindowRow = WeekRange & {
  count: number;
  shareOfWeekActivity: number;
  topCity: string;
  topOrganizer: string;
  topSector: string;
  topMarketFocus: string;
  interpretation: string;
};

type SectorMomentumRow = {
  sector: string;
  currentMonthCount: number;
  previousMonthCount: number;
  countChange: number;
  percentChange: number | null;
  currentQuarterCount: number;
  previousQuarterCount: number;
  nextUpcomingEvent: {
    title: string;
    date: string;
    city: string;
    state: string;
  } | null;
  issuerAccessCount: number;
  investorHeavyCount: number;
};

type OrganizerLeagueRow = {
  rank: number;
  organizer: string;
  totalEvents: number;
  issuerAccessEvents: number;
  investorHeavyEvents: number;
  structuredAccessEvents: number;
  dealMakingEvents: number;
  averageDealAccessScore: number;
  citiesCount: number;
  nextEventTitle: string;
  nextEventDate: string;
  nextEventCity: string;
};

type GeographyCityRow = {
  city: string;
  state: string;
  totalEvents: number;
  issuerAccessEvents: number;
  investorHeavyEvents: number;
  structuredAccessEvents: number;
  dealMakingEvents: number;
  averageDealAccessScore: number;
  topMarketFocus: string;
  topSector: string;
  nextEvent: { title: string; date: string } | null;
};

export type MarketViewIntelligence = {
  coverage: {
    rawEventCount: number;
    dedupedEventCount: number;
    duplicateSuppressionCount: number;
  };
  landscapeSnapshot: {
    totalEvents: number;
    dateRange: { earliestDate: string; latestDate: string };
    organizersCount: number;
    citiesCount: number;
    statesCount: number;
    marketFocusCount: number;
    publicCompanySectorCount: number;
    eventCharacterCount: number;
    topMarketFocus: string;
    topSector: string;
    topOrganizer: string;
    topCity: string;
    seasonLanguage: string;
  };
  accessAndDealIntelligence: {
    summary: {
      issuerAccessCount: number;
      investorHeavyCount: number;
      structuredAccessCount: number;
      dealMakingCount: number;
      companyPresentationCount: number;
      oneOnOneCount: number;
      noIssuerParticipationCount: number;
      mixedParticipationCount: number;
      averageDealAccessScore: number;
      topDealAccessEvents: TopDealAccessEvent[];
      interpretation: {
        headline: string;
        readThrough: string;
        caveat: string;
      };
    };
  };
  weeklyIntensity: WeeklyIntensityRow[];
  seasonPulse: {
    currentSeasonLanguage: string;
    strongestSeasonLanguage: string;
    monthlyCounts: CountRow[];
    interpretation: string;
  };
  hotWeeks: { top: RankedWeek[] };
  coldWeeks: { top: RankedWeek[] };
  clusterWeeks: {
    top: Array<{
      city: string;
      state: string;
      metroMarket: string;
      anchorCity: string;
      cityRole: string;
      travelRelationship: string;
      clusterType: string;
      dateWindow: string;
      startDate: string;
      endDate: string;
      eventCount: number;
      cityCount: number;
      events: string[];
      eventDetails: Array<{ id: string; title: string; startDate: string; city: string; state: string }>;
      dominantMarketFocus: string;
      dominantSector: string;
      topEventCharacter: string;
      sharedSignals: string[];
      issuerAccessCount: number;
      investorHeavyCount: number;
      structuredAccessCount: number;
      dealMakingCount: number;
      clusterScore: number;
      specificityScore: number;
      relativeMetroDensity: number;
      relativeLabel: string;
      planningHorizon: string;
      daysFromNow: number;
      planningAdjustedScore: number;
      interpretation: string;
    }>;
  };
  issuerAccessWindows: WindowRow[];
  investorHeavyWindows: WindowRow[];
  structuredAccessWindows: WindowRow[];
  dealMakingWindows: WindowRow[];
  publicCompanySectorMomentum: {
    available: boolean;
    reason: string;
    interpretation: string;
    rows: SectorMomentumRow[];
  };
  marketFocusConcentration: {
    classifiedEventCount: number;
    classifiedSignalCount: number;
    top3Share: number;
    top5Share: number;
    hhiScore: number;
    concentrationLabel: "diversified market" | "concentrated market" | "heavily concentrated market";
    rows: Array<{
      marketFocus: string;
      count: number;
      shareOfClassifiedSignals: number;
      issuerAccessCount: number;
      investorHeavyCount: number;
      structuredAccessCount: number;
      dealMakingCount: number;
      leadingWeek: string;
      leadingCity: string;
      interpretation: string;
    }>;
  };
  eventCharacterMix: {
    classifiedEventCount: number;
    rows: Array<{
      eventCharacter: string;
      count: number;
      shareOfClassifiedEvents: number;
      issuerAccessCount: number;
      investorHeavyCount: number;
      averageDealAccessScore: number;
      interpretation: string;
    }>;
  };
  organizerLeagueTables: {
    interpretations: {
      overallVolume: string;
      issuerAccess: string;
      investorHeavy: string;
      structuredAccess: string;
      dealAccess: string;
      upcoming30Days: string;
      geographicBreadth: string;
    };
    overallVolume: OrganizerLeagueRow[];
    issuerAccess: OrganizerLeagueRow[];
    investorHeavy: OrganizerLeagueRow[];
    structuredAccess: OrganizerLeagueRow[];
    dealAccess: OrganizerLeagueRow[];
    upcoming30Days: OrganizerLeagueRow[];
    geographicBreadth: OrganizerLeagueRow[];
  };
  geographyClusters: {
    topCitiesByTotalEvents: GeographyCityRow[];
    topCitiesByIssuerAccess: GeographyCityRow[];
    topCitiesByInvestorHeavyEvents: GeographyCityRow[];
    topCitiesByDealAccessScore: GeographyCityRow[];
    topRegions: CountRow[];
  };
  dataReadiness: {
    fields: Array<{ field: string; populatedCount: number; coveragePct: number }>;
    strongestFields: string[];
    weakestFields: string[];
    recommendedCaveats: string[];
  };
  notes: string[];
};

const GENERIC_TITLE_WORDS = new Set(["conference", "summit", "expo", "forum", "symposium"]);
const STRUCTURED_ACCESS_LABELS = ["presentations + 1x1 meetings", "1x1 meetings only", "company presentations"];

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
}

function splitValues(value: unknown): string[] {
  return text(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeComparable(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !GENERIC_TITLE_WORDS.has(word))
    .join(" ")
    .trim();
}

function dedupeKey(event: MarketViewEventInput): string {
  return [normalizeComparable(text(event.title)), normalizeComparable(text(event.city)), text(event.startDate)]
    .join("|")
    .trim();
}

function eventText(event: MarketViewEventInput): string {
  return [
    event.issuerParticipation,
    event.eventCharacter,
    event.marketFocus,
    event.primaryCategory,
    event.format,
    event.publicCompanySector,
    event.additionalPublicCompanySectors,
    event.sectorThemes,
  ]
    .map(text)
    .filter(Boolean)
    .join(", ")
    .toLowerCase();
}

export function isIssuerAccessEvent(event: MarketViewEventInput): boolean {
  const haystack = eventText(event);
  if (/no issuer participation|without issuer participation|issuer not participating/i.test(haystack)) return false;
  return /(company presentations|public company presentations|presentations \+ 1x1 meetings|1x1 meetings only|1x1 meetings|one-on-one|issuer participation|mixed participation|public company|issuer access|roadshow)/i.test(haystack);
}

export function isInvestorHeavyEvent(event: MarketViewEventInput): boolean {
  return /(institutional investors|investor conference|investor-heavy|family office|private equity|venture capital|lp\/gp|investor access|retail investors)/i.test(eventText(event));
}

export function isStructuredAccessEvent(event: MarketViewEventInput): boolean {
  const values = splitValues(event.issuerParticipation).map((value) => value.toLowerCase());
  return values.some((value) => STRUCTURED_ACCESS_LABELS.includes(value));
}

export function isDealMakingEvent(event: MarketViewEventInput): boolean {
  return splitValues(event.eventCharacter).some((value) => value.toLowerCase() === "deal-making and partnering");
}

export function isCompanyPresentationEvent(event: MarketViewEventInput): boolean {
  return /company presentations|public company presentations|presentations \+ 1x1 meetings/i.test(text(event.issuerParticipation));
}

export function isOneOnOneEvent(event: MarketViewEventInput): boolean {
  return /1x1|1×1|one-on-one|one on one|presentations \+ 1x1 meetings/i.test(text(event.issuerParticipation));
}

function hasNoIssuerParticipation(event: MarketViewEventInput): boolean {
  return /no issuer participation|without issuer participation|issuer not participating/i.test(eventText(event));
}

function hasMixedParticipation(event: MarketViewEventInput): boolean {
  return /mixed participation|mixed|presentations \+ 1x1 meetings/i.test(eventText(event)) || (isIssuerAccessEvent(event) && isInvestorHeavyEvent(event));
}

export function getPrimarySector(event: MarketViewEventInput): string {
  return getAllSectors(event)[0] || "";
}

export function getAllSectors(event: MarketViewEventInput): string[] {
  const sectors = unique([
    ...splitValues(event.publicCompanySector),
    ...splitValues(event.additionalPublicCompanySectors),
  ]);
  return sectors.length ? sectors : splitValues(event.sectorThemes);
}

export function getMarketFocusValues(event: MarketViewEventInput): string[] {
  return splitValues(event.marketFocus);
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getWeekKey(date: string): string {
  const parsed = parseDate(date);
  if (!parsed) return "";
  const day = parsed.getUTCDay();
  parsed.setUTCDate(parsed.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return isoDate(parsed);
}

export function getWeekRange(date: string): WeekRange {
  const weekStart = getWeekKey(date);
  if (!weekStart) return { weekKey: "", weekStart: "", weekEnd: "", label: "" };
  const start = parseDate(weekStart);
  if (!start) return { weekKey: "", weekStart: "", weekEnd: "", label: "" };
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return {
    weekKey: weekStart,
    weekStart,
    weekEnd: isoDate(end),
    label: `${formatMonthDay(weekStart)}-${formatMonthDay(isoDate(end))}`,
  };
}

function formatMonthDay(value: string): string {
  const parsed = parseDate(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function monthKey(value: string | undefined): string {
  const parsed = parseDate(value);
  if (!parsed) return "";
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`;
}

function quarterKey(value: string | undefined): string {
  const parsed = parseDate(value);
  if (!parsed) return "";
  return `${parsed.getUTCFullYear()}-Q${Math.floor(parsed.getUTCMonth() / 3) + 1}`;
}

function addDays(value: string, days: number): string {
  const parsed = parseDate(value);
  if (!parsed) return value;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return isoDate(parsed);
}

function daysBetween(from: string, to: string): number {
  const start = parseDate(from);
  const end = parseDate(to);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function previousMonthKey(value: string): string {
  const parsed = parseDate(`${value}-01`);
  if (!parsed) return "";
  parsed.setUTCMonth(parsed.getUTCMonth() - 1);
  return monthKey(isoDate(parsed));
}

function previousQuarterKey(value: string): string {
  const [yearRaw, quarterRaw] = value.split("-Q");
  const year = Number(yearRaw);
  const quarter = Number(quarterRaw);
  if (!Number.isFinite(year) || !Number.isFinite(quarter)) return "";
  return quarter === 1 ? `${year - 1}-Q4` : `${year}-Q${quarter - 1}`;
}

function countBy(values: string[]): CountRow[] {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function pct(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function cityLabel(event: MarketViewEventInput): string {
  return [event.city, event.state].map(text).filter(Boolean).join(", ");
}

function cityStateKey(event: MarketViewEventInput): string {
  return [text(event.city).toLowerCase(), text(event.state).toLowerCase()].filter(Boolean).join("|");
}

const METRO_MARKETS: Record<string, { metroMarket: string; anchorCity: string; core: string[]; adjacent: string[]; regional: string[] }> = {
  "new-york": {
    metroMarket: "New York Metro",
    anchorCity: "New York, NY",
    core: ["new york|ny"],
    adjacent: ["brooklyn|ny", "jersey city|nj", "hoboken|nj", "newark|nj", "stamford|ct", "white plains|ny", "greenwich|ct"],
    regional: ["long island|ny", "princeton|nj", "morristown|nj"],
  },
  "bay-area": {
    metroMarket: "Bay Area",
    anchorCity: "San Francisco, CA",
    core: ["san francisco|ca"],
    adjacent: ["south san francisco|ca", "palo alto|ca", "menlo park|ca", "redwood city|ca", "san mateo|ca", "oakland|ca", "berkeley|ca", "san jose|ca"],
    regional: ["santa clara|ca", "sunnyvale|ca", "mountain view|ca"],
  },
  "boston": {
    metroMarket: "Boston Metro",
    anchorCity: "Boston, MA",
    core: ["boston|ma"],
    adjacent: ["cambridge|ma", "somerville|ma", "waltham|ma", "newton|ma"],
    regional: ["worcester|ma", "providence|ri"],
  },
  "los-angeles": {
    metroMarket: "Los Angeles Metro",
    anchorCity: "Los Angeles, CA",
    core: ["los angeles|ca"],
    adjacent: ["beverly hills|ca", "santa monica|ca", "pasadena|ca", "glendale|ca", "long beach|ca", "irvine|ca", "anaheim|ca"],
    regional: ["newport beach|ca", "san diego|ca"],
  },
  "dallas-fort-worth": {
    metroMarket: "Dallas-Fort Worth",
    anchorCity: "Dallas, TX",
    core: ["dallas|tx"],
    adjacent: ["fort worth|tx", "irving|tx", "plano|tx", "frisco|tx", "arlington|tx"],
    regional: ["addison|tx"],
  },
  "chicago": {
    metroMarket: "Chicago Metro",
    anchorCity: "Chicago, IL",
    core: ["chicago|il"],
    adjacent: ["rosemont|il", "evanston|il", "oak brook|il", "schaumburg|il"],
    regional: ["naperville|il"],
  },
  "washington": {
    metroMarket: "Washington DC Metro",
    anchorCity: "Washington, DC",
    core: ["washington|dc"],
    adjacent: ["arlington|va", "alexandria|va", "bethesda|md", "tysons|va", "mclean|va"],
    regional: ["baltimore|md"],
  },
  "miami": {
    metroMarket: "Miami-South Florida",
    anchorCity: "Miami, FL",
    core: ["miami|fl"],
    adjacent: ["miami beach|fl", "coral gables|fl", "fort lauderdale|fl", "boca raton|fl", "hollywood|fl"],
    regional: ["west palm beach|fl", "palm beach|fl"],
  },
  "toronto": {
    metroMarket: "Toronto Metro",
    anchorCity: "Toronto, ON",
    core: ["toronto|on"],
    adjacent: ["mississauga|on", "markham|on", "vaughan|on"],
    regional: ["hamilton|on"],
  },
};

function metroInfo(event: MarketViewEventInput) {
  const key = cityStateKey(event);
  for (const metro of Object.values(METRO_MARKETS)) {
    if (metro.core.includes(key)) {
      return { metroMarket: metro.metroMarket, anchorCity: metro.anchorCity, cityRole: "Core City", travelRelationship: "Anchor-city cluster" };
    }
    if (metro.adjacent.includes(key)) {
      return { metroMarket: metro.metroMarket, anchorCity: metro.anchorCity, cityRole: "Metro Adjacent", travelRelationship: "Same-trip practical" };
    }
    if (metro.regional.includes(key)) {
      return { metroMarket: metro.metroMarket, anchorCity: metro.anchorCity, cityRole: "Regional", travelRelationship: "May require separate leg" };
    }
  }
  const label = cityLabel(event);
  return { metroMarket: label, anchorCity: label, cityRole: "Core City", travelRelationship: "Exact-city cluster" };
}

function planningHorizonForDate(startDate: string, asOfDate: string): { planningHorizon: string; daysFromNow: number; weight: number } {
  const daysFromNow = daysBetween(asOfDate, startDate);
  if (daysFromNow < 0) return { planningHorizon: "Historical readout", daysFromNow, weight: 0.55 };
  if (daysFromNow <= 14) return { planningHorizon: "Immediate readout", daysFromNow, weight: 0.85 };
  if (daysFromNow <= 29) return { planningHorizon: "Near-term planning", daysFromNow, weight: 1.0 };
  if (daysFromNow <= 90) return { planningHorizon: "Planning window", daysFromNow, weight: 1.28 };
  if (daysFromNow <= 180) return { planningHorizon: "Forward emerging", daysFromNow, weight: 1.12 };
  return { planningHorizon: "Early forward signal", daysFromNow, weight: 0.9 };
}

function seasonLanguageForWeek(weekStart: string, totalEvents: number, medianEvents: number): string {
  const parsed = parseDate(weekStart);
  if (!parsed) return "Quiet conference window";
  const month = parsed.getUTCMonth() + 1;
  const dense = totalEvents >= medianEvents;
  if (month === 9) return dense ? "Fall conference season in full swing" : "Fall conference season ramp-up";
  if (month === 10 || month === 11) return "Fall conference season in full swing";
  if (month === 3) return dense ? "Spring conference season in full swing" : "Spring conference season ramp-up";
  if (month === 4 || month === 5) return "Spring conference season in full swing";
  if (month >= 6 && month <= 8) return "Summer conference window";
  if (month === 12) return "Year-end conference window";
  if (month === 1) return "Quiet conference window";
  return "Shoulder season";
}

function isActiveConferenceSeason(weekStart: string): boolean {
  const parsed = parseDate(weekStart);
  if (!parsed) return false;
  const month = parsed.getUTCMonth() + 1;
  return (month >= 3 && month <= 5) || (month >= 9 && month <= 11);
}

function weekContainsDate(weekStart: string, monthIndex: number, day: number): boolean {
  const start = parseDate(weekStart);
  if (!start) return false;
  const target = new Date(Date.UTC(start.getUTCFullYear(), monthIndex, day));
  return target >= start && target <= parseDate(addDays(weekStart, 6))!;
}

function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, occurrence: number): Date {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  const offset = (weekday - date.getUTCDay() + 7) % 7;
  date.setUTCDate(1 + offset + ((occurrence - 1) * 7));
  return date;
}

function lastWeekdayOfMonth(year: number, monthIndex: number, weekday: number): Date {
  const date = new Date(Date.UTC(year, monthIndex + 1, 0));
  const offset = (date.getUTCDay() - weekday + 7) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return date;
}

function dateFallsInWeek(target: Date, weekStart: string): boolean {
  const start = parseDate(weekStart);
  const end = parseDate(addDays(weekStart, 6));
  return Boolean(start && end && target >= start && target <= end);
}

export function isMajorHolidayWeek(weekStart: string): boolean {
  const start = parseDate(weekStart);
  if (!start) return false;
  const year = start.getUTCFullYear();
  return (
    weekContainsDate(weekStart, 0, 1) ||
    weekContainsDate(weekStart, 6, 4) ||
    weekContainsDate(weekStart, 11, 25) ||
    dateFallsInWeek(nthWeekdayOfMonth(year, 10, 4, 4), weekStart) ||
    dateFallsInWeek(nthWeekdayOfMonth(year, 8, 1, 1), weekStart) ||
    dateFallsInWeek(lastWeekdayOfMonth(year, 4, 1), weekStart)
  );
}

function calculateDealAccessScore(event: MarketViewEventInput): number {
  let score = 0;
  const issuer = text(event.issuerParticipation).toLowerCase();
  if (isStructuredAccessEvent(event)) score += 30;
  if (isDealMakingEvent(event)) score += 25;
  if (issuer.includes("presentations + 1x1 meetings")) score += 20;
  if (issuer.includes("1x1 meetings only")) score += 18;
  if (issuer.includes("company presentations")) score += 15;
  if (isIssuerAccessEvent(event)) score += 15;
  if (isInvestorHeavyEvent(event)) score += 10;
  if (splitValues(event.publicCompanySector).length || splitValues(event.additionalPublicCompanySectors).length) score += 5;
  return Math.min(score, 100);
}

function topLabel(values: string[], fallback = ""): string {
  return countBy(values)[0]?.label || fallback;
}

function eventSort(a: MarketViewEventInput, b: MarketViewEventInput): number {
  return text(a.startDate).localeCompare(text(b.startDate)) || text(a.title).localeCompare(text(b.title));
}

function mapTopDealEvent(event: ScoredEvent): TopDealAccessEvent {
  return {
    title: text(event.title),
    date: text(event.startDate),
    city: text(event.city),
    state: text(event.state),
    organizer: text(event.organizer),
    marketFocus: text(event.marketFocus),
    issuerParticipation: text(event.issuerParticipation),
    eventCharacter: text(event.eventCharacter),
    publicCompanySector: text(event.publicCompanySector),
    dealAccessScore: event.dealAccessScore,
    website: text(event.website),
  };
}

function buildWeeklyReadThrough(row: Omit<WeeklyIntensityRow, "intensityScore" | "readThrough">): string {
  if (!row.totalEvents) {
    return `${row.seasonLanguage} is quiet in the current market view, with no tracked conference supply for this week.`;
  }
  if (row.issuerAccessEvents && row.investorHeavyEvents) {
    return `${row.seasonLanguage}, with issuer-access and institutional investor concentration both visible across the conference universe.`;
  }
  if (row.structuredAccessEvents || row.oneOnOneEvents) {
    return `This is a meeting-driven access window, with structured access and 1x1 activity supporting issuer diligence and institutional coverage.`;
  }
  if (row.companyPresentationEvents) {
    return `This is a presentation-heavy calendar week, suggesting stronger issuer visibility than direct meeting access.`;
  }
  if (row.investorHeavyEvents) {
    return `Investor-heavy activity is present, making the week more useful for sponsor visibility, networking, and market coverage than direct issuer diligence.`;
  }
  return `This week is broad but less access-driven, making it more useful for conference-market coverage and pipeline awareness.`;
}

function buildWeeklyIntensity(events: ScoredEvent[]): WeeklyIntensityRow[] {
  const byWeek = new Map<string, ScoredEvent[]>();
  events.forEach((event) => {
    const week = getWeekKey(text(event.startDate));
    if (!week) return;
    byWeek.set(week, [...(byWeek.get(week) || []), event]);
  });
  const counts = Array.from(byWeek.values()).map((items) => items.length).sort((a, b) => a - b);
  const median = counts[Math.floor(counts.length / 2)] || 1;
  const rows = Array.from(byWeek.entries()).map(([week, items]) => {
    const range = getWeekRange(week);
    const totalEvents = items.length;
    const cities = countBy(items.map(cityLabel));
    const eventCharacters = countBy(items.flatMap((event) => splitValues(event.eventCharacter)));
    const publicCompanySectors = countBy(items.flatMap(getAllSectors));
    const row = {
      ...range,
      totalEvents,
      cityCount: cities.length,
      topCities: cities.slice(0, 3).map((entry) => entry.label),
      issuerAccessEvents: items.filter(isIssuerAccessEvent).length,
      investorHeavyEvents: items.filter(isInvestorHeavyEvent).length,
      structuredAccessEvents: items.filter(isStructuredAccessEvent).length,
      dealMakingEvents: items.filter(isDealMakingEvent).length,
      companyPresentationEvents: items.filter(isCompanyPresentationEvent).length,
      oneOnOneEvents: items.filter(isOneOnOneEvent).length,
      averageDealAccessScore: avg(items.map((event) => event.dealAccessScore)),
      topMarketFocus: topLabel(items.flatMap(getMarketFocusValues)),
      topSector: topLabel(items.map(getPrimarySector)),
      topEventCharacter: eventCharacters[0]?.label || "",
      topEventCharacterShare: totalEvents ? eventCharacters[0]?.count / totalEvents || 0 : 0,
      topPublicCompanySector: publicCompanySectors[0]?.label || "",
      topPublicCompanySectorShare: totalEvents ? publicCompanySectors[0]?.count / totalEvents || 0 : 0,
      topOrganizer: topLabel(items.map((event) => text(event.organizer))),
      topCity: topLabel(items.map(cityLabel)),
      seasonLanguage: seasonLanguageForWeek(week, totalEvents, median),
    };
    return {
      ...row,
      intensityScore: 0,
      readThrough: buildWeeklyReadThrough(row),
    };
  });

  const max = {
    totalEvents: Math.max(...rows.map((row) => row.totalEvents), 1),
    issuerAccessEvents: Math.max(...rows.map((row) => row.issuerAccessEvents), 1),
    investorHeavyEvents: Math.max(...rows.map((row) => row.investorHeavyEvents), 1),
    structuredAccessEvents: Math.max(...rows.map((row) => row.structuredAccessEvents), 1),
    dealMakingEvents: Math.max(...rows.map((row) => row.dealMakingEvents), 1),
    averageDealAccessScore: Math.max(...rows.map((row) => row.averageDealAccessScore), 1),
    topEventCharacterShare: Math.max(...rows.map((row) => row.topEventCharacterShare), 1),
    topPublicCompanySectorShare: Math.max(...rows.map((row) => row.topPublicCompanySectorShare), 1),
  };

  return rows
    .map((row) => ({
      ...row,
      intensityScore: Math.round(
        ((row.totalEvents / max.totalEvents) * 34) +
          ((row.issuerAccessEvents / max.issuerAccessEvents) * 20) +
          ((row.investorHeavyEvents / max.investorHeavyEvents) * 8) +
          ((row.structuredAccessEvents / max.structuredAccessEvents) * 10) +
          ((row.dealMakingEvents / max.dealMakingEvents) * 6) +
          ((row.topEventCharacterShare / max.topEventCharacterShare) * 12) +
          ((row.topPublicCompanySectorShare / max.topPublicCompanySectorShare) * 10)
      ),
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

function reasonForWeek(row: WeeklyIntensityRow): string {
  if (row.structuredAccessEvents || row.dealMakingEvents) return "Deal-access week. Structured meetings, presentations, and partnering signals are concentrated.";
  if (row.issuerAccessEvents >= row.investorHeavyEvents && row.issuerAccessEvents > 0) return "Company-access week. Issuer participation and structured-access signals are elevated.";
  if (row.investorHeavyEvents > 0) return "Investor-heavy week. Stronger for networking and sponsorship visibility than direct issuer access.";
  return "High-volume market week. Conference density is elevated across the tracked landscape.";
}

function coldReasonForWeek(row: WeeklyIntensityRow): string {
  if (row.issuerAccessEvents || row.investorHeavyEvents) {
    return "Cold conference week. Limited issuer-access and investor-heavy activity suggest this is not a natural capital access window.";
  }
  return "White-space week. Activity falls below the active-season baseline, creating room for organizer positioning, targeted outreach, or lower-conflict sponsor visibility.";
}

function rankWithin(rows: WeeklyIntensityRow[], target: WeeklyIntensityRow): number {
  return rows
    .slice()
    .sort((a, b) => b.intensityScore - a.intensityScore || b.totalEvents - a.totalEvents || a.weekStart.localeCompare(b.weekStart))
    .findIndex((row) => row.weekKey === target.weekKey) + 1 || rows.length;
}

function buildRankedWeeks(rows: WeeklyIntensityRow[], cold: boolean, asOfDate: string, allRows: WeeklyIntensityRow[] = rows): RankedWeek[] {
  return rows.map((row) => {
    const horizon = planningHorizonForDate(row.weekStart, asOfDate);
    const monthRows = allRows.filter((candidate) => monthKey(candidate.weekStart) === monthKey(row.weekStart));
    const nearbyRows = allRows.filter((candidate) => Math.abs(daysBetween(row.weekStart, candidate.weekStart)) <= 35);
    const relativeMonthRank = rankWithin(monthRows, row);
    const relativeWindowRank = rankWithin(nearbyRows, row);
    const relativeBonus = cold ? 0 : (
      (relativeMonthRank === 1 ? 18 : relativeMonthRank === 2 ? 10 : relativeMonthRank === 3 ? 5 : 0) +
      (relativeWindowRank === 1 ? 14 : relativeWindowRank === 2 ? 8 : relativeWindowRank === 3 ? 4 : 0)
    );
    const planningAdjustedScore = cold
      ? row.intensityScore
      : Math.round((row.intensityScore * horizon.weight) + relativeBonus);
    const hotInterpretation = `${reasonForWeek(row)} ${row.label} is a ${horizon.planningHorizon.toLowerCase()} signal, ranking #${relativeMonthRank} in its month and #${relativeWindowRank} versus nearby weeks.`;
    return {
      ...row,
      primaryReason: cold ? "Low relative activity inside an active conference season." : reasonForWeek(row),
      planningInterpretation: cold ? coldReasonForWeek(row) : hotInterpretation,
      planningHorizon: horizon.planningHorizon,
      daysFromNow: horizon.daysFromNow,
      relativeMonthRank,
      relativeWindowRank,
      planningAdjustedScore,
    };
  });
}

function buildColdWeekCandidates(allWeeks: WeeklyIntensityRow[]): WeeklyIntensityRow[] {
  const activeSeasonWeeks = allWeeks.filter((row) => isActiveConferenceSeason(row.weekStart) && !isMajorHolidayWeek(row.weekStart));
  const nonHolidayActiveWeeks = activeSeasonWeeks.filter((row) => row.totalEvents > 0);
  const counts = nonHolidayActiveWeeks.map((row) => row.totalEvents).sort((a, b) => a - b);
  if (!activeSeasonWeeks.length) return [];
  const lowerQuartile = counts[Math.floor(counts.length * 0.25)] ?? 0;
  const median = counts[Math.floor(counts.length * 0.5)] ?? 0;
  return activeSeasonWeeks
    .filter((row, index, list) => {
      const prev = list[index - 1]?.totalEvents ?? median;
      const next = list[index + 1]?.totalEvents ?? median;
      const surroundingAverage = (prev + next) / 2;
      const materiallyLower = row.totalEvents <= lowerQuartile || row.totalEvents <= Math.max(1, Math.floor(surroundingAverage * 0.5));
      const usefulSignal = row.totalEvents > 0 || surroundingAverage >= 2 || median >= 2;
      return usefulSignal && materiallyLower;
    })
    .sort((a, b) => a.totalEvents - b.totalEvents || a.intensityScore - b.intensityScore || a.weekStart.localeCompare(b.weekStart))
    .slice(0, 8);
}

function buildWindows(events: ScoredEvent[], weekly: WeeklyIntensityRow[], predicate: (event: ScoredEvent) => boolean, label: string): WindowRow[] {
  const weekTotals = new Map(weekly.map((row) => [row.weekKey, row.totalEvents]));
  const byWeek = new Map<string, ScoredEvent[]>();
  events.filter(predicate).forEach((event) => {
    const week = getWeekKey(text(event.startDate));
    if (!week) return;
    byWeek.set(week, [...(byWeek.get(week) || []), event]);
  });
  return Array.from(byWeek.entries())
    .map(([week, items]) => {
      const range = getWeekRange(week);
      const count = items.length;
      const topSector = topLabel(items.map(getPrimarySector));
      const topMarketFocus = topLabel(items.flatMap(getMarketFocusValues));
      return {
        ...range,
        count,
        shareOfWeekActivity: pct(count, weekTotals.get(week) || count),
        topCity: topLabel(items.map(cityLabel)),
        topOrganizer: topLabel(items.map((event) => text(event.organizer))),
        topSector,
        topMarketFocus,
        interpretation: `${label} activity is concentrated in this week${topSector ? `, led by ${topSector}` : ""}${topMarketFocus ? ` and ${topMarketFocus}` : ""}.`,
      };
    })
    .sort((a, b) => b.count - a.count || a.weekStart.localeCompare(b.weekStart))
    .slice(0, 5);
}

function clusterSignals(items: ScoredEvent[]): string[] {
  const signals: string[] = [];
  const topEventCharacter = countBy(items.flatMap((event) => splitValues(event.eventCharacter)))[0];
  const topPublicCompanySector = countBy(items.flatMap(getAllSectors))[0];
  if (topEventCharacter && topEventCharacter.count >= 2) signals.push(topEventCharacter.label);
  if (topPublicCompanySector && topPublicCompanySector.count >= 2) signals.push(topPublicCompanySector.label);
  if (items.filter(isIssuerAccessEvent).length >= 2) signals.push("Issuer access");
  if (items.filter(isInvestorHeavyEvent).length >= 2) signals.push("Investor-heavy");
  if (items.filter(isStructuredAccessEvent).length >= 2) signals.push("Structured access");
  if (items.filter(isDealMakingEvent).length >= 2) signals.push("Deal-making");
  if (items.filter(isOneOnOneEvent).length >= 2) signals.push("1x1 meetings");
  return signals;
}

function buildClusterWeeks(events: ScoredEvent[], asOfDate: string) {
  const byMetro = new Map<string, ScoredEvent[]>();
  events.forEach((event) => {
    const key = metroInfo(event).metroMarket;
    if (!key) return;
    byMetro.set(key, [...(byMetro.get(key) || []), event]);
  });
  const clusters: MarketViewIntelligence["clusterWeeks"]["top"] = [];
  const signatures = new Set<string>();
  const pushCluster = (clusterType: string, seed: ScoredEvent, start: string, end: string, windowItems: ScoredEvent[], specificityBase: number, metroBaseline: number) => {
    const names = unique(windowItems.map((item) => text(item.title))).filter(Boolean);
    if (names.length < 2) return;
    const metro = metroInfo(seed);
    const cityCounts = countBy(windowItems.map(cityLabel));
    const topCity = cityCounts[0]?.label || cityLabel(seed);
    const [city = text(seed.city), state = text(seed.state)] = topCity.split(",").map((part) => part.trim());
    const issuerAccessCount = windowItems.filter(isIssuerAccessEvent).length;
    const investorHeavyCount = windowItems.filter(isInvestorHeavyEvent).length;
    const structuredAccessCount = windowItems.filter(isStructuredAccessEvent).length;
    const dealMakingCount = windowItems.filter(isDealMakingEvent).length;
    const dominantMarketFocus = topLabel(windowItems.flatMap(getMarketFocusValues));
    const dominantSector = topLabel(windowItems.map(getPrimarySector));
    const topEventCharacter = topLabel(windowItems.flatMap((item) => splitValues(item.eventCharacter)));
    const sharedSignals = clusterSignals(windowItems);
    const horizon = planningHorizonForDate(start, asOfDate);
    const uniqueCities = unique(windowItems.map(cityLabel)).length;
    const relativeMetroDensity = Number((names.length / Math.max(1, metroBaseline)).toFixed(1));
    const relativeLabel = relativeMetroDensity >= 2.5 && names.length >= 3 ? "Regional Surge" : "";
    const cityRole = uniqueCities > 1 ? "Metro Mix" : metro.cityRole;
    const travelRelationship = uniqueCities > 1 && metro.metroMarket !== topCity ? "Same-trip practical" : metro.travelRelationship;
    const specificityScore = Math.min(40, specificityBase + (dominantSector ? 5 : 0) + (topEventCharacter ? 5 : 0) + (dominantMarketFocus ? 3 : 0) + (sharedSignals.length * 4));
    const clusterScore = Math.min(100, Math.round((names.length * 7) + (issuerAccessCount * 7) + (investorHeavyCount * 5) + (structuredAccessCount * 9) + (dealMakingCount * 8) + specificityScore));
    const planningAdjustedScore = Math.round((clusterScore * horizon.weight) + specificityScore + Math.min(35, relativeMetroDensity * 10) + (horizon.planningHorizon === "Planning window" ? 12 : 0));
    const signature = [clusterType, metro.metroMarket, start, end, names.slice().sort().join("|")].join("::");
    if (signatures.has(signature)) return;
    signatures.add(signature);
    clusters.push({
      city,
      state,
      metroMarket: metro.metroMarket,
      anchorCity: metro.anchorCity,
      cityRole,
      travelRelationship,
      clusterType,
      dateWindow: `${formatMonthDay(start)}-${formatMonthDay(end)}`,
      startDate: start,
      endDate: end,
      eventCount: names.length,
      cityCount: uniqueCities,
      events: names,
      eventDetails: windowItems.map((item) => ({ id: text(item.id), title: text(item.title), startDate: text(item.startDate), city: text(item.city), state: text(item.state) })),
      dominantMarketFocus,
      dominantSector,
      topEventCharacter,
      sharedSignals,
      issuerAccessCount,
      investorHeavyCount,
      structuredAccessCount,
      dealMakingCount,
      clusterScore,
      specificityScore,
      relativeMetroDensity,
      relativeLabel,
      planningHorizon: horizon.planningHorizon,
      daysFromNow: horizon.daysFromNow,
      planningAdjustedScore,
      interpretation: `${metro.metroMarket} has a ${clusterType.toLowerCase()} across ${names.length} events in the ${horizon.planningHorizon.toLowerCase()} horizon${uniqueCities > 1 ? `, spanning ${cityCounts.slice(0, 3).map((row) => row.label).join(", ")}` : ""}. ${relativeLabel ? `${relativeLabel} relative to this metro's normal calendar density. ` : ""}${dominantSector || topEventCharacter ? `The shared concentration is ${[topEventCharacter, dominantSector].filter(Boolean).join(" / ")}. ` : ""}${sharedSignals.length ? `Access signals include ${sharedSignals.join(", ")}. ` : ""}${travelRelationship}.`,
    });
  };

  byMetro.forEach((items) => {
    const sorted = items.slice().sort(eventSort);
    const metroWeekCount = new Set(sorted.map((item) => getWeekKey(text(item.startDate))).filter(Boolean)).size;
    const metroBaseline = sorted.length / Math.max(1, metroWeekCount);
    sorted.forEach((event) => {
      const start = text(event.startDate);
      const end = addDays(start, 8);
      const windowItems = sorted.filter((candidate) => text(candidate.startDate) >= start && text(candidate.startDate) <= end);
      if (unique(windowItems.map((item) => text(item.title))).length >= 3) {
        const relativeDensity = unique(windowItems.map((item) => text(item.title))).length / Math.max(1, metroBaseline);
        pushCluster(relativeDensity >= 2.5 ? "Regional Surge" : "Metro Density Cluster", event, start, end, windowItems, 8, metroBaseline);
      }
      const typedGroups: Array<{ type: string; items: ScoredEvent[]; specificity: number }> = [];
      countBy(windowItems.map(getPrimarySector)).filter((row) => row.count >= 2).forEach((row) => {
        typedGroups.push({ type: `${row.label} Sector Cluster`, items: windowItems.filter((item) => getPrimarySector(item) === row.label), specificity: 18 });
      });
      countBy(windowItems.flatMap(getMarketFocusValues)).filter((row) => row.count >= 2).forEach((row) => {
        typedGroups.push({ type: `${row.label} Focus Cluster`, items: windowItems.filter((item) => getMarketFocusValues(item).includes(row.label)), specificity: 18 });
      });
      const accessItems = windowItems.filter((item) => isIssuerAccessEvent(item) || isStructuredAccessEvent(item) || isOneOnOneEvent(item));
      if (unique(accessItems.map((item) => text(item.title))).length >= 2) typedGroups.push({ type: "Access Cluster", items: accessItems, specificity: 20 });
      const investorItems = windowItems.filter(isInvestorHeavyEvent);
      if (unique(investorItems.map((item) => text(item.title))).length >= 2) typedGroups.push({ type: "Investor Cluster", items: investorItems, specificity: 18 });
      const dealItems = windowItems.filter(isDealMakingEvent);
      if (unique(dealItems.map((item) => text(item.title))).length >= 2) typedGroups.push({ type: "Deal Cluster", items: dealItems, specificity: 22 });
      countBy(windowItems.flatMap((item) => splitValues(item.eventCharacter))).filter((row) => row.count >= 2).forEach((row) => {
        typedGroups.push({ type: `${row.label} Event Character Cluster`, items: windowItems.filter((item) => splitValues(item.eventCharacter).includes(row.label)), specificity: 20 });
      });
      typedGroups.forEach((group) => pushCluster(group.type, event, start, end, group.items, group.specificity, metroBaseline));
    });
  });
  const ranked = clusters
    .sort((a, b) => b.planningAdjustedScore - a.planningAdjustedScore || b.relativeMetroDensity - a.relativeMetroDensity || b.specificityScore - a.specificityScore || b.eventCount - a.eventCount);
  const metroCounts = new Map<string, number>();
  return {
    top: ranked.filter((cluster) => {
      const count = metroCounts.get(cluster.metroMarket) || 0;
      if (count >= 2) return false;
      metroCounts.set(cluster.metroMarket, count + 1);
      return true;
    }).slice(0, 14),
  };
}

function buildSectorMomentum(events: ScoredEvent[], asOfDate: string) {
  const currentMonth = monthKey(asOfDate);
  const previousMonth = previousMonthKey(currentMonth);
  const currentQuarter = quarterKey(asOfDate);
  const previousQuarter = previousQuarterKey(currentQuarter);
  const sectorEvents = events.filter((event) => splitValues(event.publicCompanySector).length || splitValues(event.additionalPublicCompanySectors).length);
  const sectorCoveragePct = pct(sectorEvents.length, events.length);
  if (!events.length || sectorEvents.length < 5 || sectorCoveragePct < 20) {
    return {
      available: false,
      reason: "Public company sector coverage is insufficient for this view.",
      interpretation: "",
      rows: [] as SectorMomentumRow[],
    };
  }
  const sectors = unique(sectorEvents.flatMap(getAllSectors));
  const upcoming = events.filter((event) => text(event.startDate) >= asOfDate).sort(eventSort);
  const rows = sectors.map((sector) => {
    const matches = sectorEvents.filter((event) => getAllSectors(event).includes(sector));
    const currentMonthCount = matches.filter((event) => monthKey(text(event.startDate)) === currentMonth).length;
    const previousMonthCount = matches.filter((event) => monthKey(text(event.startDate)) === previousMonth).length;
    const currentQuarterCount = matches.filter((event) => quarterKey(text(event.startDate)) === currentQuarter).length;
    const previousQuarterCount = matches.filter((event) => quarterKey(text(event.startDate)) === previousQuarter).length;
    const next = upcoming.find((event) => getAllSectors(event).includes(sector));
    return {
      sector,
      currentMonthCount,
      previousMonthCount,
      countChange: currentMonthCount - previousMonthCount,
      percentChange: previousMonthCount ? Math.round(((currentMonthCount - previousMonthCount) / previousMonthCount) * 100) : null,
      currentQuarterCount,
      previousQuarterCount,
      nextUpcomingEvent: next ? { title: text(next.title), date: text(next.startDate), city: text(next.city), state: text(next.state) } : null,
      issuerAccessCount: matches.filter(isIssuerAccessEvent).length,
      investorHeavyCount: matches.filter(isInvestorHeavyEvent).length,
    };
  });
  return {
    available: true,
    reason: "",
    interpretation: "Public company sector coverage is sufficient to show directional category momentum, but should be read with classification coverage context where Additional Public Company Sector tagging is incomplete.",
    rows: rows.sort((a, b) => Math.abs(b.countChange) - Math.abs(a.countChange) || b.currentMonthCount - a.currentMonthCount).slice(0, 20),
  };
}

function buildMarketFocusConcentration(events: ScoredEvent[]) {
  const classified = events.filter((event) => getMarketFocusValues(event).length);
  const counts = countBy(classified.flatMap(getMarketFocusValues));
  const totalLabels = counts.reduce((sum, row) => sum + row.count, 0);
  const top3Share = pct(counts.slice(0, 3).reduce((sum, row) => sum + row.count, 0), totalLabels);
  const top5Share = pct(counts.slice(0, 5).reduce((sum, row) => sum + row.count, 0), totalLabels);
  const hhiScore = totalLabels ? Math.round(counts.reduce((sum, row) => sum + Math.pow((row.count / totalLabels) * 100, 2), 0)) : 0;
  const concentrationLabel: MarketViewIntelligence["marketFocusConcentration"]["concentrationLabel"] = top3Share >= 75 || hhiScore >= 3000
    ? "heavily concentrated market"
    : top3Share >= 50 || hhiScore >= 1800
      ? "concentrated market"
      : "diversified market";
  const rows = counts.slice(0, 10).map((row) => {
    const matches = classified.filter((event) => getMarketFocusValues(event).includes(row.label));
    const leadingWeek = topLabel(matches.map((event) => getWeekKey(text(event.startDate))));
    const leadingCity = topLabel(matches.map(cityLabel));
    return {
      marketFocus: row.label,
      count: row.count,
      shareOfClassifiedSignals: pct(row.count, totalLabels),
      issuerAccessCount: matches.filter(isIssuerAccessEvent).length,
      investorHeavyCount: matches.filter(isInvestorHeavyEvent).length,
      structuredAccessCount: matches.filter(isStructuredAccessEvent).length,
      dealMakingCount: matches.filter(isDealMakingEvent).length,
      leadingWeek: leadingWeek ? getWeekRange(leadingWeek).label : "",
      leadingCity,
      interpretation: `${row.label} represents ${pct(row.count, totalLabels)}% of classified market-focus signals${leadingCity ? `, led by ${leadingCity}` : ""}, shaping the current market view's institutional coverage profile.`,
    };
  });
  return { classifiedEventCount: classified.length, classifiedSignalCount: totalLabels, top3Share, top5Share, hhiScore, concentrationLabel, rows };
}

function buildEventCharacterMix(events: ScoredEvent[]) {
  const classified = events.filter((event) => splitValues(event.eventCharacter).length);
  const counts = countBy(classified.flatMap((event) => splitValues(event.eventCharacter)));
  const totalLabels = counts.reduce((sum, row) => sum + row.count, 0);
  return {
    classifiedEventCount: classified.length,
    rows: counts.slice(0, 12).map((row) => {
      const matches = classified.filter((event) => splitValues(event.eventCharacter).includes(row.label));
      const lower = row.label.toLowerCase();
      const interpretation = lower.includes("deal-making")
        ? "Deal-making and partnering events represent the most actionable access layer."
        : lower.includes("meeting") || lower.includes("one-on-one")
          ? "Meeting-driven events have stronger direct access value."
          : lower.includes("educational") || lower.includes("content") || lower.includes("industry")
            ? "Industry/thematic events indicate broader networking and market visibility."
            : `${row.label} shapes the conference mix for this view.`;
      return {
        eventCharacter: row.label,
        count: row.count,
        shareOfClassifiedEvents: pct(row.count, totalLabels),
        issuerAccessCount: matches.filter(isIssuerAccessEvent).length,
        investorHeavyCount: matches.filter(isInvestorHeavyEvent).length,
        averageDealAccessScore: avg(matches.map((event) => event.dealAccessScore)),
        interpretation,
      };
    }),
  };
}

function organizerRows(events: ScoredEvent[], asOfDate: string): OrganizerLeagueRow[] {
  const byOrganizer = new Map<string, ScoredEvent[]>();
  events.forEach((event) => {
    const organizer = text(event.organizer);
    if (!organizer) return;
    byOrganizer.set(organizer, [...(byOrganizer.get(organizer) || []), event]);
  });
  return Array.from(byOrganizer.entries()).map(([organizer, items]) => {
    const next = items.filter((event) => text(event.startDate) >= asOfDate).sort(eventSort)[0];
    return {
      rank: 0,
      organizer,
      totalEvents: items.length,
      issuerAccessEvents: items.filter(isIssuerAccessEvent).length,
      investorHeavyEvents: items.filter(isInvestorHeavyEvent).length,
      structuredAccessEvents: items.filter(isStructuredAccessEvent).length,
      dealMakingEvents: items.filter(isDealMakingEvent).length,
      averageDealAccessScore: avg(items.map((event) => event.dealAccessScore)),
      citiesCount: new Set(items.map(cityLabel).filter(Boolean)).size,
      nextEventTitle: next ? text(next.title) : "",
      nextEventDate: next ? text(next.startDate) : "",
      nextEventCity: next ? cityLabel(next) : "",
    };
  });
}

function rankRows(rows: OrganizerLeagueRow[], sort: (row: OrganizerLeagueRow) => number): OrganizerLeagueRow[] {
  return rows
    .slice()
    .sort((a, b) => sort(b) - sort(a) || a.organizer.localeCompare(b.organizer))
    .slice(0, 10)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function buildOrganizerLeagueTables(events: ScoredEvent[], asOfDate: string, upcomingDays: number) {
  const rows = organizerRows(events, asOfDate);
  const upcomingEnd = addDays(asOfDate, upcomingDays);
  const upcomingRows = organizerRows(events.filter((event) => text(event.startDate) >= asOfDate && text(event.startDate) <= upcomingEnd), asOfDate);
  return {
    interpretations: {
      overallVolume: "The overall volume league table shows who controls conference supply across the current conference universe.",
      issuerAccess: "The issuer-access league table identifies organizers most tied to company-facing capital markets activity.",
      investorHeavy: "The investor-heavy league table shows where institutional investor concentration is most organizer-driven.",
      structuredAccess: "The structured-access league table isolates organizers with the strongest meeting-driven and presentation-heavy formats.",
      dealAccess: "The deal-access league table combines classification depth and average access value to surface higher-signal organizer pipelines.",
      upcoming30Days: "The upcoming 30-day league table shows near-term organizer momentum for market coverage and sponsor visibility.",
      geographicBreadth: "The geographic breadth league table shows organizers with multi-city reach rather than single-market concentration.",
    },
    overallVolume: rankRows(rows, (row) => row.totalEvents),
    issuerAccess: rankRows(rows, (row) => row.issuerAccessEvents),
    investorHeavy: rankRows(rows, (row) => row.investorHeavyEvents),
    structuredAccess: rankRows(rows, (row) => row.structuredAccessEvents),
    dealAccess: rankRows(rows, (row) => row.averageDealAccessScore * Math.max(1, row.totalEvents)),
    upcoming30Days: rankRows(upcomingRows, (row) => row.totalEvents),
    geographicBreadth: rankRows(rows, (row) => row.citiesCount),
  };
}

function buildGeographyClusters(events: ScoredEvent[], asOfDate: string) {
  const byCity = new Map<string, ScoredEvent[]>();
  events.forEach((event) => {
    const key = cityLabel(event);
    if (!key) return;
    byCity.set(key, [...(byCity.get(key) || []), event]);
  });
  const cityRows = Array.from(byCity.entries()).map(([city, items]) => {
    const next = items.filter((event) => text(event.startDate) >= asOfDate).sort(eventSort)[0];
    const [cityName, stateName = ""] = city.split(",").map((part) => part.trim());
    return {
      city: cityName,
      state: stateName,
      totalEvents: items.length,
      issuerAccessEvents: items.filter(isIssuerAccessEvent).length,
      investorHeavyEvents: items.filter(isInvestorHeavyEvent).length,
      structuredAccessEvents: items.filter(isStructuredAccessEvent).length,
      dealMakingEvents: items.filter(isDealMakingEvent).length,
      averageDealAccessScore: avg(items.map((event) => event.dealAccessScore)),
      topMarketFocus: topLabel(items.flatMap(getMarketFocusValues)),
      topSector: topLabel(items.map(getPrimarySector)),
      nextEvent: next ? { title: text(next.title), date: text(next.startDate) } : null,
    };
  });
  return {
    topCitiesByTotalEvents: cityRows.slice().sort((a, b) => b.totalEvents - a.totalEvents || a.city.localeCompare(b.city)).slice(0, 10),
    topCitiesByIssuerAccess: cityRows.slice().sort((a, b) => b.issuerAccessEvents - a.issuerAccessEvents || a.city.localeCompare(b.city)).slice(0, 10),
    topCitiesByInvestorHeavyEvents: cityRows.slice().sort((a, b) => b.investorHeavyEvents - a.investorHeavyEvents || a.city.localeCompare(b.city)).slice(0, 10),
    topCitiesByDealAccessScore: cityRows.slice().sort((a, b) => b.averageDealAccessScore - a.averageDealAccessScore || b.totalEvents - a.totalEvents).slice(0, 10),
    topRegions: countBy(events.map((event) => text(event.region))).slice(0, 10),
  };
}

function buildDataReadiness(events: ScoredEvent[]) {
  const fields = [
    ["marketFocus", "Market Focus"],
    ["issuerParticipation", "Issuer Participation"],
    ["publicCompanySector", "Public Company Sector"],
    ["additionalPublicCompanySectors", "Additional Public Company Sectors"],
    ["eventCharacter", "Event Character"],
    ["organizer", "Organizer"],
    ["city", "City"],
    ["venue", "Venue"],
    ["format", "Format"],
    ["verificationStatus", "Verification Status"],
    ["websiteApproval", "Website Approval"],
  ] as const;
  const rows = fields.map(([key, label]) => {
    const populatedCount = events.filter((event) => Boolean(text(event[key]))).length;
    return { field: label, populatedCount, coveragePct: pct(populatedCount, events.length) };
  });
  return {
    fields: rows,
    strongestFields: rows.filter((row) => row.coveragePct >= 90).map((row) => row.field),
    weakestFields: rows.filter((row) => row.coveragePct < 50).map((row) => row.field),
    recommendedCaveats: [
      "Website Approval is the stronger readiness signal; Verification Status should be treated as a secondary field until coverage improves.",
      "Public company sector momentum should be shown with coverage context because sector tagging may be incomplete in narrow filtered views.",
      "Audience-specific analytics should not be emphasized unless the Audience field becomes populated.",
    ],
  };
}

function buildSeasonPulse(weekly: WeeklyIntensityRow[], asOfDate: string) {
  const monthlyCounts = countBy(weekly.map((row) => row.weekStart.slice(0, 7))).sort((a, b) => a.label.localeCompare(b.label));
  const strongest = weekly.slice().sort((a, b) => b.intensityScore - a.intensityScore)[0];
  const current = weekly.find((row) => row.weekStart <= asOfDate && row.weekEnd >= asOfDate);
  const currentSeasonLanguage = current?.seasonLanguage || "Quiet conference window";
  const strongestSeasonLanguage = strongest?.seasonLanguage || "Quiet conference window";
  return {
    currentSeasonLanguage,
    strongestSeasonLanguage,
    monthlyCounts,
    interpretation: strongest
      ? `${strongestSeasonLanguage} is the strongest visible phase in the current market view, led by the week of ${strongest.label}.`
      : "No dated conference season pulse is available for this view.",
  };
}

function completeCalendarWeeks(weekly: WeeklyIntensityRow[]): WeeklyIntensityRow[] {
  if (!weekly.length) return [];
  const first = weekly[0].weekStart;
  const last = weekly[weekly.length - 1].weekStart;
  const byKey = new Map(weekly.map((row) => [row.weekKey, row]));
  const rows: WeeklyIntensityRow[] = [];
  for (let cursor = first; cursor <= last; cursor = addDays(cursor, 7)) {
    const existing = byKey.get(cursor);
    if (existing) {
      rows.push(existing);
    } else {
      const range = getWeekRange(cursor);
      rows.push({
        ...range,
        totalEvents: 0,
        cityCount: 0,
        topCities: [],
        issuerAccessEvents: 0,
        investorHeavyEvents: 0,
        structuredAccessEvents: 0,
        dealMakingEvents: 0,
        companyPresentationEvents: 0,
        oneOnOneEvents: 0,
        averageDealAccessScore: 0,
        topMarketFocus: "",
        topSector: "",
        topEventCharacter: "",
        topEventCharacterShare: 0,
        topPublicCompanySector: "",
        topPublicCompanySectorShare: 0,
        topOrganizer: "",
        topCity: "",
        seasonLanguage: seasonLanguageForWeek(cursor, 0, 1),
        intensityScore: 0,
        readThrough: `${seasonLanguageForWeek(cursor, 0, 1)} is quiet in the current market view, with no tracked conference supply for this week.`,
      });
    }
  }
  return rows;
}

export function buildMarketViewIntelligence(
  sourceEvents: readonly MarketViewEventInput[],
  options: MarketViewIntelligenceOptions = {}
): MarketViewIntelligence {
  const asOfDate = options.asOfDate || isoDate(new Date());
  const upcomingDays = options.upcomingDays || 30;
  const deduped = new Map<string, MarketViewEventInput>();
  sourceEvents.forEach((event) => {
    const key = dedupeKey(event);
    if (!key || !text(event.startDate)) return;
    if (!deduped.has(key)) deduped.set(key, event);
  });
  const events: ScoredEvent[] = Array.from(deduped.values())
    .map((event, index) => ({ ...event, intelligenceId: `${dedupeKey(event)}-${index}`, dealAccessScore: calculateDealAccessScore(event) }))
    .sort(eventSort);

  const weeklyIntensity = buildWeeklyIntensity(events);
  const allWeeks = completeCalendarWeeks(weeklyIntensity);
  const hotWeekCandidates = weeklyIntensity
    .filter((row) => row.totalEvents > 0)
    .map((row) => buildRankedWeeks([row], false, asOfDate, weeklyIntensity)[0])
    .sort((a, b) => b.planningAdjustedScore - a.planningAdjustedScore || b.intensityScore - a.intensityScore || a.weekStart.localeCompare(b.weekStart))
    .slice(0, 8);
  const hotWeeks = hotWeekCandidates;
  const coldWeeks = buildRankedWeeks(buildColdWeekCandidates(allWeeks), true, asOfDate, allWeeks);
  const dates = events.map((event) => text(event.startDate)).filter(Boolean).sort();
  const focusCounts = countBy(events.flatMap(getMarketFocusValues));
  const sectorCounts = countBy(events.map(getPrimarySector));
  const organizerCounts = countBy(events.map((event) => text(event.organizer)));
  const cityCounts = countBy(events.map(cityLabel));
  const dataReadiness = buildDataReadiness(events);
  const seasonPulse = buildSeasonPulse(weeklyIntensity, asOfDate);
  const issuerAccessCount = events.filter(isIssuerAccessEvent).length;
  const investorHeavyCount = events.filter(isInvestorHeavyEvent).length;
  const structuredAccessCount = events.filter(isStructuredAccessEvent).length;
  const dealMakingCount = events.filter(isDealMakingEvent).length;
  const companyPresentationCount = events.filter(isCompanyPresentationEvent).length;
  const oneOnOneCount = events.filter(isOneOnOneEvent).length;
  const noIssuerParticipationCount = events.filter(hasNoIssuerParticipation).length;
  const mixedParticipationCount = events.filter(hasMixedParticipation).length;
  const averageDealAccessScore = avg(events.map((event) => event.dealAccessScore));

  return {
    coverage: {
      rawEventCount: sourceEvents.length,
      dedupedEventCount: events.length,
      duplicateSuppressionCount: sourceEvents.length - events.length,
    },
    landscapeSnapshot: {
      totalEvents: events.length,
      dateRange: { earliestDate: dates[0] || "", latestDate: dates[dates.length - 1] || "" },
      organizersCount: organizerCounts.length,
      citiesCount: cityCounts.length,
      statesCount: new Set(events.map((event) => text(event.state)).filter(Boolean)).size,
      marketFocusCount: focusCounts.length,
      publicCompanySectorCount: new Set(events.flatMap(getAllSectors)).size,
      eventCharacterCount: new Set(events.flatMap((event) => splitValues(event.eventCharacter))).size,
      topMarketFocus: focusCounts[0]?.label || "",
      topSector: sectorCounts[0]?.label || "",
      topOrganizer: organizerCounts[0]?.label || "",
      topCity: cityCounts[0]?.label || "",
      seasonLanguage: seasonPulse.currentSeasonLanguage,
    },
    accessAndDealIntelligence: {
      summary: {
        issuerAccessCount,
        investorHeavyCount,
        structuredAccessCount,
        dealMakingCount,
        companyPresentationCount,
        oneOnOneCount,
        noIssuerParticipationCount,
        mixedParticipationCount,
        averageDealAccessScore,
        topDealAccessEvents: events.slice().sort((a, b) => b.dealAccessScore - a.dealAccessScore || eventSort(a, b)).slice(0, 10).map(mapTopDealEvent),
        interpretation: {
          headline: `CCC is tracking ${issuerAccessCount} issuer-access events, ${structuredAccessCount} structured-access events, and ${dealMakingCount} deal-making / partnering events across the current conference universe.`,
          readThrough: `The highest-value access layer is concentrated in events with ${oneOnOneCount} 1x1 meeting signals, ${companyPresentationCount} company-presentation signals, and ${mixedParticipationCount} mixed-participation records. These conferences are most likely to support issuer diligence, institutional coverage, and capital formation activity.`,
          caveat: noIssuerParticipationCount
            ? `${noIssuerParticipationCount} events are explicitly classified as no issuer participation, so market coverage and sponsor visibility should be separated from direct capital access.`
            : "No-issuer participation classifications are limited in this view; interpret access depth with classification coverage context.",
        },
      },
    },
    weeklyIntensity,
    seasonPulse,
    hotWeeks: { top: hotWeeks },
    coldWeeks: { top: coldWeeks },
    clusterWeeks: buildClusterWeeks(events, asOfDate),
    issuerAccessWindows: buildWindows(events, weeklyIntensity, isIssuerAccessEvent, "Issuer-access"),
    investorHeavyWindows: buildWindows(events, weeklyIntensity, isInvestorHeavyEvent, "Investor-heavy"),
    structuredAccessWindows: buildWindows(events, weeklyIntensity, isStructuredAccessEvent, "Structured-access"),
    dealMakingWindows: buildWindows(events, weeklyIntensity, isDealMakingEvent, "Deal-making"),
    publicCompanySectorMomentum: buildSectorMomentum(events, asOfDate),
    marketFocusConcentration: buildMarketFocusConcentration(events),
    eventCharacterMix: buildEventCharacterMix(events),
    organizerLeagueTables: buildOrganizerLeagueTables(events, asOfDate, upcomingDays),
    geographyClusters: buildGeographyClusters(events, asOfDate),
    dataReadiness,
    notes: [
      "All intelligence calculations use a deduped copy of source records keyed by normalized title, city, and start date.",
      "Classification helpers use current CCC mapped fields only and do not mutate source events.",
      "Cold weeks are rank-based and limited to normal spring and fall conference seasons.",
      "Major holiday weeks are excluded from cold-week white-space rankings.",
      "Public company sector momentum uses Public Company Sector and Additional Public Company Sectors.",
    ],
  };
}
