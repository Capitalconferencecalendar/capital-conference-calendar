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
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function HeroApplePreview() {
  return cardFrame(
    <div style={{ display: "grid", gridTemplateColumns: "88px minmax(0, 1fr)", minHeight: "220px" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(160deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
          borderRight: "1px solid #e2e8f0",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: "28px",
          textShadow: "0 1px 2px rgba(0,0,0,0.18)",
        }}
      >
        9
      </div>
      <div style={{ padding: "10px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>Apple Calendar</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: "10px" }}>
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
                    backgroundColor: i === 11 ? "#6b7280" : "transparent",
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
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>iCloud</div>
            <div style={{ display: "grid", gap: "6px", fontSize: "12px", color: "#0f172a" }}>
              <div>Home</div>
              <div>Work</div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#8b5cf6" }} />
                Capital Conference Calendar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterAndMetricVisual() {
  return cardFrame(
    <div style={{ padding: "10px" }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Build Your Market View</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px", marginBottom: "6px" }}>
          {[
            "Category",
            "Issuer Participation",
            "Sector / Themes",
            "Market Focus",
            "Country",
            "Region",
          ].map((field) => (
            <div key={field} style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px", fontSize: "11px", color: "#64748b" }}>
              {field}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px" }}>
          {["Start Date", "End Date"].map((field) => (
            <div key={field} style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px", fontSize: "11px", color: "#64748b", backgroundColor: "#fbfcfe" }}>
              {field}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopyLinkVisual({ feedUrl }: { feedUrl: string }) {
  return cardFrame(
    <CopyLinkMockup
      feedUrl={feedUrl}
      borderColor="#d1d5db"
      buttonBorderColor="#374151"
      buttonBgColor="#374151"
    />
  );
}

function AppleMenuBarVisual() {
  return cardFrame(
    <div style={{ padding: "10px" }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: "16px", padding: "8px 10px", backgroundColor: "#f3f4f6", fontSize: "12px", color: "#334155" }}>
          {["Calendar", "File", "Edit", "View", "Window", "Help"].map((item) => (
            <span key={item} style={{ fontWeight: item === "File" ? 800 : 600, color: item === "File" ? "#111827" : "#475569" }}>
              {item}
            </span>
          ))}
        </div>
        <div style={{ padding: "10px", fontSize: "12px", color: "#64748b" }}>Open Apple Calendar and select File from the top menu.</div>
      </div>
    </div>
  );
}

function NewSubscriptionMenuVisual() {
  return cardFrame(
    <div style={{ padding: "10px" }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {["New Event", "New Calendar", "New Calendar Subscription...", "New Calendar Group", "Import..."].map((item) => (
          <div
            key={item}
            style={{
              padding: "8px 10px",
              fontSize: "12px",
              color: item.includes("Subscription") ? "#111827" : "#334155",
              backgroundColor: item.includes("Subscription") ? "#e5e7eb" : "#ffffff",
              fontWeight: item.includes("Subscription") ? 700 : 500,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function PasteUrlModalVisual({ feedUrl }: { feedUrl: string }) {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>New Calendar Subscription</div>
      <div style={{ fontSize: "11px", color: "#64748b" }}>Calendar URL</div>
      <div style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "7px", fontSize: "12px", color: "#334155", overflowWrap: "anywhere" }}>
        {feedUrl}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={{ border: "1px solid #374151", backgroundColor: "#374151", color: "#fff", fontSize: "12px", borderRadius: "6px", padding: "6px 10px" }}>
          Subscribe
        </button>
      </div>
    </div>
  );
}

function RefreshSettingsVisual() {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Subscription Settings</div>
      <div style={{ display: "grid", gap: "6px" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px", fontSize: "12px", color: "#334155" }}>Name: Capital Conference Calendar</div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px", fontSize: "12px", color: "#334155" }}>Color: Purple</div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px", fontSize: "12px", color: "#334155" }}>Refresh: Every hour</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={{ border: "1px solid #374151", backgroundColor: "#374151", color: "#fff", fontSize: "12px", borderRadius: "6px", padding: "6px 12px" }}>
          OK
        </button>
      </div>
    </div>
  );
}

function AppleLiveVisual() {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>iCloud calendars</div>
      <div style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#334155" }}>
        <div>Home</div>
        <div>Work</div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px", backgroundColor: "#fafafa" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#8b5cf6" }} />
          Capital Conference Calendar
        </div>
      </div>
    </div>
  );
}

export default async function AppleCalendarHelpPage(props: {
  searchParams?: Promise<{ feedUrl?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const feedUrl = resolveFeedUrl(searchParams?.feedUrl);

  return (
    <GuideLayout
      breadcrumbCurrent="Apple Calendar"
      platformLabel="Apple Calendar Setup"
      accent="#6b7280"
      headline="Add Your Conference Feed to Apple Calendar"
      subheadline="Subscribe to the live Capital Conference Calendar feed and your filtered events will automatically appear in your Apple Calendar"
      chips={["One-time setup", "Automatic updates", "Remove anytime"]}
      heroPreview={<HeroApplePreview />}
      workflowItems={[]}
      steps={[
        { number: 1, title: "Build your market view", copy: "Use filters in Capital Conference Calendar to create the exact conference view you want in Apple Calendar.", visual: <FilterAndMetricVisual /> },
        { number: 2, title: "Copy your live calendar link", copy: "Click “Copy Live Calendar Link” on the right panel. Your unique subscription URL is copied to your clipboard.", visual: <CopyLinkVisual feedUrl={feedUrl} /> },
        { number: 3, title: "Open Apple Calendar", copy: "Open Apple Calendar on your Mac. From the top menu, click File.", visual: <AppleMenuBarVisual /> },
        { number: 4, title: "Select “New Calendar Subscription”", copy: "From the File menu, choose “New Calendar Subscription.”", visual: <NewSubscriptionMenuVisual /> },
        { number: 5, title: "Paste your live calendar link", copy: "Paste your Capital Conference Calendar link into the subscription URL field, then click “Subscribe.”", visual: <PasteUrlModalVisual feedUrl={feedUrl} /> },
        { number: 6, title: "Choose refresh settings", copy: "Name your calendar, choose a color, and select a refresh frequency. Then click OK.", visual: <RefreshSettingsVisual /> },
        { number: 7, title: "Your conference calendar is live", copy: "Your live feed will appear in Apple Calendar. Matching events will update based on your selected refresh settings.", visual: <AppleLiveVisual /> },
      ]}
      supportCards={[
        { title: "Important: Refresh Timing", body: "Apple Calendar lets you choose a refresh frequency for subscribed calendars. Updates from Capital Conference Calendar appear after Apple Calendar refreshes the feed." },
        {
          title: "What happens after you subscribe?",
          bullets: [
            "New matching conferences can appear automatically",
            "Conference updates can be reflected",
            "Cancelled events can be removed",
            "You can change refresh settings",
            "You can unsubscribe at any time",
          ],
        },
      ]}
      faqs={[
        { question: "Can I edit subscribed events?", answer: "Subscribed feed data comes from the source. You can add your own notes locally, but feed events sync from Capital Conference Calendar." },
        { question: "Can I change refresh frequency?", answer: "Yes. Apple Calendar lets you adjust how often subscribed calendars refresh." },
        { question: "Can I subscribe on iPhone or iPad?", answer: "Yes. Subscribed calendars can sync to your Apple devices through iCloud." },
        { question: "Can I unsubscribe later?", answer: "Yes. You can remove the subscribed calendar at any time." },
      ]}
    />
  );
}
