import Link from "next/link";
import AppShell from "../../components/AppShell";
import CopyLinkMockup from "../calendar-setup/CopyLinkMockup";

const DEFAULT_FEED_URL = "https://capitalconferencecalendar.com/api/ics?view=conference-view";
const DISPLAY_FEED_URL = "https://capitalconferencecalendar.com/api/ics?view=your-selected-view";

function resolveFeedUrl(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return DEFAULT_FEED_URL;
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return DEFAULT_FEED_URL;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "#7fb2ff",
      }}
    >
      {children}
    </div>
  );
}

function PageCard({
  children,
  padding = "24px",
  glow = false,
}: {
  children: React.ReactNode;
  padding?: string;
  glow?: boolean;
}) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, #082640 0%, #061c33 100%)",
        border: `1px solid ${glow ? "rgba(59,130,246,0.42)" : "rgba(107,157,210,0.24)"}`,
        borderRadius: "24px",
        padding,
        boxShadow: glow
          ? "0 20px 48px rgba(0,0,0,0.22), 0 0 0 1px rgba(45,212,191,0.14), 0 0 28px rgba(59,130,246,0.16)"
          : "0 18px 40px rgba(0,0,0,0.18)",
      }}
    >
      {children}
    </section>
  );
}

function ProviderTabs() {
  const items = [
    { label: "Google", href: "/help/google-calendar" },
    { label: "Apple", href: "/help/apple-calendar" },
    { label: "Outlook", href: "/help/outlook-calendar", active: true },
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
        background: "rgba(4,18,34,0.78)",
        border: "1px solid rgba(107,157,210,0.22)",
      }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "38px",
            padding: "0 16px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 850,
            letterSpacing: "0.03em",
            color: item.active ? "#ffffff" : "#a9bfd8",
            background: item.active ? "linear-gradient(180deg, #3b82f6, #2563eb)" : "transparent",
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function HeroFlowVisual() {
  return (
    <PageCard padding="22px">
      <div style={{ display: "grid", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <Eyebrow>Outlook sync flow</Eyebrow>
          <span style={{ color: "#2dd4bf", fontSize: "12px", fontWeight: 800 }}>Live feed connected</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "14px",
            alignItems: "stretch",
          }}
          className="ccc-outlook-hero-flow"
        >
          <div style={{ borderRadius: "18px", padding: "18px", minHeight: "188px", background: "rgba(3,20,38,0.74)", border: "1px solid rgba(59,130,246,0.2)", display: "grid", alignContent: "start" }}>
            <Eyebrow>CCC Live Feed Link</Eyebrow>
            <div style={{ marginTop: "14px", color: "#ffffff", fontSize: "15px", fontWeight: 900, lineHeight: 1.25 }}>ICS subscription link</div>
            <div style={{ marginTop: "10px", color: "#8fa8c3", fontSize: "13px", lineHeight: 1.45 }}>Copy the live feed link from the sync panel.</div>
          </div>
          <div style={{ borderRadius: "18px", padding: "18px", minHeight: "188px", background: "rgba(8,39,67,0.74)", border: "1px solid rgba(107,157,210,0.18)", display: "grid", alignContent: "start", position: "relative" }}>
            <Eyebrow>Outlook Subscribe from Web</Eyebrow>
            <div style={{ marginTop: "14px", color: "#ffffff", fontSize: "15px", fontWeight: 900, lineHeight: 1.25 }}>Paste the feed URL</div>
            <div style={{ marginTop: "10px", color: "#8fa8c3", fontSize: "13px", lineHeight: 1.45 }}>Use Outlook&apos;s web subscription option to connect the feed.</div>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#3b82f6",
                fontSize: "22px",
                fontWeight: 900,
              }}
            >
              →
            </span>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "-18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#3b82f6",
                fontSize: "22px",
                fontWeight: 900,
              }}
            >
              →
            </span>
          </div>
          <div style={{ borderRadius: "18px", padding: "18px", minHeight: "188px", background: "rgba(3,20,38,0.74)", border: "1px solid rgba(45,212,191,0.2)", display: "grid", alignContent: "start" }}>
            <Eyebrow>Outlook Calendar</Eyebrow>
            <div style={{ marginTop: "14px", color: "#ffffff", fontSize: "15px", fontWeight: 900, lineHeight: 1.25 }}>Synced conference view</div>
            <div style={{ marginTop: "10px", color: "#8fa8c3", fontSize: "13px", lineHeight: 1.45 }}>Matching conferences appear after Outlook refreshes the subscription.</div>
          </div>
        </div>
      </div>
    </PageCard>
  );
}

function LiveFeedLinkCard({ feedUrl }: { feedUrl: string }) {
  return (
    <PageCard glow>
      <div style={{ display: "grid", gap: "16px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <Eyebrow>Your CCC live feed link</Eyebrow>
          <div style={{ color: "#ffffff", fontSize: "30px", lineHeight: 1.08, fontWeight: 900 }}>
            Copy the link you will paste into Outlook.
          </div>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.55, color: "#c8d8ec", maxWidth: "760px" }}>
            This link is unique to the conference view you selected. Copy it, then paste it into Outlook&apos;s
            &ldquo;Subscribe from web&rdquo; calendar option.
          </p>
        </div>
        <div
          style={{
            borderRadius: "20px",
            background: "linear-gradient(180deg, rgba(3,20,38,0.96), rgba(5,24,44,0.94))",
            border: "1px solid rgba(45,212,191,0.2)",
            overflow: "hidden",
          }}
        >
          <CopyLinkMockup
            feedUrl={feedUrl}
            displayFeedUrl={DISPLAY_FEED_URL}
            borderColor="rgba(59,130,246,0.34)"
            buttonBorderColor="#2563eb"
            buttonBgColor="#2563eb"
            dark
            title="Your CCC live feed link"
            subtitle="Copy this ICS subscription link, then add it in Outlook."
            copiedLabel="Live feed link copied."
          />
        </div>
        <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.45 }}>
          Keep this link private if your saved view is private or personalized.
        </div>
      </div>
    </PageCard>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <div
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "999px",
        background: "linear-gradient(180deg, #3b82f6, #1d4ed8)",
        color: "#ffffff",
        display: "grid",
        placeItems: "center",
        fontWeight: 950,
        fontSize: "16px",
        boxShadow: "0 10px 24px rgba(37,99,235,0.28)",
      }}
    >
      {String(n).padStart(2, "0")}
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  visual,
}: {
  number: number;
  title: string;
  description: string;
  visual: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(8,38,64,0.96), rgba(5,24,44,0.96))",
        border: "1px solid rgba(107,157,210,0.24)",
        borderRadius: "22px",
        padding: "22px",
        boxShadow: "0 18px 36px rgba(0,0,0,0.16)",
      }}
      className="ccc-outlook-step-card"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 0.92fr) minmax(0, 1.08fr)",
          gap: "22px",
          alignItems: "center",
        }}
        className="ccc-outlook-step-grid"
      >
        <div style={{ display: "grid", gap: "14px", alignContent: "start" }}>
          <StepNumber n={number} />
          <div style={{ color: "#ffffff", fontSize: "24px", fontWeight: 900, lineHeight: 1.1 }}>{title}</div>
          <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.5, color: "#c8d8ec" }}>{description}</p>
        </div>
        <div
          style={{
            borderRadius: "18px",
            background: "#031426",
            border: "1px solid rgba(107,157,210,0.18)",
            padding: "18px",
          }}
        >
          {visual}
        </div>
      </div>
    </section>
  );
}

function OutlookVisualShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Step1Visual() {
  return (
    <OutlookVisualShell title="ICS link copied">
      <div
        style={{
          borderRadius: "14px",
          padding: "12px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(59,130,246,0.26)",
          color: "#c8d8ec",
          fontSize: "13px",
          overflowWrap: "anywhere",
        }}
      >
        {DISPLAY_FEED_URL}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            height: "40px",
            padding: "0 16px",
            borderRadius: "12px",
            background: "linear-gradient(180deg, #3b82f6, #2563eb)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 900,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Copy Live Feed Link
        </span>
      </div>
    </OutlookVisualShell>
  );
}

function Step2Visual() {
  return (
    <OutlookVisualShell title="Outlook Calendar">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "92px 1fr",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(107,157,210,0.16)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ padding: "14px", borderRight: "1px solid rgba(107,157,210,0.12)", color: "#8fa8c3", fontSize: "13px", lineHeight: 1.8 }}>
          Mail
          <br />
          <span style={{ color: "#ffffff", fontWeight: 800 }}>Calendar</span>
        </div>
        <div style={{ padding: "14px", display: "grid", gap: "8px" }}>
          <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>Open Outlook and switch to Calendar view.</div>
          <div style={{ color: "#8fa8c3", fontSize: "13px", lineHeight: 1.45 }}>
            You only need the calendar area for the subscription step.
          </div>
        </div>
      </div>
    </OutlookVisualShell>
  );
}

function Step3Visual() {
  const items = ["Add calendar", "Create blank calendar", "Subscribe from web", "Upload from file"];
  return (
    <OutlookVisualShell title="Add calendar menu">
      <div style={{ display: "grid", gap: "8px" }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              borderRadius: "12px",
              padding: "11px 12px",
              background: item === "Subscribe from web" ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,157,210,0.14)",
              color: item === "Subscribe from web" ? "#ffffff" : "#c8d8ec",
              fontSize: "13px",
              fontWeight: item === "Subscribe from web" ? 900 : 700,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </OutlookVisualShell>
  );
}

function Step4Visual() {
  return (
    <OutlookVisualShell title="Paste the ICS feed link">
      <div style={{ display: "grid", gap: "10px" }}>
        <div style={{ color: "#8fa8c3", fontSize: "12px", fontWeight: 800 }}>Calendar URL</div>
        <div
          style={{
            borderRadius: "14px",
            padding: "12px 14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(59,130,246,0.26)",
            color: "#c8d8ec",
            fontSize: "13px",
            overflowWrap: "anywhere",
          }}
        >
          {DISPLAY_FEED_URL}
        </div>
      </div>
    </OutlookVisualShell>
  );
}

function Step5Visual() {
  return (
    <OutlookVisualShell title="Name and subscribe">
      <div style={{ display: "grid", gap: "12px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ color: "#8fa8c3", fontSize: "12px", fontWeight: 800 }}>Calendar name</div>
          <div
            style={{
              borderRadius: "14px",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,157,210,0.16)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            Capital Conference Calendar
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <span style={{ height: "38px", padding: "0 14px", borderRadius: "12px", border: "1px solid rgba(107,157,210,0.18)", color: "#c8d8ec", fontSize: "12px", fontWeight: 800, display: "inline-flex", alignItems: "center" }}>
            Cancel
          </span>
          <span style={{ height: "38px", padding: "0 14px", borderRadius: "12px", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", fontSize: "12px", fontWeight: 900, display: "inline-flex", alignItems: "center" }}>
            Import
          </span>
        </div>
      </div>
    </OutlookVisualShell>
  );
}

function Step6Visual() {
  return (
    <OutlookVisualShell title="Outlook calendar preview">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          gap: "14px",
        }}
        className="ccc-outlook-connected-preview"
      >
        <div
          style={{
            borderRadius: "16px",
            padding: "14px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(107,157,210,0.14)",
            minHeight: "170px",
            display: "grid",
            alignContent: "center",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "8px" }}>
            {["M", "T", "W", "T", "F", "", "", "17", "", "", "", "", "", "", ""].map((cell, idx) => (
              <div
                key={`${cell}-${idx}`}
                style={{
                  minHeight: "26px",
                  borderRadius: "10px",
                  background: cell === "17" ? "rgba(59,130,246,0.88)" : "rgba(255,255,255,0.04)",
                  color: cell === "17" ? "#ffffff" : "#9fb5cf",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            borderRadius: "16px",
            padding: "14px",
            background: "rgba(8,39,67,0.72)",
            border: "1px solid rgba(107,157,210,0.18)",
            display: "grid",
            gap: "8px",
            alignContent: "start",
          }}
        >
          <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>Conference Event</div>
          <div style={{ color: "#8fa8c3", fontSize: "12px" }}>Date Range</div>
          <div style={{ color: "#8fa8c3", fontSize: "12px" }}>City / State</div>
          <div style={{ color: "#8fa8c3", fontSize: "12px" }}>Venue</div>
          <div style={{ color: "#8fa8c3", fontSize: "12px" }}>Event Link</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
            {["Category Tags", "Market Focus"].map((chip) => (
              <span
                key={chip}
                style={{
                  borderRadius: "999px",
                  padding: "6px 9px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(107,157,210,0.12)",
                  color: "#dbeafe",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </OutlookVisualShell>
  );
}

function SidebarPanel({
  title,
  body,
  bullets,
}: {
  title: string;
  body?: string;
  bullets?: string[];
}) {
  return (
    <PageCard padding="20px">
      <div style={{ display: "grid", gap: "10px" }}>
        <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900, lineHeight: 1.15 }}>{title}</div>
        {body ? <p style={{ margin: 0, color: "#c8d8ec", fontSize: "14px", lineHeight: 1.55 }}>{body}</p> : null}
        {bullets ? (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "10px" }}>
            {bullets.map((bullet) => (
              <li key={bullet} style={{ display: "grid", gridTemplateColumns: "10px 1fr", gap: "10px", alignItems: "start" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#2dd4bf", marginTop: "5px", boxShadow: "0 0 12px rgba(45,212,191,0.28)" }} />
                <span style={{ color: "#c8d8ec", fontSize: "14px", lineHeight: 1.45 }}>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </PageCard>
  );
}

function QuestionsPanel() {
  const faqs = [
    {
      q: "Can I edit subscribed events?",
      a: "You can add your own notes in Outlook, but subscribed event details are controlled by the CCC feed.",
    },
    {
      q: "Why did my calendar not update right away?",
      a: "Outlook refreshes internet calendars on its own schedule, so feed changes can take time to appear.",
    },
    {
      q: "Can I subscribe to multiple CCC feeds?",
      a: "Yes. You can use a different live ICS link for each conference view you want to track.",
    },
    {
      q: "Can I remove the feed later?",
      a: "Yes. You can remove the subscribed calendar from Outlook at any time.",
    },
    {
      q: "Does this work with Outlook 365?",
      a: "Yes. The wording may vary slightly by version, but Outlook 365 supports subscribed web calendars.",
    },
  ];

  return (
    <PageCard padding="20px">
      <div style={{ display: "grid", gap: "12px" }}>
        <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900, lineHeight: 1.15 }}>Common questions</div>
        <div style={{ display: "grid", gap: "10px" }}>
          {faqs.map((item) => (
            <details
              key={item.q}
              style={{
                borderRadius: "14px",
                border: "1px solid rgba(107,157,210,0.16)",
                background: "rgba(3,20,38,0.84)",
                padding: "12px 14px",
              }}
            >
              <summary style={{ cursor: "pointer", fontSize: "14px", fontWeight: 800, color: "#ffffff", listStyle: "none" }}>
                {item.q}
              </summary>
              <p style={{ margin: "10px 0 0 0", color: "#c8d8ec", fontSize: "13px", lineHeight: 1.5 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </PageCard>
  );
}

function BottomCta() {
  return (
    <PageCard padding="22px 24px">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ color: "#ffffff", fontSize: "28px", lineHeight: 1.08, fontWeight: 900 }}>Need a different calendar?</div>
          <div style={{ color: "#c8d8ec", fontSize: "14px", lineHeight: 1.5, maxWidth: "760px" }}>
            You can also subscribe to your CCC live feed in Google Calendar or Apple Calendar using the same ICS link.
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/help/google-calendar"
            style={{
              textDecoration: "none",
              height: "46px",
              padding: "0 16px",
              borderRadius: "12px",
              border: "1px solid rgba(107,157,210,0.22)",
              background: "rgba(8,31,55,0.62)",
              color: "#dbeafe",
              fontSize: "14px",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Google Calendar Setup
          </Link>
          <Link
            href="/help/apple-calendar"
            style={{
              textDecoration: "none",
              height: "46px",
              padding: "0 16px",
              borderRadius: "12px",
              border: "1px solid rgba(107,157,210,0.22)",
              background: "rgba(8,31,55,0.62)",
              color: "#dbeafe",
              fontSize: "14px",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Apple Calendar Setup
          </Link>
          <Link
            href="/events"
            style={{
              textDecoration: "none",
              height: "46px",
              padding: "0 16px",
              borderRadius: "12px",
              background: "linear-gradient(180deg, #3b82f6, #2563eb)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Back to Discovery
          </Link>
        </div>
      </div>
    </PageCard>
  );
}

export default async function OutlookCalendarHelpPage(props: {
  searchParams?: Promise<{ feedUrl?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const feedUrl = resolveFeedUrl(searchParams?.feedUrl);

  return (
    <AppShell active="feeds">
      <div
        style={{
          maxWidth: "1180px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 72px",
          display: "grid",
          gap: "20px",
          background:
            "radial-gradient(circle at 18% 0%, rgba(59,130,246,0.10), transparent 32%), radial-gradient(circle at 92% 0%, rgba(45,212,191,0.07), transparent 28%), linear-gradient(180deg, #04182c 0%, #051b31 100%)",
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.96fr) minmax(540px, 1.04fr)",
            gap: "24px",
            alignItems: "center",
          }}
          className="ccc-outlook-hero"
        >
          <div style={{ display: "grid", gap: "14px" }}>
            <Eyebrow>Outlook Calendar Setup · Live ICS Feed</Eyebrow>
            <div style={{ color: "#ffffff", fontSize: "48px", lineHeight: 1, fontWeight: 950, letterSpacing: "-0.045em", maxWidth: "760px" }}>
              Add your CCC live feed to Outlook Calendar.
            </div>
            <div style={{ color: "#d9e8fb", fontSize: "19px", lineHeight: 1.4, fontWeight: 650, maxWidth: "760px" }}>
              You already created your conference view. Now copy the live ICS feed link and subscribe to it in Outlook so matching conferences appear on your calendar.
            </div>
            <div style={{ color: "#a9bfd8", fontSize: "15px", lineHeight: 1.5, maxWidth: "760px" }}>
              Outlook will refresh subscribed internet calendars on its own schedule. Updates may not appear instantly, but your feed stays connected to the CCC conference view you selected.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["Live ICS feed", "Outlook Calendar", "One-time setup", "Updates after refresh"].map((chip) => (
                <span
                  key={chip}
                  style={{
                    borderRadius: "999px",
                    padding: "8px 12px",
                    background: "rgba(8,31,55,0.58)",
                    border: "1px solid rgba(107,157,210,0.16)",
                    color: "#d9e8fb",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href="#live-feed-link"
                style={{
                  textDecoration: "none",
                  height: "46px",
                  padding: "0 18px",
                  borderRadius: "12px",
                  background: "linear-gradient(180deg, #3b82f6, #2563eb)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Copy Live Feed Link
              </a>
              <a
                href="https://outlook.office.com/calendar/"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  height: "46px",
                  padding: "0 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(107,157,210,0.24)",
                  background: "rgba(8,31,55,0.62)",
                  color: "#dbeafe",
                  fontSize: "14px",
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Open Outlook Calendar
              </a>
            </div>
          </div>

          <div style={{ display: "grid", gap: "14px", width: "100%", justifyItems: "stretch" }}>
            <ProviderTabs />
            <HeroFlowVisual />
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.42fr) minmax(300px, 0.72fr)",
            gap: "18px",
            alignItems: "start",
          }}
          className="ccc-outlook-main"
        >
          <div style={{ display: "grid", gap: "18px" }}>
            <div id="live-feed-link">
              <LiveFeedLinkCard feedUrl={feedUrl} />
            </div>

            <StepCard
              number={1}
              title="Copy your CCC live feed link"
              description="Click “Copy Live Feed Link” to copy the ICS subscription URL for your selected conference view."
              visual={<Step1Visual />}
            />
            <StepCard
              number={2}
              title="Open Outlook Calendar"
              description="Open Outlook and switch to Calendar view."
              visual={<Step2Visual />}
            />
            <StepCard
              number={3}
              title="Choose Add Calendar"
              description="Select Add Calendar, then choose Subscribe from web or From Internet depending on your Outlook version."
              visual={<Step3Visual />}
            />
            <StepCard
              number={4}
              title="Paste the ICS feed link"
              description="Paste your CCC live feed link into the calendar URL field."
              visual={<Step4Visual />}
            />
            <StepCard
              number={5}
              title="Name and subscribe"
              description="Name the calendar “Capital Conference Calendar” or use the name of your saved view, then click Import or Subscribe."
              visual={<Step5Visual />}
            />
            <StepCard
              number={6}
              title="Your conference feed is connected"
              description="Matching conferences will appear in Outlook Calendar after Outlook refreshes the subscribed feed."
              visual={<Step6Visual />}
            />

            <BottomCta />
          </div>

          <aside style={{ display: "grid", gap: "14px", position: "sticky", top: "96px", alignSelf: "start" }}>
            <SidebarPanel
              title="What is an ICS feed?"
              body="An ICS feed is a calendar subscription link. Instead of manually adding each conference, you subscribe once and Outlook can display matching events from the CCC conference view you selected."
            />
            <SidebarPanel
              title="What updates?"
              bullets={[
                "New matching conferences",
                "Date or location changes",
                "Removed or cancelled events",
                "Reclassified events",
                "Updated event links",
              ]}
            />
            <SidebarPanel
              title="Refresh timing"
              body="Outlook controls how often subscribed calendars refresh. Updates may take time to appear depending on your Outlook version, account type, and device."
            />
            <QuestionsPanel />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
