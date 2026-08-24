import Link from "next/link";
import AppShell from "../components/AppShell";

type ContactIconKind = "mail" | "submit" | "beta";

function ContactIcon({
  kind,
  color = "#63A4FF",
}: {
  kind: ContactIconKind;
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
      ) : kind === "beta" ? (
        <>
          <path d="M12 3v18M6 7h8a4 4 0 0 1 0 8H6" {...common} />
          <path d="M14 15a4 4 0 0 1 0 6H6" {...common} />
        </>
      ) : (
        <>
          <path d="M5 12h14" {...common} />
          <path d="M13 6l6 6-6 6" {...common} />
          <path d="M5 5h6M5 19h6" {...common} />
        </>
      )}
    </svg>
  );
}

export default function ContactPage() {
  return (
    <AppShell active="help">
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
              "radial-gradient(circle at 16% 0%, rgba(59,130,246,0.2), transparent 38%), radial-gradient(circle at 84% 18%, rgba(45,212,191,0.1), transparent 30%), linear-gradient(135deg, rgba(8,31,55,0.97), rgba(5,20,36,0.99))",
            border: "1px solid rgba(107,157,210,0.24)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.26)",
            overflow: "hidden",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "12px" }}>
              Contact
            </div>
            <h1 style={{ margin: 0, color: "#ffffff", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.98, fontWeight: 950, letterSpacing: "-0.045em", maxWidth: "780px" }}>
              Contact Capital Conference Database.
            </h1>
            <p style={{ margin: "18px 0 0", color: "#d9e8fb", fontSize: "19px", lineHeight: 1.42, fontWeight: 650, maxWidth: "760px" }}>
              Reach the team for beta access, conference submissions,
              partnership conversations, and platform questions.
            </p>
            <p style={{ margin: "12px 0 0", color: "#a9bfd8", fontSize: "15px", lineHeight: 1.55, maxWidth: "760px" }}>
              We are speaking with select market participants as the platform
              develops. If your question is about a conference, include the
              event name or website so we can route it cleanly.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
              <a
                href="mailto:info@capitalconferencecalendar.com"
                style={{
                  height: "44px",
                  padding: "0 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(96,165,250,0.45)",
                  background: "linear-gradient(180deg, #3b82f6, #2563eb)",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 900,
                }}
              >
                Email the Team
              </a>
              <Link
                href="/#request-access"
                style={{
                  height: "44px",
                  padding: "0 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(120,150,190,0.32)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#dbeafe",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 900,
                }}
              >
                Request Beta Access
              </Link>
            </div>
          </div>

          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(10,24,52,0.96), rgba(4,14,34,0.98))",
              border: "1px solid rgba(130,180,255,0.16)",
              borderRadius: "24px",
              padding: "18px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ color: "#dce9fb", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>
              Contact paths
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { label: "General inquiries", note: "Platform questions, partnerships, and support.", kind: "mail" as const, accent: "#63A4FF" },
                { label: "Conference submissions", note: "Share an event for potential inclusion.", kind: "submit" as const, accent: "#FFB357" },
                { label: "Beta access", note: "Request access as an early market participant.", kind: "beta" as const, accent: "#4EE3C1" },
              ].map((item) => (
                <div key={item.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", alignItems: "center" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(80,120,255,0.24), rgba(28,48,110,0.16))", border: "1px solid rgba(160,200,255,0.18)", boxShadow: `0 0 24px ${item.accent}24`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <ContactIcon kind={item.kind} color={item.accent} />
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

        <section
          style={{
            background:
              "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))",
            border: "1px solid rgba(107,157,210,0.24)",
            borderRadius: "22px",
            padding: "24px",
            boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
            display: "grid",
            gap: "16px",
          }}
        >
          <div style={{ color: "#ffffff", fontSize: "26px", lineHeight: 1.1, fontWeight: 900 }}>
            Get in touch
          </div>
          <div style={{ fontSize: "15px", color: "#c8d8ec", lineHeight: 1.6, maxWidth: "820px" }}>
            The best way to reach us is by email. For conference submissions,
            use the Submit page so the event website and context are captured
            together.
          </div>
          <div
            style={{
              border: "1px solid rgba(120,160,255,0.22)",
              borderRadius: "16px",
              background: "rgba(8,22,48,0.72)",
              padding: "16px",
              display: "grid",
              gap: "6px",
            }}
          >
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Email
            </div>
            <a href="mailto:info@capitalconferencecalendar.com" style={{ color: "#ffffff", textDecoration: "none", fontSize: "22px", fontWeight: 900, lineHeight: 1.2 }}>
              info@capitalconferencecalendar.com
            </a>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/#request-access" style={{ textDecoration: "none", height: "44px", display: "inline-flex", alignItems: "center", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", fontSize: "14px", fontWeight: 900 }}>
              Request Beta Access
            </Link>
            <Link href="/submit" style={{ textDecoration: "none", height: "44px", display: "inline-flex", alignItems: "center", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(120,150,190,0.32)", background: "rgba(255,255,255,0.08)", color: "#dbeafe", fontSize: "14px", fontWeight: 900 }}>
              Submit a Conference
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
