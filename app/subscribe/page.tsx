"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";

function ReceiveCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div
      className="ccc-sub-brief-card"
      style={{
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        padding: "14px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>{title}</div>
      <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>{copy}</div>
    </div>
  );
}

export default function SubscribePage() {
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
    <AppShell active="feeds">
      <div style={{ display: "grid", gap: "14px" }}>
        <section
          className="ccc-subscribe-hero"
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "1.1fr minmax(300px, 0.9fr)",
            gap: "14px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "40px", lineHeight: 1.08, color: "#0f172a" }}>
              Weekly Conference Briefing
            </h1>
            <p style={{ margin: "0 0 10px 0", fontSize: "17px", color: "#334155", lineHeight: 1.6 }}>
              Receive a curated weekly list of upcoming capital markets conferences,
              investor events, active market weeks, and conference clusters.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {[
                "Weekly email",
                "Upcoming conference calendar",
                "Market activity highlights",
                "Free subscription",
              ].map((chip) => (
                <span key={chip} style={{ border: "1px solid #d5e4f5", backgroundColor: "#f8fbff", color: "#0f3d75", borderRadius: "999px", padding: "6px 10px", fontSize: "13px", fontWeight: 700 }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div style={{ border: "1px solid #d7dde5", borderRadius: "12px", backgroundColor: "#fbfdff", padding: "12px", display: "grid", gap: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f3d75", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Weekly Briefing Preview
            </div>
            <div style={{ border: "1px solid #dbe4ee", borderRadius: "9px", backgroundColor: "#ffffff", padding: "9px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>This Week&apos;s Market Snapshot</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
                {[
                  ["41", "Upcoming"],
                  ["19", "Cities"],
                  ["3", "Hot Weeks"],
                  ["9", "Clusters"],
                ].map(([v, l]) => (
                  <div key={l} style={{ border: "1px solid #e2e8f0", borderRadius: "7px", padding: "6px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{v}</div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="ccc-about-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
          <ReceiveCard title="Upcoming Conferences" copy="A weekly snapshot of notable upcoming investor and capital markets events." />
          <ReceiveCard title="Hot Weeks & Clusters" copy="Monitor periods of elevated conference activity and overlapping event concentration." />
          <ReceiveCard title="Market Coverage Updates" copy="Stay informed as new conferences and organizers are added to the platform." />
        </section>

        <section style={{ border: "1px solid #d7dde5", borderRadius: "14px", backgroundColor: "#ffffff", padding: "16px", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
          {status === "success" ? (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "30px", color: "#0f172a" }}>Subscription Confirmed</h2>
              <p style={{ margin: 0, fontSize: "15px", color: "#475569", lineHeight: 1.6 }}>
                You’ll begin receiving the weekly Capital Conference Calendar briefing shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ maxWidth: "760px", margin: "0 auto", display: "grid", gap: "10px" }}>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "28px", color: "#0f172a", textAlign: "center" }}>Subscribe to Weekly Briefing</h2>
              <div className="ccc-submit-fields" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#667085", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid #d5dde7", padding: "0 12px", fontSize: "14px", color: "#0f172a" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#667085", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Company
                  </label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #d5dde7", padding: "0 12px", fontSize: "14px", color: "#0f172a" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#667085", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Role
                  </label>
                  <input value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #d5dde7", padding: "0 12px", fontSize: "14px", color: "#0f172a" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>No spam. Unsubscribe at any time.</div>
                <button type="submit" style={{ height: "42px", borderRadius: "10px", border: "1px solid #0f2d4f", backgroundColor: "#0f2d4f", color: "#fff", padding: "0 16px", fontSize: "14px", fontWeight: 700 }}>
                  Subscribe to Weekly Briefing
                </button>
              </div>
            </form>
          )}
        </section>

        <section style={{ border: "1px solid #d7dde5", borderRadius: "14px", backgroundColor: "#ffffff", padding: "16px", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", color: "#0f172a" }}>Sample Weekly Briefing</h2>
          <div style={{ border: "1px solid #dbe4ee", borderRadius: "10px", backgroundColor: "#fbfdff", padding: "12px", display: "grid", gap: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f3d75", textTransform: "uppercase", letterSpacing: "0.06em" }}>Capital Conference Calendar Weekly Briefing</div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#ffffff", padding: "10px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Upcoming Conferences</div>
              <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55 }}>
                41 conferences in the next 30 days across 19 active cities.
              </div>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#ffffff", padding: "10px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Hot Weeks & Clusters</div>
              <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55 }}>
                3 elevated market weeks and 9 multi-event clusters this week.
              </div>
            </div>
          </div>
        </section>

        <section style={{ border: "1px solid #d7dde5", borderRadius: "14px", backgroundColor: "#ffffff", padding: "16px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "30px", color: "#0f172a" }}>Build Your Live Conference Calendar</h2>
          <p style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#475569", lineHeight: 1.6 }}>
            Create personalized conference feeds and keep your market calendar continuously updated.
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/events#calendar-feed" style={{ textDecoration: "none", height: "40px", display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "10px", border: "1px solid #0f2d4f", backgroundColor: "#0f2d4f", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
              Open Calendar Feed Builder
            </Link>
            <Link href="/events" style={{ textDecoration: "none", height: "40px", display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "10px", border: "1px solid #d7dde5", backgroundColor: "#ffffff", color: "#334155", fontSize: "14px", fontWeight: 700 }}>
              Explore Conference Database
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
