"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Header from "./components/Header";

const moduleCards = [
  {
    title: "Discovery",
    body: "Search and filter the capital markets conference universe by date, sector, location, organizer, and access profile.",
    href: "/discovery",
  },
  {
    title: "Market View",
    body: "See where issuer access, investor concentration, sector activity, and market attention are clustering.",
    href: "/market-view",
  },
  {
    title: "Calendar Workflow",
    body: "Turn filtered conference intelligence into a usable calendar workflow for planning, coverage, and outreach.",
    href: "/discovery",
  },
];

const audiences = [
  "Investor Relations",
  "Business Development",
  "Banking / Advisory",
  "Capital Markets Teams",
  "Sponsors / Service Providers",
  "Conference Organizers",
];

const useCases = [
  "Investor access mapping",
  "Issuer and sector coverage",
  "Business development planning",
  "Banking / advisory coverage",
  "Conference sponsorship strategy",
  "Organizer market intelligence",
];

export default function LandingPageClient() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Temporary UI-only request flow: no request-access API/table exists yet.
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(90% 70% at 72% 6%, rgba(47,109,246,0.22) 0%, rgba(5,20,37,0) 48%), radial-gradient(80% 70% at 18% 20%, rgba(16,185,129,0.12) 0%, rgba(5,20,37,0) 44%), linear-gradient(180deg, #04111f 0%, #06172a 46%, #030b14 100%)",
        color: "#eaf3ff",
        fontFamily: "var(--font-body), Arial, sans-serif",
        overflowX: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "36px",
          zIndex: 48,
          background: "linear-gradient(90deg, #061422 0%, #0b1f34 50%, #061422 100%)",
          borderBottom: "1px solid rgba(148,163,184,0.16)",
        }}
      />
      <Header active="dashboard" workspaceMode={undefined} />

      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "156px 20px 58px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
          gap: "34px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: "24px" }}>
          <div
            style={{
              color: "#7dd3fc",
              fontSize: "12px",
              fontWeight: 950,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Capital Markets Conference Intelligence
          </div>
          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "clamp(46px, 6vw, 76px)",
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
              fontWeight: 950,
              maxWidth: "780px",
            }}
          >
            Know where market attention is building.
          </h1>
          <p
            style={{
              margin: 0,
              color: "#c7d8ee",
              fontSize: "clamp(18px, 2vw, 23px)",
              lineHeight: 1.5,
              maxWidth: "780px",
              fontWeight: 650,
            }}
          >
            Capital Conference Calendar helps investor relations, business development, banking, and capital markets teams discover, track, and interpret the conference universe across issuer access, investor concentration, sector activity, and relationship-driven market signals.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <Link
              href="#request-access"
              style={{
                height: "48px",
                padding: "0 20px",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 900,
                background: "linear-gradient(180deg, #2f6df6 0%, #1747aa 100%)",
                border: "1px solid rgba(147,197,253,0.44)",
                boxShadow: "0 16px 34px rgba(37,99,235,0.26)",
              }}
            >
              Request Access
            </Link>
            <Link
              href="/market-view"
              style={{
                height: "48px",
                padding: "0 18px",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dbeafe",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 850,
                background: "rgba(8,24,44,0.72)",
                border: "1px solid rgba(125,211,252,0.24)",
              }}
            >
              View Market View
            </Link>
            <Link
              href="/discovery"
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 850,
              }}
            >
              Explore Discovery
            </Link>
          </div>
        </div>

        <div
          style={{
            borderRadius: "22px",
            border: "1px solid rgba(125,211,252,0.18)",
            background:
              "linear-gradient(145deg, rgba(8,31,55,0.86) 0%, rgba(4,17,31,0.92) 100%)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04)",
            padding: "22px",
            display: "grid",
            gap: "16px",
          }}
        >
          {[
            ["Issuer Access", "Signal where public-company participation and executive access are visible."],
            ["Investor Concentration", "Identify weeks, cities, and sectors with elevated investor attention."],
            ["Market Clusters", "Connect timing, geography, sector focus, and relationship-driven signals."],
          ].map(([label, body]) => (
            <div
              key={label}
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(8,24,44,0.68)",
                border: "1px solid rgba(148,163,184,0.14)",
              }}
            >
              <div style={{ color: "#7dd3fc", fontSize: "11px", fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {label}
              </div>
              <div style={{ marginTop: "7px", color: "#dbeafe", fontSize: "14px", lineHeight: 1.45, fontWeight: 650 }}>
                {body}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
          {moduleCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              style={{
                minHeight: "190px",
                padding: "22px",
                borderRadius: "18px",
                border: "1px solid rgba(148,163,184,0.16)",
                background: "rgba(8,24,44,0.74)",
                textDecoration: "none",
                color: "#dbeafe",
                display: "grid",
                alignContent: "space-between",
              }}
            >
              <div>
                <div style={{ color: "#ffffff", fontSize: "22px", fontWeight: 950 }}>{card.title}</div>
                <p style={{ margin: "12px 0 0", color: "#a9bdd6", fontSize: "14px", lineHeight: 1.55 }}>
                  {card.body}
                </p>
              </div>
              <div style={{ color: "#7dd3fc", fontSize: "13px", fontWeight: 900 }}>Open module &rarr;</div>
            </Link>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 20px 52px",
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          gap: "18px",
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ color: "#7dd3fc", fontSize: "12px", fontWeight: 950, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Who It Is For
          </div>
          <h2 style={{ margin: "10px 0 0", color: "#ffffff", fontSize: "34px", lineHeight: 1.1 }}>
            Built for teams that need to understand conference activity before it becomes obvious.
          </h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {audiences.map((audience) => (
            <span
              key={audience}
              style={{
                padding: "11px 13px",
                borderRadius: "999px",
                border: "1px solid rgba(125,211,252,0.18)",
                background: "rgba(8,24,44,0.72)",
                color: "#dbeafe",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              {audience}
            </span>
          ))}
        </div>
      </section>

      <section id="request-access" style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 70px" }}>
        <div
          style={{
            borderRadius: "24px",
            border: "1px solid rgba(125,211,252,0.18)",
            background:
              "radial-gradient(80% 100% at 0% 0%, rgba(47,109,246,0.18) 0%, rgba(8,24,44,0) 52%), rgba(8,24,44,0.78)",
            padding: "28px",
            display: "grid",
            gridTemplateColumns: "0.8fr 1.2fr",
            gap: "26px",
          }}
        >
          <div>
            <div style={{ color: "#7dd3fc", fontSize: "12px", fontWeight: 950, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Request Access
            </div>
            <h2 style={{ margin: "10px 0 12px", color: "#ffffff", fontSize: "36px", lineHeight: 1.08 }}>
              Bring conference intelligence into your coverage workflow.
            </h2>
            <p style={{ margin: 0, color: "#a9bdd6", fontSize: "15px", lineHeight: 1.65 }}>
              Tell us how your team plans to use Capital Conference Calendar. We’ll follow up with access details and product fit.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <LandingInput label="Full name" name="name" required />
              <LandingInput label="Work email" name="email" type="email" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <LandingInput label="Company" name="company" required />
              <LandingInput label="Role" name="role" required />
            </div>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={labelStyle}>Primary use case</span>
              <select name="useCase" required style={fieldStyle}>
                <option value="">Select one</option>
                {useCases.map((useCase) => (
                  <option key={useCase} value={useCase}>
                    {useCase}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={labelStyle}>Optional notes</span>
              <textarea
                name="notes"
                rows={4}
                style={{ ...fieldStyle, height: "auto", resize: "vertical", paddingTop: "11px" }}
                placeholder="Tell us what conferences, sectors, or workflows matter most."
              />
            </label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  height: "46px",
                  padding: "0 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(147,197,253,0.44)",
                  background: "linear-gradient(180deg, #2f6df6 0%, #1747aa 100%)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 950,
                  cursor: "pointer",
                }}
              >
                Request Access
              </button>
              {submitted ? (
                <span style={{ color: "#86efac", fontSize: "13px", fontWeight: 850 }}>
                  Request received. We&apos;ll follow up shortly.
                </span>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(148,163,184,0.16)", padding: "24px 20px 30px" }}>
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
            color: "#8ea4c0",
            fontSize: "13px",
          }}
        >
          <strong style={{ color: "#dbeafe" }}>Capital Conference Calendar</strong>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a href="mailto:info@capitalconferencecalendar.com" style={footerLinkStyle}>Contact</a>
            <a href="#request-access" style={footerLinkStyle}>Request Access</a>
            <Link href="/discovery" style={footerLinkStyle}>Discovery</Link>
            <Link href="/market-view" style={footerLinkStyle}>Market View</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function LandingInput({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: "6px" }}>
      <span style={labelStyle}>{label}</span>
      <input name={name} type={type} required={required} style={fieldStyle} />
    </label>
  );
}

const labelStyle = {
  color: "#9fb5cf",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
};

const fieldStyle = {
  width: "100%",
  height: "44px",
  borderRadius: "11px",
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(3,13,24,0.72)",
  color: "#eaf3ff",
  padding: "0 12px",
  outline: "none",
  boxSizing: "border-box" as const,
  fontSize: "14px",
};

const footerLinkStyle = {
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: 750,
};
