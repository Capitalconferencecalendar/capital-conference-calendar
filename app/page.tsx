import { headers } from "next/headers";
import AppShell from "./components/AppShell";
import EventsClient from "./events/EventsClient";
import { getDiscoveryPage } from "../lib/discoveryDataset";

type SearchParamsShape = Record<string, string | string[] | undefined>;

type HomePageProps = {
  searchParams?: Promise<SearchParamsShape>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
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
  const modeParam = params.mode;
  const initialModeRaw = Array.isArray(modeParam) ? modeParam[0] || "" : modeParam || "";
  const initialMode =
    initialModeRaw === "getstarted" ||
    initialModeRaw === "market" ||
    initialModeRaw === "marketview" ||
    initialModeRaw === "about" ||
    initialModeRaw === "contact" ||
    initialModeRaw === "legal" ||
    initialModeRaw === "subscribe" ||
    initialModeRaw === "submit"
      ? initialModeRaw
      : "market";

  const initialCity = reqHeaders.get("x-vercel-ip-city") || reqHeaders.get("x-city") || "";

  return (
    <AppShell
      active={
        initialMode === "about"
          ? "about"
          : initialMode === "contact"
            ? "help"
            : initialMode === "legal"
              ? "legal"
              : initialMode === "subscribe"
                ? "feeds"
                : initialMode === "submit"
                  ? "submit"
                  : "dashboard"
      }
      searchQuery={initialSearchQuery}
      tickerEvents={tickerEvents.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
      }))}
      workspaceMode={
        initialMode === "getstarted"
          ? "getstarted"
          : initialMode === "marketview"
            ? "marketview"
            : "discovery"
      }
    >
      <EventsClient
        events={initialPage.events}
        initialPage={initialPage}
        initialCity={initialCity}
        initialSearchQuery={initialSearchQuery}
        initialMode={initialMode}
        initialEventId={initialEventId}
      />
    </AppShell>
  );
}
