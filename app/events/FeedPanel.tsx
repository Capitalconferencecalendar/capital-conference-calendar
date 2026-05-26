"use client";

import Link from "next/link";
import { useState } from "react";

type FeedPanelProps = {
  feedUrl: string;
  siteUrl: string;
};

function buildAbsoluteUrl(feedUrl: string, siteUrl: string) {
  if (!feedUrl) return "";
  if (feedUrl.startsWith("http://") || feedUrl.startsWith("https://")) return feedUrl;

  const normalizedSiteUrl = siteUrl.endsWith("/")
    ? siteUrl.slice(0, -1)
    : siteUrl;
  const normalizedFeedUrl = feedUrl.startsWith("/") ? feedUrl : `/${feedUrl}`;
  return `${normalizedSiteUrl}${normalizedFeedUrl}`;
}

function ProviderModal({
  open,
  onClose,
  onManual,
}: {
  open: boolean;
  onClose: () => void;
  onManual: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.38)",
        zIndex: 90,
        display: "grid",
        placeItems: "center",
        padding: "14px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(620px, 100%)",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          border: "1px solid #d7dde5",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.22)",
          padding: "14px",
          display: "grid",
          gap: "10px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
            Add to My Calendar
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "999px",
              border: "1px solid #d7dde5",
              backgroundColor: "#ffffff",
              color: "#334155",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }} className="ccc-provider-grid">
          <Link href="/help/google-calendar" style={{ textDecoration: "none", border: "1px solid #d7dde5", borderRadius: "10px", padding: "12px", color: "#0f172a", backgroundColor: "#ffffff" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Google Calendar</div>
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.45 }}>Best for Gmail and Google Workspace users.</div>
          </Link>
          <Link href="/help/apple-calendar" style={{ textDecoration: "none", border: "1px solid #d7dde5", borderRadius: "10px", padding: "12px", color: "#0f172a", backgroundColor: "#ffffff" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Apple Calendar</div>
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.45 }}>Works with iPhone, Mac, and iPad.</div>
          </Link>
          <Link href="/help/outlook-calendar" style={{ textDecoration: "none", border: "1px solid #d7dde5", borderRadius: "10px", padding: "12px", color: "#0f172a", backgroundColor: "#ffffff" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Outlook</div>
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.45 }}>Works with Microsoft 365, Outlook web, and desktop.</div>
          </Link>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => {
              onManual();
              onClose();
            }}
            style={{
              border: "1px solid #d7dde5",
              backgroundColor: "#ffffff",
              color: "#334155",
              borderRadius: "9px",
              height: "36px",
              padding: "0 12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Manual ICS Setup
          </button>
        </div>
      </div>
    </div>
  );
}

function PlatformRow({
  href,
  icon,
  label,
}: {
  href: string | { pathname: string; query: { feedUrl: string } };
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "grid",
        gridTemplateColumns: "28px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: "10px",
        padding: "12px 0",
        textDecoration: "none",
        color: "#0f172a",
        borderTop: "1px solid #e6ebf0",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: icon === "G" ? "#eef5ff" : icon === "" ? "#f3f4f6" : "#e8f2ff",
          color: icon === "O" ? "#0a66c2" : "#1f2937",
          fontSize: icon === "" ? "16px" : "13px",
          fontWeight: 900,
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: "14px", fontWeight: 800 }}>{label}</span>
      <span style={{ color: "#64748b", fontSize: "18px", lineHeight: 1 }}>›</span>
    </Link>
  );
}

export default function FeedPanel({ feedUrl, siteUrl }: FeedPanelProps) {
  const absoluteFeedUrl = buildAbsoluteUrl(feedUrl, siteUrl);
  const [showProviders, setShowProviders] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedIcs, setCopiedIcs] = useState(false);

  const copyIcs = async () => {
    if (!absoluteFeedUrl) return;
    try {
      await navigator.clipboard.writeText(absoluteFeedUrl);
      setCopiedIcs(true);
      setTimeout(() => setCopiedIcs(false), 1800);
    } catch {
      setCopiedIcs(false);
    }
  };

  return (
    <div
      id="calendar-feed"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d7dde5",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "0 14px 34px rgba(15, 45, 79, 0.07)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
          borderRadius: "999px",
          backgroundColor: "#eaf2fb",
          border: "1px solid #d5e4f5",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#0f3d75",
          marginBottom: "12px",
        }}
      >
        Current Market View
      </div>

      <h2 style={{ margin: "0 0 10px 0", fontSize: "22px", lineHeight: 1.2, color: "#0f172a" }}>
        Turn This View Into a Live Calendar
      </h2>

      <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "10px" }}>
        Subscribe to this filtered view and get automatically updated events in your calendar.
      </div>

      <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5, marginBottom: "14px" }}>
        Your filters create a live market view. Add it to your calendar once, and matching conferences will continue updating automatically.
      </div>

      <div
        style={{
          marginBottom: "14px",
          padding: "12px",
          borderRadius: "10px",
          backgroundColor: "#fbfdff",
          border: "1px solid #dbe4ee",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 850, color: "#0f172a", marginBottom: "7px" }}>
          Your Live Calendar Link
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.45, marginBottom: "8px" }}>
          Copy and subscribe from Google, Apple, or Outlook.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 38px", gap: "8px", alignItems: "center" }}>
          <div style={{ padding: "9px 10px", borderRadius: "9px", border: "1px solid #c7d7ea", backgroundColor: "#ffffff", fontSize: "12px", color: "#334155", lineHeight: 1.35, wordBreak: "break-all" }}>
            {absoluteFeedUrl}
          </div>
          <button
            type="button"
            onClick={copyIcs}
            aria-label="Copy live calendar link"
            style={{
              height: "38px",
              width: "38px",
              borderRadius: "9px",
              border: "1px solid #d7dde5",
              backgroundColor: "#eef5ff",
              color: "#0f3d75",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 900,
            }}
          >
            ⧉
          </button>
        </div>
        {copiedIcs ? (
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#047857", fontWeight: 800 }}>
            Copied.
          </div>
        ) : null}
      </div>

      <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "12px", backgroundColor: "#fbfdff", border: "1px solid #e1e7ef" }}>
        <div style={{ fontSize: "13px", fontWeight: 850, color: "#0f172a", marginBottom: "2px" }}>
          Subscribe in Your Calendar
        </div>
        <PlatformRow href={{ pathname: "/help/google-calendar", query: { feedUrl: absoluteFeedUrl } }} icon="G" label="Google Calendar" />
        <PlatformRow href={{ pathname: "/help/apple-calendar", query: { feedUrl: absoluteFeedUrl } }} icon="" label="Apple Calendar" />
        <PlatformRow href={{ pathname: "/help/outlook-calendar", query: { feedUrl: absoluteFeedUrl } }} icon="O" label="Outlook Calendar" />
      </div>

      <div style={{ display: "grid", gap: "8px", marginBottom: "10px" }}>
        <button
          type="button"
          onClick={() => setShowProviders(true)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
            color: "#fff",
            padding: "14px 16px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "15px",
            boxSizing: "border-box",
            boxShadow: "0 6px 18px rgba(17, 24, 39, 0.18)",
            cursor: "pointer",
            border: "1px solid #111827",
          }}
        >
          Create Live Calendar Feed
        </button>
        <a
          href="#results-panel"
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            textDecoration: "none",
            backgroundColor: "#f8fafc",
            color: "#334155",
            padding: "11px 14px",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: "13px",
            border: "1px solid #d7dde5",
            boxSizing: "border-box",
          }}
        >
          Preview Events
        </a>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          color: "#0f3d75",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        Advanced / Manual Setup
      </button>

      {showAdvanced ? (
        <div
          style={{
            marginTop: "8px",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #dbe4ee",
            backgroundColor: "#fbfcfe",
            display: "grid",
            gap: "8px",
          }}
        >
          <div
            style={{
              padding: "10px 11px",
              backgroundColor: "#ffffff",
              border: "1px solid #c7d7ea",
              borderRadius: "9px",
              fontSize: "12px",
              color: "#334155",
              lineHeight: 1.5,
              wordBreak: "break-all",
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            {absoluteFeedUrl}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={copyIcs}
              style={{
                border: "1px solid #d7dde5",
                backgroundColor: "#ffffff",
                color: "#334155",
                borderRadius: "8px",
                height: "34px",
                padding: "0 11px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Copy ICS Link
            </button>
            <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.45 }}>
              {copiedIcs
                ? "ICS link copied."
                : "Use this link if you want to manually subscribe from a calendar app."}
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: "14px", borderTop: "1px solid #e6ebf0", paddingTop: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: 850, color: "#0f172a", marginBottom: "6px" }}>
          Questions?
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5, marginBottom: "8px" }}>
          Visit our Help Center for step-by-step guides and troubleshooting.
        </div>
        <Link href="/help" style={{ fontSize: "12px", fontWeight: 850, color: "#0f3d75", textDecoration: "none" }}>
          Go to Help Center →
        </Link>
      </div>

      <ProviderModal
        open={showProviders}
        onClose={() => setShowProviders(false)}
        onManual={() => setShowAdvanced(true)}
      />
    </div>
  );
}
