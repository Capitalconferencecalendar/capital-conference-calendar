import { NextRequest, NextResponse } from "next/server";
import { getDiscoveryPage, type DiscoveryQuery } from "../../../lib/discoveryDataset";
import { getOrCreateDiscoverySession, limitDiscoveryRequest } from "../../../lib/discoveryRateLimit";

function values(params: URLSearchParams, key: string) {
  return params.getAll(key).map((value) => value.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const sessionId = getOrCreateDiscoverySession(request);
  const rateLimit = limitDiscoveryRequest(request, sessionId);
  const sessionCookie = {
    name: "ccc_discovery_sid",
    value: sessionId,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };

  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      { error: "Too many Discovery requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
    return response;
  }

  try {
    const params = request.nextUrl.searchParams;
    const dateRange = params.get("dateRange");
    const sort = params.get("sort");
    const filterMode = params.get("filterMode");
    const query: DiscoveryQuery = {
      cursor: params.get("cursor"),
      limit: Number(params.get("limit") || 30),
      q: params.get("q") || "",
      dateRange: dateRange === "next30" || dateRange === "next60" || dateRange === "next90" || dateRange === "all" ? dateRange : "all",
      fromDate: params.get("fromDate") || "",
      toDate: params.get("toDate") || "",
      country: values(params, "country"),
      region: values(params, "region"),
      state: values(params, "state"),
      cities: values(params, "city"),
      sectorThemes: values(params, "sectorTheme"),
      publicCompanySectors: values(params, "publicCompanySector"),
      conferenceType: values(params, "conferenceType"),
      issuerParticipation: values(params, "issuerParticipation"),
      organizer: values(params, "organizer"),
      marketFocus: values(params, "marketFocus"),
      eventIds: values(params, "eventId"),
      sort: sort === "city" ? "city" : "soonest",
      filterMode: filterMode === "or" ? "or" : "and",
    };
    const response = NextResponse.json(await getDiscoveryPage(query), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load conferences.";
    const response = NextResponse.json({ error: message }, { status: 500 });
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
    return response;
  }
}
