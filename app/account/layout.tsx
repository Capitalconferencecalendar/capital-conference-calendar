import type { Metadata } from "next";
import AppShell from "../components/AppShell";

export const metadata: Metadata = {
  title: "Account | Capital Conference Database",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell active="account">
      <div style={{ maxWidth: "480px", margin: "32px auto 64px", padding: "0 16px" }}>
        {children}
      </div>
    </AppShell>
  );
}
