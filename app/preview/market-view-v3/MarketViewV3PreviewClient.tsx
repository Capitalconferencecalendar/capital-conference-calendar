"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const metroStorageKey = "marketViewV3.primaryMetro";

const navItems = ["Overview", "Hot Weeks", "Cluster Alerts", "Planning Windows", "Momentum", "Organizer Tables", "Metro Watch"];
const quickFeeds = [["Issuer Access", "475"], ["Healthcare", "138"], ["Private Markets", "154"], ["New York Metro", "170"]];

const hotWeeks = [
  {
    week: "Sep 14-Sep 20",
    events: "36 events",
    theme: "Healthcare · Institutional Investors",
    signal: "18 issuer-access signals",
    detail: "Multiple investor-focused and issuer-access events fall in the same week, with healthcare and institutional investor signals appearing across several records.",
  },
  { week: "Sep 28-Oct 4", events: "31 events", theme: "Financial Services · Private Markets", signal: "12 investor-relevant signals" },
  { week: "Oct 12-Oct 18", events: "24 events", theme: "Real Estate · Sponsor / BD", signal: "9 deal/BD signals" },
];

const clusters = [
  {
    metro: "New York Metro",
    events: "6 events",
    type: "Healthcare issuer-access cluster",
    window: "Sep 14-Sep 20",
    detail: "New York Metro is flagged because multiple events occur in the same metro during the same planning week and share Healthcare, Institutional Investor, and Issuer Access signals.",
  },
  { metro: "Boston / Cambridge", events: "4 events", type: "Access cluster", window: "Sep 21-Sep 24" },
  { metro: "Bay Area", events: "5 events", type: "Investor cluster", window: "Oct 6-Oct 10" },
  { metro: "Dallas-Fort Worth", events: "3 events", type: "Deal / BD cluster", window: "Oct 20-Oct 23" },
];

const sectors = [["Healthcare", 42], ["Financial Services", 31], ["Technology", 28], ["Real Estate", 23], ["Energy Transition", 18]];
const focusMix = [["Institutional Investors", 40], ["Public Company CEOs", 20], ["Private Equity", 12], ["Credit / Fixed Income", 8]];
const characterMix = [["Meeting-Driven", 42], ["Presentation-Heavy", 24], ["Deal / Partnering", 15], ["Networking", 11]];
const accessMix = [["Issuer Access", 55], ["Investor Relevance", 48], ["Structured Access", 22], ["Sponsor / BD", 18]];

const organizers = [
  ["1", "Organizer Alpha", "18", "12", "Healthcare", "New York Metro", "Healthcare Investor Forum"],
  ["2", "Organizer Beta", "14", "9", "Financial Services", "Boston / Cambridge", "Institutional Investor Conference"],
  ["3", "Organizer Gamma", "12", "7", "Real Estate", "Dallas-Fort Worth", "Capital Markets Summit"],
  ["4", "Organizer Delta", "9", "6", "Private Markets", "Miami / South Florida", "Private Markets Forum"],
];

const metros = [
  ["New York Metro", "170 events", "Healthcare", "6 clusters"],
  ["Boston / Cambridge", "48 events", "Healthcare/Biotech", "3 clusters"],
  ["Bay Area", "52 events", "Technology/Growth", "4 clusters"],
];

const metroOptions = ["New York Metro", "Boston / Cambridge", "Bay Area", "Los Angeles / Orange County", "Dallas-Fort Worth", "Miami / South Florida", "Washington DC Metro", "Chicago Metro"];
const metroSchedules: Record<string, Record<string, string[]>> = {
  "New York Metro": { Today: ["Institutional Investor Conference"], "This Week": ["Healthcare Investor Forum"], "Next Two Weeks": ["Capital Markets Summit"] },
  "Boston / Cambridge": { Today: [], "This Week": ["Healthcare Investor Forum"], "Next Two Weeks": ["Institutional Investor Conference"] },
};

function InfoTip({ text }: { text: string }) {
  return (
    <span className="v3-info" tabIndex={0} aria-label={text}>
      i<span className="v3-tooltip">{text}</span>
    </span>
  );
}

function Bar({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "amber" | "indigo" }) {
  return (
    <div className="v3-bar-row">
      <span>{label}</span>
      <div className="v3-bar-track"><div className={`v3-bar-fill ${tone}`} style={{ width: `${value}%` }} /></div>
      <strong>{value}%</strong>
    </div>
  );
}

function OpenLink({ children = "Open" }: { children?: ReactNode }) {
  return <span className="v3-link">{children}</span>;
}

export default function MarketViewV3PreviewClient() {
  const [primaryMetro, setPrimaryMetro] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(metroStorageKey);
      if (saved) setPrimaryMetro(saved);
    } catch {
      // Static preview only.
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
      // Static preview only.
    }
  };

  return (
    <div className="v3-page">
      <style jsx>{`
        .v3-page { height: 100%; overflow: hidden; background: #eef3f8; color: #142235; font-family: var(--font-body), Arial, sans-serif; }
        .v3-shell { height: 100%; display: grid; grid-template-columns: 220px minmax(0, 1fr) 260px; gap: 18px; padding: 18px; }
        .v3-left { background: linear-gradient(180deg,#07192e,#03101f); color: #eaf3ff; border-radius: 18px; padding: 18px; display: grid; align-content: start; gap: 20px; box-shadow: 0 18px 40px rgba(7,25,46,.22); }
        .v3-main { overflow: auto; display: grid; gap: 18px; max-width: 1240px; width: 100%; justify-self: center; }
        .v3-right { background: rgba(255,255,255,.78); border: 1px solid #d7e2ee; border-radius: 18px; padding: 16px; align-self: start; display: grid; gap: 14px; box-shadow: 0 16px 34px rgba(24,47,75,.10); }
        .v3-brand { display: grid; gap: 4px; }
        .v3-brand small, .v3-eyebrow { font-size: 11px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; color: #2f6ff3; }
        .v3-brand strong { font-size: 20px; line-height: 1.05; }
        .v3-nav, .v3-feed, .v3-card-list { display: grid; gap: 8px; }
        .v3-nav div { padding: 9px 10px; border-radius: 10px; color: #b8c8db; font-size: 13px; font-weight: 800; }
        .v3-nav div:first-child { background: rgba(96,165,250,.16); color: #fff; }
        .v3-feed-row, .v3-summary-row { display: flex; justify-content: space-between; gap: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(148,163,184,.25); font-size: 12px; }
        .v3-panel { background: #fff; border: 1px solid #dbe5ef; border-radius: 18px; padding: 20px; box-shadow: 0 18px 38px rgba(24,47,75,.09); }
        .v3-readout { display: grid; grid-template-columns: minmax(0,1.2fr) minmax(320px,.8fr); gap: 22px; align-items: center; }
        h1 { margin: 0; font-size: 38px; line-height: 1; letter-spacing: -.01em; color: #0f1f33; }
        h2 { margin: 0; font-size: 24px; line-height: 1.1; color: #0f1f33; }
        h3 { margin: 0; font-size: 16px; line-height: 1.2; color: #12243a; }
        p { margin: 0; color: #506178; font-size: 14px; line-height: 1.48; }
        .v3-subtitle { max-width: 720px; color: #5f7188; font-size: 15px; }
        .v3-metrics { display: grid; gap: 10px; }
        .v3-metric { display: flex; justify-content: space-between; gap: 14px; padding-bottom: 10px; border-bottom: 1px solid #e3ebf3; }
        .v3-metric span { color: #73849a; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
        .v3-metric strong { color: #142235; font-size: 14px; }
        .v3-primary-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
        .v3-product { overflow: hidden; padding: 0; }
        .v3-product-head { padding: 18px 20px; color: #fff; display: grid; gap: 6px; }
        .hot .v3-product-head { background: linear-gradient(135deg,#9a5a08,#d89220); }
        .cluster .v3-product-head { background: linear-gradient(135deg,#312e81,#2563eb 62%,#0891b2); }
        .v3-product-title { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
        .v3-product-title h2 { color: #fff; }
        .v3-scroll-list { max-height: 470px; overflow: auto; display: grid; gap: 0; }
        .v3-row { padding: 16px 20px; border-bottom: 1px solid #e6edf5; display: grid; gap: 8px; }
        .v3-row-top { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
        .v3-row-title { font-size: 18px; font-weight: 900; color: #102136; }
        .v3-chipline { display: flex; flex-wrap: wrap; gap: 8px; color: #52647a; font-size: 12px; font-weight: 800; }
        .v3-detail { background: #f7fafc; border: 1px solid #e2ebf3; border-radius: 14px; padding: 14px; display: grid; gap: 10px; }
        .v3-detail ul { margin: 0; padding-left: 18px; color: #43556c; font-size: 13px; line-height: 1.5; }
        .v3-link { color: #1d5fd1; font-size: 13px; font-weight: 900; }
        .v3-support { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
        .v3-support-card { background: #fff; border: 1px solid #dce7f0; border-radius: 16px; padding: 16px; display: grid; gap: 10px; box-shadow: 0 12px 28px rgba(24,47,75,.07); }
        .v3-muted-row { padding: 9px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; color: #40536a; }
        .v3-analytics { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; }
        .v3-data-card { background: #fff; border: 1px solid #dce7f0; border-radius: 16px; padding: 16px; display: grid; gap: 12px; }
        .v3-bar-row { display: grid; grid-template-columns: minmax(110px,.85fr) minmax(0,1fr) 38px; gap: 10px; align-items: center; font-size: 12px; color: #33455c; }
        .v3-bar-track { height: 8px; border-radius: 999px; background: #e7eef6; overflow: hidden; }
        .v3-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#2563eb,#0ea5e9); }
        .v3-bar-fill.amber { background: linear-gradient(90deg,#b7791f,#f6ad32); }
        .v3-bar-fill.indigo { background: linear-gradient(90deg,#4f46e5,#0891b2); }
        .v3-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .v3-tabs span { padding: 7px 10px; border-radius: 999px; background: #f1f6fb; color: #40536a; font-size: 12px; font-weight: 800; }
        .v3-tabs span:first-child { background: #102f5f; color: #fff; }
        table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #dce7f0; border-radius: 14px; overflow: hidden; }
        th { text-align: left; padding: 12px 10px; color: #60748c; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; background: #f5f8fb; border-bottom: 1px solid #dce7f0; }
        td { padding: 12px 10px; color: #26384e; font-size: 13px; border-bottom: 1px solid #edf2f7; }
        .v3-metro-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }
        .v3-metro-card { background: #fff; border: 1px solid #dce7f0; border-radius: 15px; padding: 15px; display: grid; gap: 6px; }
        .v3-watch { display: grid; grid-template-columns: minmax(240px,.35fr) minmax(0,1fr); gap: 14px; }
        select { height: 36px; border-radius: 10px; border: 1px solid #cbd9e7; background: #fff; color: #142235; padding: 0 10px; font-weight: 800; }
        .v3-info { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 999px; background: rgba(255,255,255,.22); border: 1px solid rgba(255,255,255,.38); color: #fff; font-size: 11px; font-weight: 900; cursor: help; }
        .v3-tooltip { position: absolute; z-index: 10; right: 0; bottom: calc(100% + 8px); width: 260px; border-radius: 10px; background: #102136; color: #fff; padding: 10px; font-size: 12px; line-height: 1.35; box-shadow: 0 16px 32px rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity 120ms ease; }
        .v3-info:hover .v3-tooltip, .v3-info:focus .v3-tooltip { opacity: 1; }
        @media (max-width: 1180px) { .v3-page { overflow: auto; } .v3-shell { height: auto; grid-template-columns: 1fr; } .v3-main { overflow: visible; } .v3-readout, .v3-primary-row, .v3-support, .v3-analytics, .v3-watch { grid-template-columns: 1fr; } }
        @media (max-width: 760px) { h1 { font-size: 31px; } .v3-metro-grid { grid-template-columns: 1fr; } .v3-shell { padding: 12px; } }
      `}</style>

      <div className="v3-shell">
        <aside className="v3-left">
          <div className="v3-brand">
            <small>Market View V3</small>
            <strong>Conference Intelligence</strong>
            <p style={{ color: "#9fb3ca", fontSize: 12 }}>Static design preview</p>
          </div>
          <nav className="v3-nav">{navItems.map((item) => <div key={item}>{item}</div>)}</nav>
          <div className="v3-feed">
            <small className="v3-eyebrow" style={{ color: "#8fbfff" }}>Quick Feeds</small>
            {quickFeeds.map(([label, value]) => <div className="v3-feed-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>
        </aside>

        <main className="v3-main">
          <section className="v3-panel v3-readout">
            <div style={{ display: "grid", gap: 10 }}>
              <div className="v3-eyebrow">Market View</div>
              <h1>Capital Markets Conference Intelligence</h1>
              <p className="v3-subtitle">A forward-looking view of conference timing, access signals, organizer supply, and planning windows.</p>
              <p>Tracked forward conference activity is building into the fall calendar, with issuer-access and institutional-investor signals concentrated around mid-September. New York Metro remains the most active planning market, while healthcare and financial services are leading the forward calendar.</p>
            </div>
            <div className="v3-metrics">
              {[["860 tracked events", "Universe"], ["Sep 14-Sep 20", "Peak Week"], ["Healthcare", "Top Sector"], ["Institutional Investors", "Top Focus"], ["New York Metro", "Top Metro"]].map(([value, label]) => (
                <div className="v3-metric" key={label}><span>{label}</span><strong>{value}</strong></div>
              ))}
            </div>
          </section>

          <section className="v3-primary-row">
            <div className="v3-panel v3-product hot">
              <div className="v3-product-head">
                <div className="v3-product-title"><h2>Hot Weeks</h2><InfoTip text="A hot week highlights a forward calendar period worth inspecting. It does not mean every event is equally important." /></div>
                <p style={{ color: "rgba(255,255,255,.88)" }}>Weeks where conference activity, access signals, and related event density concentrate around the same dates.</p>
              </div>
              <div className="v3-scroll-list">
                {hotWeeks.map((row, index) => (
                  <div className="v3-row" key={row.week}>
                    <div className="v3-row-top"><span className="v3-row-title">{row.week}</span><OpenLink>Read more</OpenLink></div>
                    <div className="v3-chipline"><span>{row.events}</span><span>{row.theme}</span><span>{row.signal}</span></div>
                    {index === 0 ? <div className="v3-detail"><h3>Why this is a hot week</h3><p>{row.detail}</p><h3>Events included</h3><ul><li>Healthcare Investor Forum</li><li>Institutional Investor Conference</li><li>Capital Markets Summit</li></ul><h3>Why these events are included</h3><p>They share timing proximity and classification signals such as Healthcare, Institutional Investors, Issuer Access, or Company Presentations.</p></div> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="v3-panel v3-product cluster">
              <div className="v3-product-head">
                <div className="v3-product-title"><h2>Cluster Alerts</h2><InfoTip text="A cluster is created when events are close enough in timing and location and share a reason to attend." /></div>
                <p style={{ color: "rgba(255,255,255,.88)" }}>Groups of events connected by metro, timing, sector, focus, and access signals, not just raw city volume.</p>
              </div>
              <div className="v3-scroll-list">
                {clusters.map((row, index) => (
                  <div className="v3-row" key={row.metro}>
                    <div className="v3-row-top"><span className="v3-row-title">{row.metro}</span><OpenLink>Read more</OpenLink></div>
                    <div className="v3-chipline"><span>{row.events}</span><span>{row.type}</span><span>{row.window}</span></div>
                    {index === 0 ? <div className="v3-detail"><h3>Why this is a cluster</h3><p>{row.detail}</p><h3>Events included</h3><ul><li>Healthcare Investor Forum</li><li>Institutional Investor Conference</li><li>Capital Markets Summit</li></ul><h3>Why these events are included</h3><p>They share metro proximity, week timing, and classification signals. This is stronger than simple city volume.</p><h3>Meeting-day note</h3><p>This cluster includes a potential private-meeting day between related events, but the meeting day is supporting context rather than the reason for the signal.</p></div> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="v3-support">
            <div className="v3-support-card"><h3>Planning Windows</h3><div className="v3-muted-row">White Space / Lower Conflict: Nov 2-Nov 6</div><div className="v3-muted-row">Meeting-day note: Boston / Cambridge, Sep 22</div><div className="v3-muted-row">Timing note: use only when it changes interpretation</div></div>
            <div className="v3-support-card"><h3>Momentum</h3><p>Tracked September activity is higher than August, with healthcare and institutional-investor focus gaining share in the forward calendar.</p><div className="v3-muted-row">Healthcare +7</div><div className="v3-muted-row">Institutional Investors +5</div></div>
            <div className="v3-support-card"><h3>Dealmaking Context</h3><div className="v3-muted-row">Relationship-density signal: Moderate</div><div className="v3-muted-row">Sponsor / BD opportunity: Strong</div><div className="v3-muted-row">Advisor / banker relevance: Moderate</div></div>
          </section>

          <section className="v3-panel">
            <div style={{ display: "grid", gap: 6, marginBottom: 14 }}><div className="v3-eyebrow">Data / Analytics</div><h2>Signal Breakdowns</h2></div>
            <div className="v3-analytics">
              <div className="v3-data-card"><h3>Sector Breakdown</h3>{sectors.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} />)}</div>
              <div className="v3-data-card"><h3>Market Focus Mix</h3>{focusMix.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} />)}</div>
              <div className="v3-data-card"><h3>Event Character Mix</h3>{characterMix.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} tone="indigo" />)}</div>
              <div className="v3-data-card"><h3>Access / Audience Signal Mix</h3>{accessMix.map(([label, value]) => <Bar key={label} label={String(label)} value={Number(value)} />)}</div>
            </div>
          </section>

          <section className="v3-panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end", marginBottom: 14, flexWrap: "wrap" }}><div><div className="v3-eyebrow">Organizer League Table</div><h2>Organizer Supply</h2></div><div className="v3-tabs">{["Overall Supply", "Issuer Access", "Investor Relevant", "Structured Access", "Deal / BD"].map((tab) => <span key={tab}>{tab}</span>)}</div></div>
            <table><thead><tr>{["Rank", "Organizer", "Events", "Access Signals", "Top Sector", "Top Metro", "Next Event", "Open"].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{organizers.map((row) => <tr key={row[1]}>{[...row, "Open"].map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table>
          </section>

          <section className="v3-panel">
            <div style={{ display: "grid", gap: 6, marginBottom: 14 }}><div className="v3-eyebrow">Geography / Metro</div><h2>Metro Analytics</h2></div>
            <div className="v3-metro-grid">{metros.map(([metro, events, sector, count]) => <div className="v3-metro-card" key={metro}><h3>{metro}</h3><strong>{events}</strong><span>{sector}</span><span>{count}</span></div>)}</div>
          </section>

          <section className="v3-panel v3-watch">
            <div style={{ display: "grid", gap: 8 }}><div className="v3-eyebrow">Metro Watch</div><h2>Primary Work City</h2><p>Near-term placeholder activity around the selected metro.</p><select value={primaryMetro} onChange={(event) => updateMetro(event.target.value)}><option value="">Choose a metro</option>{metroOptions.map((metro) => <option key={metro} value={metro}>{metro}</option>)}</select></div>
            <div className="v3-analytics" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>{primaryMetro ? Object.entries(metroSchedule).map(([group, items]) => <div className="v3-data-card" key={group}><h3>{group}</h3>{items.length ? items.map((item) => <div className="v3-muted-row" key={item}>{item}</div>) : <div className="v3-muted-row">No near-term placeholder activity.</div>}</div>) : <div className="v3-data-card" style={{ gridColumn: "1 / -1" }}>Choose a city to view Today, This Week, and Next Two Weeks.</div>}</div>
          </section>
        </main>

        <aside className="v3-right">
          <div className="v3-card-list"><div className="v3-eyebrow">Current View Summary</div>{[["Dataset", "Static V3"], ["Lead products", "Hot Weeks + Clusters"], ["Peak week", "Sep 14-Sep 20"], ["Top metro", "New York Metro"]].map(([label, value]) => <div className="v3-summary-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          <div className="v3-card-list"><div className="v3-eyebrow">Saved View Controls</div>{["Save View", "Export", "Calendar Sync"].map((item) => <button key={item} style={{ height: 38, borderRadius: 10, border: "1px solid #ccd9e6", background: "#fff", color: "#173454", fontWeight: 900 }}>{item}</button>)}</div>
        </aside>
      </div>
    </div>
  );
}
