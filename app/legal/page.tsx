import AppShell from "../components/AppShell";

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
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        padding: "14px",
      }}
    >
      <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#0f172a" }}>{title}</h2>
      <div style={{ fontSize: "15px", color: "#475569", lineHeight: 1.65 }}>{children}</div>
    </section>
  );
}

export default function LegalPage() {
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
    <AppShell active="legal">
      <div style={{ display: "grid", gap: "14px" }}>
        <section
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            padding: "16px",
          }}
        >
          <h1 style={{ margin: "0 0 8px 0", fontSize: "40px", lineHeight: 1.08, color: "#0f172a" }}>
            Legal & Information Disclaimer
          </h1>
          <p style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#475569", lineHeight: 1.65, maxWidth: "980px" }}>
            Capital Conference Calendar aggregates conference information from
            public and third-party sources. Users should independently verify all
            conference details directly with event organizers before making
            travel, lodging, registration, or business decisions.
          </p>
          <div style={{ border: "1px solid #fde68a", backgroundColor: "#fffbeb", borderRadius: "10px", padding: "10px", fontSize: "14px", color: "#92400e" }}>
            Conference schedules, locations, speakers, and registration details can change without notice.
          </div>
        </section>

        <div className="ccc-legal-layout" style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: "14px", alignItems: "start" }}>
          <aside style={{ position: "sticky", top: "86px", alignSelf: "start" }}>
            <div style={{ border: "1px solid #d7dde5", borderRadius: "12px", backgroundColor: "#ffffff", padding: "12px", display: "grid", gap: "8px" }}>
              <div style={{ fontSize: "11px", color: "#667085", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>On This Page</div>
              {nav.map(([id, label]) => (
                <a key={id} href={`#${id}`} style={{ textDecoration: "none", color: "#334155", fontSize: "14px", lineHeight: 1.4 }}>
                  {label}
                </a>
              ))}
            </div>
          </aside>

          <div style={{ display: "grid", gap: "12px" }}>
            <section
              id="notice"
              style={{
                border: "1px solid #f5d38a",
                backgroundColor: "#fffaf0",
                borderRadius: "12px",
                padding: "14px",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#7c2d12" }}>Always Verify Event Information</h2>
              <p style={{ margin: "0 0 8px 0", fontSize: "15px", color: "#92400e", lineHeight: 1.65 }}>
                Conference schedules, locations, speakers, registration details,
                and event formats can change without notice.
              </p>
              <p style={{ margin: "0 0 8px 0", fontSize: "15px", color: "#92400e", lineHeight: 1.65 }}>
                Before booking flights, hotels, transportation, conference
                registration, or meetings, users should confirm all event details
                directly through the official conference website or organizer.
              </p>
              <p style={{ margin: 0, fontSize: "15px", color: "#92400e", lineHeight: 1.65 }}>
                Capital Conference Calendar is an informational aggregation
                platform and does not guarantee the accuracy, completeness, or
                timeliness of event information.
              </p>
            </section>

            <LegalSection id="sources" title="Information Sources">
              Conference information displayed on Capital Conference Calendar may
              be collected from public conference websites, organizer
              announcements, press releases, public filings, marketing materials,
              third-party sources, and community submissions. While we attempt to
              maintain accurate and current information, conference details may
              change, become outdated, or contain errors.
            </LegalSection>

            <LegalSection id="accuracy" title="No Guarantee of Accuracy">
              Capital Conference Calendar makes no representations or warranties
              regarding event accuracy, event timing, conference availability,
              registration status, speaker participation, venue information,
              livestream availability, sponsorship participation, or meeting
              access. Users assume full responsibility for independently
              verifying all conference information before taking action.
            </LegalSection>

            <LegalSection id="advice" title="No Financial Advice">
              Capital Conference Calendar does not provide investment advice,
              securities recommendations, financial analysis, trading guidance,
              or investment solicitation. Conference listings do not imply
              endorsement, recommendation, or evaluation of any company,
              organizer, investment opportunity, or security.
            </LegalSection>

            <LegalSection id="third-party" title="Third-Party Websites">
              The platform may contain links to third-party conference websites
              and external resources. Capital Conference Calendar is not
              responsible for third-party content, registration systems, payment
              processing, website availability, external privacy practices, or
              event organizer conduct.
            </LegalSection>

            <LegalSection id="liability" title="Limitation of Liability">
              To the maximum extent permitted by law, Capital Conference Calendar
              shall not be liable for travel expenses, hotel expenses,
              registration fees, business interruption, missed meetings, lost
              opportunities, scheduling conflicts, event cancellations, event
              modifications, or reliance on displayed information. Use of the
              platform is at the user’s own discretion and risk.
            </LegalSection>

            <LegalSection id="contact" title="Contact">
              Questions regarding this page may be directed to{" "}
              <a href="mailto:info@capitalconferencecalendar.com" style={{ color: "#0f3d75", textDecoration: "none" }}>
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
