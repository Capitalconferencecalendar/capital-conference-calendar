import Link from "next/link";
import AppShell from "../components/AppShell";

export default function ContactPage() {
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
            Contact
          </div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "36px", lineHeight: 1.1, color: "#0f172a" }}>
            Contact Capital Conference Database
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "860px" }}>
            For beta access, partnership inquiries, conference corrections, or general questions, contact the Capital Conference Database team.
          </p>
        </section>

        <section
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            padding: "16px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
            display: "grid",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
            Get in touch
          </div>
          <div style={{ fontSize: "15px", color: "#334155", lineHeight: 1.6 }}>
            Email: <a href="mailto:info@capitalconferencecalendar.com" style={{ color: "#0f3d75", textDecoration: "none" }}>info@capitalconferencecalendar.com</a>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/#request-access" style={{ textDecoration: "none", height: "40px", display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "10px", border: "1px solid #0f2d4f", backgroundColor: "#0f2d4f", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
              Request Beta Access
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
