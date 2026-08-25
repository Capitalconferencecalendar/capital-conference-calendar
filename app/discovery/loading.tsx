export default function DiscoveryLoading() {
  const panelStyle = {
    border: "1px solid rgba(96,165,250,0.16)",
    background: "linear-gradient(180deg, rgba(8,30,53,0.74), rgba(4,16,30,0.9))",
    boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
  };
  const shimmerStyle = {
    background:
      "linear-gradient(90deg, rgba(148,163,184,0.10) 0%, rgba(147,197,253,0.18) 42%, rgba(148,163,184,0.10) 82%)",
    backgroundSize: "220% 100%",
    animation: "cccDiscoveryLoadingPulse 1.7s ease-in-out infinite",
  };
  const pill = (width: string, height = "12px") => ({
    width,
    height,
    borderRadius: "999px",
    ...shimmerStyle,
  });

  return (
    <main
      style={{
        height: "100vh",
        background:
          "radial-gradient(110% 90% at 50% -10%, rgba(37,99,235,0.16) 0%, rgba(3,20,37,1) 52%), linear-gradient(180deg, #041527 0%, #031425 100%)",
        color: "#dbeafe",
        fontFamily: "var(--font-body), Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @keyframes cccDiscoveryLoadingPulse {
            0% { background-position: 120% 0; opacity: 0.58; }
            50% { opacity: 0.9; }
            100% { background-position: -120% 0; opacity: 0.58; }
          }
        `}
      </style>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "36px",
          backgroundColor: "#0e2339",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 16px",
          boxSizing: "border-box",
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#34d399", boxShadow: "0 0 0 4px rgba(52,211,153,0.14)" }} />
        <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Upcoming Events</span>
        <span style={pill("34%")} />
        <span style={pill("26%")} />
        <span style={pill("18%")} />
      </div>

      <header
        style={{
          position: "fixed",
          top: "36px",
          left: 0,
          right: 0,
          zIndex: 40,
          height: "70px",
          background: "linear-gradient(180deg, rgba(236,244,252,0.98), rgba(216,230,245,0.98))",
          borderBottom: "1px solid rgba(37,99,235,0.16)",
          display: "grid",
          gridTemplateColumns: "260px minmax(220px, 1fr) auto",
          alignItems: "center",
          gap: "14px",
          padding: "0 18px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #1463ff, #16c7f5)", boxShadow: "0 10px 24px rgba(37,99,235,0.24)" }} />
          <div style={{ display: "grid", gap: "5px", minWidth: 0, width: "160px" }}>
            <span style={{ ...pill("88%", "14px"), background: "rgba(7,26,51,0.18)" }} />
            <span style={{ ...pill("66%", "10px"), background: "rgba(37,99,235,0.18)" }} />
          </div>
        </div>
        <div style={{ height: "40px", borderRadius: "12px", background: "#ffffff", border: "1px solid rgba(37,99,235,0.16)", boxShadow: "0 8px 20px rgba(15,23,42,0.08)", display: "flex", alignItems: "center", padding: "0 14px" }}>
          <span style={{ ...pill("58%", "12px"), background: "rgba(71,85,105,0.14)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "112px", height: "40px", borderRadius: "12px", background: "#1747aa", boxShadow: "0 10px 22px rgba(23,71,170,0.22)" }} />
          <span style={{ width: "112px", height: "40px", borderRadius: "12px", background: "#2f6df6", boxShadow: "0 10px 22px rgba(47,109,246,0.22)" }} />
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 290px) minmax(0, 1fr) minmax(300px, 320px)",
          gridTemplateRows: "minmax(0, 1fr)",
          gap: "18px",
          maxWidth: "100%",
          height: "calc(100vh - 106px)",
          padding: "116px 14px 14px",
          boxSizing: "border-box",
          alignItems: "stretch",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <aside style={{ alignSelf: "stretch", minWidth: 0, width: "100%", maxWidth: "280px", height: "100%", overflow: "hidden" }}>
          <div style={{ height: "100%", overflow: "hidden", paddingRight: "4px", display: "grid", alignContent: "start", gap: "10px" }}>
            <div style={{ padding: "4px 6px 10px" }}>
              <div style={{ color: "#f8fbff", fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}>Refine Your Market View</div>
              <div style={{ ...pill("92%"), height: "12px" }} />
            </div>
            <div style={{ height: "42px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.24)", background: "rgba(8,30,53,0.72)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={pill("42%")} />
            </div>
            {["Date & Timing", "Location", "Sector & Theme", "Participation", "Investor Access", "Organizers"].map((label) => (
              <div key={label} style={{ height: "52px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.18)", background: "rgba(8,30,53,0.72)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", boxSizing: "border-box" }}>
                <span style={{ color: "#dbeafe", fontSize: "12px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
                <span style={{ width: "7px", height: "7px", borderRight: "2px solid rgba(219,234,254,0.7)", borderTop: "2px solid rgba(219,234,254,0.7)", transform: "rotate(45deg)" }} />
              </div>
            ))}
            <div style={{ color: "#f8fbff", fontSize: "13px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "6px" }}>Quick Feeds</div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} style={{ height: "40px", borderRadius: "10px", border: "1px solid rgba(96,165,250,0.13)", background: "rgba(8,30,53,0.54)", display: "flex", alignItems: "center", gap: "10px", padding: "0 12px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: index % 2 ? "#38bdf8" : "#f59e0b" }} />
                <span style={pill(index % 2 ? "62%" : "74%")} />
              </div>
            ))}
          </div>
        </aside>

        <section style={{ display: "grid", alignContent: "start", gap: "12px", minWidth: 0, height: "100%", overflow: "hidden", padding: "0 28px 8px" }}>
          <div style={{ padding: "8px 18px 8px", display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px" }}>
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.14em", fontWeight: 900, color: "#8fbfff", textTransform: "uppercase", marginBottom: "5px" }}>
                  Discovery
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, lineHeight: 1.02, color: "#f8fbff", letterSpacing: "-0.03em" }}>
                  Conference Intelligence Discovery
                </div>
                <div style={{ color: "#8fbfff", fontSize: "11px", fontWeight: 800, marginTop: "8px" }}>
                  Loading conference index...
                </div>
              </div>
              <div style={{ display: "inline-flex", gap: "6px" }}>
                <span style={{ width: "92px", height: "28px", borderRadius: "9px", background: "#2f6df6", border: "1px solid #78aaff" }} />
                <span style={{ width: "92px", height: "28px", borderRadius: "9px", background: "rgba(8,26,46,0.72)", border: "1px solid rgba(82,123,174,0.38)" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, max-content))", gap: "8px" }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} style={{ minWidth: index < 3 ? "112px" : "132px", padding: "8px 10px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.16)", background: "rgba(8,30,53,0.58)", display: "grid", gap: "7px" }}>
                  <span style={pill("62%", "9px")} />
                  <span style={pill(index < 3 ? "42%" : "70%", "16px")} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gap: "12px", minHeight: 0 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} style={{ ...panelStyle, borderRadius: "14px", padding: "14px", minHeight: "124px", display: "grid", gridTemplateColumns: "76px minmax(0, 1fr) 148px", gap: "14px", alignItems: "start" }}>
                <div style={{ width: "64px", height: "76px", borderRadius: "14px", background: "rgba(15,49,81,0.7)", border: "1px solid rgba(96,165,250,0.12)", display: "grid", placeItems: "center" }}>
                  <span style={pill("44px", "44px")} />
                </div>
                <div style={{ display: "grid", gap: "10px", minWidth: 0 }}>
                  <span style={pill(index % 2 ? "46%" : "54%", "18px")} />
                  <span style={pill("78%")} />
                  <span style={pill("62%")} />
                  <div style={{ display: "flex", gap: "7px", marginTop: "4px" }}>
                    <span style={{ ...pill("78px", "22px"), borderRadius: "999px" }} />
                    <span style={{ ...pill("92px", "22px"), borderRadius: "999px" }} />
                    <span style={{ ...pill("68px", "22px"), borderRadius: "999px" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gap: "8px", justifyItems: "end" }}>
                  <span style={pill("84px", "14px")} />
                  <span style={pill("112px", "12px")} />
                  <span style={pill("72px", "26px")} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside style={{ alignSelf: "stretch", minWidth: 0, width: "100%", height: "100%", overflow: "hidden" }}>
          <div style={{ height: "100%", display: "grid", alignContent: "start", gap: "14px" }}>
            <div style={{ padding: "5px 2px 10px" }}>
              <div style={{ color: "#f8fbff", fontSize: "20px", fontWeight: 900, marginBottom: "24px" }}>Control Panel</div>
              <div style={pill("74%")} />
            </div>
            <div style={{ ...panelStyle, borderRadius: "16px", padding: "16px", minHeight: "124px", display: "grid", gap: "12px" }}>
              <span style={pill("46%", "13px")} />
              <span style={pill("88%")} />
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={pill("74px", "34px")} />
                <span style={pill("74px", "34px")} />
                <span style={pill("74px", "34px")} />
              </div>
            </div>
            <div style={{ color: "#dbeafe", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "2px" }}>Quick Actions</div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} style={{ height: "44px", borderRadius: "12px", background: "rgba(15,49,81,0.7)", border: "1px solid rgba(96,165,250,0.16)", display: "flex", alignItems: "center", padding: "0 14px" }}>
                <span style={pill(index % 2 ? "48%" : "60%")} />
              </div>
            ))}
            <div style={{ ...panelStyle, borderRadius: "16px", padding: "16px", minHeight: "88px", display: "grid", gap: "10px", marginTop: "18px" }}>
              <span style={pill("54%", "14px")} />
              <span style={pill("78%")} />
            </div>
            <div style={{ ...panelStyle, borderRadius: "16px", padding: "16px", minHeight: "88px", display: "grid", gap: "10px" }}>
              <span style={pill("50%", "14px")} />
              <span style={pill("70%")} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
