import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const configuredCode = process.env.BETA_ACCESS_CODE;
  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!configuredCode || code !== configuredCode) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("ccc_beta_access", "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
