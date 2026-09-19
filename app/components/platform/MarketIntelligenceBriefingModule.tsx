import type { IntelligenceFinding } from "../../../lib/marketIntelligenceV2";

function confidenceLabel(score: number) {
  if (score >= 80) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}

function evidenceValue(finding: IntelligenceFinding, label: string) {
  return finding.evidence.find((item) => item.label === label)?.value ?? "—";
}

export default function MarketIntelligenceBriefingModule({ finding }: { finding: IntelligenceFinding }) {
  const eventCount = evidenceValue(finding, "Approved upcoming events");
  const issuerAccess = evidenceValue(finding, "Issuer-access events");
  const oneOnOne = evidenceValue(finding, "Confirmed 1x1 meeting events");
  const baseline = finding.comparison.baselineValue;
  const baselineMultiple = typeof eventCount === "number" && typeof baseline === "number" && baseline > 0
    ? `${(eventCount / baseline).toFixed(1)}x`
    : "—";
  const confidence = confidenceLabel(finding.confidence.score);

  return (
    <section className="v3-section" aria-labelledby="weekly-market-briefing">
      <div style={{ padding: "20px 22px", border: "1px solid rgba(88, 164, 220, 0.3)", borderRadius: "10px", background: "linear-gradient(135deg, rgba(10, 39, 68, 0.98), rgba(5, 20, 36, 0.98))", boxShadow: "0 16px 34px rgba(0,0,0,.18)" }}>
        <div className="v3-eyebrow">This Week in Conference Markets</div>
        <h2 id="weekly-market-briefing" style={{ margin: "7px 0 8px", color: "#f8fbff", fontSize: "26px", lineHeight: 1.16 }}>{finding.headline}</h2>
        <p style={{ margin: 0, maxWidth: "900px", color: "#cbdced", fontSize: "14px", lineHeight: 1.55 }}>{finding.finding}</p>

        <div style={{ marginTop: "15px", paddingTop: "13px", borderTop: "1px solid rgba(137, 180, 223, 0.16)" }}>
          <div className="v3-detail-label">Why This Matters</div>
          <p style={{ margin: "5px 0 0", color: "#d7e6f5", fontSize: "13px", lineHeight: 1.5 }}>{finding.whyItMatters}</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "15px" }}>
          {[
            [eventCount, "events"],
            [issuerAccess, "issuer access"],
            [oneOnOne, "1x1"],
            [baselineMultiple, "nearby-week baseline"],
          ].map(([value, label]) => <span key={String(label)} style={{ padding: "7px 9px", borderRadius: "6px", border: "1px solid rgba(105, 177, 229, 0.24)", background: "rgba(23, 78, 120, 0.22)", color: "#d6e9fa", fontSize: "12px" }}><strong style={{ color: "#fff" }}>{value}</strong> {label}</span>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "16px", alignItems: "end", marginTop: "15px", paddingTop: "13px", borderTop: "1px solid rgba(137, 180, 223, 0.16)" }}>
          <div>
            <div className="v3-detail-label">Top Supporting Events</div>
            <div style={{ display: "grid", gap: "4px", marginTop: "6px" }}>
              {finding.supportingEvents.slice(0, 3).map((event) => <div key={event.id} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "7px", alignItems: "baseline", color: "#b8ccdf", fontSize: "13px" }}><span style={{ color: "#7dbcf0" }}>•</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span></div>)}
            </div>
            <div style={{ color: "#a9c2d9", fontSize: "12px", marginTop: "10px" }}>Confidence: <strong style={{ color: confidence === "High" ? "#6ee7b7" : confidence === "Moderate" ? "#fde68a" : "#fca5a5" }}>{confidence}</strong> · Coverage: {finding.coverage.overallCoveragePct}%</div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <a href="/market-view-v2" className="v3-link" style={{ margin: 0 }}>View Full Brief →</a>
            <a href="/market-view-v2#evidence" className="v3-link" style={{ margin: 0 }}>View Evidence →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
