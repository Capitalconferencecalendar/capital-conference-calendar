import { NextRequest } from "next/server";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type EventRow = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  region: string;
  country: string;
  venue: string;
  website: string;
  organizer: string;
  primaryCategory: string;
  marketFocus: string;
  sectorThemes: string;
  format: string;
  issuerParticipation: string;
};

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map((v) => toText(v)).filter(Boolean).join(", ");
  }
  return "";
}

function cleanDateOnly(value: unknown): string {
  return toText(value).slice(0, 10);
}

function toArray(values: string[]): string[] {
  return values.map((v) => v.trim()).filter(Boolean);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatIcsDate(dateStr: string): string {
  return dateStr.replaceAll("-", "");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line: string): string {
  const limit = 73;
  if (line.length <= limit) return line;

  const parts: string[] = [];
  let remaining = line;

  while (remaining.length > limit) {
    parts.push(remaining.slice(0, limit));
    remaining = remaining.slice(limit);
  }

  if (remaining) parts.push(remaining);
  return parts.join("\r\n ");
}

function buildUid(event: EventRow): string {
  const base = [
    event.id,
    event.startDate,
    event.endDate,
    event.title,
  ]
    .filter(Boolean)
    .join("-");
  return `${base.replace(/\s+/g, "-")}@capitalconferencecalendar.com`;
}

function buildLocation(event: EventRow): string {
  return [event.venue, event.city, event.state, event.country]
    .filter(Boolean)
    .join(", ");
}

function buildDescription(event: EventRow): string {
  const lines: string[] = [];
  const eventLink = event.website;

  if (event.organizer) {
    lines.push(`Organizer: ${event.organizer}`);
  }

  if (event.primaryCategory) {
    lines.push(`Primary Category: ${event.primaryCategory}`);
  }

  if (event.marketFocus) {
    lines.push(`Market Focus: ${event.marketFocus}`);
  }

  if (event.sectorThemes) {
    lines.push(`Sector / Themes: ${event.sectorThemes}`);
  }

  if (event.format.toLowerCase() === "hybrid") {
    lines.push("Access: With Live Stream");
  }

  if (event.issuerParticipation) {
    lines.push(`Issuer Participation: ${event.issuerParticipation}`);
  }

  if (event.region) {
    lines.push(`Region: ${event.region}`);
  }

  if (eventLink) {
    lines.push("");
    lines.push(`Event Link: ${eventLink}`);
  }
  lines.push(`Capital Conference Calendar: https://www.capitalconferencecalendar.com`);

  return lines.join("\n");
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
      throw new Error(
        `Airtable fetch failed: ${res.status} ${res.statusText} - ${text}`
      );
    }

    const data = await res.json();
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return records
    .map((record) => {
      const fields = record.fields || {};
      const startDate = cleanDateOnly(fields["Start Date"]);
      const endDate = cleanDateOnly(fields["End Date"] || fields["Start Date"]);

      return {
        id: record.id,
        title: toText(fields["Event Name"]) || "Untitled Event",
        startDate,
        endDate,
        city: toText(fields["City"]),
        state: toText(fields["State/Province"]),
        region: toText(fields["Region"]),
        country: toText(fields["Country"]),
        venue: toText(fields["Venue Name"]),
        website: toText(fields["Event Website"]),
        organizer: toText(fields["Organizer Name (from Organizer)"]),
        primaryCategory: toText(fields["Primary Category"]),
        marketFocus: toText(fields["Market Focus"]),
        sectorThemes: toText(fields["Sector / Themes"]) || toText(fields["Sector / Theme"]),
        format: toText(fields["Format"]),
        issuerParticipation: toText(fields["Issuer Participation"]),
      };
    })
    .filter((event) => event.startDate);
}

function matchesMulti(value: string, selected: string[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

function buildCalendarName(filters: {
  categories: string[];
  marketFocuses: string[];
  issuerParticipation: string[];
  sectorThemes: string[];
  states: string[];
  regions: string[];
  organizers: string[];
}) {
  const parts: string[] = [];

  if (filters.categories.length > 0) parts.push(filters.categories.join(", "));
  if (filters.marketFocuses.length > 0) parts.push(filters.marketFocuses.join(", "));
  if (filters.regions.length > 0) parts.push(filters.regions.join(", "));
  if (filters.states.length > 0) parts.push(filters.states.join(", "));
  if (filters.organizers.length > 0) parts.push(filters.organizers.join(", "));

  const suffix = parts.length > 0 ? ` — ${parts.join(" | ")}` : "";
  return `Capital Conference Calendar${suffix}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categories = toArray(searchParams.getAll("category"));
    const marketFocuses = toArray(searchParams.getAll("marketFocus"));
    const issuerParticipation = toArray(
      searchParams.getAll("issuerParticipation")
    );
    const sectorThemes = toArray(searchParams.getAll("sectorTheme"));
    const states = toArray(searchParams.getAll("state"));
    const regions = toArray(searchParams.getAll("region"));
    const organizers = toArray(searchParams.getAll("organizer"));

    const events = await getEvents();

    const filteredEvents = events
      .filter((event) => matchesMulti(event.primaryCategory, categories))
      .filter((event) => matchesMulti(event.marketFocus, marketFocuses))
      .filter((event) =>
        matchesMulti(event.issuerParticipation, issuerParticipation)
      )
      .filter(
        (event) =>
          sectorThemes.length === 0 ||
          event.sectorThemes
            .split(";")
            .map((value) => value.trim())
            .some((value) => sectorThemes.includes(value))
      )
      .filter((event) => matchesMulti(event.state, states))
      .filter((event) => matchesMulti(event.region, regions))
      .filter((event) => matchesMulti(event.organizer, organizers))
      .sort((a, b) => {
        if (a.startDate !== b.startDate) {
          return a.startDate.localeCompare(b.startDate);
        }
        return a.title.localeCompare(b.title);
      });

    const calendarName = buildCalendarName({
      categories,
      marketFocuses,
      issuerParticipation,
      sectorThemes,
      states,
      regions,
      organizers,
    });

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Capital Conference Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      foldIcsLine(`X-WR-CALNAME:${escapeIcsText(calendarName)}`),
      foldIcsLine(
        `X-WR-CALDESC:${escapeIcsText(
          "Capital markets conferences, industry events, and networking opportunities."
        )}`
      ),
    ];

    for (const event of filteredEvents) {
      const start = event.startDate;
      const endExclusive = addDays(event.endDate || event.startDate, 1);
      const description = buildDescription(event);
      const location = buildLocation(event);
      const url = event.website || "https://www.capitalconferencecalendar.com";

      lines.push("BEGIN:VEVENT");
      lines.push(
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`
      );
      lines.push(foldIcsLine(`UID:${escapeIcsText(buildUid(event))}`));
      lines.push(foldIcsLine(`SUMMARY:${escapeIcsText(event.title)}`));
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(start)}`);
      lines.push(`DTEND;VALUE=DATE:${formatIcsDate(endExclusive)}`);

      if (location) {
        lines.push(foldIcsLine(`LOCATION:${escapeIcsText(location)}`));
      }

      if (description) {
        lines.push(foldIcsLine(`DESCRIPTION:${escapeIcsText(description)}`));
      }

      if (url) {
        lines.push(foldIcsLine(`URL:${escapeIcsText(url)}`));
      }

      lines.push("STATUS:CONFIRMED");
      lines.push("TRANSP:TRANSPARENT");
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    const body = `${lines.join("\r\n")}\r\n`;

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="capital-conference-calendar.ics"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ICS generation error";

    return new Response(`ICS generation failed: ${message}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
