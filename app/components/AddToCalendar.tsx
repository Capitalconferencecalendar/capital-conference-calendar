"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AddToCalendarProps = {
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  url?: string;
  compact?: boolean;
  showIcon?: boolean;
};

function toGoogleDate(date: string) {
  return `${date.replace(/-/g, "")}T000000Z`;
}

function toGoogleEndDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return `${parsed.toISOString().slice(0, 10).replace(/-/g, "")}T000000Z`;
}

export default function AddToCalendar({
  title,
  startDate,
  endDate,
  location = "",
  description = "",
  url = "",
  compact = false,
  showIcon = false,
}: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const portalReady = typeof window !== "undefined";
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const safeEndDate = endDate || startDate;

  const hasUrlAlready = !!url && description.includes(url);
  const details =
    url && !hasUrlAlready
      ? `${description}\n\nEvent Link:\n${url}`
      : description;

  const googleUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${toGoogleDate(startDate)}/${toGoogleEndDate(safeEndDate)}` +
    `&location=${encodeURIComponent(location)}` +
    `&details=${encodeURIComponent(details)}`;

  const outlookUrl =
    `https://outlook.live.com/calendar/0/deeplink/compose` +
    `?path=/calendar/action/compose` +
    `&rru=addevent` +
    `&subject=${encodeURIComponent(title)}` +
    `&startdt=${encodeURIComponent(startDate)}` +
    `&enddt=${encodeURIComponent(safeEndDate)}` +
    `&location=${encodeURIComponent(location)}` +
    `&body=${encodeURIComponent(details)}`;

  const appleIcsUrl =
    `/api/ics/ics-single` +
    `?title=${encodeURIComponent(title)}` +
    `&start=${encodeURIComponent(startDate)}` +
    `&end=${encodeURIComponent(safeEndDate)}` +
    `&location=${encodeURIComponent(location)}` +
    `&description=${encodeURIComponent(details)}` +
    `&url=${encodeURIComponent(url)}`;

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      if (!rootRef.current && !menuRef.current) return;
      {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    function updateMenuPos() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - 220),
      });
    }
    if (open) {
      updateMenuPos();
      window.addEventListener("resize", updateMenuPos);
      window.addEventListener("scroll", updateMenuPos, true);
    }
    return () => {
      window.removeEventListener("resize", updateMenuPos);
      window.removeEventListener("scroll", updateMenuPos, true);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        zIndex: open ? 5000 : 10,
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        style={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: compact ? "34px" : "42px",
          padding: compact ? "0 14px" : "0 14px",
          borderRadius: compact ? "8px" : "10px",
          backgroundColor: "#f8fbff",
          border: "1px solid #d7dde5",
          color: "#0f172a",
          fontSize: compact ? "13px" : "13px",
          fontWeight: compact ? 670 : 700,
          userSelect: "none",
          whiteSpace: "nowrap",
          minWidth: compact ? "108px" : "auto",
          boxShadow: compact
            ? "0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 12px rgba(8,24,43,0.26), 0 0 0 1px rgba(144,179,224,0.2), 0 0 14px rgba(128,166,216,0.16)"
            : "0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 14px rgba(8,24,43,0.28), 0 0 0 1px rgba(144,179,224,0.2), 0 0 16px rgba(128,166,216,0.18)",
          transition: "filter 180ms ease-out, box-shadow 180ms ease-out, background-color 180ms ease-out",
          position: "relative",
          zIndex: 30,
          pointerEvents: "auto",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.filter = "brightness(1.03)";
          event.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 16px rgba(8,24,43,0.32), 0 0 0 1px rgba(162,194,236,0.32), 0 0 20px rgba(142,182,234,0.24)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.filter = "none";
          event.currentTarget.style.boxShadow = compact
            ? "0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 12px rgba(8,24,43,0.26), 0 0 0 1px rgba(144,179,224,0.2), 0 0 14px rgba(128,166,216,0.16)"
            : "0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 14px rgba(8,24,43,0.28), 0 0 0 1px rgba(144,179,224,0.2), 0 0 16px rgba(128,166,216,0.18)";
        }}
      >
        {showIcon ? <span style={{ marginRight: "6px", opacity: 0.9 }}>📅</span> : null}
        Add to Calendar
      </button>

      {open && portalReady
        ? createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: `${menuPos.top}px`,
                left: `${menuPos.left}px`,
                zIndex: 2147483647,
                isolation: "isolate",
                width: "220px",
                backgroundColor: "#ffffff",
                border: "1px solid #d7dde5",
                borderRadius: "12px",
                boxShadow: "0 14px 32px rgba(15, 23, 42, 0.32)",
                padding: "8px",
                pointerEvents: "auto",
              }}
            >
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                }}
              >
                Google Calendar
              </a>

              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                }}
              >
                Outlook
              </a>

              <a
                href={appleIcsUrl}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                }}
              >
                Apple Calendar / ICS
              </a>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
