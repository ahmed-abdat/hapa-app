"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Radio, Users, BarChart3, CheckCircle } from "lucide-react";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedHeroCTA } from "../components/UnifiedHeroCTA";
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import type { HeroVariantProps } from "../types";
import { cn } from "@/lib/utils";

// Interactive Hero - Data-driven with live elements and real-time updates
export const InteractiveHero: React.FC<HeroVariantProps> = ({ locale, translations }) => {
  const { setHeaderTheme } = useHeaderTheme();
  const direction = getLocaleDirection(locale);
  const isRTL = locale === "ar";
  const t = (key: keyof typeof translations) => translations[key];

  // Animated counters
  const [counts, setCounts] = useState({ journalists: 0, operators: 0, resolved: 0 });
  const targetCounts = { journalists: 450, operators: 40, resolved: 89 };

  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCounts({
        journalists: Math.floor(targetCounts.journalists * easeOutQuart),
        operators: Math.floor(targetCounts.operators * easeOutQuart),
        resolved: Math.floor(targetCounts.resolved * easeOutQuart),
      });

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [targetCounts.journalists, targetCounts.operators, targetCounts.resolved]);

  const liveMetrics = [
    {
      icon: Users,
      label: t("registeredJournalists"),
      value: counts.journalists,
      suffix: "+",
      change: "+12",
      changeLabel: "2024",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up"
    },
    {
      icon: Radio,
      label: t("mediaOperators"),
      value: counts.operators,
      suffix: "+",
      change: "+3",
      changeLabel: "2024",
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up"
    },
    {
      icon: CheckCircle,
      label: t("complaintsResolved"),
      value: counts.resolved,
      suffix: "%",
      change: "+5%",
      changeLabel: "2023",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up"
    }
  ];


  return (
    <div
      className="relative -mt-header-height lg:-mt-header-height-lg min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30"
      dir={direction}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating Data Particles */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-secondary/30 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative pt-header-height lg:pt-header-height-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Live Status Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-8">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-medium text-green-700">{t("services")}</span>
              <Badge variant="secondary" className="ml-2 text-xs">LIVE</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-primary to-accent bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="mb-12">
            {/* Live Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {liveMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="group relative bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 hover:bg-white/90 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Animated Border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                        metric.bgColor
                      )}>
                        <metric.icon className={cn("w-6 h-6", metric.color)} aria-hidden="true" />
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-3xl font-bold text-slate-900 tabular-nums"
                          aria-live="polite"
                          aria-label={`${metric.label}: ${metric.value}${metric.suffix}`}
                        >
                          {metric.value}{metric.suffix}
                        </div>
                        <div className="flex items-center text-xs text-green-600 font-medium">
                          <BarChart3 className="w-3 h-3 mr-1" aria-hidden="true" />
                          <span aria-label={`Increase of ${metric.change} ${metric.changeLabel}`}>
                            {metric.change} {metric.changeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm font-medium">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
          </div>

          {/* Interactive CTA Section */}
          <div className="text-center">
            <UnifiedHeroCTA
              locale={locale}
              translations={{
                reportMediaContent: t("reportMediaContent"),
                contactHapa: t("contactHapa")
              }}
              variant="interactive"
              size="md"
              alignment="center"
              className="max-w-lg mx-auto mb-6"
            />

          </div>
        </div>
      </div>
    </div>
  );
};