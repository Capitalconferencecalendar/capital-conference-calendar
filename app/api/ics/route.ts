import { NextRequest, NextResponse } from "next/server";

type AirtableValue = string | string[] | undefined;

type AirtableRecord = {
  id: string;
  fields: {
    "Event Name"?: string;
    "Start Date"?: string;
    "End Date"?: string;
    City?: string;
    "State/Province"?: string;
    Country?: string;
    "Venue Name"?: AirtableValue;
    "Event Website"?: string;
    "Organizer Name (from Organizer)"?: AirtableValue;

    // Updated taxonomy fields
    "Primary Category"?: string;
    "Market Focus"?: string;
    "Sector / Theme"?: AirtableValue;
    "Format"?: string;
    "Primary Audience"?: string;
    "Issuer Participation"?: string;
  };
};

type EventRow = {
  id: string;
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
  primaryAudience: string;
  issuerParticipation: string;
};

function normalizeValue(value: AirtableValue): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function cleanDateOnly(value?: string): string {
  return (value || "").trim().slice(0, 10);
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatDateForICS(dateStr: string, isEnd = false): string {
  const clean = cleanDateOnly(dateStr);
  if (!clean) return "";

  const [year, month, day] = clean.split("-").map(Number);
  if (!year || !month || !day) return "";

  // All-day event format uses YYYYMMDD.
  // DTEND in all-day ICS is exclusive, so add one day for end date.
  const date = new Date(Date.UTC(year, month - 1, day));

  if (isEnd) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");

  return `${yyyy}${mm}${dd}`;
}

function buildLocation(event: EventRow): string {
  return [event.venue, event.city, event.state, event.country]
    .filter(Boolean)
    .join(", ");
}

function buildDescription(event: EventRow): string {
  const lines = [
    `Primary Category: ${event.primaryCategory || "N/A"}`,
    `Market Focus: ${event.marketFocus || "N/A"}`,
    `Sector / Theme: ${event.sectorTheme || "N/A"}`,
    `Format: ${event.format || "N/A"}`,
    `Primary Audience: ${event.primaryAudience || "N/A"}`,
    `Issuer Participation: ${event.issuerParticipation || "N/A"}`,
  ];

  // Keep notes clean and taxonomy-focused only.
  return lines.join("\n");
}

function makeUID(event: EventRow): string {
  const safeTitle = (event.title || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeCity = (event.city || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${event.id}-${safeTitle}-${event.startDate}-${safeCity}@capitalconferencecalendar.com`;
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

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
    );

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airtable fetch failed: ${res.status} ${res.statusText} - ${text}`);
    }

    const data = await res.json();
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return records
    .map((record) => {
      const startDate = cleanDateOnly(record.fields["Start Date"]);
      const endDate = cleanDateOnly(
        record.fields["End Date"] || record.fields["Start Date"]
      );

      return {
        id: record.id,
        title: record.fields["Event Name"] || "Untitled Event",
        startDate,
        endDate,
        city: record.fields.City || "",
        state: record.fields["State/Province"] || "",
        country: record.fields.Country || "",
        venue: normalizeValue(record.fields["Venue Name"]),
        website: record.fields["Event Website"] || "",
        organizer: normalizeValue(record.fields["Organizer Name (from Organizer)"]),
        primaryCategory: record.fields["Primary Category"] || "",
        marketFocus: record.fields["Market Focus"] || "",
        sectorTheme: normalizeValue(record.fields["Sector / Theme"]),
        format: record.fields["Format"] || "",
        primaryAudience: record.fields["Primary Audience"] || "",
        issuerParticipation: record.fields["Issuer Participation"] || "",
      };
    })
    .filter((event) => event.startDate);
}

export async function GET(request: NextRequest) {
  try {
    const allEvents = await getEvents();
    const { searchParams } = new URL(request.url);

    const country = searchParams.get("country")?.trim().toLowerCase();
    const category = searchParams.get("category")?.trim().toLowerCase();
    const marketFocus = searchParams.get("marketFocus")?.trim().toLowerCase();
    const format = searchParams.get("format")?.trim().toLowerCase();
    const issuerParticipation = searchParams.get("issuerParticipation")?.trim().toLowerCase();

    const filtered = allEvents.filter((event) => {
      const matchesCountry = !country || event.country.toLowerCase() === country;
      const matchesCategory =
        !category || event.primaryCategory.toLowerCase() === category;
      const matchesMarketFocus =
        !marketFocus || event.marketFocus.toLowerCase() === marketFocus;
      const matchesFormat = !format || event.format.toLowerCase() === format;
      const matchesIssuerParticipation =
        !issuerParticipation ||
        event.issuerParticipation.toLowerCase() === issuerParticipation;

      return (
        matchesCountry &&
        matchesCategory &&
        matchesMarketFocus &&
        matchesFormat &&
        matchesIssuerParticipation
      );
    });

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Capital Conference Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Capital Conference Calendar",
      "X-WR-CALDESC:Capital markets conferences and events",
    ];

    for (const event of filtered) {
      const uid = makeUID(event);
      const dtStart = formatDateForICS(event.startDate, false);
      const dtEnd = formatDateForICS(event.endDate || event.startDate, true);
      const location = buildLocation(event);
      const description = buildDescription(event);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${escapeText(uid)}`);
      lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      lines.push(`SUMMARY:${escapeText(event.title)}`);

      if (location) {
        lines.push(`LOCATION:${escapeText(location)}`);
      }

      if (description) {
        lines.push(`DESCRIPTION:${escapeText(description)}`);
      }

      if (event.website) {
        lines.push(`URL:${escapeText(event.website)}`);
      }

      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    return new NextResponse(lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="capital-conference-calendar.ics"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("ICS feed error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate ICS feed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}