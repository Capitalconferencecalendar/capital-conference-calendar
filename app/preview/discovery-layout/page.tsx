import type { Metadata } from "next";
import { headers } from "next/headers";
import AppShell from "../../components/AppShell";
import FixedDesktopWorkspace from "../../components/platform/FixedDesktopWorkspace";
import DiscoveryClient from "../../discovery/DiscoveryClient";
import { getDiscoveryPage } from "../../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Discovery Layout Preview | Capital Conference Calendar",
  robots: { index: false, follow: false },
};

type SearchParamsShape = Record<string, string | string[] | undefined>;

export default async function DiscoveryLayoutPreviewPage({ searchParams }: { searchParams?: Promise<SearchParamsShape> }) {
  const reqHeaders = await headers();
  const params = (searchParams ? await searchParams : {}) as SearchParamsShape;
  const q = Array.isArray(params.q) ? params.q[0] || "" : params.q || "";
  const eventId = Array.isArray(params.eventId) ? params.eventId[0] || "" : params.eventId || "";
  const initialPage = await getDiscoveryPage({ q, eventIds: eventId ? [eventId] : undefined, limit: 30 });
  const tickerPage = await getDiscoveryPage({ limit: 20 });
  const tickerEvents = tickerPage.events.length ? tickerPage.events : initialPage.events;

  return (
    <AppShell
      active="dashboard"
      workspaceMode="discovery"
      fixedDesktopPreview
      searchQuery={q}
      tickerEvents={tickerEvents.map((event) => ({ id: event.id, title: event.title, startDate: event.startDate, endDate: event.endDate, city: event.city }))}
    >
      <FixedDesktopWorkspace>
        <DiscoveryClient
          events={initialPage.events}
          initialPage={initialPage}
          initialCity={reqHeaders.get("x-vercel-ip-city") || reqHeaders.get("x-city") || ""}
          initialSearchQuery={q}
          initialEventId={eventId}
          initialMode="market"
        />
      </FixedDesktopWorkspace>
    </AppShell>
  );
}
