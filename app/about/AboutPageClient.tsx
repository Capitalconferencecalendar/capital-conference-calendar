import Link from "next/link";
import AppShell from "../components/AppShell";

type IconKind = "radar" | "calendar" | "network" | "building";

function PageIcon({ kind, color }: { kind: IconKind; color: string }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {kind === "radar" ? (
        <>
          <circle cx="12" cy="12" r="8" {...common} />
          <circle cx="12" cy="12" r="3" {...common} />
          <path d="M12 12l6-6" {...common} />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2" {...common} />
        </>
      ) : kind === "calendar" ? (
        <>
          <rect x="4" y="5" width="16" height="15" rx="3" {...common} />
          <path d="M8 3v4M16 3v4M4 10h16" {...common} />
          <path d="M8 14h3M13 14h3M8 17h2" {...common} />
        </>
      ) : kind === "building" ? (
        <>
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" {...common} />
          <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1M3 21h18" {...common} />
        </>
      ) : (
        <>
          <circle cx="7" cy="8" r="3" {...common} />
          <circle cx="17" cy="8" r="3" {...common} />
          <circle cx="12" cy="17" r="3" {...common} />
          <path d="M9.5 10.5l1.5 4M14.5 10.5l-1.5 4" {...common} />
        </>
      )}
    </svg>
  );
}

function FeatureCard({
  title,
  copy,
  icon,
  accent,
}: {
  title: string;
  copy: string;
  icon: IconKind;
  accent: string;
}) {
  return (
    <div
      className="ccc-about-feature"
      style={{
        minHeight: "174px",
        borderRadius: "20px",
        background:
          "linear-gradient(180deg, rgba(8,31,55,0.92), rgba(4,14,32,0.96))",
        border: "1px solid rgba(107,157,210,0.2)",
        padding: "18px",
        boxShadow: "0 18px 36px rgba(0,0,0,0.18)",
        display: "grid",
        alignContent: "start",
        gap: "12px",
      }}
    >
      <span
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "15px",
          background:
            "linear-gradient(180deg, rgba(80,120,255,0.24), rgba(28,48,110,0.16))",
          border: "1px solid rgba(160,200,255,0.18)",
          boxShadow: `0 0 24px ${accent}28`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PageIcon kind={icon} color={accent} />
      </span>
      <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900 }}>
        {title}
      </div>
      <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.5 }}>
        {copy}
      </div>
    </div>
  );
}

export default function AboutPageClient() {
  return (
    <AppShell active="about">
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "26px 10px 72px",
          display: "grid",
          gap: "22px",
        }}
      >
        <section
          className="ccc-about-hero"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
            gap: "26px",
            alignItems: "center",
            padding: "30px",
            borderRadius: "28px",
            background:
              "radial-gradient(circle at 16% 0%, rgba(59,130,246,0.2), transparent 38%), radial-gradient(circle at 84% 18%, rgba(45,212,191,0.09), transparent 30%), linear-gradient(135deg, rgba(8,31,55,0.97), rgba(5,20,36,0.99))",
            border: "1px solid rgba(107,157,210,0.24)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.26)",
            overflow: "hidden",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "12px" }}>
              About Capital Conference Database
            </div>
            <h1 style={{ margin: 0, color: "#ffffff", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.98, fontWeight: 950, letterSpacing: "-0.045em", maxWidth: "780px" }}>
              Conference intelligence for capital markets teams.
            </h1>
            <p style={{ margin: "18px 0 0", color: "#d9e8fb", fontSize: "19px", lineHeight: 1.42, fontWeight: 650, maxWidth: "780px" }}>
              Capital Conference Database is building a structured view of
              capital markets conferences, investor events, roadshows, and
              market activity.
            </p>
            <p style={{ margin: "12px 0 0", color: "#a9bfd8", fontSize: "15px", lineHeight: 1.55, maxWidth: "760px" }}>
              The platform helps market participants identify relevant events,
              understand where attention is building, and plan coverage around
              conferences that may matter for relationships, capital access, and
              investment strategy.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
              <Link href="/" style={{ height: "44px", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", display: "inline-flex", alignItems: "center", textDecoration: "none", fontSize: "14px", fontWeight: 900 }}>
                Request Beta Access
              </Link>
              <Link href="/submit" style={{ height: "44px", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(120,150,190,0.32)", background: "rgba(255,255,255,0.08)", color: "#dbeafe", display: "inline-flex", alignItems: "center", textDecoration: "none", fontSize: "14px", fontWeight: 900 }}>
                Submit a Conference
              </Link>
            </div>
          </div>

          <div style={{ background: "linear-gradient(180deg, rgba(10,24,52,0.96), rgba(4,14,34,0.98))", border: "1px solid rgba(130,180,255,0.16)", borderRadius: "24px", padding: "18px", boxShadow: "0 20px 50px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#dce9fb", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>
              What we are building
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { label: "Live index", note: "A cleaner way to track the conference landscape.", icon: "calendar" as const, accent: "#63A4FF" },
                { label: "Market signals", note: "Context around access, activity, focus, and timing.", icon: "radar" as const, accent: "#FFB357" },
                { label: "Workflow layer", note: "Designed for coverage planning and relationship strategy.", icon: "network" as const, accent: "#4EE3C1" },
              ].map((item) => (
                <div key={item.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", alignItems: "center" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(80,120,255,0.24), rgba(28,48,110,0.16))", border: "1px solid rgba(160,200,255,0.18)", boxShadow: `0 0 24px ${item.accent}24`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <PageIcon kind={item.icon} color={item.accent} />
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

        <section>
          <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
            Platform focus
          </div>
          <h2 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: "30px", lineHeight: 1.1 }}>
            Built around how capital markets teams evaluate the calendar.
          </h2>
          <p style={{ margin: "0 0 16px", color: "#c8d8ec", fontSize: "15px", lineHeight: 1.55, maxWidth: "900px" }}>
            Conference activity is fragmented across organizer sites, sponsor
            pages, investor calendars, and one-off announcements. Capital
            Conference Database brings that activity into a more usable
            intelligence layer.
          </p>
          <div className="ccc-about-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
            <FeatureCard title="Market Intelligence" copy="See capital markets conference activity through an intelligence lens, not scattered lists, emails, and one-off searches." icon="radar" accent="#63A4FF" />
            <FeatureCard title="Coverage Planning" copy="Prioritize conferences, relationships, and timing windows before the calendar fills up." icon="calendar" accent="#FFB357" />
            <FeatureCard title="Institutional Workflows" copy="Designed for investor relations, banking, advisory, sponsor, service provider, and capital markets teams." icon="building" accent="#A77DFF" />
          </div>
        </section>

        <section style={{ borderRadius: "22px", background: "linear-gradient(180deg, rgba(8,31,55,0.9), rgba(4,14,32,0.96))", border: "1px solid rgba(107,157,210,0.2)", padding: "22px", display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)", gap: "20px" }}>
          <div>
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
              Private beta
            </div>
            <h2 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: "28px", lineHeight: 1.12 }}>
              Shaped with market participants.
            </h2>
            <p style={{ margin: 0, color: "#c8d8ec", fontSize: "15px", lineHeight: 1.55 }}>
              Beta access is being reserved for users who can help evaluate how
              conference intelligence supports capital access, coverage planning,
              relationship strategy, and market signal identification.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignContent: "start" }}>
            {[
              "Investor Relations Leaders",
              "Public Company Executives",
              "Private Company Executives",
              "Investment Bankers",
              "Capital Markets Advisors",
              "Corporate Access Teams",
              "Conference Organizers",
              "Sponsors & Service Providers",
              "Institutional Investors",
            ].map((label, index) => (
              <span key={label} style={{ height: "36px", padding: "0 14px", borderRadius: "999px", background: index % 2 === 0 ? "rgba(8,22,48,0.82)" : "rgba(11,30,60,0.82)", border: "1px solid rgba(96,165,250,0.35)", color: "#e6f0ff", fontSize: "12px", fontWeight: 760, display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 18px rgba(59,130,246,0.08)" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: index % 3 === 0 ? "#63A4FF" : index % 3 === 1 ? "#FFB357" : "#4EE3C1" }} />
                {label}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
