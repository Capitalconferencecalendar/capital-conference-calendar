import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capital Conference Calendar",
  description: "Capital markets conference database and live calendar feeds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#f3f6f9",
          color: "#0f172a",
          fontFamily: "var(--font-body), Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
