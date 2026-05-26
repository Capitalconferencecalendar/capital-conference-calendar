import SetupGuidePage from "../SetupGuidePage";

export default function AppleCalendarGuidePage() {
  return (
    <SetupGuidePage
      platform="Apple Calendar"
      accent="#6b7280"
      heroTitle="Add Your Conference Feed to Apple Calendar"
      heroSubhead="Subscribe once and keep your conference calendar automatically updated as new matching events are added."
      steps={[
        {
          title: "Build Your Market View",
          body: "Create your market lens in the calendar view so your feed only includes conferences that match your current priorities.",
          callout: "Your feed output mirrors the active filters.",
        },
        {
          title: "Copy Your Live Calendar Link",
          body: "Use Copy Live Calendar Link in the feed panel to copy the subscription URL generated from your active market view.",
          callout: "The copied link is your Apple subscription source.",
        },
        {
          title: "Create New Calendar Subscription",
          body: "In Apple Calendar, choose New Calendar Subscription and paste your live calendar link to start syncing matching conferences.",
          callout: "Paste the URL into the subscription prompt.",
        },
      ]}
    />
  );
}
