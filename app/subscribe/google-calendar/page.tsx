import SetupGuidePage from "../SetupGuidePage";

export default function GoogleCalendarGuidePage() {
  return (
    <SetupGuidePage
      platform="Google Calendar"
      accent="#1a73e8"
      heroTitle="Add Your Conference Feed to Google Calendar"
      heroSubhead="Subscribe once and keep your conference calendar automatically updated as new matching events are added."
      steps={[
        {
          title: "Build Your Market View",
          body: "Use Market Calendar filters to define the conferences you want to track by sector, geography, organizer, and event type.",
          callout: "Start with the view you want your team to monitor.",
        },
        {
          title: "Copy Your Live Calendar Link",
          body: "In the feed panel, click Copy Live Calendar Link to capture your personalized subscription URL for this exact filtered view.",
          callout: "Use the primary copy button in the right-side panel.",
        },
        {
          title: "Add Calendar By URL In Google",
          body: "In Google Calendar, add a calendar by URL and paste your live calendar link to subscribe to matching conferences.",
          callout: "Paste the link into Add calendar by URL.",
        },
      ]}
    />
  );
}
