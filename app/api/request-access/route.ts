import { NextRequest, NextResponse } from "next/server";

type RequestAccessPayload = {
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  email?: string;
  howHeard?: string;
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

    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const company = clean(body.company);
    const title = clean(body.title);
    const email = clean(body.email);
    const howHeard = clean(body.howHeard);

    if (!firstName || !lastName || !company || !title || !email) {
      return NextResponse.json(
        { error: "First name, last name, company, title, and email are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const accessRequestsTable =
      process.env.AIRTABLE_ACCESS_REQUESTS_TABLE_NAME || "Beta Access Requests";

    if (!baseId || !token) {
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
                "First Name": firstName,
                "Last Name": lastName,
                Company: company,
                Title: title,
                Email: email,
                "How did you hear about us?": howHeard,
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
