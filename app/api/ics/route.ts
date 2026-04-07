import { NextRequest, NextResponse } from "next/server";

type AirtableRecord = {
  id: string;
  fields: {
    "Event Name"?: string;
    "Start Date"?: string;
    "End Date"?: string;
    City?: string;
    "State/Province"?: string;
    Country?: string;
    "Venue Name"?: string | string[];
    "Event Website"?: string;
    "Approved for Feeds"?: boolean;
    "Market Focus"?: string | string[];
    Region?: string | string[];
    Format?: string | string[];
    "Primary Category"?: string | string[];
  };
};

function escapeICS(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatDateOnlyForICS(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function addOneDayForICS(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  date.setUTCDate(date.getUTCDate() + 1);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

async function getEvents(): Promise<AirtableRecord[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const token = process.env.AIRTABLE_TOKEN;

  if (!baseId || !tableName || !token) {
    throw new Error("Missing Airtable environment variables.");
  }

  const records: AirtableRecord[] = [];
  let offset = "";

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
    );
    url.searchParams.set("pageSize", "100");

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Airtable fetch failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    records.push(...(data.records || []));
    offset = data.offset || "";
  } while (offset);

  return records;
}

export async function GET(request: NextRequest) {
  try {
    const records = await getEvents();

    const filtered = records.filter((record) => {
      return !!record.fields["Event Name"] && !!record.fields["Start Date"];
    });

    const events = filtered
      .map((record) => {
        const name = record.fields["Event Name"];
        const startDate = record.fields["Start Date"];
        const endDate = record.fields["End Date"] || startDate;
        const venue = record.fields["Venue Name"];
        const city = record.fields["City"];
        const state = record.fields["State/Province"];
        const country = record.fields["Country"];
        const website = record.fields["Event Website"];

        if (!name || !startDate) return null;

        const dtStart = formatDateOnlyForICS(startDate);
        const dtEnd = addOneDayForICS(endDate || startDate);

        if (!dtStart || !dtEnd) return null;

        const venueText = Array.isArray(venue) ? venue.join(", ") : venue || "";
        const location = [venueText, city, state, country].filter(Boolean).join(", ");

        const descriptionParts = [
          website ? `Conference Website: ${website}` : "",
          location ? `Location: ${location}` : "",
        ].filter(Boolean);

        const description = descriptionParts.join("\\n");

        const uid = `${record.id}@capitalconferencecalendar.com`;
        const dtStamp =
          new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        return [
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTAMP:${dtStamp}`,
          `DTSTART;VALUE=DATE:${dtStart}`,
          `DTEND;VALUE=DATE:${dtEnd}`,
          `SUMMARY:${escapeICS(name)}`,
          location ? `LOCATION:${escapeICS(location)}` : "",
          description ? `DESCRIPTION:${escapeICS(description)}` : "",
          website ? `URL:${escapeICS(website)}` : "",
          "END:VEVENT",
        ]
          .filter(Boolean)
          .join("\r\n");
      })
      .filter((event): event is string => Boolean(event))
      .join("\r\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Capital Conference Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      events,
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="capital-conference-calendar.ics"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate ICS feed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}