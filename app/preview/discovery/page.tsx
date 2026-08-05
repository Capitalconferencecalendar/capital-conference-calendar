import type { Metadata } from "next";
import { headers } from "next/headers";
import AppShell from "../../components/AppShell";
import DiscoveryPreviewClient from "./DiscoveryPreviewClient";
import {
  getPublicDatasetSnapshot,
  type PublicWorkspaceEvent,
} from "../../../lib/airtablePublicDataset";

export const metadata: Metadata = {
  title: "Discovery Preview",
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParamsShape = Record<string, string | string[] | undefined>;

type DiscoveryPreviewPageProps = {
  searchParams?: Promise<SearchParamsShape>;
};

export default async function DiscoveryPreviewPage({
  searchParams,
}: DiscoveryPreviewPageProps) {
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
      tickerEvents={events.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
      }))}
    >
      <DiscoveryPreviewClient
        events={events}
        initialCity={initialCity}
        initialSearchQuery={initialSearchQuery}
        initialEventId={initialEventId}
        previewContext={previewContext}
      />
    </AppShell>
  );
}
