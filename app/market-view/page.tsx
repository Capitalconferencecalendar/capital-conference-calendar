import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import MarketViewClient from "./MarketViewClient";

export const metadata: Metadata = {
  title: "Market View | Capital Conference Calendar",
};

export default function MarketViewPage() {
  return (
    <AppShell active="dashboard" workspaceMode="marketview" tickerEvents={[]}>
      <MarketViewClient />
    </AppShell>
  );
}
