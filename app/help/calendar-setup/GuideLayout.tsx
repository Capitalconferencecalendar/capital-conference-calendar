import Link from "next/link";
import AppShell from "../../components/AppShell";

type StepItem = {
  number: number;
  title: string;
  copy: string;
  visual: React.ReactNode;
};

type SupportCard = {
  title: string;
  body?: string;
  bullets?: string[];
};

type FAQItem = {
  question: string;
  answer: string;
};

type GuideLayoutProps = {
  breadcrumbCurrent: string;
  platformLabel: string;
  accent?: string;
  headline: string;
  subheadline: string;
  chips: string[];
  heroPreview: React.ReactNode;
  workflowItems: string[];
  steps: StepItem[];
  supportCards: SupportCard[];
  faqs: FAQItem[];
};

function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        fontSize: "13px",
        color: "#64748b",
      }}
    >
      <Link href="/subscribe" style={{ color: "#0f3d75", textDecoration: "none" }}>
        Help Center
      </Link>
      <span aria-hidden="true">›</span>
      <span>Calendar Setup</span>
      <span aria-hidden="true">›</span>
      <span style={{ color: "#0f172a", fontWeight: 700 }}>{current}</span>
    </nav>
  );
}

function WorkflowStrip({ items }: { items: string[] }) {
  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #cfe0f1",
        borderRadius: "12px",
        padding: "14px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "140px repeat(4, minmax(0, 1fr))",
          alignItems: "center",
          gap: "10px",
        }}
        className="ccc-help-workflow"
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          How it works
        </div>
        {items.map((item, index) => (
          <div key={item} style={{ display: "contents" }}>
            <div
              style={{
                border: "1px solid #dbe4ee",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "#fbfdff",
                textAlign: "center",
                minHeight: "78px",
                display: "grid",
                placeItems: "center",
                gap: "7px",
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "999px",
                  border: "1px solid #0f3d75",
                  color: "#0f3d75",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 900,
                }}
              >
                {index + 1}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: 1.35,
                  color: "#334155",
                }}
              >
                {item}
              </div>
            </div>
            {index < items.length - 1 ? (
              <div
                className="ccc-help-workflow-arrow"
                style={{
                  color: "#9fb7d6",
                  fontSize: "24px",
                  textAlign: "center",
                }}
              >
                →
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function SyncProvidersRow() {
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
            background: "conic-gradient(from 25deg, #4285f4 0 25%, #34a853 25% 50%, #fbbc05 50% 75%, #ea4335 75% 100%)",
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
    <section
      style={{
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
        Sync with Google, Apple, or Outlook
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
              padding: "6px 10px",
              backgroundColor: "#fbfdff",
              fontSize: "13px",
              fontWeight: 700,
              color: "#334155",
            }}
          >
            {provider.icon}
            {provider.name}
          </span>
        ))}
      </div>
    </section>
  );
}

function StepCard({ step }: { step: StepItem }) {
  return (
    <article
      style={{
        border: "1px solid #d7dde5",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        padding: "14px",
        display: "grid",
        gridTemplateColumns: "220px minmax(0, 1fr)",
        gap: "14px",
      }}
      className="ccc-help-step-card"
    >
      <div style={{ display: "grid", alignContent: "start", gap: "10px" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            backgroundColor: "#1d4f91",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: "16px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {step.number}
        </div>
        <h3 style={{ margin: 0, fontSize: "35px", lineHeight: 1.2, color: "#0f172a" }}>
          {step.title}
        </h3>
        <p style={{ margin: 0, fontSize: "16px", color: "#475569", lineHeight: 1.6 }}>{step.copy}</p>
      </div>
      <div>{step.visual}</div>
    </article>
  );
}

function SupportSidebar({
  cards,
  faqs,
}: {
  cards: SupportCard[];
  faqs: FAQItem[];
}) {
  return (
    <aside
      style={{ display: "grid", gap: "12px", position: "sticky", top: "86px", alignSelf: "start" }}
      className="ccc-help-sidebar"
    >
      {cards.map((card) => (
        <section
          key={card.title}
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            padding: "14px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#0f172a" }}>{card.title}</h4>
          {card.body ? (
            <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: "#475569" }}>{card.body}</p>
          ) : null}
          {card.bullets ? (
            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "7px" }}>
              {card.bullets.map((bullet) => (
                <li key={bullet} style={{ fontSize: "15px", lineHeight: 1.5, color: "#334155" }}>
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section
        style={{
          border: "1px solid #d7dde5",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          padding: "14px",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#0f172a" }}>Common Questions</h4>
        <div style={{ display: "grid", gap: "8px" }}>
          {faqs.map((item) => (
            <details
              key={item.question}
              style={{
                border: "1px solid #dbe4ee",
                borderRadius: "9px",
                padding: "10px 11px",
                backgroundColor: "#fbfcfe",
              }}
            >
              <summary style={{ cursor: "pointer", fontSize: "16px", fontWeight: 600, color: "#334155" }}>
                {item.question}
              </summary>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", lineHeight: 1.55, color: "#475569" }}>
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default function GuideLayout({
  breadcrumbCurrent,
  platformLabel,
  accent = "#1d4f91",
  headline,
  subheadline,
  chips,
  heroPreview,
  workflowItems,
  steps,
  supportCards,
  faqs,
}: GuideLayoutProps) {
  return (
    <AppShell active="feeds">
      <div style={{ display: "grid", gap: "14px" }}>
        <Breadcrumbs current={breadcrumbCurrent} />

        <section
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "1.1fr minmax(320px, 0.9fr)",
            gap: "16px",
          }}
          className="ccc-help-hero"
        >
          <div style={{ display: "grid", alignContent: "start", gap: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: accent, letterSpacing: "0.03em" }}>
              {platformLabel}
            </div>
            <h1 style={{ margin: 0, fontSize: "52px", lineHeight: 1.1, color: "#0f172a" }}>{headline}</h1>
            <p style={{ margin: 0, fontSize: "18px", color: "#334155", lineHeight: 1.6, maxWidth: "760px" }}>
              {subheadline}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    border: `1px solid ${accent}33`,
                    backgroundColor: "#f8fbff",
                    color: accent,
                    borderRadius: "999px",
                    padding: "6px 10px",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "999px", backgroundColor: accent }} />
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div>{heroPreview}</div>
        </section>

        <SyncProvidersRow />

        {workflowItems.length > 0 ? <WorkflowStrip items={workflowItems} /> : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(300px, 0.84fr)",
            gap: "14px",
            alignItems: "start",
          }}
          className="ccc-help-main"
        >
          <div style={{ display: "grid", gap: "12px" }}>
            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
          <SupportSidebar cards={supportCards} faqs={faqs} />
        </div>

        <section
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "26px", lineHeight: 1.2, fontWeight: 700, color: "#0f172a" }}>
            Ready to build your live conference calendar?
          </div>
          <Link
            href="/events#calendar-feed"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "42px",
              padding: "0 16px",
              borderRadius: "10px",
              border: "1px solid #0f2d4f",
              backgroundColor: "#0f2d4f",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Open Calendar Feed Builder
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
