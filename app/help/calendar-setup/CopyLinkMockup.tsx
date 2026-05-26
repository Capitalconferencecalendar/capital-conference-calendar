"use client";

import { useState } from "react";

export default function CopyLinkMockup({
  feedUrl,
  borderColor,
  buttonBorderColor,
  buttonBgColor,
}: {
  feedUrl: string;
  borderColor: string;
  buttonBorderColor: string;
  buttonBgColor: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ padding: "10px", display: "grid", gap: "7px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Your Live Calendar Link</div>
      <div
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: "7px",
          backgroundColor: "#fbfdff",
          padding: "8px",
          fontSize: "12px",
          color: "#334155",
          overflowWrap: "anywhere",
        }}
      >
        {feedUrl}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: copied ? "#15803d" : "#64748b", fontWeight: 700 }}>
          {copied ? "Link copied to clipboard." : "Click copy to save your live link."}
        </span>
        <button
          type="button"
          onClick={onCopy}
          style={{
            border: `1px solid ${buttonBorderColor}`,
            backgroundColor: buttonBgColor,
            color: "#fff",
            fontSize: "12px",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {copied ? "Copied" : "Copy Live Calendar Link"}
        </button>
      </div>
    </div>
  );
}

