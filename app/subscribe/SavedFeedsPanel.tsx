"use client";

import { useEffect, useState } from "react";

type SavedFeedRecord = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

const SAVED_FEEDS_KEY = "ccc_saved_feeds";

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SavedFeedsPanel() {
  const [savedFeeds, setSavedFeeds] = useState<SavedFeedRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_FEEDS_KEY);
      const parsed: SavedFeedRecord[] = raw ? JSON.parse(raw) : [];
      setSavedFeeds(parsed);
    } catch {
      setSavedFeeds([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  function deleteFeed(id: string) {
    const next = savedFeeds.filter((feed) => feed.id !== id);
    setSavedFeeds(next);
    window.localStorage.setItem(SAVED_FEEDS_KEY, JSON.stringify(next));
  }

  if (!loaded) {
    return <div style={{ fontSize: "14px", color: "#64748b" }}>Loading...</div>;
  }

  if (savedFeeds.length === 0) {
    return (
      <div style={{ fontSize: "14px", color: "#64748b" }}>
        No saved feed presets yet. Go to the Database page, apply filters, and click “Save This Feed.”
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {savedFeeds.map((feed) => (
        <div
          key={feed.id}
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "10px",
            padding: "16px",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "4px",
                }}
              >
                {feed.name}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Saved {formatCreatedAt(feed.createdAt)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => deleteFeed(feed.id)}
              style={{
                border: "1px solid #d7dde5",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>

          <div
            style={{
              padding: "12px 13px",
              border: "1px solid #d7dde5",
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              fontSize: "13px",
              color: "#334155",
              marginBottom: "12px",
              wordBreak: "break-all",
            }}
          >
            {feed.url}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a
              href={feed.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                textDecoration: "none",
                backgroundColor: "#111827",
                color: "#ffffff",
                padding: "10px 14px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              Open Feed
            </a>

            <a
              href={`/events${feed.url.replace("/api/ics", "")}`}
              style={{
                display: "inline-block",
                textDecoration: "none",
                backgroundColor: "#ffffff",
                color: "#111827",
                padding: "10px 14px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "14px",
                border: "1px solid #d7dde5",
              }}
            >
              Edit Filters
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}