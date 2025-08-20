"use client";

import React, { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Shield, TrendingUp, Users, FileCheck, Award, Clock } from "lucide-react";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedHeroCTA } from "../components/UnifiedHeroCTA";
import { Progress } from "@/components/ui/progress";
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import type { HeroVariantProps } from "../types";
import { cn } from "@/lib/utils";

// Authority Hero - Professional government design with trust indicators
export const AuthorityHero: React.FC<HeroVariantProps> = ({ locale, translations }) => {
  const { setHeaderTheme } = useHeaderTheme();
  const direction = getLocaleDirection(locale);
  const isRTL = locale === "ar";
  const t = (key: keyof typeof translations) => translations[key];

  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);

  const metrics = [
    { icon: Users, value: 450, label: t("registeredJournalists"), color: "text-blue-600", bgColor: "bg-blue-50" },
    { icon: Shield, value: 40, label: t("mediaOperators"), color: "text-green-600", bgColor: "bg-green-50" },
    { icon: FileCheck, value: 89, label: t("complaintsResolved"), color: "text-orange-600", bgColor: "bg-orange-50", suffix: "%" }
  ];

  const achievements = [
    { icon: Award, text: t("officialRegulatory"), color: "bg-yellow-50 text-yellow-700" },
    { icon: Shield, text: t("governmentAuthority"), color: "bg-green-50 text-green-700" },
    { icon: Clock, text: t("contactSupport"), color: "bg-blue-50 text-blue-700" }
  ];

  return (
    <div
      className="relative -mt-header-height lg:-mt-header-height-lg min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50"
      dir={direction}
    >
      {/* Professional Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative pt-header-height lg:pt-header-height-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Header Section */}
          <div className="text-center mb-16">
            {/* Official Badge */}
            <div className="flex justify-center mb-8">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                {t("officialRegulatory")}
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {t("heroTitle")}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>

            {/* Achievement Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                    achievement.color
                  )}
                >
                  <achievement.icon className="w-4 h-4" />
                  {achievement.text}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    metric.bgColor
                  )}>
                    <metric.icon className={cn("w-6 h-6", metric.color)} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">
                      {metric.value}{metric.suffix || '+'}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm font-medium mb-3">
                  {metric.label}
                </p>
                <Progress 
                  value={metric.suffix ? metric.value : Math.min((metric.value / 500) * 100, 100)} 
                  className="h-2"
                />
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <UnifiedHeroCTA
              locale={locale}
              translations={{
                reportMediaContent: t("reportMediaContent"),
                contactHapa: t("contactHapa")
              }}
              variant="authority"
              size="md"
              alignment="center"
              className="max-w-md mx-auto"
            />
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{t("services")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>{t("officialRegulatory")}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span>{t("contactSupport")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </div>
  );
};