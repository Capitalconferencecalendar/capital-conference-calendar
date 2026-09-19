import {
  buildMarketViewIntelligence,
  isCompanyPresentationEvent,
  isDealMakingEvent,
  isInvestorHeavyEvent,
  isIssuerAccessEvent,
  isOneOnOneEvent,
  isStructuredAccessEvent,
  type MarketViewEventInput,
  type WeeklyIntensityRow,
} from "./marketViewIntelligence";

type CurrentField =
  | "conferenceType"
  | "industry"
  | "investmentFocus"
  | "targetAudience"
  | "companyParticipants"
  | "eventFeatures"
  | "accessModel";

export type IntelligenceScope = {
  population: "full-market" | "filtered-market";
  activeFilters: Record<string, string[]>;
  asOfDate: string;
  dateWindow: { startDate: string; endDate: string };
  geography: string[];
  eligibleEventCount: number;
  comparisonPopulation: {
    label: string;
    eventCount: number;
    dateWindow: { startDate: string; endDate: string } | null;
  };
};

export type IntelligenceEvidence = {
  label: string;
  value: number | string;
  unit?: "events" | "metros" | "percent" | "days" | "score";
  source: CurrentField | "weekly-intensity" | "nearby-week-baseline";
  calculation: string;
  supportingEventIds?: string[];
};

export type IntelligenceSupportingEvent = {
  id: string;
  title: string;
  startDate: string;
  city: string;
  state: string;
  signals: Array<"issuer-access" | "investor-heavy" | "structured-access" | "deal-making" | "company-presentations" | "1x1-meetings">;
};

export type IntelligenceCoverage = {
  requiredFields: Array<{
    field: CurrentField;
    populatedEventCount: number;
    eligibleEventCount: number;
    coveragePct: number;
  }>;
  overallCoveragePct: number;
  unknownValuesAreExcluded: true;
};

export type IntelligenceConfidence = {
  score: number;
  methodology: "deterministic evidence quality score; not statistical confidence";
  components: {
    fieldCoveragePct: number;
    supportingRecordAdequacyPct: number;
    signalStrengthPct: number;
    comparisonPopulationAdequacyPct: number;
  };
};

export type IntelligenceFinding = {
  id: string;
  type: "weekly-market-signal";
  scope: IntelligenceScope;
  headline: string;
  finding: string;
  whyItMatters: string;
  evidence: IntelligenceEvidence[];
  comparison: {
    label: string;
    baselineValue: number | null;
    unit: "events";
    relationship: "above" | "below" | "in-line" | "unavailable";
    difference: number | null;
  };
  supportingEvents: IntelligenceSupportingEvent[];
  drivers: Array<"issuer-access" | "investor-heavy" | "structured-access" | "deal-making" | "company-presentations" | "1x1-meetings" | "calendar-density">;
  confidence: IntelligenceConfidence;
  coverage: IntelligenceCoverage;
  limitation: string;
  methodology: string;
};

export type WeeklyMarketSignalOptions = {
  scope: Omit<IntelligenceScope, "eligibleEventCount" | "dateWindow"> & {
    dateWindow?: { startDate: string; endDate: string };
  };
};

const REQUIRED_FIELDS: CurrentField[] = [
  "conferenceType",
  "targetAudience",
  "companyParticipants",
  "industry",
  "eventFeatures",
  "accessModel",
];

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function eventInWeek(event: MarketViewEventInput, week: WeeklyIntensityRow) {
  const date = event.startDate?.slice(0, 10) || "";
  return date >= week.weekStart && date <= week.weekEnd;
}

function signalNames(event: MarketViewEventInput): IntelligenceSupportingEvent["signals"] {
  const signals: IntelligenceSupportingEvent["signals"] = [];
  if (isIssuerAccessEvent(event)) signals.push("issuer-access");
  if (isInvestorHeavyEvent(event)) signals.push("investor-heavy");
  if (isStructuredAccessEvent(event)) signals.push("structured-access");
  if (isDealMakingEvent(event)) signals.push("deal-making");
  if (isCompanyPresentationEvent(event)) signals.push("company-presentations");
  if (isOneOnOneEvent(event)) signals.push("1x1-meetings");
  return signals;
}

function driversForWeek(week: WeeklyIntensityRow): IntelligenceFinding["drivers"] {
  const drivers: IntelligenceFinding["drivers"] = [];
  if (week.issuerAccessEvents) drivers.push("issuer-access");
  if (week.investorHeavyEvents) drivers.push("investor-heavy");
  if (week.structuredAccessEvents) drivers.push("structured-access");
  if (week.dealMakingEvents) drivers.push("deal-making");
  if (week.companyPresentationEvents) drivers.push("company-presentations");
  if (week.oneOnOneEvents) drivers.push("1x1-meetings");
  if (!drivers.length) drivers.push("calendar-density");
  return drivers;
}

function dominantDriver(week: WeeklyIntensityRow) {
  if (week.issuerAccessEvents) return "issuer-access" as const;
  if (week.structuredAccessEvents || week.oneOnOneEvents) return "structured-access" as const;
  if (week.investorHeavyEvents) return "investor-heavy" as const;
  if (week.dealMakingEvents) return "deal-making" as const;
  if (week.companyPresentationEvents) return "company-presentations" as const;
  return "calendar-density" as const;
}

function buildHeadline(week: WeeklyIntensityRow, driver: ReturnType<typeof dominantDriver>) {
  const location = week.topCity || "the current market";
  if (driver === "issuer-access") return `Issuer access concentrates in a ${location} conference week`;
  if (driver === "structured-access") return `Structured access concentrates in a ${location} planning window`;
  if (driver === "investor-heavy") return `Investor-heavy conferences concentrate in a ${location} calendar week`;
  if (driver === "deal-making") return `Deal-making signals concentrate in a ${location} conference week`;
  if (driver === "company-presentations") return `Company presentations concentrate in a ${location} calendar week`;
  return `Conference activity concentrates in a ${location} planning window`;
}

function buildFinding(week: WeeklyIntensityRow, driver: ReturnType<typeof dominantDriver>) {
  const core = `${week.totalEvents} approved upcoming conference${week.totalEvents === 1 ? " is" : "s are"} scheduled for ${week.label} across ${week.cityCount} metro${week.cityCount === 1 ? "" : "s"}.`;
  if (driver === "issuer-access") return `${core} ${week.issuerAccessEvents} carry issuer-access signals, with ${week.oneOnOneEvents} indicating confirmed 1x1 meeting structure.`;
  if (driver === "structured-access") return `${core} ${week.structuredAccessEvents} carry structured-access signals, including ${week.oneOnOneEvents} with confirmed 1x1 meetings.`;
  if (driver === "investor-heavy") return `${core} ${week.investorHeavyEvents} are classified as investor-heavy based on conference type or target audience.`;
  if (driver === "deal-making") return `${core} ${week.dealMakingEvents} carry deal-making or partnering signals.`;
  if (driver === "company-presentations") return `${core} ${week.companyPresentationEvents} list company presentations.`;
  return `${core} The week ranks highest in the included calendar population using the existing weekly-intensity calculation.`;
}

function buildWhyItMatters(week: WeeklyIntensityRow, driver: ReturnType<typeof dominantDriver>) {
  if (driver === "issuer-access" || driver === "structured-access") return "This is a calendar-planning signal: overlapping access-oriented events can create competing coverage, travel, and meeting-prioritization decisions.";
  if (driver === "investor-heavy") return "This is a calendar-planning signal: overlapping investor-oriented events can increase scheduling competition for teams covering the same audience.";
  if (driver === "deal-making") return "This is a calendar-planning signal: overlapping partnering-oriented events can concentrate business-development activity into a short window.";
  return "This is a calendar-planning signal: elevated event density can create competing coverage and travel decisions within the same week.";
}

function buildCoverage(events: readonly MarketViewEventInput[]): IntelligenceCoverage {
  const eligibleEventCount = events.length;
  const requiredFields = REQUIRED_FIELDS.map((field) => {
    const populatedEventCount = events.filter((event) => hasValue(event[field])).length;
    return {
      field,
      populatedEventCount,
      eligibleEventCount,
      coveragePct: eligibleEventCount ? Math.round((populatedEventCount / eligibleEventCount) * 100) : 0,
    };
  });
  return {
    requiredFields,
    overallCoveragePct: requiredFields.length
      ? Math.round(requiredFields.reduce((total, field) => total + field.coveragePct, 0) / requiredFields.length)
      : 0,
    unknownValuesAreExcluded: true,
  };
}

function buildConfidence(coverage: IntelligenceCoverage, supportingCount: number, signalStrengthPct: number, comparisonEventCount: number): IntelligenceConfidence {
  const components = {
    fieldCoveragePct: coverage.overallCoveragePct,
    supportingRecordAdequacyPct: Math.min(100, Math.round((supportingCount / 6) * 100)),
    signalStrengthPct,
    comparisonPopulationAdequacyPct: Math.min(100, Math.round((comparisonEventCount / 15) * 100)),
  };
  return {
    score: Math.round(
      (components.fieldCoveragePct * 0.4) +
      (components.supportingRecordAdequacyPct * 0.25) +
      (components.signalStrengthPct * 0.2) +
      (components.comparisonPopulationAdequacyPct * 0.15)
    ),
    methodology: "deterministic evidence quality score; not statistical confidence",
    components,
  };
}

function nearbyWeekBaseline(weeks: WeeklyIntensityRow[], selected: WeeklyIntensityRow) {
  const nearby = weeks.filter((week) => week.weekStart !== selected.weekStart && Math.abs(new Date(`${week.weekStart}T00:00:00Z`).getTime() - new Date(`${selected.weekStart}T00:00:00Z`).getTime()) <= 35 * 86_400_000);
  if (!nearby.length) return { baseline: null, count: 0 };
  return { baseline: Math.round((nearby.reduce((total, week) => total + week.totalEvents, 0) / nearby.length) * 10) / 10, count: nearby.length };
}

export function buildWeeklyMarketSignal(
  events: readonly MarketViewEventInput[],
  options: WeeklyMarketSignalOptions
): IntelligenceFinding | null {
  const intelligence = buildMarketViewIntelligence(events, { asOfDate: options.scope.asOfDate });
  const selected = intelligence.hotWeeks.top[0];
  if (!selected) return null;

  const supportingSourceEvents = events.filter((event) => eventInWeek(event, selected));
  const supportingEvents = supportingSourceEvents.map((event, index) => ({
    id: event.id || `unidentified-${index + 1}`,
    title: event.title || "Untitled conference",
    startDate: event.startDate || "",
    city: event.city || "",
    state: event.state || "",
    signals: signalNames(event),
  }));
  const supportingIds = supportingEvents.map((event) => event.id);
  const coverage = buildCoverage(events);
  const nearby = nearbyWeekBaseline(intelligence.weeklyIntensity, selected);
  const driver = dominantDriver(selected);
  const signalStrengthPct = Math.min(100, Math.round((selected.intensityScore / Math.max(...intelligence.weeklyIntensity.map((week) => week.intensityScore), 1)) * 100));
  const baselineDifference = nearby.baseline === null ? null : Math.round((selected.totalEvents - nearby.baseline) * 10) / 10;
  const relationship = baselineDifference === null ? "unavailable" : baselineDifference > 0 ? "above" : baselineDifference < 0 ? "below" : "in-line";
  const inferredDateWindow = { startDate: selected.weekStart, endDate: selected.weekEnd };
  const scope: IntelligenceScope = {
    ...options.scope,
    dateWindow: options.scope.dateWindow || inferredDateWindow,
    eligibleEventCount: events.length,
  };

  return {
    id: `weekly-market-signal:${selected.weekStart}:${scope.population}`,
    type: "weekly-market-signal",
    scope,
    headline: buildHeadline(selected, driver),
    finding: buildFinding(selected, driver),
    whyItMatters: buildWhyItMatters(selected, driver),
    evidence: [
      { label: "Approved upcoming events", value: selected.totalEvents, unit: "events", source: "weekly-intensity", calculation: "Count of scoped approved events with a start date in the selected Monday-Sunday week.", supportingEventIds: supportingIds },
      { label: "Metros represented", value: selected.cityCount, unit: "metros", source: "weekly-intensity", calculation: "Distinct city/metro labels among scoped events in the selected week.", supportingEventIds: supportingIds },
      { label: "Issuer-access events", value: selected.issuerAccessEvents, unit: "events", source: "conferenceType", calculation: "Existing issuer-access classification using Conference Type, Event Features, and Company Participants.", supportingEventIds: supportingEvents.filter((event) => event.signals.includes("issuer-access")).map((event) => event.id) },
      { label: "Company presentation events", value: selected.companyPresentationEvents, unit: "events", source: "eventFeatures", calculation: "Scoped events whose Event Features include Company Presentations.", supportingEventIds: supportingEvents.filter((event) => event.signals.includes("company-presentations")).map((event) => event.id) },
      { label: "Confirmed 1x1 meeting events", value: selected.oneOnOneEvents, unit: "events", source: "eventFeatures", calculation: "Scoped events whose Event Features include 1x1 Meetings.", supportingEventIds: supportingEvents.filter((event) => event.signals.includes("1x1-meetings")).map((event) => event.id) },
      { label: "Nearby-week baseline", value: nearby.baseline ?? "Unavailable", unit: "events", source: "nearby-week-baseline", calculation: `Average event count across ${nearby.count} other scoped weeks within 35 days of the selected week.` },
    ],
    comparison: {
      label: "Nearby scoped-week event-count baseline",
      baselineValue: nearby.baseline,
      unit: "events",
      relationship,
      difference: baselineDifference,
    },
    supportingEvents,
    drivers: driversForWeek(selected),
    confidence: buildConfidence(coverage, supportingEvents.length, signalStrengthPct, scope.comparisonPopulation.eventCount),
    coverage,
    limitation: "This measures approved conference-calendar concentration and mapped access signals, not attendance, investor demand, transaction volume, or event quality.",
    methodology: "Uses the existing deterministic weekly-intensity and Hot Week ranking calculation. V2 preserves the supplied scope, then reports field completeness and event-level support separately from the planning interpretation.",
  };
}
