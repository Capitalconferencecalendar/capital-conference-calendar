"use client";

import { FormEvent, useState } from "react";

const betaCards = [
  {
    title: "Market Intelligence",
    body: "Track capital markets conference activity in one place.",
    accent: "#38bdf8",
    icon: "M",
  },
  {
    title: "Market Signals",
    body: "Use signal-driven context to identify where attention and opportunity may be building.",
    accent: "#f59e0b",
    icon: "S",
  },
  {
    title: "Coverage Prioritization",
    body: "Focus on the conferences, relationships, and time allocation that may matter most.",
    accent: "#60a5fa",
    icon: "C",
  },
  {
    title: "Private Beta",
    body: "Join a limited early group helping shape the platform.",
    accent: "#a78bfa",
    icon: "B",
  },
];

const audiences = [
  "Investor Relations",
  "Business Development",
  "Banking / Advisory",
  "Capital Markets Teams",
  "Sponsors / Service Providers",
];

const supportItems = [
  {
    title: "Private Beta",
    body: "Selective onboarding for early capital markets users.",
    accent: "#a78bfa",
    icon: "lock",
  },
  {
    title: "Signal-Driven",
    body: "Built around attention, access, timing, and opportunity.",
    accent: "#f59e0b",
    icon: "signal",
  },
  {
    title: "Institutional Focus",
    body: "Designed for teams where conference decisions affect coverage and relationships.",
    accent: "#38bdf8",
    icon: "building",
  },
];

export default function LandingPageClient() {
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: String(data.get("firstName") || ""),
      lastName: String(data.get("lastName") || ""),
      company: String(data.get("company") || ""),
      title: String(data.get("title") || ""),
      email: String(data.get("email") || ""),
      howHeard: String(data.get("howHeard") || ""),
    };

    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Request access submission failed.");
      form.reset();
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
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
      <nav
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "50px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "18px",
        }}
      >
        <a href="/" aria-label="Capital Conference Calendar home" style={{ display: "inline-flex", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="Capital Conference Calendar"
            style={{ height: "42px", width: "auto", display: "block", filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.24))" }}
          />
        </a>
        <a
          href="#request-access"
          style={{
            height: "42px",
            padding: "0 16px",
            borderRadius: "12px",
            border: "1px solid rgba(147,197,253,0.44)",
            background: "linear-gradient(180deg, #2f6df6 0%, #1747aa 100%)",
            color: "#ffffff",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 950,
            boxShadow: "0 12px 28px rgba(37,99,235,0.28)",
            whiteSpace: "nowrap",
          }}
        >
          Request Beta Access
        </a>
      </nav>

      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "62px 20px 50px",
          display: "flex",
          flexWrap: "wrap",
          gap: "30px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: "21px", minWidth: 0, flex: "1 1 680px" }}>
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
              fontSize: "clamp(40px, 5vw, 62px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontWeight: 950,
              maxWidth: "900px",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "10px",
                color: "#9fb5cf",
                fontSize: "clamp(17px, 1.8vw, 24px)",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              For the first time
            </span>
            Every capital markets conference in one place
          </h1>
          <p
            style={{
              margin: 0,
              color: "#c7d8ee",
              fontSize: "clamp(17px, 1.7vw, 21px)",
              lineHeight: 1.5,
              maxWidth: "820px",
              fontWeight: 400,
            }}
          >
            Capital Conference Calendar is running a private beta for select users across investor relations, business development, banking, and capital markets teams. We&apos;re building the most complete capital markets conference database for planning and market intelligence — helping users spot early signals, understand where attention is building, and make better decisions around coverage, relationships, and investment strategy.
          </p>
          <div style={{ display: "grid", gap: "10px", justifyItems: "start" }}>
            <a
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
              Request Beta Access
            </a>
            <div style={{ color: "#9fb5cf", fontSize: "13px", fontWeight: 750 }}>
              Limited beta access. We&apos;re selectively onboarding early users.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "10px",
            alignSelf: "center",
            flex: "0 1 360px",
            width: "100%",
          }}
        >
          <div style={{ color: "#8fbfff", fontSize: "10px", fontWeight: 950, letterSpacing: "0.16em", textTransform: "uppercase", paddingLeft: "2px" }}>
            Beta Signal Layer
          </div>
          {supportItems.map((item) => (
            <div
              key={item.title}
              style={{
                padding: "13px",
                borderRadius: "14px",
                background: "rgba(8,24,44,0.62)",
                border: "1px solid rgba(148,163,184,0.14)",
                display: "grid",
                gridTemplateColumns: "34px minmax(0, 1fr)",
                gap: "11px",
                alignItems: "start",
                boxShadow: "0 16px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "10px",
                  display: "grid",
                  placeItems: "center",
                  color: "#061422",
                  background: item.accent,
                  boxShadow: `0 0 24px ${item.accent}38`,
                }}
              >
                <SupportIcon icon={item.icon} />
              </div>
              <div>
                <div style={{ color: item.accent, fontSize: "10.5px", fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {item.title}
                </div>
                <div style={{ marginTop: "5px", color: "#dbeafe", fontSize: "13px", lineHeight: 1.45, fontWeight: 650 }}>
                  {item.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {betaCards.map((card) => (
            <div
              key={card.title}
              style={{
                minHeight: "164px",
                padding: "20px",
                borderRadius: "18px",
                border: "1px solid rgba(148,163,184,0.16)",
                background: "rgba(8,24,44,0.74)",
                color: "#dbeafe",
                display: "grid",
                gap: "16px",
                alignContent: "start",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  color: "#061422",
                  background: card.accent,
                  boxShadow: `0 0 28px ${card.accent}42`,
                  fontSize: "13px",
                  fontWeight: 950,
                }}
              >
                {card.icon}
              </div>
              <div style={{ color: "#ffffff", fontSize: "20px", fontWeight: 950 }}>{card.title}</div>
              <div style={{ color: "#a9bdd6", fontSize: "14px", lineHeight: 1.55 }}>
                {card.body}
              </div>
            </div>
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
            Who We&apos;re Speaking With
          </div>
          <h2 style={{ margin: "10px 0 0", color: "#ffffff", fontSize: "34px", lineHeight: 1.1 }}>
            Early conversations are focused on teams closest to market attention, access, and relationship-driven activity.
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
              Request Beta Access
            </div>
            <h2 style={{ margin: "10px 0 12px", color: "#ffffff", fontSize: "36px", lineHeight: 1.08 }}>
              Request Beta Access
            </h2>
            <p style={{ margin: 0, color: "#a9bdd6", fontSize: "15px", lineHeight: 1.65 }}>
              We&apos;re currently onboarding a limited number of beta users. Share your information below and we&apos;ll reach out if we think there&apos;s a strong fit for testing.
            </p>
          </div>

          {submitState === "success" ? (
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(134,239,172,0.26)",
                background: "rgba(20,83,45,0.18)",
                padding: "22px",
                alignSelf: "start",
              }}
            >
              <div style={{ color: "#ffffff", fontSize: "22px", fontWeight: 950, marginBottom: "10px" }}>
                Thank you for your interest in Capital Conference Calendar.
              </div>
              <p style={{ margin: 0, color: "#bbf7d0", fontSize: "15px", lineHeight: 1.55 }}>
                We&apos;ll review your request and reach out if we think there is a good fit for beta testing.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <LandingInput label="First Name" name="firstName" required />
                <LandingInput label="Last Name" name="lastName" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <LandingInput label="Company" name="company" required />
                <LandingInput label="Title" name="title" required />
              </div>
              <LandingInput label="Email" name="email" type="email" required />
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={labelStyle}>How did you hear about us?</span>
                <textarea
                  name="howHeard"
                  rows={4}
                  style={{ ...fieldStyle, height: "auto", resize: "vertical", paddingTop: "11px" }}
                  placeholder="Optional"
                />
              </label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={submitState === "submitting"}
                  style={{
                    height: "46px",
                    padding: "0 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(147,197,253,0.44)",
                    background: submitState === "submitting"
                      ? "linear-gradient(180deg, #1e3a8a 0%, #172554 100%)"
                      : "linear-gradient(180deg, #2f6df6 0%, #1747aa 100%)",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 950,
                    cursor: submitState === "submitting" ? "wait" : "pointer",
                    opacity: submitState === "submitting" ? 0.78 : 1,
                  }}
                >
                  {submitState === "submitting" ? "Submitting..." : "Request Beta Access"}
                </button>
                {submitState === "error" ? (
                  <span style={{ color: "#fecaca", fontSize: "13px", fontWeight: 850 }}>
                    We couldn&apos;t submit your request. Please try again or contact us directly.
                  </span>
                ) : null}
              </div>
            </form>
          )}
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
          <a href="#request-access" style={footerLinkStyle}>Request Beta Access</a>
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

function SupportIcon({ icon }: { icon: string }) {
  if (icon === "lock") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (icon === "signal") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h2" />
        <path d="M9 18h2v-5H9z" />
        <path d="M15 18h2V8h-2z" />
        <path d="M20 18h0" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16" />
      <path d="M6 20V6l6-3 6 3v14" />
      <path d="M9 9h1" />
      <path d="M14 9h1" />
      <path d="M9 13h1" />
      <path d="M14 13h1" />
    </svg>
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
