"use client";

import React, { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedHeroCTA } from "../components/UnifiedHeroCTA";
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import type { HeroVariantProps } from "../types";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => 
  import('framer-motion').then(mod => ({ 
    default: mod.motion.div 
  })), 
  { 
    loading: () => <div className="opacity-0" />,
    ssr: false
  }
);

// Floating Hero - Clean design with subtle floating background elements
export const FloatingHero: React.FC<HeroVariantProps> = ({ locale, translations }) => {
  const { setHeaderTheme } = useHeaderTheme();
  const direction = getLocaleDirection(locale);
  const isRTL = locale === "ar";
  const t = (key: keyof typeof translations) => translations[key];

  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);


  return (
    <div
      className="relative -mt-header-height lg:-mt-header-height-lg min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden"
      dir={direction}
    >
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(249,115,22,0.05),transparent_50%)]" />
      </div>

      {/* Floating Background Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 rtl:right-1/4 w-64 h-64 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 rtl:left-1/4 w-96 h-96 bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/2 rtl:right-1/2 w-48 h-48 bg-gradient-to-t from-secondary/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content Container */}
      <div className="relative pt-header-height lg:pt-header-height-lg">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
          {/* Status Badge */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/60 rounded-full px-4 py-2 mb-8 shadow-lg"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-medium text-slate-700">{t("officialRegulatory")}</span>
            <Badge variant="secondary" className="ml-2 text-xs">{t("official")}</Badge>
          </MotionDiv>

          {/* Main Title */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-primary to-accent bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
            </h1>
          </MotionDiv>

          {/* Subtitle */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
              {t("heroSubtitle")}
            </p>
          </MotionDiv>

          {/* CTA Buttons */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <UnifiedHeroCTA
              locale={locale}
              translations={{
                reportMediaContent: t("reportMediaContent"),
                contactHapa: t("contactHapa")
              }}
              variant="floating"
              size="lg"
              alignment="center"
            />
          </MotionDiv>
        </div>
      </div>

    </div>
  );
};