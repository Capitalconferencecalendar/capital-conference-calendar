export type InternalMarketEvent = {
  id: string;
  title: string;
  startDate: string;
  issuerParticipation?: string;
  classificationEvidence?: string;
  eventIntelligenceProfile?: string;
  organizerPositioningSummary?: string;
  promotionalClaims?: string;
  notes?: string;
  createdAt?: string;
  lastModifiedAt?: string;
};

export type InternalMarketIntelligence = {
  notableSignals: string[];
  accessRead: string | null;
  eventReads: Array<{
    title: string;
    intelligenceRead: string;
    whyItMatters: string;
    accessRead: string | null;
    comparableRationale: string;
  }>;
  marketWindowReads: Array<{ weekStart: string; intelligenceRead: string }>;
  signalChanges: {
    addedInLast30Days: number | null;
    updatedInLast30Days: number | null;
    latestActivityDate: string | null;
  } | null;
};

function normalize(value: string | undefined) {
  return (value || "").toLowerCase();
}

function readSignals(event: InternalMarketEvent) {
  const context = normalize([
    event.classificationEvidence,
    event.eventIntelligenceProfile,
    event.organizerPositioningSummary,
    event.notes,
  ].filter(Boolean).join(" "));
  const signals: string[] = [];
  if (/(issuer|public compan|corporate access|management team|roadshow)/.test(context)) signals.push("issuer engagement");
  if (/(investor|institutional|family office|allocator|lp\b|gp\b)/.test(context)) signals.push("investor relevance");
  if (/(1x1|one[- ]on[- ]one|meeting|presentation)/.test(context)) signals.push("structured access");
  if (/(partner|deal|business development|transaction)/.test(context)) signals.push("deal activity");
  if (/(sector|healthcare|technology|energy|real estate|financial)/.test(context)) signals.push("sector context");
  return signals;
}

function toDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(value);
}

export function buildInternalMarketIntelligence(events: InternalMarketEvent[], now = new Date()): InternalMarketIntelligence {
  const reads = events.map((event) => {
    const signals = readSignals(event);
    if (!signals.length) return null;
    const primarySignals = signals.slice(0, 2).join(" and ");
    const hasAccess = signals.includes("structured access") || signals.includes("issuer engagement");
    return {
      title: event.title,
      intelligenceRead: `Intelligence read identifies ${primarySignals}.`,
      whyItMatters: hasAccess
        ? "This adds context when comparing potential access-oriented conference opportunities."
        : "This adds context when comparing related conference opportunities.",
      accessRead: hasAccess ? `The available context supports an ${signals.includes("structured access") ? "access-oriented" : "issuer-engagement"} read.` : null,
      comparableRationale: `Comparable rationale: shared ${primarySignals} context.`,
    };
  }).filter(Boolean) as InternalMarketIntelligence["eventReads"];

  const evidenceCount = events.filter((event) => Boolean(event.classificationEvidence || event.eventIntelligenceProfile || event.organizerPositioningSummary || event.notes)).length;
  const accessContextCount = reads.filter((read) => Boolean(read.accessRead)).length;
  const claimCount = events.filter((event) => Boolean(event.promotionalClaims)).length;
  const notableSignals: string[] = [];
  if (evidenceCount) notableSignals.push(`Intelligence reads support concise comparisons across ${evidenceCount} approved event${evidenceCount === 1 ? "" : "s"}.`);
  if (accessContextCount) notableSignals.push(`${accessContextCount} event${accessContextCount === 1 ? " has" : "s have"} supporting context for an access-oriented read alongside structured classifications.`);
  if (claimCount) notableSignals.push(`${claimCount} event${claimCount === 1 ? " includes" : "s include"} organizer-stated claims; these are treated as attributed context, not verified facts.`);

  const windowMap = new Map<string, InternalMarketEvent[]>();
  events.forEach((event) => {
    const date = toDate(event.startDate);
    if (!date) return;
    const day = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
    const weekStart = date.toISOString().slice(0, 10);
    windowMap.set(weekStart, [...(windowMap.get(weekStart) || []), event]);
  });
  const marketWindowReads = Array.from(windowMap.entries()).flatMap(([weekStart, items]) => {
    const contextual = items.filter((item) => readSignals(item).length).length;
    return contextual ? [{ weekStart, intelligenceRead: `Intelligence read: ${contextual} event${contextual === 1 ? " has" : "s have"} additional context in this market window.` }] : [];
  });

  const threshold = new Date(now);
  threshold.setUTCDate(threshold.getUTCDate() - 30);
  const createdDates = events.map((event) => toDate(event.createdAt)).filter(Boolean) as Date[];
  const modifiedDates = events.map((event) => toDate(event.lastModifiedAt)).filter(Boolean) as Date[];
  const activityDates = [...createdDates, ...modifiedDates].sort((a, b) => b.getTime() - a.getTime());
  const signalChanges = createdDates.length || modifiedDates.length
    ? {
        addedInLast30Days: createdDates.filter((date) => date >= threshold).length,
        updatedInLast30Days: modifiedDates.filter((date) => date >= threshold).length,
        latestActivityDate: activityDates[0] ? dateLabel(activityDates[0]) : null,
      }
    : null;

  return {
    notableSignals,
    accessRead: accessContextCount ? `${accessContextCount} event${accessContextCount === 1 ? " has" : "s have"} supporting context for the current access read.` : null,
    eventReads: reads.slice(0, 24),
    marketWindowReads,
    signalChanges,
  };
}
