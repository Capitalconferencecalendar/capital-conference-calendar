import Header from "./Header";
import EventTicker from "./EventTicker";

type AppShellProps = {
  active?: "dashboard" | "events" | "feeds" | "submit" | "help" | "about" | "legal";
  searchQuery?: string;
  children: React.ReactNode;
  rightRail?: React.ReactNode;
};

export default function AppShell({
  active = "dashboard",
  searchQuery = "",
  children,
  rightRail,
}: AppShellProps) {
  const isWorkspaceMode = active === "dashboard" || active === "events";
  const footerLinks = [
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
    { label: "Submit a Conference", href: "/submit" },
    { label: "Legal", href: "/legal" },
  ];

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
      <EventTicker />
      <Header active={active} searchQuery={searchQuery} />

      <div
        className="ccc-app-frame"
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: isWorkspaceMode ? "10px 14px 14px" : "14px 14px 20px",
          height: isWorkspaceMode ? "calc(100vh - 106px)" : "auto",
          minHeight: 0,
          overflow: isWorkspaceMode ? "hidden" : "visible",
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
            overflow: isWorkspaceMode ? "hidden" : "visible",
          }}
        >
          <section style={{ minWidth: 0, minHeight: 0, overflow: "hidden", height: isWorkspaceMode ? "100%" : "auto" }}>{children}</section>

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
          borderTop: "1px solid #dbe3ec",
          backgroundColor: "#eef3f8",
        }}
      >
        <div
          style={{
            maxWidth: "1520px",
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
            Information Links
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  fontSize: "12px",
                  color: "#334155",
                  border: "1px solid #d7dde5",
                  borderRadius: "999px",
                  backgroundColor: "#ffffff",
                  padding: "4px 8px",
                  lineHeight: 1.4,
                }}
              >
                {link.label} ({link.href})
              </a>
            ))}
          </div>
        </div>
      </footer>
      ) : null}
    </main>
  );
}
