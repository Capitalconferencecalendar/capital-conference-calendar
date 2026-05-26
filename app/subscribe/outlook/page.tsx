import SetupGuidePage from "../SetupGuidePage";

export default function OutlookGuidePage() {
  return (
    <SetupGuidePage
      platform="Outlook"
      accent="#0a66c2"
      heroTitle="Add Your Conference Feed to Outlook"
      heroSubhead="Subscribe once and keep your conference calendar automatically updated as new matching events are added."
      steps={[
        {
          title: "Build Your Market View",
          body: "Set your filters to reflect the conference coverage your team cares about across regions, sectors, and participation formats.",
          callout: "Choose the precise view before subscribing.",
        },
        {
          title: "Copy Your Live Calendar Link",
          body: "Copy the generated live calendar link from the feed panel so Outlook can subscribe to this exact filtered conference set.",
          callout: "Copy once, then reuse for Outlook setup.",
        },
        {
          title: "Add Internet Calendar In Outlook",
          body: "In Outlook, add an internet calendar and paste your live calendar link to subscribe and receive ongoing conference updates.",
          callout: "Use the internet calendar subscription field.",
        },
      ]}
    />
  );
}
