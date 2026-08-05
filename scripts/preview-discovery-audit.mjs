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

function monthKey(date) {
  return date.slice(0, 7);
}

function getWeekStart(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function splitMulti(value) {
  return toText(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function haystack(event) {
  return [
    event.primaryCategory,
    event.marketFocus,
    event.sectorThemes,
    event.issuerParticipation,
    event.publicCompanySector,
    event.additionalPublicCompanySectors,
    event.eventCharacter,
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

function isInvestorHeavy(event) {
  return /(institutional investors|institutional investor|investor conference|investor-heavy|investor heavy|family office|private equity|venture capital|hedge fund|lp\/gp|limited partner|general partner|investor networking|retail investors)/i.test(
    haystack(event)
  );
}

function isIssuerHeavy(event) {
  return /(public company|issuer|company presentations|corporate access|c-suite|management team|1x1 meetings|one-on-one|one on one|roadshow|non-deal roadshow|deal roadshow|issuer-heavy|issuer heavy)/i.test(
    haystack(event)
  );
}

function hasNoIssuerParticipation(event) {
  return /no issuer participation/i.test(haystack(event));
}

function hasIssuerAccess(event) {
  return isIssuerHeavy(event) && !hasNoIssuerParticipation(event);
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

const records = await fetchRecords();
const events = records
  .filter((record) => isWebsiteApproved(record.fields || {}))
  .map((record) => {
    const fields = record.fields || {};
    return {
      id: record.id,
      startDate: cleanDateOnly(fields["Start Date"]),
      endDate: cleanDateOnly(fields["End Date"] || fields["Start Date"]),
      city: toText(fields["City"]),
      state: toText(fields["State/Province"]),
      region: toText(fields["Region"]),
      primaryCategory: toText(fields["Primary Category"]),
      marketFocus: toText(fields["Market Focus"]),
      sectorThemes: toText(fields["Sector / Themes"]) || toText(fields["Sector / Theme"]),
      issuerParticipation: toText(fields["Issuer Participation"]),
      publicCompanySector: toText(fields["Public Company Sector"]),
      additionalPublicCompanySectors: toText(fields["Additional Public Company Sectors"]),
      eventCharacter: toText(fields["Event Character"]),
    };
  })
  .filter((event) => event.startDate)
  .sort((a, b) => a.startDate.localeCompare(b.startDate));

const byMonth = new Map();
const weekCounts = new Map();

for (const event of events) {
  const key = monthKey(event.startDate);
  if (!byMonth.has(key)) {
    byMonth.set(key, {
      events: 0,
      investorHeavy: 0,
      issuerHeavy: 0,
      issuerAccess: 0,
      sectorThemes: new Set(),
      cities: new Set(),
      regions: new Set(),
    });
  }
  const row = byMonth.get(key);
  row.events += 1;
  if (isInvestorHeavy(event)) row.investorHeavy += 1;
  if (isIssuerHeavy(event)) row.issuerHeavy += 1;
  if (hasIssuerAccess(event)) row.issuerAccess += 1;
  splitMulti(event.sectorThemes).forEach((theme) => row.sectorThemes.add(theme));
  const city = [event.city, event.state].filter(Boolean).join(", ");
  if (city) row.cities.add(city);
  if (event.region) row.regions.add(event.region);

  const seenWeeks = new Set();
  let cursor = event.startDate;
  while (cursor <= event.endDate) {
    const week = getWeekStart(cursor);
    if (week) seenWeeks.add(week);
    cursor = addDays(cursor, 1);
    if (seenWeeks.size > 31) break;
  }
  for (const week of seenWeeks) {
    weekCounts.set(week, (weekCounts.get(week) || 0) + 1);
  }
}

const weekValues = Array.from(weekCounts.values()).sort((a, b) => a - b);
const threshold = weekValues.length
  ? Math.max(2, weekValues[Math.floor((weekValues.length - 1) * 0.75)] || 0)
  : 0;

const hotWeeksByMonth = new Map();
for (const [week, count] of weekCounts.entries()) {
  if (count >= threshold) {
    const key = week.slice(0, 7);
    hotWeeksByMonth.set(key, (hotWeeksByMonth.get(key) || 0) + 1);
  }
}

const summary = Array.from(byMonth.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([month, row]) => ({
    month,
    events: row.events,
    investorHeavy: row.investorHeavy,
    issuerHeavy: row.issuerHeavy,
    issuerAccess: row.issuerAccess,
    uniqueSectorThemes: row.sectorThemes.size,
    uniqueCities: row.cities.size,
    uniqueRegions: row.regions.size,
    hotWeeks: hotWeeksByMonth.get(month) || 0,
  }));

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalApprovedEvents: events.length,
  earliestDate: events[0]?.startDate || null,
  latestDate: events.at(-1)?.startDate || null,
  hotWeekThreshold: threshold,
  monthlyCounts: summary,
}, null, 2));
