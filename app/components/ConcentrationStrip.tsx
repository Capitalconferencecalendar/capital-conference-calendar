"use client";

type StripEvent = {
  id: string;
  title: string;
  startDate: string;
  city: string;
  state: string;
};

type StripCity = { label: string; count: number };

export type ConcentrationItem = {
  type: "hotweek" | "cluster";
  label: string;
  weekStart: string;
  weekEnd: string;
  count: number;
  cities: StripCity[];
  topTheme?: string;
  topOrganizer?: string;
  activeClusters?: number;
  events: StripEvent[];
};

function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ConcentrationStrip({
  items,
  onSelect,
}: {
  items: ConcentrationItem[];
  onSelect?: (item: ConcentrationItem) => void;
}) {
  const visibleItems = items.slice(0, 3);

  return (
    <div
      className="ccc-hot-weeks-grid ccc-concentration-atmo concentration-scroll"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "10px",
        minWidth: 0,
        maxWidth: "100%",
        width: "100%",
      }}
    >
      {visibleItems.map((item) => (
        <div
          className="concentration-card"
          key={`${item.type}-${item.weekStart}-${item.weekEnd}-${item.label}`}
          style={{
            border: "1px solid rgba(118,137,163,0.24)",
            borderRadius: "12px",
            borderTop: item.type === "cluster" ? "2px solid rgba(176,75,102,0.88)" : "2px solid rgba(179,121,78,0.88)",
            padding: "10px",
            background:
              item.type === "cluster"
                ? "linear-gradient(180deg, rgba(96,41,60,0.2) 0%, rgba(6,23,40,0) 28%), linear-gradient(180deg, rgba(8,30,52,0.9) 0%, rgba(7,24,42,0.92) 100%)"
                : "linear-gradient(180deg, rgba(100,66,44,0.2) 0%, rgba(6,23,40,0) 28%), linear-gradient(180deg, rgba(8,30,52,0.9) 0%, rgba(7,24,42,0.92) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035), 0 8px 16px rgba(2,10,24,0.22)",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", fontWeight: 760, color: "#e6eef7", lineHeight: 1.2, minWidth: 0 }}>
              {item.type === "cluster" ? `${item.label} Cluster` : `Week of ${formatDisplayDate(item.weekStart)}`}
            </div>
            <div
              className="ccc-pulse-chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 6px",
                borderRadius: "999px",
                border: item.type === "cluster" ? "1px solid rgba(181,91,111,0.72)" : "1px solid rgba(186,127,86,0.68)",
                backgroundColor: item.type === "cluster" ? "rgba(133,56,78,0.2)" : "rgba(138,89,50,0.18)",
                color: item.type === "cluster" ? "#e7b2c0" : "#efc89a",
                fontSize: "8px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              {item.type === "cluster" ? "Cluster" : "Hot Week"}
            </div>
          </div>

          <div style={{ fontSize: "16px", color: "#d6e4f7", marginBottom: "1px", fontWeight: 760, lineHeight: 1.06, letterSpacing: "0.005em" }}>
            {item.count} {item.type === "cluster" ? "Events" : "Conferences"}
          </div>
          <div style={{ fontSize: "10px", color: "#9fb6cf", marginBottom: "8px" }}>
            {formatDisplayDate(item.weekStart)} - {formatDisplayDate(item.weekEnd)}
          </div>

          {item.type === "hotweek" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px", marginBottom: "8px" }}>
                <div style={{ fontSize: "10px", color: "#9fb6cf" }}>
                  <span style={{ color: "#dbeafe", fontWeight: 700 }}>{item.cities.length}</span> Cities
                </div>
                <div style={{ fontSize: "10px", color: "#9fb6cf" }}>
                  <span style={{ color: "#dbeafe", fontWeight: 700 }}>{item.activeClusters ?? 0}</span> Clusters
                </div>
              </div>
              <div style={{ fontSize: "9px", color: "#8ea8c2", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>
                Top Markets
              </div>
              <div style={{ display: "grid", gap: "2px", marginBottom: "8px" }}>
                {item.cities.slice(0, 3).map((city) => (
                  <div key={`${item.weekStart}-${city.label}`} style={{ fontSize: "10px", color: "#dbeafe", fontWeight: 620, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {city.label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px", marginBottom: "8px" }}>
                <div style={{ fontSize: "10px", color: "#9fb6cf" }}>Same-city overlap</div>
                <div style={{ fontSize: "10px", color: "#9fb6cf" }}>5-day window</div>
              </div>
              <div style={{ display: "grid", gap: "3px", marginBottom: "8px" }}>
                {item.events.slice(0, 2).map((event) => (
                  <div key={event.id} style={{ fontSize: "10px", color: "#dbeafe", fontWeight: 620, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {event.title}
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: "10px", color: "#9fb6cf", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Top Theme: {item.topTheme || "Mixed"}
          </div>

          <button
            type="button"
            onClick={() => onSelect?.(item)}
            style={{
              display: "inline-flex",
              marginTop: "1px",
              fontSize: "10px",
              fontWeight: 760,
              color: "#9db8d4",
              textDecoration: "none",
              whiteSpace: "nowrap",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            {item.type === "cluster" ? "View Cluster →" : "View Week →"}
          </button>
        </div>
      ))}
    </div>
  );
}
