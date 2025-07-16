import type { Metadata } from "next";

import { cn } from "@/utilities/ui";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import React from "react";

import { AdminBar } from "@/components/AdminBar";
import { Footer } from "@/Footer/Component";
import { Header } from "@/Header/Component";
import { LocaleHandler } from "@/components/LocaleHandler";
import { Providers } from "@/providers";
import { InitTheme } from "@/providers/Theme/InitTheme";
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

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <meta name="grammarly-disable-indicator" content="true" />
        <meta name="grammarly-disable-editor" content="true" />
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
          <Footer />

          {/* Stagewise toolbar for AI-powered editing - only renders in development */}
          {process.env.NODE_ENV === 'development' && (
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
