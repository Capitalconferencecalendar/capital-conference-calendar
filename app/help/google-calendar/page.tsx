import GuideLayout from "../calendar-setup/GuideLayout";
import CopyLinkMockup from "../calendar-setup/CopyLinkMockup";

const DEFAULT_FEED_URL = "https://capitalconferencecalendar.com/api/ics?view=investor-conferences";
const DISPLAY_FEED_URL = "https://capitalconferencecalendar.com/api/ics?view=your-market-view";

function resolveFeedUrl(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return DEFAULT_FEED_URL;
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return DEFAULT_FEED_URL;
}

function frame(children: React.ReactNode, padding = "18px") {
  return (
    <div
      style={{
        padding,
        background: "linear-gradient(180deg, rgba(8,31,55,0.98), rgba(4,20,36,0.98))",
        border: "1px solid rgba(107, 157, 210, 0.18)",
        borderRadius: "18px",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        color: "#8fb8ff",
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "999px",
        padding: "8px 12px",
        border: "1px solid rgba(107,157,210,0.16)",
        background: "rgba(6, 24, 44, 0.82)",
        color: "#dbeafe",
        fontSize: "13px",
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

function HeroGooglePreview() {
  return frame(
    <div style={{ display: "grid", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <Label>Live feed setup</Label>
        <span style={{ fontSize: "12px", color: "#2dd4bf", fontWeight: 800 }}>Google Calendar</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr auto 1fr",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <div style={{ borderRadius: "16px", padding: "14px", background: "rgba(8, 39, 67, 0.9)", border: "1px solid rgba(107,157,210,0.18)" }}>
          <Label>Filtered Market View</Label>
          <div style={{ marginTop: "10px", color: "#ffffff", fontSize: "18px", fontWeight: 900 }}>Healthcare Conferences</div>
          <div style={{ marginTop: "6px", color: "#8fa8c3", fontSize: "13px" }}>NYC · Investors · Next 30 days</div>
        </div>
        <div style={{ color: "#3b82f6", fontSize: "24px", fontWeight: 900 }}>→</div>
        <div style={{ borderRadius: "16px", padding: "14px", background: "rgba(3, 20, 38, 0.86)", border: "1px solid rgba(59,130,246,0.22)" }}>
          <Label>Live ICS Feed</Label>
          <div style={{ marginTop: "12px", color: "#dbeafe", fontSize: "13px", lineHeight: 1.5 }}>Updates automatically as conferences are added, reviewed, and reclassified.</div>
        </div>
        <div style={{ color: "#3b82f6", fontSize: "24px", fontWeight: 900 }}>→</div>
        <div style={{ borderRadius: "16px", padding: "14px", background: "rgba(8, 39, 67, 0.9)", border: "1px solid rgba(107,157,210,0.18)" }}>
          <Label>Google Calendar</Label>
          <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
            {["M", "T", "W", "T", "F", "S", "S", "", "15", "16", "17", "18", "19", "", ""].map((cell, index) => (
              <div
                key={`${cell}-${index}`}
                style={{
                  minHeight: "22px",
                  borderRadius: "8px",
                  background: cell === "17" ? "#3b82f6" : "rgba(255,255,255,0.04)",
                  color: cell === "17" ? "#ffffff" : "#9fb5cf",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
  );
}

function Step1Visual() {
  return frame(
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
        {["Location", "Market Focus", "Audience"].map((label, index) => (
          <div key={label} style={{ borderRadius: "14px", padding: "12px", background: index === 0 ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(107,157,210,0.16)" }}>
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ marginTop: "8px", color: "#ffffff", fontSize: "15px", fontWeight: 800 }}>
              {label === "Location" ? "New York, NY" : label === "Market Focus" ? "Healthcare" : "Institutional Investors"}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {["Upcoming 30 Days", "Hot Weeks", "Investor Conferences", "Saved View"].map((chip) => (
          <Pill key={chip}>{chip}</Pill>
        ))}
      </div>
    </div>,
  );
}

function Step2Visual({ feedUrl }: { feedUrl: string }) {
  return frame(
    <CopyLinkMockup
      feedUrl={feedUrl}
      displayFeedUrl={DISPLAY_FEED_URL}
      borderColor="rgba(107, 157, 210, 0.24)"
      buttonBorderColor="#2563eb"
      buttonBgColor="#2563eb"
      dark
      title="Copy your CCC live feed link"
      subtitle="Use this subscription link in Google Calendar."
      copiedLabel="Live feed copied."
    />,
  );
}

function Step3Visual() {
  return frame(
    <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: "14px", alignItems: "start" }}>
      <div style={{ borderRadius: "16px", padding: "14px", background: "rgba(8,39,67,0.78)", border: "1px solid rgba(107,157,210,0.16)" }}>
        <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>Google Calendar</div>
        <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
          {["S", "M", "T", "W", "T", "F", "S", "", "", "15", "16", "17", "18", "19"].map((cell, index) => (
            <div
              key={`${cell}-${index}`}
              style={{
                minHeight: "24px",
                borderRadius: "8px",
                background: cell === "17" ? "rgba(59,130,246,0.95)" : "rgba(255,255,255,0.04)",
                color: cell === "17" ? "#ffffff" : "#9fb5cf",
                fontSize: "11px",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
              }}
            >
              {cell}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gap: "8px" }}>
        <div style={{ color: "#8fa8c3", fontSize: "12px", fontWeight: 800 }}>Other calendars</div>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", border: "1px solid rgba(59,130,246,0.34)", color: "#8fb8ff", display: "grid", placeItems: "center", fontSize: "26px", fontWeight: 800 }}>+</div>
        <div style={{ color: "#8fa8c3", fontSize: "12px", lineHeight: 1.45 }}>Click the plus icon to add a new calendar from URL.</div>
      </div>
    </div>,
  );
}

function Step4Visual() {
  return frame(
    <div style={{ display: "grid", gap: "8px" }}>
      {["Add calendar", "Browse calendars of interest", "Create new calendar", "From URL", "Import"].map((item) => (
        <div
          key={item}
          style={{
            borderRadius: "12px",
            padding: "10px 12px",
            border: "1px solid rgba(107,157,210,0.14)",
            background: item === "From URL" ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
            color: item === "From URL" ? "#ffffff" : "#c8d8ec",
            fontSize: "13px",
            fontWeight: item === "From URL" ? 900 : 700,
          }}
        >
          {item}
        </div>
      ))}
    </div>,
  );
}

function Step5Visual() {
  return frame(
    <div style={{ display: "grid", gap: "10px" }}>
      <Label>From URL</Label>
      <div style={{ borderRadius: "14px", padding: "12px", background: "rgba(3,20,38,0.86)", border: "1px solid rgba(107,157,210,0.18)", color: "#c8d8ec", fontSize: "13px", overflowWrap: "anywhere" }}>
        {DISPLAY_FEED_URL}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{ borderRadius: "10px", padding: "10px 14px", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>
          Add calendar
        </span>
      </div>
    </div>,
  );
}

function Step6Visual() {
  return frame(
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ color: "#ffffff", fontSize: "16px", fontWeight: 900 }}>Capital Conference Calendar</div>
      <div style={{ display: "grid", gap: "8px" }}>
        <div style={{ color: "#8fa8c3", fontSize: "12px" }}>Calendar name</div>
        <div style={{ borderRadius: "12px", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,157,210,0.16)", color: "#dbeafe", fontSize: "13px" }}>
          Healthcare Conferences · New York · Investors
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2dd4bf", fontSize: "13px", fontWeight: 800 }}>
        <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#2dd4bf" }} />
        Feed updates automatically after Google refreshes the subscription.
      </div>
    </div>,
  );
}

export default async function GoogleCalendarHelpPage(props: {
  searchParams?: Promise<{ feedUrl?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const feedUrl = resolveFeedUrl(searchParams?.feedUrl);

  return (
    <GuideLayout
      platformKey="google"
      breadcrumbCurrent="Google Calendar"
      platformLabel="Google Calendar Setup"
      accent="#3b82f6"
      headline="Sync your conference view to your calendar."
      subheadline="Create a live conference feed from your Capital Conference Calendar market view and subscribe to it in Google Calendar."
      supportingCopy="When events are added, reviewed, or reclassified in the matching view, your subscribed calendar can update automatically after Google refreshes the feed."
      chips={["One-time setup", "Live ICS feed", "Google / Apple / Outlook", "Remove anytime"]}
      heroPreview={<HeroGooglePreview />}
      steps={[
        {
          number: 1,
          title: "Build the market view you want to track",
          copy: "Filter by date, city, market focus, organizer, audience, or quick feeds so the live calendar only reflects the conferences that matter to you.",
          visual: <Step1Visual />,
        },
        {
          number: 2,
          title: "Copy your live feed subscription link",
          copy: "Open calendar sync on the right side of Discovery and copy your CCC live feed link. This is the subscription URL Google will use.",
          visual: <Step2Visual feedUrl={feedUrl} />,
        },
        {
          number: 3,
          title: "Open Google Calendar",
          copy: "In Google Calendar, go to the left sidebar and find Other calendars. This is where you add a calendar from URL.",
          visual: <Step3Visual />,
        },
        {
          number: 4,
          title: "Choose From URL",
          copy: "Click the plus icon beside Other calendars, then choose From URL from the add-calendar menu.",
          visual: <Step4Visual />,
        },
        {
          number: 5,
          title: "Paste your CCC live feed link",
          copy: "Paste your subscription link and add the calendar. Google will create a subscribed calendar tied to your filtered market view.",
          visual: <Step5Visual />,
        },
        {
          number: 6,
          title: "Your live conference feed is connected",
          copy: "Your subscribed feed now appears in Google Calendar. It stays linked to the market view you created and can refresh as matching conferences change.",
          visual: <Step6Visual />,
        },
      ]}
      supportCards={[
        {
          title: "What happens after you subscribe?",
          bullets: [
            "New matching conferences can appear automatically",
            "Updated records can refresh into your calendar",
            "Reclassified events can move in or out of the feed",
            "You can remove the subscription at any time",
          ],
        },
        {
          title: "Important: refresh timing",
          body: "Google controls how often subscribed calendars refresh. New events do not appear instantly, but the link stays live and continues pulling updates from the same market view.",
        },
        {
          title: "Best uses for live feeds",
          bullets: [
            "Track one city or sector over the next 30 days",
            "Monitor sponsor targets or issuer windows",
            "Keep a saved market view in your calendar workflow",
          ],
        },
      ]}
      faqs={[
        {
          question: "Can I change the calendar name later?",
          answer: "Yes. Google lets you rename the subscribed calendar inside your calendar list after you add it.",
        },
        {
          question: "Will new conferences appear automatically?",
          answer: "Yes, as long as the new event matches your filtered market view and Google has refreshed the subscription.",
        },
        {
          question: "Can I subscribe to more than one CCC feed?",
          answer: "Yes. Each saved or filtered market view can have its own live subscription link.",
        },
        {
          question: "Does this work on desktop and mobile?",
          answer: "Yes. Once the feed is subscribed in your Google account, it can appear anywhere that Google Calendar syncs.",
        },
      ]}
    />
  );
}
