import type { Metadata } from "next";
import AppShell from "../../components/AppShell";
import MarketViewV2PreviewClient from "./MarketViewV2PreviewClient";

export const metadata: Metadata = {
  title: "Market View V2 Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarketViewV2PreviewPage() {
  return (
    <AppShell active="dashboard" workspaceMode="marketview" tickerEvents={[]}>
      <MarketViewV2PreviewClient />
    </AppShell>
  );
}
