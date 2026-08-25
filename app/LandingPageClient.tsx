"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const betaCards = [
  {
    title: "Market Intelligence",
    body: "See capital markets conference activity through an intelligence lens — not scattered lists, emails, and one-off searches.",
    accent: "#38bdf8",
    icon: "M",
  },
  {
    title: "Market Signals",
    body: "Identify early indicators of where investor attention, issuer access, and sector activity are beginning to concentrate.",
    accent: "#f59e0b",
    icon: "S",
  },
  {
    title: "Coverage Prioritization",
    body: "Prioritize the conferences, relationships, and coverage decisions most likely to matter before the calendar fills up.",
    accent: "#60a5fa",
    icon: "C",
  },
  {
    title: "Private Beta",
    body: "Access is being reserved for select market participants who can help evaluate and shape the beta.",
    accent: "#a78bfa",
    icon: "B",
  },
];

const audiences = [
  "Investor Relations Leaders",
  "Public Company Executives",
  "Private Company Executives",
  "Investment Bankers",
  "Capital Markets Advisors",
  "Corporate Access Teams",
  "Conference Organizers",
  "Sponsors / Service Providers",
  "Institutional Investors",
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
  const router = useRouter();
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [betaCode, setBetaCode] = useState("");
  const [betaState, setBetaState] = useState<"idle" | "submitting" | "error">("idle");
  const [isEnteringBeta, setIsEnteringBeta] = useState(false);

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

  async function handleBetaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBetaState("submitting");

    try {
      const response = await fetch("/api/beta-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: betaCode }),
      });

      if (!response.ok) throw new Error("Invalid access code.");
      setBetaModalOpen(false);
      setBetaState("idle");
      setIsEnteringBeta(true);
      router.prefetch("/discovery");
      window.setTimeout(() => {
        router.push("/discovery");
      }, 1350);
    } catch {
      setBetaState("error");
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
          maxWidth: "1280px",
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
            src="/landing-database-logo-white.png"
            alt="Capital Conference Calendar"
            style={{ height: "126px", width: "auto", display: "block", filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.24))" }}
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
            Capital Conference Calendar is running a private beta for select market participants across investor relations, banking, public and private company leadership, conference organization, and capital markets services. The platform turns capital markets conferences into a cohesive intelligence layer — helping decision-makers plan coverage, identify early market signals, understand where attention is building, and make better decisions around relationships, capital access, and investment strategy.
          </p>
          <div style={{ display: "grid", gap: "10px", justifyItems: "start" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
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
              <button
                type="button"
                onClick={() => {
                  setBetaModalOpen(true);
                  setBetaState("idle");
                  setBetaCode("");
                }}
                style={{
                  height: "48px",
                  padding: "0 20px",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 900,
                  background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
                  border: "1px solid rgba(110,231,183,0.44)",
                  boxShadow: "0 16px 34px rgba(16,185,129,0.22)",
                  cursor: "pointer",
                }}
              >
                Access Beta
              </button>
            </div>
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
                padding: "4px 2px",
                display: "grid",
                gridTemplateColumns: "34px minmax(0, 1fr)",
                gap: "11px",
                alignItems: "start",
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
          gap: "18px",
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ color: "#7dd3fc", fontSize: "12px", fontWeight: 950, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Private Beta Participants
          </div>
          <h2 style={{ margin: "10px 0 0", color: "#c7d8ee", fontSize: "clamp(17px, 1.7vw, 21px)", lineHeight: 1.5, fontWeight: 400, maxWidth: "1080px" }}>
            Private beta access is being reserved for market participants who can help evaluate how conference intelligence supports capital access, coverage planning, relationship strategy, and market signal identification.
          </h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {audiences.map((audience, index) => (
            <span
              key={audience}
              style={{
                padding: "10px 13px 10px 11px",
                borderRadius: "999px",
                border: "1px solid rgba(96,165,250,0.36)",
                background:
                  index % 3 === 0
                    ? "linear-gradient(180deg, rgba(15,38,69,0.94) 0%, rgba(6,20,38,0.94) 100%)"
                    : index % 3 === 1
                      ? "linear-gradient(180deg, rgba(8,32,58,0.94) 0%, rgba(4,18,34,0.94) 100%)"
                      : "linear-gradient(180deg, rgba(12,45,73,0.9) 0%, rgba(5,22,40,0.94) 100%)",
                boxShadow: "inset 0 1px 0 rgba(191,219,254,0.1), 0 0 22px rgba(56,189,248,0.08)",
                color: "#e6f2ff",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: index % 4 === 1 ? "#f59e0b" : index % 4 === 2 ? "#60a5fa" : "#38bdf8",
                  boxShadow: "0 0 14px rgba(56,189,248,0.46)",
                  flex: "0 0 auto",
                }}
              />
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

      {betaModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enter beta access code"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(2,8,15,0.72)",
            backdropFilter: "blur(8px)",
          }}
        >
          <form
            onSubmit={handleBetaSubmit}
            style={{
              width: "min(100%, 380px)",
              borderRadius: "18px",
              border: "1px solid rgba(148,163,184,0.24)",
              background: "linear-gradient(180deg, rgba(8,24,40,0.98), rgba(4,14,26,0.98))",
              boxShadow: "0 26px 70px rgba(0,0,0,0.42)",
              padding: "22px",
              display: "grid",
              gap: "14px",
            }}
          >
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ color: "#dbeafe", fontSize: "17px", fontWeight: 900 }}>Enter beta access code</span>
              <input
                autoFocus
                type="password"
                value={betaCode}
                onChange={(event) => {
                  setBetaCode(event.target.value);
                  if (betaState === "error") setBetaState("idle");
                }}
                style={fieldStyle}
              />
            </label>
            {betaState === "error" ? <div style={{ color: "#fca5a5", fontSize: "13px", fontWeight: 800 }}>Invalid access code.</div> : null}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setBetaModalOpen(false);
                  setBetaState("idle");
                  setBetaCode("");
                }}
                style={{
                  height: "40px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(148,163,184,0.24)",
                  background: "rgba(15,23,42,0.62)",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={betaState === "submitting"}
                style={{
                  height: "40px",
                  padding: "0 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(110,231,183,0.44)",
                  background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: betaState === "submitting" ? "wait" : "pointer",
                  opacity: betaState === "submitting" ? 0.74 : 1,
                }}
              >
                {betaState === "submitting" ? "Entering..." : "Enter"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isEnteringBeta ? <BetaAccessTransition /> : null}
    </main>
  );
}

function BetaAccessTransition() {
  const steps = ["Index", "Signals", "Discovery"];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Access granted. Preparing your conference intelligence workspace."
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "radial-gradient(60% 42% at 50% 42%, rgba(56,189,248,0.18) 0%, rgba(8,24,44,0.82) 42%, rgba(2,8,15,0.98) 100%), linear-gradient(180deg, #03101e 0%, #020914 100%)",
        color: "#eaf6ff",
      }}
    >
      <style>
        {`
          @keyframes beta-scan {
            from { transform: translateX(-28%); opacity: .2; }
            45% { opacity: 1; }
            to { transform: translateX(128%); opacity: .12; }
          }
          @keyframes beta-node {
            0%, 100% { transform: scale(.78); opacity: .46; }
            45% { transform: scale(1); opacity: 1; }
          }
          @keyframes beta-fade-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .beta-access-scan,
            .beta-access-node,
            .beta-access-card {
              animation: none !important;
            }
          }
        `}
      </style>
      <div
        className="beta-access-card"
        style={{
          width: "min(100%, 460px)",
          display: "grid",
          gap: "22px",
          justifyItems: "center",
          textAlign: "center",
          animation: "beta-fade-up 360ms ease-out both",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "74px",
            height: "74px",
            borderRadius: "22px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "7px",
            padding: "8px",
            background: "rgba(8,24,44,0.76)",
            boxShadow: "0 0 52px rgba(56,189,248,0.26), inset 0 1px 0 rgba(191,219,254,0.2)",
          }}
        >
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              style={{
                borderRadius: index === 1 ? "9px 16px 9px 9px" : "9px",
                background: "linear-gradient(135deg, #0757ff 0%, #12c8f4 100%)",
                boxShadow: "0 0 18px rgba(18,200,244,0.24)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ color: "#ffffff", fontSize: "28px", lineHeight: 1.1, fontWeight: 950 }}>
            Access granted
          </div>
          <div style={{ color: "#a9c4df", fontSize: "15px", lineHeight: 1.5, fontWeight: 650 }}>
            Preparing your conference intelligence workspace…
          </div>
        </div>
        <div style={{ width: "100%", display: "grid", gap: "14px" }}>
          <div
            style={{
              position: "relative",
              height: "2px",
              overflow: "hidden",
              borderRadius: "999px",
              background: "rgba(96,165,250,0.18)",
              boxShadow: "0 0 26px rgba(56,189,248,0.18)",
            }}
          >
            <span
              className="beta-access-scan"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "32%",
                borderRadius: "999px",
                background: "linear-gradient(90deg, transparent 0%, #38bdf8 48%, #93c5fd 100%)",
                animation: "beta-scan 1.15s ease-in-out both",
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {steps.map((step, index) => (
              <div key={step} style={{ display: "grid", justifyItems: "center", gap: "7px" }}>
                <span
                  className="beta-access-node"
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: "#38bdf8",
                    boxShadow: "0 0 18px rgba(56,189,248,0.64)",
                    animation: `beta-node 900ms ease-in-out ${index * 160}ms both`,
                  }}
                />
                <span style={{ color: "#7dd3fc", fontSize: "10px", fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
