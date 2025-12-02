// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./AuthProvider";

export const metadata: Metadata = {
  title: "Mel In A Box",
  description: "Kids fun app with Story Time & Social Fun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* AuthProvider is client-side, but layout can render it */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
