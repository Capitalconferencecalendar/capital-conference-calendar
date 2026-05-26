import Link from "next/link";
import AppShell from "../components/AppShell";

function FeatureCard({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        padding: "14px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        transition: "transform 140ms ease, box-shadow 140ms ease",
      }}
      className="ccc-about-feature"
    >
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
        {title}
      </div>
      <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>{copy}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <AppShell active="about">
      <div style={{ display: "grid", gap: "14px" }}>
        <section
          className="ccc-about-hero"
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            padding: "18px",
            display: "grid",
            gridTemplateColumns: "1.15fr minmax(300px, 0.85fr)",
            gap: "16px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "42px", lineHeight: 1.05, color: "#0f172a" }}>
              Capital Conference Calendar
            </h1>
            <p style={{ margin: "0 0 10px 0", fontSize: "18px", lineHeight: 1.55, color: "#334155" }}>
              A centralized intelligence platform for capital markets conferences,
              investor events, and market activity across North America.
            </p>
            <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: "#475569" }}>
              Capital Conference Calendar helps investors, public companies,
              investor relations professionals, and capital markets teams monitor
              upcoming conferences, track market activity, and maintain live
              conference calendars.
            </p>
          </div>
          <div
            style={{
              border: "1px solid #d7dde5",
              borderRadius: "12px",
              backgroundColor: "#fbfdff",
              padding: "12px",
              display: "grid",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f3d75", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Market Activity Snapshot
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
              {[
                ["148", "Events In View"],
                ["52", "Active Cities"],
                ["4", "Hot Weeks"],
                ["12", "Clusters"],
              ].map(([value, label], index) => (
                <div key={`${label}-${index}`} style={{ border: "1px solid #dbe4ee", borderRadius: "8px", backgroundColor: "#ffffff", padding: "8px" }}>
                  <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>{value}</div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ border: "1px solid #dbe4ee", borderRadius: "8px", backgroundColor: "#ffffff", padding: "9px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "7px" }}>Upcoming Event Concentration</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "6px", alignItems: "end" }}>
                {[20, 28, 18, 35, 24, 30].map((h, i) => (
                  <div key={i} style={{ height: `${h}px`, borderRadius: "5px", backgroundColor: i === 3 ? "#0f3d75" : "#bfd3ea" }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ border: "1px solid #d7dde5", borderRadius: "14px", backgroundColor: "#ffffff", padding: "16px", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", color: "#0f172a" }}>Built for Capital Markets Workflows</h2>
          <p style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#475569", lineHeight: 1.65 }}>
            Capital Conference Calendar was designed to simplify conference
            discovery and market tracking across the fragmented capital markets
            event ecosystem. The platform aggregates conference information from
            public sources and organizes it into structured, searchable market views.
          </p>
          <div className="ccc-about-alt" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ border: "1px solid #dbe4ee", borderRadius: "10px", padding: "12px", backgroundColor: "#fbfdff" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "7px" }}>Core workflows</div>
              <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
                {[
                  "discover upcoming conferences",
                  "identify conference clusters",
                  "monitor active market weeks",
                  "filter by geography, sector, and organizer",
                  "create live calendar subscriptions",
                  "maintain continuously updating conference workflows",
                ].map((item) => (
                  <li key={item} style={{ fontSize: "14px", color: "#334155", lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>
            <div style={{ border: "1px solid #dbe4ee", borderRadius: "10px", backgroundColor: "#ffffff", padding: "12px", display: "grid", gap: "7px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Market View Builder</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px" }}>
                {["Category", "Issuer Participation", "Sector / Themes", "Market Focus", "Country", "Region"].map((f) => (
                  <div key={f} style={{ border: "1px solid #dbe4ee", borderRadius: "6px", padding: "6px", fontSize: "11px", color: "#64748b" }}>{f}</div>
                ))}
              </div>
              <button style={{ marginTop: "6px", width: "fit-content", border: "1px solid #0f2d4f", backgroundColor: "#0f2d4f", color: "#ffffff", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", fontWeight: 700 }}>
                Copy Live Calendar Link
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "28px", color: "#0f172a" }}>What Makes CCC Different</h2>
          <div className="ccc-about-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
            <FeatureCard title="Market Intelligence" copy="Track conference density, active cities, and event clusters across the market calendar." />
            <FeatureCard title="Live Calendar Feeds" copy="Turn filtered conference views into continuously updating calendar subscriptions." />
            <FeatureCard title="Institutional Workflow Design" copy="Built for investors, IR professionals, public companies, and capital markets teams." />
          </div>
        </section>

        <section style={{ border: "1px solid #d7dde5", borderRadius: "14px", backgroundColor: "#ffffff", padding: "16px", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", color: "#0f172a" }}>Conference Coverage</h2>
          <p style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#475569", lineHeight: 1.6 }}>
            Capital Conference Calendar tracks:
          </p>
          <div className="ccc-about-alt" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
              {[
                "investor conferences",
                "capital markets events",
                "industry conferences",
                "roadshows",
                "investor access events",
                "public company events",
                "private market gatherings",
              ].map((item) => (
                <li key={item} style={{ fontSize: "14px", color: "#334155", lineHeight: 1.5 }}>{item}</li>
              ))}
            </ul>
            <div style={{ border: "1px solid #dbe4ee", borderRadius: "10px", padding: "12px", backgroundColor: "#fbfdff" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "7px" }}>Geographic Coverage</div>
              <div style={{ display: "grid", gap: "7px" }}>
                {[
                  ["United States", 78],
                  ["Canada", 22],
                ].map(([label, pct], index) => (
                  <div key={`${label}-${index}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#334155", marginBottom: "4px" }}>
                      <span>{label}</span><span>{pct}%</span>
                    </div>
                    <div style={{ height: "7px", borderRadius: "999px", backgroundColor: "#e5ebf2" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "999px", backgroundColor: "#0f3d75" }} />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
                Coverage continues expanding over time through ongoing research and community submissions.
              </p>
            </div>
          </div>
        </section>

        <section style={{ border: "1px solid #cfe0f1", borderRadius: "12px", backgroundColor: "#ffffff", padding: "14px" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#0f172a" }}>Contact</h2>
          <div style={{ fontSize: "15px", color: "#334155", lineHeight: 1.6 }}>
            General inquiries: <a href="mailto:info@capitalconferencecalendar.com" style={{ color: "#0f3d75", textDecoration: "none" }}>info@capitalconferencecalendar.com</a>
            <br />
            Conference submissions: <Link href="/submit" style={{ color: "#0f3d75", textDecoration: "none" }}>Use the Submit Conference page</Link>
          </div>
        </section>

        <section style={{ border: "1px solid #d7dde5", borderRadius: "14px", backgroundColor: "#ffffff", padding: "16px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "32px", color: "#0f172a" }}>Build Your Live Conference Calendar</h2>
          <p style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#475569", lineHeight: 1.6 }}>
            Create personalized conference feeds and stay connected to the market calendar.
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/events#calendar-feed" style={{ textDecoration: "none", height: "40px", display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "10px", border: "1px solid #0f2d4f", backgroundColor: "#0f2d4f", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
              Open Calendar Feed Builder
            </Link>
            <Link href="/submit" style={{ textDecoration: "none", height: "40px", display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "10px", border: "1px solid #d7dde5", backgroundColor: "#ffffff", color: "#334155", fontSize: "14px", fontWeight: 700 }}>
              Submit a Conference
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
