import type { Metadata, Viewport } from "next";

import { Toaster } from "#/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "uwu",
  description: "OwO What’s This",
  other: {
    title: "uwu",
  },
  openGraph: {
    type: "website",
    url: "https://uwu.ee/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#818CF8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
