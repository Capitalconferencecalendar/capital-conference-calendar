import type { Metadata } from "next";
import AppShell from "../../components/AppShell";
import MarketViewV3PreviewClient from "./MarketViewV3PreviewClient";

export const metadata: Metadata = {
  title: "Market View V3 Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarketViewV3PreviewPage() {
  return (
    <AppShell active="dashboard" workspaceMode="marketview" tickerEvents={[]}>
      <MarketViewV3PreviewClient />
    </AppShell>
  );
}
