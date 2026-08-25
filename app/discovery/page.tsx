import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import DiscoveryClient from "./DiscoveryClient";
import type { DiscoveryAggregateStats, DiscoveryFilterOptions } from "../../lib/discoveryDataset";

export const metadata: Metadata = {
  title: "Discovery | Capital Conference Calendar",
};

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

export default function DiscoveryPage() {
  return (
    <AppShell
      active="dashboard"
      searchQuery=""
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
        initialSearchQuery=""
        initialMode="market"
        initialEventId=""
      />
    </AppShell>
  );
}
