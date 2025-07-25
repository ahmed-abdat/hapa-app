import type { Metadata } from "next";

import { cn } from "@/utilities/ui";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { arabicFontVariables } from "@/lib/fonts/arabic";
import React from "react";

import { AdminBar } from "@/components/AdminBar";
import { Footer } from "@/Footer/Component";
import { Header } from "@/Header/Component";
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
          <Footer />

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
  title: {
    default: "HAPA - Haute Autorité de la Presse et de l'Audiovisuel",
    template: "%s | HAPA"
  },
  description: "Site officiel de la Haute Autorité de la Presse et de l'Audiovisuel de Mauritanie. Régulation et supervision des médias mauritaniens.",
  keywords: ["HAPA", "Mauritanie", "Presse", "Audiovisuel", "Média", "Régulation"],
  authors: [{ name: "HAPA", url: "https://hapa.mr" }],
  creator: "HAPA",
  publisher: "HAPA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: mergeOpenGraph({
    title: "HAPA - Haute Autorité de la Presse et de l'Audiovisuel",
    description: "Site officiel de la Haute Autorité de la Presse et de l'Audiovisuel de Mauritanie",
    siteName: "HAPA",
    locale: "fr_MR",
    type: "website",
  }),
  twitter: {
    card: "summary_large_image",
    title: "HAPA - Haute Autorité de la Presse et de l'Audiovisuel",
    description: "Site officiel de la Haute Autorité de la Presse et de l'Audiovisuel de Mauritanie",
    creator: "@HAPA_MR",
  },
  alternates: {
    canonical: getServerSideURL(),
    languages: {
      'fr': `${getServerSideURL()}/fr`,
      'ar': `${getServerSideURL()}/ar`,
    },
  },
};
