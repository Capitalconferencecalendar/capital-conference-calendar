"use client";

import { useEffect, useRef, useState } from "react";

type ContextHelpIconProps = {
  title: string;
  items: string[];
  ariaLabel: string;
  placement?: "top" | "bottom";
};

export default function ContextHelpIcon({
  title,
  items,
  ariaLabel,
  placement = "bottom",
}: ContextHelpIconProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnClickAway = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnClickAway);
    return () => document.removeEventListener("mousedown", closeOnClickAway);
  }, [open]);

  return (
    <span ref={rootRef} style={{ position: "relative", display: "inline-flex", flex: "0 0 auto", zIndex: open ? 20 : 2 }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onMouseDown={(event) => event.stopPropagation()}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "999px",
          border: "1px solid rgba(132,177,229,0.42)",
          background: "rgba(10,29,51,0.86)",
          color: "#a9c9ec",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 900,
          lineHeight: 1,
          boxShadow: open ? "0 0 0 2px rgba(96,165,250,0.2)" : "none",
        }}
      >
        ?
      </button>
      {open ? (
        <span
          role="dialog"
          aria-label={title}
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            position: "absolute",
            width: "230px",
            maxWidth: "min(230px, calc(100vw - 32px))",
            right: 0,
            [placement === "top" ? "bottom" : "top"]: "30px",
            padding: "10px 11px",
            borderRadius: "8px",
            border: "1px solid rgba(108,164,230,0.42)",
            background: "rgba(5,21,39,0.98)",
            color: "#c9dcef",
            boxShadow: "0 14px 28px rgba(0,0,0,0.36)",
            fontSize: "11.5px",
            lineHeight: 1.4,
          }}
        >
          <span style={{ display: "block", color: "#eef6ff", fontWeight: 800, marginBottom: "6px" }}>{title}</span>
          <ul style={{ display: "grid", gap: "4px", padding: 0, margin: 0, listStyle: "none" }}>
            {items.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </span>
      ) : null}
    </span>
  );
}
