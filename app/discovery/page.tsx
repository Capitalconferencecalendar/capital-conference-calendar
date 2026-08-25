import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import DiscoveryClient from "./DiscoveryClient";
import type { DiscoveryAggregateStats, DiscoveryFilterOptions, DiscoveryQuery } from "../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Discovery | Capital Conference Calendar",
};

type SearchParamsShape = Record<string, string | string[] | undefined>;

type DiscoveryPageProps = {
  searchParams?: Promise<SearchParamsShape>;
};

const INITIAL_VISIBLE_EVENTS = 20;

const emptyFilterOptions: DiscoveryFilterOptions = {
  cities: [],
  regions: [],
  countries: [],
  states: [],
  themes: [],
  publicCompanySectors: [],
  conferenceTypes: [],
  issuers: [],
  organizers: [],
  marketFocuses: [],
};

const emptyAggregates: DiscoveryAggregateStats = {
  events: 0,
  organizers: 0,
  states: 0,
  cities: 0,
  themes: 0,
  focus: 0,
  investorHeavy: 0,
  issuerAccess: 0,
  verified: 0,
  hotWeeks: 0,
  highestActivityWeek: null,
  lowestActivityWeek: null,
  leadingSector: null,
  mostActiveDealWeek: null,
  earliestDate: null,
  latestDate: null,
  latestVerificationStamp: null,
  quickFeeds: {
    investorConferences: 0,
    healthcareConferences: 0,
    privateMarkets: 0,
    canadaEvents: 0,
    upcoming30: 0,
    hotWeeks: 0,
  },
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
    limit: INITIAL_VISIBLE_EVENTS,
  };
}

export default async function DiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const params = (searchParams ? await searchParams : {}) as SearchParamsShape;
  const initialQuery = buildInitialDiscoveryQuery(params);
  const initialSearchQuery = initialQuery.q || "";
  const initialEventId = initialQuery.eventIds?.[0] || "";

  return (
    <AppShell
      active="dashboard"
      searchQuery={initialSearchQuery}
      tickerEvents={[]}
      workspaceMode="discovery"
    >
      <DiscoveryClient
        events={[]}
        initialPage={{
          total: 0,
          nextCursor: null,
          filterOptions: emptyFilterOptions,
          aggregates: emptyAggregates,
          allAggregates: emptyAggregates,
        }}
        initialCity=""
        initialSearchQuery={initialSearchQuery}
        initialMode="market"
        initialEventId={initialEventId}
      />
    </AppShell>
  );
}
