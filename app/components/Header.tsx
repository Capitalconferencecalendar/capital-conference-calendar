"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HeaderProps = {
  active?: "dashboard" | "events" | "feeds" | "submit" | "help" | "about" | "legal" | "subscribe";
  searchQuery?: string;
  workspaceMode?: "getstarted" | "discovery" | "marketview";
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
  icon?: "dashboard" | "about" | "contact" | "legal" | "subscribe" | "submit";
  isActive?: boolean;
  compact?: boolean;
}) {
  const isSubmit = icon === "submit";
  const isDesktopSecondary = !compact && (label === "About" || label === "Contact" || label === "Submit");
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: compact ? "62px" : label === "Submit" ? "72px" : "64px",
        maxWidth: compact ? "74px" : label === "Contact" ? "74px" : label === "Submit" ? "76px" : "68px",
        height: compact ? "44px" : "36px",
        padding: compact ? "3px 5px" : "0 10px",
        borderRadius: compact ? "10px" : "8px",
        color: isActive ? "#ffffff" : "#1e293b",
        background: isActive
          ? "linear-gradient(180deg, #1d4f91 0%, #0f3d75 100%)"
          : "#eef3f8",
        border: isActive
          ? "1px solid rgba(15, 61, 117, 0.28)"
          : isSubmit
            ? "1px solid rgba(85, 145, 255, 0.72)"
            : "1px solid #cfd9e6",
        boxShadow: isActive
          ? "0 6px 18px rgba(15, 23, 42, 0.14)"
          : isSubmit
            ? "0 0 0 1px rgba(113, 176, 255, 0.18), 0 0 14px rgba(65, 132, 255, 0.2)"
            : "0 1px 4px rgba(15, 23, 42, 0.05)",
        fontSize: compact ? "9px" : "10.5px",
        fontWeight: isDesktopSecondary ? 560 : 850,
        letterSpacing: compact ? "0" : "0.01em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}

function WorkspaceNavButton({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: label === "Get Started" ? "110px" : label === "Market View" ? "118px" : "108px",
        maxWidth: label === "Get Started" ? "116px" : label === "Market View" ? "124px" : "114px",
        height: "42px",
        padding: "0 10px",
        borderRadius: "10px",
        color: "#eef6ff",
        background: isActive
          ? "#2f6df6"
          : "linear-gradient(180deg, rgba(34,88,188,0.98) 0%, rgba(23,62,143,0.98) 100%)",
        border: isActive
          ? "1px solid rgba(147,197,253,0.55)"
          : "1px solid rgba(108, 165, 245, 0.42)",
        boxShadow: isActive
          ? "0 0 0 1px rgba(59,130,246,0.18)"
          : "0 6px 16px rgba(22, 61, 145, 0.16), inset 0 1px 0 rgba(255,255,255,0.05)",
        fontSize: label === "Discovery" || label === "Market View" ? "13px" : "11px",
        fontWeight: 850,
        letterSpacing: "0.01em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}

export default function Header({
  active = "dashboard",
  searchQuery = "",
  workspaceMode,
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

  const isGetStartedActive = workspaceMode === "getstarted";
  const isDiscoveryActive = workspaceMode === "discovery";
  const isMarketViewActive = workspaceMode === "marketview";

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
          maxWidth: compactNav ? "100%" : "1720px",
          margin: "0 auto",
          padding: compactNav ? "8px 12px" : "10px 16px",
          display: "grid",
          gridTemplateColumns: compactNav ? "auto minmax(0, 1fr)" : "210px minmax(0, 1fr) auto",
          gridTemplateAreas: compactNav
            ? "\"actions logo\" \"search search\""
            : "\"logo search actions\"",
          alignItems: "center",
          gap: compactNav ? "10px" : "14px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: compactNav ? "flex-start" : "flex-start",
            gap: "10px",
            textDecoration: "none",
            color: "#0f172a",
            width: compactNav ? "auto" : "100%",
            minWidth: compactNav ? "180px" : "206px",
            gridArea: "logo",
            justifySelf: compactNav ? "start" : "start",
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
              height: compactNav ? "42px" : "38px",
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
          className="ccc-header-search ccc-header-core-group"
          action="/"
          method="get"
          onSubmit={(event) => {
            event.preventDefault();
            const params = new URLSearchParams({ mode: "market" });
            const value = query.trim();
            if (value) params.set("q", value);
            window.location.assign(`/?${params.toString()}`);
          }}
          style={{
            display: compactNav ? "flex" : "grid",
            alignItems: "center",
            gap: compactNav ? "8px" : "10px",
            minWidth: 0,
            justifySelf: "center",
            width: "100%",
            maxWidth: compactNav ? "100%" : "1140px",
            gridArea: "search",
            justifyContent: compactNav ? "flex-start" : undefined,
            gridTemplateColumns: compactNav ? undefined : "1fr auto 1fr",
          }}
        >
          {!compactNav ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                minWidth: 0,
              }}
            >
              <WorkspaceNavButton
                href="/?mode=getstarted"
                label="Get Started"
                isActive={isGetStartedActive}
              />
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: compactNav ? "8px" : "10px",
              width: compactNav ? "100%" : "auto",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <div
              style={{
                position: "relative",
                width: compactNav ? "100%" : "clamp(500px, 32vw, 600px)",
                minWidth: 0,
                flex: compactNav ? 1 : "0 1 auto",
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
                  height: compactNav ? "40px" : "42px",
                  borderRadius: "12px",
                  border: "1px solid #d5dde7",
                  backgroundColor: "#ffffff",
                  padding: query ? "0 132px 0 18px" : "0 96px 0 18px",
                  fontSize: compactNav ? "12.5px" : "12px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "5px",
                  top: "5px",
                  bottom: "5px",
                  minWidth: compactNav ? "66px" : "76px",
                  padding: compactNav ? "0 10px" : "0 12px",
                  borderRadius: "9px",
                  border: "1px solid rgba(10, 29, 52, 0.88)",
                  background: "linear-gradient(180deg, #10253f 0%, #08192d 100%)",
                  color: "#ffffff",
                  fontSize: compactNav ? "11px" : "12px",
                  fontWeight: 850,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 14px rgba(5, 18, 32, 0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                Search
              </button>

              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  title="Clear search"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: compactNav ? "84px" : "94px",
                    transform: "translateY(-50%)",
                    height: "26px",
                    width: "26px",
                    borderRadius: "8px",
                    border: "1px solid rgba(15, 40, 70, 0.35)",
                    background: "linear-gradient(180deg, #244664 0%, #15314d 100%)",
                    color: "#ffffff",
                    fontSize: "17px",
                    fontWeight: 800,
                    cursor: "pointer",
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(5, 18, 32, 0.2)",
                  }}
                >
                  ×
                  </button>
                ) : null}
              </div>
          </div>
          {!compactNav ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "8px",
                minWidth: 0,
              }}
            >
              <WorkspaceNavButton
                href="/?mode=market"
                label="Discovery"
                isActive={isDiscoveryActive}
              />
              <WorkspaceNavButton
                href="/?mode=marketview"
                label="Market View"
                isActive={isMarketViewActive}
              />
            </div>
          ) : null}
        </form>

        <div
          className="ccc-header-actions"
          ref={menuRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: compactNav ? "flex-start" : "flex-end",
            gap: compactNav ? "8px" : "8px",
            flexWrap: compactNav ? "wrap" : "nowrap",
            position: "relative",
            gridArea: "actions",
            justifySelf: compactNav ? "start" : "end",
          }}
        >
          {compactNav ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  height: "46px",
                  minWidth: "62px",
                  borderRadius: "6px",
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
                    borderRadius: "8px",
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
                    { href: "/?mode=getstarted", label: "Get Started", active: workspaceMode === "getstarted" },
                    { href: "/?mode=market", label: "Discovery", active: workspaceMode === "discovery" },
                    { href: "/?mode=marketview", label: "Market View", active: workspaceMode === "marketview" },
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
                        borderRadius: "6px",
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
                      {"icon" in item && item.icon ? <NavIcon name={item.icon} /> : null}
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                style={{
                  width: "1px",
                  height: "28px",
                  marginLeft: "10px",
                  marginRight: "12px",
                  background: "rgba(107,157,210,0.24)",
                  flex: "0 0 auto",
                }}
              />
              <TopNavLink
                href="/?mode=about"
                label="About"
                isActive={active === "about"}
              />
              <TopNavLink
                href="/?mode=contact"
                label="Contact"
                isActive={active === "help"}
              />
              <TopNavLink
                href="/?mode=submit"
                label="Submit"
                icon="submit"
                isActive={active === "submit"}
                compact={false}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
