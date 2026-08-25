import { getDiscoveryPage } from "./discoveryDataset";

export type PublicTickerEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  city: string;
};

export async function getPublicTickerEvents(): Promise<PublicTickerEvent[]> {
  const tickerPage = await getDiscoveryPage({ limit: 20 }, { includeMarketViewIntelligence: false });

  return tickerPage.events.map((event) => ({
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    city: event.city,
  }));
}
