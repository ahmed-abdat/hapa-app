"use client";

import React, { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import type { HeroVariantProps } from "../types";
import { UnifiedHeroCTA } from "../components/UnifiedHeroCTA";
import { cn } from "@/lib/utils";

// Minimal Hero - Clean, modern design focused on content clarity
export const MinimalHero: React.FC<HeroVariantProps> = ({ locale, translations }) => {
  const { setHeaderTheme } = useHeaderTheme();
  const direction = getLocaleDirection(locale);
  const isRTL = locale === "ar";
  const t = (key: keyof typeof translations) => translations[key];

  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);

  return (
    <div
      className="relative -mt-header-height lg:-mt-header-height-lg min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30"
      dir={direction}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.02]" />
      
      <div className="relative pt-header-height lg:pt-header-height-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-20 lg:py-32">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:gap-x-16">
              {/* Left Content */}
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                {/* Badge */}
                <Link
                  href="/actualites"
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:gap-3"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  {t("officialRegulatory")}
                  <ChevronRight className={cn(
                    "h-3 w-3 transition-transform",
                    isRTL ? "rotate-180" : ""
                  )} />
                </Link>

                {/* Title */}
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {t("heroTitle")}
                </h1>

                {/* Subtitle */}
                <p className="mt-6 text-lg leading-8 text-muted-foreground lg:text-xl">
                  {t("heroSubtitle")}
                </p>

                {/* CTA Buttons */}
                <div className="mt-10">
                  <UnifiedHeroCTA
                    locale={locale}
                    translations={{
                      reportMediaContent: t("reportMediaContent"),
                      contactHapa: t("contactHapa")
                    }}
                    variant="minimal"
                    size="md"
                    alignment="left"
                  />
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 flex items-center gap-x-6 pt-8 border-t border-border/50">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-2 ring-background flex items-center justify-center text-xs font-semibold text-primary"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">450+</span> {t("registeredJournalists")}
                  </div>
                </div>
              </div>

              {/* Right Statistics */}
              <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 h-72 w-72 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl" />
                  <div className="absolute -bottom-8 -left-8 h-72 w-72 rounded-full bg-gradient-to-br from-secondary/5 to-primary/5 blur-3xl" />
                  
                  {/* Stats Grid */}
                  <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                    <h3 className="text-lg font-semibold text-foreground mb-8">
                      {t("keyStatistics")}
                    </h3>
                    
                    <div className="space-y-8">
                      {/* Journalists */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("registeredJournalists")}</p>
                          <p className="mt-1 text-3xl font-bold text-foreground">450+</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Operators */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("mediaOperators")}</p>
                          <p className="mt-1 text-3xl font-bold text-foreground">40+</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                      </div>

                      {/* Resolution Rate */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("complaintsResolved")}</p>
                          <p className="mt-1 text-3xl font-bold text-foreground">89%</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 pt-8 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("globalPerformance")}</span>
                        <span className="font-semibold text-foreground">89%</span>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[89%] bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};