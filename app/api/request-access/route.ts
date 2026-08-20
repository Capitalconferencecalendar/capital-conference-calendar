import { NextRequest, NextResponse } from "next/server";

type RequestAccessPayload = {
  fullName?: string;
  workEmail?: string;
  company?: string;
  role?: string;
  primaryUseCase?: string;
  notes?: string;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestAccessPayload;

    const fullName = clean(body.fullName);
    const workEmail = clean(body.workEmail);
    const company = clean(body.company);
    const role = clean(body.role);
    const primaryUseCase = clean(body.primaryUseCase);
    const notes = clean(body.notes);

    if (!fullName || !workEmail || !company || !role) {
      return NextResponse.json(
        { error: "Full name, work email, company, and role are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(workEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid work email address." },
        { status: 400 }
      );
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const accessRequestsTable =
      process.env.AIRTABLE_ACCESS_REQUESTS_TABLE_ID ||
      process.env.AIRTABLE_ACCESS_REQUESTS_TABLE_NAME;

    if (!baseId || !token || !accessRequestsTable) {
      return NextResponse.json(
        { error: "Request access is not configured." },
        { status: 500 }
      );
    }

    const createRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(accessRequestsTable)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Full Name": fullName,
                "Work Email": workEmail,
                Company: company,
                Role: role,
                "Primary Use Case": primaryUseCase,
                Notes: notes,
                Source: "Website Landing Page",
                Status: "New",
                "Submitted At": new Date().toISOString(),
              },
            },
          ],
        }),
      }
    );

    if (!createRes.ok) {
      console.error("Airtable request-access write failed", {
        status: createRes.status,
        body: await createRes.text(),
      });
      return NextResponse.json(
        { error: "Unable to submit request access right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Request access submission failed", error);
    return NextResponse.json(
      { error: "Unable to submit request access right now." },
      { status: 500 }
    );
  }
}
