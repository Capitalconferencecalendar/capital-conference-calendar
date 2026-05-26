import AppShell from "../components/AppShell";

type Step = {
  title: string;
  body: string;
  callout: string;
};

type SetupGuidePageProps = {
  platform: "Google Calendar" | "Apple Calendar" | "Outlook";
  accent: string;
  heroTitle: string;
  heroSubhead: string;
  steps: Step[];
};

function PlatformHeroVisual({
  platform,
  accent,
}: {
  platform: "Google Calendar" | "Apple Calendar" | "Outlook";
  accent: string;
}) {
  const labels =
    platform === "Google Calendar"
      ? ["Other calendars", "From URL", "Add calendar"]
      : platform === "Apple Calendar"
      ? ["File", "New Calendar Subscription", "Subscribe"]
      : ["Add calendar", "Subscribe from web", "Import"];

  return (
    <div
      style={{
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(15, 45, 79, 0.08)",
        backgroundColor: "#fbfcfe",
      }}
    >
      <div className="ccc-platform-hero-visual" style={{ padding: "12px", display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: "8px", alignItems: "center" }}>
        {labels.map((label, index) => (
          <div key={`${label}-${index}`} style={{ display: "contents" }}>
            <div
              style={{
                minHeight: "72px",
                border: "1px solid #dbe4ee",
                borderRadius: "10px",
                backgroundColor: index === 1 ? "#f8fbff" : "#ffffff",
                padding: "10px",
                display: "grid",
                alignContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  backgroundColor: accent,
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {index + 1}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: index === 1 ? accent : "#334155", lineHeight: 1.35 }}>
                {label}
              </div>
            </div>
            {index < labels.length - 1 ? (
              <div
                className="ccc-platform-hero-arrow"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "999px",
                  border: `1px solid ${accent}`,
                  color: accent,
                  backgroundColor: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 900,
                }}
              >
                →
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "9px 12px",
          backgroundColor: "#ffffff",
          fontSize: "12px",
          color: "#475569",
          lineHeight: 1.45,
          fontWeight: 600,
        }}
      >
        {platform} subscription flow preview: build view, copy link, subscribe.
      </div>
    </div>
  );
}

function WorkflowPreview({ accent }: { accent: string }) {
  const items = [
    "Build Market View",
    "Copy Live Calendar Link",
    "Subscribe Once",
    "Updates Automatically",
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}
      className="ccc-subscribe-workflow"
    >
      {items.map((item, index) => (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "180px" }}>
          <div
            style={{
              flex: 1,
              border: "1px solid #dbe4ee",
              borderRadius: "10px",
              backgroundColor: index === 1 ? "#f8fbff" : "#ffffff",
              padding: "10px",
              fontSize: "12px",
              fontWeight: 700,
              color: index === 1 ? accent : "#334155",
              textAlign: "center",
            }}
          >
            {item}
          </div>
          {index < items.length - 1 ? (
            <div
              className="ccc-flow-arrow"
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "999px",
                border: `1px solid ${accent}`,
                color: accent,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 900,
                backgroundColor: "#ffffff",
              }}
            >
              →
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SyncRow() {
  const providers = [
    {
      name: "Google",
      icon: (
        <span
          aria-hidden="true"
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            background:
              "conic-gradient(from 25deg, #4285f4 0 25%, #34a853 25% 50%, #fbbc05 50% 75%, #ea4335 75% 100%)",
          }}
        />
      ),
    },
    {
      name: "Apple",
      icon: (
        <span
          aria-hidden="true"
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            backgroundColor: "#111827",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          A
        </span>
      ),
    },
    {
      name: "Outlook",
      icon: (
        <span
          aria-hidden="true"
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            backgroundColor: "#0a66c2",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          O
        </span>
      ),
    },
  ];

  return (
    <div
      style={{
        border: "1px solid #dbe4ee",
        borderRadius: "10px",
        backgroundColor: "#fbfdff",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
        Sync with Google, Apple or Outlook
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {providers.map((provider) => (
          <span
            key={provider.name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              border: "1px solid #dbe4ee",
              borderRadius: "999px",
              backgroundColor: "#ffffff",
              padding: "5px 9px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#334155",
            }}
          >
            {provider.icon}
            {provider.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function VisualFrame({
  accent,
  title,
  callout,
}: {
  accent: string;
  title: string;
  callout: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 24px rgba(15, 45, 79, 0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "28px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 10px",
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "999px", backgroundColor: "#cbd5e1" }} />
        <span style={{ width: "8px", height: "8px", borderRadius: "999px", backgroundColor: "#cbd5e1" }} />
        <span style={{ width: "8px", height: "8px", borderRadius: "999px", backgroundColor: "#cbd5e1" }} />
      </div>
      <div style={{ padding: "12px", position: "relative", minHeight: "170px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ height: "10px", width: "55%", backgroundColor: "#e2e8f0", borderRadius: "999px" }} />
          <div style={{ height: "10px", width: "78%", backgroundColor: "#eef2f7", borderRadius: "999px" }} />
          <div style={{ height: "30px", width: "66%", backgroundColor: "#f8fafc", border: "1px solid #dbe4ee", borderRadius: "8px" }} />
          <div style={{ height: "30px", width: "72%", backgroundColor: "#f8fafc", border: "1px solid #dbe4ee", borderRadius: "8px" }} />
        </div>
        <div
          style={{
            position: "absolute",
            top: "62px",
            right: "10px",
            border: `2px solid ${accent}`,
            borderRadius: "8px",
            width: "38%",
            height: "34px",
            backgroundColor: "rgba(255,255,255,0.72)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "98px",
            right: "12px",
            maxWidth: "44%",
            backgroundColor: "#ffffff",
            border: `1px solid ${accent}`,
            borderRadius: "8px",
            padding: "6px 7px",
            fontSize: "11px",
            color: "#334155",
            lineHeight: 1.35,
            boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
          }}
        >
          {callout}
        </div>
        <div
          style={{
            position: "absolute",
            top: "88px",
            right: "120px",
            width: "22px",
            borderTop: `2px solid ${accent}`,
            transform: "rotate(-23deg)",
            transformOrigin: "right center",
          }}
        />
      </div>
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "9px 12px",
          backgroundColor: "#fbfcfe",
          fontSize: "12px",
          fontWeight: 700,
          color: "#475569",
        }}
      >
        {title}
      </div>
    </div>
  );
}

function StepCard({
  index,
  step,
  accent,
}: {
  index: number;
  step: Step;
  accent: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        padding: "14px",
        display: "grid",
        gap: "10px",
      }}
    >
      <VisualFrame accent={accent} title={step.title} callout={step.callout} />
      <div
        style={{
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: accent,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: accent,
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 900,
          }}
        >
          {index}
        </span>
        Step {index}
      </div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
        {step.title}
      </div>
      <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.55 }}>{step.body}</div>
    </div>
  );
}

export default function SetupGuidePage({
  platform,
  accent,
  heroTitle,
  heroSubhead,
  steps,
}: SetupGuidePageProps) {
  return (
    <AppShell active="feeds">
      <div style={{ display: "grid", gap: "16px" }}>
        <section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            padding: "18px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
            display: "grid",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              width: "fit-content",
              padding: "6px 10px",
              borderRadius: "999px",
              backgroundColor: "#f8fbff",
              border: `1px solid ${accent}`,
              color: accent,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {platform}
          </div>
          <h1 style={{ margin: 0, fontSize: "34px", lineHeight: 1.08, color: "#0f172a" }}>
            {heroTitle}
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "860px" }}>
            {heroSubhead}
          </p>
          <PlatformHeroVisual platform={platform} accent={accent} />
          <SyncRow />
          <WorkflowPreview accent={accent} />
        </section>

        <section className="ccc-subscribe-steps" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: "10px", alignItems: "start" }}>
          {steps.map((step, index) => (
            <div key={step.title} style={{ display: "contents" }}>
              <StepCard index={index + 1} step={step} accent={accent} />
              {index < steps.length - 1 ? (
                <div
                  className="ccc-step-connector"
                  style={{
                    alignSelf: "center",
                    marginTop: "16px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    border: `1px solid ${accent}`,
                    color: accent,
                    backgroundColor: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: 900,
                  }}
                >
                  →
                </div>
              ) : null}
            </div>
          ))}
        </section>

        <section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
            What Happens Next
          </div>
          <div className="ccc-subscribe-next" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
            {[
              "Newly matching conferences can appear in your subscribed calendar.",
              "Conference timing changes can update in your subscribed calendar.",
              "Cancelled events can be removed when calendars refresh.",
            ].map((text) => (
              <div key={text} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", backgroundColor: "#fbfcfe", padding: "10px", fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
                {text}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
