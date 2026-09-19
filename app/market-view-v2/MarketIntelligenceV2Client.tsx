"use client";

import { useState } from "react";
import type { IntelligenceFinding, IntelligenceSupportingEvent } from "../../lib/marketIntelligenceV2";

const signalLabels: Record<IntelligenceSupportingEvent["signals"][number], string> = {
  "issuer-access": "Issuer Access",
  "investor-heavy": "Institutional Investors",
  "structured-access": "Structured Access",
  "deal-making": "Partnering / Deal-Making",
  "company-presentations": "Company Presentations",
  "1x1-meetings": "1x1 Meetings",
};

function confidenceLabel(score: number) {
  if (score >= 80) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}

function formatDate(date: string) {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function EmptyBriefing() {
  return <div style={{ margin: "28px auto", maxWidth: "760px", padding: "28px", border: "1px solid rgba(124, 166, 211, 0.22)", background: "rgba(8, 27, 47, 0.82)", color: "#dbeafe" }}>No weekly market signal is available for the current upcoming conference index.</div>;
}

export default function MarketIntelligenceV2Client({ finding }: { finding: IntelligenceFinding | null }) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  if (!finding) return <EmptyBriefing />;

  const visibleEvents = showAllEvents ? finding.supportingEvents : finding.supportingEvents.slice(0, 5);
  const confidence = confidenceLabel(finding.confidence.score);
  const baseline = finding.comparison.baselineValue === null ? "No nearby-week baseline available" : `${finding.comparison.baselineValue} events across nearby scoped weeks`;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "18px 0 32px", background: "radial-gradient(80% 60% at 52% 0%, rgba(26, 88, 145, 0.15), transparent 62%)" }}>
      <div style={{ width: "min(1120px, calc(100% - 32px))", margin: "0 auto", display: "grid", gap: "16px" }}>
        <header style={{ padding: "8px 0 18px", borderBottom: "1px solid rgba(126, 167, 210, 0.2)" }}>
          <div style={{ color: "#7ebaff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>Market Intelligence V2 / Weekly Briefing</div>
          <h1 style={{ margin: 0, color: "#f8fbff", fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.06, fontWeight: 850 }}>This Week in Conference Markets</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: "14px", color: "#a8bdd4", fontSize: "13px" }}>
            <span>{finding.scope.dateWindow.startDate} to {finding.scope.dateWindow.endDate}</span>
            <span>{finding.scope.population === "full-market" ? "Full Market View" : "Current Filter View"}</span>
            <span>As of {finding.scope.asOfDate}</span>
            <span>{finding.scope.eligibleEventCount} eligible events analyzed</span>
          </div>
        </header>

        <section style={{ padding: "28px", border: "1px solid rgba(99, 155, 214, 0.28)", borderRadius: "8px", background: "linear-gradient(135deg, rgba(11, 38, 67, 0.96), rgba(5, 21, 38, 0.98))", boxShadow: "0 18px 42px rgba(0, 0, 0, 0.2)" }}>
          <div style={{ color: "#7dd3fc", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Weekly Market Signal</div>
          <h2 style={{ margin: "10px 0 14px", color: "#ffffff", fontSize: "clamp(26px, 3.4vw, 42px)", lineHeight: 1.1, maxWidth: "900px" }}>{finding.headline}</h2>
          <p style={{ margin: 0, color: "#d6e4f5", fontSize: "17px", lineHeight: 1.65, maxWidth: "930px" }}>{finding.finding}</p>
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(141, 181, 224, 0.18)" }}>
            <h3 style={{ margin: "0 0 8px", color: "#a5d8ff", fontSize: "13px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase" }}>Why This Matters</h3>
            <p style={{ margin: 0, color: "#d6e4f5", fontSize: "15px", lineHeight: 1.6 }}>{finding.whyItMatters}</p>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 0.38fr)", gap: "16px", alignItems: "start" }}>
          <div style={{ padding: "22px", border: "1px solid rgba(117, 160, 205, 0.2)", borderRadius: "8px", background: "rgba(6, 25, 45, 0.86)" }}>
            <h2 style={{ margin: "0 0 14px", color: "#f3f8ff", fontSize: "18px" }}>Evidence</h2>
            <div style={{ display: "grid", gap: "8px" }}>
              {finding.evidence.slice(0, 5).map((item) => <div key={item.label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "12px", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid rgba(143, 178, 216, 0.12)" }}><span style={{ color: "#b9cbe0", fontSize: "14px" }}>{item.label}</span><strong style={{ color: "#ffffff", fontSize: "15px", whiteSpace: "nowrap" }}>{item.value}{item.unit === "events" && typeof item.value === "number" ? " events" : ""}</strong></div>)}
            </div>
          </div>

          <aside style={{ padding: "20px", border: "1px solid rgba(94, 151, 201, 0.26)", borderRadius: "8px", background: "linear-gradient(180deg, rgba(12, 40, 68, 0.9), rgba(6, 23, 41, 0.92))", display: "grid", gap: "14px" }}>
            <div><div style={{ color: "#8bbef1", fontSize: "10px", letterSpacing: "0.12em", fontWeight: 900, textTransform: "uppercase" }}>Primary Signal</div><strong style={{ color: "#f5f9ff", fontSize: "16px" }}>{finding.drivers[0].replace(/-/g, " ")}</strong></div>
            <div><div style={{ color: "#8bbef1", fontSize: "10px", letterSpacing: "0.12em", fontWeight: 900, textTransform: "uppercase" }}>Comparison Baseline</div><span style={{ color: "#d5e4f5", fontSize: "14px", lineHeight: 1.45 }}>{baseline}</span></div>
            <div><div style={{ color: "#8bbef1", fontSize: "10px", letterSpacing: "0.12em", fontWeight: 900, textTransform: "uppercase" }}>Evidence Coverage</div><strong style={{ color: "#f5f9ff", fontSize: "16px" }}>{finding.coverage.overallCoveragePct}%</strong></div>
            <div><div style={{ color: "#8bbef1", fontSize: "10px", letterSpacing: "0.12em", fontWeight: 900, textTransform: "uppercase" }}>Confidence</div><strong style={{ color: confidence === "High" ? "#6ee7b7" : confidence === "Moderate" ? "#fde68a" : "#fca5a5", fontSize: "16px" }}>{confidence}</strong></div>
            <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(143, 178, 216, 0.16)" }}><div style={{ color: "#8bbef1", fontSize: "10px", letterSpacing: "0.12em", fontWeight: 900, textTransform: "uppercase", marginBottom: "5px" }}>Limitation</div><span style={{ color: "#b9cbe0", fontSize: "12px", lineHeight: 1.5 }}>{finding.limitation}</span></div>
          </aside>
        </section>

        <section style={{ padding: "22px", border: "1px solid rgba(117, 160, 205, 0.2)", borderRadius: "8px", background: "rgba(6, 25, 45, 0.86)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}><h2 style={{ margin: 0, color: "#f3f8ff", fontSize: "18px" }}>Events Driving the Signal</h2><span style={{ color: "#8fa7c0", fontSize: "12px" }}>{finding.supportingEvents.length} supporting events</span></div>
          <div style={{ display: "grid", gap: "8px" }}>
            {visibleEvents.map((event) => <article key={event.id} style={{ padding: "14px", border: "1px solid rgba(121, 163, 207, 0.16)", borderRadius: "7px", background: "rgba(10, 35, 60, 0.68)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "start", flexWrap: "wrap" }}><div><a href={event.website || `/discovery?eventId=${encodeURIComponent(event.id)}`} target={event.website ? "_blank" : undefined} rel={event.website ? "noreferrer" : undefined} style={{ color: "#eaf4ff", fontSize: "15px", fontWeight: 800, textDecoration: "none" }}>{event.title}</a><div style={{ color: "#9eb4cb", fontSize: "13px", marginTop: "4px" }}>{formatDate(event.startDate)} · {[event.city, event.state].filter(Boolean).join(", ") || "Location unavailable"}{event.organizer ? ` · ${event.organizer}` : ""}</div></div>{event.website ? <a href={event.website} target="_blank" rel="noreferrer" style={{ color: "#8cc7ff", fontSize: "12px", fontWeight: 800, textDecoration: "none" }}>Official event ↗</a> : null}</div>
              {event.signals.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>{event.signals.map((signal) => <span key={signal} style={{ padding: "4px 7px", borderRadius: "999px", color: "#bde8ff", border: "1px solid rgba(97, 188, 231, 0.3)", background: "rgba(22, 105, 148, 0.16)", fontSize: "11px", fontWeight: 800 }}>{signalLabels[signal]}</span>)}</div> : null}
            </article>)}
          </div>
          {finding.supportingEvents.length > 5 ? <button type="button" onClick={() => setShowAllEvents((value) => !value)} style={{ marginTop: "14px", border: "1px solid rgba(102, 167, 225, 0.34)", background: "rgba(22, 62, 99, 0.52)", color: "#bfe0ff", borderRadius: "6px", padding: "9px 12px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>{showAllEvents ? "Show fewer events" : "View all supporting events"}</button> : null}
        </section>

        <details style={{ border: "1px solid rgba(117, 160, 205, 0.2)", borderRadius: "8px", background: "rgba(6, 25, 45, 0.76)", padding: "16px 18px", color: "#c7d8e9" }}>
          <summary style={{ cursor: "pointer", color: "#eaf4ff", fontWeight: 850, fontSize: "14px" }}>Methodology &amp; Data Coverage</summary>
          <div style={{ display: "grid", gap: "14px", marginTop: "16px", fontSize: "13px", lineHeight: 1.55 }}>
            <div><strong>Scope:</strong> {finding.scope.population === "full-market" ? "Full Market View" : "Current Filter View"}; {finding.scope.eligibleEventCount} eligible events; comparison population: {finding.scope.comparisonPopulation.label} ({finding.scope.comparisonPopulation.eventCount} events).</div>
            <div><strong>Confidence detail:</strong> High is 80+, Moderate is 55-79, and Low is below 55. The underlying deterministic score is not a probability: field coverage {finding.confidence.components.fieldCoveragePct}, supporting-record adequacy {finding.confidence.components.supportingRecordAdequacyPct}, signal strength {finding.confidence.components.signalStrengthPct}, comparison-population adequacy {finding.confidence.components.comparisonPopulationAdequacyPct}.</div>
            <div><strong>Coverage by required field:</strong> {finding.coverage.requiredFields.map((field) => `${field.field} ${field.coveragePct}% (${field.populatedEventCount}/${field.eligibleEventCount})`).join(" · ")}</div>
            <div><strong>Supporting events:</strong> {finding.supportingEvents.length}. {finding.methodology}</div>
            <div><strong>Limitation:</strong> {finding.limitation}</div>
          </div>
        </details>
      </div>
    </div>
  );
}
