export type IntelligenceInputEvent = {
  id: string;
  title?: string;
  startDate: string;
  endDate?: string;
  city: string;
  state: string;
  venue?: string;
  organizer?: string;
  eventSeries?: string;
  primaryCategory: string;
  marketFocus: string;
};

export type MarketIntelligenceItem = {
  id: string;
  type: string;
  title?: string;
  body: string;
  timestamp: string;
  updatedMinutesAgo: number;
  icon: string;
  color: string;
  priority: "high" | "medium" | "low";
};

type CountItem = { label: string; count: number };

const TYPE_STYLES: Record<
  string,
  { icon: string; color: string; priority: "high" | "medium" | "low" }
> = {
  "CITY SIGNAL": { icon: "MapPin", color: "#0891b2", priority: "medium" },
  "SECTOR WATCH": { icon: "BarChart3", color: "#7c3aed", priority: "medium" },
  "MARKET CONCENTRATION": { icon: "Grid3X3", color: "#d97706", priority: "high" },
  "INVESTOR FOCUS": { icon: "Building2", color: "#059669", priority: "medium" },
  "REGIONAL ACTIVITY": { icon: "Globe2", color: "#0f766e", priority: "medium" },
  "CONFERENCE OVERLAP": { icon: "Layers", color: "#e11d48", priority: "high" },
  "SCHEDULING TREND": { icon: "TrendingUp", color: "#4f46e5", priority: "medium" },
  "30-DAY OUTLOOK": { icon: "CalendarDays", color: "#0284c7", priority: "high" },
  "HOT WEEK": { icon: "Flame", color: "#ea580c", priority: "high" },
  "CATEGORY SHIFT": { icon: "Shuffle", color: "#8b5cf6", priority: "medium" },
  "MARKET ACTIVITY UPDATE": { icon: "Activity", color: "#2563eb", priority: "low" },
  "PIPELINE WATCH": { icon: "Activity", color: "#1d4ed8", priority: "low" },
  "EVENT CLUSTER": { icon: "Network", color: "#ca8a04", priority: "high" },
  "GEOGRAPHIC MOMENTUM": { icon: "Map", color: "#0e7490", priority: "medium" },
  "EVENT WATCH": { icon: "CalendarDays", color: "#0369a1", priority: "medium" },
  "ORGANIZER SIGNAL": { icon: "Building2", color: "#0f766e", priority: "medium" },
  "SERIES WATCH": { icon: "Layers", color: "#6d28d9", priority: "medium" },
  "ACCESS WINDOW": { icon: "Flame", color: "#c2410c", priority: "high" },
};

function countBy(values: string[]): CountItem[] {
  const map = new Map<string, number>();
  for (const value of values.filter(Boolean)) {
    map.set(value, (map.get(value) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
}

function splitOptionValues(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function safe(items: CountItem[], index: number, fallback: string) {
  return items[index]?.label || fallback;
}

function safeCount(items: CountItem[], index: number) {
  return items[index]?.count || 0;
}

function getWeekStart(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimeET(date: Date): string {
  return (
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    }) + " ET"
  );
}

function buildItem(
  type: string,
  body: string,
  priorityOverride?: "high" | "medium" | "low"
): Omit<MarketIntelligenceItem, "id" | "timestamp" | "updatedMinutesAgo"> {
  const style = TYPE_STYLES[type] ?? {
    icon: "Activity",
    color: "#2563eb",
    priority: "low" as const,
  };
  return {
    type,
    body,
    icon: style.icon,
    color: style.color,
    priority: priorityOverride ?? style.priority,
  };
}

export function generateMarketIntelligence(
  events: IntelligenceInputEvent[],
  target = 35
): MarketIntelligenceItem[] {
  if (!events.length) return [];

  const normalizedEvents = events.filter((event) => event.startDate);
  const cityCounts = countBy(
    normalizedEvents
      .map((event) => [event.city, event.state].filter(Boolean).join(", ").trim())
      .filter(Boolean)
  );
  const categoryCounts = countBy(normalizedEvents.map((event) => event.primaryCategory));
  const focusCounts = countBy(
    normalizedEvents.flatMap((event) => splitOptionValues(event.marketFocus))
  );
  const weekCounts = countBy(normalizedEvents.map((event) => getWeekStart(event.startDate)));
  const monthCounts = countBy(normalizedEvents.map((event) => event.startDate.slice(0, 7)));
  const organizerCounts = countBy(normalizedEvents.map((event) => event.organizer || ""));
  const seriesCounts = countBy(normalizedEvents.map((event) => event.eventSeries || ""));

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const next30 = new Date(todayUTC);
  next30.setUTCDate(next30.getUTCDate() + 30);

  const next30Count = normalizedEvents.filter((event) => {
    const d = new Date(`${event.startDate}T00:00:00Z`);
    return d >= todayUTC && d <= next30;
  }).length;

  const topCity = safe(cityCounts, 0, "New York, NY");
  const secondCity = safe(cityCounts, 1, "Dallas, TX");
  const thirdCity = safe(cityCounts, 2, "Washington, DC");
  const topCategory = safe(categoryCounts, 0, "Industry / Thematic Conference");
  const secondCategory = safe(categoryCounts, 1, "Investor Conference");
  const topFocus = safe(focusCounts, 0, "Institutional Investors");
  const secondFocus = safe(focusCounts, 1, "Industry Networking");
  const topWeek = safe(weekCounts, 0, todayUTC.toISOString().slice(0, 10));
  const secondWeek = safe(weekCounts, 1, topWeek);
  const topWeekCount = safeCount(weekCounts, 0);
  const secondWeekCount = safeCount(weekCounts, 1);
  const topCityCount = safeCount(cityCounts, 0);
  const secondCityCount = safeCount(cityCounts, 1);
  const topOrganizer = safe(organizerCounts, 0, "a recurring organizer");
  const secondOrganizer = safe(organizerCounts, 1, "peer organizers");
  const topSeries = safe(seriesCounts, 0, "key conference series");
  const namedEvents = normalizedEvents
    .filter((event) => event.title)
    .slice(0, 20);

  const feed: Omit<MarketIntelligenceItem, "id" | "timestamp" | "updatedMinutesAgo">[] = [];

  feed.push(
    buildItem(
      "MARKET CONCENTRATION",
      `Conference density remains elevated heading into the week of ${formatShortDate(topWeek)}, with ${topWeekCount} tracked events concentrated across core markets. ${topCity} continues to anchor near-term activity, while ${secondCity} and ${thirdCity} remain active enough to sustain overlap risk. This pattern indicates continued schedule compression for teams balancing multiple institutional conference workflows.`,
      topWeekCount >= 10 ? "high" : "medium"
    )
  );

  if (next30Count > 50) {
    feed.push(
      buildItem(
        "30-DAY OUTLOOK",
        `Near-term calendar depth remains strong with ${next30Count} conferences currently scheduled over the next 30 days. Activity is distributed across leading conference hubs instead of collapsing into a single window, which supports broad but busy coverage conditions. Operationally, this suggests conference planning pressure is likely to stay elevated through the next cycle.`,
        "high"
      )
    );
  } else {
    feed.push(
      buildItem(
        "30-DAY OUTLOOK",
        `${next30Count} conferences are currently visible across the next 30-day period in the tracked calendar. Near-term activity remains active enough to create selective overlap windows in core cities and categories. The pipeline suggests steady scheduling continuity rather than abrupt near-term contraction.`,
        "medium"
      )
    );
  }

  if (topCityCount > 10) {
    feed.push(
      buildItem(
        "CITY SIGNAL",
        `${topCity} is showing elevated conference concentration with ${topCityCount} tracked events in the current dataset. ${secondCity} remains close enough to sustain multi-city competition for attention in peak weeks, while ${thirdCity} continues to add depth. This distribution suggests market activity is broadening across multiple institutional hubs.`,
        "high"
      )
    );
  }

  if (topWeekCount > 10) {
    feed.push(
      buildItem(
        "HOT WEEK",
        `The week of ${formatShortDate(topWeek)} is currently running as a high-intensity conference window across tracked markets. Event density in that period remains materially above surrounding weeks, with recurring participation from both ${topCategory} and ${secondCategory} calendars. For market teams, this level of concentration typically increases coordination and prioritization demands.`,
        "high"
      )
    );
  }

  if (Math.abs(topCityCount - secondCityCount) <= 4) {
    feed.push(
      buildItem(
        "GEOGRAPHIC MOMENTUM",
        `${topCity} remains the largest individual conference center, but ${secondCity} is holding comparable scheduling volume in the same planning horizon. ${thirdCity} continues to reinforce national breadth rather than allowing concentration in a single corridor. The resulting footprint indicates sustained multi-region institutional activity.`,
        "medium"
      )
    );
  }

  const monthTemplates = monthCounts.slice(0, 3).map((month, idx) => {
    const prior = monthCounts[idx + 1];
    if (!prior) return null;
    const delta = month.count - prior.count;
    const phrasing =
      delta > 0
        ? `increased by ${delta} events`
        : delta < 0
        ? `eased by ${Math.abs(delta)} events`
        : "held steady";
    return buildItem(
      "SCHEDULING TREND",
      `Conference scheduling for ${month.label} has ${phrasing} compared with the prior month in the tracked dataset. Even with that shift, activity remains centered on established institutional markets with recurring multi-week overlap. The trend suggests a stable-to-firm scheduling baseline rather than abrupt directional changes.`,
      delta >= 5 ? "high" : "medium"
    );
  });

  for (const template of monthTemplates) {
    if (template) feed.push(template);
  }

  const variants: Array<() => Omit<MarketIntelligenceItem, "id" | "timestamp" | "updatedMinutesAgo">> = [
    () =>
      buildItem(
        "SECTOR WATCH",
        `${topCategory} continues to lead overall conference volume, while ${secondCategory} remains close behind in high-activity weeks. The overlap between those two categories is showing up repeatedly in the same city clusters and scheduling windows. This indicates thematic concentration remains durable across the near-term conference pipeline.`
      ),
    () =>
      buildItem(
        "INVESTOR FOCUS",
        `${topFocus} continues to dominate participation profiles across tracked conferences. ${secondFocus} remains active across a wider city mix, suggesting institutional engagement is not limited to one event format. The combined pattern supports a broad but consistently investor-oriented activity base.`
      ),
    () =>
      buildItem(
        "REGIONAL ACTIVITY",
        `Regional activity remains anchored by ${topCity}, ${secondCity}, and ${thirdCity} in the current event cycle. Those markets appear repeatedly across upcoming weeks rather than in isolated spikes, which indicates sustained depth. Coverage teams should expect continued multi-region scheduling pressure instead of a single-location peak.`
      ),
    () =>
      buildItem(
        "CONFERENCE OVERLAP",
        `Overlap intensity remains highest between the weeks of ${formatShortDate(topWeek)} and ${formatShortDate(secondWeek)} across major markets. Activity in those windows spans multiple categories and focus profiles, increasing the likelihood of parallel timing conflicts. This overlap profile suggests tighter prioritization will remain necessary for institutional calendars.`,
        topWeekCount >= 10 || secondWeekCount >= 10 ? "high" : "medium"
      ),
    () =>
      buildItem(
        "CATEGORY SHIFT",
        `${topCategory} remains the largest category by count, but ${secondCategory} is appearing more frequently in adjacent high-density windows. That relative movement points to a gradual category rebalance rather than a sharp handoff. The shift suggests conference mix is broadening while core themes still hold share.`
      ),
    () =>
      buildItem(
        "PIPELINE WATCH",
        `Pipeline visibility remains steady across the next scheduling window, with recurring additions concentrated in already active markets. Calendar depth is being sustained by a mix of established conference series and repeat institutional hubs. This pattern typically indicates continuity in near-term conference coverage demand.`,
        "low"
      ),
    () =>
      buildItem(
        "EVENT CLUSTER",
        `Event clusters are continuing to form around the busiest city corridors, especially where recurring organizers are active in adjacent dates. These clusters are increasing same-week density and raising the probability of overlapping attendance decisions. The current footprint suggests cluster-driven planning complexity remains elevated.`,
        topWeekCount >= 10 ? "high" : "medium"
      ),
    () =>
      buildItem(
        "MARKET ACTIVITY UPDATE",
        `Tracked conference activity remains firm across the current cycle with no clear signs of near-term deceleration in core hubs. Scheduling depth is being supported by recurring city leadership and consistent category participation. This suggests operational conditions remain active and coverage-intensive across institutional calendars.`,
        "low"
      ),
    () =>
      buildItem(
        "CITY SIGNAL",
        `${topCity} continues to lead absolute activity, but ${secondCity} is maintaining enough volume to keep concentration from becoming single-market dependent. ${thirdCity} remains consistently present in high-traffic weeks and adds regional balance to the pipeline. Together, these cities are shaping most near-term institutional conference flow.`
      ),
    () =>
      buildItem(
        "MARKET CONCENTRATION",
        `Conference concentration remains strongest in the top two weekly windows, with ${topWeekCount} and ${secondWeekCount} events respectively. The density is reinforced by repeat appearances from leading categories and investor-focused formats. That structure indicates calendar compression risk remains an active operating constraint.`,
        topWeekCount > 9 ? "high" : "medium"
      ),
    () => {
      const event = namedEvents[variantSeed % Math.max(1, namedEvents.length)];
      const location = [event?.city, event?.state].filter(Boolean).join(", ");
      variantSeed += 1;
      return buildItem(
        "EVENT WATCH",
        `${event?.title || "A tracked conference"} is contributing to an already active market window${location ? ` in ${location}` : ""}. The event is landing in a period that already includes multiple institutional schedules across nearby dates. That timing supports the view that overlap risk remains elevated in core conference markets.`
      );
    },
    () => {
      const first = namedEvents[(variantSeed + 1) % Math.max(1, namedEvents.length)];
      const second = namedEvents[(variantSeed + 2) % Math.max(1, namedEvents.length)];
      variantSeed += 1;
      return buildItem(
        "ACCESS WINDOW",
        `The week around ${formatShortDate(first?.startDate || topWeek)} includes ${first?.title || "several investor-facing events"}${second?.title ? ` alongside ${second.title}` : ""}, creating a concentrated access window for market teams. These events are appearing inside already crowded scheduling periods rather than isolated low-density dates. The resulting compression suggests tighter prioritization remains necessary for institutional coverage.`,
        "high"
      );
    },
    () =>
      buildItem(
        "ORGANIZER SIGNAL",
        `${topOrganizer} appears repeatedly across the current conference set and is reinforcing activity across multiple active weeks. ${secondOrganizer} is also showing recurring placement, which broadens organizer-driven scheduling depth across markets. This repeat pattern indicates pipeline continuity is being supported by recurring institutional programming rather than one-off events.`
      ),
    () => {
      const seriesEvent = namedEvents.find((event) => event.eventSeries) || namedEvents[3];
      return buildItem(
        "SERIES WATCH",
        `${seriesEvent?.eventSeries || topSeries} is continuing to surface in the near-term schedule and is reinforcing thematic continuity across active weeks. Related events are landing in windows that already show above-average density in leading categories and cities. That series cadence suggests conference concentration is likely to stay structurally firm in the next cycle.`
      );
    },
  ];

  const targetSize = Math.max(25, target);
  let variantSeed = 0;
  let variantIndex = 0;
  while (feed.length < targetSize) {
    feed.push(variants[variantIndex % variants.length]());
    variantIndex += 1;
  }

  const nowBase = new Date();
  nowBase.setSeconds(0, 0);
  let minutesAgo = 5;
  const withTime = feed.map((item, index) => {
    if (index > 0) {
      const spacingPattern = [4, 5, 6, 7, 8];
      minutesAgo += spacingPattern[(index - 1) % spacingPattern.length];
    }
    const ts = new Date(nowBase.getTime() - minutesAgo * 60 * 1000);
    return {
      ...item,
      id: `intel-${index}-${item.type.toLowerCase().replace(/\s+/g, "-")}`,
      timestamp: formatTimeET(ts),
      updatedMinutesAgo: minutesAgo,
    };
  });

  const priorityRank = { high: 0, medium: 1, low: 2 };
  return withTime.sort((a, b) => {
    const p = priorityRank[a.priority] - priorityRank[b.priority];
    if (p !== 0) return p;
    return a.updatedMinutesAgo - b.updatedMinutesAgo;
  });
}
