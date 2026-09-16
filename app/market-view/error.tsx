"use client";

export default function MarketViewError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", boxSizing: "border-box", background: "radial-gradient(110% 90% at 50% -10%, rgba(37,99,235,0.16) 0%, rgba(3,20,37,1) 52%), linear-gradient(180deg, #041527 0%, #031425 100%)", color: "#dbeafe", fontFamily: "var(--font-body), Arial, sans-serif" }}>
      <section style={{ width: "min(100%, 520px)", padding: "30px", border: "1px solid rgba(94,139,184,0.28)", borderRadius: "12px", background: "linear-gradient(180deg, rgba(10,27,44,0.96), rgba(7,20,34,0.96))", boxShadow: "0 18px 40px rgba(0,0,0,0.22)", display: "grid", gap: "14px" }}>
        <div style={{ color: "#7dd3fc", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Market View</div>
        <h1 style={{ margin: 0, color: "#f8fbff", fontSize: "26px", lineHeight: 1.1 }}>Market View is temporarily unavailable.</h1>
        <p style={{ margin: 0, color: "#b7c8db", fontSize: "15px", lineHeight: 1.55 }}>Please try loading the conference intelligence view again.</p>
        <button type="button" onClick={reset} style={{ width: "fit-content", height: "42px", padding: "0 16px", border: "1px solid rgba(147,197,253,0.42)", borderRadius: "8px", background: "linear-gradient(180deg, rgba(37,99,235,.95), rgba(29,78,216,.88))", color: "#f8fbff", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>Try again</button>
      </section>
    </main>
  );
}
