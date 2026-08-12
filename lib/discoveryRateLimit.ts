import "server-only";

import { NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const GENERAL_LIMIT = 90;
const SESSION_LIMIT = 60;
const CURSOR_WINDOW_MS = 20_000;
const CURSOR_LIMIT = 12;
const MAX_TRACKED_KEYS = 10_000;

type RateBucket = {
  startedAt: number;
  count: number;
};

const buckets = new Map<string, RateBucket>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function take(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || now - existing.startedAt >= windowMs) {
    buckets.set(key, { startedAt: now, count: 1 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - existing.startedAt)) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function pruneBuckets() {
  if (buckets.size < MAX_TRACKED_KEYS) return;
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, bucket] of buckets) {
    if (bucket.startedAt < cutoff) buckets.delete(key);
  }
  while (buckets.size > MAX_TRACKED_KEYS) {
    const firstKey = buckets.keys().next().value;
    if (!firstKey) break;
    buckets.delete(firstKey);
  }
}

export function getOrCreateDiscoverySession(request: NextRequest) {
  return request.cookies.get("ccc_discovery_sid")?.value || crypto.randomUUID();
}

export function limitDiscoveryRequest(request: NextRequest, sessionId: string) {
  pruneBuckets();

  const clientIp = getClientIp(request);
  const isCursorTraversal = Boolean(request.nextUrl.searchParams.get("cursor"));
  const checks = [
    take(`ip:${clientIp}:general`, GENERAL_LIMIT, WINDOW_MS),
    take(`session:${sessionId}:general`, SESSION_LIMIT, WINDOW_MS),
  ];

  if (isCursorTraversal) {
    checks.push(
      take(`ip:${clientIp}:cursor`, CURSOR_LIMIT, CURSOR_WINDOW_MS),
      take(`session:${sessionId}:cursor`, CURSOR_LIMIT, CURSOR_WINDOW_MS)
    );
  }

  const blocked = checks.find((result) => !result.allowed);
  return {
    allowed: !blocked,
    retryAfterSeconds: blocked?.retryAfterSeconds || 0,
  };
}
