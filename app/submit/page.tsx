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

export default function SubmitConferencePage() {
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
        "Thank you for helping expand Capital Conference Calendar coverage. Our team will review the conference and add qualifying events to the database."
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
      <div style={{ display: "grid", gap: "14px" }}>
        <section
          style={{
            border: "1px solid #d7dde5",
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            padding: "18px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#667085", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
            Conference Submission
          </div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "34px", lineHeight: 1.1, color: "#0f172a" }}>
            Submit a conference URL
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "900px" }}>
            Paste the conference website URL and our team handles review,
            verification, and database inclusion.
          </p>
        </section>

        <div className="ccc-submit-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 0.85fr)", gap: "14px", alignItems: "start" }}>
          <section
            style={{
              border: "1px solid #d7dde5",
              borderRadius: "14px",
              backgroundColor: "#ffffff",
              padding: "16px",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
            }}
          >
            {status === "success" ? (
              <div style={{ display: "grid", gap: "10px" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
                  Conference Submitted
                </div>
                <div style={{ fontSize: "15px", color: "#475569", lineHeight: 1.65 }}>
                  {message}
                </div>
                <div style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.55 }}>
                  Some conferences may require verification before appearing
                  publicly.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setMessage("");
                  }}
                  style={{
                    width: "fit-content",
                    height: "40px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "1px solid #0f2d4f",
                    backgroundColor: "#0f2d4f",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Submit another conference
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#667085", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Conference URL
                  </label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/conference"
                    required
                    style={{
                      width: "100%",
                      height: "42px",
                      borderRadius: "10px",
                      border: `1px solid ${url && !urlIsValid ? "#ef4444" : "#d5dde7"}`,
                      backgroundColor: "#ffffff",
                      padding: "0 12px",
                      fontSize: "14px",
                      color: "#0f172a",
                    }}
                  />
                  {!urlIsValid ? (
                    <div style={{ marginTop: "6px", fontSize: "12px", color: "#b91c1c" }}>
                      Please enter a valid URL starting with http:// or https://
                    </div>
                  ) : null}
                </div>

                <div className="ccc-submit-fields" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#667085", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Conference Name
                    </label>
                    <input value={conferenceName} onChange={(e) => setConferenceName(e.target.value)} style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #d5dde7", padding: "0 12px", fontSize: "14px", color: "#0f172a" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#667085", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Organizer
                    </label>
                    <input value={organizer} onChange={(e) => setOrganizer(e.target.value)} style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #d5dde7", padding: "0 12px", fontSize: "14px", color: "#0f172a" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#667085", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Submitter Email
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #d5dde7", padding: "0 12px", fontSize: "14px", color: "#0f172a" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#667085", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Review Status
                    </label>
                    <div style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #d5dde7", padding: "0 12px", fontSize: "14px", color: "#475569", display: "flex", alignItems: "center", backgroundColor: "#f8fafc" }}>
                      Pending Review
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#667085", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Notes
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ width: "100%", borderRadius: "10px", border: "1px solid #d5dde7", padding: "10px 12px", fontSize: "14px", color: "#0f172a", resize: "vertical" }} />
                </div>

                {status === "error" ? (
                  <div style={{ fontSize: "13px", color: "#b91c1c", lineHeight: 1.5 }}>
                    {message}
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Most conference details can be reviewed from the URL.
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                      height: "42px",
                      padding: "0 16px",
                      borderRadius: "10px",
                      border: "1px solid #0f2d4f",
                      backgroundColor: canSubmit ? "#0f2d4f" : "#94a3b8",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                  >
                    {status === "submitting" ? "Submitting..." : "Submit Conference"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside style={{ display: "grid", gap: "12px" }}>
            <section style={{ border: "1px solid #d7dde5", borderRadius: "12px", backgroundColor: "#ffffff", padding: "14px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#0f172a" }}>What happens next?</h3>
              <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "7px" }}>
                {[
                  "CCC reviews the conference",
                  "Event details are verified",
                  "Qualifying conferences are added to the database",
                  "Coverage continues updating over time",
                ].map((item) => (
                  <li key={item} style={{ fontSize: "14px", color: "#334155", lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </section>

            <section style={{ border: "1px solid #d7dde5", borderRadius: "12px", backgroundColor: "#ffffff", padding: "14px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#0f172a" }}>What should I submit?</h3>
              <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "7px" }}>
                {[
                  "Investor conferences",
                  "Industry conferences",
                  "Roadshows",
                  "Capital markets events",
                  "Public company investor events",
                  "Private market gatherings",
                ].map((item) => (
                  <li key={item} style={{ fontSize: "14px", color: "#334155", lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </section>

            <section style={{ border: "1px solid #d7dde5", borderRadius: "12px", backgroundColor: "#ffffff", padding: "14px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#0f172a" }}>Why only the URL?</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>
                Most conference details can be reviewed directly from the
                conference website. Submitting the URL keeps the process fast
                and simple.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
