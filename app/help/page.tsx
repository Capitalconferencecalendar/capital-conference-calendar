import Link from "next/link";
import AppShell from "../components/AppShell";

const setupGuides = [
  {
    href: "/help/google-calendar",
    title: "Google Calendar Setup",
    copy: "Subscribe by URL and keep your filtered conference view updating automatically.",
    accent: "#1a73e8",
  },
  {
    href: "/help/apple-calendar",
    title: "Apple Calendar Setup",
    copy: "Create a calendar subscription and control refresh settings from Apple Calendar.",
    accent: "#6b7280",
  },
  {
    href: "/help/outlook-calendar",
    title: "Outlook Calendar Setup",
    copy: "Add an internet calendar subscription for ongoing conference updates.",
    accent: "#0a66c2",
  },
];

export default function HelpPage() {
  return (
    <AppShell active="help">
      <div style={{ display: "grid", gap: "14px" }}>
        <section
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            padding: "18px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#667085", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
            Help Center
          </div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "36px", lineHeight: 1.1, color: "#0f172a" }}>
            Setup Guides & Platform Policies
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "900px" }}>
            Find onboarding guides for calendar subscriptions, legal disclosures,
            and conference submission support.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "26px", color: "#0f172a" }}>
            Calendar Setup Guides
          </h2>
          <div className="ccc-about-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
            {setupGuides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                style={{
                  textDecoration: "none",
                  border: "1px solid #d7dde5",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  padding: "14px",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <span style={{ width: "12px", height: "12px", borderRadius: "999px", backgroundColor: guide.accent }} />
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{guide.title}</span>
                <span style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>{guide.copy}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f3d75" }}>Open Guide</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="ccc-about-alt" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Link
            href="/legal"
            style={{
              textDecoration: "none",
              border: "1px solid #d7dde5",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              padding: "14px",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              display: "grid",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>Legal & Information Disclaimer</span>
            <span style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>
              Review verification expectations, information-source limits, and platform liability notes.
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f3d75" }}>Open Legal Page</span>
          </Link>

          <Link
            href="/submit"
            style={{
              textDecoration: "none",
              border: "1px solid #d7dde5",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              padding: "14px",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              display: "grid",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>Submit a Conference</span>
            <span style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>
              Share conference URLs to help expand coverage across investor and capital markets events.
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f3d75" }}>Open Submission Form</span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
