import type { Metadata } from "next";
import EventTicker from "./components/EventTicker";
import LandingPageClient from "./LandingPageClient";
import { getPublicTickerEvents } from "../lib/publicTickerEvents";

export const metadata: Metadata = {
  title: "Capital Conference Database | Private Beta",
  description:
    "Private beta for capital markets conference intelligence across market attention, access, timing, and relationship-driven signals.",
};

export default async function HomePage() {
  const tickerEvents = await getPublicTickerEvents();

  return (
    <>
      <EventTicker events={tickerEvents} />
      <LandingPageClient />
    </>
  );
}
