import EventTicker from "../components/EventTicker";
import { getPublicTickerEvents } from "../../lib/publicTickerEvents";

export default async function SubmitLayout({ children }: { children: React.ReactNode }) {
  const tickerEvents = await getPublicTickerEvents();

  return (
    <>
      <EventTicker events={tickerEvents} />
      {children}
    </>
  );
}
