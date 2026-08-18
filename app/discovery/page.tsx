import type { Metadata } from "next";
import { headers } from "next/headers";
import AppShell from "../components/AppShell";
import DiscoveryClient from "./DiscoveryClient";
import { getDiscoveryPage } from "../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Discovery | Capital Conference Calendar",
};

type SearchParamsShape = Record<string, string | string[] | undefined>;

type DiscoveryPageProps = {
  searchParams?: Promise<SearchParamsShape>;
};

export default async function DiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const reqHeaders = await headers();
  const params = (searchParams ? await searchParams : {}) as SearchParamsShape;
  const qParam = params.q;
  const initialSearchQuery = Array.isArray(qParam) ? qParam[0] || "" : qParam || "";
  const eventIdParam = params.eventId;
  const initialEventId = Array.isArray(eventIdParam) ? eventIdParam[0] || "" : eventIdParam || "";
  const initialPage = await getDiscoveryPage({
    q: initialSearchQuery,
    eventIds: initialEventId ? [initialEventId] : undefined,
    limit: 30,
  });
  const tickerPage = await getDiscoveryPage({ limit: 20 });
  const tickerEvents = tickerPage.events.length ? tickerPage.events : initialPage.events;
  const initialCity = reqHeaders.get("x-vercel-ip-city") || reqHeaders.get("x-city") || "";

  return (
    <AppShell
      active="dashboard"
      searchQuery={initialSearchQuery}
      tickerEvents={tickerEvents.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
      }))}
      workspaceMode="discovery"
    >
      <DiscoveryClient
        events={initialPage.events}
        initialPage={initialPage}
        initialCity={initialCity}
        initialSearchQuery={initialSearchQuery}
        initialMode="market"
        initialEventId={initialEventId}
      />
    </AppShell>
  );
}
