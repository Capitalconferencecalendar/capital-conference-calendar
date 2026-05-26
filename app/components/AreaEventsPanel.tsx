"use client";

import { useMemo } from "react";

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
  sectorThemes: string;
};

function sameCity(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function fmtDate(startDate: string, endDate: string) {
  const s = new Date(`${startDate}T00:00:00`);
  const e = new Date(`${(endDate || startDate)}T00:00:00`);
  if (Number.isNaN(s.getTime())) return startDate;
  const sm = s.toLocaleDateString("en-US", { month: "short" });
  const sd = s.getDate();
  const em = e.toLocaleDateString("en-US", { month: "short" });
  const ed = e.getDate();
  if (!endDate || startDate === endDate) return `${sm} ${sd}`;
  if (sm === em) return `${sm} ${sd}–${ed}`;
  return `${sm} ${sd}–${em} ${ed}`;
}

export default function AreaEventsPanel({
  events,
  initialCity,
}: {
  events: EventRow[];
  initialCity: string;
  _initialState: string;
}) {
  const city = initialCity || "New York";

  const areaEvents = useMemo(() => {
    const same = events.filter((event) => sameCity(event.city || "", city));
    return (same.length ? same : events).slice(0, 8);
  }, [events, city]);

  const beaconNodes = useMemo(() => {
    const base = [
      { x: 58, y: 50, kind: "selected", size: 16, label: city.toUpperCase() },
      { x: 43, y: 44, kind: "near", size: 8 },
      { x: 66, y: 40, kind: "near", size: 8 },
      { x: 49, y: 61, kind: "cluster", size: 9 },
      { x: 70, y: 60, kind: "near", size: 8 },
      { x: 35, y: 57, kind: "near", size: 8 },
      { x: 74, y: 48, kind: "cluster", size: 9 },
    ];
    return base;
  }, [city]);

  return (
    <div className="ccc-area-events-grid" style={{ display: "grid", gridTemplateColumns: "40% 60%", gap: "16px", alignItems: "stretch", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gap: "8px" }}>
        {areaEvents.map((event, idx) => (
          <article key={event.id} style={{ border: "1px solid rgba(147,197,253,0.22)", borderRadius: "10px", background: "rgba(8,30,53,0.76)", padding: "10px", minHeight: "94px" }}>
            <div style={{ fontSize: "12px", color: "#f0f7ff", fontWeight: 700, lineHeight: 1.3 }}>{event.title}</div>
            <div style={{ marginTop: "4px", fontSize: "11px", color: "#9fc0df" }}>{fmtDate(event.startDate, event.endDate)}</div>
            <div style={{ marginTop: "2px", fontSize: "11px", color: "#93c5fd" }}>{[event.city, event.state].filter(Boolean).join(", ")}</div>
            <div style={{ marginTop: "5px", fontSize: "10px", color: "#bfdbfe" }}>{(idx + 2) * 1.6} mi</div>
          </article>
        ))}
      </div>

      <div style={{ border: "1px solid rgba(96,165,250,0.18)", borderRadius: "12px", background: "radial-gradient(120% 120% at 50% 50%, rgba(14,165,233,0.12) 0%, rgba(8,30,53,0) 48%), linear-gradient(180deg, rgba(7,27,48,0.9) 0%, rgba(5,20,36,0.9) 100%)", position: "relative", overflow: "hidden", minHeight: "360px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

        <div style={{ position: "absolute", left: "58%", top: "50%", width: "220px", height: "220px", transform: "translate(-50%, -50%)", borderRadius: "999px", border: "1px dashed rgba(96,165,250,0.45)", boxShadow: "0 0 0 1px rgba(96,165,250,0.08) inset" }} />
        <div style={{ position: "absolute", left: "58%", top: "50%", transform: "translate(-50%, calc(-50% + 130px))", color: "#93c5fd", fontSize: "10px", letterSpacing: "0.09em", fontWeight: 700 }}>25 MI RADIUS</div>

        {beaconNodes.map((node, idx) => (
          <div key={idx} style={{ position: "absolute", left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}>
            <span
              className={node.kind === "selected" ? "ccc-live-dot" : undefined}
              style={{
                width: `${node.size}px`,
                height: `${node.size}px`,
                borderRadius: "999px",
                display: "block",
                background: node.kind === "selected" ? "#60a5fa" : node.kind === "cluster" ? "#fb923c" : "#818cf8",
                boxShadow:
                  node.kind === "selected"
                    ? "0 0 0 10px rgba(59,130,246,0.16), 0 0 28px rgba(59,130,246,0.62)"
                    : node.kind === "cluster"
                    ? "0 0 18px rgba(249,115,22,0.62)"
                    : "0 0 12px rgba(99,102,241,0.5)",
              }}
            />
            {node.kind === "selected" ? (
              <div style={{ marginTop: "8px", color: "#dbeafe", fontWeight: 800, letterSpacing: "0.08em", fontSize: "13px", textAlign: "center" }}>
                {node.label}
              </div>
            ) : null}
          </div>
        ))}

        <div style={{ position: "absolute", right: "12px", top: "12px", border: "1px solid rgba(147,197,253,0.2)", borderRadius: "10px", background: "rgba(8,30,53,0.72)", padding: "8px", display: "grid", gap: "6px", minWidth: "165px" }}>
          <div style={{ fontSize: "11px", color: "#dbeafe", fontWeight: 700 }}>Legend</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#bfdbfe", fontSize: "10px" }}><span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#60a5fa" }} />Selected Location</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#bfdbfe", fontSize: "10px" }}><span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#818cf8" }} />Conference Nearby</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#bfdbfe", fontSize: "10px" }}><span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#fb923c" }} />Cluster</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#bfdbfe", fontSize: "10px" }}><span style={{ width: "12px", height: "12px", borderRadius: "999px", border: "1px dashed rgba(96,165,250,0.65)" }} />25 Mi Radius</div>
        </div>
      </div>
    </div>
  );
}
