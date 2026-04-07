import EventsClient from "./EventsClient";

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
    "Primary Category"?: string;
  };
};

type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  startRaw: string;
  endRaw: string;
  startTs: number;
  endTs: number;
  city: string;
  state: string;
  country: string;
  venue: string;
  website: string;
  organizer: string;
  category: string;
};

function cleanDateOnly(value?: string) {
  return (value || "").trim().slice(0, 10);
}

function parseDateOnlyStart(value?: string) {
  const clean = cleanDateOnly(value);
  if (!clean) return NaN;

  const [year, month, day] = clean.split("-").map(Number);
  if (!year || !month || !day) return NaN;

  return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
}

function parseDateOnlyEnd(value?: string) {
  const clean = cleanDateOnly(value);
  if (!clean) return NaN;

  const [year, month, day] = clean.split("-").map(Number);
  if (!year || !month || !day) return NaN;

  return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
}

function formatDate(dateString?: string) {
  const clean = cleanDateOnly(dateString);
  if (!clean) return "N/A";

  const [year, month, day] = clean.split("-").map(Number);
  if (!year || !month || !day) return clean;

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeValue(value: AirtableValue): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function isFutureOrOngoing(startDate?: string, endDate?: string) {
  const startTs = parseDateOnlyStart(startDate);
  const endTs = parseDateOnlyEnd(endDate || startDate);

  if (isNaN(startTs) || isNaN(endTs)) return false;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  ).getTime();

  return endTs >= todayStart;
}

async function getEvents(): Promise<Event[]> {
  const baseId = process.env.AIRTABLE_BASE_ID!;
  const tableName = process.env.AIRTABLE_TABLE_NAME!;
  const token = process.env.AIRTABLE_TOKEN!;

  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Airtable fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const records: AirtableRecord[] = data.records || [];

  return records
    .map((record): Event | null => {
      const startRaw = cleanDateOnly(record.fields["Start Date"]);
      const endRaw = cleanDateOnly(
        record.fields["End Date"] || record.fields["Start Date"]
      );

      const startTs = parseDateOnlyStart(startRaw);
      const endTs = parseDateOnlyEnd(endRaw);

      if (isNaN(startTs) || isNaN(endTs)) return null;

      return {
        id: record.id,
        title: record.fields["Event Name"] || "Untitled Event",
        start: formatDate(startRaw),
        end: formatDate(endRaw),
        startRaw,
        endRaw,
        startTs,
        endTs,
        city: record.fields.City || "",
        state: record.fields["State/Province"] || "",
        country: record.fields.Country || "",
        venue: normalizeValue(record.fields["Venue Name"]),
        website: record.fields["Event Website"] || "",
        organizer: normalizeValue(
          record.fields["Organizer Name (from Organizer)"]
        ),
        category: record.fields["Primary Category"] || "",
      };
    })
    .filter((event): event is Event => Boolean(event))
    .filter((event) => isFutureOrOngoing(event.startRaw, event.endRaw))
    .sort((a, b) => a.startTs - b.startTs);
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Upcoming Conferences</h1>
      <div
  style={{
    marginTop: "20px",
    marginBottom: "30px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#f9fafb",
  }}
>
  <h2 style={{ marginBottom: "10px" }}>Subscribe to Conference Feeds</h2>

  <p style={{ marginBottom: "16px", color: "#555" }}>
    Stay updated automatically — subscribe to a live calendar feed.
  </p>

  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
    <a
      href="/api/ics"
      target="_blank"
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#111827",
        color: "#fff",
        textDecoration: "none",
      }}
    >
      All Conferences
    </a>

    <a
      href="/api/ics?country=United%20States"
      target="_blank"
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#1f2937",
        color: "#fff",
        textDecoration: "none",
      }}
    >
      U.S. Conferences
    </a>

    <a
      href="/api/ics?country=Canada"
      target="_blank"
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#1f2937",
        color: "#fff",
        textDecoration: "none",
      }}
    >
      Canada Conferences
    </a>

    <a
      href="/api/ics?category=Investor%20Conference"
      target="_blank"
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#1f2937",
        color: "#fff",
        textDecoration: "none",
      }}
    >
      Investor Conferences
    </a>

    <a
      href="/api/ics?country=United%20States&category=Investor%20Conference"
      target="_blank"
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#1f2937",
        color: "#fff",
        textDecoration: "none",
      }}
    >
      U.S. Investor Conferences
    </a>
  </div>
</div>
      <EventsClient events={events} />
    </main>
  );
}