import Link from "next/link";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type TickerEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  city: string;
};

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
}

function cleanDateOnly(value: unknown): string {
  return toText(value).slice(0, 10);
}

function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate) return "";
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return startDate;
  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (!endDate || endDate === startDate) return startLabel;

  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(end.getTime())) return startLabel;
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${startLabel}–${endLabel}`;
}

async function getUpcomingTickerEvents(): Promise<TickerEvent[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const token = process.env.AIRTABLE_TOKEN;
  if (!baseId || !tableName || !token) return [];

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  try {
    do {
      const url = new URL(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
      );
      if (offset) url.searchParams.set("offset", offset);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      });
      if (!response.ok) return [];

      const data = await response.json();
      records.push(...(data.records || []));
      offset = data.offset;
    } while (offset);
  } catch {
    return [];
  }

  const today = new Date();
  const todayTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return records
    .map((record) => {
      const fields = record.fields || {};
      return {
        id: record.id,
        title: toText(fields["Event Name"]) || "Untitled Event",
        startDate: cleanDateOnly(fields["Start Date"]),
        endDate: cleanDateOnly(fields["End Date"] || fields["Start Date"]),
        city: toText(fields["City"]),
      };
    })
    .filter((event) => event.startDate)
    .filter((event) => {
      const t = new Date(`${event.startDate}T00:00:00Z`).getTime();
      return !Number.isNaN(t) && t >= todayTime;
    })
    .sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return a.title.localeCompare(b.title);
    })
    .slice(0, 20);
}

export default async function EventTicker() {
  const events = await getUpcomingTickerEvents();
  if (events.length === 0) return null;

  const items = events.map((event) => {
    const dateLabel = formatDateRange(event.startDate, event.endDate);
    return `${event.title} — ${dateLabel}${event.city ? `, ${event.city}` : ""}`;
  });

  const duplicated = [...events, ...events];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "36px",
        backgroundColor: "#0e2339",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        color: "#dbe7f5",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
      aria-label="Upcoming events ticker"
    >
      <div
        style={{
          flexShrink: 0,
          padding: "0 12px",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#ffffff",
          borderRight: "1px solid rgba(255,255,255,0.14)",
          marginRight: "10px",
        }}
      >
        Upcoming Events
      </div>

      <div className="ccc-ticker-viewport" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
        <div className="ccc-ticker-track">
          {duplicated.map((event, index) => (
            <span key={`${event.id}-${index}`} className="ccc-ticker-item">
              <Link
                href={`/events?startEventId=${encodeURIComponent(event.id)}#results-panel`}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {items[index % events.length]}
              </Link>
              <span style={{ opacity: 0.55 }}>•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
