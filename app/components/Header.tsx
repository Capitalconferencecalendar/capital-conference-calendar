"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HeaderProps = {
  active?: "dashboard" | "events" | "feeds" | "submit" | "help" | "about" | "legal" | "subscribe";
  searchQuery?: string;
};

function NavIcon({ name }: { name: "dashboard" | "about" | "contact" | "legal" | "subscribe" | "submit" }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "dashboard") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    );
  }

  if (name === "about") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v7M12 7h.01" />
      </svg>
    );
  }

  if (name === "contact") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (name === "legal") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3 5 6v6c0 5 3.4 8.3 7 9 3.6-.7 7-4 7-9V6l-7-3Z" />
        <path d="M9 12h6" />
      </svg>
    );
  }

  if (name === "subscribe") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M14 5a3 3 0 0 0-6 0c0 7-3 8-3 8h12s-3-1-3-8" />
        <path d="M10.2 17a2 2 0 0 0 3.6 0" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function TopNavLink({
  href,
  label,
  icon,
  isActive,
  compact = false,
}: {
  href: string;
  label: string;
  icon: "dashboard" | "about" | "contact" | "legal" | "subscribe" | "submit";
  isActive?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "grid",
        placeItems: "center",
        justifyContent: "center",
        gap: "2px",
        width: compact ? "62px" : "72px",
        height: compact ? "46px" : "52px",
        padding: compact ? "3px 5px" : "4px 6px",
        borderRadius: "10px",
        color: isActive ? "#ffffff" : "#1e293b",
        background: isActive
          ? "linear-gradient(180deg, #1d4f91 0%, #0f3d75 100%)"
          : "#eef3f8",
        border: isActive
          ? "1px solid rgba(15, 61, 117, 0.28)"
          : "1px solid #cfd9e6",
        boxShadow: isActive
          ? "0 6px 18px rgba(15, 23, 42, 0.14)"
          : "0 1px 4px rgba(15, 23, 42, 0.05)",
        fontSize: compact ? "9px" : "10px",
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <NavIcon name={icon} />
      {label}
    </Link>
  );
}

export default function Header({
  active = "dashboard",
  searchQuery = "",
}: HeaderProps) {
  const [query, setQuery] = useState(searchQuery);
  const [compactNav, setCompactNav] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const syncCompact = () => setCompactNav(mq.matches);
    syncCompact();
    mq.addEventListener("change", syncCompact);
    return () => mq.removeEventListener("change", syncCompact);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  return (
    <header
      style={{
        position: "fixed",
        top: "36px",
        left: 0,
        right: 0,
        zIndex: 49,
        background:
          "radial-gradient(120% 220% at 50% -120%, rgba(37,99,235,0.22) 0%, rgba(243,246,250,0) 55%), linear-gradient(180deg, rgba(234,241,250,0.97) 0%, rgba(243,246,250,0.95) 100%)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.28)",
      }}
    >
      <div
        className="ccc-header-grid"
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: compactNav ? "8px 12px" : "12px 14px",
          display: "grid",
          gridTemplateColumns: compactNav ? "auto minmax(0, 1fr)" : "280px minmax(360px, 1fr) auto",
          gridTemplateAreas: compactNav
            ? "\"actions logo\" \"search search\""
            : "\"logo search actions\"",
          alignItems: "center",
          gap: compactNav ? "10px" : "16px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: compactNav ? "flex-start" : "center",
            gap: "10px",
            textDecoration: "none",
            color: "#0f172a",
            width: compactNav ? "auto" : "100%",
            minWidth: compactNav ? "180px" : "240px",
            gridArea: "logo",
            justifySelf: compactNav ? "start" : "stretch",
            position: "relative",
            zIndex: 3,
            flexShrink: 0,
            overflow: "visible",
          }}
        >
          <img
            src="/logo.png"
            alt="Capital Conference Calendar"
            loading="eager"
            decoding="sync"
            style={{
              height: compactNav ? "42px" : "50px",
              width: "auto",
              objectFit: "contain",
              display: "block",
              maxWidth: "100%",
              visibility: "visible",
              opacity: 1,
            }}
          />

        </Link>

        <form
          className="ccc-header-search"
          action="/"
          method="get"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
            justifySelf: "center",
            width: "100%",
            maxWidth: compactNav ? "560px" : "640px",
            gridArea: "search",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <input
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conferences, organizers, cities, sectors..."
              style={{
                width: "100%",
                height: compactNav ? "40px" : "46px",
                borderRadius: "10px",
                border: "1px solid #d5dde7",
                backgroundColor: "#ffffff",
                padding: query ? "0 42px 0 16px" : "0 16px",
                fontSize: compactNav ? "13px" : "14px",
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  height: "24px",
                  width: "24px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#eef2f7",
                  color: "#475569",
                  fontWeight: 700,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            ) : null}
          </div>

          <button
            type="submit"
              style={{
                height: compactNav ? "40px" : "46px",
                padding: compactNav ? "0 14px" : "0 18px",
                borderRadius: "10px",
                border: "1px solid #111827",
                backgroundColor: "#111827",
                color: "#ffffff",
                fontSize: compactNav ? "13px" : "14px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
          >
            Search
          </button>
        </form>

        <div
          className="ccc-header-actions"
          ref={menuRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: compactNav ? "flex-start" : "flex-end",
            gap: "8px",
            flexWrap: "wrap",
            position: "relative",
            gridArea: "actions",
            justifySelf: compactNav ? "start" : "end",
          }}
        >
          {compactNav ? (
            <>
              <TopNavLink
                href="/"
                label="Dashboard"
                icon="dashboard"
                isActive={active === "dashboard"}
                compact
              />
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  height: "46px",
                  minWidth: "62px",
                  borderRadius: "10px",
                  border: "1px solid #cfd9e6",
                  background: "#eef3f8",
                  color: "#1e293b",
                  display: "grid",
                  placeItems: "center",
                  gap: "2px",
                  fontSize: "9px",
                  fontWeight: 700,
                  lineHeight: 1,
                  padding: "3px 5px",
                  cursor: "pointer",
                }}
                aria-expanded={menuOpen}
                aria-label="Open utility menu"
              >
                <span style={{ fontSize: "14px", lineHeight: 1 }}>☰</span>
                Menu
              </button>
              {menuOpen ? (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "58px",
                    width: "190px",
                    borderRadius: "12px",
                    border: "1px solid rgba(147,197,253,0.28)",
                    background: "linear-gradient(180deg, rgba(8,30,53,0.96), rgba(6,22,40,0.98))",
                    boxShadow: "0 16px 28px rgba(2,8,18,0.42)",
                    padding: "8px",
                    display: "grid",
                    gap: "6px",
                    zIndex: 120,
                  }}
                >
                  {[
                    { href: "/?mode=about", label: "About", icon: "about" as const, active: active === "about" },
                    { href: "/?mode=contact", label: "Contact", icon: "contact" as const, active: active === "help" },
                    { href: "/?mode=legal", label: "Legal", icon: "legal" as const, active: active === "legal" },
                    { href: "/?mode=subscribe", label: "Subscribe", icon: "subscribe" as const, active: active === "subscribe" },
                    { href: "/?mode=submit", label: "Submit", icon: "submit" as const, active: active === "submit" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        height: "38px",
                        borderRadius: "9px",
                        border: item.active ? "1px solid rgba(147,197,253,0.6)" : "1px solid rgba(147,197,253,0.2)",
                        background: item.active ? "rgba(37,99,235,0.28)" : "rgba(8,24,44,0.55)",
                        color: "#dbeafe",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "0 10px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      <NavIcon name={item.icon} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <TopNavLink
                href="/"
                label="Dashboard"
                icon="dashboard"
                isActive={active === "dashboard"}
                compact={false}
              />
              <TopNavLink
                href="/?mode=about"
                label="About"
                icon="about"
                isActive={active === "about"}
              />
              <TopNavLink
                href="/?mode=contact"
                label="Contact"
                icon="contact"
                isActive={active === "help"}
              />
              <TopNavLink
                href="/?mode=legal"
                label="Legal"
                icon="legal"
                isActive={active === "legal"}
              />
              <TopNavLink
                href="/?mode=subscribe"
                label="Subscribe"
                icon="subscribe"
                isActive={active === "subscribe"}
              />
              <TopNavLink
                href="/?mode=submit"
                label="Submit"
                icon="submit"
                isActive={active === "submit"}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
