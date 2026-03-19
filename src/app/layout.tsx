import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeMap — Find Your Neighborhood Match",
  description:
    "Match yourself to neighborhoods based on your lifestyle, personality, and vibe — not just price.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
