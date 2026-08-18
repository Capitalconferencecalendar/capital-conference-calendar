import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import MarketViewV3PreviewClient from "../preview/market-view-v3/MarketViewV3PreviewClient";

export const metadata: Metadata = {
  title: "Market View | Capital Conference Calendar",
};

export default function MarketViewPage() {
  return (
    <AppShell active="dashboard" workspaceMode="marketview" tickerEvents={[]}>
      <MarketViewV3PreviewClient />
    </AppShell>
  );
}
