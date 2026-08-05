import fs from "node:fs";
import path from "node:path";

const env = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
for (const line of env.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let [, key, value] = match;
  value = value.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

function toText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  return "";
}

function cleanDateOnly(value) {
  return toText(value).slice(0, 10);
}

function normalizeStatus(value) {
  return toText(value).toLowerCase().replace(/\s+/g, "");
}

function isWebsiteApproved(fields) {
  const approvalKey =
    Object.keys(fields).find((key) => key.replace(/[^a-z]/gi, "").toLowerCase() === "websiteapproval") ||
    "Website Approval";
  const normalized = normalizeStatus(fields[approvalKey]);
  if (!normalized) return false;
  const looksApproved = normalized.includes("approved") || normalized.includes("appoved");
  const looksRejected =
    normalized.includes("notapproved") ||
    normalized.includes("unapproved") ||
    normalized.includes("pending") ||
    normalized.includes("rejected");
  return looksApproved && !looksRejected;
}

function splitMulti(value) {
  return toText(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function getWeekStart(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString().slice(0, 10);
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}

async function fetchRecords() {
  const records = [];
  let offset;
  do {
    const url = new URL(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME)}`
    );
    if (offset) url.searchParams.set("offset", offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
      cache: "no-store",
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Airtable fetch failed: ${response.status} ${response.statusText} - ${text}`);
    }
    const data = await response.json();
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);
  return records;
}

function buildApprovedEvents(records) {
  return records
    .filter((record) => isWebsiteApproved(record.fields || {}))
    .map((record) => {
      const fields = record.fields || {};
      return {
        id: record.id,
        title: toText(fields["Event Name"]) || "Untitled Event",
        startDate: cleanDateOnly(fields["Start Date"]),
        endDate: cleanDateOnly(fields["End Date"] || fields["Start Date"]),
        city: toText(fields["City"]),
        state: toText(fields["State/Province"]),
        organizer: toText(fields["Organizer Name (from Organizer)"]),
        primaryCategory: toText(fields["Primary Category"]),
        marketFocus: toText(fields["Market Focus"]),
        sectorThemes: toText(fields["Sector / Themes"]) || toText(fields["Sector / Theme"]),
        issuerParticipation: toText(fields["Issuer Participation"]),
        region: toText(fields["Region"]),
      };
    })
    .filter((event) => event.startDate);
}

function amplifyRepresentative(events, minimum = 1000) {
  if (events.length >= minimum) return events;
  const amplified = [...events];
  let index = 0;
  while (amplified.length < minimum) {
    const source = events[index % events.length];
    amplified.push({
      ...source,
      id: `${source.id}-stress-${Math.floor(index / events.length) + 1}`,
      title: `${source.title}`,
    });
    index += 1;
  }
  return amplified;
}

function summarize(events) {
  const months = new Map();
  const cities = new Set();
  const themes = new Set();
  const weeks = new Map();
  for (const event of events) {
    months.set(monthKey(event.startDate), (months.get(monthKey(event.startDate)) || 0) + 1);
    const city = [event.city, event.state].filter(Boolean).join(", ");
    if (city) cities.add(city);
    splitMulti(event.sectorThemes).forEach((theme) => themes.add(theme));
    const week = getWeekStart(event.startDate);
    if (week) weeks.set(week, (weeks.get(week) || 0) + 1);
  }
  return {
    totalEvents: events.length,
    monthBuckets: months.size,
    cityCount: cities.size,
    themeCount: themes.size,
    hottestWeekCount: Math.max(...weeks.values(), 0),
  };
}

const records = await fetchRecords();
const approvedEvents = buildApprovedEvents(records);
const amplified = amplifyRepresentative(approvedEvents, 1000);

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      approvedEvents: approvedEvents.length,
      amplifiedEvents: amplified.length,
      summary: summarize(amplified),
      sampleWindow: {
        earliestDate: amplified.map((event) => event.startDate).sort()[0] || null,
        latestDate: amplified.map((event) => event.startDate).sort().at(-1) || null,
      },
    },
    null,
    2
  )
);
