export default function DiscoveryLoading() {
  const panelStyle = {
    border: "1px solid rgba(96,165,250,0.18)",
    background: "linear-gradient(180deg, rgba(8,31,55,0.82), rgba(4,14,32,0.94))",
    boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "118px 14px 18px",
        background:
          "radial-gradient(110% 90% at 50% -10%, rgba(37,99,235,0.16) 0%, rgba(3,20,37,1) 52%), linear-gradient(180deg, #041527 0%, #031425 100%)",
        color: "#dbeafe",
        fontFamily: "var(--font-body), Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr) 320px",
          gap: "16px",
          maxWidth: "100%",
          minHeight: "calc(100vh - 136px)",
        }}
      >
        <aside style={{ ...panelStyle, borderRadius: "18px", padding: "16px", display: "grid", alignContent: "start", gap: "14px" }}>
          <div style={{ width: "72%", height: "18px", borderRadius: "999px", background: "rgba(191,219,254,0.18)" }} />
          <div style={{ width: "92%", height: "12px", borderRadius: "999px", background: "rgba(148,163,184,0.16)" }} />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} style={{ height: "44px", borderRadius: "12px", background: "rgba(15,49,81,0.72)", border: "1px solid rgba(96,165,250,0.12)" }} />
          ))}
        </aside>

        <section style={{ display: "grid", alignContent: "start", gap: "14px" }}>
          <div style={{ ...panelStyle, borderRadius: "20px", padding: "18px" }}>
            <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 950, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "10px" }}>
              Loading conference index...
            </div>
            <div style={{ width: "54%", height: "26px", borderRadius: "999px", background: "rgba(226,232,240,0.2)", marginBottom: "12px" }} />
            <div style={{ width: "78%", height: "13px", borderRadius: "999px", background: "rgba(148,163,184,0.18)" }} />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} style={{ ...panelStyle, borderRadius: "16px", padding: "16px", minHeight: "126px", display: "grid", gap: "12px" }}>
              <div style={{ width: "42%", height: "18px", borderRadius: "999px", background: "rgba(226,232,240,0.2)" }} />
              <div style={{ width: "68%", height: "12px", borderRadius: "999px", background: "rgba(148,163,184,0.18)" }} />
              <div style={{ width: "56%", height: "12px", borderRadius: "999px", background: "rgba(148,163,184,0.14)" }} />
            </div>
          ))}
        </section>

        <aside style={{ ...panelStyle, borderRadius: "18px", padding: "16px", display: "grid", alignContent: "start", gap: "14px" }}>
          <div style={{ width: "64%", height: "18px", borderRadius: "999px", background: "rgba(191,219,254,0.18)" }} />
          <div style={{ height: "96px", borderRadius: "14px", background: "rgba(15,49,81,0.72)", border: "1px solid rgba(96,165,250,0.12)" }} />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ height: "42px", borderRadius: "12px", background: "rgba(15,49,81,0.62)", border: "1px solid rgba(96,165,250,0.12)" }} />
          ))}
        </aside>
      </div>
    </main>
  );
}
