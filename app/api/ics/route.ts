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
  lastVerified: string;
  sourcePage: string;
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

function isWebsiteApproved(fields: Record<string, unknown>): boolean {
  const approvalKey =
    Object.keys(fields).find(
      (key) => key.replace(/[^a-z]/gi, "").toLowerCase() === "websiteapproval"
    ) || "Website Approval";
  const normalized = toText(fields[approvalKey]).toLowerCase().replace(/\s+/g, "");
  if (!normalized) return false;
  const looksApproved = normalized.includes("approved") || normalized.includes("appoved");
  const looksRejected =
    normalized.includes("notapproved") ||
    normalized.includes("unapproved") ||
    normalized.includes("pending") ||
    normalized.includes("rejected");
  return looksApproved && !looksRejected;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildUid(event: EventRow): string {
  const base = [event.id, event.startDate, event.endDate, event.title]
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
  const eventLink = event.website || event.sourcePage;

  if (event.organizer) lines.push(`Organizer: ${event.organizer}`);
  if (event.primaryCategory) lines.push(`Primary Category: ${event.primaryCategory}`);
  if (event.marketFocus) lines.push(`Market Focus: ${event.marketFocus}`);
  if (event.sectorThemes) lines.push(`Sector / Themes: ${event.sectorThemes}`);
  if (event.format.toLowerCase() === "hybrid") {
    lines.push("Access: With Live Stream");
  }
  if (event.issuerParticipation) {
    lines.push(`Issuer Participation: ${event.issuerParticipation}`);
  }
  if (event.region) lines.push(`Region: ${event.region}`);

  if (eventLink) {
    lines.push("");
    lines.push("Event Link:");
    lines.push(eventLink);
  }
  if (event.sourcePage && event.sourcePage !== eventLink) {
    lines.push(`Source Page: ${event.sourcePage}`);
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
    .filter((record) => isWebsiteApproved(record.fields || {}))
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
        lastVerified: cleanDateOnly(fields["Last Verified"]),
        sourcePage: toText(fields["Source Page (event-specific)"]),
      };
    })
    .filter((event) => event.startDate);
}

function matchesMulti(value: string, selected: string[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

function matchesQuery(event: EventRow, query: string): boolean {
  if (!query) return true;

  const haystack = [
    event.title,
    event.organizer,
    event.city,
    event.state,
    event.region,
    event.country,
    event.venue,
    event.primaryCategory,
    event.marketFocus,
    event.sectorThemes,
    event.format,
    event.issuerParticipation,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function buildCalendarName(filters: {
  explicitName: string;
  feedKey: string;
  query: string;
  categories: string[];
  marketFocuses: string[];
  issuerParticipation: string[];
  sectorThemes: string[];
  cities: string[];
  states: string[];
  regions: string[];
  countries: string[];
  organizers: string[];
  from: string;
  to: string;
}) {
  if (filters.explicitName) return filters.explicitName;
  const parts: string[] = [];

  if (filters.query) parts.push(`Search: ${filters.query}`);
  if (filters.categories.length > 0) parts.push(filters.categories.join(", "));
  if (filters.marketFocuses.length > 0) parts.push(filters.marketFocuses.join(", "));
  if (filters.issuerParticipation.length > 0) parts.push(filters.issuerParticipation.join(", "));
  if (filters.regions.length > 0) parts.push(filters.regions.join(", "));
  if (filters.cities.length > 0) parts.push(filters.cities.join(", "));
  if (filters.states.length > 0) parts.push(filters.states.join(", "));
  if (filters.countries.length > 0) parts.push(filters.countries.join(", "));
  if (filters.organizers.length > 0) parts.push(filters.organizers.join(", "));
  if (filters.sectorThemes.length > 0) parts.push(filters.sectorThemes.join(", "));
  if (filters.from) parts.push(`From ${filters.from}`);
  if (filters.to) parts.push(`To ${filters.to}`);

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
    const cities = toArray(searchParams.getAll("city"));
    const states = toArray(searchParams.getAll("state"));
    const regions = toArray(searchParams.getAll("region"));
    const countries = toArray(searchParams.getAll("country"));
    const organizers = toArray(searchParams.getAll("organizer"));
    const query = searchParams.get("q")?.trim() || "";
    const explicitName = searchParams.get("name")?.trim() || "";
    const feedKey = searchParams.get("feedKey")?.trim() || "";
    const from = searchParams.get("from")?.trim().slice(0, 10) || "";
    const to = searchParams.get("to")?.trim().slice(0, 10) || "";

    const events = await getEvents();

    const filteredEvents = events
      .filter((event) => matchesQuery(event, query))
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
      .filter((event) => matchesMulti(event.city, cities))
      .filter((event) => matchesMulti(event.state, states))
      .filter((event) => matchesMulti(event.region, regions))
      .filter((event) => matchesMulti(event.country, countries))
      .filter((event) => matchesMulti(event.organizer, organizers))
      .filter((event) => !from || event.startDate >= from)
      .filter((event) => !to || event.startDate <= to)
      .sort((a, b) => {
        if (a.startDate !== b.startDate) {
          return a.startDate.localeCompare(b.startDate);
        }
        return a.title.localeCompare(b.title);
      });

    const calendarName = buildCalendarName({
      explicitName,
      feedKey,
      query,
      categories,
      marketFocuses,
      issuerParticipation,
      sectorThemes,
      cities,
      states,
      regions,
      countries,
      organizers,
      from,
      to,
    });

    const dtstamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Capital Conference Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      foldIcsLine(`X-WR-RELCALID:${escapeIcsText(feedKey || "capital-conference-calendar")}`),
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
      const url =
        event.website ||
        event.sourcePage ||
        "https://www.capitalconferencecalendar.com";
      const description = buildDescription(event);
      const htmlDescription = `${escapeHtml(description).replace(/\n/g, "<br/>")}${
        url ? `<br/><br/><a href="${escapeHtml(url)}">${escapeHtml(url)}</a>` : ""
      }`;
      const location = buildLocation(event);

      lines.push("BEGIN:VEVENT");
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(foldIcsLine(`UID:${escapeIcsText(buildUid(event))}`));
      lines.push(foldIcsLine(`SUMMARY:${escapeIcsText(event.title)}`));
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(start)}`);
      lines.push(`DTEND;VALUE=DATE:${formatIcsDate(endExclusive)}`);

      if (location) {
        lines.push(foldIcsLine(`LOCATION:${escapeIcsText(location)}`));
      }

      if (description) {
        lines.push(foldIcsLine(`DESCRIPTION:${escapeIcsText(description)}`));
        lines.push(
          foldIcsLine(`X-ALT-DESC;FMTTYPE=text/html:${htmlDescription}`)
        );
      }

      lines.push(foldIcsLine(`URL:${escapeIcsText(url)}`));
      lines.push(foldIcsLine(`SOURCE:${escapeIcsText(url)}`));
      lines.push("STATUS:CONFIRMED");
      lines.push("TRANSP:TRANSPARENT");
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    return new Response(`${lines.join("\r\n")}\r\n`, {
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
