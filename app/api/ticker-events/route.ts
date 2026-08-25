import { NextResponse } from "next/server";
import { getPublicTickerEvents } from "../../../lib/publicTickerEvents";

export async function GET() {
  try {
    const events = await getPublicTickerEvents();
    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { events: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
