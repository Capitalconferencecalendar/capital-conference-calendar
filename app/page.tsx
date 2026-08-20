import type { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
  title: "Capital Conference Calendar | Private Beta",
  description:
    "Private beta for capital markets conference intelligence across market attention, access, timing, and relationship-driven signals.",
};

export default function HomePage() {
  return <LandingPageClient />;
}
