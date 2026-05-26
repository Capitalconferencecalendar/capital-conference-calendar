import { headers } from "next/headers";
import AppShell from "./components/AppShell";
import EventsClient, { type WorkspaceEvent } from "./events/EventsClient";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) return value.map((item) => toText(item)).filter(Boolean).join(", ");
  return "";
}

function cleanDateOnly(value: unknown): string {
  return toText(value).slice(0, 10);
}

function firstText(fields: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = toText(fields[key]);
    if (value) return value;
  }
  return "";
}

async function getEvents(): Promise<WorkspaceEvent[]> {
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
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
      if (offset) url.searchParams.set("offset", offset);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Airtable fetch failed: ${response.status} ${response.statusText} - ${text}`);
      }

      const data = await response.json();
      records.push(...(data.records || []));
      offset = data.offset;
    } while (offset);
  } catch (error) {
    console.error("Airtable fetch failed in HomePage.getEvents:", error);
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
        website: firstText(fields, ["Event Website", "Website", "Event Link", "Conference URL"]),
        sourcePage: firstText(fields, ["Source Page (event-specific)", "Source Page", "Source URL"]),
        organizer: toText(fields["Organizer Name (from Organizer)"]),
        primaryCategory: toText(fields["Primary Category"]),
        marketFocus: toText(fields["Market Focus"]),
        sectorThemes: toText(fields["Sector / Themes"]) || toText(fields["Sector / Theme"]),
        issuerParticipation: toText(fields["Issuer Participation"]),
        region: toText(fields["Region"]),
        format: toText(fields["Format"]),
      } satisfies WorkspaceEvent;
    })
    .filter((event) => event.startDate)
    .sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return a.title.localeCompare(b.title);
    });
}

type SearchParamsShape = Record<string, string | string[] | undefined>;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsShape>;
}) {
  const reqHeaders = await headers();
  const events = await getEvents();
  const initialCity = reqHeaders.get("x-vercel-ip-city") || reqHeaders.get("x-city") || "";
  const params = (searchParams ? await searchParams : {}) as SearchParamsShape;
  const qParam = params.q;
  const initialSearchQuery = Array.isArray(qParam) ? qParam[0] || "" : qParam || "";
  const modeParam = params.mode;
  const initialModeRaw = Array.isArray(modeParam) ? modeParam[0] || "" : modeParam || "";
  const initialMode =
    initialModeRaw === "about" || initialModeRaw === "contact" || initialModeRaw === "subscribe" || initialModeRaw === "submit"
      ? initialModeRaw
      : "market";

  return (
    <AppShell
      active={
        initialMode === "about"
          ? "about"
          : initialMode === "contact"
            ? "help"
          : initialMode === "subscribe"
              ? "feeds"
              : initialMode === "submit"
                ? "submit"
            : "dashboard"
      }
      searchQuery={initialSearchQuery}
    >
      <EventsClient events={events} initialCity={initialCity} initialSearchQuery={initialSearchQuery} initialMode={initialMode} />
    </AppShell>
  );
}
