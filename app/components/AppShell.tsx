import Header from "./Header";
import EventTicker from "./EventTicker";
import Link from "next/link";

type AppShellProps = {
  active?: "dashboard" | "events" | "feeds" | "submit" | "help" | "about" | "legal";
  searchQuery?: string;
  workspaceMode?: "getstarted" | "discovery" | "marketview";
  fixedDesktopPreview?: boolean;
  children: React.ReactNode;
  rightRail?: React.ReactNode;
  tickerEvents?: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    city: string;
  }>;
};

export default function AppShell({
  active = "dashboard",
  searchQuery = "",
  workspaceMode,
  fixedDesktopPreview = false,
  children,
  rightRail,
  tickerEvents,
}: AppShellProps) {
  const isWorkspaceMode = active === "dashboard" || active === "events";

  return (
    <main
      style={{
        height: "100vh",
        background: "radial-gradient(110% 90% at 50% -10%, rgba(37,99,235,0.16) 0%, rgba(3,20,37,1) 52%), linear-gradient(180deg, #041527 0%, #031425 100%)",
        color: "#dbeafe",
        fontFamily: "var(--font-body), Arial, sans-serif",
        overflowX: "hidden",
        overflowY: isWorkspaceMode ? "hidden" : "auto",
        paddingTop: "106px",
      }}
    >
      <EventTicker events={tickerEvents} />
      <Header active={active} searchQuery={searchQuery} workspaceMode={workspaceMode} />

      <div
        className="ccc-app-frame"
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: isWorkspaceMode ? fixedDesktopPreview ? "10px 0 14px" : "10px 14px 14px" : "14px 14px 20px",
          height: isWorkspaceMode ? "calc(100vh - 106px)" : "auto",
          minHeight: 0,
          overflowX: isWorkspaceMode && fixedDesktopPreview ? "auto" : isWorkspaceMode ? "hidden" : "visible",
          overflowY: isWorkspaceMode ? "hidden" : "visible",
        }}
      >
        <div
          className={rightRail ? "ccc-shell-grid ccc-shell-grid--right-rail" : "ccc-shell-grid"}
          style={{
            display: "grid",
            gridTemplateColumns: rightRail
              ? `minmax(0, 1fr) 320px`
              : `minmax(0, 1fr)`,
            gap: "16px",
            alignItems: "stretch",
            height: isWorkspaceMode ? "100%" : "auto",
            minHeight: 0,
            overflow: isWorkspaceMode && !fixedDesktopPreview ? "hidden" : "visible",
          }}
        >
          <section style={{ minWidth: 0, minHeight: 0, overflow: fixedDesktopPreview ? "visible" : "hidden", height: isWorkspaceMode ? "100%" : "auto" }}>{children}</section>

          {rightRail ? (
            <aside
              className="ccc-right-rail"
              style={{
                minWidth: 0,
                width: "100%",
                position: "sticky",
                top: "84px",
                alignSelf: "start",
              }}
            >
              {rightRail}
            </aside>
          ) : null}
        </div>
      </div>

      {!isWorkspaceMode ? (
      <footer
        style={{
          borderTop: "1px solid rgba(148, 163, 184, 0.18)",
          background:
            "radial-gradient(120% 160% at 50% -20%, rgba(37,99,235,0.08) 0%, rgba(238,243,249,0) 46%), linear-gradient(180deg, #eef3f8 0%, #e7eef7 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1520px",
            margin: "0 auto",
            padding: "24px 16px 18px",
            display: "grid",
            gap: "22px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(240px, 1.25fr) repeat(3, minmax(150px, 0.8fr))",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                Capital Conference Calendar
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.6, color: "#475569", maxWidth: "320px" }}>
                Discover conferences, investors, organizers, and market events.
              </div>
              <Link
                href="/subscribe"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(59,130,246,0.28)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(244,248,253,0.96))",
                  color: "#0f3d75",
                  fontSize: "13px",
                  fontWeight: 800,
                  width: "fit-content",
                  boxShadow: "0 8px 18px rgba(37,99,235,0.08)",
                }}
              >
                Stay ahead of the conference calendar
              </Link>
            </div>

            {[
              {
                title: "Explore",
                links: [
                  { label: "Get Started", href: "/?mode=getstarted" },
                  { label: "Discovery", href: "/?mode=market" },
                  { label: "Market View", href: "/?mode=marketview" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "/help" },
                  { label: "Submit", href: "/submit" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { label: "Subscribe", href: "/subscribe" },
                  { label: "Legal", href: "/legal" },
                ],
              },
            ].map((group) => (
              <div key={group.title} style={{ display: "grid", gap: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0f3d75" }}>
                  {group.title}
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{
                        textDecoration: "none",
                        color: "#334155",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(148, 163, 184, 0.22)",
              paddingTop: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55 }}>
              Get new conferences and updates delivered to your inbox through the existing weekly briefing.
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
              © 2026 Capital Conference Calendar
            </div>
          </div>
        </div>
      </footer>
      ) : null}
    </main>
  );
}
