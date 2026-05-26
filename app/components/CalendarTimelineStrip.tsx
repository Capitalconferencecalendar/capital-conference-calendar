"use client";

import { useMemo, useRef } from "react";

type Item = {
  id: string;
  title: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  isHot: boolean;
};

type WeekGroup = { key: string; label: string; events: Item[] };

function weekStartISO(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(iso: string) {
  const s = new Date(`${iso}T00:00:00`);
  const e = new Date(s.getTime() + 6 * 86400000);
  const sm = s.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const em = e.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const sd = s.getDate();
  const ed = e.getDate();
  if (sm === em) return `${sm} ${sd}–${ed}`;
  return `${sm} ${sd}–${em} ${ed}`;
}

function formatRange(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${(end || start)}T00:00:00`);
  if (Number.isNaN(s.getTime())) return start;
  if (Number.isNaN(e.getTime()) || end === start) {
    return s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  const sm = s.toLocaleDateString("en-US", { month: "short" });
  const em = e.toLocaleDateString("en-US", { month: "short" });
  if (sm === em) return `${sm} ${s.getDate()}–${e.getDate()}`;
  return `${sm} ${s.getDate()}–${em} ${e.getDate()}`;
}

export default function CalendarTimelineStrip({
  events,
  onSelect,
}: {
  events: Item[];
  onSelect: (eventId: string) => void;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const groups = useMemo<WeekGroup[]>(() => {
    const map = new Map<string, Item[]>();
    events.forEach((event) => {
      const key = weekStartISO(event.startDate);
      map.set(key, [...(map.get(key) || []), event]);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, list]) => ({ key, label: formatWeekLabel(key), events: list }));
  }, [events]);

  const scrollByAmount = (delta: number) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const el = viewportRef.current;
    if (!el) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    }
  };

  return (
    <section
      style={{
        border: "1px solid rgba(96,165,250,0.14)",
        borderRadius: "14px",
        background: "linear-gradient(180deg, rgba(8,31,54,0.86) 0%, rgba(7,27,48,0.84) 100%)",
        padding: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div>
          <div style={{ color: "#dbeafe", fontWeight: 800, fontSize: "15px" }}>Calendar Timeline</div>
          <div style={{ color: "#9fc0df", fontSize: "12px" }}>Scroll by week to plan concentration windows</div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button type="button" onClick={() => scrollByAmount(-420)} style={{ width: "30px", height: "30px", borderRadius: "999px", border: "1px solid rgba(147,197,253,0.3)", background: "rgba(147,197,253,0.08)", color: "#dbeafe" }}>‹</button>
          <button type="button" onClick={() => scrollByAmount(420)} style={{ width: "30px", height: "30px", borderRadius: "999px", border: "1px solid rgba(147,197,253,0.3)", background: "rgba(147,197,253,0.08)", color: "#dbeafe" }}>›</button>
        </div>
      </div>

      <div
        ref={viewportRef}
        onWheel={onWheel}
        className="timeline-scroll"
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "8px",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", gap: "16px", minWidth: "max-content", width: "max-content" }}>
          {groups.map((group) => (
            <article
              className="week-column"
              key={group.key}
              style={{
                flex: "0 0 300px",
                minWidth: "300px",
                maxWidth: "300px",
                scrollSnapAlign: "start",
                border: "1px solid rgba(96,165,250,0.16)",
                borderRadius: "12px",
                background: "rgba(8,30,53,0.72)",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ color: "#e5f1ff", fontSize: "13px", fontWeight: 800 }}>{group.label}</div>
                <div style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 700 }}>{group.events.length} EVENTS</div>
              </div>

              <div style={{ display: "grid", gap: "6px" }}>
                {group.events.slice(0, 6).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onSelect(event.id)}
                    style={{
                      textAlign: "left",
                      border: event.isHot ? "1px solid rgba(249,115,22,0.42)" : "1px solid rgba(147,197,253,0.2)",
                      borderRadius: "10px",
                      background: event.isHot ? "rgba(249,115,22,0.08)" : "rgba(8,30,53,0.74)",
                      padding: "8px",
                      color: "#dbeafe",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, lineHeight: 1.3 }}>{event.title}</div>
                      {event.isHot ? <span style={{ fontSize: "9px", color: "#fdba74", fontWeight: 800 }}>HOT</span> : null}
                    </div>
                    <div style={{ marginTop: "3px", color: "#9fc0df", fontSize: "11px" }}>{[event.city, event.state].filter(Boolean).join(", ")}</div>
                    <div style={{ marginTop: "2px", color: "#93c5fd", fontSize: "10px" }}>{formatRange(event.startDate, event.endDate)}</div>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
