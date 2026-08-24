import AppShell from "../components/AppShell";
import type { PublicTickerEvent } from "../../lib/publicTickerEvents";

type LegalIconKind = "notice" | "source" | "shield";

function LegalIcon({
  kind,
  color = "#63A4FF",
}: {
  kind: LegalIconKind;
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
      {kind === "notice" ? (
        <>
          <path d="M12 3 3 20h18L12 3Z" {...common} />
          <path d="M12 9v5M12 17h.01" {...common} />
        </>
      ) : kind === "source" ? (
        <>
          <path d="M5 4h14v16H5z" {...common} />
          <path d="M8 8h8M8 12h8M8 16h5" {...common} />
        </>
      ) : (
        <>
          <path d="M12 3 5 6v6c0 5 3.4 8.3 7 9 3.6-.7 7-4 7-9V6l-7-3Z" {...common} />
          <path d="M9 12h6" {...common} />
        </>
      )}
    </svg>
  );
}

function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        background:
          "linear-gradient(180deg, rgba(8,31,55,0.86), rgba(5,20,36,0.94))",
        border: "1px solid rgba(107,157,210,0.2)",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 14px 30px rgba(0,0,0,0.14)",
      }}
    >
      <h2 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: "22px", lineHeight: 1.15 }}>
        {title}
      </h2>
      <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.65 }}>
        {children}
      </div>
    </section>
  );
}

export default function LegalPageClient({
  tickerEvents,
}: {
  tickerEvents?: PublicTickerEvent[];
}) {
  const nav = [
    ["notice", "Important Notice"],
    ["sources", "Information Sources"],
    ["accuracy", "No Guarantee of Accuracy"],
    ["advice", "No Financial Advice"],
    ["third-party", "Third-Party Websites"],
    ["liability", "Limitation of Liability"],
    ["contact", "Contact"],
  ] as const;

  return (
    <AppShell active="legal" tickerEvents={tickerEvents}>
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "26px 10px 72px", display: "grid", gap: "22px" }}>
        <section className="ccc-about-hero" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: "26px", alignItems: "center", padding: "30px", borderRadius: "28px", background: "radial-gradient(circle at 16% 0%, rgba(59,130,246,0.2), transparent 38%), radial-gradient(circle at 84% 18%, rgba(245,158,11,0.12), transparent 30%), linear-gradient(135deg, rgba(8,31,55,0.97), rgba(5,20,36,0.99))", border: "1px solid rgba(107,157,210,0.24)", boxShadow: "0 24px 60px rgba(0,0,0,0.26)", overflow: "hidden" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "12px" }}>
              Legal
            </div>
            <h1 style={{ margin: 0, color: "#ffffff", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.98, fontWeight: 950, letterSpacing: "-0.045em", maxWidth: "760px" }}>
              Legal & information disclaimer.
            </h1>
            <p style={{ margin: "18px 0 0", color: "#d9e8fb", fontSize: "19px", lineHeight: 1.42, fontWeight: 650, maxWidth: "760px" }}>
              Capital Conference Database aggregates conference information from public and third-party sources.
            </p>
            <p style={{ margin: "12px 0 0", color: "#a9bfd8", fontSize: "15px", lineHeight: 1.55, maxWidth: "760px" }}>
              Users should independently verify conference details directly with event organizers before making travel, registration, business, or investment-related decisions.
            </p>
          </div>

          <div style={{ background: "linear-gradient(180deg, rgba(10,24,52,0.96), rgba(4,14,34,0.98))", border: "1px solid rgba(130,180,255,0.16)", borderRadius: "24px", padding: "18px", boxShadow: "0 20px 50px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#dce9fb", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>
              Key reminders
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { label: "Verify details", note: "Dates, venues, formats, and registration details may change.", kind: "notice" as const, accent: "#FFB357" },
                { label: "Source limitations", note: "Information may come from public, organizer, third-party, or community sources.", kind: "source" as const, accent: "#63A4FF" },
                { label: "No advice", note: "Conference listings are informational and are not financial advice.", kind: "shield" as const, accent: "#4EE3C1" },
              ].map((item) => (
                <div key={item.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", alignItems: "center" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(80,120,255,0.24), rgba(28,48,110,0.16))", border: "1px solid rgba(160,200,255,0.18)", boxShadow: `0 0 24px ${item.accent}24`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <LegalIcon kind={item.kind} color={item.accent} />
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

        <div className="ccc-legal-layout" style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: "18px", alignItems: "start" }}>
          <aside style={{ position: "sticky", top: "124px", alignSelf: "start" }}>
            <div style={{ border: "1px solid rgba(107,157,210,0.22)", borderRadius: "18px", background: "rgba(8,31,55,0.82)", padding: "16px", display: "grid", gap: "10px" }}>
              <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                On this page
              </div>
              {nav.map(([id, label]) => (
                <a key={id} href={`#${id}`} style={{ textDecoration: "none", color: "#dbeafe", fontSize: "13px", lineHeight: 1.4 }}>
                  {label}
                </a>
              ))}
            </div>
          </aside>

          <div style={{ display: "grid", gap: "14px" }}>
            <section id="notice" style={{ border: "1px solid rgba(245,158,11,0.34)", background: "linear-gradient(180deg, rgba(82,48,8,0.42), rgba(8,31,55,0.88))", borderRadius: "18px", padding: "18px", boxShadow: "0 14px 30px rgba(0,0,0,0.16)" }}>
              <h2 style={{ margin: "0 0 8px", color: "#fff7ed", fontSize: "22px", lineHeight: 1.15 }}>
                Always verify event information
              </h2>
              <p style={{ margin: "0 0 8px", color: "#fde68a", fontSize: "14.5px", lineHeight: 1.65 }}>
                Conference schedules, locations, speakers, registration details, and event formats can change without notice.
              </p>
              <p style={{ margin: 0, color: "#f8d7a0", fontSize: "14.5px", lineHeight: 1.65 }}>
                Before booking flights, hotels, transportation, registration, or meetings, users should confirm all event details through the official conference website or organizer.
              </p>
            </section>

            <LegalSection id="sources" title="Information Sources">
              Conference information displayed on Capital Conference Database may be collected from public conference websites, organizer announcements, press releases, public filings, marketing materials, third-party sources, and community submissions. While we attempt to maintain accurate and current information, conference details may change, become outdated, or contain errors.
            </LegalSection>
            <LegalSection id="accuracy" title="No Guarantee of Accuracy">
              Capital Conference Database makes no representations or warranties regarding event accuracy, event timing, conference availability, registration status, speaker participation, venue information, livestream availability, sponsorship participation, or meeting access. Users assume full responsibility for independently verifying all conference information before taking action.
            </LegalSection>
            <LegalSection id="advice" title="No Financial Advice">
              Capital Conference Database does not provide investment advice, securities recommendations, financial analysis, trading guidance, or investment solicitation. Conference listings do not imply endorsement, recommendation, or evaluation of any company, organizer, investment opportunity, or security.
            </LegalSection>
            <LegalSection id="third-party" title="Third-Party Websites">
              The platform may contain links to third-party conference websites and external resources. Capital Conference Database is not responsible for third-party content, registration systems, payment processing, website availability, external privacy practices, or event organizer conduct.
            </LegalSection>
            <LegalSection id="liability" title="Limitation of Liability">
              To the maximum extent permitted by law, Capital Conference Database shall not be liable for travel expenses, hotel expenses, registration fees, business interruption, missed meetings, lost opportunities, scheduling conflicts, event cancellations, event modifications, or reliance on displayed information. Use of the platform is at the user&apos;s own discretion and risk.
            </LegalSection>
            <LegalSection id="contact" title="Contact">
              Questions regarding this page may be directed to{" "}
              <a href="mailto:info@capitalconferencecalendar.com" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 800 }}>
                info@capitalconferencecalendar.com
              </a>
              .
            </LegalSection>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
