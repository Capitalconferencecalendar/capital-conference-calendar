"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const metroStorageKey = "marketViewV3.primaryMetro";

const filterRows = ["Date & Timing", "Location", "Market Segments", "Participation", "Organizers"];
const quickFeeds = [
  ["Investor Conferences", "115", "#3b82f6"],
  ["Healthcare", "0", "#14b8a6"],
  ["Private Markets", "154", "#7c3aed"],
  ["Canada Events", "33", "#dc2626"],
  ["Next 30 Days", "37", "#2563eb"],
  ["Hot Weeks", "22", "#f97316"],
];

const quickActions = ["Clear", "Share Selected", "Save Market View", "Save Selected"];

const kpis = [
  ["Conference Universe", "2,864", "Next 180 days"],
  ["Issuer Access", "475", "Classified signals"],
  ["Investor-Heavy", "326", "Audience signal"],
  ["Peak Week", "Sep 28-Oct 4", "143 events"],
  ["Top Metro", "New York, NY", "421 events"],
  ["Top Focus", "Clinical & Commercial", "34% of events"],
];

const hotWeeks = [
  {
    week: "Sep 28-Oct 4, 2025",
    events: "143 events",
    theme: "Healthcare",
    focus: "Institutional Investors",
    signal: "18 issuer-access signals",
    summary: "High investor overlap and sector breadth across major metros.",
    detail: "Concentrated investor attendance across Healthcare, Tech, and Industrials with multiple flagship events drawing senior allocators and corporate access teams.",
    eventsIncluded: "J.P. Morgan Healthcare Conference · LSEG Tech Summit · BofA Industrials Conference · Needham Growth Conference",
  },
  { week: "Oct 12-Oct 18, 2025", events: "89 events", theme: "Financial Services", focus: "Private Markets", signal: "12 investor-relevant signals", summary: "Capital formation and fund strategy activity rises together." },
  { week: "Nov 9-Nov 15, 2025", events: "76 events", theme: "Technology", focus: "Growth Equity", signal: "10 issuer-access signals", summary: "Public-company and private-growth signals overlap." },
  { week: "Oct 26-Nov 1, 2025", events: "68 events", theme: "Real Estate", focus: "Sponsor Visibility", signal: "9 deal/BD signals", summary: "Real estate and infrastructure forums compress into one window." },
  { week: "Nov 16-Nov 22, 2025", events: "61 events", theme: "Energy", focus: "Industrials", signal: "8 banker-relevant signals", summary: "Energy transition and industrial access signals cluster late in the month." },
];

const clusters = [
  {
    metro: "New York, NY",
    events: "97 events",
    type: "Healthcare issuer-access cluster",
    window: "Sep 28-Oct 4, 2025",
    signals: "Healthcare · Institutional Investors · Issuer Access",
    summary: "Multiple healthcare and investor-access events align across the metro.",
    detail: "Events occur in the same metro and week and share Healthcare, Institutional Investor, and Issuer Access signals.",
    cities: "New York · Jersey City · Stamford",
    eventsIncluded: "J.P. Morgan Healthcare Conference · Barclays Healthcare · TD Cowen Healthcare Innovation Summit",
  },
  { metro: "Boston, MA", events: "22 events", type: "Innovation Cluster", window: "Oct 12-Oct 18", signals: "Biotech · Growth Companies · Investor-Heavy", summary: "Biotech and growth-company forums align with investor-heavy programming." },
  { metro: "San Francisco, CA", events: "19 events", type: "Tech & AI Cluster", window: "Nov 9-Nov 15", signals: "AI / Software · Sponsor Visibility · Investor Relevance", summary: "Technology and AI events show shared investor and sponsor visibility signals." },
  { metro: "Chicago, IL", events: "15 events", type: "Industrials Cluster", window: "Oct 26-Nov 1", signals: "Industrials · Infrastructure · Banker Relevance", summary: "Industrial and infrastructure meetings compress into one market window." },
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

function Bar({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "amber" | "indigo" }) {
  return (
    <div className="v3-bar-row">
      <span>{label}</span>
      <div className="v3-bar-track"><div className={`v3-bar-fill ${tone}`} style={{ width: `${value}%` }} /></div>
      <strong>{value}%</strong>
    </div>
  );
}

function OpenLink({ children = "Inspect" }: { children?: ReactNode }) {
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
        .v3-page { height: 100%; overflow: hidden; background: #061421; color: #e6f0fb; font-family: var(--font-body), Arial, sans-serif; }
        .v3-shell { height: 100%; display: grid; grid-template-columns: minmax(280px, 290px) minmax(0, 1fr) minmax(300px, 320px); gap: 18px; padding: 0; }
        .v3-left { position: relative; align-self: stretch; min-width: 0; min-height: 0; width: 100%; max-width: 280px; height: 100%; overflow: hidden; padding-right: 2px; color: #eaf3ff; }
        .v3-main { overflow: auto; display: grid; gap: 9px; max-width: 1320px; width: 100%; justify-self: center; }
        .v3-right { position: relative; align-self: stretch; min-width: 0; min-height: 0; width: 100%; max-width: 320px; height: 100%; max-height: 100%; overflow: hidden; padding-right: 1px; color: #dbeafe; }
        .v3-rail-scroll { height: 100%; max-height: 100%; overflow-y: auto; overflow-x: hidden; overscroll-behavior-y: contain; -webkit-overflow-scrolling: touch; }
        .v3-left-inner { width: 100%; max-width: 100%; overflow: visible; padding: 10px 4px 6px 0; display: grid; gap: 10px; }
        .v3-right-inner { height: 100%; max-height: 100%; padding: 10px 16px 16px; display: grid; gap: 8px; }
        .v3-rail-title { color: #dbeafe; font-weight: 900; font-size: 20px; line-height: 1.05; margin-bottom: 6px; text-align: center; }
        .v3-rail-copy { color: #93aeca; font-size: 12px; line-height: 1.35; }
        .v3-clear-button { height: 36px; width: 100%; border-radius: 10px; border: 1px solid rgba(120,160,220,.2); background: rgba(8,26,46,.42); color: #c9dff7; cursor: pointer; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .v3-filter-stack, .v3-feed, .v3-card-list { display: grid; gap: 6px; }
        .v3-filter-row { height: 48px; border: 1px solid rgba(96,165,250,.28); border-radius: 10px; background: linear-gradient(180deg, rgba(12,34,60,.48), rgba(7,24,44,.36)); box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 0 10px rgba(59,130,246,.12); color: #dbeafe; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; }
        .v3-filter-label { font-size: 12px; font-weight: 800; letter-spacing: .07em; color: #d7e5f5; display: inline-flex; align-items: center; gap: 9px; text-transform: uppercase; }
        .v3-filter-icon, .v3-action-icon { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; color: #b6c6da; font-size: 14px; }
        .v3-rail-section-title { color: #f8fbff; font-weight: 800; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; margin: 6px 0; }
        .v3-feed-row { height: 38px; border-radius: 8px; border: 1px solid rgba(147,197,253,.08); background: rgba(147,197,253,.02); color: #dbeafe; display: flex; align-items: center; gap: 10px; padding: 0 10px; }
        .v3-feed-row span:nth-child(2) { flex: 1; min-width: 0; font-size: 13px; font-weight: 700; color: #dce8f8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .v3-feed-row strong { color: #f8fbff; font-size: 12px; font-weight: 800; }
        .v3-sync-card { border: 1px solid rgba(88,145,230,.34); border-radius: 10px; background: linear-gradient(180deg, rgba(13,35,62,.98), rgba(8,25,46,.96)); box-shadow: 0 0 0 1px rgba(70,120,220,.12), 0 12px 24px rgba(0,0,0,.18); padding: 0; overflow: hidden; }
        .v3-right-heading { min-height: 42px; padding: 0 14px; color: #dbeafe; display: flex; align-items: center; font-size: 12px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; gap: 9px; }
        .v3-sync-buttons { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; }
        .v3-sync-buttons button, .v3-action-button { border-radius: 10px; border: 1px solid rgba(92,136,184,.28); background: rgba(17,38,67,.9); color: #e7f2ff; font-weight: 800; cursor: pointer; box-shadow: 0 0 10px rgba(59,130,246,.12), inset 0 1px 0 rgba(255,255,255,.06); }
        .v3-sync-buttons button { height: 36px; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
        .v3-actions-head { width: 100%; height: 40px; padding: 0 4px; color: #dbeafe; display: flex; align-items: center; justify-content: space-between; }
        .v3-action-button { height: 38px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 12px; }
        .v3-rail-accordion { width: 100%; min-height: 48px; border: 1px solid rgba(205,220,239,.18); border-radius: 10px; background: linear-gradient(180deg, rgba(12,34,60,.42), rgba(7,24,44,.32)); box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 0 8px rgba(205,220,239,.06); }
        .v3-rail-accordion button { width: 100%; height: 48px; border: 0; background: transparent; color: #dbeafe; cursor: pointer; padding: 0 14px; display: flex; align-items: center; justify-content: space-between; }
        .v3-right-footer { margin-top: auto; padding-top: 28px; border-top: 1px solid rgba(205,220,239,.12); color: #dbeafe; display: flex; gap: 18px; justify-content: center; font-size: 13px; }
        .v3-brand { display: grid; gap: 4px; }
        .v3-brand small, .v3-eyebrow { font-size: 9px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; color: #38bdf8; }
        .v3-brand strong { font-size: 15px; line-height: 1.1; }
        .v3-summary-row { display: flex; justify-content: space-between; gap: 8px; padding: 7px 0; border-bottom: 1px solid rgba(148,163,184,.2); font-size: 11px; }
        .v3-panel { background: linear-gradient(180deg,rgba(10,27,44,.96),rgba(7,20,34,.96)); border: 1px solid rgba(94,139,184,.28); border-radius: 8px; padding: 12px; box-shadow: 0 18px 40px rgba(0,0,0,.22); }
        .v3-readout { position: relative; overflow: hidden; display: grid; gap: 8px; align-items: center; min-height: 136px; }
        .v3-readout:before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 82% 44%,rgba(14,165,233,.28),transparent 27%), linear-gradient(110deg,rgba(3,105,161,.2),transparent 52%); pointer-events: none; }
        .v3-readout > * { position: relative; }
        h1 { margin: 0; font-size: 29px; line-height: 1.04; letter-spacing: 0; color: #f8fbff; }
        h2 { margin: 0; font-size: 17px; line-height: 1.12; color: #f8fbff; }
        h3 { margin: 0; font-size: 13px; line-height: 1.2; color: #eaf2fb; }
        p { margin: 0; color: #aebfd2; font-size: 12px; line-height: 1.42; }
        .v3-subtitle { max-width: 760px; color: #b8dcff; font-size: 14px; line-height: 1.35; }
        .v3-metrics { display: grid; gap: 0; border: 1px solid rgba(96,165,250,.2); border-radius: 8px; overflow: hidden; background: rgba(5,15,27,.52); }
        .v3-metric { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 10px; padding: 8px 10px; border-bottom: 1px solid rgba(96,165,250,.14); }
        .v3-metric span { color: #8fb3d4; font-size: 9px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
        .v3-metric strong { color: #f8fbff; font-size: 12px; }
        .v3-metric small { color: #7290ad; font-size: 10px; text-align: right; }
        .v3-kpi-strip { display: grid; grid-template-columns: repeat(6,minmax(0,1fr)); gap: 6px; }
        .v3-kpi { min-height: 54px; padding: 8px 9px; border-radius: 7px; border: 1px solid rgba(82,126,170,.28); background: rgba(8,24,39,.82); display: grid; align-content: center; gap: 3px; }
        .v3-kpi span { color: #83a5c7; font-size: 9px; text-transform: uppercase; letter-spacing: .1em; font-weight: 900; }
        .v3-kpi strong { color: #f7fbff; font-size: 15px; line-height: 1.1; }
        .v3-kpi small { color: #7892ad; font-size: 10px; }
        .v3-primary-stack { display: grid; gap: 9px; }
        .v3-product { overflow: hidden; padding: 0; border-radius: 8px; }
        .v3-product.hot { border-color: rgba(245,158,11,.48); box-shadow: 0 0 0 1px rgba(245,158,11,.12), 0 18px 42px rgba(0,0,0,.24); }
        .v3-product.cluster { border-color: rgba(139,92,246,.5); box-shadow: 0 0 0 1px rgba(34,211,238,.12), 0 18px 42px rgba(0,0,0,.24); }
        .v3-product-head { padding: 11px 13px 10px; display: grid; gap: 5px; border-bottom: 1px solid rgba(125,162,199,.22); }
        .hot .v3-product-head { background: linear-gradient(90deg,rgba(245,158,11,.14),rgba(14,165,233,.08),transparent); }
        .cluster .v3-product-head { background: linear-gradient(90deg,rgba(139,92,246,.16),rgba(34,211,238,.08),transparent); }
        .v3-product-title { display: grid; gap: 4px; }
        .v3-product-title h2 { color: #f8fbff; font-size: 17px; }
        .v3-helper { color: #8fa6bd; font-size: 11px; line-height: 1.35; }
        .v3-marker { display: inline-flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
        .hot .v3-marker { color: #fbbf24; }
        .cluster .v3-marker { color: #c4b5fd; }
        .v3-scroll-list { max-height: 318px; overflow: auto; display: grid; gap: 0; }
        .v3-row { padding: 10px 13px; border-bottom: 1px solid rgba(117,153,190,.18); display: grid; gap: 6px; }
        .v3-row-top { display: grid; grid-template-columns: minmax(190px,.55fr) auto minmax(280px,1fr); gap: 12px; align-items: center; }
        .v3-row-title { font-size: 14px; font-weight: 850; color: #f8fbff; }
        .v3-row-count { color: #b7c6d6; font-size: 11px; font-weight: 850; white-space: nowrap; }
        .v3-chipline { display: flex; flex-wrap: wrap; gap: 6px; color: #9db2c9; font-size: 11px; font-weight: 750; }
        .v3-chipline span { border: 1px solid rgba(121,158,197,.2); background: rgba(11,31,51,.68); border-radius: 5px; padding: 3px 6px; }
        .v3-detail { background: rgba(4,13,24,.44); border-top: 1px solid rgba(113,150,188,.18); padding: 9px 10px; display: grid; gap: 7px; border-radius: 6px; }
        .v3-detail-grid { display: grid; grid-template-columns: 112px minmax(0,1fr); gap: 7px 12px; color: #b4c4d5; font-size: 11px; line-height: 1.35; }
        .v3-detail-grid strong { color: #e4edf7; font-size: 11px; letter-spacing: 0; }
        .v3-link { color: #38bdf8; font-size: 11px; font-weight: 850; white-space: nowrap; }
        .v3-inspect { display: grid; gap: 7px; }
        .v3-inspect summary { width: fit-content; color: #38bdf8; font-size: 11px; font-weight: 850; cursor: pointer; list-style: none; }
        .v3-inspect summary::-webkit-details-marker { display: none; }
        .v3-support { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
        .v3-support-card { background: #fff; border: 1px solid #dce7f0; border-radius: 10px; padding: 13px; display: grid; gap: 8px; box-shadow: 0 8px 18px rgba(24,47,75,.04); }
        .v3-muted-row { padding: 7px 0; border-bottom: 1px solid #edf2f7; font-size: 12px; color: #40536a; }
        .v3-analytics { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; }
        .v3-data-card { background: #fff; border: 1px solid #dce7f0; border-radius: 10px; padding: 13px; display: grid; gap: 10px; }
        .v3-bar-row { display: grid; grid-template-columns: minmax(110px,.85fr) minmax(0,1fr) 38px; gap: 10px; align-items: center; font-size: 12px; color: #33455c; }
        .v3-bar-track { height: 8px; border-radius: 999px; background: #e7eef6; overflow: hidden; }
        .v3-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#2563eb,#0ea5e9); }
        .v3-bar-fill.amber { background: #b7791f; }
        .v3-bar-fill.indigo { background: #4f46a5; }
        .v3-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .v3-tabs span { padding: 6px 9px; border-radius: 999px; background: #f1f6fb; color: #40536a; font-size: 11px; font-weight: 800; }
        .v3-tabs span:first-child { background: #102f5f; color: #fff; }
        table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #dce7f0; border-radius: 14px; overflow: hidden; }
        th { text-align: left; padding: 12px 10px; color: #60748c; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; background: #f5f8fb; border-bottom: 1px solid #dce7f0; }
        td { padding: 12px 10px; color: #26384e; font-size: 13px; border-bottom: 1px solid #edf2f7; }
        .v3-metro-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }
        .v3-metro-card { background: #fff; border: 1px solid #dce7f0; border-radius: 10px; padding: 13px; display: grid; gap: 5px; }
        .v3-watch { display: grid; grid-template-columns: minmax(240px,.35fr) minmax(0,1fr); gap: 14px; }
        select { height: 36px; border-radius: 10px; border: 1px solid #cbd9e7; background: #fff; color: #142235; padding: 0 10px; font-weight: 800; }
        .v3-info { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border-radius: 999px; background: #f6f8fb; border: 1px solid #cbd8e6; color: #41546d; font-size: 10px; font-weight: 900; cursor: help; }
        .v3-tooltip { position: absolute; z-index: 10; right: 0; bottom: calc(100% + 8px); width: 260px; border-radius: 10px; background: #102136; color: #fff; padding: 10px; font-size: 12px; line-height: 1.35; box-shadow: 0 16px 32px rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity 120ms ease; }
        .v3-info:hover .v3-tooltip, .v3-info:focus .v3-tooltip { opacity: 1; }
        @media (max-width: 1180px) { .v3-page { overflow: auto; } .v3-shell { height: auto; grid-template-columns: 1fr; } .v3-main { overflow: visible; } .v3-readout, .v3-primary-row, .v3-kpi-strip, .v3-support, .v3-analytics, .v3-watch { grid-template-columns: 1fr; } }
        @media (max-width: 760px) { h1 { font-size: 31px; } .v3-metro-grid { grid-template-columns: 1fr; } .v3-shell { padding: 12px; } }
      `}</style>

      <div className="v3-shell">
        <aside className="v3-left">
          <div className="v3-rail-scroll">
            <div className="v3-left-inner">
              <div style={{ marginBottom: 0 }}>
                <div className="v3-rail-title">Refine Your Market View</div>
                <div className="v3-rail-copy" style={{ marginBottom: 8 }}>Filter conferences by date, location, theme, and participation.</div>
                <button type="button" className="v3-clear-button"><span className="v3-action-icon">↻</span>Clear Filters</button>
              </div>

              <div className="v3-filter-stack">
                {filterRows.map((row, index) => (
                  <button type="button" className="v3-filter-row" key={row}>
                    <span className="v3-filter-label"><span className="v3-filter-icon">{["◷", "⌖", "▤", "♙", "║"][index]}</span>{row}</span>
                    <span style={{ color: "#dbeafe", fontSize: 16, lineHeight: 1 }}>▸</span>
                  </button>
                ))}
              </div>

              <div>
                <div className="v3-rail-section-title">Quick Feeds</div>
                <div className="v3-feed">
                  {quickFeeds.map(([label, count, color]) => (
                    <button type="button" className="v3-feed-row" key={label}>
                      <span className="v3-filter-icon" style={{ color }}>{label === "Hot Weeks" ? "♨" : label === "Canada Events" ? "◎" : label === "Next 30 Days" ? "□" : "◇"}</span>
                      <span>{label}</span>
                      <strong>({count})</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="v3-main">
          <section className="v3-panel v3-readout">
            <div style={{ display: "grid", gap: 8 }}>
              <div className="v3-eyebrow">Market View Live Intelligence</div>
              <h1>Capital Markets Conference Intelligence</h1>
              <p className="v3-subtitle">Forward-looking intelligence on where issuer access, investor concentration, sector activity, and conference density are building.</p>
              <p>Capital Conference Calendar tracks conference activity to surface where market attention, issuer participation, banker relevance, and relationship-driven opportunity signals are concentrating across the forward calendar.</p>
            </div>
          </section>

          <section className="v3-kpi-strip" aria-label="Market View KPI strip">
            {kpis.map(([label, value, note]) => (
              <div className="v3-kpi" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </div>
            ))}
          </section>

          <section className="v3-primary-stack">
            <div className="v3-panel v3-product hot">
              <div className="v3-product-head">
                <div className="v3-product-title"><div className="v3-marker">Hot Weeks</div><h2>Weeks with concentrated market activity</h2></div>
                <p>Weeks where event volume, issuer access, investor attendance, and sector signals concentrate around the same dates.</p>
                <div className="v3-helper">A hot week is a signal worth inspecting. It does not mean every event is equally important.</div>
              </div>
              <div className="v3-scroll-list">
                {hotWeeks.map((row, index) => (
                  <div className="v3-row" key={row.week}>
                    <div className="v3-row-top"><span className="v3-row-title">{row.week}</span><span className="v3-row-count">{row.events}</span><p>{row.summary}</p></div>
                    <div className="v3-chipline"><span>{row.theme}</span><span>{row.focus}</span><span>{row.signal}</span><OpenLink>Open week events</OpenLink></div>
                    <details className="v3-inspect" open={index === 0}>
                      <summary>Inspect signal</summary>
                      <div className="v3-detail"><div className="v3-detail-grid"><strong>Why flagged</strong><span>{row.detail || row.summary}</span><strong>Events included</strong><span>{row.eventsIncluded || "Representative event set aligned by week, sector, and audience signal."}</span><strong>Signal context</strong><span>Issuer access and investor concentration are the lead signals; meeting-day context is secondary.</span></div></div>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            <div className="v3-panel v3-product cluster">
              <div className="v3-product-head">
                <div className="v3-product-title"><div className="v3-marker">Cluster Alerts</div><h2>Metro and market-signal clusters</h2></div>
                <p>Metro, timing, sector, focus, and access signals that suggest concentrated conference activity — not just raw city volume.</p>
                <div className="v3-helper">Clusters surface groups of events with a shared market reason to attend.</div>
              </div>
              <div className="v3-scroll-list">
                {clusters.map((row, index) => (
                  <div className="v3-row" key={row.metro}>
                    <div className="v3-row-top"><span className="v3-row-title">{row.metro}</span><span className="v3-row-count">{row.events}</span><p>{row.summary}</p></div>
                    <div className="v3-chipline"><span>{row.type}</span><span>{row.window}</span><span>Shared signals: {row.signals}</span><OpenLink>Open cluster events</OpenLink></div>
                    <details className="v3-inspect" open={index === 0}>
                      <summary>Inspect cluster</summary>
                      <div className="v3-detail"><div className="v3-detail-grid"><strong>Why flagged</strong><span>{row.detail || row.summary}</span><strong>Cities included</strong><span>{row.cities || row.metro}</span><strong>Shared signals</strong><span>{row.signals}</span><strong>Events included</strong><span>{row.eventsIncluded || "Representative related events aligned by metro, timing, and signal overlap."}</span><strong>Supporting context</strong><span>Potential private-meeting days may exist between related events, but meeting-day context is secondary to the cluster signal.</span></div></div>
                    </details>
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
          <div className="v3-rail-scroll">
            <div className="v3-right-inner">
              <div style={{ marginBottom: 2, textAlign: "center", display: "grid", justifyItems: "center" }}>
                <div className="v3-rail-title">Control Panel</div>
                <div className="v3-rail-copy" style={{ maxWidth: 230, width: "100%", textAlign: "left", justifySelf: "stretch" }}>Export, save, sync, and manage this market view.</div>
              </div>

              <div className="v3-sync-card">
                <div className="v3-right-heading"><span className="v3-action-icon" style={{ color: "#8fc2ff" }}>▣</span>Sync Calendar</div>
                <div style={{ padding: "0 14px 14px" }}>
                  <div style={{ color: "#c6d7ee", fontSize: 13, marginBottom: 12, lineHeight: 1.4 }}>Turn this market view into a live calendar workflow.</div>
                  <div className="v3-sync-buttons">
                    {["Google", "Apple", "Outlook"].map((item) => <button type="button" key={item}>{item}</button>)}
                  </div>
                </div>
              </div>

              <div style={{ padding: 0 }}>
                <div className="v3-actions-head">
                  <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 9 }}><span className="v3-action-icon">⚡</span>Quick Actions</span>
                  <span style={{ color: "#8fb3df", fontSize: 12, fontWeight: 700 }}>0 selected</span>
                </div>
                <div style={{ display: "grid", gap: 8, padding: "0 4px 8px" }}>
                  {quickActions.map((action, index) => (
                    <button type="button" className="v3-action-button" key={action}>
                      <span>{action}</span>
                      <span className="v3-action-icon" style={{ color: ["#9fc3ff", "#8fd0ff", "#7ad6c8", "#ffbf66"][index] }}>{["↻", "⇧", "▣", "+"][index]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {["Saved Lists", "Saved Views"].map((section) => (
                <div className="v3-rail-accordion" key={section}>
                  <button type="button">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "#f1f7ff" }}><span className="v3-action-icon">☷</span>{section}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#9fc3e7", fontSize: 12, fontWeight: 700 }}>0 saved</span>
                      <span style={{ color: "#9fb6d4", fontSize: 14, lineHeight: 1 }}>▸</span>
                    </span>
                  </button>
                </div>
              ))}

              <div className="v3-right-footer"><span>Subscribe</span><span>Legal</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
