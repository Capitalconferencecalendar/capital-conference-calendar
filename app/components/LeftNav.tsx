import Link from "next/link";
import type { ReactNode } from "react";

type LeftNavProps = {
  active?: "dashboard" | "events" | "feeds" | "submit" | "help" | "about" | "legal";
};

type IconName = "workspace" | "calendar" | "submit" | "help" | "about" | "legal" | "settings";

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "workspace") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    );
  }

  if (name === "submit") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }

  if (name === "help") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-.9.6-1.4 1.1-1.4 2.4" />
        <path d="M12 17h.01" />
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

  if (name === "legal") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3v18M6 7h12M8 7l-4 7h8L8 7ZM16 7l-4 7h8l-4-7Z" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M17 7l2.1-2.1M4.9 19.1 7 17" />
    </svg>
  );
}

function NavIconButton({
  href,
  title,
  icon,
  isActive,
}: {
  href: string;
  title: string;
  icon: IconName;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: isActive ? "#ffffff" : "#c7d7ea",
        textDecoration: "none",
        border: isActive ? "1px solid rgba(96,165,250,0.45)" : "1px solid rgba(255,255,255,0.08)",
        background: isActive
          ? "linear-gradient(180deg, rgba(39,108,190,0.92) 0%, rgba(18,72,133,0.92) 100%)"
          : "rgba(255,255,255,0.03)",
        boxShadow: isActive ? "0 8px 20px rgba(11,44,84,0.45)" : "none",
        transition: "all 150ms ease",
      }}
    >
      <Icon name={icon} />
    </Link>
  );
}

function MiniLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(203,213,225,0.58)",
      }}
    >
      {children}
    </div>
  );
}

export default function LeftNav({ active = "dashboard" }: LeftNavProps) {
  return (
    <aside
      className="ccc-left-nav"
      style={{
        position: "sticky",
        top: "84px",
        alignSelf: "start",
        height: "calc(100vh - 96px)",
        borderRadius: "12px",
        border: "1px solid rgba(148,163,184,0.14)",
        background: "linear-gradient(180deg, rgba(5,22,42,0.98) 0%, rgba(3,14,28,0.98) 100%)",
        padding: "10px 10px 12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "10px",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "grid", justifyItems: "center", gap: "10px" }}>
        <Link
          href="/"
          title="Workspace"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            border: "1px solid rgba(96,165,250,0.28)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: "#e2ecf8",
            background: "rgba(59,130,246,0.12)",
            fontWeight: 900,
            fontSize: "16px",
          }}
        >
          CCC
        </Link>

        <div style={{ display: "grid", gap: "8px" }}>
          <NavIconButton href="/" title="Workspace" icon="workspace" isActive={active === "dashboard" || active === "events"} />
          <NavIconButton href="/events#calendar-feed" title="Calendar Feed" icon="calendar" isActive={active === "feeds"} />
          <NavIconButton href="/submit" title="Submit" icon="submit" isActive={active === "submit"} />
          <NavIconButton href="/help" title="Help" icon="help" isActive={active === "help"} />
          <NavIconButton href="/about" title="About" icon="about" isActive={active === "about"} />
        </div>
      </div>

      <div style={{ display: "grid", gap: "10px", justifyItems: "center" }}>
        <div
          title="Live Data Connected"
          style={{
            width: "100%",
            borderRadius: "10px",
            border: "1px solid rgba(34,197,94,0.24)",
            background: "rgba(22,101,52,0.12)",
            padding: "8px 6px",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#86efac", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" }}>
            LIVE
          </div>
          <div style={{ color: "#bbf7d0", fontSize: "10px", marginTop: "2px" }}>Connected</div>
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          <MiniLabel>System</MiniLabel>
          <NavIconButton href="/legal" title="Legal" icon="legal" isActive={active === "legal"} />
          <button
            type="button"
            title="Settings"
            aria-label="Settings"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c7d7ea",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              cursor: "default",
            }}
          >
            <Icon name="settings" />
          </button>
        </div>
      </div>
    </aside>
  );
}
