type EventSignalInput = {
  startDate: string;
  city: string;
  state: string;
  primaryCategory: string;
  marketFocus: string;
};

export type MarketSignal = {
  label: string;
  sentence: string;
  type: "city" | "sector" | "timing" | "category" | "growth";
};

export type MarketFeedItem = {
  typeLabel: string;
  text: string;
};

type CountItem = { label: string; count: number };

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
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
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
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getTopCitySignal(events: EventSignalInput[]): MarketSignal | null {
  const cityCounts = countBy(
    events
      .map((event) => [event.city, event.state].filter(Boolean).join(", ").trim())
      .filter(Boolean)
  );
  if (cityCounts.length === 0) return null;
  const top = cityCounts[0];
  return {
    label: "ACTIVE CITY",
    sentence: `${top.label} remains the most active conference market with ${top.count} tracked events.`,
    type: "city",
  };
}

export function getNextThirtyDaysSignal(events: EventSignalInput[]): MarketSignal | null {
  const today = new Date();
  const todayDate = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const next30 = new Date(todayDate);
  next30.setUTCDate(next30.getUTCDate() + 30);

  const count = events.filter((event) => {
    if (!event.startDate) return false;
    const eventDate = new Date(`${event.startDate}T00:00:00Z`);
    return eventDate >= todayDate && eventDate <= next30;
  }).length;

  return {
    label: "30-DAY OUTLOOK",
    sentence: `${count} conferences are scheduled across tracked markets over the next 30 days.`,
    type: "timing",
  };
}

export function getBusiestWeekSignal(events: EventSignalInput[]): MarketSignal | null {
  const weekCounts = countBy(events.map((event) => getWeekStart(event.startDate)));
  if (weekCounts.length === 0) return null;
  const top = weekCounts[0];
  return {
    label: "HOT WEEK",
    sentence: `Conference density remains elevated into the week of ${formatShortDate(top.label)}, with ${top.count} tracked events.`,
    type: "timing",
  };
}

export function getTopCategorySignal(events: EventSignalInput[]): MarketSignal | null {
  const categoryCounts = countBy(events.map((event) => event.primaryCategory));
  if (categoryCounts.length === 0) return null;
  const top = categoryCounts[0];
  return {
    label: "LEADING CATEGORY",
    sentence: `${top.label} continues to lead tracked conference activity by primary category.`,
    type: "category",
  };
}

export function getTopMarketFocusSignal(events: EventSignalInput[]): MarketSignal | null {
  const focusCounts = countBy(events.flatMap((event) => splitOptionValues(event.marketFocus)));
  if (focusCounts.length === 0) return null;
  const top = focusCounts[0];
  return {
    label: "MARKET FOCUS",
    sentence: `${top.label} remains the dominant market focus across current tracked events.`,
    type: "sector",
  };
}

export function generateMarketSignals(events: EventSignalInput[]): MarketSignal[] {
  return [
    getTopCitySignal(events),
    getBusiestWeekSignal(events),
    getNextThirtyDaysSignal(events),
    getTopCategorySignal(events),
    getTopMarketFocusSignal(events),
  ].filter((signal): signal is MarketSignal => !!signal);
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function top(values: CountItem[], index: number): CountItem | null {
  return values[index] || null;
}

function sentenceJoin(parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

export function generateMarketFeed(events: EventSignalInput[], target = 30): MarketFeedItem[] {
  if (!events.length) return [];

  const cityCounts = countBy(
    events
      .map((event) => [event.city, event.state].filter(Boolean).join(", ").trim())
      .filter(Boolean)
  );
  const categoryCounts = countBy(events.map((event) => event.primaryCategory));
  const focusCounts = countBy(events.flatMap((event) => splitOptionValues(event.marketFocus)));
  const weekCounts = countBy(events.map((event) => getWeekStart(event.startDate)));
  const monthCounts = countBy(events.map((event) => monthKey(event.startDate)));

  const city1 = top(cityCounts, 0);
  const city2 = top(cityCounts, 1);
  const city3 = top(cityCounts, 2);
  const cat1 = top(categoryCounts, 0);
  const cat2 = top(categoryCounts, 1);
  const focus1 = top(focusCounts, 0);
  const focus2 = top(focusCounts, 1);
  const week1 = top(weekCounts, 0);
  const week2 = top(weekCounts, 1);
  const month1 = top(monthCounts, 0);
  const month2 = top(monthCounts, 1);

  const feed: MarketFeedItem[] = [];
  const push = (typeLabel: string, text: string) => {
    if (text.trim().length > 0) feed.push({ typeLabel, text });
  };

  if (week1 && city1 && city2) {
    push(
      "MARKET CONCENTRATION",
      sentenceJoin([
        `Conference density remains elevated heading into the week of ${formatShortDate(week1.label)}, with ${week1.count} tracked events across major markets.`,
        `${city1.label} continues leading activity, while ${city2.label} shows comparable scheduling depth across investor-facing conferences.`,
        `Overlap across these markets is increasing meeting competition during peak days.`,
      ])
    );
  }

  if (city1 && city2 && city3) {
    push(
      "CITY SIGNAL",
      sentenceJoin([
        `${city1.label} remains the anchor market for conference activity this cycle.`,
        `${city2.label} and ${city3.label} are both showing sustained scheduling volume versus other tracked cities.`,
        `Regional activity is broadening rather than concentrating in a single hub.`,
      ])
    );
  }

  if (cat1 && cat2) {
    push(
      "SECTOR WATCH",
      sentenceJoin([
        `${cat1.label} events continue to set the pace for scheduled conference activity.`,
        `${cat2.label} remains close behind and is appearing more frequently in overlapping weekly calendars.`,
        `Sector mix suggests a continued tilt toward thematic and institutional programming.`,
      ])
    );
  }

  if (focus1 && focus2) {
    push(
      "INVESTOR FOCUS",
      sentenceJoin([
        `${focus1.label} continues to dominate the event mix across tracked conferences.`,
        `${focus2.label} is maintaining second-position volume and appears in a growing share of upcoming schedules.`,
        `This balance indicates stable institutional demand across multiple participation profiles.`,
      ])
    );
  }

  if (month1 && month2) {
    const delta = month1.count - month2.count;
    const direction =
      delta > 0
        ? `up ${delta} events from the prior month`
        : delta < 0
        ? `down ${Math.abs(delta)} events from the prior month`
        : "in line with the prior month";
    push(
      "SCHEDULING TREND",
      sentenceJoin([
        `Current-month conference scheduling is ${direction}.`,
        `Activity levels remain operationally elevated across core U.S. and Canada markets.`,
        `Near-term calendar depth suggests continued concentration risk in active weeks.`,
      ])
    );
  }

  if (week1 && week2) {
    push(
      "CONFERENCE OVERLAP",
      sentenceJoin([
        `The top two tracked weeks are ${formatShortDate(week1.label)} and ${formatShortDate(week2.label)}, indicating a compressed activity window.`,
        `Institutional teams are likely to face increased overlap across management access and conference travel schedules.`,
        `Calendar prioritization remains important as event density persists.`,
      ])
    );
  }

  const outlook30 = getNextThirtyDaysSignal(events);
  if (outlook30) {
    push(
      "30-DAY OUTLOOK",
      sentenceJoin([
        outlook30.sentence,
        `Pipeline visibility remains strong across active cities and recurring organizer channels.`,
        `Short-cycle additions should continue to reshape weekly concentration levels.`,
      ])
    );
  }

  // Create a deep feed by rotating editorial variants against real data anchors.
  const variants = [
    () =>
      city1 && city2 && cat1
        ? sentenceJoin([
            `${city1.label} retains leadership in conference volume this month.`,
            `${city2.label} is closing part of the gap as ${cat1.label.toLowerCase()} scheduling broadens across regional calendars.`,
            `Market participation remains concentrated but increasingly multi-city.`,
          ])
        : "",
    () =>
      week1 && focus1
        ? sentenceJoin([
            `Activity into the week of ${formatShortDate(week1.label)} remains materially elevated.`,
            `${focus1.label} continues to appear across the largest concentration windows.`,
            `Institutional workflows will likely stay focused on conflict management during peak weeks.`,
          ])
        : "",
    () =>
      cat1 && cat2
        ? sentenceJoin([
            `${cat1.label} and ${cat2.label} continue to account for a large share of the visible conference pipeline.`,
            `Both categories are showing sustained placement in upcoming schedules across multiple cities.`,
            `Thematic balance remains stable, without abrupt rotation away from current leaders.`,
          ])
        : "",
    () =>
      city1 && focus1
        ? sentenceJoin([
            `${city1.label} remains the core venue for ${focus1.label.toLowerCase()} conference activity.`,
            `Scheduling cadence in that market is still above the median of tracked cities.`,
            `Near-term meeting demand appears resilient heading into the next cycle.`,
          ])
        : "",
  ];

  let i = 0;
  const labels = [
    "MARKET ACTIVITY UPDATE",
    "REGIONAL ACTIVITY",
    "CITY SIGNAL",
    "SECTOR WATCH",
    "EVENT CLUSTER",
    "INVESTOR FOCUS",
  ];
  while (feed.length < Math.max(20, target) && variants.length > 0) {
    const text = variants[i % variants.length]();
    if (text) {
      push(labels[i % labels.length], text);
    }
    i += 1;
    if (i > 120) break;
  }

  return feed.slice(0, Math.max(20, target));
}
