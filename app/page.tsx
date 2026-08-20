import type { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
  title: "Capital Conference Calendar | Conference Intelligence",
  description:
    "Capital markets conference intelligence for issuer access, investor concentration, sector activity, and relationship-driven market signals.",
};

export default function HomePage() {
  return <LandingPageClient />;
}
