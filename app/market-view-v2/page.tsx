import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import MarketIntelligenceV2Client from "./MarketIntelligenceV2Client";
import { getScopedMarketIntelligenceEvents } from "../../lib/discoveryDataset";
import { buildWeeklyMarketSignal } from "../../lib/marketIntelligenceV2";

export const metadata: Metadata = {
  title: "Market Intelligence V2 | Capital Conference Calendar",
};

export default async function MarketIntelligenceV2Page() {
  const events = await getScopedMarketIntelligenceEvents();
  const asOfDate = new Date().toISOString().slice(0, 10);
  const finding = buildWeeklyMarketSignal(events, {
    scope: {
      population: "full-market",
      activeFilters: {},
      asOfDate,
      geography: [],
      comparisonPopulation: {
        label: "Full upcoming conference index",
        eventCount: events.length,
        dateWindow: null,
      },
    },
  });

  return (
    <AppShell
      active="dashboard"
      workspaceMode="marketview"
      tickerEvents={events.slice(0, 20).map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
      }))}
    >
      <MarketIntelligenceV2Client finding={finding} />
    </AppShell>
  );
}
