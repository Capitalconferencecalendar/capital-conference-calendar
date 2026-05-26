"use client";

import { useState, type ReactNode } from "react";
import type { MarketIntelligenceItem } from "../../lib/marketIntelligence";

function SignalTypeIcon({ icon: iconName, color }: { icon: string; color: string }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  let iconNode: ReactNode;

  if (iconName === "MapPin") {
    iconNode = (
      <svg {...common}><path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.2" /></svg>
    );
  } else if (iconName === "BarChart3") {
    iconNode = (
      <svg {...common}><path d="M4 20V9" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20v-3" /></svg>
    );
  } else if (iconName === "Grid3X3") {
    iconNode = (
      <svg {...common}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>
    );
  } else if (iconName === "Building2") {
    iconNode = (
      <svg {...common}><path d="M3 21h18" /><path d="M5 21V9" /><path d="M19 21V9" /><path d="M12 21V9" /><path d="M3 9l9-5 9 5" /></svg>
    );
  } else if (iconName === "Globe2") {
    iconNode = (
      <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13.5 13.5 0 0 1 0 18" /><path d="M12 3a13.5 13.5 0 0 0 0 18" /></svg>
    );
  } else if (iconName === "Layers") {
    iconNode = (
      <svg {...common}><path d="M12 4 3 9l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>
    );
  } else if (iconName === "TrendingUp") {
    iconNode = (
      <svg {...common}><path d="M4 16l5-5 4 3 7-7" /><path d="M16 7h4v4" /></svg>
    );
  } else if (iconName === "CalendarDays") {
    iconNode = (
      <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></svg>
    );
  } else if (iconName === "Flame") {
    iconNode = (
      <svg {...common}><path d="M12 3s4 3 4 7a4 4 0 1 1-8 0c0-1.9 1-3.9 2.8-5.8" /><path d="M10 13a2 2 0 1 0 4 0c0-1.2-.7-2.2-1.6-3.3" /></svg>
    );
  } else if (iconName === "Shuffle") {
    iconNode = (
      <svg {...common}><path d="M16 3h5v5" /><path d="M4 20l7-7" /><path d="M21 8l-5 5" /><path d="M16 16h5v5" /><path d="M4 4l7 7" /></svg>
    );
  } else if (iconName === "Network") {
    iconNode = (
      <svg {...common}><circle cx="5" cy="12" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="19" cy="19" r="2" /><path d="M7 12h8" /><path d="M17.5 6.5 13 10" /><path d="M17.5 17.5 13 14" /></svg>
    );
  } else if (iconName === "Map") {
    iconNode = (
      <svg {...common}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z" /><path d="M9 4v14" /><path d="M15 6v14" /></svg>
    );
  } else if (iconName === "Activity") {
    iconNode = (
      <svg {...common}><path d="M3 12h4l2-5 4 10 2-5h6" /></svg>
    );
  } else {
    iconNode = (
      <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
    );
  }

  return (
    <span
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        backgroundColor: color,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {iconNode}
    </span>
  );
}

function splitStory(text: string, title?: string) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  let headline = (title || sentences[0] || text).trim();
  if (headline.length > 120) {
    const commaCut = headline.indexOf(",");
    if (commaCut > 56 && commaCut < 120) {
      headline = `${headline.slice(0, commaCut)}.`;
    } else {
      headline = `${headline.slice(0, 117).trimEnd()}...`;
    }
  }
  const body = sentences.slice(1).join(" ").trim();
  return { headline, body };
}

export default function IntelligenceRail({
  signals,
  totalConferencesTracked,
  trackedCities,
}: {
  signals: MarketIntelligenceItem[];
  totalConferencesTracked: number;
  trackedCities: number;
}) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  return (
    <div
      className="intelligence-rail"
      style={{
        width: "100%",
        maxWidth: "100%",
        background: "linear-gradient(180deg, #204261 0%, #1b3b58 100%)",
        borderRadius: "11px",
        height: "calc(100vh - 104px)",
        overflowY: "auto",
        boxShadow: "0 10px 24px rgba(2, 10, 22, 0.2)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          padding: "6px 7px",
          background: "linear-gradient(180deg, #2a5277 0%, #204261 100%)",
          borderBottom: "1px solid rgba(180, 206, 233, 0.24)",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <span className="ccc-live-dot" style={{ width: "7px", height: "7px", borderRadius: "999px", backgroundColor: "#60a5fa" }} />
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#dbeafe" }}>
            Live Market Intelligence
          </div>
        </div>
        <div style={{ fontSize: "10px", color: "#bfdbfe", lineHeight: 1.3 }}>
          Real-time conference activity observations
        </div>
        <div style={{ marginTop: "2px", fontSize: "9px", color: "#93c5fd" }}>
          Monitoring {totalConferencesTracked} conferences • {trackedCities} cities
        </div>
      </div>

      <div>
        {signals.map((signal, index) => {
          const { headline, body } = splitStory(signal.body, signal.title);
          const isExpanded = Boolean(expandedItems[signal.id]);
          const fullBody = body.length > 420 ? `${body.slice(0, 420).trimEnd()}...` : body;
          const showToggle = fullBody.length > 0;
          return (
            <div
              key={signal.id}
              style={{
                padding: "5px 7px",
                borderBottom: "1px solid rgba(180, 206, 233, 0.16)",
                backgroundColor: index % 2 === 0 ? "rgba(47, 87, 122, 0.36)" : "rgba(38, 74, 106, 0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                <SignalTypeIcon icon={signal.icon} color={signal.color} />
                <div>
                  <div style={{ fontSize: "8.5px", fontWeight: 800, color: "#c7ddff", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {signal.type}
                  </div>
                  <div style={{ fontSize: "9px", color: "#93c5fd", lineHeight: 1.15 }}>{signal.timestamp}</div>
                </div>
              </div>

              <h3 style={{ fontSize: "14px", color: "#f8fbff", lineHeight: 1.22, margin: "0 0 3px", fontWeight: 700 }}>
                {headline}
              </h3>

              {fullBody ? (
                <p className={`ccc-feed-body ${isExpanded ? "expanded" : "collapsed"}`}>{fullBody}</p>
              ) : null}

              {showToggle ? (
                <button
                  type="button"
                  className="ccc-feed-toggle"
                  onClick={() =>
                    setExpandedItems((prev) => ({
                      ...prev,
                      [signal.id]: !prev[signal.id],
                    }))
                  }
                >
                  {isExpanded ? "Read less" : "Read more"}
                </button>
              ) : null}

              <div style={{ fontSize: "9px", color: "#93c5fd", marginTop: "2px" }}>
                Updated {signal.updatedMinutesAgo} min ago
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
