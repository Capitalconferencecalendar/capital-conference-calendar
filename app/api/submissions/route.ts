import { NextRequest, NextResponse } from "next/server";

type SubmissionPayload = {
  url: string;
  conferenceName?: string;
  organizer?: string;
  notes?: string;
  submitterEmail?: string;
};

function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string): boolean {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function esc(value: string): string {
  return value.replaceAll("'", "\\'");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmissionPayload;

    const submissionUrl = clean(body.url);
    const conferenceName = clean(body.conferenceName);
    const organizer = clean(body.organizer);
    const notes = clean(body.notes);
    const submitterEmail = clean(body.submitterEmail);

    if (!submissionUrl) {
      return NextResponse.json(
        { error: "Conference URL is required." },
        { status: 400 }
      );
    }

    if (!isValidUrl(submissionUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid URL starting with http:// or https://." },
        { status: 400 }
      );
    }

    if (!isValidEmail(submitterEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const tableName =
      process.env.AIRTABLE_SUBMISSIONS_TABLE || "Conference Submissions";

    if (!baseId || !token) {
      return NextResponse.json(
        { error: "Airtable environment variables are not configured." },
        { status: 500 }
      );
    }

    const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

    const duplicateCheckUrl = new URL(baseUrl);
    duplicateCheckUrl.searchParams.set(
      "filterByFormula",
      `{URL}='${esc(submissionUrl)}'`
    );
    duplicateCheckUrl.searchParams.set("maxRecords", "1");

    const duplicateRes = await fetch(duplicateCheckUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (duplicateRes.ok) {
      const duplicateData = await duplicateRes.json();
      const records = Array.isArray(duplicateData.records)
        ? duplicateData.records
        : [];
      if (records.length > 0) {
        return NextResponse.json(
          { error: "This conference URL was already submitted." },
          { status: 409 }
        );
      }
    }

    const nowIso = new Date().toISOString();
    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              URL: submissionUrl,
              "Conference Name": conferenceName,
              Organizer: organizer,
              Notes: notes,
              "Submitter Email": submitterEmail,
              "Submitted At": nowIso,
              "Review Status": "Pending Review",
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      return NextResponse.json(
        { error: `Unable to save submission. ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit conference right now." },
      { status: 500 }
    );
  }
}
