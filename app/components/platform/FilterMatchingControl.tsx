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
  const height = minimal ? "30px" : compact ? "30px" : "34px";

  return (
    <div
      aria-label="Filter Matching"
      style={{
        display: minimal ? "block" : "inline-flex",
        alignItems: "center",
        gap: minimal ? "5px" : compact ? "7px" : "9px",
        minWidth: 0,
        width: minimal ? "100%" : undefined,
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
        style={{
          display: minimal ? "grid" : "inline-flex",
          gridTemplateColumns: minimal ? "1fr 1fr" : undefined,
          gap: minimal ? "6px" : undefined,
          height,
          padding: minimal ? "2px" : "3px",
          width: minimal ? "100%" : undefined,
          boxSizing: "border-box",
          borderRadius: "999px",
          border: minimal ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(96,165,250,0.34)",
          background: minimal ? "rgba(5,19,35,0.52)" : "rgba(5,19,35,0.82)",
          boxShadow: minimal ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
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
                border: 0,
                borderRadius: "999px",
                padding: minimal ? "0 12px" : compact ? "0 9px" : "0 11px",
                width: minimal ? "100%" : undefined,
                background: minimal ? (active ? "rgba(255,255,255,0.14)" : "transparent") : active ? "linear-gradient(180deg, #2877ef, #1f5fd4)" : "transparent",
                boxShadow: minimal ? (active ? "0 0 10px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.12)" : "none") : active ? "0 0 0 1px rgba(147,197,253,0.28), 0 4px 10px rgba(37,99,235,0.22)" : "none",
                color: active ? "#ffffff" : minimal ? "#9eb4cf" : "#a9c0db",
                cursor: "pointer",
                fontSize: minimal ? "11px" : compact ? "10px" : "11px",
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
