"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";

type SubscribeIconKind = "mail" | "calendar" | "signal";

function SubscribeIcon({
  kind,
  color = "#63A4FF",
}: {
  kind: SubscribeIconKind;
  color?: string;
}) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {kind === "mail" ? (
        <>
          <rect x="4" y="6" width="16" height="12" rx="3" {...common} />
          <path d="m5 8 7 5 7-5" {...common} />
        </>
      ) : kind === "calendar" ? (
        <>
          <rect x="4" y="5" width="16" height="15" rx="3" {...common} />
          <path d="M8 3v4M16 3v4M4 10h16" {...common} />
          <path d="M8 14h3M13 14h3M8 17h2" {...common} />
        </>
      ) : (
        <>
          <path d="M4 19V5" {...common} />
          <path d="M8 17V9M12 17V7M16 17v-5M20 17V4" {...common} />
        </>
      )}
    </svg>
  );
}

function ReceiveCard({
  title,
  copy,
  icon,
  accent,
}: {
  title: string;
  copy: string;
  icon: SubscribeIconKind;
  accent: string;
}) {
  return (
    <div className="ccc-sub-brief-card" style={{ minHeight: "166px", borderRadius: "20px", background: "linear-gradient(180deg, rgba(8,31,55,0.92), rgba(4,14,32,0.96))", border: "1px solid rgba(107,157,210,0.2)", padding: "18px", boxShadow: "0 18px 36px rgba(0,0,0,0.18)", display: "grid", alignContent: "start", gap: "12px" }}>
      <span style={{ width: "48px", height: "48px", borderRadius: "15px", background: "linear-gradient(180deg, rgba(80,120,255,0.24), rgba(28,48,110,0.16))", border: "1px solid rgba(160,200,255,0.18)", boxShadow: `0 0 24px ${accent}28`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <SubscribeIcon kind={icon} color={accent} />
      </span>
      <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900 }}>{title}</div>
      <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.5 }}>{copy}</div>
    </div>
  );
}

export default function SubscribePageClient() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("success");
    setEmail("");
    setCompany("");
    setRole("");
  };

  return (
    <AppShell active="subscribe">
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "26px 10px 72px", display: "grid", gap: "22px" }}>
        <section className="ccc-subscribe-hero" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: "26px", alignItems: "center", padding: "30px", borderRadius: "28px", background: "radial-gradient(circle at 16% 0%, rgba(59,130,246,0.2), transparent 38%), radial-gradient(circle at 84% 18%, rgba(45,212,191,0.1), transparent 30%), linear-gradient(135deg, rgba(8,31,55,0.97), rgba(5,20,36,0.99))", border: "1px solid rgba(107,157,210,0.24)", boxShadow: "0 24px 60px rgba(0,0,0,0.26)", overflow: "hidden" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "12px" }}>
              Weekly briefing
            </div>
            <h1 style={{ margin: 0, color: "#ffffff", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.98, fontWeight: 950, letterSpacing: "-0.045em", maxWidth: "760px" }}>
              Stay close to the conference calendar.
            </h1>
            <p style={{ margin: "18px 0 0", color: "#d9e8fb", fontSize: "19px", lineHeight: 1.42, fontWeight: 650, maxWidth: "760px" }}>
              Receive curated updates on upcoming capital markets conferences, investor events, active market weeks, and conference coverage.
            </p>
            <p style={{ margin: "12px 0 0", color: "#a9bfd8", fontSize: "15px", lineHeight: 1.55, maxWidth: "760px" }}>
              The briefing is designed as a light signal layer for people tracking where market attention, issuer access, and conference activity are building.
            </p>
            <button type="button" onClick={() => document.getElementById("subscribe-email-field")?.focus()} style={{ marginTop: "22px", height: "44px", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", fontSize: "14px", fontWeight: 900, cursor: "pointer" }}>
              Subscribe to Weekly Briefing
            </button>
          </div>

          <div style={{ background: "linear-gradient(180deg, rgba(10,24,52,0.96), rgba(4,14,34,0.98))", border: "1px solid rgba(130,180,255,0.16)", borderRadius: "24px", padding: "18px", boxShadow: "0 20px 50px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#dce9fb", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>
              Briefing focus
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { label: "Weekly email", note: "A concise look at relevant upcoming activity.", icon: "mail" as const, accent: "#63A4FF" },
                { label: "Calendar context", note: "Upcoming conferences and market activity windows.", icon: "calendar" as const, accent: "#4EE3C1" },
                { label: "Signal updates", note: "Hot weeks, clusters, and new coverage themes.", icon: "signal" as const, accent: "#FFB357" },
              ].map((item) => (
                <div key={item.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", alignItems: "center" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(80,120,255,0.24), rgba(28,48,110,0.16))", border: "1px solid rgba(160,200,255,0.18)", boxShadow: `0 0 24px ${item.accent}24`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <SubscribeIcon kind={item.icon} color={item.accent} />
                  </span>
                  <div>
                    <div style={{ color: "#ffffff", fontSize: "16px", fontWeight: 850 }}>{item.label}</div>
                    <div style={{ color: "#9fb7d2", fontSize: "13px", lineHeight: 1.35 }}>{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ccc-about-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
          <ReceiveCard title="Upcoming Conferences" copy="A weekly snapshot of notable upcoming investor and capital markets events." icon="calendar" accent="#63A4FF" />
          <ReceiveCard title="Hot Weeks & Clusters" copy="Monitor periods of elevated conference activity and overlapping event concentration." icon="signal" accent="#FFB357" />
          <ReceiveCard title="Market Coverage Updates" copy="Stay informed as new conferences and organizers are added to the platform." icon="mail" accent="#4EE3C1" />
        </section>

        <section style={{ background: "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))", border: "1px solid rgba(107,157,210,0.24)", borderRadius: "22px", padding: "24px", boxShadow: "0 18px 40px rgba(0,0,0,0.18)" }}>
          {status === "success" ? (
            <div style={{ textAlign: "center", display: "grid", gap: "8px" }}>
              <h2 style={{ margin: 0, color: "#ffffff", fontSize: "30px", lineHeight: 1.1 }}>Subscription confirmed</h2>
              <p style={{ margin: 0, color: "#c8d8ec", fontSize: "15px", lineHeight: 1.6 }}>
                You&apos;ll begin receiving the weekly Capital Conference Database briefing shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ maxWidth: "760px", margin: "0 auto", display: "grid", gap: "14px" }}>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 6px", color: "#ffffff", fontSize: "28px", lineHeight: 1.1 }}>Subscribe to Weekly Briefing</h2>
                <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.45 }}>
                  Join the briefing list for concise conference calendar updates.
                </div>
              </div>
              <div className="ccc-submit-fields" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="subscribe-email-field" style={{ display: "block", color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input id="subscribe-email-field" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", height: "48px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.4)", backgroundColor: "rgba(8,22,48,0.88)", padding: "0 14px", fontSize: "15px", color: "#dbeafe", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>
                    Company
                  </label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid rgba(120,160,255,0.22)", backgroundColor: "rgba(8,22,48,0.72)", padding: "0 12px", fontSize: "15px", color: "#dbeafe", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>
                    Role
                  </label>
                  <input value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid rgba(120,160,255,0.22)", backgroundColor: "rgba(8,22,48,0.72)", padding: "0 12px", fontSize: "15px", color: "#dbeafe", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "12px", color: "#8fb3d7" }}>No spam. Unsubscribe at any time.</div>
                <button type="submit" style={{ height: "48px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", padding: "0 18px", fontSize: "15px", fontWeight: 900, cursor: "pointer" }}>
                  Subscribe to Weekly Briefing
                </button>
              </div>
            </form>
          )}
        </section>

        <section style={{ borderRadius: "22px", background: "linear-gradient(180deg, rgba(8,31,55,0.9), rgba(4,14,32,0.96))", border: "1px solid rgba(107,157,210,0.2)", padding: "22px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: "30px", lineHeight: 1.12 }}>
            Build your live conference calendar.
          </h2>
          <p style={{ margin: "0 0 14px", color: "#c8d8ec", fontSize: "15px", lineHeight: 1.55 }}>
            Create personalized conference feeds and keep your market calendar continuously updated.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/discovery#calendar-feed" style={{ textDecoration: "none", height: "44px", display: "inline-flex", alignItems: "center", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", fontSize: "14px", fontWeight: 900 }}>
              Open Calendar Feed Builder
            </Link>
            <Link href="/discovery" style={{ textDecoration: "none", height: "44px", display: "inline-flex", alignItems: "center", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(120,150,190,0.32)", background: "rgba(255,255,255,0.08)", color: "#dbeafe", fontSize: "14px", fontWeight: 900 }}>
              Explore Conference Database
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
