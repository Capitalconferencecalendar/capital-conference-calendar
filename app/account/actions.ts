"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { ensureProfile } from "../../lib/supabase/profile";

type AuthResult = { error: string; success: string };

function emailFrom(formData: FormData) {
  const value = formData.get("email");
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function passwordFrom(formData: FormData) {
  const value = formData.get("password");
  return typeof value === "string" && value.length >= 8 ? value : null;
}

async function appOrigin() {
  const origin = (await headers()).get("origin");
  if (!origin) return null;
  try {
    const url = new URL(origin);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export async function createAccount(_previous: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = emailFrom(formData);
  const password = passwordFrom(formData);
  if (!email) return { error: "Enter a valid email address.", success: "" };
  if (!password) return { error: "Use a password with at least 8 characters.", success: "" };

  const supabase = await createSupabaseServerClient();
  const origin = await appOrigin();
  if (!supabase || !origin) return { error: "Account creation is not configured for this site yet.", success: "" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: "We couldn't create your account. Please try again.", success: "" };

  if (data.session && data.user) {
    const profileError = await ensureProfile(supabase, data.user.id);
    if (profileError) return { error: "Account created, but profile setup did not finish. Please sign in again.", success: "" };
    revalidatePath("/account");
    redirect("/account");
  }

  return { error: "", success: "Check your email for a verification link, then sign in." };
}

export async function signIn(_previous: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = emailFrom(formData);
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { error: "Enter your email and password.", success: "" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Sign-in is not configured for this site yet.", success: "" };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message = error.message.toLowerCase();
    return {
      error: message.includes("email not confirmed")
        ? "Please verify your email before signing in."
        : message.includes("invalid login")
          ? "Email or password is incorrect."
          : "We couldn't sign you in. Please try again.",
      success: "",
    };
  }

  if (!data.user) return { error: "We couldn't verify your account. Please try again.", success: "" };
  const profileError = await ensureProfile(supabase, data.user.id);
  if (profileError) return { error: "Signed in, but profile setup did not finish. Please try again.", success: "" };
  revalidatePath("/account");
  redirect("/account");
}

export async function requestPasswordReset(_previous: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = emailFrom(formData);
  if (!email) return { error: "Enter a valid email address.", success: "" };

  const supabase = await createSupabaseServerClient();
  const origin = await appOrigin();
  if (!supabase || !origin) return { error: "Password reset is not configured for this site yet.", success: "" };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });
  if (error) return { error: "We couldn't send a reset link right now. Please try again.", success: "" };
  return { error: "", success: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_previous: AuthResult, formData: FormData): Promise<AuthResult> {
  const password = passwordFrom(formData);
  const confirmation = formData.get("confirmPassword");
  if (!password) return { error: "Use a password with at least 8 characters.", success: "" };
  if (password !== confirmation) return { error: "Passwords do not match.", success: "" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Password reset is not configured for this site yet.", success: "" };
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) return { error: "Your reset link has expired. Request a new one.", success: "" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "We couldn't update your password. Request a new reset link and try again.", success: "" };
  revalidatePath("/account");
  redirect("/account?password=updated");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/account");
  redirect("/account/sign-in");
}
