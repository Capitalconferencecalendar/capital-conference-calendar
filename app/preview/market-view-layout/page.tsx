import type { Metadata } from "next";
import AppShell from "../../components/AppShell";
import FixedDesktopWorkspace from "../../components/platform/FixedDesktopWorkspace";
import MarketViewClient from "../../market-view/MarketViewClient";
import { getDiscoveryPage } from "../../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Market View Layout Preview | Capital Conference Calendar",
  robots: { index: false, follow: false },
};

export default async function MarketViewLayoutPreviewPage() {
  const initialPage = await getDiscoveryPage({ limit: 30 });
  const tickerPage = await getDiscoveryPage({ limit: 20 });
  const tickerEvents = tickerPage.events.length ? tickerPage.events : initialPage.events;

  return (
    <AppShell
      active="dashboard"
      workspaceMode="marketview"
      fixedDesktopPreview
      tickerEvents={tickerEvents.map((event) => ({ id: event.id, title: event.title, startDate: event.startDate, endDate: event.endDate, city: event.city }))}
    >
      <FixedDesktopWorkspace>
        <MarketViewClient initialPage={initialPage} />
      </FixedDesktopWorkspace>
    </AppShell>
  );
}
