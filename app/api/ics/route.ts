import { NextRequest, NextResponse } from "next/server";

type AirtableValue = string | string[] | undefined;

type AirtableRecord = {
  id: string;
  createdTime?: string;
  fields: {
    "Event ID"?: string;
    "Event Slug"?: string;
    "Event Name"?: string;
    "Start Date"?: string;
    "End Date"?: string;
    City?: string;
    "State/Province"?: string;
    Country?: string;
    "Venue Name"?: AirtableValue;
    "Event Website"?: string;
    "Organizer Name (from Organizer)"?: AirtableValue;
    "Primary Category"?: string;
    "Market Focus"?: string;
    "Sector / Theme"?: AirtableValue;
    "Format"?: string;
    "Issuer Participation"?: string;
    "Last Modified"?: string;
    "Created"?: string;
    "Approved for Feeds"?: boolean;
  };
};

type EventRow = {
  airtableRecordId: string;
  eventId: string;
  slug: string;
  title: string;
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
  sectorTheme: string;
  format: string;
  issuerParticipation: string;
  created: string;
  lastModified: string;
  approvedForFeeds: boolean;
};

function normalizeValue(value: AirtableValue): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value.trim();
}

function cleanDateOnly(value?: string): string {
  return (value || "").trim().slice(0, 10);
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldICSLines(input: string): string {
  const maxLength = 75;
  const lines = input.split("\r\n");
  const folded: string[] = [];

  for (const line of lines) {
    if (line.length <= maxLength) {
      folded.push(line);
      continue;
    }

    let remaining = line;
    while (remaining.length > maxLength) {
      folded.push(remaining.slice(0, maxLength));
      remaining = " " + remaining.slice(maxLength);
    }
    folded.push(remaining);
  }

  return folded.join("\r\n");
}

function formatDateForICS(dateStr: string, isExclusiveEnd = false): string {
  const clean = cleanDateOnly(dateStr);
  if (!clean) return "";

  const [year, month, day] = clean.split("-").map(Number);
  if (!year || !month || !day) return "";

  const date = new Date(Date.UTC(year, month - 1, day));

  if (isExclusiveEnd) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");

  return `${yyyy}${mm}${dd}`;
}

function formatTimestampForICS(value?: string): string {
  const parsed = value ? new Date(value) : new Date();

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  return parsed.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeStableEventId(record: AirtableRecord): string {
  const explicitEventId = record.fields["Event ID"]?.trim();
  if (explicitEventId) return explicitEventId;

  const explicitSlug = record.fields["Event Slug"]?.trim();
  if (explicitSlug) return explicitSlug;

  const title = record.fields["Event Name"]?.trim() || "event";
  const startDate = cleanDateOnly(record.fields["Start Date"]) || "unknown-date";
  const organizer = normalizeValue(record.fields["Organizer Name (from Organizer)"]) || "unknown-organizer";

  return `${slugify(organizer)}-${slugify(title)}-${startDate}`;
}

function makeUID(event: EventRow): string {
  return `${event.eventId}@capitalconferencecalendar.com`;
}

function buildSequence(event: EventRow): number {
  if (!event.lastModified) return 0;

  const ts = new Date(event.lastModified).getTime();
  if (Number.isNaN(ts)) return 0;

  return Math.floor(ts / 1000);
}

function buildLocation(event: EventRow): string {
  return [event.venue, event.city, event.state, event.country]
    .filter(Boolean)
    .join(", ");
}

function buildDescription(event: EventRow): string {
  const lines = [
    `ORGANIZER: ${event.organizer || "N/A"}`,
    ``,
    `PRIMARY CATEGORY: ${event.primaryCategory || "N/A"}`,
    `MARKET FOCUS: ${event.marketFocus || "N/A"}`,
    `SECTOR / THEME: ${event.sectorTheme || "N/A"}`,
    `FORMAT: ${event.format || "N/A"}`,
    `ISSUER PARTICIPATION: ${event.issuerParticipation || "N/A"}`,
    ``,
    `---`,
    `Source: www.capitalconferencecalendar.com`,
  ];

  return lines.join("\n");
}

function mapRecordToEvent(record: AirtableRecord): EventRow {
  const startDate = cleanDateOnly(record.fields["Start Date"]);
  const endDate = cleanDateOnly(record.fields["End Date"] || record.fields["Start Date"]);
  const created =
    record.fields["Created"] ||
    record.createdTime ||
    "";
  const lastModified =
    record.fields["Last Modified"] ||
    record.fields["Created"] ||
    record.createdTime ||
    "";

  return {
    airtableRecordId: record.id,
    eventId: makeStableEventId(record),
    slug: record.fields["Event Slug"]?.trim() || "",
    title: record.fields["Event Name"]?.trim() || "Untitled Event",
    startDate,
    endDate,
    city: record.fields.City?.trim() || "",
    state: record.fields["State/Province"]?.trim() || "",
    country: record.fields.Country?.trim() || "",
    venue: normalizeValue(record.fields["Venue Name"]),
    website: record.fields["Event Website"]?.trim() || "",
    organizer: normalizeValue(record.fields["Organizer Name (from Organizer)"]),
    primaryCategory: record.fields["Primary Category"]?.trim() || "",
    marketFocus: record.fields["Market Focus"]?.trim() || "",
    sectorTheme: normalizeValue(record.fields["Sector / Theme"]),
    format: record.fields["Format"]?.trim() || "",
    issuerParticipation: record.fields["Issuer Participation"]?.trim() || "",
    created,
    lastModified,
    approvedForFeeds: Boolean(record.fields["Approved for Feeds"]),
  };
}

async function fetchAllAirtableRecords(): Promise<AirtableRecord[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const token = process.env.AIRTABLE_TOKEN;

  if (!baseId || !tableName || !token) {
    throw new Error("Missing Airtable environment variables.");
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
    );

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Airtable fetch failed: ${response.status} ${response.statusText} - ${body}`
      );
    }

    const data = await response.json();
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return records;
}

async function getEvents(): Promise<EventRow[]> {
  const records = await fetchAllAirtableRecords();

  return records
    .map(mapRecordToEvent)
    .filter((event) => event.startDate)
    .filter((event) => event.approvedForFeeds || event.approvedForFeeds === false);
}

function filterEvents(events: EventRow[], requestUrl: string): EventRow[] {
  const { searchParams } = new URL(requestUrl);

  const country = searchParams.get("country")?.trim().toLowerCase();
  const category = searchParams.get("category")?.trim().toLowerCase();
  const marketFocus = searchParams.get("marketFocus")?.trim().toLowerCase();
  const format = searchParams.get("format")?.trim().toLowerCase();
  const issuerParticipation = searchParams.get("issuerParticipation")?.trim().toLowerCase();
  const organizer = searchParams.get("organizer")?.trim().toLowerCase();
  const onlyApproved = searchParams.get("approved");

  return events.filter((event) => {
    const matchesCountry = !country || event.country.toLowerCase() === country;
    const matchesCategory =
      !category || event.primaryCategory.toLowerCase() === category;
    const matchesMarketFocus =
      !marketFocus || event.marketFocus.toLowerCase() === marketFocus;
    const matchesFormat =
      !format || event.format.toLowerCase() === format;
    const matchesIssuerParticipation =
      !issuerParticipation ||
      event.issuerParticipation.toLowerCase() === issuerParticipation;
    const matchesOrganizer =
      !organizer || event.organizer.toLowerCase() === organizer;

    const matchesApproval =
      onlyApproved === "true" ? event.approvedForFeeds === true : true;

    return (
      matchesCountry &&
      matchesCategory &&
      matchesMarketFocus &&
      matchesFormat &&
      matchesIssuerParticipation &&
      matchesOrganizer &&
      matchesApproval
    );
  });
}

function buildCalendar(events: EventRow[]): string {
  const nowStamp = formatTimestampForICS();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Capital Conference Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Capital Conference Calendar",
    "X-WR-CALDESC:Capital markets conferences and events",
    "X-PUBLISHED-TTL:PT12H",
  ];

  for (const event of events) {
    const uid = makeUID(event);
    const dtStart = formatDateForICS(event.startDate, false);
    const dtEnd = formatDateForICS(event.endDate || event.startDate, true);
    const location = buildLocation(event);
    const description = buildDescription(event);
    const created = formatTimestampForICS(event.created);
    const lastModified = formatTimestampForICS(event.lastModified);
    const sequence = buildSequence(event);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeICS(uid)}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`CREATED:${created}`);
    lines.push(`LAST-MODIFIED:${lastModified}`);
    lines.push(`SEQUENCE:${sequence}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:TRANSPARENT");
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);

    if (location) {
      lines.push(`LOCATION:${escapeICS(location)}`);
    }

    if (description) {
      lines.push(`DESCRIPTION:${escapeICS(description)}`);
    }

    if (event.website) {
      lines.push(`URL:${escapeICS(event.website)}`);
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return foldICSLines(lines.join("\r\n"));
}

export async function GET(request: NextRequest) {
  try {
    const allEvents = await getEvents();
    const filteredEvents = filterEvents(allEvents, request.url);
    const ics = buildCalendar(filteredEvents);

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="capital-conference-calendar.ics"',
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("ICS feed generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate ICS feed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}