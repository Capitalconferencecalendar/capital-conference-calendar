import type { Metadata } from "next";
import AppShell from "../../components/AppShell";
import MarketViewClient from "../../market-view/MarketViewClient";
import { getDiscoveryPage } from "../../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Market View | Capital Conference Calendar",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MarketViewV3PreviewPage() {
  const initialPage = await getDiscoveryPage({ limit: 30 });
  const tickerPage = await getDiscoveryPage({ limit: 20 });
  const tickerEvents = tickerPage.events.length ? tickerPage.events : initialPage.events;

  return (
    <AppShell
      active="dashboard"
      workspaceMode="marketview"
      tickerEvents={tickerEvents.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
      }))}
    >
      <MarketViewClient initialPage={initialPage} />
    </AppShell>
  );
}
