"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createAccount, requestPasswordReset, signIn, updatePassword } from "./actions";

type Mode = "create" | "sign-in" | "forgot-password" | "reset-password";

const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "44px",
  boxSizing: "border-box",
  padding: "0 12px",
  borderRadius: "6px",
  border: "1px solid rgba(147,197,253,0.3)",
  background: "#f8fbff",
  color: "#0f172a",
  fontSize: "15px",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: "7px",
  color: "#dbeafe",
  fontSize: "13px",
  fontWeight: 700,
};

export default function AuthForm({ mode, linkError = false, next }: { mode: Mode; linkError?: boolean; next?: string }) {
  const action = mode === "create" ? createAccount
    : mode === "sign-in" ? signIn
      : mode === "forgot-password" ? requestPasswordReset
        : updatePassword;
  const [state, formAction, pending] = useActionState(action, { error: "", success: "" });
  const title = mode === "create" ? "Create Account"
    : mode === "sign-in" ? "Sign In"
      : mode === "forgot-password" ? "Forgot Password"
        : "Reset Password";

  return (
    <section style={{ display: "grid", gap: "22px" }}>
      <div style={{ display: "grid", gap: "7px", borderBottom: "1px solid rgba(147,197,253,0.2)", paddingBottom: "18px" }}>
        <div style={{ color: "#7dc6ff", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Account</div>
        <h1 style={{ margin: 0, color: "#f8fbff", fontSize: "28px", lineHeight: 1.2 }}>{title}</h1>
      </div>

      <form action={formAction} style={{ display: "grid", gap: "18px" }}>
        {mode === "sign-in" && next ? <input type="hidden" name="next" value={next} /> : null}
        {mode !== "reset-password" ? (
          <label style={labelStyle}>
            Email
            <input style={fieldStyle} type="email" name="email" autoComplete="email" required maxLength={254} />
          </label>
        ) : null}
        {mode !== "forgot-password" ? (
          <label style={labelStyle}>
            {mode === "reset-password" ? "New password" : "Password"}
            <input
              style={fieldStyle}
              type="password"
              name="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              required
              minLength={mode === "sign-in" ? undefined : 8}
            />
          </label>
        ) : null}
        {mode === "reset-password" ? (
          <label style={labelStyle}>
            Confirm new password
            <input style={fieldStyle} type="password" name="confirmPassword" autoComplete="new-password" required minLength={8} />
          </label>
        ) : null}

        {linkError ? <p role="alert" style={{ margin: 0, color: "#fca5a5", fontSize: "13px" }}>That link is invalid or has expired. Request a new one.</p> : null}
        {state.error ? <p role="alert" style={{ margin: 0, color: "#fca5a5", fontSize: "13px" }}>{state.error}</p> : null}
        {state.success ? <p role="status" style={{ margin: 0, color: "#86efac", fontSize: "13px", lineHeight: 1.5 }}>{state.success}</p> : null}

        <button
          type="submit"
          disabled={pending}
          style={{
            height: "44px",
            borderRadius: "6px",
            border: "1px solid rgba(147,197,253,0.45)",
            background: "#2868d9",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 800,
            cursor: pending ? "wait" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Please wait..." : mode === "create" ? "Create Account"
            : mode === "sign-in" ? "Sign In"
              : mode === "forgot-password" ? "Send Reset Link" : "Update Password"}
        </button>
      </form>

      <nav aria-label="Account options" style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "13px" }}>
        {mode !== "sign-in" ? <Link href="/account/sign-in" style={{ color: "#91c8ff" }}>Sign In</Link> : null}
        {mode !== "create" ? <Link href="/account/create" style={{ color: "#91c8ff" }}>Create Account</Link> : null}
        {mode !== "forgot-password" ? <Link href="/account/forgot-password" style={{ color: "#91c8ff" }}>Forgot Password?</Link> : null}
      </nav>
    </section>
  );
}
