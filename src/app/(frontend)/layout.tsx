import type { Metadata } from "next";

import { cn } from "@/utilities/ui";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { arabicFontVariables } from "@/lib/fonts/arabic";
import React from "react";

import { AdminBar } from "@/components/AdminBar";
import { Footer } from "@/Footer/Component";
import { Header } from "@/Header/Component";
import { getCachedGlobal } from "@/utilities/getGlobals";
import { LocaleHandler } from "@/components/LocaleHandler";
import { Providers } from "@/providers";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import { draftMode } from "next/headers";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import ReactPlugin from "@stagewise-plugins/react";

import "./globals.css";
import { getServerSideURL } from "@/utilities/getURL";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const footerData = await getCachedGlobal("footer", 1)();

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        arabicFontVariables
      )}
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <meta name="grammarly-disable-indicator" content="true" />
        <meta name="grammarly-disable-editor" content="true" />
        {/* Preload Arabic fonts for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <LocaleHandler />
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer footerData={footerData} />

          {/* Stagewise toolbar for AI-powered editing - only loads in development */}
          {process.env.NODE_ENV === "development" && (
            <StagewiseToolbar
              config={{
                plugins: [ReactPlugin],
              }}
            />
          )}
        </Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: "summary_large_image",
    creator: "@payloadcms",
  },
};
