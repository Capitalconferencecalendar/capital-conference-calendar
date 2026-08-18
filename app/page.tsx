import AppShell from "./components/AppShell";
import MarketViewV3PreviewClient from "./preview/market-view-v3/MarketViewV3PreviewClient";

export default function HomePage() {
  return (
    <AppShell
      active="dashboard"
      workspaceMode="marketview"
      tickerEvents={[]}
    >
      <MarketViewV3PreviewClient />
    </AppShell>
  );
}
