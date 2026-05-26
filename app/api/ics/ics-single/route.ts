import { NextResponse } from "next/server";

function formatIcsDate(date: string) {
  return `${date.replace(/-/g, "")}T000000Z`;
}

function formatIcsEndDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return `${parsed.toISOString().slice(0, 10).replace(/-/g, "")}T000000Z`;
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line: string) {
  const limit = 73;
  if (line.length <= limit) return line;
  const parts: string[] = [];
  let remaining = line;
  while (remaining.length > limit) {
    parts.push(remaining.slice(0, limit));
    remaining = remaining.slice(limit);
  }
  if (remaining) parts.push(remaining);
  return parts.join("\r\n ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Event";
  const start = searchParams.get("start");
  const end = searchParams.get("end") || start;
  const location = searchParams.get("location") || "";
  const description = searchParams.get("description") || "";
  const url = searchParams.get("url") || "";
  const htmlDescription = `${escapeHtml(description).replace(/\n/g, "<br/>")}${
    url ? `<br/><br/><a href="${escapeHtml(url)}">${escapeHtml(url)}</a>` : ""
  }`;

  if (!start) {
    return new NextResponse("Missing required start date.", { status: 400 });
  }

  const now = new Date();
  const uid = `${Date.now()}-ccc@capitalconferencecalendar.com`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Capital Conference Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    foldIcsLine(`UID:${uid}`),
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsEndDate(end || start)}`,
    foldIcsLine(`SUMMARY:${escapeIcsText(title)}`),
    foldIcsLine(`DESCRIPTION:${escapeIcsText(description)}`),
    foldIcsLine(`X-ALT-DESC;FMTTYPE=text/html:${htmlDescription}`),
    foldIcsLine(`LOCATION:${escapeIcsText(location)}`),
    ...(url
      ? [
          foldIcsLine(`URL:${escapeIcsText(url)}`),
          foldIcsLine(`SOURCE:${escapeIcsText(url)}`),
        ]
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="event.ics"',
      "Cache-Control": "no-store",
    },
  });
}
