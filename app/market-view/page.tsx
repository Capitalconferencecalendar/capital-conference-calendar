import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import MarketViewClient from "./MarketViewClient";
import { getDiscoveryPage } from "../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Market View | Capital Conference Calendar",
};

export default async function MarketViewPage() {
  const [initialPage, tickerPage] = await Promise.all([
    getDiscoveryPage({ limit: 30 }),
    getDiscoveryPage({ limit: 20 }),
  ]);
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
