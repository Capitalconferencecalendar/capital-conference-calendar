const panelStyle = {
  border: "1px solid rgba(94,139,184,0.28)",
  background: "linear-gradient(180deg, rgba(10,27,44,0.96), rgba(7,20,34,0.96))",
  boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
};

const shimmerStyle = {
  background: "linear-gradient(90deg, rgba(148,163,184,0.10) 0%, rgba(147,197,253,0.18) 42%, rgba(148,163,184,0.10) 82%)",
  backgroundSize: "220% 100%",
  animation: "cccMarketViewLoadingPulse 1.7s ease-in-out infinite",
};

export default function MarketViewLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Market View"
      style={{
        minHeight: "100vh",
        padding: "106px 14px 14px",
        boxSizing: "border-box",
        background: "radial-gradient(110% 90% at 50% -10%, rgba(37,99,235,0.16) 0%, rgba(3,20,37,1) 52%), linear-gradient(180deg, #041527 0%, #031425 100%)",
        color: "#dbeafe",
        fontFamily: "var(--font-body), Arial, sans-serif",
      }}
    >
      <style>{`@keyframes cccMarketViewLoadingPulse { 0% { background-position: 120% 0; } 100% { background-position: -120% 0; } }`}</style>
      <div style={{ maxWidth: "1320px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr) minmax(260px, 320px)", gap: "16px" }}>
        <aside style={{ display: "grid", alignContent: "start", gap: "10px" }}>
          <div style={{ height: "78px", borderRadius: "8px", ...panelStyle, ...shimmerStyle }} />
          {Array.from({ length: 5 }).map((_, index) => <div key={index} style={{ height: "74px", borderRadius: "8px", ...panelStyle, ...shimmerStyle }} />)}
        </aside>
        <section style={{ display: "grid", alignContent: "start", gap: "12px", minWidth: 0 }}>
          <div style={{ ...panelStyle, borderRadius: "22px", minHeight: "280px", padding: "28px 32px", display: "grid", alignContent: "start", gap: "18px", boxSizing: "border-box" }}>
            <div style={{ width: "130px", height: "12px", borderRadius: "999px", ...shimmerStyle }} />
            <div style={{ width: "72%", height: "42px", borderRadius: "8px", ...shimmerStyle }} />
            <div style={{ width: "94%", height: "22px", borderRadius: "8px", ...shimmerStyle }} />
            <div style={{ width: "84%", height: "16px", borderRadius: "8px", ...shimmerStyle }} />
          </div>
          {Array.from({ length: 3 }).map((_, index) => <div key={index} style={{ height: "128px", borderRadius: "8px", ...panelStyle, ...shimmerStyle }} />)}
        </section>
        <aside style={{ display: "grid", alignContent: "start", gap: "12px" }}>
          <div style={{ height: "78px", borderRadius: "8px", ...panelStyle, ...shimmerStyle }} />
          <div style={{ height: "214px", borderRadius: "8px", ...panelStyle, ...shimmerStyle }} />
          {Array.from({ length: 4 }).map((_, index) => <div key={index} style={{ height: "48px", borderRadius: "8px", ...panelStyle, ...shimmerStyle }} />)}
        </aside>
      </div>
      <div style={{ position: "fixed", top: "36px", left: 0, right: 0, height: "70px", display: "flex", alignItems: "center", padding: "0 20px", boxSizing: "border-box", background: "linear-gradient(180deg, rgba(236,244,252,0.98), rgba(216,230,245,0.98))", borderBottom: "1px solid rgba(37,99,235,0.16)", color: "#0f2744", fontSize: "16px", fontWeight: 900 }}>
        Loading Market View
      </div>
    </main>
  );
}
