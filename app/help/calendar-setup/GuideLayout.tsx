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
  platformKey: "google" | "apple" | "outlook";
  breadcrumbCurrent: string;
  platformLabel: string;
  accent?: string;
  headline: string;
  subheadline: string;
  supportingCopy?: string;
  chips: string[];
  heroPreview: React.ReactNode;
  steps: StepItem[];
  supportCards: SupportCard[];
  faqs: FAQItem[];
};

const COLORS = {
  page: "#04182c",
  pageAlt: "#051b31",
  card: "linear-gradient(180deg, #082640 0%, #061c33 100%)",
  cardSoft: "#082640",
  panel: "#031426",
  border: "rgba(107, 157, 210, 0.24)",
  borderSoft: "rgba(107, 157, 210, 0.16)",
  text: "#ffffff",
  textSecondary: "#c8d8ec",
  textMuted: "#8fa8c3",
  blue: "#3b82f6",
  cyan: "#2dd4bf",
};

function PlatformSwitcher({ active }: { active: GuideLayoutProps["platformKey"] }) {
  const items = [
    { key: "google" as const, label: "Google", href: "/help/google-calendar" },
    { key: "apple" as const, label: "Apple", href: "/help/apple-calendar" },
    { key: "outlook" as const, label: "Outlook", href: "/help/outlook-calendar" },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px",
        height: "48px",
        borderRadius: "14px",
        background: "rgba(4, 18, 34, 0.88)",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "38px",
              padding: "0 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 850,
              letterSpacing: "0.03em",
              color: isActive ? "#ffffff" : "#a9bfd8",
              background: isActive ? "linear-gradient(180deg, #3b82f6, #2563eb)" : "transparent",
              boxShadow: isActive ? "0 0 0 1px rgba(147, 197, 253, 0.18)" : "none",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function HeroChip({ chip, accent }: { chip: string; accent: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        borderRadius: "999px",
        padding: "8px 12px",
        background: "rgba(8, 31, 55, 0.58)",
        border: `1px solid ${COLORS.borderSoft}`,
        color: "#d9e8fb",
        fontSize: "12px",
        fontWeight: 800,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "999px",
          background: accent,
          boxShadow: `0 0 14px ${accent}88`,
        }}
      />
      {chip}
    </span>
  );
}

function StepCard({ step, accent }: { step: StepItem; accent: string }) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "72px minmax(0, 1fr)",
        gap: "18px",
        padding: "20px",
        borderRadius: "22px",
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
      }}
      className="ccc-calendar-step-card"
    >
      <div style={{ display: "grid", alignContent: "start", gap: "12px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "18px",
            background: `linear-gradient(180deg, ${accent}, ${accent}cc)`,
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontWeight: 950,
            fontSize: "17px",
            boxShadow: `0 12px 26px ${accent}33`,
          }}
        >
          {String(step.number).padStart(2, "0")}
        </div>
      </div>

      <div style={{ display: "grid", gap: "14px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "26px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: COLORS.text,
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: 1.55,
              color: COLORS.textSecondary,
              maxWidth: "760px",
            }}
          >
            {step.copy}
          </p>
        </div>
        <div
          style={{
            borderRadius: "18px",
            background: "rgba(3, 20, 38, 0.82)",
            border: `1px solid ${COLORS.borderSoft}`,
            overflow: "hidden",
          }}
        >
          {step.visual}
        </div>
      </div>
    </article>
  );
}

function SupportSidebar({ cards, faqs }: { cards: SupportCard[]; faqs: FAQItem[] }) {
  return (
    <aside
      style={{
        display: "grid",
        gap: "14px",
        position: "sticky",
        top: "96px",
        alignSelf: "start",
      }}
      className="ccc-calendar-sidebar"
    >
      {cards.map((card, index) => (
        <section
          key={card.title}
          style={{
            padding: "20px",
            borderRadius: "20px",
            background: index === 0 ? COLORS.card : "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 16px 34px rgba(0,0,0,0.16)",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "18px",
              lineHeight: 1.15,
              fontWeight: 900,
              color: COLORS.text,
            }}
          >
            {card.title}
          </h4>
          {card.body ? (
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: COLORS.textSecondary }}>
              {card.body}
            </p>
          ) : null}
          {card.bullets ? (
            <ul style={{ margin: "2px 0 0 0", padding: 0, listStyle: "none", display: "grid", gap: "10px" }}>
              {card.bullets.map((bullet) => (
                <li key={bullet} style={{ display: "grid", gridTemplateColumns: "10px 1fr", gap: "10px", alignItems: "start" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "999px",
                      background: COLORS.cyan,
                      marginTop: "5px",
                      boxShadow: "0 0 14px rgba(45, 212, 191, 0.42)",
                    }}
                  />
                  <span style={{ fontSize: "14px", lineHeight: 1.5, color: COLORS.textSecondary }}>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section
        style={{
          padding: "20px",
          borderRadius: "20px",
          background: "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 16px 34px rgba(0,0,0,0.16)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.blue,
            marginBottom: "10px",
          }}
        >
          Common Questions
        </div>
        <div style={{ display: "grid", gap: "10px" }}>
          {faqs.map((item) => (
            <details
              key={item.question}
              style={{
                borderRadius: "14px",
                border: `1px solid ${COLORS.borderSoft}`,
                background: "rgba(3, 20, 38, 0.78)",
                padding: "12px 14px",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  listStyle: "none",
                  fontSize: "14px",
                  lineHeight: 1.4,
                  fontWeight: 800,
                  color: COLORS.text,
                }}
              >
                {item.question}
              </summary>
              <p style={{ margin: "10px 0 0 0", fontSize: "13px", lineHeight: 1.55, color: COLORS.textSecondary }}>
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
  platformKey,
  accent = COLORS.blue,
  headline,
  subheadline,
  supportingCopy,
  chips,
  heroPreview,
  steps,
  supportCards,
  faqs,
}: GuideLayoutProps) {
  return (
    <AppShell active="feeds">
      <div
        style={{
          maxWidth: "1180px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 72px",
          display: "grid",
          gap: "22px",
          background: `radial-gradient(circle at 18% 0%, rgba(59,130,246,0.10), transparent 32%), radial-gradient(circle at 92% 0%, rgba(45,212,191,0.07), transparent 28%), linear-gradient(180deg, ${COLORS.page} 0%, ${COLORS.pageAlt} 100%)`,
        }}
        className="ccc-calendar-guide"
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) auto",
            alignItems: "start",
            gap: "28px",
            borderBottom: `1px solid ${COLORS.borderSoft}`,
            padding: "0 0 18px 0",
          }}
          className="ccc-calendar-hero"
        >
          <div style={{ display: "grid", gap: "14px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: COLORS.blue,
              }}
            >
              Calendar Setup · Live Conference Feeds
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "48px",
                lineHeight: 1,
                fontWeight: 950,
                letterSpacing: "-0.045em",
                color: COLORS.text,
                maxWidth: "760px",
              }}
            >
              {headline}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "19px",
                lineHeight: 1.45,
                fontWeight: 650,
                color: "#d9e8fb",
                maxWidth: "760px",
              }}
            >
              {subheadline}
            </p>
            {supportingCopy ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: 1.55,
                  color: COLORS.textMuted,
                  maxWidth: "760px",
                }}
              >
                {supportingCopy}
              </p>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {chips.map((chip) => (
                <HeroChip key={chip} chip={chip} accent={accent} />
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: "18px", justifyItems: "end" }}>
            <PlatformSwitcher active={platformKey} />
            <div
              style={{
                width: "min(100%, 420px)",
                borderRadius: "24px",
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
                overflow: "hidden",
              }}
            >
              {heroPreview}
            </div>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 0.72fr)",
            gap: "18px",
            alignItems: "start",
          }}
          className="ccc-calendar-main"
        >
          <div style={{ display: "grid", gap: "16px" }}>
            {steps.map((step) => (
              <StepCard key={step.number} step={step} accent={accent} />
            ))}
          </div>
          <SupportSidebar cards={supportCards} faqs={faqs} />
        </div>

        <section
          style={{
            padding: "22px 24px",
            borderRadius: "24px",
            background: "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: "8px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.blue,
              }}
            >
              Next Step
            </div>
            <div style={{ fontSize: "28px", lineHeight: 1.08, fontWeight: 900, color: COLORS.text }}>
              Ready to build your live conference calendar?
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/events#calendar-feed"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "46px",
                padding: "0 18px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 900,
                background: "linear-gradient(180deg, #3b82f6, #2563eb)",
                color: "#ffffff",
                border: "1px solid rgba(125,180,255,0.24)",
              }}
            >
              Open Calendar Feed Builder
            </Link>
            <Link
              href="/events"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "46px",
                padding: "0 18px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 900,
                color: "#d9e8fb",
                border: `1px solid ${COLORS.border}`,
                background: "rgba(8, 31, 55, 0.62)",
              }}
            >
              Back to Discovery
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
