import type { Metadata } from "next";
import { headers } from "next/headers";
import AppShell from "../components/AppShell";
import DiscoveryClient from "./DiscoveryClient";
import { getDiscoveryPage } from "../../lib/discoveryDataset";
import type { DiscoveryQuery } from "../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Discovery | Capital Conference Calendar",
};

type SearchParamsShape = Record<string, string | string[] | undefined>;

type DiscoveryPageProps = {
  searchParams?: Promise<SearchParamsShape>;
};

function firstParam(params: SearchParamsShape, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function allParams(params: SearchParamsShape, key: string) {
  const value = params[key];
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

function buildInitialDiscoveryQuery(params: SearchParamsShape): DiscoveryQuery {
  const filterMode = firstParam(params, "filterMode");
  const sort = firstParam(params, "sort");
  const dateRange = firstParam(params, "dateRange");
  const fromDate = firstParam(params, "fromDate") || firstParam(params, "startDate");
  const toDate = firstParam(params, "toDate") || firstParam(params, "endDate");

  return {
    q: firstParam(params, "q"),
    eventIds: allParams(params, "eventId"),
    fromDate,
    toDate,
    cities: allParams(params, "city"),
    country: allParams(params, "country"),
    region: allParams(params, "region"),
    state: allParams(params, "state"),
    sectorThemes: allParams(params, "sectorTheme"),
    publicCompanySectors: allParams(params, "publicCompanySector"),
    conferenceType: allParams(params, "conferenceType"),
    issuerParticipation: allParams(params, "issuerParticipation"),
    organizer: allParams(params, "organizer"),
    marketFocus: allParams(params, "marketFocus"),
    dateRange: dateRange === "next30" || dateRange === "next60" || dateRange === "next90" || dateRange === "all" ? dateRange : undefined,
    sort: sort === "city" ? "city" : "soonest",
    filterMode: filterMode === "or" ? "or" : "and",
    limit: 30,
  };
}

export default async function DiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const reqHeaders = await headers();
  const params = (searchParams ? await searchParams : {}) as SearchParamsShape;
  const initialQuery = buildInitialDiscoveryQuery(params);
  const initialSearchQuery = initialQuery.q || "";
  const initialEventId = initialQuery.eventIds?.[0] || "";
  const initialPage = await getDiscoveryPage(initialQuery);
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
