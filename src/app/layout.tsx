import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Silkscreen } from "next/font/google";

import "./globals.css";
import type React from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Providers } from "@/components/providers";
import { RESUME_DATA } from "@/data/resume-data";
import { SITE_NAME, SITE_TITLE } from "@/lib/structured-data";

// Font loading: all three are self-hosted by next/font at build time. Only
// Archivo is preloaded: it sets the hero name, the LCP element. Instrument
// Sans and Silkscreen are still requested as soon as the CSS parses, they
// just don't compete with the name for the first bytes. adjustFontFallback
// (on by default, stated here so it stays on) emits a size-adjusted local
// fallback face per family, so the swap barely shifts layout.

// Display: trail-signage headlines (variable width axis for font-stretch).
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Arial Black", "system-ui", "sans-serif"],
  variable: "--font-display",
});

// Body copy.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  variable: "--font-body",
});

// Pixel utility face for the HUD, labels and the timing board.
const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  fallback: ["ui-monospace", "monospace"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  metadataBase: new URL(RESUME_DATA.personalWebsiteUrl),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: RESUME_DATA.about,
  keywords: [
    "resume",
    "cv",
    "portfolio",
    RESUME_DATA.name,
    "research engineer",
    "RL infrastructure",
    "agentic evaluation",
    "reinforcement learning",
    "machine learning",
    "NLP",
  ],
  authors: [{ name: RESUME_DATA.name }],
  creator: RESUME_DATA.name,
  publisher: RESUME_DATA.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: RESUME_DATA.personalWebsiteUrl,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: RESUME_DATA.about,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: RESUME_DATA.about,
  },
  alternates: {
    canonical: RESUME_DATA.personalWebsiteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF2F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0E14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrumentSans.variable} ${silkscreen.variable}`}
      suppressHydrationWarning={true}
    >
      <body>
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
