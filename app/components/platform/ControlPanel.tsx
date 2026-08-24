"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";

type CalendarBrand = "google" | "apple" | "outlook";
type QuickActionKind = "clear" | "share" | "saveView" | "saveSelected";
type SectionIconKind = "sync" | "actions" | "lists" | "views" | "status";

type CalendarPlatform = {
  label: string;
  brand: CalendarBrand;
  platform?: string;
  onClick?: () => void;
};

type QuickAction = {
  label: string;
  kind: QuickActionKind;
  accent: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  active?: boolean;
  containerRef?: RefObject<HTMLDivElement | null>;
  menu?: ReactNode;
};

type SavedSection = {
  title: string;
  icon: "lists" | "views";
  count: number;
  isOpen?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
};

type ControlPanelProps = {
  description: string;
  syncDescription: string;
  selectedCount: number;
  calendarPlatforms?: CalendarPlatform[];
  quickActions: QuickAction[];
  savedSections: SavedSection[];
  utilityLinks?: Array<{ href: string; label: string }>;
  panelHeight?: string;
};

function QuickActionIcon({ kind }: { kind: QuickActionKind }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "clear") return <svg {...common} aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>;
  if (kind === "share") return <svg {...common} aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="m16 6-4-4-4 4" /><path d="M12 2v14" /></svg>;
  if (kind === "saveView") return <svg {...common} aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>;
  return <svg {...common} aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
}

function RightRailSectionIcon({ kind }: { kind: SectionIconKind }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "sync") return <svg {...common} aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /><path d="M8 14h3M14 14h2M8 17h2" /></svg>;
  if (kind === "actions") return <svg {...common} aria-hidden="true"><path d="m13 2-9 13h7l-1 7 9-13h-7l1-7Z" /></svg>;
  if (kind === "lists") return <svg {...common} aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></svg>;
  if (kind === "views") return <svg {...common} aria-hidden="true"><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h5" /><path d="M9 13h6M9 17h4" /></svg>;
  return <svg {...common} aria-hidden="true"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>;
}

function CalendarBrandGlyph({ brand }: { brand: CalendarBrand }) {
  if (brand === "google") return <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62Z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.82.86-3.06.86-2.35 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18Z" /><path fill="#FBBC05" d="M3.96 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3-2.33Z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3 2.33c.7-2.12 2.69-3.7 5.04-3.7Z" /></svg>;
  if (brand === "apple") return <span style={{ fontSize: "14px", lineHeight: 1, color: "#e2e8f0" }}></span>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v14H4z" stroke="#38bdf8" strokeWidth="2" /><path d="m4 7 8 6 8-6" stroke="#38bdf8" strokeWidth="2" /></svg>;
}

const savedSectionStyle: CSSProperties = {
  width: "100%",
  minHeight: "48px",
  padding: 0,
  overflow: "visible",
  border: "1px solid rgba(205,220,239,0.18)",
  borderRadius: "10px",
  background: "linear-gradient(180deg, rgba(12,34,60,0.42), rgba(7,24,44,0.32))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 8px rgba(205,220,239,0.06)",
};

export default function ControlPanel({
  description,
  syncDescription,
  selectedCount,
  calendarPlatforms = [
    { label: "Google", brand: "google" },
    { label: "Apple", brand: "apple" },
    { label: "Outlook", brand: "outlook" },
  ],
  quickActions,
  savedSections,
  utilityLinks = [
    { href: "/subscribe", label: "Subscribe" },
    { href: "/legal", label: "Legal" },
  ],
  panelHeight = "calc(100vh - 126px)",
}: ControlPanelProps) {
  return (
    <aside
      className="right-rail ccc-scroll-rail ccc-scroll-rail-right"
      style={{ position: "relative", alignSelf: "stretch", display: "grid", gap: "10px", minWidth: 0, minHeight: 0, width: "100%", maxWidth: "320px", height: panelHeight, maxHeight: panelHeight, overflow: "hidden", paddingRight: "1px" }}
    >
      <div style={{ width: "100%", height: "100%", maxHeight: "100%", overflow: "hidden" }}>
        <div style={{ height: "100%", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", padding: "10px 16px 16px", display: "grid", gap: "4px" }}>
          <div style={{ marginBottom: 2, textAlign: "center", display: "grid", justifyItems: "center" }}>
            <div style={{ color: "#dbeafe", fontWeight: 900, fontSize: "20px", lineHeight: 1.05, marginBottom: "6px" }}>Control Panel</div>
            <div style={{ color: "#9db4d3", fontSize: "13px", lineHeight: 1.35, maxWidth: "230px", width: "100%", textAlign: "left", justifySelf: "stretch" }}>{description}</div>
          </div>

          <div style={{ padding: 0, overflow: "visible", position: "sticky", top: 0, zIndex: 8, background: "linear-gradient(180deg, rgba(13,35,62,0.98) 0%, rgba(8,25,46,0.96) 100%)", border: "1px solid rgba(88, 145, 230, 0.34)", borderRadius: "10px", boxShadow: "0 0 0 1px rgba(70,120,220,0.12), 0 12px 24px rgba(0,0,0,0.18)" }}>
            <div style={{ width: "100%", minHeight: "42px", padding: "0 14px", color: "#dbeafe", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", display: "inline-flex", alignItems: "center", gap: "9px", textTransform: "uppercase" }}>
                <span style={{ width: "18px", height: "18px", color: "#8fc2ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><RightRailSectionIcon kind="sync" /></span>
                SYNC CALENDAR
              </span>
            </div>
            <div style={{ padding: "0 14px 14px" }}>
              <div style={{ color: "#c6d7ee", fontSize: 13, marginBottom: 12, lineHeight: 1.4 }}>{syncDescription}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginBottom: "2px" }}>
                {calendarPlatforms.map((platform) => (
                  <button
                    type="button"
                    key={platform.label}
                    onClick={platform.onClick}
                    style={{ height: "36px", borderRadius: "10px", border: platform.label === "Outlook" ? "1px solid rgba(86, 180, 220, 0.34)" : "1px solid rgba(105, 153, 205, 0.28)", background: platform.label === "Apple" ? "rgba(8, 24, 43, 0.92)" : "rgba(11, 32, 56, 0.82)", color: "#dbeafe", fontSize: "12.5px", cursor: platform.onClick ? "pointer" : "default", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: 800 }}
                  >
                    <span style={{ width: "16px", height: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <CalendarBrandGlyph brand={platform.brand} />
                    </span>
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: 0, overflow: "visible", background: "transparent", border: "none", boxShadow: "none", borderRadius: 0 }}>
            <div style={{ width: "100%", height: "40px", padding: "0 4px", color: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", display: "inline-flex", alignItems: "center", gap: "9px", textTransform: "uppercase" }}>
                <span style={{ width: "18px", height: "18px", color: "#9ec5ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><RightRailSectionIcon kind="actions" /></span>
                QUICK ACTIONS
              </span>
              <span style={{ fontSize: "12px", color: "#8fb3df", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>{selectedCount > 0 ? <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#60a5fa", display: "inline-block" }} /> : null}{selectedCount} selected</span>
            </div>
            <div style={{ display: "grid", gap: 8, padding: "0 4px 8px" }}>
              {quickActions.map((action) => {
                const button = (
                  <button
                    type="button"
                    key={action.label}
                    onClick={action.onClick}
                    onMouseEnter={action.onMouseEnter}
                    onMouseLeave={action.onMouseLeave}
                    style={{ width: "100%", height: "38px", borderRadius: "10px", border: action.active ? "1px solid rgba(125,182,255,0.58)" : "1px solid rgba(92,136,184,0.28)", background: action.active ? "linear-gradient(180deg, rgba(24,58,100,0.98), rgba(17,42,78,0.96))" : "rgba(17,38,67,0.9)", color: "#e7f2ff", fontSize: "13px", fontWeight: 800, cursor: action.onClick ? "pointer" : "default", boxShadow: action.active ? "0 0 0 1px rgba(96,165,250,0.28), 0 0 14px rgba(59,130,246,0.24), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 0 10px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)", transition: "all 140ms ease", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px 0 12px" }}
                  >
                    <span>{action.label}</span>
                    <span style={{ opacity: 0.95, display: "inline-flex", alignItems: "center" }}>
                      <span style={{ color: action.accent }}><QuickActionIcon kind={action.kind} /></span>
                    </span>
                  </button>
                );
                return action.menu ? <div key={action.label} ref={action.containerRef} style={{ position: "relative" }}>{button}{action.menu}</div> : button;
              })}
            </div>
          </div>

          {savedSections.map((section) => (
            <div key={section.title} style={savedSectionStyle}>
              <button type="button" onClick={section.onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", border: "none", background: "transparent", color: "#dbeafe", cursor: section.onToggle ? "pointer" : "default", padding: "0 14px", textAlign: "left", height: "48px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f1f7ff" }}>
                  <span style={{ width: "18px", height: "18px", color: "#9ec5ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><RightRailSectionIcon kind={section.icon} /></span>
                  {section.title}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#9fc3e7", fontSize: 12, fontWeight: 700 }}>{section.count} saved</span>
                  <span style={{ color: "#9fb6d4", fontSize: 14, lineHeight: 1 }}>{section.onToggle ? (section.isOpen ? "▾" : "▸") : "▸"}</span>
                </span>
              </button>
              {section.isOpen ? section.children : null}
            </div>
          ))}

          <div style={{ marginTop: "auto", padding: "18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {utilityLinks.map((link) => <a className="right-rail-utility-pill" href={link.href} key={link.href}>{link.label}</a>)}
          </div>
        </div>
      </div>
    </aside>
  );
}
