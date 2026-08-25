"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function EventTicker({ events: providedEvents }: EventTickerProps) {
  const hasProvidedEvents = providedEvents !== undefined;
  const [events, setEvents] = useState<TickerEvent[]>(providedEvents || []);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    hasProvidedEvents ? "ready" : "loading"
  );

  useEffect(() => {
    if (hasProvidedEvents) {
      setEvents(providedEvents || []);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    fetch("/api/ticker-events", { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load ticker events.");
        return response.json() as Promise<{ events?: TickerEvent[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        setEvents((data.events || []).map((event) => ({
          id: toText(event.id),
          title: toText(event.title) || "Untitled Event",
          startDate: cleanDateOnly(event.startDate),
          endDate: cleanDateOnly(event.endDate || event.startDate),
          city: toText(event.city),
        })).filter((event) => event.id && event.startDate));
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setEvents([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [hasProvidedEvents, providedEvents]);

  const displayEvents = events;
  const isLoading = status === "loading";
  const isError = status === "error";
  const showEmpty = status === "ready" && displayEvents.length === 0;

  const items = displayEvents.map((event) => {
    const dateLabel = formatDateRange(event.startDate, event.endDate);
    return `${event.title} — ${dateLabel}${event.city ? `, ${event.city}` : ""}`;
  });

  const tickerLoops = displayEvents.length === 1 ? 12 : 3;
  const duplicated = Array.from({ length: tickerLoops }, () => displayEvents).flat();
  // The track repeats the same set three times for a seamless loop. Give each
  // complete set its own slow reading interval rather than dividing that time
  // across all duplicated copies.
  const tickerPassSeconds = Math.max(55, displayEvents.length * 2.75);
  const tickerDurationSeconds = tickerPassSeconds * tickerLoops;

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
        {isLoading || isError || showEmpty ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              color: isError ? "#fca5a5" : "#b9cee4",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.01em",
              opacity: 0.9,
            }}
          >
            {isLoading ? "Loading upcoming conferences..." : isError ? "Unable to load upcoming conferences." : "No upcoming conferences available for ticker."}
          </div>
        ) : (
        <div
          className={`ccc-ticker-track${duplicated.length > 1 ? "" : " ccc-ticker-track-static"}`}
          style={{
            animationDuration: `${tickerDurationSeconds}s`,
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
        )}
      </div>
    </div>
  );
}
