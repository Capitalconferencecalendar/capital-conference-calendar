import type { Metadata } from "next";
import AppShell from "../../components/AppShell";
import MarketViewClient from "../../market-view/MarketViewClient";

export const metadata: Metadata = {
  title: "Market View | Capital Conference Calendar",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarketViewV3PreviewPage() {
  return (
    <AppShell active="dashboard" workspaceMode="marketview" tickerEvents={[]}>
      <MarketViewClient />
    </AppShell>
  );
}
