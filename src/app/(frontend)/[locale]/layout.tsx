import { notFound } from "next/navigation";
import React from "react";
import { isValidLocale, type Locale } from "@/utilities/locale";
import { generateLocalizedMetadata } from "@/utilities/generateMetadata";
import type { Metadata } from "next";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { cn } from "@/utilities/ui";
import { AdminBar } from "@/components/AdminBar";
import { Footer } from "@/Footer/Component";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { Header } from "@/Header/Component";
import { Providers } from "@/providers";
import { draftMode } from "next/headers";
import { routing } from "@/i18n/routing";
import ReactPlugin from "@stagewise-plugins/react";
import { louguiya, louguiyaFR } from "@/fonts";
import { GeistMono } from "geist/font/mono";
import "@/app/(frontend)/globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  // Enable static rendering by setting the locale for this request
  setRequestLocale(locale as Locale);

  // Providing all messages to the client side
  const messages = await getMessages({ locale: locale as Locale });
  const { isEnabled } = await draftMode();

  // Select the appropriate font based on locale
  const font = locale === "ar" ? louguiya : louguiyaFR;
  const fontClass = font.className;
  const fontVariable = font.variable;

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={cn(
        fontVariable,
        GeistMono.variable
      )}
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <meta name="grammarly-disable-indicator" content="true" />
        <meta name="grammarly-disable-editor" content="true" />
        <meta name="grammarly-disable" content="true" />
        {/* Local fonts are automatically optimized by Next.js */}
      </head>
      <body
        suppressHydrationWarning={true}
        className={cn("overflow-x-hidden", fontClass)}
        data-grammarly-disable="true"
      >
        <Providers>
          <NextIntlClientProvider locale={locale as Locale} messages={messages}>
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />

            <Header />
            {children}
            
            {/* Stagewise toolbar for AI-powered editing - only loads in development */}
            {process.env.NODE_ENV === "development" && (
              <StagewiseToolbar
                config={{
                  plugins: [ReactPlugin],
                }}
              />
            )}
            <Footer />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return generateLocalizedMetadata(locale);
}

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "ar" }];
}
