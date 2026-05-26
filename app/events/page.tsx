import Link from "next/link";
import AppShell from "../components/AppShell";
import AddToCalendar from "../components/AddToCalendar";
import FiltersPanel from "./FiltersPanel";
import IntelligenceRail from "../components/IntelligenceRail";
import { generateMarketIntelligence } from "../../lib/marketIntelligence";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type EventRow = {
  id: string;
  title: string;
  eventSeries: string;
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  country: string;
  venue: string;
  website: string;
  organizer: string;
  primaryCategory: string;
  marketFocus: string;
  issuerParticipation: string;
  sectorThemes: string;
  format: string;
  region: string;
  verificationStatus: string;
  lastVerified: string;
  sourcePage: string;
};

type EventsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CountItem = {
  label: string;
  count: number;
};

type ViewMode = "list" | "calendar" | "map";
type TimeScope = "upcoming" | "past" | "all";
type SignalFilter = "" | "hotweek" | "cluster";

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean).join(", ");
  }
  return "";
}

function cleanDateOnly(value: unknown): string {
  return toText(value).slice(0, 10);
}

function getSingleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function getMultiParam(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null;

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const eventTime = new Date(`${dateStr}T00:00:00Z`).getTime();

  if (Number.isNaN(eventTime)) return null;
  return Math.round((eventTime - todayUtc) / 86400000);
}

function getDateParts(dateStr: string): { month: string; day: string; weekday: string } {
  if (!dateStr) return { month: "TBD", day: "", weekday: "" };
  const date = new Date(`${dateStr}T00:00:00`);

  if (Number.isNaN(date.getTime())) return { month: "TBD", day: "", weekday: "" };

  return {
    month: date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
    day: String(date.getDate()),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

function buildLocation(event: EventRow): string {
  const cityState = [event.city, event.state].filter(Boolean).join(", ");
  if (event.venue && cityState) return `${event.venue} • ${cityState}`;
  return event.venue || cityState || event.country || "Location TBD";
}

function buildCalendarLocation(event: EventRow): string {
  return [event.venue, event.city, event.state, event.country]
    .filter(Boolean)
    .join(", ");
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

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

function getEventEndTime(event: EventRow): number {
  return new Date(`${event.endDate || event.startDate}T00:00:00Z`).getTime();
}

function getDateTime(dateStr: string): number {
  const t = new Date(`${dateStr}T00:00:00Z`).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function getCityLabel(event: EventRow): string {
  return [event.city, event.state].filter(Boolean).join(", ");
}

function getWeekKey(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - diff);
  return monday.toISOString().slice(0, 10);
}

function matchesMultiValue(value: string, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(value);
}

function matchesQuery(event: EventRow, query: string): boolean {
  if (!query) return true;

  const normalizedQuery = query.toLowerCase().trim();
  const fillerWords = new Set([
    "find",
    "show",
    "search",
    "events",
    "event",
    "for",
    "in",
    "near",
    "with",
    "the",
    "a",
    "an",
    "and",
    "of",
    "to",
  ]);

  const terms = normalizedQuery
    .replace(/[^\w\s/-]/g, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => !fillerWords.has(term));

  if (terms.length === 0) return true;

  const haystack = [
    event.title,
    event.organizer,
    event.city,
    event.state,
    event.country,
    event.venue,
    event.primaryCategory,
    event.marketFocus,
    event.issuerParticipation,
    event.sectorThemes,
    event.region,
    event.format,
  ]
    .join(" ")
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}

async function getEvents(): Promise<EventRow[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const token = process.env.AIRTABLE_TOKEN;

  if (!baseId || !tableName || !token) {
    throw new Error("Missing Airtable environment variables.");
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  try {
    do {
      const url = new URL(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
      );

      if (offset) {
        url.searchParams.set("offset", offset);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Airtable fetch failed: ${response.status} ${response.statusText} - ${text}`
        );
      }

      const data = await response.json();
      records.push(...(data.records || []));
      offset = data.offset;
    } while (offset);
  } catch (error) {
    console.error("Airtable fetch failed in /events getEvents:", error);
    return [];
  }

  return records
    .map((record) => {
      const fields = record.fields || {};
      const startDate = cleanDateOnly(fields["Start Date"]);
      const endDate = cleanDateOnly(fields["End Date"] || fields["Start Date"]);

      return {
        id: record.id,
        title: toText(fields["Event Name"]) || "Untitled Event",
        eventSeries: toText(fields["Event Series"]),
        startDate,
        endDate,
        city: toText(fields["City"]),
        state: toText(fields["State/Province"]),
        country: toText(fields["Country"]),
        venue: toText(fields["Venue Name"]),
        website: toText(fields["Event Website"]),
        organizer: toText(fields["Organizer Name (from Organizer)"]),
        primaryCategory: toText(fields["Primary Category"]),
        marketFocus: toText(fields["Market Focus"]),
        issuerParticipation: toText(fields["Issuer Participation"]),
        sectorThemes: toText(fields["Sector / Themes"]) || toText(fields["Sector / Theme"]),
        format: toText(fields["Format"]),
        region: toText(fields["Region"]),
        verificationStatus: toText(fields["Verification Status"]),
        lastVerified: cleanDateOnly(fields["Last Verified"]),
        sourcePage: toText(fields["Source Page (event-specific)"]),
      };
    })
    .filter((event) => event.startDate)
    .sort((a, b) => {
      if (a.startDate !== b.startDate) {
        return a.startDate.localeCompare(b.startDate);
      }
      return a.title.localeCompare(b.title);
    });
}

function getEventFeatureTags(event: EventRow): string[] {
  const tags = [
    event.primaryCategory,
    event.marketFocus,
    event.issuerParticipation,
    event.sectorThemes,
  ].filter(Boolean);

  if (event.format.toLowerCase() === "hybrid") {
    tags.push("With Live Stream");
  }

  return tags;
}

function normalizeEventLink(raw: string): string {
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

function getEventLink(event: EventRow): string {
  return normalizeEventLink(event.website) || normalizeEventLink(event.sourcePage);
}


function buildEventsUrl(
  params: Record<string, string | string[]>,
  overrides: Record<string, string | string[]>
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((entry) => search.append(key, entry));
      continue;
    }
    if (value) search.set(key, value);
  }

  const query = search.toString();
  return query ? `/events?${query}` : "/events";
}

function getMapPosition(event: EventRow): { x: number; y: number } {
  const city = event.city.toLowerCase();
  const state = event.state.toUpperCase();
  const country = event.country.toLowerCase();

  const known: Record<string, { x: number; y: number }> = {
    NY: { x: 78, y: 42 },
    MA: { x: 81, y: 38 },
    RI: { x: 80, y: 41 },
    DC: { x: 74, y: 50 },
    FL: { x: 70, y: 79 },
    GA: { x: 66, y: 67 },
    SC: { x: 69, y: 64 },
    IL: { x: 57, y: 49 },
    MN: { x: 51, y: 36 },
    TX: { x: 47, y: 74 },
    CO: { x: 39, y: 53 },
    NV: { x: 25, y: 56 },
    CA: { x: 18, y: 62 },
    BC: { x: 20, y: 23 },
    AB: { x: 33, y: 21 },
    ON: { x: 66, y: 32 },
    QC: { x: 75, y: 28 },
  };

  if (city.includes("toronto")) return { x: 67, y: 34 };
  if (city.includes("vancouver")) return { x: 20, y: 25 };
  if (city.includes("montreal")) return { x: 76, y: 30 };
  if (known[state]) return known[state];
  if (country === "canada") return { x: 52, y: 25 };
  return { x: 48, y: 58 };
}

function PulseMetric({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string | number;
  note: string;
  accent?: boolean;
}) {
  const icon =
    label === "Total Events"
      ? "□"
      : label === "Cities"
      ? "◎"
      : label === "Hot Weeks"
      ? "▲"
      : label === "Clusters"
      ? "●"
      : "◌";

  return (
    <div
      style={{
        border: "none",
        borderRadius: 0,
        background: "transparent",
        padding: "20px 18px",
        minWidth: 0,
        boxShadow: "inset -1px 0 0 rgba(147,197,253,0.16)",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: accent ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.1)",
          color: accent ? "#bfdbfe" : "#93c5fd",
          fontSize: "18px",
          fontWeight: 850,
          marginBottom: "10px",
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#93c5fd",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "28px",
          lineHeight: 1,
          fontWeight: 750,
          color: "#f8fbff",
          fontFamily: "var(--font-body), Arial, sans-serif",
          marginBottom: "7px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#bfdbfe",
          lineHeight: 1.35,
        }}
      >
        {note}
      </div>
    </div>
  );
}

export default async function EventsPage({
  searchParams,
}: EventsPageProps) {
  const params = searchParams ? await searchParams : {};

  const q = getSingleParam(params.q);
  const categoriesSelected = getMultiParam(params.category);
  const marketFocusSelected = getMultiParam(params.marketFocus);
  const issuerParticipationSelected = getMultiParam(params.issuerParticipation);
  const sectorThemeSelected = getMultiParam(params.sectorTheme);
  const organizerSelected = getMultiParam(params.organizer);
  const stateSelected = getMultiParam(params.state);
  const regionSelected = getMultiParam(params.region);
  const countrySelected = getMultiParam(params.country);
  const from = getSingleParam(params.from);
  const to = getSingleParam(params.to);
  const viewParam = getSingleParam(params.view);
  const view: ViewMode =
    viewParam === "calendar" || viewParam === "map" ? viewParam : "list";
  const signalParam = getSingleParam(params.signal);
  const signalFilter: SignalFilter =
    signalParam === "cluster" || signalParam === "hotweek" ? signalParam : "";
  const clusterCityParam = getSingleParam(params.clusterCity).trim().toLowerCase();
  const clusterAnchorParam = getSingleParam(params.clusterAnchor).trim();
  const timeParam = getSingleParam(params.time);
  const timeScope: TimeScope =
    timeParam === "past" || timeParam === "all" ? timeParam : "upcoming";
  const monthOffsetRaw = Number(getSingleParam(params.month));
  const monthOffset = Number.isFinite(monthOffsetRaw) ? monthOffsetRaw : 0;
  const startEventId = getSingleParam(params.startEventId);

  const today = new Date();
  const todayDate = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const todayTime = todayDate.getTime();

  const allEvents = await getEvents();

  const categories = uniqueSorted(allEvents.map((event) => event.primaryCategory));
  const marketFocusOptions = uniqueSorted(
    allEvents.map((event) => event.marketFocus)
  );
  const issuerParticipationOptions = uniqueSorted(
    allEvents.map((event) => event.issuerParticipation)
  );
  const sectorThemeOptions = uniqueSorted(
    allEvents.flatMap((event) =>
      event.sectorThemes
        .split(";")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
  const stateOptions = uniqueSorted(allEvents.map((event) => event.state));
  const regionOptions = uniqueSorted(allEvents.map((event) => event.region));
  const countryOptions = uniqueSorted(allEvents.map((event) => event.country));
  const organizerOptions = uniqueSorted(allEvents.map((event) => event.organizer));

  const baseFilteredEvents = allEvents.filter((event) => {
    if (!matchesQuery(event, q)) return false;
    if (!matchesMultiValue(event.primaryCategory, categoriesSelected)) return false;
    if (!matchesMultiValue(event.marketFocus, marketFocusSelected)) return false;
    if (!matchesMultiValue(event.organizer, organizerSelected)) return false;
    if (!matchesMultiValue(event.issuerParticipation, issuerParticipationSelected)) {
      return false;
    }
    if (
      sectorThemeSelected.length > 0 &&
      !sectorThemeSelected.some((selectedTheme) =>
        event.sectorThemes
          .split(";")
          .map((value) => value.trim())
          .includes(selectedTheme)
      )
    ) {
      return false;
    }
    if (!matchesMultiValue(event.state, stateSelected)) return false;
    if (!matchesMultiValue(event.region, regionSelected)) return false;
    if (!matchesMultiValue(event.country, countrySelected)) return false;
    if (!from && !to && timeScope === "upcoming" && getEventEndTime(event) < todayTime) return false;
    if (timeScope === "past" && getEventEndTime(event) >= todayTime) return false;
    if (from && event.startDate < from) return false;
    if (to && event.startDate > to) return false;
    return true;
  });

  const hotWeekEventIds = new Set(
    baseFilteredEvents
      .filter((event) => {
        const days = getDaysUntil(event.startDate);
        return days !== null && days >= 0 && days <= 7;
      })
      .map((event) => event.id)
  );

  const clusterEventIds = new Set<string>();
  for (const event of baseFilteredEvents) {
    const eventCity = event.city.trim().toLowerCase();
    if (!eventCity) continue;
    const startWindow = getDateTime(event.startDate) - 2 * 86400000;
    const endWindow = getDateTime(event.startDate) + 2 * 86400000;

    let matches = 0;
    for (const other of baseFilteredEvents) {
      if (other.id === event.id) continue;
      if (other.city.trim().toLowerCase() !== eventCity) continue;
      const otherStart = getDateTime(other.startDate);
      const inWindow = otherStart >= startWindow && otherStart <= endWindow;
      if (inWindow) matches += 1;
      if (matches >= 2) {
        clusterEventIds.add(event.id);
        break;
      }
    }
  }

  const filteredEvents = baseFilteredEvents.filter((event) => {
    if (signalFilter === "hotweek") return hotWeekEventIds.has(event.id);
    if (signalFilter === "cluster") {
      if (!clusterEventIds.has(event.id)) return false;
      if (clusterAnchorParam) {
        const anchor = baseFilteredEvents.find((item) => item.id === clusterAnchorParam);
        if (!anchor) return false;
        const sameCity = event.city.trim().toLowerCase() === anchor.city.trim().toLowerCase();
        if (!sameCity) return false;
        const anchorStart = getDateTime(anchor.startDate);
        const startWindow = anchorStart - 2 * 86400000;
        const endWindow = anchorStart + 2 * 86400000;
        const eventStart = getDateTime(event.startDate);
        return eventStart >= startWindow && eventStart <= endWindow;
      }
      if (!clusterCityParam) return true;
      return event.city.trim().toLowerCase() === clusterCityParam;
    }
    return true;
  });

  let listEvents = filteredEvents;
  if (startEventId) {
    const upcomingEvents = filteredEvents.filter(
      (event) => getEventEndTime(event) >= todayTime
    );
    const selectedIndex = upcomingEvents.findIndex((event) => event.id === startEventId);
    if (selectedIndex >= 0) {
      listEvents = upcomingEvents.slice(selectedIndex);
    }
  }

  const activeCityCount = new Set(
    filteredEvents.map(getCityLabel).filter(Boolean)
  ).size;
  const topCity = countBy(filteredEvents.map(getCityLabel))[0];
  const hotWeeksCount = new Set(
    filteredEvents
      .filter((event) => hotWeekEventIds.has(event.id))
      .map((event) => getWeekKey(event.startDate))
      .filter(Boolean)
  ).size;
  const clustersCount = clusterEventIds.size;
  const organizerCount = new Set(
    filteredEvents.map((event) => event.organizer).filter(Boolean)
  ).size;

  const currentParams = {
    q,
    category: categoriesSelected,
    marketFocus: marketFocusSelected,
    issuerParticipation: issuerParticipationSelected,
    sectorTheme: sectorThemeSelected,
    state: stateSelected,
    region: regionSelected,
    country: countrySelected,
    organizer: organizerSelected,
    from,
    to,
    signal: signalFilter,
    clusterCity: clusterCityParam,
    clusterAnchor: clusterAnchorParam,
    time: timeScope === "upcoming" ? "" : timeScope,
    view,
    month: String(monthOffset),
    startEventId,
  };

  const calendarMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() + monthOffset, 1));
  const calendarStart = new Date(calendarMonth);
  calendarStart.setUTCDate(calendarStart.getUTCDate() - calendarStart.getUTCDay());
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setUTCDate(calendarStart.getUTCDate() + index);
    const dateStr = date.toISOString().slice(0, 10);
    return {
      date,
      dateStr,
      inMonth: date.getUTCMonth() === calendarMonth.getUTCMonth(),
      events: filteredEvents.filter((event) => event.startDate === dateStr),
    };
  });
  const calendarTitle = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const cityClusters = countBy(filteredEvents.map(getCityLabel)).slice(0, 12);
  const maxCityCluster = Math.max(...cityClusters.map((item) => item.count), 1);
  const intelligenceSignals = generateMarketIntelligence(filteredEvents, 28);

  return (
    <AppShell
      active="events"
      searchQuery={q}
      rightRail={
        <IntelligenceRail
          signals={intelligenceSignals}
          totalConferencesTracked={allEvents.length}
          trackedCities={new Set(allEvents.map(getCityLabel).filter(Boolean)).size}
        />
      }
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <div
          style={{
            background: "linear-gradient(180deg, rgba(10,33,58,0.95) 0%, rgba(8,29,51,0.95) 100%)",
            border: "1px solid rgba(96,165,250,0.22)",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 16px 36px rgba(2, 8, 20, 0.34)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 280px)",
              gap: "0",
              alignItems: "center",
            }}
            className="ccc-db-header"
          >
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: "32px",
                  lineHeight: 1.12,
                  color: "#f8fbff",
                  fontWeight: 850,
                }}
              >
                Market Calendar Database
              </h1>
              <div style={{ fontSize: "15px", color: "#bfdbfe", lineHeight: 1.6, maxWidth: "760px" }}>
                Search, filter, and organize capital markets conferences. Turn any
                filtered view into a live calendar feed.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "50px minmax(0, 1fr)",
                gap: "14px",
                alignItems: "center",
                border: "1px solid rgba(147,197,253,0.24)",
                borderRadius: "13px",
                background: "linear-gradient(180deg, rgba(12,40,70,0.9) 0%, rgba(9,33,58,0.9) 100%)",
                padding: "15px",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(59,130,246,0.18)",
                  color: "#93c5fd",
                  fontSize: "24px",
                }}
                aria-hidden="true"
              >
                ◎
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 850, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Current View
                </div>
                <div style={{ marginTop: "4px", fontSize: "16px", fontWeight: 850, color: "#f8fbff" }}>
                  Filtered Market View
                </div>
                <div style={{ marginTop: "3px", fontSize: "12px", color: "#bfdbfe" }}>
                  Last updated: recently
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="ccc-stat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 0,
            backgroundColor: "rgba(10,32,56,0.92)",
            border: "1px solid rgba(96,165,250,0.22)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(2, 8, 20, 0.3)",
          }}
        >
          <PulseMetric
            label="Total Events"
            value={filteredEvents.length}
            note="Current filtered result set"
            accent
          />
          <PulseMetric
            label="Cities"
            value={activeCityCount}
            note={topCity ? `${topCity.label} leads this view` : "Markets represented"}
          />
          <PulseMetric
            label="Hot Weeks"
            value={hotWeeksCount}
            note="Elevated concentration"
          />
          <PulseMetric
            label="Clusters"
            value={clustersCount}
            note="Same-city overlaps"
          />
          <PulseMetric
            label="Organizers"
            value={organizerCount}
            note="Distinct organizer names"
          />
        </div>

        <div
          className="ccc-events-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "0",
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <FiltersPanel
              q={q}
              from={from}
              to={to}
              view={view}
              monthOffset={monthOffset}
              signal={signalFilter}
              categories={categories}
              marketFocusOptions={marketFocusOptions}
              issuerParticipationOptions={issuerParticipationOptions}
              sectorThemeOptions={sectorThemeOptions}
              organizerOptions={organizerOptions}
              stateOptions={stateOptions}
              regionOptions={regionOptions}
              countryOptions={countryOptions}
              categoriesSelected={categoriesSelected}
              marketFocusSelected={marketFocusSelected}
              issuerParticipationSelected={issuerParticipationSelected}
              sectorThemeSelected={sectorThemeSelected}
              organizerSelected={organizerSelected}
              stateSelected={stateSelected}
              regionSelected={regionSelected}
              countrySelected={countrySelected}
            />

            <div
              id="results-panel"
              style={{
                backgroundColor: "rgba(10,32,56,0.92)",
                border: "1px solid rgba(96,165,250,0.24)",
                borderRadius: "12px",
                padding: "12px 14px",
                boxShadow: "0 10px 24px rgba(2, 8, 20, 0.24)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 0.8fr) minmax(240px, 1fr) auto",
                  gap: "12px",
                  alignItems: "center",
                }}
                className="ccc-current-view-strip"
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#f8fbff",
                      marginBottom: "3px",
                    }}
                  >
                    {filteredEvents.length} events match your filters
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#93c5fd",
                      lineHeight: 1.5,
                    }}
                  >
                    Results update after you apply filter changes.
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid rgba(147,197,253,0.24)",
                    borderRadius: "10px",
                    backgroundColor: "rgba(9,34,61,0.84)",
                    padding: "9px 11px",
                    color: "#334155",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.06em", color: "#93c5fd", marginBottom: "3px" }}>
                    Current Market View
                  </div>
                  <div style={{ fontSize: "12px", color: "#bfdbfe", fontWeight: 700, lineHeight: 1.35 }}>
                    {filteredEvents.length} events · {activeCityCount} cities · {hotWeeksCount} hot weeks · {clustersCount} clusters
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {[
                    { label: "List", value: "list" },
                    { label: "Calendar", value: "calendar" },
                    { label: "Map", value: "map" },
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={`${buildEventsUrl(currentParams, { view: item.value })}#results-panel`}
                      scroll={false}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "36px",
                        padding: "0 12px",
                        borderRadius: "10px",
                        backgroundColor: view === item.value ? "#1d4ed8" : "rgba(9,34,61,0.84)",
                        border: view === item.value ? "1px solid #1d4ed8" : "1px solid rgba(147,197,253,0.24)",
                        color: view === item.value ? "#ffffff" : "#cbd5e1",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <a
                    href="#calendar-feed"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "36px",
                      padding: "0 12px",
                      borderRadius: "10px",
                      backgroundColor: "#123f64",
                      color: "#ffffff",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
	                    Create Feed
                  </a>
                </div>
              </div>
            </div>


            <div
              style={{
                backgroundColor: "rgba(10,32,56,0.92)",
                border: "1px solid rgba(96,165,250,0.24)",
                borderRadius: "12px",
                padding: "14px",
                boxShadow: "0 10px 24px rgba(2, 8, 20, 0.24)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "13px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase", color: "#93c5fd" }}>
                  Market Signals Based On Your Filters
                </div>
                <Link href="/" style={{ color: "#93c5fd", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                  View full intelligence →
                </Link>
              </div>
              <div className="ccc-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px" }}>
                <div style={{ border: "1px solid rgba(147,197,253,0.2)", backgroundColor: "rgba(8,30,53,0.82)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#f8fbff", lineHeight: 1.05 }}>
                    {countBy(filteredEvents.map((event) => event.sectorThemes || event.primaryCategory))[0]?.count || 0}
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 700, color: "#dbeafe" }}>
                    {`${countBy(filteredEvents.map((event) => event.sectorThemes || event.primaryCategory))[0]?.label || "Top sector"} conferences`}
                  </div>
                  <div style={{ marginTop: "3px", fontSize: "12px", color: "#93c5fd" }}>in next 30 days</div>
                </div>
                <div style={{ border: "1px solid rgba(147,197,253,0.2)", backgroundColor: "rgba(8,30,53,0.82)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#f8fbff", lineHeight: 1.05 }}>
                    {filteredEvents.filter((event) => event.primaryCategory.toLowerCase().includes("investor")).length}
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 700, color: "#dbeafe" }}>Investor conferences</div>
                  <div style={{ marginTop: "3px", fontSize: "12px", color: "#93c5fd" }}>in next 30 days</div>
                </div>
                <div style={{ border: "1px solid rgba(147,197,253,0.2)", backgroundColor: "rgba(8,30,53,0.82)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#f8fbff", lineHeight: 1.05 }}>{hotWeeksCount}</div>
                  <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 700, color: "#dbeafe" }}>Hot weeks</div>
                  <div style={{ marginTop: "3px", fontSize: "12px", color: "#93c5fd" }}>detected</div>
                </div>
                <div style={{ border: "1px solid rgba(147,197,253,0.2)", backgroundColor: "rgba(8,30,53,0.82)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#f8fbff", lineHeight: 1.05 }}>{clustersCount}</div>
                  <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 700, color: "#dbeafe" }}>Active clusters</div>
                  <div style={{ marginTop: "3px", fontSize: "12px", color: "#93c5fd" }}>in this view</div>
                </div>
                <div style={{ border: "1px solid rgba(147,197,253,0.2)", backgroundColor: "rgba(8,30,53,0.82)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#f8fbff", lineHeight: 1.05 }}>{topCity?.label || "No city"}</div>
                  <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 700, color: "#dbeafe" }}>leads all cities</div>
                  <div style={{ marginTop: "3px", fontSize: "12px", color: "#93c5fd" }}>in activity</div>
                </div>
              </div>
            </div>

            {view === "calendar" ? (
              <div
                style={{ display: "grid", gap: "10px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`${buildEventsUrl(currentParams, { view: "calendar", month: String(monthOffset - 1) })}#results-panel`}
                    scroll={false}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "34px",
                      padding: "0 12px",
                      borderRadius: "9px",
                      textDecoration: "none",
                      border: "1px solid #d5dde7",
                      backgroundColor: "#ffffff",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    Previous Month
                  </Link>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {calendarTitle}
                  </div>

                  <Link
                    href={`${buildEventsUrl(currentParams, { view: "calendar", month: String(monthOffset + 1) })}#results-panel`}
                    scroll={false}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "34px",
                      padding: "0 12px",
                      borderRadius: "9px",
                      textDecoration: "none",
                      border: "1px solid #d5dde7",
                      backgroundColor: "#ffffff",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    Next Month
                  </Link>
                </div>

              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #d7dde5",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow:
                    "0 10px 24px rgba(15, 45, 79, 0.055), 0 1px 2px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e5ebf2",
                  }}
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      style={{
                        padding: "10px",
                        fontSize: "11px",
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#667085",
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div
                  className="ccc-calendar-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  }}
                >
                  {calendarDays.map((day) => {
                    const isToday = day.dateStr === todayDate.toISOString().slice(0, 10);
                    return (
                      <div
                        key={day.dateStr}
                        style={{
                          minHeight: "118px",
                          padding: "10px",
                          borderRight: "1px solid #eef2f7",
                          borderBottom: "1px solid #eef2f7",
                          backgroundColor: isToday ? "#f4f9ff" : day.inMonth ? "#ffffff" : "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 900,
                              color: isToday ? "#0f3d75" : "#334155",
                            }}
                          >
                            {day.date.getUTCDate()}
                          </div>
                          {day.events.length > 0 ? (
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 900,
                                color: "#0f3d75",
                              }}
                            >
                              {day.events.length}
                            </div>
                          ) : null}
                        </div>

                        <div style={{ display: "grid", gap: "6px" }}>
                          {day.events.slice(0, 3).map((event) => (
                            <Link
                              key={event.id}
                              href={`${buildEventsUrl(currentParams, { view: "list", q: event.title })}#results-panel`}
                              scroll={false}
                              style={{
                                display: "block",
                                textDecoration: "none",
                                padding: "6px 7px",
                                borderRadius: "7px",
                                backgroundColor: "#eef6ff",
                                border: "1px solid #d5e4f5",
                                color: "#123f64",
                                fontSize: "11px",
                                fontWeight: 800,
                                lineHeight: 1.25,
                              }}
                            >
                              {event.title}
                            </Link>
                          ))}
                          {day.events.length > 3 ? (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: 800,
                              }}
                            >
                              +{day.events.length - 3} more
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>
            ) : null}

            {view === "map" ? (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #d7dde5",
                  borderRadius: "14px",
                  padding: "16px",
                  boxShadow:
                    "0 10px 24px rgba(15, 45, 79, 0.055), 0 1px 2px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.4fr) minmax(260px, 0.6fr)",
                    gap: "16px",
                    alignItems: "start",
                  }}
                  className="ccc-map-layout"
                >
                  <div
                    style={{
                      position: "relative",
                      minHeight: "430px",
                      borderRadius: "12px",
                      border: "1px solid #dbe4ee",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, #eaf2fb 0%, #f8fbff 48%, #ecfdf5 100%)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: "9% 7% 11% 8%",
                        border: "1px solid rgba(15, 61, 117, 0.12)",
                        borderRadius: "44% 49% 46% 42%",
                        backgroundColor: "rgba(255,255,255,0.42)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "16%",
                        top: "15%",
                        width: "70%",
                        height: "42%",
                        border: "1px dashed rgba(15, 61, 117, 0.18)",
                        borderRadius: "52% 42% 46% 40%",
                      }}
                    />

                    {filteredEvents.slice(0, 80).map((event) => {
                      const position = getMapPosition(event);
                      return (
                        <a
                          key={event.id}
                          href={getEventLink(event) || "#"}
                          target={getEventLink(event) ? "_blank" : undefined}
                          rel={getEventLink(event) ? "noopener noreferrer" : undefined}
                          title={`${event.title} — ${buildLocation(event)}`}
                          style={{
                            position: "absolute",
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            width: "12px",
                            height: "12px",
                            borderRadius: "999px",
                            backgroundColor:
                              event.format.toLowerCase() === "hybrid" ? "#16a34a" : "#0f3d75",
                            border: "2px solid #ffffff",
                            boxShadow: "0 4px 12px rgba(15, 45, 79, 0.22)",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      );
                    })}
                  </div>

                  <div style={{ display: "grid", gap: "10px" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#667085",
                      }}
                    >
                      Top Locations
                    </div>
                    {cityClusters.map((city, index) => (
                      <div key={`${city.label}-${index}`}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            marginBottom: "5px",
                            fontSize: "13px",
                            color: "#334155",
                            fontWeight: 800,
                          }}
                        >
                          <span>{city.label}</span>
                          <span>{city.count}</span>
                        </div>
                        <div
                          style={{
                            height: "7px",
                            borderRadius: "999px",
                            backgroundColor: "#edf2f7",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.max(10, (city.count / maxCityCluster) * 100)}%`,
                              height: "100%",
                              borderRadius: "999px",
                              backgroundColor: "#0f3d75",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div style={{ display: view === "list" ? "grid" : "none", gap: "12px" }}>
              {listEvents.length > 0 ? (
                <div style={{ overflowX: "auto", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", gap: "12px", minWidth: "max-content" }}>
                    {listEvents.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          width: "240px",
                          borderRadius: "12px",
                          border: event.id === startEventId ? "1px solid #60a5fa" : "1px solid rgba(96,165,250,0.28)",
                          background: "linear-gradient(180deg, rgba(8,30,53,0.98) 0%, rgba(6,25,44,0.98) 100%)",
                          padding: "12px",
                          color: "#e2e8f0",
                          boxShadow: "0 8px 22px rgba(2, 8, 20, 0.28)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", color: "#93c5fd", fontWeight: 800 }}>
                          <span>{getDateParts(event.startDate).month} {getDateParts(event.startDate).day}</span>
                          <span>{getDateParts(event.startDate).weekday.toUpperCase()}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                          {hotWeekEventIds.has(event.id) ? <span style={{ fontSize: "10px", fontWeight: 800, color: "#fb7185" }}>HOT WEEK</span> : null}
                          {clusterEventIds.has(event.id) ? <span style={{ fontSize: "10px", fontWeight: 800, color: "#fca5a5" }}>CLUSTER</span> : null}
                        </div>
                        <div style={{ fontSize: "24px", lineHeight: 1.2, fontWeight: 800, color: "#f8fbff", marginBottom: "6px" }}>{event.title}</div>
                        <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "8px" }}>{event.organizer || "Organizer TBD"}</div>
                        <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5, marginBottom: "8px" }}>
                          {getCityLabel(event) || event.country || "Location TBD"}<br />
                          <span style={{ color: "#94a3b8" }}>{event.venue || "Venue TBD"}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                          {getEventFeatureTags(event).slice(0, 3).map((tag, index) => (
                            <span key={`${tag}-${index}`} style={{ fontSize: "11px", borderRadius: "999px", border: "1px solid rgba(147,197,253,0.25)", padding: "2px 7px", color: "#bfdbfe" }}>{tag}</span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {getEventLink(event) ? (
                            <a
                              href={getEventLink(event)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ flex: 1, height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", backgroundColor: "#1d4ed8", color: "#fff", textDecoration: "none", fontSize: "12px", fontWeight: 800 }}
                            >
                              Event Link
                            </a>
                          ) : (
                            <span style={{ flex: 1, height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: "1px solid rgba(147,197,253,0.2)", color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
                              Event Link
                            </span>
                          )}
                          <AddToCalendar
                            title={event.title}
                            startDate={event.startDate}
                            endDate={event.endDate}
                            location={buildCalendarLocation(event)}
                            url={getEventLink(event) || ""}
                            description={[
                              event.organizer ? `Organizer: ${event.organizer}` : "",
                              event.primaryCategory ? `Primary Category: ${event.primaryCategory}` : "",
                              event.marketFocus ? `Market Focus: ${event.marketFocus}` : "",
                              event.issuerParticipation ? `Issuer Participation: ${event.issuerParticipation}` : "",
                            ].filter(Boolean).join("\n") || "Capital Conference Calendar event"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ border: "1px solid rgba(96,165,250,0.24)", borderRadius: "12px", padding: "18px", color: "#93c5fd", backgroundColor: "rgba(8,30,53,0.85)" }}>
                  No events matched the current filter set.
                </div>
              )}
            </div>

            <section
              id="calendar-feed"
              style={{
                background: "linear-gradient(180deg, rgba(10,32,56,0.95) 0%, rgba(8,28,49,0.95) 100%)",
                border: "1px solid rgba(96,165,250,0.24)",
                borderRadius: "12px",
                padding: "18px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#f8fbff", marginBottom: "8px" }}>
                  Turn This View Into a Live Calendar Feed
                </div>
                <div style={{ fontSize: "14px", color: "#bfdbfe", lineHeight: 1.55, marginBottom: "10px" }}>
                  Subscribe to this filtered view and get automatically updated events in your calendar.
                  New conferences that match your filters will be added automatically.
                </div>
                <div style={{ display: "grid", gap: "4px", color: "#93c5fd", fontSize: "13px" }}>
                  <span>• Instant delivery to your calendar</span>
                  <span>• Updates as new matching events are added</span>
                  <span>• Works with Google, Apple, and Outlook</span>
                </div>
              </div>
              <div style={{ display: "grid", gap: "10px", justifyItems: "end" }}>
                <a
                  href="/events#calendar-feed"
                  style={{
                    height: "42px",
                    padding: "0 16px",
                    borderRadius: "10px",
                    backgroundColor: "#1d4ed8",
                    color: "#ffffff",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    fontWeight: 800,
                    fontSize: "14px",
                  }}
                >
                  Create Live Calendar Feed
                </a>
                <div style={{ fontSize: "12px", color: "#93c5fd" }}>
                  No coding required. Set up in 60 seconds.
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
