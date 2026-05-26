"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type HeaderProps = {
  active?: "dashboard" | "events" | "feeds" | "submit" | "help" | "about" | "legal" | "subscribe";
  searchQuery?: string;
};

function NavIcon({ name }: { name: "dashboard" | "about" | "contact" | "subscribe" | "submit" }) {
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
}: {
  href: string;
  label: string;
  icon: "dashboard" | "about" | "contact" | "subscribe" | "submit";
  isActive?: boolean;
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
        width: "72px",
        height: "52px",
        padding: "4px 6px",
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
        fontSize: "10px",
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
          padding: "12px 14px",
          display: "grid",
          gridTemplateColumns: "280px minmax(360px, 1fr) auto",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#0f172a",
            width: "100%",
          }}
        >
          <Image
            src="/logo.png"
            alt="Capital Conference Calendar"
            width={2255}
            height={389}
            priority
            style={{
              height: "46px",
              width: "auto",
              objectFit: "contain",
              display: "block",
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
            maxWidth: "640px",
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
                height: "46px",
                borderRadius: "10px",
                border: "1px solid #d5dde7",
                backgroundColor: "#ffffff",
                padding: query ? "0 42px 0 16px" : "0 16px",
                fontSize: "14px",
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
              height: "46px",
              padding: "0 18px",
              borderRadius: "10px",
              border: "1px solid #111827",
              backgroundColor: "#111827",
              color: "#ffffff",
              fontSize: "14px",
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
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <TopNavLink
            href="/"
            label="Dashboard"
            icon="dashboard"
            isActive={active === "dashboard"}
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
        </div>
      </div>
    </header>
  );
}
