export type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

export type PublicWorkspaceEvent = {
  id: string;
  title: string;
  eventSeries: string;
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  country: string;
  venue: string;
  website: string;
  sourcePage?: string;
  organizer: string;
  primaryCategory: string;
  marketFocus: string;
  sectorThemes: string;
  issuerParticipation: string;
  region: string;
  format: string;
  publicCompanySector?: string;
  additionalPublicCompanySectors?: string;
  eventCharacter?: string;
  organizerType?: string;
  verificationStatus?: string;
  dataCompletenessScore?: string;
  websiteApproval?: string;
  lastVerified?: string;
};

export type PreviewDatasetContext = {
  generatedAt: string;
  publicCounts: {
    totalRecords: number;
    approvedVisibleRecords: number;
    verifiedApprovedRecords: number;
    pendingApprovalRecords: number;
  };
  freshness: {
    latestVerifiedDate: string | null;
    approvedRecordsWithVerificationStamp: number;
    approvedRecordsMissingVerificationStamp: number;
  };
  approvedCoverage: {
    earliestDate: string | null;
    latestDate: string | null;
    monthsCovered: number;
    meaningfulCoverageMonths: number;
    strongestConsecutiveRun: {
      startMonth: string | null;
      endMonth: string | null;
      length: number;
    };
  };
};

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean).join(", ");
  }
  return "";
}

function cleanDateOnly(value: unknown): string {
  return toText(value).slice(0, 10);
}

function firstText(fields: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = toText(fields[key]);
    if (value) return value;
  }
  return "";
}

function normalizeStatus(value: unknown) {
  return toText(value).toLowerCase().replace(/\s+/g, "");
}

export function isWebsiteApproved(fields: Record<string, unknown>): boolean {
  const approvalKey =
    Object.keys(fields).find(
      (key) => key.replace(/[^a-z]/gi, "").toLowerCase() === "websiteapproval"
    ) || "Website Approval";
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

function isPendingApproval(fields: Record<string, unknown>): boolean {
  const approvalKey =
    Object.keys(fields).find(
      (key) => key.replace(/[^a-z]/gi, "").toLowerCase() === "websiteapproval"
    ) || "Website Approval";
  return normalizeStatus(fields[approvalKey]).includes("pending");
}

function isVerified(fields: Record<string, unknown>): boolean {
  const normalized = normalizeStatus(fields["Verification Status"]);
  return normalized.includes("verified");
}

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

function nextMonth(month: string) {
  const [year, value] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, value - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 7);
}

export async function fetchAirtableRecords(): Promise<AirtableRecord[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const token = process.env.AIRTABLE_TOKEN;

  if (!baseId || !tableName || !token) {
    throw new Error("Missing Airtable environment variables.");
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
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

export function mapApprovedWorkspaceEvents(records: AirtableRecord[]): PublicWorkspaceEvent[] {
  return records
    .filter((record) => isWebsiteApproved(record.fields || {}))
    .map((record) => {
      const fields = record.fields || {};
      const startDate = cleanDateOnly(fields["Start Date"]);
      const endDate = cleanDateOnly(fields["End Date"] || fields["Start Date"]);

      return {
        id: record.id,
        title: toText(fields["Event Name"]) || "Untitled Event",
        eventSeries: toText(fields["Event Series"]),
        startDate,
        endDate,
        city: toText(fields["City"]),
        state: toText(fields["State/Province"]),
        country: toText(fields["Country"]),
        venue: toText(fields["Venue Name"]),
        website: firstText(fields, ["Event Website", "Website", "Event Link", "Conference URL"]),
        sourcePage: firstText(fields, ["Source Page (event-specific)", "Source Page", "Source URL"]),
        organizer: toText(fields["Organizer Name (from Organizer)"]),
        primaryCategory: toText(fields["Primary Category"]),
        marketFocus: toText(fields["Market Focus"]),
        sectorThemes: toText(fields["Sector / Themes"]) || toText(fields["Sector / Theme"]),
        issuerParticipation: toText(fields["Issuer Participation"]),
        region: toText(fields["Region"]),
        format: toText(fields["Format"]),
        publicCompanySector: toText(fields["Public Company Sector"]),
        additionalPublicCompanySectors: toText(fields["Additional Public Company Sectors"]),
        eventCharacter: toText(fields["Event Character"]),
        organizerType:
          toText(fields["Organizer Type / Type from Organizer"]) || toText(fields["Type from Organizer"]),
        verificationStatus: toText(fields["Verification Status"]),
        dataCompletenessScore: toText(fields["Data Completeness Score copy"]),
        websiteApproval: toText(fields["Website Approval"]),
        lastVerified: cleanDateOnly(fields["Last Verified"]),
      } satisfies PublicWorkspaceEvent;
    })
    .filter((event) => event.startDate)
    .sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return a.title.localeCompare(b.title);
    });
}

export function buildPreviewDatasetContext(records: AirtableRecord[]): PreviewDatasetContext {
  const approvedEvents = mapApprovedWorkspaceEvents(records);
  const approvedRecords = records.filter((record) => isWebsiteApproved(record.fields || {}));
  const verifiedApprovedRecords = approvedRecords.filter((record) => isVerified(record.fields || {}));
  const pendingApprovalRecords = records.filter((record) => isPendingApproval(record.fields || {}));
  const latestVerifiedDate = approvedEvents
    .map((event) => event.lastVerified || "")
    .filter(Boolean)
    .sort()
    .at(-1) || null;

  const monthCounts = Array.from(
    approvedEvents.reduce((map, event) => {
      const key = monthKey(event.startDate);
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => a[0].localeCompare(b[0]));

  const meaningfulMonths = monthCounts.filter(([, count]) => count >= 3).map(([month]) => month);
  const runs: string[][] = [];
  let currentRun: string[] = [];
  for (const month of meaningfulMonths) {
    if (!currentRun.length || nextMonth(currentRun[currentRun.length - 1]) === month) {
      currentRun.push(month);
      continue;
    }
    runs.push(currentRun);
    currentRun = [month];
  }
  if (currentRun.length) runs.push(currentRun);
  const strongestRun = runs.sort((a, b) => b.length - a.length)[0] || [];

  return {
    generatedAt: new Date().toISOString(),
    publicCounts: {
      totalRecords: records.length,
      approvedVisibleRecords: approvedRecords.length,
      verifiedApprovedRecords: verifiedApprovedRecords.length,
      pendingApprovalRecords: pendingApprovalRecords.length,
    },
    freshness: {
      latestVerifiedDate,
      approvedRecordsWithVerificationStamp: approvedEvents.filter((event) => event.lastVerified).length,
      approvedRecordsMissingVerificationStamp: approvedEvents.filter((event) => !event.lastVerified).length,
    },
    approvedCoverage: {
      earliestDate: approvedEvents[0]?.startDate || null,
      latestDate: approvedEvents.at(-1)?.startDate || null,
      monthsCovered: monthCounts.length,
      meaningfulCoverageMonths: meaningfulMonths.length,
      strongestConsecutiveRun: {
        startMonth: strongestRun[0] || null,
        endMonth: strongestRun.at(-1) || null,
        length: strongestRun.length,
      },
    },
  };
}

export async function getPublicDatasetSnapshot() {
  const records = await fetchAirtableRecords();
  return {
    records,
    approvedEvents: mapApprovedWorkspaceEvents(records),
    previewContext: buildPreviewDatasetContext(records),
  };
}

export async function getApprovedWebsiteVisibleEvents() {
  const records = await fetchAirtableRecords();
  return mapApprovedWorkspaceEvents(records);
}
