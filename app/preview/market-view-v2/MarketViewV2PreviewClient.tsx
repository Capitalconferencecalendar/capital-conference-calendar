"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const metroStorageKey = "marketViewV2.primaryMetro";

const navItems = [
  "Market View",
  "What To Watch",
  "Planning Windows",
  "Cluster Intelligence",
  "MoM Readout",
  "Organizer Tables",
  "Metro Watch",
];

const quickFeeds = [
  ["Hot Weeks", "22"],
  ["Issuer Access", "475"],
  ["Healthcare", "138"],
  ["Private Markets", "154"],
  ["New York Metro", "170"],
];

const readoutStats = [
  { label: "Conference Universe", value: "860", note: "tracked forward events" },
  { label: "Current Period", value: "Late Summer 2026", note: "planning period" },
  { label: "Peak Week", value: "Sep 14-Sep 20", note: "highest visible density" },
  { label: "Top Sector", value: "Healthcare", note: "issuer-access weighted" },
  { label: "Top Market Focus", value: "Institutional Investors", note: "largest classified share" },
  { label: "Top Metro", value: "New York Metro", note: "most active planning market" },
];

const secondarySignals = [
  {
    type: "Cluster Alert",
    title: "New York Metro healthcare issuer-access cluster",
    window: "Sep 14-Sep 20",
    metric: "6 aligned events",
    detail: "Healthcare, issuer-access, and institutional-investor signals share a practical reason to attend.",
  },
  {
    type: "Meeting-Day Opportunity",
    title: "Boston / Cambridge sector meeting window",
    window: "Sep 22",
    metric: "1 open business day",
    detail: "Two aligned sector events create a private-meeting gap for overlapping coverage teams.",
  },
  {
    type: "Destination Event",
    title: "Energy transition destination candidate",
    window: "Oct 7-Oct 9",
    metric: "3-day program",
    detail: "A single multi-day event outside regular hub activity has a narrow sector reason to review.",
  },
  {
    type: "Conflict Alert",
    title: "Real estate capital markets overlap",
    window: "Oct 14-Oct 16",
    metric: "4 similar events",
    detail: "Comparable audience and market-focus signals may compete for attention across two metros.",
  },
];

const hotWeeks = [
  ["Sep 14-Sep 20", "36 events", "18 issuer-access signals", "Healthcare + institutional investors"],
  ["Sep 28-Oct 4", "31 events", "12 issuer-access signals", "Financial services + private markets"],
  ["Oct 12-Oct 18", "28 events", "10 issuer-access signals", "Real estate + energy transition"],
];

const whiteSpace = [
  ["Nov 2-Nov 6", "Lower conflict", "Institutional outreach window"],
  ["Dec 7-Dec 11", "Moderate activity", "Sponsor visibility window"],
  ["Jan 12-Jan 16", "Early-year reset", "Organizer positioning window"],
];

const meetingDays = [
  ["Sep 22", "Boston / Cambridge", "Healthcare Investor Forum -> Institutional Investor Conference"],
  ["Oct 8", "Bay Area", "Technology leadership -> Private Markets Forum"],
  ["Oct 15", "Chicago Metro", "Real estate access -> Credit-market coverage"],
];

const clusters = [
  {
    type: "Sector Cluster",
    metro: "New York Metro",
    title: "Healthcare issuer-access cluster",
    window: "Sep 14-Sep 20",
    signals: "Healthcare / issuer access / institutional investors",
    count: "6 aligned events",
    access: "4 issuer-access signals",
    cities: "New York, Jersey City, Stamford",
    reason: "Shared sector coverage and access signals suggest a concentrated week for company meetings, investor coverage, and sponsor outreach.",
  },
  {
    type: "Access Cluster",
    metro: "Boston / Cambridge",
    title: "Company-presentation access cluster",
    window: "Sep 21-Sep 24",
    signals: "Company presentations / 1x1 meetings / public-company coverage",
    count: "4 aligned events",
    access: "3 structured-access signals",
    cities: "Boston, Cambridge",
    reason: "Multiple access-oriented programs appear close enough in timing and geography to support same-trip relationship planning.",
  },
  {
    type: "Investor Cluster",
    metro: "Bay Area",
    title: "Technology growth-investor cluster",
    window: "Oct 6-Oct 10",
    signals: "Institutional investors / technology / growth sectors",
    count: "5 aligned events",
    access: "3 investor-heavy signals",
    cities: "San Francisco, Palo Alto, San Jose",
    reason: "Investor-relevant programming is concentrated around related technology and growth-company themes.",
  },
  {
    type: "Deal / BD Cluster",
    metro: "Dallas-Fort Worth",
    title: "Private markets sponsor-visibility cluster",
    window: "Oct 20-Oct 23",
    signals: "Private markets / sponsor visibility / networking",
    count: "3 aligned events",
    access: "2 sponsor / BD signals",
    cities: "Dallas, Fort Worth",
    reason: "The mix leans toward business-development and relationship coverage rather than pure issuer access.",
  },
];

const clusterTypes = [
  ["Sector Clusters", "5"],
  ["Access Clusters", "4"],
  ["Investor Clusters", "3"],
  ["Deal / BD Clusters", "2"],
  ["Market Focus Clusters", "4"],
];

const topSectors = [
  ["Healthcare", 42],
  ["Financial Services", 31],
  ["Technology", 28],
  ["Real Estate", 23],
  ["Energy Transition", 18],
];

const marketFocusMix = [
  ["Institutional Investors", 40],
  ["Public Company CEOs", 20],
  ["Private Equity", 12],
  ["Credit / Fixed Income", 8],
  ["Real Assets", 6],
];

const characterMix = [
  ["Meeting-Driven", 42],
  ["Presentation-Heavy", 24],
  ["Deal-Making / Partnering", 15],
  ["Networking", 11],
  ["Thematic Conference", 8],
];

const audienceMix = [
  ["Issuer Access Signal", 55],
  ["Investor Relevance Signal", 48],
  ["Structured Access Signal", 22],
  ["Sponsor / BD Signal", 18],
  ["Sector Intelligence Signal", 44],
];

const organizers = [
  ["1", "Organizer Alpha", "18", "12", "Healthcare", "New York Metro", "Healthcare Investor Forum"],
  ["2", "Organizer Beta", "14", "9", "Financial Services", "Boston / Cambridge", "Institutional Investor Conference"],
  ["3", "Organizer Gamma", "12", "7", "Real Estate", "Dallas-Fort Worth", "Real Estate Capital Markets Summit"],
  ["4", "Organizer Delta", "9", "6", "Private Markets", "Miami / South Florida", "Private Markets Forum"],
  ["5", "Organizer Epsilon", "8", "5", "Energy Transition", "Bay Area", "Energy Transition Capital Summit"],
];

const metros = [
  ["New York Metro", "5", "Healthcare", "Institutional Investors", "36 upcoming"],
  ["Boston / Cambridge", "3", "Healthcare", "Company Presentations", "22 upcoming"],
  ["Bay Area", "3", "Technology", "Growth Investors", "21 upcoming"],
  ["Dallas-Fort Worth", "2", "Private Markets", "Sponsor / BD", "17 upcoming"],
  ["Miami / South Florida", "2", "Alternatives", "Private Wealth", "15 upcoming"],
];

const moverTiles = [
  ["Volume", "+18", "tracked events vs prior month"],
  ["Healthcare", "+7", "sector mover"],
  ["Meeting-Driven", "+5 pts", "event-character shift"],
  ["New York Metro", "+6", "metro momentum"],
];

const metroOptions = [
  "New York Metro",
  "Boston / Cambridge",
  "Bay Area",
  "Los Angeles / Orange County",
  "Dallas-Fort Worth",
  "Miami / South Florida",
  "Washington DC Metro",
  "Chicago Metro",
];

const metroSchedules: Record<string, Record<string, string[]>> = {
  "New York Metro": {
    Today: ["Institutional Investor Conference"],
    "This Week": ["Healthcare Investor Forum", "Real Estate Capital Markets Summit"],
    "Next Two Weeks": ["Private Markets Forum"],
  },
  "Boston / Cambridge": {
    Today: ["Healthcare Investor Forum"],
    "This Week": ["Institutional Investor Conference"],
    "Next Two Weeks": ["Energy Transition Capital Summit"],
  },
  "Bay Area": {
    Today: [],
    "This Week": ["Institutional Investor Conference"],
    "Next Two Weeks": ["Healthcare Investor Forum", "Private Markets Forum"],
  },
};

const palette = {
  page: "#020b16",
  rail: "#020b14",
  panel: "linear-gradient(180deg, rgba(5,24,43,0.94), rgba(3,13,25,0.84))",
  panelDeep: "linear-gradient(180deg, rgba(3,13,25,0.98), rgba(2,8,17,0.95))",
  panelElevated: "linear-gradient(180deg, rgba(9,38,66,0.82), rgba(4,18,32,0.68))",
  panelMuted: "linear-gradient(180deg, rgba(7,25,43,0.54), rgba(3,13,25,0.50))",
  border: "1px solid rgba(96,165,250,0.16)",
  strongBorder: "1px solid rgba(96,165,250,0.30)",
  text: "#eef6ff",
  body: "#d8e7f7",
  muted: "#9fb7d2",
  faint: "#6f89aa",
  cyan: "#67e8f9",
  blue: "#60a5fa",
  purple: "#a78bfa",
  amber: "#fbbf24",
  green: "#5eead4",
  warning: "#fb923c",
};

const typeScale = {
  pageTitle: { color: "#f8fbff", fontSize: "36px", lineHeight: 1, fontWeight: 950, letterSpacing: 0 } satisfies CSSProperties,
  pageSubtitle: { color: "#b9cce3", fontSize: "14.5px", lineHeight: 1.42, maxWidth: "760px" } satisfies CSSProperties,
  eyebrow: { color: palette.cyan, fontSize: "10.5px", fontWeight: 950, letterSpacing: "0.19em", textTransform: "uppercase" } satisfies CSSProperties,
  sectionTitle: { margin: 0, color: "#f8fbff", fontSize: "22px", lineHeight: 1.08, fontWeight: 950, letterSpacing: 0 } satisfies CSSProperties,
  supportTitle: { margin: 0, color: "#f8fbff", fontSize: "20px", lineHeight: 1.1, fontWeight: 920, letterSpacing: 0 } satisfies CSSProperties,
  moduleTitle: { color: "#f8fbff", fontSize: "15px", lineHeight: 1.18, fontWeight: 950 } satisfies CSSProperties,
  metricValue: { color: "#f8fbff", fontSize: "26px", lineHeight: 1, fontWeight: 950 } satisfies CSSProperties,
  metricLabel: { color: palette.faint, fontSize: "10px", fontWeight: 950, letterSpacing: "0.12em", textTransform: "uppercase" } satisfies CSSProperties,
  body: { color: palette.body, fontSize: "13px", lineHeight: 1.46 } satisfies CSSProperties,
  subtext: { color: palette.muted, fontSize: "12px", lineHeight: 1.35 } satisfies CSSProperties,
  tableHeader: { color: "#8fbfff", fontSize: "10px", fontWeight: 950, letterSpacing: "0.11em", textTransform: "uppercase" } satisfies CSSProperties,
  action: { color: "#7dd3fc", fontSize: "12px", fontWeight: 950, textDecoration: "none" } satisfies CSSProperties,
};

const pageStyle: CSSProperties = {
  height: "100%",
  background: "radial-gradient(circle at 22% 0%, rgba(34,211,238,0.13), transparent 30%), radial-gradient(circle at 78% 12%, rgba(79,70,229,0.16), transparent 28%), #031425",
};

const shellStyle: CSSProperties = {
  height: "100%",
  display: "grid",
  gap: "16px",
  padding: "14px",
  minWidth: 0,
};

const railStyle: CSSProperties = {
  borderRadius: "12px",
  border: "1px solid rgba(96,165,250,0.16)",
  background: "linear-gradient(180deg, rgba(3,18,32,0.98), rgba(2,10,20,0.94))",
  boxShadow: "0 18px 40px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04)",
  padding: "13px",
  display: "grid",
  gap: "12px",
  alignContent: "start",
  minWidth: 0,
  position: "sticky",
  top: 0,
  alignSelf: "start",
  maxHeight: "calc(100vh - 126px)",
  overflow: "hidden",
};

const centerStyle: CSSProperties = {
  minWidth: 0,
  maxWidth: "1180px",
  width: "100%",
  justifySelf: "center",
  overflowY: "auto",
  display: "grid",
  gap: "18px",
  paddingRight: "2px",
};

const sectionStyle: CSSProperties = {
  borderRadius: "13px",
  border: palette.border,
  background: palette.panel,
  boxShadow: "0 18px 42px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)",
  padding: "16px",
  display: "grid",
  gap: "14px",
  minWidth: 0,
};

const subPanelStyle: CSSProperties = {
  borderRadius: "9px",
  border: "1px solid rgba(107,157,210,0.14)",
  background: palette.panelElevated,
  padding: "12px",
  display: "grid",
  gap: "8px",
  minWidth: 0,
};

const cardStyles = {
  feature: {
    borderRadius: "13px",
    border: "1px solid rgba(251,191,36,0.42)",
    background: "radial-gradient(circle at 20% 0%, rgba(251,191,36,0.16), transparent 32%), linear-gradient(180deg, rgba(63,42,12,0.44), rgba(5,24,43,0.84))",
    padding: "16px",
    display: "grid",
    gap: "12px",
    boxShadow: "inset 3px 0 0 rgba(251,191,36,0.65), 0 18px 42px rgba(0,0,0,0.20)",
  } satisfies CSSProperties,
  signal: {
    ...subPanelStyle,
    border: "1px solid rgba(103,232,249,0.18)",
  } satisfies CSSProperties,
  cluster: {
    ...subPanelStyle,
    border: "1px solid rgba(167,139,250,0.30)",
    background: "linear-gradient(180deg, rgba(43,35,88,0.36), rgba(5,24,43,0.78))",
  } satisfies CSSProperties,
  data: {
    ...subPanelStyle,
    background: "linear-gradient(180deg, rgba(7,28,50,0.64), rgba(4,18,32,0.50))",
    padding: "11px",
  } satisfies CSSProperties,
  muted: {
    ...subPanelStyle,
    border: "1px solid rgba(107,157,210,0.10)",
    background: palette.panelMuted,
  } satisfies CSSProperties,
  rail: {
    borderRadius: "10px",
    border: "1px solid rgba(107,157,210,0.12)",
    background: "rgba(8,30,53,0.32)",
    padding: "12px",
  } satisfies CSSProperties,
  table: {
    borderRadius: "8px",
    border: "1px solid rgba(107,157,210,0.18)",
    overflow: "hidden",
    background: "rgba(2,8,17,0.40)",
  } satisfies CSSProperties,
};

function SectionHeader({ eyebrow, title, children, variant = "primary", info }: { eyebrow: string; title: string; children: ReactNode; variant?: "primary" | "supporting" | "utility"; info?: string }) {
  return (
    <div style={{ display: "grid", gap: "5px", borderLeft: variant === "primary" ? "2px solid rgba(103,232,249,0.55)" : "1px solid rgba(107,157,210,0.22)", paddingLeft: variant === "primary" ? "10px" : "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <div style={{ ...typeScale.eyebrow, color: variant === "supporting" ? "#8fbfff" : palette.cyan }}>{eyebrow}</div>
        {info ? <InfoDot label={info} /> : null}
      </div>
      <h2 style={variant === "supporting" ? typeScale.supportTitle : typeScale.sectionTitle}>{title}</h2>
      <div style={typeScale.subtext}>{children}</div>
    </div>
  );
}

function OpenLink({ children = "Open related events ->" }: { children?: ReactNode }) {
  return <span style={typeScale.action}>{children}</span>;
}

function InfoDot({ label }: { label: string }) {
  return (
    <span className="mv2-info" tabIndex={0} aria-label={label}>
      i
      <span className="mv2-tooltip">{label}</span>
    </span>
  );
}

function BarRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(116px, 0.8fr) minmax(0, 1fr) 38px", gap: "8px", alignItems: "center" }}>
      <span style={{ color: palette.body, fontSize: "12px", fontWeight: 850, overflowWrap: "anywhere" }}>{label}</span>
      <span style={{ height: "8px", borderRadius: "999px", background: "rgba(11,42,70,0.86)", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(107,157,210,0.08)" }}>
        <span style={{ display: "block", width: `${value}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#5eead4,#60a5fa)" }} />
      </span>
      <span style={{ color: "#b8cce4", fontSize: "11px", fontWeight: 850, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function CompactRow({ title, meta, tone = "blue" }: { title: string; meta: string; tone?: "blue" | "amber" | "purple" }) {
  const color = tone === "amber" ? palette.amber : tone === "purple" ? palette.purple : palette.blue;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "10px", paddingBottom: "9px", borderBottom: "1px solid rgba(107,157,210,0.10)" }}>
      <div>
        <div style={{ ...typeScale.moduleTitle, fontSize: "13px" }}>{title}</div>
        <div style={typeScale.subtext}>{meta}</div>
      </div>
      <span style={{ color, fontSize: "11px", fontWeight: 950, letterSpacing: "0.03em" }}>Open</span>
    </div>
  );
}

function LeagueTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={cardStyles.table}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>{headers.map((header) => <th key={header} style={{ ...typeScale.tableHeader, padding: "9px 8px", textAlign: header === "Rank" ? "center" : "left", borderBottom: "1px solid rgba(107,157,210,0.18)", background: "rgba(6,28,51,0.66)" }}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.join("-")} style={{ background: index % 2 ? "rgba(8,30,53,0.18)" : "transparent" }}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} style={{ padding: "8px 7px", color: cellIndex === 1 ? "#f8fbff" : "#c8d8ec", fontSize: "11.5px", fontWeight: cellIndex === 0 || cellIndex === 1 ? 900 : 650, lineHeight: 1.25, borderBottom: "1px solid rgba(107,157,210,0.08)", overflowWrap: "anywhere", textAlign: cellIndex === 0 ? "center" : "left" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RailHeading({ children }: { children: ReactNode }) {
  return <div style={{ ...typeScale.metricLabel, color: "#8fbfff" }}>{children}</div>;
}

export default function MarketViewV2PreviewClient() {
  const [primaryMetro, setPrimaryMetro] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(metroStorageKey);
      if (saved) setPrimaryMetro(saved);
    } catch {
      // Ignore storage limitations in preview contexts.
    }
  }, []);

  const metroSchedule = useMemo(() => metroSchedules[primaryMetro] || {
    Today: [],
    "This Week": primaryMetro ? ["Healthcare Investor Forum"] : [],
    "Next Two Weeks": primaryMetro ? ["Private Markets Forum"] : [],
  }, [primaryMetro]);

  const updateMetro = (value: string) => {
    setPrimaryMetro(value);
    try {
      if (value) localStorage.setItem(metroStorageKey, value);
      else localStorage.removeItem(metroStorageKey);
    } catch {
      // Ignore storage limitations in preview contexts.
    }
  };

  return (
    <div className="mv2-page" style={pageStyle}>
      <style jsx>{`
        .mv2-page {
          overflow: hidden;
        }

        .mv2-shell {
          grid-template-columns: 220px minmax(0, 1fr) 260px;
        }

        .mv2-readout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(250px, 0.7fr);
          gap: 14px;
          align-items: stretch;
        }

        .mv2-watch-board {
          display: grid;
          grid-template-columns: minmax(280px, 0.4fr) minmax(0, 0.6fr);
          gap: 9px;
        }

        .mv2-signal-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .mv2-planning-board {
          display: grid;
          grid-template-columns: minmax(300px, 1.45fr) minmax(240px, 0.85fr) minmax(220px, 0.62fr);
          gap: 9px;
        }

        .mv2-cluster-board {
          display: grid;
          grid-template-columns: minmax(340px, 1.2fr) minmax(230px, 0.62fr);
          gap: 9px;
        }

        .mv2-analytics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        @media (max-width: 1180px) {
          .mv2-page {
            overflow: auto;
          }

          .mv2-shell {
            height: auto !important;
            grid-template-columns: 1fr;
          }

          .mv2-rail {
            position: static !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .mv2-center {
            overflow: visible !important;
            max-width: 100% !important;
          }

          .mv2-readout-grid,
          .mv2-watch-board,
          .mv2-planning-board,
          .mv2-cluster-board {
            grid-template-columns: 1fr;
          }

          .mv2-signal-grid,
          .mv2-analytics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .mv2-signal-grid,
          .mv2-analytics-grid {
            grid-template-columns: 1fr;
          }
        }

        .mv2-info {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 1px solid rgba(103, 232, 249, 0.28);
          background: rgba(8, 30, 53, 0.78);
          color: #9bdcff;
          font-size: 10px;
          font-weight: 950;
          line-height: 1;
          cursor: help;
          outline: none;
        }

        .mv2-tooltip {
          position: absolute;
          z-index: 10;
          left: 50%;
          bottom: calc(100% + 8px);
          width: max-content;
          max-width: 280px;
          transform: translateX(-50%);
          border: 1px solid rgba(103, 232, 249, 0.22);
          border-radius: 8px;
          background: linear-gradient(180deg, rgba(3, 13, 25, 0.98), rgba(2, 8, 17, 0.98));
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.34);
          color: #e6f3ff;
          padding: 8px 9px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: 0;
          text-transform: none;
          opacity: 0;
          pointer-events: none;
          transition: opacity 120ms ease;
        }

        .mv2-info:hover .mv2-tooltip,
        .mv2-info:focus .mv2-tooltip {
          opacity: 1;
        }
      `}</style>
      <div className="mv2-shell" style={shellStyle}>
        <aside className="mv2-rail" style={railStyle}>
          <div style={cardStyles.rail}>
            <RailHeading>Market View V2</RailHeading>
            <div style={{ ...typeScale.moduleTitle, fontSize: "17px" }}>Intelligence Console</div>
            <div style={typeScale.subtext}>Static framework for conference-market structure and product flow.</div>
          </div>
          <nav style={{ display: "grid", gap: "5px" }}>
            {navItems.map((item, index) => (
              <div key={item} style={{ borderRadius: "8px", border: index === 0 ? "1px solid rgba(96,165,250,0.28)" : "1px solid rgba(107,157,210,0.10)", background: index === 0 ? "rgba(47,111,243,0.36)" : "rgba(8,30,53,0.30)", color: index === 0 ? "#f8fbff" : "#a8bdd8", padding: "8px 9px", fontSize: "11.5px", fontWeight: 900 }}>{item}</div>
            ))}
          </nav>
          <div style={cardStyles.rail}>
            <RailHeading>Quick Feeds</RailHeading>
            {quickFeeds.map(([label, count]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "8px", borderBottom: "1px solid rgba(107,157,210,0.08)", paddingBottom: "6px" }}>
                <span style={{ color: "#c8d8ec", fontSize: "11.5px", fontWeight: 800 }}>{label}</span>
                <span style={{ color: label === "Hot Weeks" ? palette.amber : palette.cyan, fontSize: "11.5px", fontWeight: 950 }}>{count}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="mv2-center" style={centerStyle}>
          <section style={{ ...sectionStyle, padding: "18px", background: "radial-gradient(circle at 14% 0%, rgba(34,211,238,0.18), transparent 31%), radial-gradient(circle at 88% 12%, rgba(167,139,250,0.14), transparent 25%), linear-gradient(135deg, rgba(3,12,24,0.98), rgba(6,28,51,0.96))", border: palette.strongBorder }}>
            <div className="mv2-readout-grid">
              <div style={{ display: "grid", gap: "8px", alignContent: "center" }}>
                <div style={typeScale.eyebrow}>MARKET VIEW</div>
                <h1 style={typeScale.pageTitle}>Capital Markets Conference Intelligence</h1>
                <div style={typeScale.pageSubtitle}>A forward-looking view of conference activity, timing, access signals, organizer supply, and planning windows.</div>
                <p style={{ ...typeScale.body, margin: 0, maxWidth: "860px", borderLeft: "2px solid rgba(94,234,212,0.62)", paddingLeft: "12px" }}>
                  Tracked forward conference activity is building into the fall calendar, with the strongest concentration in issuer-access, institutional-investor, and healthcare-related events. New York Metro remains the most active planning market, while several sector-specific clusters are forming across major capital markets hubs.
                </p>
              </div>
              <div style={{ display: "grid", gap: "6px", alignContent: "start" }}>
                {readoutStats.map((item) => (
                  <div key={item.label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "8px", alignItems: "baseline", borderBottom: "1px solid rgba(107,157,210,0.10)", paddingBottom: "6px" }}>
                    <div>
                      <div style={typeScale.metricLabel}>{item.label}</div>
                      <div style={{ color: palette.muted, fontSize: "11px" }}>{item.note}</div>
                    </div>
                    <div style={{ color: "#f8fbff", fontSize: "14px", fontWeight: 950, textAlign: "right" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ ...sectionStyle, border: "1px solid rgba(94,234,212,0.24)", background: "linear-gradient(180deg, rgba(5,28,49,0.92), rgba(3,13,25,0.82))" }}>
            <SectionHeader eyebrow="01 / CORE INTELLIGENCE" title="What To Watch" info="Hot Weeks highlight timing intensity in the current forward calendar.">
              A ranked intelligence board, not a stack of equal cards. The hot week is the leading signal; the rest explain where attention should go next.
            </SectionHeader>
            <div className="mv2-watch-board">
              <div style={cardStyles.feature}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                  <div style={{ color: palette.amber, fontSize: "10px", fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" }}>HOT WEEK</div>
                  <div style={{ color: palette.amber, fontSize: "18px", fontWeight: 950 }}>#1</div>
                </div>
                <div style={typeScale.moduleTitle}>Mid-September access concentration</div>
                <div style={{ ...typeScale.metricValue, color: "#fff7db" }}>Sep 14-Sep 20</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
                  <div style={cardStyles.data}><div style={{ ...typeScale.metricValue, color: palette.amber, fontSize: "24px" }}>36</div><div style={typeScale.metricLabel}>events</div></div>
                  <div style={cardStyles.data}><div style={{ ...typeScale.metricValue, color: palette.cyan, fontSize: "24px" }}>18</div><div style={typeScale.metricLabel}>issuer-access signals</div></div>
                </div>
                <div style={typeScale.body}>Top sector: Healthcare<br />Top focus: Institutional Investors</div>
                <div style={typeScale.body}>Issuer-access and institutional-investor events stack into the same planning week, creating a stronger coverage and meeting window.</div>
                <div style={typeScale.subtext}>
                  Events driving signal:
                  <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                    <li>Healthcare Investor Forum</li>
                    <li>Institutional Investor Conference</li>
                    <li>Capital Markets Summit</li>
                  </ul>
                </div>
                <OpenLink />
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                <div className="mv2-signal-grid">
                  {secondarySignals.map((signal, index) => (
                    <div key={signal.type} style={index === 0 ? cardStyles.cluster : cardStyles.signal}>
                      <div style={{ color: index === 0 ? palette.purple : palette.cyan, fontSize: "10px", fontWeight: 950, letterSpacing: "0.12em", textTransform: "uppercase" }}>{signal.type}</div>
                      <div style={typeScale.moduleTitle}>{signal.title}</div>
                      <div style={{ color: palette.blue, fontSize: "11.5px", fontWeight: 900 }}>{signal.window} / {signal.metric}</div>
                      <div style={typeScale.subtext}>{signal.detail}</div>
                      <OpenLink />
                    </div>
                  ))}
                </div>
                <div style={{ ...cardStyles.muted, display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                  <div><div style={{ ...typeScale.moduleTitle, fontSize: "13px" }}>Opportunity Gap / Nov 2-Nov 6</div><div style={typeScale.subtext}>Lower-conflict institutional window after the October activity stack.</div></div>
                  <OpenLink>Open gap events -&gt;</OpenLink>
                </div>
              </div>
            </div>
          </section>

          <section style={{ ...sectionStyle, border: "1px solid rgba(251,191,36,0.24)" }}>
            <SectionHeader eyebrow="02 / TIMING BOARD" title="Planning Windows" info="Hot Week modules use amber only for timing intensity.">
              When is the calendar crowded, and when is there room to act?
            </SectionHeader>
            <div className="mv2-planning-board">
              <div style={cardStyles.feature}>
                <div style={{ color: palette.amber, fontSize: "10px", fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" }}>Featured Hot Week</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "baseline" }}>
                  <div style={{ ...typeScale.metricValue, color: "#fff7db" }}>Sep 14-Sep 20</div>
                  <div style={{ color: palette.amber, fontSize: "13px", fontWeight: 950 }}>36 events</div>
                </div>
                <div style={typeScale.body}>18 issuer-access signals / Healthcare / Institutional Investors</div>
                <div style={typeScale.subtext}>This week matters because the current dataset shows unusually dense conference supply and access signals for its monthly window.</div>
                <OpenLink>Open week events -&gt;</OpenLink>
              </div>
              <div style={cardStyles.signal}>
                <div style={{ ...typeScale.moduleTitle, color: palette.cyan }}>Meeting-Day Opportunities</div>
                {meetingDays.map(([date, metro, meta]) => <CompactRow key={`${date}-${metro}`} title={`${date} / ${metro}`} meta={meta} />)}
              </div>
              <div style={cardStyles.muted}>
                <div style={{ ...typeScale.moduleTitle, color: palette.faint }}>White Space / Lower Conflict</div>
                {whiteSpace.map(([date, signal, meta]) => <CompactRow key={date} title={date} meta={`${signal} / ${meta}`} />)}
              </div>
            </div>
          </section>

          <section style={{ ...sectionStyle, border: "1px solid rgba(167,139,250,0.28)", background: "radial-gradient(circle at 18% 0%, rgba(167,139,250,0.12), transparent 30%), linear-gradient(180deg, rgba(5,24,43,0.92), rgba(3,13,25,0.84))" }}>
            <SectionHeader eyebrow="03 / PROPRIETARY SIGNAL" title="Cluster Intelligence" info="Cluster Alerts require metro, timing, and shared sector/focus/access logic.">
              Clusters combine metro, timing, shared sector/focus, and access signals - not just city volume.
            </SectionHeader>
            <div style={{ ...cardStyles.muted, color: "#c8d8ec", fontSize: "12px", lineHeight: 1.35 }}>
              Clusters combine metro, timing, shared sector/focus, and access signals - not just city volume.
            </div>
            <div className="mv2-cluster-board">
              <div style={{ ...cardStyles.cluster, padding: "16px", gap: "12px", boxShadow: "inset 3px 0 0 rgba(167,139,250,0.62), 0 18px 42px rgba(0,0,0,0.18)" }}>
                <div style={{ color: palette.purple, fontSize: "10px", fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" }}>Featured Cluster</div>
                <div style={{ ...typeScale.metricValue, fontSize: "23px" }}>New York Metro healthcare issuer-access cluster</div>
                <div style={{ color: palette.blue, fontSize: "12px", fontWeight: 950 }}>Sep 14-Sep 20 / 6 aligned events / 4 issuer-access signals</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "7px" }}>
                  <div style={cardStyles.data}><div style={{ ...typeScale.metricLabel, color: palette.cyan }}>Shared Signals</div><div style={typeScale.subtext}>Healthcare / Institutional Investors / Issuer Access</div></div>
                  <div style={cardStyles.data}><div style={{ ...typeScale.metricLabel, color: palette.cyan }}>Cities Included</div><div style={typeScale.subtext}>New York / Jersey City / Stamford</div></div>
                  <div style={cardStyles.data}><div style={{ ...typeScale.metricLabel, color: palette.cyan }}>Reason To Attend</div><div style={typeScale.subtext}>Same-week coverage and meeting density</div></div>
                </div>
                <div style={typeScale.body}>Several healthcare and investor-focused events align in the same metro, creating a practical planning window for meetings, coverage, and sponsor outreach.</div>
                <OpenLink>Open cluster events -&gt;</OpenLink>
              </div>
              <div style={cardStyles.data}>
                <div style={typeScale.moduleTitle}>Cluster Type Breakdown</div>
                {clusterTypes.map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "8px", borderBottom: "1px solid rgba(107,157,210,0.08)", paddingBottom: "6px" }}>
                    <span style={{ color: palette.muted, fontSize: "11.5px", fontWeight: 850 }}>{label}</span>
                    <span style={{ color: palette.purple, fontSize: "12px", fontWeight: 950 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mv2-signal-grid">
              {clusters.slice(1).map((cluster) => <CompactRow key={cluster.title} title={`${cluster.metro} / ${cluster.title}`} meta={`${cluster.window} / ${cluster.count} / ${cluster.signals}`} tone="purple" />)}
            </div>
          </section>

          <section style={sectionStyle}>
            <SectionHeader eyebrow="04 / ANALYST NOTE" title="What changed in the tracked forward calendar?" variant="supporting" info="Month-over-month figures reflect the current dataset, not total market demand.">
              A compact readout of current dataset movement in the forward calendar.
            </SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(260px, 0.9fr)", gap: "9px" }}>
              <div style={cardStyles.data}>
                <div style={typeScale.moduleTitle}>Month-over-Month Readout</div>
                <div style={typeScale.body}>Tracked September activity is higher than August, but the more important shift is the mix: issuer-access, company-presentation, and institutional-investor-focused events represent a larger share of the forward calendar.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
                {moverTiles.map(([label, value, note]) => <div key={label} style={cardStyles.data}><div style={typeScale.metricLabel}>{label}</div><div style={{ ...typeScale.metricValue, fontSize: "18px" }}>{value}</div><div style={typeScale.subtext}>{note}</div></div>)}
              </div>
            </div>
            <div style={{ ...typeScale.subtext, color: palette.faint }}>Month-over-month figures reflect currently tracked Capital Conference Calendar activity, not a complete measure of total market demand.</div>
          </section>

          <section style={sectionStyle}>
            <SectionHeader eyebrow="05 / SUPPORTING ANALYTICS" title="Sector / Market Focus / Event Character Breakdowns" variant="supporting">
              Supplemental breakdowns validate the core intelligence without leading the page.
            </SectionHeader>
            <div className="mv2-analytics-grid">
              <div style={cardStyles.data}><div style={typeScale.moduleTitle}>Top Sectors</div>{topSectors.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
              <div style={cardStyles.data}><div style={typeScale.moduleTitle}>Market Focus Mix</div>{marketFocusMix.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
              <div style={cardStyles.data}><div style={typeScale.moduleTitle}>Event Character Mix</div>{characterMix.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
              <div style={cardStyles.data}><div style={typeScale.moduleTitle}>Access / Audience Signal Mix</div>{audienceMix.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
            </div>
          </section>

          <section style={{ ...sectionStyle, border: "1px solid rgba(96,165,250,0.28)" }}>
            <SectionHeader eyebrow="06 / ORGANIZER SUPPLY" title="Organizer League Tables" variant="supporting">
              A premium supporting table for organizer supply, access relevance, and sector specialization.
            </SectionHeader>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {["Overall Supply", "Issuer Access", "Investor Relevant", "Structured Access", "Deal / BD", "Sector Specialists"].map((tab, index) => <span key={tab} style={{ borderRadius: "7px", padding: "6px 9px", border: "1px solid rgba(107,157,210,0.16)", background: index === 0 ? "rgba(47,111,243,0.76)" : "rgba(9,36,61,0.52)", color: index === 0 ? "#fff" : "#a8bdd8", fontSize: "11px", fontWeight: 850 }}>{tab}</span>)}
            </div>
            <LeagueTable headers={["Rank", "Organizer", "Events", "Access Signal", "Top Sector", "Top Metro", "Next Event", "Open"]} rows={organizers.map((row) => [...row, "Open ->"])} />
          </section>

          <section style={sectionStyle}>
            <SectionHeader eyebrow="07 / GEOGRAPHY" title="Geography / Metro Analytics" variant="supporting">
              Supporting metro concentration view by cluster count, dominant sector, market focus, and upcoming activity.
            </SectionHeader>
            <LeagueTable headers={["Top Metro", "Cluster Count", "Dominant Sector", "Dominant Market Focus", "Upcoming Activity"]} rows={metros} />
          </section>

          <section style={sectionStyle}>
            <SectionHeader eyebrow="08 / PERSONALIZED" title="Metro Watch" variant="utility" info="Metro Watch uses a local preview preference and only shows near-term groups.">
              Small near-term activity module around the user&apos;s primary work city.
            </SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 0.36fr) minmax(0, 1fr)", gap: "8px" }}>
              <div style={cardStyles.muted}>
                <label style={{ color: "#8fbfff", fontSize: "10px", fontWeight: 950, letterSpacing: "0.12em", textTransform: "uppercase" }}>What city do you primarily work in?</label>
                <select value={primaryMetro} onChange={(event) => updateMetro(event.target.value)} style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(107,157,210,0.22)", background: "rgba(3,13,25,0.84)", color: "#dbeafe", padding: "0 9px", fontSize: "12px", fontWeight: 800 }}>
                  <option value="">Choose a metro</option>
                  {metroOptions.map((metro) => <option key={metro} value={metro}>{metro}</option>)}
                </select>
                {primaryMetro ? <button type="button" onClick={() => updateMetro("")} style={{ border: "none", background: "transparent", color: "#93c5fd", fontSize: "11px", fontWeight: 900, textAlign: "left", padding: 0, cursor: "pointer" }}>Clear saved city</button> : null}
                <div style={{ ...typeScale.subtext, color: palette.faint }}>Preview-only browser preference for this static near-term module.</div>
              </div>
              <div style={{ ...cardStyles.data, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                {primaryMetro ? Object.entries(metroSchedule).map(([group, items]) => (
                  <div key={group} style={{ display: "grid", gap: "5px" }}>
                    <div style={{ ...typeScale.metricLabel, color: palette.cyan }}>{group}</div>
                    {items.length ? items.map((item) => <div key={item} style={{ ...typeScale.subtext, color: palette.text }}>{item}</div>) : <div style={typeScale.subtext}>No near-term placeholder activity.</div>}
                  </div>
                )) : <div style={{ ...typeScale.subtext, gridColumn: "1 / -1" }}>Choose a city to view Today, This Week, and Next Two Weeks groups.</div>}
              </div>
            </div>
          </section>
        </main>

        <aside className="mv2-rail" style={railStyle}>
          <div style={cardStyles.rail}>
            <RailHeading>Current View Summary</RailHeading>
            {[
              ["Dataset", "Static V2 preview"],
              ["Core signals", "6"],
              ["Featured week", "Sep 14-Sep 20"],
              ["Featured metro", "New York Metro"],
              ["Organizer rows", "5"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "8px", borderBottom: "1px solid rgba(107,157,210,0.08)", paddingBottom: "6px" }}>
                <span style={{ color: palette.faint, fontSize: "11px", fontWeight: 850 }}>{label}</span>
                <span style={{ color: palette.text, fontSize: "11px", fontWeight: 950, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={cardStyles.rail}>
            <RailHeading>Market View Controls</RailHeading>
            {["Save View", "Export", "Calendar Sync"].map((item) => (
              <div key={item} style={{ borderRadius: "8px", border: "1px solid rgba(107,157,210,0.14)", background: "rgba(3,13,25,0.50)", padding: "10px" }}>
                <div style={{ ...typeScale.moduleTitle, fontSize: "12.5px" }}>{item}</div>
                <div style={{ ...typeScale.subtext, marginTop: "3px" }}>Preview placeholder</div>
              </div>
            ))}
          </div>
          <div style={cardStyles.rail}>
            <RailHeading>Saved Views</RailHeading>
            {["Issuer-access weeks", "Healthcare clusters", "Metro watch"].map((item) => (
              <div key={item} style={{ borderBottom: "1px solid rgba(107,157,210,0.08)", color: "#c8d8ec", fontSize: "11.5px", fontWeight: 850, paddingBottom: "6px" }}>{item}</div>
            ))}
          </div>
          <div style={{ marginTop: "auto", display: "flex", gap: "12px", justifyContent: "center", color: "#c8d8ec", fontSize: "12px" }}>
            <span>Subscribe</span>
            <span>Legal</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
