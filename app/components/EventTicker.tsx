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

type EventTickerProps = {
  events?: TickerEvent[];
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

function toUtcDayTime(dateOnly: string): number {
  if (!dateOnly) return Number.NaN;
  return new Date(`${dateOnly}T00:00:00Z`).getTime();
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
    .filter((record) => isWebsiteApproved(record.fields || {}))
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
      const activeUntil = toUtcDayTime(event.endDate || event.startDate);
      return !Number.isNaN(activeUntil) && activeUntil >= todayTime;
    })
    .sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return a.title.localeCompare(b.title);
    })
    .slice(0, 20);
}

export default async function EventTicker({ events: providedEvents }: EventTickerProps) {
  const events = providedEvents?.length ? providedEvents : await getUpcomingTickerEvents();
  if (events.length === 0) return null;

  const items = events.map((event) => {
    const dateLabel = formatDateRange(event.startDate, event.endDate);
    return `${event.title} — ${dateLabel}${event.city ? `, ${event.city}` : ""}`;
  });

  const tickerLoops = events.length === 1 ? 12 : 3;
  const duplicated = Array.from({ length: tickerLoops }, () => events).flat();
  // Keep movement readable, but do not let a larger event list turn the ticker
  // into an almost-static multi-minute animation.
  const tickerDurationSeconds = Math.min(72, Math.max(38, events.length * 3));

  return (
    <div
      className="ccc-ticker-shell"
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
      <Link
        href="/?mode=market&workspace=database"
        style={{
          flexShrink: 0,
          padding: "0 14px 0 16px",
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#ffffff",
          borderRight: "1px solid rgba(255,255,255,0.10)",
          marginRight: "10px",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "9px",
          height: "100%",
          cursor: "pointer",
          background: "linear-gradient(180deg, rgba(8,28,48,0.96), rgba(11,34,56,0.92))",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(46,211,183,0.06)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "relative",
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "#34d399",
            boxShadow: "0 0 0 4px rgba(52,211,153,0.14), 0 0 16px rgba(45,212,191,0.48)",
            flexShrink: 0,
          }}
        />
        Upcoming Events
      </Link>

      <div className="ccc-ticker-viewport" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
        <div
          className="ccc-ticker-track"
          style={{
            animation:
              duplicated.length > 1
                ? `cccTickerScroll ${tickerDurationSeconds}s linear infinite`
                : "none",
          }}
        >
          {duplicated.map((event, index) => (
            <span key={`${event.id}-${index}`} className="ccc-ticker-item">
              <Link
                href={`/?mode=market&workspace=database&q=${encodeURIComponent(event.title)}&eventId=${encodeURIComponent(event.id)}`}
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
