"use client";

export type FilterMatchMode = "and" | "or";

type FilterMatchingControlProps = {
  value: FilterMatchMode;
  onChange: (value: FilterMatchMode) => void;
  compact?: boolean;
  minimal?: boolean;
};

export default function FilterMatchingControl({
  value,
  onChange,
  compact = false,
  minimal = false,
}: FilterMatchingControlProps) {
  const height = minimal ? "24px" : compact ? "30px" : "34px";

  return (
    <div
      aria-label="Filter Matching"
      style={{
        display: minimal ? "grid" : "inline-flex",
        gridTemplateColumns: minimal ? "1fr 1fr" : undefined,
        alignItems: "center",
        gap: minimal ? "5px" : compact ? "7px" : "9px",
        minWidth: 0,
      }}
    >
      {minimal ? null : (
        <span
          style={{
            color: "#9fc5ef",
            fontSize: compact ? "9px" : "10px",
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Filter Matching
        </span>
      )}
      <div
        role="group"
        aria-label="Filter matching mode"
        title="Use Match All to narrow results. Use Match Any to find related opportunities across selected filters."
        style={{
          display: minimal ? "contents" : "inline-flex",
          height,
          padding: minimal ? 0 : "3px",
          borderRadius: minimal ? 0 : "999px",
          border: minimal ? 0 : "1px solid rgba(96,165,250,0.34)",
          background: minimal ? "transparent" : "rgba(5,19,35,0.82)",
          boxShadow: minimal ? "none" : "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {([
          ["and", "Match All"],
          ["or", "Match Any"],
        ] as const).map(([mode, label]) => {
          const active = value === mode;
          return (
            <button
              key={mode}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(mode)}
              style={{
                height: "100%",
                border: minimal ? (active ? "1px solid rgba(255,255,255,0.38)" : "1px solid rgba(255,255,255,0.12)") : 0,
                borderRadius: minimal ? "6px" : "999px",
                padding: minimal ? "0 8px" : compact ? "0 9px" : "0 11px",
                background: minimal ? (active ? "rgba(255,255,255,0.1)" : "rgba(8,26,46,0.24)") : active ? "linear-gradient(180deg, #2877ef, #1f5fd4)" : "transparent",
                boxShadow: minimal ? (active ? "0 0 8px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.02)") : active ? "0 0 0 1px rgba(147,197,253,0.28), 0 4px 10px rgba(37,99,235,0.22)" : "none",
                color: active ? "#ffffff" : minimal ? "#9eb4cf" : "#a9c0db",
                cursor: "pointer",
                fontSize: minimal ? "10px" : compact ? "10px" : "11px",
                fontWeight: minimal ? 800 : 850,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
