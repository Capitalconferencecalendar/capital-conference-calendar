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
  conferenceType?: string;
  industry?: string;
  investmentFocus?: string;
  targetAudience?: string;
  companyParticipants?: string;
  eventFeatures?: string;
  accessModel?: string;
  marketCap?: string;
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
type SignalLevel = "Strong" | "Moderate" | "Light" | "Not Evident" | "Unknown";
type EventSignalProfile = {
  issuerAccessSignal: SignalLevel;
  investorRelevanceSignal: SignalLevel;
  sponsorBdSignal: SignalLevel;
  dealMakingSignal: SignalLevel;
  sectorIntelligenceSignal: SignalLevel;
  marketCoverageSignal: SignalLevel;
  educationThoughtLeadershipSignal: SignalLevel;
  networkingSignal: SignalLevel;
  organizerIntelligenceSignal: SignalLevel;
  publicCompanyCoverageSignal: SignalLevel;
};
type ScoredEvent = MarketViewEventInput & {
  intelligenceId: string;
  dealAccessScore: number;
  signalProfile: EventSignalProfile;
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

type EventFit = {
  signalProfile: EventSignalProfile;
  fitTags: string[];
  useCases: string[];
  rationale: string;
  classificationSupport: "Strong" | "Moderate" | "Limited";
};

type SignalEvent = {
  title: string;
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  organizer: string;
  marketFocus: string;
  publicCompanySector: string;
  issuerParticipation: string;
  eventCharacter: string;
  dealAccessScore: number;
  signalProfile: EventSignalProfile;
};

type ClusterAlert = {
  clusterId: string;
  clusterType: string;
  metroMarket: string;
  anchorCity: string;
  citiesIncluded: string[];
  cityRoleSummary: string;
  dateWindow: string;
  planningHorizon: string;
  eventCount: number;
  cityCount: number;
  events: SignalEvent[];
  sharedSignals: string[];
  dominantMarketFocus: string;
  dominantSector: string;
  topEventCharacter: string;
  issuerAccessCount: number;
  investorHeavyCount: number;
  structuredAccessCount: number;
  dealMakingCount: number;
  oneOnOneCount: number;
  clusterScore: number;
  relativeMetroDensity: number;
  relativeLabel: string;
  planningAdjustedScore: number;
  travelPracticality: string;
  planningRationale: string;
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
  clusterAlerts: { top: ClusterAlert[] };
  destinationEvents: {
    top: Array<{
      title: string;
      dateWindow: string;
      city: string;
      state: string;
      metroMarket: string;
      organizer: string;
      eventSeries: string;
      destinationType: string;
      planningHorizon: string;
      durationDays: number;
      marketFocus: string;
      publicCompanySector: string;
      issuerParticipation: string;
      eventCharacter: string;
      dealAccessScore: number;
      destinationScore: number;
      travelRationale: string;
      website: string;
      eventFit: EventFit;
    }>;
  };
  meetingDayOpportunities: {
    top: Array<{
      metroMarket: string;
      anchorCity: string;
      meetingDate: string;
      dateWindow: string;
      planningHorizon: string;
      opportunityType: string;
      sharedSignals: string[];
      eventBefore: Omit<SignalEvent, "dealAccessScore"> & { dateWindow: string; sector: string };
      eventAfter: Omit<SignalEvent, "dealAccessScore"> & { dateWindow: string; sector: string };
      meetingRationale: string;
      opportunityScore: number;
    }>;
  };
  conflictAlerts: {
    top: Array<{
      conflictType: string;
      dateWindow: string;
      metroMarket: string;
      sharedSignals: string[];
      events: SignalEvent[];
      conflictScore: number;
      conflictRationale: string;
    }>;
  };
  opportunityGaps: {
    top: Array<{
      gapType: string;
      weekLabel: string;
      dateWindow: string;
      metroMarket?: string;
      sector?: string;
      marketFocus?: string;
      rationale: string;
      planningHorizon: string;
      opportunityScore: number;
    }>;
  };
  monthOverMonth: {
    currentMonth: string;
    priorMonth: string;
    readout: string;
    volume: {
      currentCount: number;
      priorCount: number;
      change: number;
      percentChange: number | null;
      interpretation: string;
    };
    sectorMomentum: Array<{
      sector: string;
      currentCount: number;
      priorCount: number;
      change: number;
      percentChange: number | null;
      issuerAccessCurrent: number;
      issuerAccessPrior: number;
      investorRelevantCurrent: number;
      investorRelevantPrior: number;
      interpretation: string;
    }>;
    marketFocusMomentum: Array<{
      marketFocus: string;
      currentCount: number;
      priorCount: number;
      change: number;
      percentChange: number | null;
      interpretation: string;
    }>;
    eventCharacterShift: Array<{
      eventCharacter: string;
      currentCount: number;
      priorCount: number;
      change: number;
      shareCurrent: number;
      sharePrior: number;
      shareChange: number;
      interpretation: string;
    }>;
    signalMixShift: {
      issuerAccess: { currentCount: number; priorCount: number; change: number; interpretation: string };
      investorRelevant: { currentCount: number; priorCount: number; change: number; interpretation: string };
      structuredAccess: { currentCount: number; priorCount: number; change: number; interpretation: string };
      companyPresentations: { currentCount: number; priorCount: number; change: number; interpretation: string };
      dealOrPartnering: { currentCount: number; priorCount: number; change: number; interpretation: string };
    };
    clusterMomentum: {
      currentClusterCount: number;
      priorClusterCount: number;
      change: number;
      topCurrentClusterTypes: string[];
      interpretation: string;
    };
    organizerMomentum: Array<{
      organizer: string;
      currentCount: number;
      priorCount: number;
      change: number;
      topSector: string;
      topMetro: string;
      interpretation: string;
    }>;
    metroMomentum: Array<{
      metroMarket: string;
      currentCount: number;
      priorCount: number;
      change: number;
      topSector: string;
      topMarketFocus: string;
      interpretation: string;
    }>;
    forwardPipeline: {
      next30Count: number;
      next60Count: number;
      next90Count: number;
      next120Count: number;
      next90IssuerAccessCount: number;
      next90ClusterCount: number;
      interpretation: string;
    };
    caveat: string;
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
const STRUCTURED_ACCESS_LABELS = ["1x1 meetings", "company presentations"];

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
    event.conferenceType,
    event.industry,
    event.investmentFocus,
    event.targetAudience,
    event.companyParticipants,
    event.eventFeatures,
    event.accessModel,
    event.marketCap,
    event.format,
  ]
    .map(text)
    .filter(Boolean)
    .join(", ")
    .toLowerCase();
}

export function isIssuerAccessEvent(event: MarketViewEventInput): boolean {
  const conferenceTypes = splitValues(event.conferenceType).map((value) => value.toLowerCase());
  const features = splitValues(event.eventFeatures).map((value) => value.toLowerCase());
  const participants = splitValues(event.companyParticipants).map((value) => value.toLowerCase());
  const hasIssuerType = conferenceTypes.some((value) => value === "issuer access conference" || value === "sell-side / corporate access");
  const hasStructuredFeature = features.some((value) => value === "company presentations" || value === "1x1 meetings");
  const hasPublicCompanyParticipant = participants.some((value) => value === "public company executives" || value === "public company ir / corporate access");
  return hasIssuerType || (hasStructuredFeature && hasPublicCompanyParticipant);
}

export function isInvestorHeavyEvent(event: MarketViewEventInput): boolean {
  const conferenceTypes = splitValues(event.conferenceType).map((value) => value.toLowerCase());
  const targetAudiences = splitValues(event.targetAudience).map((value) => value.toLowerCase());
  return conferenceTypes.includes("allocator / manager forum") ||
    targetAudiences.some((value) => ["institutional investors / asset managers", "family offices", "allocators / pensions / endowments"].includes(value));
}

export function isStructuredAccessEvent(event: MarketViewEventInput): boolean {
  const values = splitValues(event.eventFeatures).map((value) => value.toLowerCase());
  return values.some((value) => STRUCTURED_ACCESS_LABELS.includes(value));
}

export function isDealMakingEvent(event: MarketViewEventInput): boolean {
  const conferenceTypes = splitValues(event.conferenceType).map((value) => value.toLowerCase());
  const features = splitValues(event.eventFeatures).map((value) => value.toLowerCase());
  const participants = splitValues(event.companyParticipants).map((value) => value.toLowerCase());
  const hasPrivateParticipant = participants.some((value) => [
    "private company founders / executives",
    "private / portfolio company management",
    "project developers / sponsors",
  ].includes(value));
  return conferenceTypes.includes("private markets / deal-making") ||
    features.includes("partnering / deal-making") ||
    (features.includes("1x1 meetings") && hasPrivateParticipant);
}

export function isCompanyPresentationEvent(event: MarketViewEventInput): boolean {
  return splitValues(event.eventFeatures).some((value) => value.toLowerCase() === "company presentations");
}

export function isOneOnOneEvent(event: MarketViewEventInput): boolean {
  return splitValues(event.eventFeatures).some((value) => value.toLowerCase() === "1x1 meetings");
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
  return splitValues(event.industry);
}

export function getMarketFocusValues(event: MarketViewEventInput): string[] {
  return splitValues(event.investmentFocus);
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

function getEventMonth(startDate: string | undefined): string {
  return monthKey(startDate);
}

function compareMonthToPriorMonth(month: string): string {
  return previousMonthKey(month);
}

function formatMonthLabel(month: string): string {
  const parsed = parseDate(`${month}-01`);
  if (!parsed) return "Insufficient month";
  return parsed.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
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
  "houston": {
    metroMarket: "Houston Metro",
    anchorCity: "Houston, TX",
    core: ["houston|tx"],
    adjacent: ["the woodlands|tx"],
    regional: [],
  },
  "phoenix-scottsdale": {
    metroMarket: "Phoenix / Scottsdale",
    anchorCity: "Phoenix, AZ",
    core: ["phoenix|az", "scottsdale|az"],
    adjacent: ["tempe|az"],
    regional: [],
  },
  "denver-boulder": {
    metroMarket: "Denver / Boulder",
    anchorCity: "Denver, CO",
    core: ["denver|co"],
    adjacent: ["boulder|co"],
    regional: [],
  },
};

function metroInfo(event: MarketViewEventInput) {
  const key = cityStateKey(event);
  for (const metro of Object.values(METRO_MARKETS)) {
    if (metro.core.includes(key)) {
      return { metroMarket: metro.metroMarket, anchorCity: metro.anchorCity, cityRole: "Core City", travelRelationship: "Same-trip practical", travelPracticality: "Same-trip practical" };
    }
    if (metro.adjacent.includes(key)) {
      return { metroMarket: metro.metroMarket, anchorCity: metro.anchorCity, cityRole: "Metro Adjacent", travelRelationship: "Same-trip practical", travelPracticality: "Same-trip practical" };
    }
    if (metro.regional.includes(key)) {
      return { metroMarket: metro.metroMarket, anchorCity: metro.anchorCity, cityRole: "Regional", travelRelationship: "Requires separate leg", travelPracticality: "Requires separate leg" };
    }
  }
  const label = cityLabel(event);
  return { metroMarket: label, anchorCity: label, cityRole: "Unknown", travelRelationship: "Unknown", travelPracticality: "Unknown" };
}

function getMetroContext(event: MarketViewEventInput) {
  return metroInfo(event);
}

function planningHorizonForDate(startDate: string, asOfDate: string): { planningHorizon: string; daysFromNow: number; weight: number } {
  const daysFromNow = daysBetween(asOfDate, startDate);
  if (daysFromNow < 0) return { planningHorizon: "Historical / Passed", daysFromNow, weight: 0.55 };
  if (daysFromNow <= 14) return { planningHorizon: "Live / Immediate", daysFromNow, weight: 0.86 };
  if (daysFromNow <= 45) return { planningHorizon: "Near-Term", daysFromNow, weight: 1.06 };
  if (daysFromNow <= 120) return { planningHorizon: "Planning Window", daysFromNow, weight: 1.28 };
  if (daysFromNow <= 240) return { planningHorizon: "Forward Emerging", daysFromNow, weight: 1.12 };
  return { planningHorizon: "Long-Range Calendar", daysFromNow, weight: 0.92 };
}

function getPlanningHorizon(date: string, asOfDate: string) {
  return planningHorizonForDate(date, asOfDate);
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
  if (isStructuredAccessEvent(event)) score += 30;
  if (isDealMakingEvent(event)) score += 25;
  if (isOneOnOneEvent(event)) score += 18;
  if (isCompanyPresentationEvent(event)) score += 15;
  if (isIssuerAccessEvent(event)) score += 15;
  if (isInvestorHeavyEvent(event)) score += 10;
  if (splitValues(event.industry).length) score += 5;
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
    marketFocus: text(event.investmentFocus),
    issuerParticipation: text(event.companyParticipants),
    eventCharacter: text(event.eventFeatures),
    publicCompanySector: getPrimarySector(event),
    dealAccessScore: event.dealAccessScore,
    website: text(event.website),
  };
}

function issuerAccessUseCaseScore(event: ScoredEvent): number {
  return (
    levelWeight(event.signalProfile.issuerAccessSignal) * 28 +
    levelWeight(event.signalProfile.publicCompanyCoverageSignal) * 16 +
    levelWeight(event.signalProfile.investorRelevanceSignal) * 12 +
    (isStructuredAccessEvent(event) ? 12 : 0) +
    (isOneOnOneEvent(event) ? 10 : 0) +
    (isCompanyPresentationEvent(event) ? 8 : 0)
  );
}

function dateWindowForEvent(event: MarketViewEventInput): string {
  const start = text(event.startDate);
  const end = text(event.endDate) || start;
  if (!start) return "";
  return start === end ? formatMonthDay(start) : `${formatMonthDay(start)}-${formatMonthDay(end)}`;
}

function durationDays(event: MarketViewEventInput): number {
  const start = text(event.startDate);
  const end = text(event.endDate) || start;
  if (!start) return 1;
  return Math.max(1, daysBetween(start, end) + 1);
}

function signalEvent(event: ScoredEvent): SignalEvent {
  return {
    title: text(event.title),
    startDate: text(event.startDate),
    endDate: text(event.endDate),
    city: text(event.city),
    state: text(event.state),
    organizer: text(event.organizer),
    marketFocus: text(event.investmentFocus),
    publicCompanySector: getPrimarySector(event),
    issuerParticipation: text(event.companyParticipants),
    eventCharacter: text(event.eventFeatures),
    dealAccessScore: event.dealAccessScore,
    signalProfile: event.signalProfile,
  };
}

function classificationSupport(event: MarketViewEventInput): EventFit["classificationSupport"] {
  const populated = [
    event.investmentFocus,
    event.companyParticipants,
    event.industry,
    event.eventFeatures,
    event.targetAudience,
    event.accessModel,
    event.marketCap,
    event.organizer,
    event.city,
    event.format,
  ].filter((value) => text(value)).length;
  if (populated >= 6) return "Strong";
  if (populated >= 3) return "Moderate";
  return "Limited";
}

function signalLevel(strong: boolean, moderate = false, light = false, known = true): SignalLevel {
  if (!known) return "Unknown";
  if (strong) return "Strong";
  if (moderate) return "Moderate";
  if (light) return "Light";
  return "Not Evident";
}

function getEventSignalProfile(event: MarketViewEventInput): EventSignalProfile {
  const haystack = eventText(event);
  const sectors = getAllSectors(event);
  const hasFocus = getMarketFocusValues(event).length > 0;
  const issuerAccess = isIssuerAccessEvent(event);
  const investorHeavy = isInvestorHeavyEvent(event);
  const structured = isStructuredAccessEvent(event);
  const oneOnOne = isOneOnOneEvent(event);
  const companyPresentation = isCompanyPresentationEvent(event);
  const deal = isDealMakingEvent(event);
  const noIssuer = hasNoIssuerParticipation(event);
  return {
    issuerAccessSignal: signalLevel(structured || oneOnOne || companyPresentation || issuerAccess, issuerAccess, !noIssuer && /issuer|public company/i.test(haystack), Boolean(text(event.companyParticipants) || text(event.eventFeatures) || haystack)),
    investorRelevanceSignal: signalLevel(investorHeavy && issuerAccess, investorHeavy, /investor|allocator|family office|lp\/gp/i.test(haystack), Boolean(haystack)),
    sponsorBdSignal: signalLevel(/sponsor|service provider|buyer|networking|business development|bd/i.test(haystack), investorHeavy || deal, hasFocus || sectors.length > 0, Boolean(haystack)),
    dealMakingSignal: signalLevel(deal, /partner|capital formation|transaction|deal/i.test(haystack), /network|private markets/i.test(haystack), Boolean(text(event.eventFeatures) || haystack)),
    sectorIntelligenceSignal: signalLevel(sectors.length >= 2, sectors.length === 1, Boolean(text(event.industry)), Boolean(text(event.industry))),
    marketCoverageSignal: signalLevel(hasFocus && sectors.length > 0, hasFocus || sectors.length > 0, Boolean(text(event.conferenceType) || text(event.region)), Boolean(haystack)),
    educationThoughtLeadershipSignal: signalLevel(/education|thought leadership|keynote|panel|forum|symposium|content/i.test(haystack), /industry|thematic|conference/i.test(haystack), Boolean(text(event.conferenceType)), Boolean(haystack)),
    networkingSignal: signalLevel(/networking|reception|partner|sponsor|service provider/i.test(haystack), investorHeavy || deal, hasFocus, Boolean(haystack)),
    organizerIntelligenceSignal: signalLevel(Boolean(text(event.organizer) && text(event.eventSeries)), Boolean(text(event.organizer)), false, Boolean(text(event.organizer))),
    publicCompanyCoverageSignal: signalLevel(Boolean(/public company/i.test(text(event.companyParticipants)) && issuerAccess), /public company/i.test(text(event.companyParticipants)), /public company/i.test(haystack), Boolean(text(event.companyParticipants) || haystack)),
  };
}

function levelWeight(level: SignalLevel): number {
  if (level === "Strong") return 3;
  if (level === "Moderate") return 2;
  if (level === "Light") return 1;
  return 0;
}

function signalProfileSummary(profile: EventSignalProfile): string {
  return Object.entries(profile)
    .filter(([, value]) => value === "Strong" || value === "Moderate")
    .slice(0, 3)
    .map(([key, value]) => `${key.replace(/Signal$/, "").replace(/([A-Z])/g, " $1").trim()}: ${value}`)
    .join(" · ") || "Signals limited";
}

function getEventFitTags(event: MarketViewEventInput): string[] {
  const tags = new Set<string>(["Good for Market Coverage"]);
  if (isInvestorHeavyEvent(event) || isIssuerAccessEvent(event)) tags.add("Good for Investors");
  if (isIssuerAccessEvent(event) || isCompanyPresentationEvent(event)) tags.add("Good for Issuers");
  if (isInvestorHeavyEvent(event) || /sponsor|service provider|network/i.test(eventText(event))) tags.add("Good for Sponsors");
  if (text(event.organizerType) || text(event.organizer)) tags.add("Good for Organizers");
  if (isDealMakingEvent(event) || /capital|transaction|deal|partner/i.test(eventText(event))) tags.add("Good for Banks / Advisors");
  if (isIssuerAccessEvent(event) || isCompanyPresentationEvent(event)) tags.add("Good for IR Teams");
  if (isDealMakingEvent(event) || /business development|bd|partner|network/i.test(eventText(event))) tags.add("Good for BD");
  if (isStructuredAccessEvent(event) || isOneOnOneEvent(event)) tags.add("Good for Direct Access");
  if (durationDays(event) > 1 || getMetroContext(event).travelPracticality !== "Unknown") tags.add("Good for Travel Planning");
  return Array.from(tags);
}

function getPrimaryUseCases(event: MarketViewEventInput): string[] {
  const useCases = new Set<string>();
  if (isIssuerAccessEvent(event)) useCases.add("Issuer diligence");
  if (isOneOnOneEvent(event) || isStructuredAccessEvent(event)) useCases.add("1x1 meeting planning");
  if (isInvestorHeavyEvent(event)) useCases.add("Investor coverage");
  if (isDealMakingEvent(event)) useCases.add("Partnering and deal sourcing");
  if (getAllSectors(event).length) useCases.add("Sector coverage");
  if (!useCases.size) useCases.add("Market visibility");
  return Array.from(useCases);
}

function getClassificationSupport(event: MarketViewEventInput) {
  return classificationSupport(event);
}

function getEventFit(event: MarketViewEventInput): EventFit {
  const signalProfile = "signalProfile" in event && event.signalProfile ? event.signalProfile as EventSignalProfile : getEventSignalProfile(event);
  const fitTags = getEventFitTags(event);
  const useCases = getPrimaryUseCases(event);
  const rationale = `This event's profile is use-case specific: ${signalProfileSummary(signalProfile)}. It may be useful for some users even when other signals are light or not evident.`;
  return { signalProfile, fitTags, useCases, rationale, classificationSupport: getClassificationSupport(event) };
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
    const eventCharacters = countBy(items.flatMap((event) => splitValues(event.eventFeatures)));
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
  const eventCharacter = countBy(items.flatMap((item) => splitValues(item.eventFeatures)))[0];
  const publicCompanySector = countBy(items.flatMap(getAllSectors))[0];
  if (eventCharacter && eventCharacter.count >= 2) signals.push(eventCharacter.label);
  if (publicCompanySector && publicCompanySector.count >= 2) signals.push(publicCompanySector.label);
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
    const topEventCharacter = topLabel(windowItems.flatMap((item) => splitValues(item.eventFeatures)));
    const sharedSignals = clusterSignals(windowItems);
    const horizon = planningHorizonForDate(start, asOfDate);
    const uniqueCities = unique(windowItems.map(cityLabel)).length;
    const relativeMetroDensity = Number((names.length / Math.max(1, metroBaseline)).toFixed(1));
    const relativeLabel = relativeMetroDensity >= 2.5 && names.length >= 3 ? "Regional Surge" : "";
    const cityRole = uniqueCities > 1 ? "Metro Mix" : metro.cityRole;
    const travelRelationship = uniqueCities > 1 && metro.metroMarket !== topCity ? "Same-trip practical" : metro.travelRelationship;
    const specificityScore = Math.min(40, specificityBase + (dominantSector ? 5 : 0) + (topEventCharacter ? 5 : 0) + (dominantMarketFocus ? 3 : 0) + (sharedSignals.length * 4));
    const clusterScore = Math.min(100, Math.round((names.length * 7) + (issuerAccessCount * 7) + (investorHeavyCount * 5) + (structuredAccessCount * 9) + (dealMakingCount * 8) + specificityScore));
    const planningAdjustedScore = Math.round((clusterScore * horizon.weight) + specificityScore + Math.min(35, relativeMetroDensity * 10) + (horizon.planningHorizon === "Planning Window" ? 12 : 0));
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
      countBy(windowItems.flatMap((item) => splitValues(item.eventFeatures))).filter((row) => row.count >= 2).forEach((row) => {
        typedGroups.push({ type: `${row.label} Event Features Cluster`, items: windowItems.filter((item) => splitValues(item.eventFeatures).includes(row.label)), specificity: 20 });
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

function sharedSignalsForEvents(items: ScoredEvent[]): string[] {
  const signals = clusterSignals(items);
  const sectors = countBy(items.map(getPrimarySector)).filter((row) => row.count >= 2).map((row) => row.label);
  const focuses = countBy(items.flatMap(getMarketFocusValues)).filter((row) => row.count >= 2).map((row) => row.label);
  const organizers = countBy(items.map((event) => text(event.organizer))).filter((row) => row.count >= 2).map((row) => row.label);
  return unique([...sectors.slice(0, 2), ...focuses.slice(0, 2), ...signals, ...organizers.slice(0, 1)]);
}

function buildClusterAlerts(events: ScoredEvent[], asOfDate: string): { top: ClusterAlert[] } {
  const legacy = buildClusterWeeks(events, asOfDate).top;
  const byTitle = new Map(events.map((event) => [text(event.title), event]));
  const alerts = legacy.map((cluster, index) => {
    const eventItems = cluster.events.map((title) => byTitle.get(title)).filter(Boolean) as ScoredEvent[];
    const citiesIncluded = unique(eventItems.map(cityLabel));
    return {
      clusterId: `${cluster.metroMarket}-${cluster.clusterType}-${cluster.dateWindow}-${index}`,
      clusterType: cluster.clusterType.replace(/.+ Sector Cluster$/, "Industry Cluster").replace(/.+ Focus Cluster$/, "Investment Focus Cluster"),
      metroMarket: cluster.metroMarket,
      anchorCity: cluster.anchorCity,
      citiesIncluded,
      cityRoleSummary: unique(eventItems.map((event) => getMetroContext(event).cityRole)).join(" / ") || cluster.cityRole,
      dateWindow: cluster.dateWindow,
      planningHorizon: cluster.planningHorizon,
      eventCount: cluster.eventCount,
      cityCount: cluster.cityCount,
      events: eventItems.map(signalEvent),
      sharedSignals: cluster.sharedSignals.length ? cluster.sharedSignals : sharedSignalsForEvents(eventItems),
      dominantMarketFocus: cluster.dominantMarketFocus,
      dominantSector: cluster.dominantSector,
      topEventCharacter: cluster.topEventCharacter,
      issuerAccessCount: cluster.issuerAccessCount,
      investorHeavyCount: cluster.investorHeavyCount,
      structuredAccessCount: cluster.structuredAccessCount,
      dealMakingCount: cluster.dealMakingCount,
      oneOnOneCount: eventItems.filter(isOneOnOneEvent).length,
      clusterScore: cluster.clusterScore,
      relativeMetroDensity: cluster.relativeMetroDensity,
      relativeLabel: cluster.relativeLabel,
      planningAdjustedScore: cluster.planningAdjustedScore,
      travelPracticality: cluster.travelRelationship,
      planningRationale: cluster.interpretation.replace(" has a ", " may create a "),
    };
  });
  return { top: alerts.slice(0, 12) };
}

function buildDestinationEvents(events: ScoredEvent[], asOfDate: string): MarketViewIntelligence["destinationEvents"] {
  const destinationCities = /scottsdale|san diego|aspen|palm springs|miami beach|omaha|las vegas|newport beach|boca raton|palm beach/i;
  const rows = events.map((event) => {
    const metro = getMetroContext(event);
    const horizon = getPlanningHorizon(text(event.startDate), asOfDate);
    const duration = durationDays(event);
    const outsideCore = metro.cityRole !== "Core City";
    const destinationCity = destinationCities.test(cityLabel(event));
    const access = isIssuerAccessEvent(event) || isStructuredAccessEvent(event) || isOneOnOneEvent(event) || isCompanyPresentationEvent(event);
    const investor = isInvestorHeavyEvent(event);
    const deal = isDealMakingEvent(event);
    const sector = getPrimarySector(event);
    const profile = event.signalProfile;
    const profileStrength = (
      levelWeight(profile.issuerAccessSignal) +
      levelWeight(profile.investorRelevanceSignal) +
      levelWeight(profile.dealMakingSignal) +
      levelWeight(profile.sectorIntelligenceSignal) +
      levelWeight(profile.publicCompanyCoverageSignal)
    ) * 7;
    const baseScore = (duration > 1 ? 18 : 0) + (outsideCore || destinationCity ? 18 : 0) + profileStrength + (access ? 8 : 0) + (investor ? 7 : 0) + (deal ? 8 : 0) + (sector ? 6 : 0) + (text(event.eventSeries) ? 5 : 0);
    const destinationScore = Math.min(100, Math.round(baseScore * horizon.weight));
    const destinationType = deal
      ? "Destination Deal Event"
      : access
        ? "Destination Access Event"
        : investor
          ? "Destination Investor Event"
          : sector
            ? "Destination Industry Event"
            : "Major Destination Conference";
    return {
      title: text(event.title),
      dateWindow: dateWindowForEvent(event),
      city: text(event.city),
      state: text(event.state),
      metroMarket: metro.metroMarket,
      organizer: text(event.organizer),
      eventSeries: text(event.eventSeries),
      destinationType,
      planningHorizon: horizon.planningHorizon,
      durationDays: duration,
      marketFocus: text(event.investmentFocus),
      publicCompanySector: sector,
      issuerParticipation: text(event.companyParticipants),
      eventCharacter: text(event.eventFeatures),
      dealAccessScore: event.dealAccessScore,
      destinationScore,
      travelRationale: `This event may justify standalone travel for specific use cases because of ${[
        duration > 1 ? "its multiday format" : "",
        outsideCore || destinationCity ? "its destination or non-core hub location" : "",
        access ? "its direct-access profile" : "",
        investor ? "investor-heavy activity" : "",
        deal ? "deal or partnering signals" : "",
        sector ? `${sector} concentration` : "",
        signalProfileSummary(profile),
      ].filter(Boolean).join(", ")}.`,
      website: text(event.website),
      eventFit: getEventFit(event),
    };
  });
  return {
    top: rows
      .filter((row) => row.title && row.destinationScore >= 55)
      .sort((a, b) => b.destinationScore - a.destinationScore || b.durationDays - a.durationDays)
      .slice(0, 8),
  };
}

function meetingEvent(event: ScoredEvent) {
  return {
    title: text(event.title),
    startDate: text(event.startDate),
    endDate: text(event.endDate),
    dateWindow: dateWindowForEvent(event),
    city: text(event.city),
    state: text(event.state),
    organizer: text(event.organizer),
    marketFocus: text(event.investmentFocus),
    sector: getPrimarySector(event),
    publicCompanySector: getPrimarySector(event),
    issuerParticipation: text(event.companyParticipants),
    eventCharacter: text(event.eventFeatures),
    signalProfile: event.signalProfile,
  };
}

function buildMeetingDayOpportunities(events: ScoredEvent[], asOfDate: string): MarketViewIntelligence["meetingDayOpportunities"] {
  const byMetro = new Map<string, ScoredEvent[]>();
  events.forEach((event) => {
    const metro = getMetroContext(event);
    if (metro.travelPracticality === "Unknown") return;
    byMetro.set(metro.metroMarket, [...(byMetro.get(metro.metroMarket) || []), event]);
  });
  const rows: MarketViewIntelligence["meetingDayOpportunities"]["top"] = [];
  byMetro.forEach((items) => {
    const sorted = items.filter((event) => text(event.startDate)).sort(eventSort);
    for (let index = 0; index < sorted.length - 1; index += 1) {
      const before = sorted[index];
      const after = sorted[index + 1];
      const beforeEnd = text(before.endDate) || text(before.startDate);
      const gapDays = daysBetween(beforeEnd, text(after.startDate)) - 1;
      if (gapDays < 1 || gapDays > 2) continue;
      const sharedSignals = sharedSignalsForEvents([before, after]);
      const accessSignalStrength = Math.max(levelWeight(before.signalProfile.issuerAccessSignal), levelWeight(after.signalProfile.issuerAccessSignal), levelWeight(before.signalProfile.investorRelevanceSignal), levelWeight(after.signalProfile.investorRelevanceSignal), levelWeight(before.signalProfile.sponsorBdSignal), levelWeight(after.signalProfile.sponsorBdSignal));
      if (!sharedSignals.length || accessSignalStrength < 1) continue;
      const metro = getMetroContext(before);
      const meetingDate = addDays(beforeEnd, 1);
      const horizon = getPlanningHorizon(meetingDate, asOfDate);
      const score = Math.min(100, (gapDays === 1 ? 22 : 12) + (sharedSignals.length * 10) + (isIssuerAccessEvent(before) && isIssuerAccessEvent(after) ? 20 : 0) + (isInvestorHeavyEvent(before) && isInvestorHeavyEvent(after) ? 15 : 0) + (isStructuredAccessEvent(before) || isStructuredAccessEvent(after) || isOneOnOneEvent(before) || isOneOnOneEvent(after) ? 20 : 0) + (isDealMakingEvent(before) || isDealMakingEvent(after) ? 15 : 0) + (text(before.organizer) && text(before.organizer) === text(after.organizer) ? 8 : 0) + (metro.travelPracticality === "Same-trip practical" ? 15 : 0) + (horizon.planningHorizon === "Near-Term" || horizon.planningHorizon === "Planning Window" ? 10 : 0));
      rows.push({
        metroMarket: metro.metroMarket,
        anchorCity: metro.anchorCity,
        meetingDate,
        dateWindow: `${formatMonthDay(text(before.startDate))}-${formatMonthDay(text(after.startDate))}`,
        planningHorizon: horizon.planningHorizon,
        opportunityType: isIssuerAccessEvent(before) || isIssuerAccessEvent(after) ? "Issuer Meeting Day" : isInvestorHeavyEvent(before) || isInvestorHeavyEvent(after) ? "Investor Coverage Day" : "Same-Trip Meeting Day",
        sharedSignals,
        eventBefore: meetingEvent(before),
        eventAfter: meetingEvent(after),
        meetingRationale: `A ${gapDays === 1 ? "one-day" : "two-day"} gap between aligned ${metro.metroMarket} events may create a practical same-trip window for private meetings, outreach, sponsor conversations, advisor coverage, or BD meetings.`,
        opportunityScore: score,
      });
    }
  });
  return { top: rows.sort((a, b) => b.opportunityScore - a.opportunityScore || a.meetingDate.localeCompare(b.meetingDate)).slice(0, 6) };
}

function overlaps(left: ScoredEvent, right: ScoredEvent): boolean {
  const leftStart = text(left.startDate);
  const rightStart = text(right.startDate);
  const leftEnd = text(left.endDate) || leftStart;
  const rightEnd = text(right.endDate) || rightStart;
  return Boolean(leftStart && rightStart && leftStart <= rightEnd && rightStart <= leftEnd);
}

function buildConflictAlerts(events: ScoredEvent[]): MarketViewIntelligence["conflictAlerts"] {
  const rows: MarketViewIntelligence["conflictAlerts"]["top"] = [];
  const sorted = events.filter((event) => text(event.startDate)).sort(eventSort);
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < Math.min(sorted.length, i + 18); j += 1) {
      const left = sorted[i];
      const right = sorted[j];
      if (!overlaps(left, right) && getWeekKey(text(left.startDate)) !== getWeekKey(text(right.startDate))) continue;
      const sameMetro = getMetroContext(left).metroMarket === getMetroContext(right).metroMarket;
      const sharedSignals = sharedSignalsForEvents([left, right]);
      if (!sameMetro && sharedSignals.length < 2) continue;
      const conflictScore = Math.min(100, (sameMetro ? 22 : 8) + (overlaps(left, right) ? 25 : 12) + (sharedSignals.length * 10) + (isInvestorHeavyEvent(left) && isInvestorHeavyEvent(right) ? 15 : 0) + (isIssuerAccessEvent(left) && isIssuerAccessEvent(right) ? 15 : 0));
      if (conflictScore < 45) continue;
      const metroMarket = sameMetro ? getMetroContext(left).metroMarket : "Cross-market";
      const conflictType = sameMetro
        ? "Same-City Conflict"
        : sharedSignals.some((signal) => /Investor/i.test(signal))
          ? "Same-Investor-Audience Conflict"
          : sharedSignals.some((signal) => getAllSectors(left).includes(signal) || getAllSectors(right).includes(signal))
            ? "Same-Sector Conflict"
            : "Travel Conflict";
      rows.push({
        conflictType,
        dateWindow: `${formatMonthDay(text(left.startDate))}-${formatMonthDay(text(right.startDate))}`,
        metroMarket,
        sharedSignals,
        events: [signalEvent(left), signalEvent(right)],
        conflictScore,
        conflictRationale: `${sharedSignals.join(", ") || "Similar audience"} events overlap in the same planning window, which may force sponsors, issuers, investors, or advisors to prioritize travel, meetings, and coverage.`,
      });
    }
  }
  return { top: rows.sort((a, b) => b.conflictScore - a.conflictScore).slice(0, 6) };
}

function buildOpportunityGaps(coldWeeks: RankedWeek[]): MarketViewIntelligence["opportunityGaps"] {
  return {
    top: coldWeeks.slice(0, 6).map((row) => ({
      gapType: row.totalEvents <= 1 ? "Lower-Conflict Planning Week" : "Outreach Window",
      weekLabel: row.label,
      dateWindow: row.label,
      sector: row.topSector || undefined,
      marketFocus: row.topMarketFocus || undefined,
      rationale: `${row.label} has lower relative conference density inside an active season, which may create room for outreach, hosted meetings, sponsor visibility, or organizer positioning.`,
      planningHorizon: row.planningHorizon,
      opportunityScore: Math.max(1, 100 - row.intensityScore),
    })),
  };
}

function calcPercentChange(current: number, prior: number): number | null {
  if (!prior) return null;
  return Math.round(((current - prior) / prior) * 100);
}

function momentumSort<T extends { currentCount: number; change: number }>(rows: T[]): T[] {
  return rows.slice().sort((a, b) => b.change - a.change || b.currentCount - a.currentCount);
}

function monthEvents(events: ScoredEvent[], month: string): ScoredEvent[] {
  return events.filter((event) => getEventMonth(text(event.startDate)) === month);
}

function signalShift(label: string, current: ScoredEvent[], prior: ScoredEvent[], predicate: (event: ScoredEvent) => boolean) {
  const currentCount = current.filter(predicate).length;
  const priorCount = prior.filter(predicate).length;
  const change = currentCount - priorCount;
  const direction = change > 0 ? "higher" : change < 0 ? "lower" : "stable";
  return {
    currentCount,
    priorCount,
    change,
    interpretation: `Tracked ${label} signals are ${direction} month over month within the current dataset.`,
  };
}

function buildMonthOverMonth(events: ScoredEvent[], clusterAlerts: ClusterAlert[], asOfDate: string): MarketViewIntelligence["monthOverMonth"] {
  const currentMonthKey = getEventMonth(asOfDate);
  const priorMonthKey = compareMonthToPriorMonth(currentMonthKey);
  const currentMonth = formatMonthLabel(currentMonthKey);
  const priorMonth = formatMonthLabel(priorMonthKey);
  const current = monthEvents(events, currentMonthKey);
  const prior = monthEvents(events, priorMonthKey);
  const nextMonthKey = monthKey(addDays(`${currentMonthKey}-01`, 32));
  const next = monthEvents(events, nextMonthKey);
  const volumeChange = current.length - prior.length;
  const volumeInterpretation = prior.length
    ? `Tracked ${currentMonth} activity is ${volumeChange > 0 ? "higher than" : volumeChange < 0 ? "lower than" : "in line with"} ${priorMonth}, with ${Math.abs(volumeChange)} ${Math.abs(volumeChange) === 1 ? "event" : "events"} ${volumeChange >= 0 ? "more or unchanged" : "fewer"} in the current dataset.`
    : `Tracked ${currentMonth} activity has a limited prior-month baseline in ${priorMonth}.`;
  const forwardBuild = current.length < 3 && next.length >= current.length + 3
    ? ` Tracked ${currentMonth} activity is limited, while ${formatMonthLabel(nextMonthKey)} shows the next larger forward build.`
    : "";
  const allSectors = unique([...current.flatMap(getAllSectors), ...prior.flatMap(getAllSectors)]);
  const sectorMomentum = momentumSort(allSectors.map((sector) => {
    const currentMatches = current.filter((event) => getAllSectors(event).includes(sector));
    const priorMatches = prior.filter((event) => getAllSectors(event).includes(sector));
    const change = currentMatches.length - priorMatches.length;
    const issuerAccessCurrent = currentMatches.filter(isIssuerAccessEvent).length;
    const issuerAccessPrior = priorMatches.filter(isIssuerAccessEvent).length;
    const investorRelevantCurrent = currentMatches.filter(isInvestorHeavyEvent).length;
    const investorRelevantPrior = priorMatches.filter(isInvestorHeavyEvent).length;
    const signal = issuerAccessCurrent > issuerAccessPrior ? "a higher issuer-access count" : investorRelevantCurrent > investorRelevantPrior ? "a higher investor-relevant count" : "a mixed signal profile";
    return {
      sector,
      currentCount: currentMatches.length,
      priorCount: priorMatches.length,
      change,
      percentChange: calcPercentChange(currentMatches.length, priorMatches.length),
      issuerAccessCurrent,
      issuerAccessPrior,
      investorRelevantCurrent,
      investorRelevantPrior,
      interpretation: `${sector} tracked activity is ${change > 0 ? "higher" : change < 0 ? "lower" : "stable"} month over month, with ${signal}.`,
    };
  })).slice(0, 5);
  const allFocuses = unique([...current.flatMap(getMarketFocusValues), ...prior.flatMap(getMarketFocusValues)]);
  const marketFocusMomentum = momentumSort(allFocuses.map((marketFocus) => {
    const currentCount = current.filter((event) => getMarketFocusValues(event).includes(marketFocus)).length;
    const priorCount = prior.filter((event) => getMarketFocusValues(event).includes(marketFocus)).length;
    const change = currentCount - priorCount;
    return {
      marketFocus,
      currentCount,
      priorCount,
      change,
      percentChange: calcPercentChange(currentCount, priorCount),
      interpretation: `${marketFocus} tracked activity is ${change > 0 ? "higher" : change < 0 ? "lower" : "stable"} month over month within the current dataset.`,
    };
  })).slice(0, 5);
  const allCharacters = unique([...current.flatMap((event) => splitValues(event.eventFeatures)), ...prior.flatMap((event) => splitValues(event.eventFeatures))]);
  const eventCharacterShift = allCharacters.map((eventCharacter) => {
    const currentCount = current.filter((event) => splitValues(event.eventFeatures).includes(eventCharacter)).length;
    const priorCount = prior.filter((event) => splitValues(event.eventFeatures).includes(eventCharacter)).length;
    const shareCurrent = pct(currentCount, current.length);
    const sharePrior = pct(priorCount, prior.length);
    const shareChange = shareCurrent - sharePrior;
    return {
      eventCharacter,
      currentCount,
      priorCount,
      change: currentCount - priorCount,
      shareCurrent,
      sharePrior,
      shareChange,
      interpretation: `${eventCharacter} represents ${shareCurrent}% of tracked ${currentMonth} activity, ${shareChange > 0 ? "up" : shareChange < 0 ? "down" : "flat"} versus ${priorMonth}.`,
    };
  }).sort((a, b) => Math.abs(b.shareChange) - Math.abs(a.shareChange) || b.currentCount - a.currentCount).slice(0, 5);
  const signalMixShift = {
    issuerAccess: signalShift("issuer-access", current, prior, isIssuerAccessEvent),
    investorRelevant: signalShift("investor-relevant", current, prior, isInvestorHeavyEvent),
    structuredAccess: signalShift("structured-access", current, prior, (event) => isStructuredAccessEvent(event) || isOneOnOneEvent(event)),
    companyPresentations: signalShift("company-presentation", current, prior, isCompanyPresentationEvent),
    dealOrPartnering: signalShift("deal or partnering", current, prior, isDealMakingEvent),
  };
  const clusterMonth = (cluster: ClusterAlert) => getEventMonth(cluster.events[0]?.startDate);
  const currentClusters = clusterAlerts.filter((cluster) => clusterMonth(cluster) === currentMonthKey);
  const priorClusters = clusterAlerts.filter((cluster) => clusterMonth(cluster) === priorMonthKey);
  const clusterMomentum = {
    currentClusterCount: currentClusters.length,
    priorClusterCount: priorClusters.length,
    change: currentClusters.length - priorClusters.length,
    topCurrentClusterTypes: countBy(currentClusters.map((cluster) => cluster.clusterType)).slice(0, 3).map((row) => row.label),
    interpretation: currentClusters.length
      ? `Tracked ${currentMonth} cluster activity is led by ${countBy(currentClusters.map((cluster) => cluster.clusterType)).slice(0, 2).map((row) => row.label).join(" and ") || "classified clusters"}, not simple city density.`
      : "Cluster momentum is limited for the current month in the current dataset.",
  };
  const allOrganizers = unique([...current.map((event) => text(event.organizer)), ...prior.map((event) => text(event.organizer))]);
  const organizerMomentum = momentumSort(allOrganizers.filter(Boolean).map((organizer) => {
    const currentMatches = current.filter((event) => text(event.organizer) === organizer);
    const priorMatches = prior.filter((event) => text(event.organizer) === organizer);
    const topSector = topLabel(currentMatches.map(getPrimarySector));
    const topMetro = topLabel(currentMatches.map((event) => getMetroContext(event).metroMarket));
    return {
      organizer,
      currentCount: currentMatches.length,
      priorCount: priorMatches.length,
      change: currentMatches.length - priorMatches.length,
      topSector,
      topMetro,
      interpretation: `${organizer} has ${currentMatches.length} tracked ${currentMonth} events${topMetro ? `, led by ${topMetro}` : ""}.`,
    };
  })).slice(0, 5);
  const allMetros = unique([...current.map((event) => getMetroContext(event).metroMarket), ...prior.map((event) => getMetroContext(event).metroMarket)]);
  const metroMomentum = momentumSort(allMetros.filter(Boolean).map((metroMarket) => {
    const currentMatches = current.filter((event) => getMetroContext(event).metroMarket === metroMarket);
    const priorMatches = prior.filter((event) => getMetroContext(event).metroMarket === metroMarket);
    return {
      metroMarket,
      currentCount: currentMatches.length,
      priorCount: priorMatches.length,
      change: currentMatches.length - priorMatches.length,
      topSector: topLabel(currentMatches.map(getPrimarySector)),
      topMarketFocus: topLabel(currentMatches.flatMap(getMarketFocusValues)),
      interpretation: `${metroMarket} has ${currentMatches.length} tracked ${currentMonth} events${topLabel(currentMatches.map(getPrimarySector)) ? `, with ${topLabel(currentMatches.map(getPrimarySector))} as the leading sector signal` : ""}.`,
    };
  })).slice(0, 5);
  const inNext = (days: number) => events.filter((event) => {
    const start = text(event.startDate);
    return start >= asOfDate && start <= addDays(asOfDate, days);
  });
  const next90 = inNext(90);
  const forwardPipeline = {
    next30Count: inNext(30).length,
    next60Count: inNext(60).length,
    next90Count: next90.length,
    next120Count: inNext(120).length,
    next90IssuerAccessCount: next90.filter(isIssuerAccessEvent).length,
    next90ClusterCount: clusterAlerts.filter((cluster) => {
      const start = cluster.events[0]?.startDate || "";
      return start >= asOfDate && start <= addDays(asOfDate, 90);
    }).length,
    interpretation: `The next 90 days include ${next90.length} tracked events, including ${next90.filter(isIssuerAccessEvent).length} issuer-access signals and ${clusterAlerts.filter((cluster) => {
      const start = cluster.events[0]?.startDate || "";
      return start >= asOfDate && start <= addDays(asOfDate, 90);
    }).length} cluster alerts in the current dataset.`,
  };
  const leadingSector = sectorMomentum[0]?.sector;
  const leadingMetro = metroMomentum[0]?.metroMarket;
  const readout = `Tracked ${currentMonth} activity is ${volumeChange > 0 ? "higher than" : volumeChange < 0 ? "lower than" : "roughly in line with"} ${priorMonth}. ${leadingSector ? `${leadingSector} is the leading sector mover, ` : ""}${leadingMetro ? `while ${leadingMetro} is the leading metro signal. ` : ""}${signalMixShift.issuerAccess.change > 0 ? "Issuer-access signals are higher month over month. " : ""}${forwardBuild}`.trim();
  return {
    currentMonth,
    priorMonth,
    readout,
    volume: {
      currentCount: current.length,
      priorCount: prior.length,
      change: volumeChange,
      percentChange: calcPercentChange(current.length, prior.length),
      interpretation: volumeInterpretation + forwardBuild,
    },
    sectorMomentum,
    marketFocusMomentum,
    eventCharacterShift,
    signalMixShift,
    clusterMomentum,
    organizerMomentum,
    metroMomentum,
    forwardPipeline,
    caveat: "Month-over-month figures reflect currently tracked Capital Conference Calendar activity, not a complete measure of total market demand.",
  };
}

function buildSectorMomentum(events: ScoredEvent[], asOfDate: string) {
  const currentMonth = monthKey(asOfDate);
  const previousMonth = previousMonthKey(currentMonth);
  const currentQuarter = quarterKey(asOfDate);
  const previousQuarter = previousQuarterKey(currentQuarter);
  const sectorEvents = events.filter((event) => splitValues(event.industry).length);
  const sectorCoveragePct = pct(sectorEvents.length, events.length);
  if (!events.length || sectorEvents.length < 5 || sectorCoveragePct < 20) {
    return {
      available: false,
      reason: "Industry coverage is insufficient for this view.",
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
    interpretation: "Industry coverage is sufficient to show directional category momentum, but should be read with classification coverage context.",
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
      interpretation: `${row.label} represents ${pct(row.count, totalLabels)}% of classified investment-focus signals${leadingCity ? `, led by ${leadingCity}` : ""}, shaping the current market view's institutional coverage profile.`,
    };
  });
  return { classifiedEventCount: classified.length, classifiedSignalCount: totalLabels, top3Share, top5Share, hhiScore, concentrationLabel, rows };
}

function buildEventCharacterMix(events: ScoredEvent[]) {
  const classified = events.filter((event) => splitValues(event.eventFeatures).length);
  const counts = countBy(classified.flatMap((event) => splitValues(event.eventFeatures)));
  const totalLabels = counts.reduce((sum, row) => sum + row.count, 0);
  return {
    classifiedEventCount: classified.length,
    rows: counts.slice(0, 12).map((row) => {
      const matches = classified.filter((event) => splitValues(event.eventFeatures).includes(row.label));
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
    ["conferenceType", "Conference Type"],
    ["industry", "Industry"],
    ["investmentFocus", "Investment Focus"],
    ["targetAudience", "Target Audience"],
    ["companyParticipants", "Company Participants"],
    ["eventFeatures", "Event Features"],
    ["accessModel", "Access Model"],
    ["marketCap", "Market Cap"],
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
    .map((event, index) => ({ ...event, intelligenceId: `${dedupeKey(event)}-${index}`, dealAccessScore: calculateDealAccessScore(event), signalProfile: getEventSignalProfile(event) }))
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
  const clusterWeeks = buildClusterWeeks(events, asOfDate);
  const clusterAlerts = buildClusterAlerts(events, asOfDate);
  const destinationEvents = buildDestinationEvents(events, asOfDate);
  const meetingDayOpportunities = buildMeetingDayOpportunities(events, asOfDate);
  const conflictAlerts = buildConflictAlerts(events);
  const opportunityGaps = buildOpportunityGaps(coldWeeks);
  const monthOverMonth = buildMonthOverMonth(events, clusterAlerts.top, asOfDate);
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
      eventCharacterCount: new Set(events.flatMap((event) => splitValues(event.eventFeatures))).size,
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
        topDealAccessEvents: events.slice().sort((a, b) => issuerAccessUseCaseScore(b) - issuerAccessUseCaseScore(a) || eventSort(a, b)).slice(0, 10).map(mapTopDealEvent),
        interpretation: {
          headline: `Capital Conference Calendar is tracking ${issuerAccessCount} issuer-access events, ${structuredAccessCount} structured-access events, and ${dealMakingCount} deal-making / partnering events across the current conference universe.`,
          readThrough: `The highest-value access layer is concentrated in events with ${oneOnOneCount} 1x1 meeting signals, ${companyPresentationCount} company-presentation signals, and ${mixedParticipationCount} mixed-participation classifications. These conferences are most likely to support issuer diligence, institutional coverage, and capital formation activity.`,
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
    clusterWeeks,
    clusterAlerts,
    destinationEvents,
    meetingDayOpportunities,
    conflictAlerts,
    opportunityGaps,
    monthOverMonth,
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
      "Intelligence calculations are based on normalized conference records keyed by title, city, and start date.",
      "Classification helpers use current Capital Conference Calendar mapped fields only and do not mutate source events.",
      "Cold weeks are rank-based and limited to normal spring and fall conference seasons.",
      "Major holiday weeks are excluded from cold-week white-space rankings.",
	      "Industry momentum uses the Events 2.0 Industry field.",
    ],
  };
}
