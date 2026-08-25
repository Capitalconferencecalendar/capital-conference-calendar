"use client";

const EVENT_DATA_CACHE_TTL_MS = 10 * 60 * 1000;
const TICKER_CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  cachedAt: number;
};

const eventPageCache = new Map<string, CacheEntry<unknown>>();
const eventPageRequests = new Map<string, Promise<unknown>>();
let tickerCache: CacheEntry<unknown> | null = null;
let tickerRequest: Promise<unknown> | null = null;

function isFresh(entry: CacheEntry<unknown> | undefined | null, ttlMs: number) {
  return Boolean(entry) && Date.now() - entry!.cachedAt < ttlMs;
}

export function getCachedEventPage<T>(requestKey: string): T | null {
  const entry = eventPageCache.get(requestKey);
  if (!isFresh(entry, EVENT_DATA_CACHE_TTL_MS)) {
    if (entry) eventPageCache.delete(requestKey);
    return null;
  }
  return entry!.data as T;
}

export function seedEventPage<T>(requestKey: string, data: T) {
  eventPageCache.set(requestKey, { data, cachedAt: Date.now() });
}

export async function getOrFetchEventPage<T>(requestKey: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCachedEventPage<T>(requestKey);
  if (cached) return cached;

  const existingRequest = eventPageRequests.get(requestKey);
  if (existingRequest) return existingRequest as Promise<T>;

  const request = fetcher()
    .then((data) => {
      seedEventPage(requestKey, data);
      return data;
    })
    .finally(() => {
      eventPageRequests.delete(requestKey);
    });

  eventPageRequests.set(requestKey, request);
  return request;
}

export function getCachedTickerData<T>(): T | null {
  if (!isFresh(tickerCache, TICKER_CACHE_TTL_MS)) {
    tickerCache = null;
    return null;
  }
  return tickerCache!.data as T;
}

export function seedTickerData<T>(data: T) {
  tickerCache = { data, cachedAt: Date.now() };
}

export async function getOrFetchTickerData<T>(fetcher: () => Promise<T>): Promise<T> {
  const cached = getCachedTickerData<T>();
  if (cached) return cached;

  if (tickerRequest) return tickerRequest as Promise<T>;

  tickerRequest = fetcher()
    .then((data) => {
      seedTickerData(data);
      return data;
    })
    .finally(() => {
      tickerRequest = null;
    });

  return tickerRequest as Promise<T>;
}
