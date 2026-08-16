"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const metroStorageKey = "marketViewV2.primaryMetro";

const readoutStats = [
  { label: "Conference Universe", value: "860", note: "tracked forward events" },
  { label: "Current Period", value: "Late Summer 2026", note: "planning period" },
  { label: "Peak Week", value: "Sep 14-Sep 20", note: "highest visible density" },
  { label: "Top Sector", value: "Healthcare", note: "issuer-access weighted" },
  { label: "Top Market Focus", value: "Institutional Investors", note: "largest classified share" },
  { label: "Top Metro", value: "New York Metro", note: "most active planning market" },
];

const watchSignals = [
  {
    type: "Hot Week",
    title: "Mid-September access concentration",
    window: "Sep 14-Sep 20",
    why: "Issuer-access and institutional-investor events stack into the same planning week, creating a stronger coverage and meeting window.",
    metrics: "36 events · 18 issuer-access signals",
  },
  {
    type: "Cluster Alert",
    title: "New York Metro healthcare issuer-access cluster",
    window: "Sep 14-Sep 20",
    why: "Several healthcare and investor-focused events align in the same metro, creating a practical planning window for meetings, coverage, and sponsor outreach.",
    metrics: "6 aligned events · 4 issuer-access signals",
  },
  {
    type: "Meeting-Day Opportunity",
    title: "Boston / Cambridge sector meeting window",
    window: "Sep 22",
    why: "Two related sector events leave a business-day gap that could support private meetings with overlapping audience and coverage themes.",
    metrics: "2 adjacent events · 1 open day",
  },
  {
    type: "Destination Event",
    title: "Energy transition destination candidate",
    window: "Oct 7-Oct 9",
    why: "A single multi-day event outside regular hub activity shows enough sector and sponsor relevance to merit destination-level review.",
    metrics: "3-day program · sector-specific audience",
  },
  {
    type: "Conflict Alert",
    title: "Real estate capital markets overlap",
    window: "Oct 14-Oct 16",
    why: "Comparable audience and market-focus signals overlap across two metros, raising attention-fragmentation risk for sponsors and issuers.",
    metrics: "4 similar events · 2 metros",
  },
  {
    type: "Opportunity Gap",
    title: "Lower-conflict institutional window",
    window: "Nov 2-Nov 6",
    why: "Tracked forward activity thins after the October cluster, leaving a cleaner window for outreach, hosted meetings, or organizer positioning.",
    metrics: "low overlap · no major cluster",
  },
];

const hotWeeks = [
  ["Sep 14-Sep 20", "36 events", "Healthcare + institutional access"],
  ["Sep 28-Oct 4", "31 events", "Financial services + private markets"],
  ["Oct 12-Oct 18", "28 events", "Real estate + energy transition"],
];

const whiteSpace = [
  ["Nov 2-Nov 6", "Lower conflict", "Institutional outreach window"],
  ["Dec 7-Dec 11", "Moderate activity", "Sponsor visibility window"],
  ["Jan 12-Jan 16", "Early-year reset", "Organizer positioning window"],
];

const meetingDays = [
  ["Sep 22", "Boston / Cambridge", "Healthcare Investor Forum to Institutional Investor Conference"],
  ["Oct 8", "Bay Area", "Technology leadership and private markets adjacency"],
  ["Oct 15", "Chicago Metro", "Real estate and credit-market overlap"],
];

const clusters = [
  {
    type: "Sector Cluster",
    metro: "New York Metro",
    window: "Sep 14-Sep 20",
    signals: "Healthcare · issuer access · institutional investors",
    count: "6 events",
    reason: "Shared sector coverage and access signals suggest a concentrated week for company meetings, investor coverage, and sponsor outreach.",
  },
  {
    type: "Access Cluster",
    metro: "Boston / Cambridge",
    window: "Sep 21-Sep 24",
    signals: "Company presentations · 1x1 meetings · public-company coverage",
    count: "4 events",
    reason: "Multiple access-oriented programs appear close enough in timing and geography to support same-trip relationship planning.",
  },
  {
    type: "Investor Cluster",
    metro: "Bay Area",
    window: "Oct 6-Oct 10",
    signals: "Institutional investors · technology · growth sectors",
    count: "5 events",
    reason: "Investor-relevant programming is concentrated around related technology and growth-company themes.",
  },
  {
    type: "Deal / BD Cluster",
    metro: "Dallas-Fort Worth",
    window: "Oct 20-Oct 23",
    signals: "Private markets · sponsor visibility · networking",
    count: "3 events",
    reason: "The mix leans toward business-development and relationship coverage rather than pure issuer access.",
  },
  {
    type: "Market Focus Cluster",
    metro: "Miami / South Florida",
    window: "Nov 9-Nov 12",
    signals: "Private wealth · alternatives · manager selection",
    count: "4 events",
    reason: "A focused audience and adjacent market themes make the metro useful for targeted coverage review.",
  },
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
  ["1", "Organizer Alpha", "18", "Healthcare", "New York Metro", "12", "Healthcare Investor Forum"],
  ["2", "Organizer Beta", "14", "Financial Services", "Boston / Cambridge", "9", "Institutional Investor Conference"],
  ["3", "Organizer Gamma", "12", "Real Estate", "Dallas-Fort Worth", "7", "Real Estate Capital Markets Summit"],
  ["4", "Organizer Delta", "9", "Private Markets", "Miami / South Florida", "6", "Private Markets Forum"],
];

const metros = [
  ["New York Metro", "5", "Healthcare", "Institutional Investors", "36 upcoming"],
  ["Boston / Cambridge", "3", "Healthcare", "Company Presentations", "22 upcoming"],
  ["Bay Area", "3", "Technology", "Growth Investors", "21 upcoming"],
  ["Dallas-Fort Worth", "2", "Private Markets", "Sponsor / BD", "17 upcoming"],
  ["Miami / South Florida", "2", "Alternatives", "Private Wealth", "15 upcoming"],
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
  panel: "linear-gradient(180deg, rgba(5,24,43,0.88), rgba(3,13,25,0.78))",
  panelSoft: "linear-gradient(180deg, rgba(8,34,58,0.72), rgba(4,18,32,0.58))",
  border: "1px solid rgba(96,165,250,0.18)",
  text: "#dbeafe",
  muted: "#9fb7d2",
  faint: "#7f99b8",
  cyan: "#67e8f9",
  blue: "#60a5fa",
  amber: "#fbbf24",
};

const pageStyle: CSSProperties = {
  height: "100%",
  overflowY: "auto",
  padding: "10px",
  background: "radial-gradient(circle at 20% 0%, rgba(34,211,238,0.12), transparent 30%), radial-gradient(circle at 82% 8%, rgba(37,99,235,0.14), transparent 26%), #031425",
};

const contentStyle: CSSProperties = {
  maxWidth: "1480px",
  margin: "0 auto",
  display: "grid",
  gap: "10px",
};

const sectionStyle: CSSProperties = {
  borderRadius: "12px",
  border: palette.border,
  background: palette.panel,
  boxShadow: "0 18px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)",
  padding: "12px",
  display: "grid",
  gap: "10px",
};

const subPanelStyle: CSSProperties = {
  borderRadius: "9px",
  border: "1px solid rgba(107,157,210,0.14)",
  background: palette.panelSoft,
  padding: "9px",
  display: "grid",
  gap: "6px",
  minWidth: 0,
};

const eyebrowStyle: CSSProperties = {
  color: palette.cyan,
  fontSize: "10px",
  fontWeight: 950,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
};

const actionStyle: CSSProperties = {
  color: "#7dd3fc",
  fontSize: "11px",
  fontWeight: 900,
  textDecoration: "none",
};

function SectionHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "3px" }}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <h2 style={{ margin: 0, color: "#f8fbff", fontSize: "18px", lineHeight: 1.1 }}>{title}</h2>
      <div style={{ color: palette.muted, fontSize: "12px", lineHeight: 1.35 }}>{children}</div>
    </div>
  );
}

function OpenLink({ children = "Open related events ->" }: { children?: ReactNode }) {
  return <span style={actionStyle}>{children}</span>;
}

function BarRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 0.75fr) minmax(0, 1fr) 38px", gap: "7px", alignItems: "center" }}>
      <span style={{ color: palette.text, fontSize: "11.5px", fontWeight: 850, overflowWrap: "anywhere" }}>{label}</span>
      <span style={{ height: "7px", borderRadius: "999px", background: "rgba(11,42,70,0.82)", overflow: "hidden" }}>
        <span style={{ display: "block", width: `${value}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#5eead4,#60a5fa)" }} />
      </span>
      <span style={{ color: "#b8cce4", fontSize: "11px", fontWeight: 850, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function RankedRow({ title, meta, tone = "blue" }: { title: string; meta: string; tone?: "blue" | "amber" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "8px", paddingBottom: "6px", borderBottom: "1px solid rgba(107,157,210,0.08)" }}>
      <div>
        <div style={{ color: palette.text, fontSize: "12px", fontWeight: 900 }}>{title}</div>
        <div style={{ color: palette.muted, fontSize: "11px", lineHeight: 1.3 }}>{meta}</div>
      </div>
      <span style={{ color: tone === "amber" ? palette.amber : palette.blue, fontSize: "11px", fontWeight: 950 }}>Ranked</span>
    </div>
  );
}

function MiniTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "hidden", borderRadius: "8px", border: "1px solid rgba(107,157,210,0.12)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>{headers.map((header) => <th key={header} style={{ padding: "8px 7px", color: "#8fbfff", fontSize: "9.5px", textAlign: "left", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: "1px solid rgba(107,157,210,0.12)" }}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => <td key={cell} style={{ padding: "7px", color: "#c8d8ec", fontSize: "11.5px", lineHeight: 1.28, borderBottom: "1px solid rgba(107,157,210,0.08)", overflowWrap: "anywhere" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
    <div style={pageStyle}>
      <div style={contentStyle}>
        <section style={{ ...sectionStyle, padding: "14px", background: "radial-gradient(circle at 18% 0%, rgba(34,211,238,0.18), transparent 31%), linear-gradient(135deg, rgba(3,12,24,0.98), rgba(6,28,51,0.96))" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "12px", alignItems: "end" }}>
            <div style={{ display: "grid", gap: "7px" }}>
              <div style={eyebrowStyle}>MARKET VIEW</div>
              <h1 style={{ margin: 0, color: "#f8fbff", fontSize: "34px", lineHeight: 1, letterSpacing: 0 }}>Capital Markets Conference Intelligence</h1>
              <div style={{ color: "#b9cce3", fontSize: "13px", lineHeight: 1.35 }}>A forward-looking view of conference activity, timing, access signals, organizer supply, and planning windows.</div>
              <p style={{ margin: 0, color: "#d9e8fb", fontSize: "12.5px", lineHeight: 1.45, maxWidth: "850px", borderLeft: "2px solid rgba(94,234,212,0.58)", paddingLeft: "10px" }}>
                Tracked forward conference activity is building into the fall calendar, with the strongest concentration in issuer-access, institutional-investor, and healthcare-related events. New York Metro remains the most active planning market, while several sector-specific clusters are forming across major capital markets hubs.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "7px" }}>
              {readoutStats.map((item) => (
                <div key={item.label} style={{ ...subPanelStyle, padding: "8px" }}>
                  <div style={{ color: palette.faint, fontSize: "9.5px", fontWeight: 950, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.label}</div>
                  <div style={{ color: "#f8fbff", fontSize: "14px", fontWeight: 950 }}>{item.value}</div>
                  <div style={{ color: palette.muted, fontSize: "10.5px" }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...sectionStyle, border: "1px solid rgba(94,234,212,0.20)" }}>
          <SectionHeader eyebrow="01 / CORE INTELLIGENCE" title="What To Watch">
            Ranked signals from the forward conference calendar. Each signal points to a practical reason to inspect the underlying event records.
          </SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "8px" }}>
            {watchSignals.map((signal, index) => (
              <div key={signal.title} style={{ ...subPanelStyle, border: index === 0 ? "1px solid rgba(251,191,36,0.34)" : subPanelStyle.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <div style={{ color: index === 0 ? palette.amber : palette.cyan, fontSize: "10px", fontWeight: 950, letterSpacing: "0.12em", textTransform: "uppercase" }}>{signal.type}</div>
                  <div style={{ color: palette.faint, fontSize: "10px", fontWeight: 900 }}>#{index + 1}</div>
                </div>
                <div style={{ color: "#f8fbff", fontSize: "13px", fontWeight: 950, lineHeight: 1.2 }}>{signal.title}</div>
                <div style={{ color: palette.blue, fontSize: "11.5px", fontWeight: 900 }}>{signal.window}</div>
                <div style={{ color: palette.muted, fontSize: "11.5px", lineHeight: 1.35 }}>{signal.why}</div>
                <div style={{ color: "#c8d8ec", fontSize: "11px", fontWeight: 850 }}>{signal.metrics}</div>
                <OpenLink />
              </div>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeader eyebrow="02 / TIMING INTELLIGENCE" title="Planning Windows">
            Timing readout for crowded weeks, lower-conflict windows, meeting-day opportunities, and sparse timing notes.
          </SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px" }}>
            <div style={subPanelStyle}><div style={{ color: palette.amber, fontSize: "12px", fontWeight: 950 }}>Hot Weeks</div>{hotWeeks.map(([title, count, meta]) => <RankedRow key={title} title={title} meta={`${count} · ${meta}`} tone="amber" />)}</div>
            <div style={subPanelStyle}><div style={{ color: palette.cyan, fontSize: "12px", fontWeight: 950 }}>White Space / Lower Conflict</div>{whiteSpace.map(([title, count, meta]) => <RankedRow key={title} title={title} meta={`${count} · ${meta}`} />)}</div>
            <div style={subPanelStyle}><div style={{ color: palette.cyan, fontSize: "12px", fontWeight: 950 }}>Meeting-Day Opportunities</div>{meetingDays.map(([date, metro, meta]) => <RankedRow key={`${date}-${metro}`} title={`${date} · ${metro}`} meta={meta} />)}<div style={{ color: palette.faint, fontSize: "11px", lineHeight: 1.35 }}>Timing notes appear only when the timing materially changes interpretation.</div></div>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeader eyebrow="03 / CLUSTER INTELLIGENCE" title="Cluster Intelligence">
            Cluster means metro plus timing plus shared sector, focus, access signal, and a shared reason to attend.
          </SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "8px" }}>
            {clusters.map((cluster) => (
              <div key={`${cluster.type}-${cluster.metro}`} style={subPanelStyle}>
                <div style={{ color: palette.cyan, fontSize: "10px", fontWeight: 950, letterSpacing: "0.12em", textTransform: "uppercase" }}>{cluster.type}</div>
                <div style={{ color: "#f8fbff", fontSize: "13px", fontWeight: 950 }}>{cluster.metro}</div>
                <div style={{ color: palette.blue, fontSize: "11.5px", fontWeight: 900 }}>{cluster.window} · {cluster.count}</div>
                <div style={{ color: "#c8d8ec", fontSize: "11.5px" }}>{cluster.signals}</div>
                <div style={{ color: palette.muted, fontSize: "11.5px", lineHeight: 1.35 }}>{cluster.reason}</div>
                <OpenLink>Open cluster events -&gt;</OpenLink>
              </div>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeader eyebrow="04 / MOMENTUM" title="What changed in the tracked forward calendar?">
            Tracked September activity is higher than August, but the more important shift is the mix: issuer-access, company-presentation, and institutional-investor-focused events represent a larger share of the forward calendar.
          </SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "8px" }}>
            <div style={subPanelStyle}>
              <div style={{ color: "#f8fbff", fontSize: "13px", fontWeight: 950 }}>Month-over-Month Analyst Note</div>
              <div style={{ color: palette.muted, fontSize: "12px", lineHeight: 1.4 }}>Volume is up from the prior month, with stronger issuer-access and company-presentation representation. Sector movement is concentrated in healthcare, financial services, and real estate, while organizer supply remains concentrated among a small number of repeat operators.</div>
              <div style={{ color: palette.faint, fontSize: "11px", lineHeight: 1.35 }}>Month-over-month figures reflect currently tracked Capital Conference Calendar activity, not a complete measure of total market demand.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "7px" }}>
              {["Volume +18", "Healthcare +7", "Meeting-Driven +5 pts", "New York Metro +6"].map((item) => <div key={item} style={subPanelStyle}><div style={{ color: palette.text, fontSize: "13px", fontWeight: 950 }}>{item}</div><div style={{ color: palette.muted, fontSize: "11px" }}>tracked activity change</div></div>)}
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeader eyebrow="05 / SUPPORTING ANALYTICS" title="Sector / Market Focus / Event Character Breakdowns">
            Compact breakdowns that validate the core intelligence signals without turning the page into a chart stack.
          </SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "8px" }}>
            <div style={subPanelStyle}><div style={{ color: palette.text, fontSize: "12px", fontWeight: 950 }}>Top Sectors</div>{topSectors.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
            <div style={subPanelStyle}><div style={{ color: palette.text, fontSize: "12px", fontWeight: 950 }}>Market Focus Mix</div>{marketFocusMix.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
            <div style={subPanelStyle}><div style={{ color: palette.text, fontSize: "12px", fontWeight: 950 }}>Event Character Mix</div>{characterMix.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
            <div style={subPanelStyle}><div style={{ color: palette.text, fontSize: "12px", fontWeight: 950 }}>Access / Audience Signal Mix</div>{audienceMix.map(([label, value]) => <BarRow key={label} label={String(label)} value={Number(value)} />)}</div>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeader eyebrow="06 / ORGANIZER SUPPLY" title="Organizer League Tables">
            Organizer supply, access relevance, and sector specialization remain a major supporting analytics module.
          </SectionHeader>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {["Overall Supply", "Issuer Access", "Investor Relevant", "Structured Access", "Deal / BD", "Sector Specialists"].map((tab, index) => <span key={tab} style={{ borderRadius: "7px", padding: "6px 9px", border: "1px solid rgba(107,157,210,0.16)", background: index === 0 ? "rgba(47,111,243,0.76)" : "rgba(9,36,61,0.52)", color: index === 0 ? "#fff" : "#a8bdd8", fontSize: "11px", fontWeight: 850 }}>{tab}</span>)}
          </div>
          <MiniTable headers={["Rank", "Organizer", "Events", "Top Sector", "Top Metro", "Access Signals", "Next Event", "Open"]} rows={organizers.map((row) => [...row, "Open ->"])} />
        </section>

        <section style={sectionStyle}>
          <SectionHeader eyebrow="07 / GEOGRAPHY" title="Geography / Metro Analytics">
            Where activity is concentrated by metro, cluster count, dominant sector, market focus, and upcoming activity.
          </SectionHeader>
          <MiniTable headers={["Top Metro", "Cluster Count", "Dominant Sector", "Dominant Market Focus", "Upcoming Activity"]} rows={metros} />
        </section>

        <section style={sectionStyle}>
          <SectionHeader eyebrow="08 / PERSONALIZED" title="Metro Watch">
            Choose your primary work city to surface nearby conference activity happening soon.
          </SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "8px" }}>
            <div style={subPanelStyle}>
              <label style={{ color: "#8fbfff", fontSize: "10px", fontWeight: 950, letterSpacing: "0.12em", textTransform: "uppercase" }}>What city do you primarily work in?</label>
              <select value={primaryMetro} onChange={(event) => updateMetro(event.target.value)} style={{ height: "34px", borderRadius: "8px", border: "1px solid rgba(107,157,210,0.22)", background: "rgba(3,13,25,0.84)", color: "#dbeafe", padding: "0 9px", fontSize: "12px", fontWeight: 800 }}>
                <option value="">Choose a metro</option>
                {metroOptions.map((metro) => <option key={metro} value={metro}>{metro}</option>)}
              </select>
              {primaryMetro ? <button type="button" onClick={() => updateMetro("")} style={{ border: "none", background: "transparent", color: "#93c5fd", fontSize: "11px", fontWeight: 900, textAlign: "left", padding: 0, cursor: "pointer" }}>Clear saved city</button> : null}
              <div style={{ color: palette.faint, fontSize: "11px", lineHeight: 1.35 }}>Preview-only browser preference. No alerts, notifications, emails, booking, or account storage.</div>
            </div>
            <div style={{ ...subPanelStyle, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
              {primaryMetro ? Object.entries(metroSchedule).map(([group, items]) => (
                <div key={group} style={{ display: "grid", gap: "5px" }}>
                  <div style={{ color: palette.cyan, fontSize: "10px", fontWeight: 950, letterSpacing: "0.12em", textTransform: "uppercase" }}>{group}</div>
                  {items.length ? items.map((item) => <div key={item} style={{ color: palette.text, fontSize: "11.5px", lineHeight: 1.3 }}>{item}</div>) : <div style={{ color: palette.muted, fontSize: "11.5px" }}>No near-term placeholder activity.</div>}
                </div>
              )) : <div style={{ color: palette.muted, fontSize: "12px", lineHeight: 1.35, gridColumn: "1 / -1" }}>Choose a city to view Today, This Week, and Next Two Weeks groups.</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
