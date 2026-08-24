"use client";

import { FormEvent, useMemo, useState } from "react";
import AppShell from "../components/AppShell";

type Status = "idle" | "submitting" | "success" | "error";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function SubmissionIcon({ color = "#63A4FF" }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5h6M5 19h6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SubmitPageClient() {
  const [url, setUrl] = useState("");
  const [conferenceName, setConferenceName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const urlIsValid = useMemo(() => !url || isValidHttpUrl(url), [url]);
  const canSubmit = status !== "submitting" && !!url.trim() && urlIsValid;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          conferenceName: conferenceName.trim(),
          organizer: organizer.trim(),
          notes: notes.trim(),
          submitterEmail: email.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Unable to submit right now.");
        return;
      }

      setStatus("success");
      setMessage(
        "Thank you for submitting a conference. We will review it for potential inclusion in Capital Conference Database."
      );
      setUrl("");
      setConferenceName("");
      setOrganizer("");
      setNotes("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Unable to submit right now. Please try again.");
    }
  };

  return (
    <AppShell active="submit">
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "26px 10px 72px", display: "grid", gap: "22px" }}>
        <section className="ccc-about-hero" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: "26px", alignItems: "center", padding: "30px", borderRadius: "28px", background: "radial-gradient(circle at 16% 0%, rgba(59,130,246,0.2), transparent 38%), radial-gradient(circle at 84% 18%, rgba(245,158,11,0.12), transparent 30%), linear-gradient(135deg, rgba(8,31,55,0.97), rgba(5,20,36,0.99))", border: "1px solid rgba(107,157,210,0.24)", boxShadow: "0 24px 60px rgba(0,0,0,0.26)", overflow: "hidden" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#8fb8ff", fontSize: "11px", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "12px" }}>
              Conference Submission
            </div>
            <h1 style={{ margin: 0, color: "#ffffff", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.98, fontWeight: 950, letterSpacing: "-0.045em", maxWidth: "760px" }}>
              Submit a conference for review.
            </h1>
            <p style={{ margin: "18px 0 0", color: "#d9e8fb", fontSize: "19px", lineHeight: 1.42, fontWeight: 650, maxWidth: "760px" }}>
              Share a capital markets conference, investor event, roadshow, or
              industry gathering for potential inclusion in Capital Conference
              Database.
            </p>
            <p style={{ margin: "12px 0 0", color: "#a9bfd8", fontSize: "15px", lineHeight: 1.55, maxWidth: "760px" }}>
              Start with the event website. Optional details help the team
              review the submission for relevance, accuracy, and coverage fit.
            </p>
            <button type="button" onClick={() => document.getElementById("conference-url-field")?.focus()} style={{ marginTop: "22px", height: "44px", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", fontSize: "14px", fontWeight: 900, cursor: "pointer" }}>
              Submit Conference URL
            </button>
          </div>

          <div style={{ background: "linear-gradient(180deg, rgba(10,24,52,0.96), rgba(4,14,34,0.98))", border: "1px solid rgba(130,180,255,0.16)", borderRadius: "24px", padding: "18px", boxShadow: "0 20px 50px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#dce9fb", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>
              Submission guidance
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { label: "URL first", note: "The conference website is the only required field.", accent: "#63A4FF" },
                { label: "Relevant events", note: "Investor, issuer, advisor, sponsor, and capital markets activity.", accent: "#FFB357" },
                { label: "Coverage fit", note: "Reviewed before appearing in product views or calendar workflows.", accent: "#4EE3C1" },
              ].map((item) => (
                <div key={item.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", alignItems: "center" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(80,120,255,0.24), rgba(28,48,110,0.16))", border: "1px solid rgba(160,200,255,0.18)", boxShadow: `0 0 24px ${item.accent}24`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <SubmissionIcon color={item.accent} />
                  </span>
                  <div>
                    <div style={{ color: "#ffffff", fontSize: "16px", fontWeight: 850 }}>{item.label}</div>
                    <div style={{ color: "#9fb7d2", fontSize: "13px", lineHeight: 1.35 }}>{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="ccc-submit-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)", gap: "22px", alignItems: "start" }}>
          <section style={{ background: "linear-gradient(180deg, rgba(8,31,55,0.96), rgba(5,20,36,0.98))", border: "1px solid rgba(107,157,210,0.24)", borderRadius: "22px", padding: "24px", boxShadow: "0 18px 40px rgba(0,0,0,0.18)" }}>
            {status === "success" ? (
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ color: "#ffffff", fontSize: "28px", fontWeight: 900 }}>
                  Conference submitted
                </div>
                <div style={{ color: "#c8d8ec", fontSize: "15px", lineHeight: 1.6 }}>
                  {message}
                </div>
                <button type="button" onClick={() => { setStatus("idle"); setMessage(""); }} style={{ width: "fit-content", height: "42px", padding: "0 16px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: "linear-gradient(180deg, #3b82f6, #2563eb)", color: "#ffffff", fontSize: "14px", fontWeight: 900, cursor: "pointer" }}>
                  Submit another conference
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: "14px" }}>
                <div>
                  <div style={{ color: "#ffffff", fontSize: "26px", lineHeight: 1.1, fontWeight: 900, marginBottom: "6px" }}>
                    Submit Conference URL
                  </div>
                  <div style={{ color: "#c8d8ec", fontSize: "14.5px", lineHeight: 1.45 }}>
                    The website link is required. Add optional context if it
                    helps explain the event.
                  </div>
                </div>

                <div>
                  <label htmlFor="conference-url-field" style={{ display: "block", color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>
                    Conference URL
                  </label>
                  <input id="conference-url-field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/conference" required style={{ width: "100%", height: "48px", borderRadius: "12px", border: `1px solid ${url && !urlIsValid ? "#fca5a5" : "rgba(96,165,250,0.4)"}`, backgroundColor: "rgba(8,22,48,0.88)", padding: "0 14px", fontSize: "15px", color: "#dbeafe", outline: "none", boxSizing: "border-box" }} />
                  {!urlIsValid ? (
                    <div style={{ marginTop: "6px", fontSize: "12px", color: "#fca5a5" }}>
                      Please enter a valid URL starting with http:// or https://.
                    </div>
                  ) : null}
                </div>

                <div className="ccc-submit-fields" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                  {[
                    { label: "Conference Name", value: conferenceName, setter: setConferenceName, type: "text" },
                    { label: "Organizer", value: organizer, setter: setOrganizer, type: "text" },
                    { label: "Submitter Email", value: email, setter: setEmail, type: "email" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label style={{ display: "block", color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>
                        {field.label}
                      </label>
                      <input type={field.type} value={field.value} onChange={(e) => field.setter(e.target.value)} placeholder="Optional" style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid rgba(120,160,255,0.22)", backgroundColor: "rgba(8,22,48,0.72)", padding: "0 12px", fontSize: "15px", color: "#dbeafe", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ display: "block", color: "#dbeafe", fontSize: "13px", fontWeight: 800, marginBottom: "6px" }}>
                    Notes
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes that help review the event" rows={4} style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(120,160,255,0.22)", backgroundColor: "rgba(8,22,48,0.72)", padding: "10px 12px", fontSize: "15px", color: "#dbeafe", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>

                {status === "error" ? (
                  <div style={{ fontSize: "13px", color: "#fca5a5", lineHeight: 1.5 }}>
                    {message}
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "12px", color: "#8fb3d7" }}>
                    Submitting a URL does not guarantee inclusion.
                  </div>
                  <button type="submit" disabled={!canSubmit} style={{ height: "48px", padding: "0 18px", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.45)", background: canSubmit ? "linear-gradient(180deg, #3b82f6, #2563eb)" : "rgba(71,85,105,0.7)", color: "#ffffff", fontSize: "15px", fontWeight: 900, cursor: canSubmit ? "pointer" : "not-allowed" }}>
                    {status === "submitting" ? "Submitting..." : "Submit Conference"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside style={{ display: "grid", gap: "14px" }}>
            <section style={{ border: "1px solid rgba(107,157,210,0.22)", borderRadius: "18px", background: "rgba(8,31,55,0.82)", padding: "18px" }}>
              <h2 style={{ margin: "0 0 10px", color: "#ffffff", fontSize: "20px", lineHeight: 1.15 }}>
                What to submit
              </h2>
              <div style={{ display: "grid", gap: "9px" }}>
                {["Investor conferences", "Public company investor events", "Roadshows and investor access events", "Industry conferences with capital markets relevance", "Private markets gatherings", "Capital markets service provider events"].map((item) => (
                  <div key={item} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: "10px", alignItems: "start", color: "#dbeafe", fontSize: "14px", lineHeight: 1.4 }}>
                    <span style={{ width: "18px", height: "18px", borderRadius: "999px", background: "rgba(34,197,94,0.16)", border: "1px solid rgba(34,197,94,0.4)", color: "#86efac", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", marginTop: "1px" }}>+</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ border: "1px solid rgba(107,157,210,0.22)", borderRadius: "18px", background: "rgba(8,31,55,0.82)", padding: "18px" }}>
              <h2 style={{ margin: "0 0 10px", color: "#ffffff", fontSize: "20px", lineHeight: 1.15 }}>
                Helpful details
              </h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {["Official event website", "Organizer name", "Event dates", "City and venue", "Audience or participation type", "Market focus or sector theme"].map((item) => (
                  <div key={item} style={{ color: "#c8d8ec", fontSize: "14px", lineHeight: 1.4, display: "grid", gridTemplateColumns: "16px 1fr", gap: "10px" }}>
                    <span style={{ color: "#63A4FF", fontWeight: 900 }}>-</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
