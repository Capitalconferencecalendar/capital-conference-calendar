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
        color: "#c8d8ec",
      }}
    >
      {children}
    </div>
  );
}

function HeroApplePreview() {
  return frame(
    <div style={{ display: "grid", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <Label>Live feed setup</Label>
        <span style={{ fontSize: "12px", color: "#dbeafe", fontWeight: 800 }}>Apple Calendar</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr auto 0.95fr", gap: "12px", alignItems: "center" }}>
        <div style={{ borderRadius: "16px", padding: "14px", background: "rgba(8,39,67,0.82)", border: "1px solid rgba(107,157,210,0.18)" }}>
          <Label>Saved Market View</Label>
          <div style={{ marginTop: "10px", color: "#ffffff", fontSize: "18px", fontWeight: 900 }}>Private Markets · West Coast</div>
          <div style={{ marginTop: "6px", color: "#8fa8c3", fontSize: "13px" }}>Upcoming 30 days · Sponsor targets</div>
        </div>
        <div style={{ color: "#8b5cf6", fontSize: "24px", fontWeight: 900 }}>→</div>
        <div style={{ borderRadius: "16px", padding: "14px", background: "rgba(3,20,38,0.86)", border: "1px solid rgba(107,157,210,0.18)" }}>
          <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900, marginBottom: "10px" }}>Apple subscription preview</div>
          <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: "10px", alignItems: "center" }}>
            <div style={{ borderRadius: "16px", minHeight: "86px", background: "linear-gradient(180deg, #ef4444, #991b1b)", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: "22px" }}>17</div>
            <div style={{ display: "grid", gap: "6px" }}>
              <div style={{ color: "#dbeafe", fontSize: "14px", fontWeight: 800 }}>Capital Conference Calendar</div>
              <div style={{ color: "#8fa8c3", fontSize: "12px" }}>Refreshes on Apple’s subscription schedule.</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
  );
}

function Step1Visual() {
  return frame(
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
        {["Date & Timing", "Location", "Audience", "Market Focus"].map((label, index) => (
          <div key={label} style={{ borderRadius: "14px", padding: "12px", background: index === 0 ? "rgba(139,92,246,0.16)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(107,157,210,0.16)" }}>
            <div style={{ color: "#c8d8ec", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ marginTop: "8px", color: "#ffffff", fontSize: "15px", fontWeight: 800 }}>
              {label === "Date & Timing" ? "Hot Weeks" : label === "Location" ? "Canada Events" : label === "Audience" ? "Institutional Investors" : "Private Markets"}
            </div>
          </div>
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
      buttonBorderColor="#8b5cf6"
      buttonBgColor="#8b5cf6"
      dark
      title="Copy your CCC live feed link"
      subtitle="Use this subscription link in Apple Calendar."
      copiedLabel="Live feed copied."
    />,
  );
}

function Step3Visual() {
  return frame(
    <div style={{ display: "grid", gap: "10px" }}>
      <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 900 }}>Open Apple Calendar</div>
      <div style={{ display: "flex", gap: "18px", color: "#8fa8c3", fontSize: "13px", fontWeight: 700 }}>
        {["Calendar", "File", "Edit", "View", "Window", "Help"].map((item) => (
          <span key={item} style={{ color: item === "File" ? "#ffffff" : "#8fa8c3" }}>
            {item}
          </span>
        ))}
      </div>
      <div style={{ color: "#c8d8ec", fontSize: "13px" }}>From the top menu, choose File to open the subscription options.</div>
    </div>,
  );
}

function Step4Visual() {
  return frame(
    <div style={{ display: "grid", gap: "8px" }}>
      {["New Event", "New Calendar", "New Calendar Subscription...", "Import..."].map((item) => (
        <div
          key={item}
          style={{
            borderRadius: "12px",
            padding: "10px 12px",
            border: "1px solid rgba(107,157,210,0.14)",
            background: item.includes("Subscription") ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
            color: item.includes("Subscription") ? "#ffffff" : "#c8d8ec",
            fontSize: "13px",
            fontWeight: item.includes("Subscription") ? 900 : 700,
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
      <Label>Calendar URL</Label>
      <div style={{ borderRadius: "14px", padding: "12px", background: "rgba(3,20,38,0.86)", border: "1px solid rgba(107,157,210,0.18)", color: "#c8d8ec", fontSize: "13px", overflowWrap: "anywhere" }}>
        {DISPLAY_FEED_URL}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{ borderRadius: "10px", padding: "10px 14px", background: "#8b5cf6", color: "#ffffff", fontSize: "12px", fontWeight: 900 }}>
          Subscribe
        </span>
      </div>
    </div>,
  );
}

function Step6Visual() {
  return frame(
    <div style={{ display: "grid", gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
        {["Name", "Color", "Refresh"].map((label) => (
          <div key={label} style={{ borderRadius: "12px", padding: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,157,210,0.16)" }}>
            <div style={{ color: "#8fa8c3", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ marginTop: "8px", color: "#ffffff", fontSize: "14px", fontWeight: 800 }}>
              {label === "Name" ? "Capital Conference Calendar" : label === "Color" ? "Purple" : "Every hour"}
            </div>
          </div>
        ))}
      </div>
      <div style={{ color: "#2dd4bf", fontSize: "13px", fontWeight: 800 }}>Choose how often Apple Calendar checks the feed for updates.</div>
    </div>,
  );
}

function Step7Visual() {
  return frame(
    <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: "12px", alignItems: "center" }}>
      <div style={{ borderRadius: "16px", minHeight: "88px", background: "linear-gradient(180deg, #ef4444, #991b1b)", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: "22px" }}>17</div>
      <div style={{ display: "grid", gap: "6px" }}>
        <div style={{ color: "#ffffff", fontSize: "16px", fontWeight: 900 }}>Capital Conference Calendar</div>
        <div style={{ color: "#c8d8ec", fontSize: "13px" }}>Your live conference feed now appears in Apple Calendar and continues following the market view you created.</div>
      </div>
    </div>,
  );
}

export default async function AppleCalendarHelpPage(props: {
  searchParams?: Promise<{ feedUrl?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const feedUrl = resolveFeedUrl(searchParams?.feedUrl);

  return (
    <GuideLayout
      platformKey="apple"
      breadcrumbCurrent="Apple Calendar"
      platformLabel="Apple Calendar Setup"
      accent="#8b5cf6"
      headline="Sync your conference view to your calendar."
      subheadline="Create a live conference feed from your Capital Conference Calendar market view and subscribe to it in Apple Calendar."
      supportingCopy="Subscribed feeds can update as matching events are added, reviewed, or reclassified. Apple Calendar refresh timing depends on the frequency you choose during setup."
      chips={["One-time setup", "Live ICS feed", "Google / Apple / Outlook", "Remove anytime"]}
      heroPreview={<HeroApplePreview />}
      steps={[
        {
          number: 1,
          title: "Build the market view you want to track",
          copy: "Create the exact conference slice you want to follow before you subscribe. That filtered view becomes the live feed Apple Calendar will monitor.",
          visual: <Step1Visual />,
        },
        {
          number: 2,
          title: "Copy your live feed subscription link",
          copy: "Copy the CCC live feed URL from Discovery. This is the subscription link Apple Calendar uses to stay connected to your conference view.",
          visual: <Step2Visual feedUrl={feedUrl} />,
        },
        {
          number: 3,
          title: "Open Apple Calendar",
          copy: "Launch Apple Calendar on your Mac and use the top menu bar to access File.",
          visual: <Step3Visual />,
        },
        {
          number: 4,
          title: "Choose New Calendar Subscription",
          copy: "From the File menu, choose New Calendar Subscription to add a feed from URL.",
          visual: <Step4Visual />,
        },
        {
          number: 5,
          title: "Paste your CCC live feed link",
          copy: "Paste the subscription link into the calendar URL field and continue.",
          visual: <Step5Visual />,
        },
        {
          number: 6,
          title: "Choose refresh settings",
          copy: "Name the calendar, choose a color, and select how often Apple Calendar should refresh the subscription.",
          visual: <Step6Visual />,
        },
        {
          number: 7,
          title: "Your live conference feed is connected",
          copy: "Your subscribed feed now sits inside Apple Calendar and can update as the matching conference records change.",
          visual: <Step7Visual />,
        },
      ]}
      supportCards={[
        {
          title: "What happens after you subscribe?",
          bullets: [
            "Matching conferences can appear automatically",
            "Updated event records can refresh into Apple Calendar",
            "You can choose a refresh frequency during setup",
            "You can remove the subscription anytime",
          ],
        },
        {
          title: "Important: refresh timing",
          body: "Apple Calendar follows the refresh interval you choose when subscribing. Faster refresh settings help keep new events and reclassifications closer to the live CCC view.",
        },
        {
          title: "Best uses for live feeds",
          bullets: [
            "Track one region or sponsor target list",
            "Keep investor-heavy conference windows visible",
            "Monitor one saved view across desktop and mobile",
          ],
        },
      ]}
      faqs={[
        {
          question: "Can I rename the feed later?",
          answer: "Yes. Apple Calendar lets you update the display name and color for subscribed calendars after setup.",
        },
        {
          question: "Will this work on iPhone and iPad too?",
          answer: "Yes, if the subscribed calendar is part of the same Apple calendar account that syncs across your devices.",
        },
        {
          question: "Can I subscribe to multiple CCC market views?",
          answer: "Yes. Each saved or filtered view can have its own live subscription link and calendar.",
        },
        {
          question: "Why do updates not appear instantly?",
          answer: "Apple Calendar refreshes subscriptions on its own schedule or based on the interval you selected during setup.",
        },
      ]}
    />
  );
}
