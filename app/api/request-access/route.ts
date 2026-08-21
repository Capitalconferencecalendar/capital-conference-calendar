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

async function readAirtableError(response: Response) {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text) as {
      error?: {
        type?: unknown;
        message?: unknown;
      };
    };

    return {
      type: typeof parsed.error?.type === "string" ? parsed.error.type : undefined,
      message: typeof parsed.error?.message === "string" ? parsed.error.message : undefined,
    };
  } catch {
    return {
      type: undefined,
      message: text ? "Non-JSON Airtable error response" : undefined,
    };
  }
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
    const configuredAccessRequestsTable = process.env.AIRTABLE_ACCESS_REQUESTS_TABLE_NAME?.trim();
    const accessRequestsTable =
      !configuredAccessRequestsTable || configuredAccessRequestsTable === "Beta Access Request"
        ? "Beta Access Requests"
        : configuredAccessRequestsTable;

    const diagnosticBase = {
      hasAirtableBaseId: Boolean(baseId),
      hasAirtableToken: Boolean(token),
      tableName: accessRequestsTable,
    };

    if (!baseId || !token) {
      console.error("Request access Airtable configuration missing", diagnosticBase);
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
      const airtableError = await readAirtableError(createRes);
      console.error("Airtable request-access write failed", {
        ...diagnosticBase,
        status: createRes.status,
        airtableErrorType: airtableError.type,
        airtableErrorMessage: airtableError.message,
      });
      return NextResponse.json(
        { error: "Unable to submit request access right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Request access submission failed", {
      errorName: error instanceof Error ? error.name : undefined,
      errorMessage: error instanceof Error ? error.message : undefined,
    });
    return NextResponse.json(
      { error: "Unable to submit request access right now." },
      { status: 500 }
    );
  }
}
