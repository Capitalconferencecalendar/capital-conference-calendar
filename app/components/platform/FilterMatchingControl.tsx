"use client";

export type FilterMatchMode = "and" | "or";

type FilterMatchingControlProps = {
  value: FilterMatchMode;
  onChange: (value: FilterMatchMode) => void;
  compact?: boolean;
};

export default function FilterMatchingControl({
  value,
  onChange,
  compact = false,
}: FilterMatchingControlProps) {
  const height = compact ? "30px" : "34px";

  return (
    <div
      aria-label="Filter Matching"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? "7px" : "9px",
        minWidth: 0,
      }}
    >
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
      <div
        role="group"
        aria-label="Filter matching mode"
        title="Use Match All to narrow results. Use Match Any to find related opportunities across selected filters."
        style={{
          display: "inline-flex",
          height,
          padding: "3px",
          borderRadius: "999px",
          border: "1px solid rgba(96,165,250,0.34)",
          background: "rgba(5,19,35,0.82)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
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
                padding: compact ? "0 9px" : "0 11px",
                background: active ? "linear-gradient(180deg, #2877ef, #1f5fd4)" : "transparent",
                boxShadow: active ? "0 0 0 1px rgba(147,197,253,0.28), 0 4px 10px rgba(37,99,235,0.22)" : "none",
                color: active ? "#ffffff" : "#a9c0db",
                cursor: "pointer",
                fontSize: compact ? "10px" : "11px",
                fontWeight: 850,
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
