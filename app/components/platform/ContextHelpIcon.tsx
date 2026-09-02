"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ContextHelpItem = {
  label: string;
  description: string;
};

type ContextHelpIconProps = {
  title: string;
  items: ContextHelpItem[];
  ariaLabel: string;
  placement?: "top" | "bottom";
};

type PopoverPosition = { left: number; top: number };

export default function ContextHelpIcon({
  title,
  items,
  ariaLabel,
  placement = "bottom",
}: ContextHelpIconProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const closeOnClickAway = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnClickAway);
    return () => document.removeEventListener("mousedown", closeOnClickAway);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const button = buttonRef.current;
      const popover = popoverRef.current;
      if (!button || !popover) return;
      const buttonRect = button.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const edge = 12;
      const left = Math.min(Math.max(buttonRect.right - popoverRect.width, edge), window.innerWidth - popoverRect.width - edge);
      const requestedTop = placement === "top" ? buttonRect.top - popoverRect.height - 10 : buttonRect.bottom + 10;
      const top = Math.min(Math.max(requestedTop, edge), window.innerHeight - popoverRect.height - edge);
      setPosition({ left, top });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, placement]);

  const closeWhenLeaving = (relatedTarget: EventTarget | null) => {
    if (relatedTarget instanceof Node && (rootRef.current?.contains(relatedTarget) || popoverRef.current?.contains(relatedTarget))) return;
    setOpen(false);
  };

  const popover = open && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={title}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={(event) => closeWhenLeaving(event.relatedTarget)}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          style={{
            position: "fixed",
            left: position?.left ?? 0,
            top: position?.top ?? 0,
            width: "280px",
            maxWidth: "calc(100vw - 24px)",
            padding: "14px 15px",
            borderRadius: "8px",
            border: "1px solid rgba(108,164,230,0.42)",
            background: "rgba(5,21,39,0.98)",
            color: "#c9dcef",
            boxShadow: "0 16px 32px rgba(0,0,0,0.42)",
            fontSize: "12px",
            lineHeight: 1.45,
            overflow: "visible",
            zIndex: 1000,
            visibility: position ? "visible" : "hidden",
          }}
        >
          <div style={{ color: "#f3f8ff", fontSize: "13px", fontWeight: 800, lineHeight: 1.3, marginBottom: "10px" }}>{title}</div>
          <div style={{ display: "grid", gap: "10px" }}>
            {items.map((item) => (
              <div key={item.label}>
                <div style={{ color: "#e8f3ff", fontWeight: 800, lineHeight: 1.3, marginBottom: "2px" }}>{item.label}</div>
                <div style={{ color: "#b9cee5" }}>{item.description}</div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <span
      ref={rootRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={(event) => closeWhenLeaving(event.relatedTarget)}
      style={{ position: "relative", display: "inline-flex", flex: "0 0 auto", zIndex: open ? 20 : 2 }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onMouseDown={(event) => event.stopPropagation()}
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
      {popover}
    </span>
  );
}
