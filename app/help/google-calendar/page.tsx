import GuideLayout from "../calendar-setup/GuideLayout";
import CopyLinkMockup from "../calendar-setup/CopyLinkMockup";

const DEFAULT_FEED_URL = "https://capitalconferences.com/api/ics/abc123";

function resolveFeedUrl(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return DEFAULT_FEED_URL;
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return DEFAULT_FEED_URL;
}

function cardFrame(children: React.ReactNode) {
  return (
    <div
      style={{
        border: "1px solid #dbe4ee",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function HeroGooglePreview() {
  return cardFrame(
    <div style={{ display: "grid", gridTemplateColumns: "86px minmax(0, 1fr)", minHeight: "220px" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(140deg, #1a73e8 0%, #34a853 40%, #fbbc05 72%, #ea4335 100%)",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: "38px",
        }}
      >
        31
      </div>
      <div style={{ padding: "10px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>Google Calendar</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "10px" }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
            <div style={{ fontSize: "12px", color: "#0f172a", fontWeight: 700, marginBottom: "6px" }}>May 2026</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {Array.from({ length: 28 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    fontSize: "10px",
                    color: i === 11 ? "#ffffff" : "#64748b",
                    backgroundColor: i === 11 ? "#1a73e8" : "transparent",
                    borderRadius: "999px",
                    height: "18px",
                    lineHeight: "18px",
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Other calendars</div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#0f172a" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#7e57c2" }} />
              Capital Conference Calendar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1Visual() {
  return cardFrame(
    <div style={{ padding: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "6px", marginBottom: "8px" }}>
        {["148", "49", "52", "4", "12"].map((value, idx) => (
          <div key={value} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", backgroundColor: idx === 0 ? "#f8fbff" : "#ffffff" }}>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>{value}</div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Metric</div>
          </div>
        ))}
      </div>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Build Your Market View</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
          {["Issuer", "Location", "Sector", "Market"].map((field) => (
            <div key={field} style={{ border: "1px solid #dbe4ee", borderRadius: "6px", padding: "6px", fontSize: "11px", color: "#64748b" }}>
              {field}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "7px" }}>
          <button style={{ border: "1px solid #0f2d4f", backgroundColor: "#0f2d4f", color: "#fff", fontSize: "11px", borderRadius: "6px", padding: "5px 8px" }}>
            Copy Live Calendar Link
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2Visual({ feedUrl }: { feedUrl: string }) {
  return cardFrame(
    <CopyLinkMockup
      feedUrl={feedUrl}
      borderColor="#c7d7ea"
      buttonBorderColor="#0f2d4f"
      buttonBgColor="#0f2d4f"
    />
  );
}

function Step3Visual() {
  return cardFrame(
    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px" }}>
      <div style={{ padding: "10px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Calendar</div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>May 2026</div>
          <div style={{ height: "72px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px" }} />
        </div>
      </div>
      <div style={{ borderLeft: "1px solid #e2e8f0", padding: "10px", position: "relative" }}>
        <div style={{ fontSize: "12px", color: "#475569", fontWeight: 700, marginBottom: "8px" }}>Other calendars</div>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            border: "2px solid #1d4f91",
            color: "#1d4f91",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "21px",
            fontWeight: 700,
          }}
        >
          +
        </div>
        <div style={{ position: "absolute", right: "10px", bottom: "10px", color: "#1d4f91", fontSize: "26px", fontWeight: 900 }}>↙</div>
      </div>
    </div>
  );
}

function Step4Visual() {
  return cardFrame(
    <div style={{ padding: "10px" }}>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
        {["Add calendar", "Subscribe to calendar", "Create new calendar", "Browse calendars of interest", "From URL", "Import"].map((item) => (
          <div
            key={item}
            style={{
              padding: "8px 10px",
              fontSize: "12px",
              color: item === "From URL" ? "#0f3d75" : "#334155",
              backgroundColor: item === "From URL" ? "#eaf2fb" : "#ffffff",
              fontWeight: item === "From URL" ? 700 : 500,
              borderBottom: "1px solid #eef2f7",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5Visual({ feedUrl }: { feedUrl: string }) {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>From URL</div>
      <div style={{ fontSize: "11px", color: "#64748b" }}>URL of calendar</div>
      <div style={{ border: "1px solid #a9c7e8", borderRadius: "6px", padding: "7px", fontSize: "12px", color: "#334155", overflowWrap: "anywhere" }}>
        {feedUrl}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "7px" }}>
        <button style={{ border: "1px solid #d7dde5", backgroundColor: "#fff", color: "#334155", fontSize: "12px", borderRadius: "6px", padding: "6px 10px" }}>
          Cancel
        </button>
        <button style={{ border: "1px solid #1d4f91", backgroundColor: "#1d4f91", color: "#fff", fontSize: "12px", borderRadius: "6px", padding: "6px 10px" }}>
          Add calendar
        </button>
      </div>
    </div>
  );
}

function Step6Visual() {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#334155", fontSize: "13px", fontWeight: 700 }}>
        <span>Other calendars</span>
        <span>+</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "14px", color: "#0f172a", border: "1px solid #dbe4ee", borderRadius: "8px", padding: "8px", backgroundColor: "#f8fbff" }}>
        <span style={{ width: "11px", height: "11px", borderRadius: "2px", backgroundColor: "#7e57c2" }} />
        Capital Conference Calendar
      </div>
      <div style={{ textAlign: "right", fontSize: "12px", color: "#1d4f91", fontWeight: 700 }}>Your live feed appears here</div>
    </div>
  );
}

export default async function GoogleCalendarHelpPage(props: {
  searchParams?: Promise<{ feedUrl?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const feedUrl = resolveFeedUrl(searchParams?.feedUrl);

  return (
    <GuideLayout
      breadcrumbCurrent="Google Calendar"
      platformLabel="Google Calendar Setup"
      accent="#1a73e8"
      headline="Add Your Conference Feed to Google Calendar"
      subheadline="Subscribe to the live Capital Conference Calendar feed and your filtered events will automatically appear in your Google Calendar"
      chips={["One-time setup", "Automatic updates", "Remove anytime"]}
      heroPreview={<HeroGooglePreview />}
      workflowItems={[]}
      steps={[
        {
          number: 1,
          title: "Build your market view",
          copy: "Use filters in Capital Conference Calendar to create the exact conference view you want in your calendar.",
          visual: <Step1Visual />,
        },
        {
          number: 2,
          title: "Copy your live calendar link",
          copy: "Click “Copy Live Calendar Link” on the right panel. Your unique subscription URL is copied to your clipboard.",
          visual: <Step2Visual feedUrl={feedUrl} />,
        },
        {
          number: 3,
          title: "Open Google Calendar",
          copy: "In Google Calendar, look at the left sidebar. Under “Other calendars,” click the + icon.",
          visual: <Step3Visual />,
        },
        {
          number: 4,
          title: "Select “From URL”",
          copy: "In the menu that appears, choose “From URL.”",
          visual: <Step4Visual />,
        },
        {
          number: 5,
          title: "Paste your link and click Add",
          copy: "Paste your Capital Conference Calendar link into the URL field, then click “Add calendar.”",
          visual: <Step5Visual feedUrl={feedUrl} />,
        },
        {
          number: 6,
          title: "Your conference calendar is live!",
          copy: "Your live feed will appear in the left sidebar. Matching events will start populating based on Google Calendar’s refresh schedule.",
          visual: <Step6Visual />,
        },
      ]}
      supportCards={[
        {
          title: "Important: Refresh Timing",
          body: "Google Calendar refreshes subscribed calendars periodically. Updates from Capital Conference Calendar may not appear instantly and can take several hours depending on Google’s refresh cycle.",
        },
        {
          title: "What happens after you subscribe?",
          bullets: [
            "New matching conferences can appear automatically",
            "Conference updates can be reflected",
            "Cancelled events can be removed",
            "You can unsubscribe at any time",
          ],
        },
      ]}
      faqs={[
        {
          question: "Can I edit subscribed events?",
          answer: "Subscribed events are managed by the source feed. You can edit your own notes locally, but core event data comes from the live feed.",
        },
        {
          question: "Will new conferences appear automatically?",
          answer: "Yes. New matching conferences can appear as Google refreshes subscribed calendars.",
        },
        {
          question: "Can I subscribe to multiple conference views?",
          answer: "Yes. Build different market views and subscribe to each with its own live calendar link.",
        },
        {
          question: "Does this work on mobile?",
          answer: "Yes. Once subscribed, the calendar appears across devices signed into your Google account.",
        },
      ]}
    />
  );
}
