import type { Metadata } from "next";
import { headers } from "next/headers";
import AppShell from "../components/AppShell";
import DiscoveryClient from "./DiscoveryClient";
import {
  getPublicDatasetSnapshot,
  type PublicWorkspaceEvent,
} from "../../lib/airtablePublicDataset";

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
  const initialCity = reqHeaders.get("x-vercel-ip-city") || reqHeaders.get("x-city") || "";
  const { approvedEvents, previewContext } = await getPublicDatasetSnapshot();
  const events = approvedEvents as PublicWorkspaceEvent[];

  return (
    <AppShell
      active="dashboard"
      searchQuery={initialSearchQuery}
      workspaceMode="discovery"
      tickerEvents={events.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
      }))}
    >
      <DiscoveryClient
        events={events}
        initialCity={initialCity}
        initialSearchQuery={initialSearchQuery}
        initialEventId={initialEventId}
        previewContext={previewContext}
      />
    </AppShell>
  );
}
