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

function HeroOutlookPreview() {
  return cardFrame(
    <div style={{ display: "grid", gridTemplateColumns: "88px minmax(0, 1fr)", minHeight: "220px" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #0a66c2 0%, #0f4f95 100%)",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: "34px",
        }}
      >
        O
      </div>
      <div style={{ padding: "10px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>Outlook Calendar</div>
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
                    backgroundColor: i === 11 ? "#0a66c2" : "transparent",
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
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>My calendars</div>
            <div style={{ display: "grid", gap: "6px", fontSize: "12px", color: "#0f172a" }}>
              <div>Calendar</div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#7e57c2" }} />
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
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
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
            <div key={field} style={{ border: "1px solid #dbe4ee", borderRadius: "6px", padding: "6px", fontSize: "11px", color: "#64748b" }}>
              {field}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px" }}>
          {["Start Date", "End Date"].map((field) => (
            <div key={field} style={{ border: "1px solid #dbe4ee", borderRadius: "6px", padding: "6px", fontSize: "11px", color: "#64748b", backgroundColor: "#fbfcfe" }}>
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
      borderColor="#bfd3ea"
      buttonBorderColor="#0a66c2"
      buttonBgColor="#0a66c2"
    />
  );
}

function OpenOutlookVisual() {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ border: "1px solid #dbe4ee", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ backgroundColor: "#0a66c2", color: "#fff", padding: "7px 10px", fontSize: "12px", fontWeight: 700 }}>
          Outlook
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", minHeight: "80px" }}>
          <div style={{ borderRight: "1px solid #e2e8f0", padding: "8px", fontSize: "12px", color: "#64748b" }}>Mail<br />Calendar</div>
          <div style={{ padding: "8px", fontSize: "12px", color: "#334155" }}>Calendar view selected</div>
        </div>
      </div>
    </div>
  );
}

function AddCalendarMenuVisual() {
  return cardFrame(
    <div style={{ padding: "10px" }}>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
        {["Add calendar", "Recommended", "Create blank calendar", "Subscribe from web", "Upload from file"].map((item) => (
          <div
            key={item}
            style={{
              padding: "8px 10px",
              fontSize: "12px",
              color: item === "Subscribe from web" ? "#0f3d75" : "#334155",
              backgroundColor: item === "Subscribe from web" ? "#eaf2fb" : "#ffffff",
              fontWeight: item === "Subscribe from web" ? 700 : 500,
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

function PasteUrlVisual({ feedUrl }: { feedUrl: string }) {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Subscribe from web</div>
      <div style={{ fontSize: "11px", color: "#64748b" }}>URL</div>
      <div style={{ border: "1px solid #bfd3ea", borderRadius: "6px", padding: "7px", fontSize: "12px", color: "#334155", overflowWrap: "anywhere" }}>
        {feedUrl}
      </div>
    </div>
  );
}

function NameAndSubscribeVisual() {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ fontSize: "11px", color: "#64748b" }}>Name</div>
      <div style={{ border: "1px solid #dbe4ee", borderRadius: "6px", padding: "7px", fontSize: "12px", color: "#334155" }}>Capital Conference Calendar</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "7px" }}>
        <button style={{ border: "1px solid #d7dde5", backgroundColor: "#ffffff", color: "#334155", fontSize: "12px", borderRadius: "6px", padding: "6px 10px" }}>
          Cancel
        </button>
        <button style={{ border: "1px solid #0a66c2", backgroundColor: "#0a66c2", color: "#fff", fontSize: "12px", borderRadius: "6px", padding: "6px 10px" }}>
          Import
        </button>
      </div>
    </div>
  );
}

function OutlookLiveVisual() {
  return cardFrame(
    <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>My calendars</div>
      <div style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#334155" }}>
        <div>Calendar</div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", border: "1px solid #dbe4ee", borderRadius: "8px", padding: "8px", backgroundColor: "#f8fbff" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#7e57c2" }} />
          Capital Conference Calendar
        </div>
      </div>
    </div>
  );
}

export default async function OutlookCalendarHelpPage(props: {
  searchParams?: Promise<{ feedUrl?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const feedUrl = resolveFeedUrl(searchParams?.feedUrl);

  return (
    <GuideLayout
      breadcrumbCurrent="Outlook Calendar"
      platformLabel="Outlook Calendar Setup"
      accent="#0a66c2"
      headline="Add Your Conference Feed to Outlook Calendar"
      subheadline="Subscribe to the live Capital Conference Calendar feed and your filtered events will automatically appear in your Outlook Calendar"
      chips={["One-time setup", "Automatic updates", "Remove anytime"]}
      heroPreview={<HeroOutlookPreview />}
      workflowItems={[]}
      steps={[
        { number: 1, title: "Build your market view", copy: "Use filters in Capital Conference Calendar to create the exact conference view you want in Outlook.", visual: <FilterAndMetricVisual /> },
        { number: 2, title: "Copy your live calendar link", copy: "Click “Copy Live Calendar Link” on the right panel. Your unique subscription URL is copied to your clipboard.", visual: <CopyLinkVisual feedUrl={feedUrl} /> },
        { number: 3, title: "Open Outlook Calendar", copy: "Open Outlook and go to the Calendar view.", visual: <OpenOutlookVisual /> },
        { number: 4, title: "Choose Add Calendar", copy: "Select Add Calendar, then choose Subscribe from web or From Internet depending on your Outlook version.", visual: <AddCalendarMenuVisual /> },
        { number: 5, title: "Paste your live calendar link", copy: "Paste your Capital Conference Calendar link into the calendar URL field.", visual: <PasteUrlVisual feedUrl={feedUrl} /> },
        { number: 6, title: "Name your calendar and subscribe", copy: "Name the calendar “Capital Conference Calendar,” then click Import or Subscribe.", visual: <NameAndSubscribeVisual /> },
        { number: 7, title: "Your conference calendar is live", copy: "Your live feed will appear in Outlook Calendar. Matching conferences will update based on Outlook’s refresh schedule.", visual: <OutlookLiveVisual /> },
      ]}
      supportCards={[
        { title: "Important: Refresh Timing", body: "Outlook refreshes subscribed internet calendars periodically. Refresh timing can vary by Outlook version and account type." },
        {
          title: "What happens after you subscribe?",
          bullets: [
            "New matching conferences can appear automatically",
            "Conference updates can be reflected",
            "Cancelled events can be removed",
            "You can subscribe to multiple conference views",
            "You can unsubscribe at any time",
          ],
        },
      ]}
      faqs={[
        { question: "Can I edit subscribed events?", answer: "Subscribed feed events are managed by the source. You can add local notes in Outlook, but synced event details come from the feed." },
        { question: "Does this work with Outlook 365?", answer: "Yes. Outlook 365 supports internet calendar subscriptions." },
        { question: "Why are updates not appearing immediately?", answer: "Outlook refreshes subscribed calendars periodically, so updates can take time to appear." },
        { question: "Can I subscribe to multiple feeds?", answer: "Yes. You can subscribe to multiple filtered conference views using separate live calendar links." },
      ]}
    />
  );
}
