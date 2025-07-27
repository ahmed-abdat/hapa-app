"use client";

import React, { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowLeft, Shield, Users, FileText } from "lucide-react";

// Dynamically import motion components for better bundle splitting
const MotionDiv = dynamic(() => 
  import('framer-motion').then(mod => ({ 
    default: mod.motion.div 
  })), 
  { 
    loading: () => <div className="opacity-0" />,
    ssr: false
  }
);

const MotionP = dynamic(() => 
  import('framer-motion').then(mod => ({ 
    default: mod.motion.p 
  })), 
  { 
    loading: () => <p className="opacity-0" />,
    ssr: false
  }
);
import { useTranslations, useLocale } from 'next-intl';
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { AdvancedGradientButton } from "@/components/magicui/advanced-gradient-button";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { type Locale, getLocaleDirection } from "@/utilities/locale";

// Simple static homepage hero component
export const HomepageHero: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme();
  const locale = useLocale() as Locale;
  const direction = getLocaleDirection(locale);
  const t = useTranslations();

  useEffect(() => {
    setHeaderTheme("dark");
  }, [setHeaderTheme]);

  return (
    <div
      className="relative -mt-[10.4rem] min-h-screen overflow-hidden bg-primary"
      data-theme="dark"
      dir={direction}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.png"
          alt="HAPA Office"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center pt-[10.4rem] pb-20">
        <div className="hapa-container pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[80vh]">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8 lg:space-y-10 text-center lg:text-start">
              {/* Title */}
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white">
                  {t("heroTitle")}
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto lg:ms-0" />
              </MotionDiv>

              {/* Description */}
              <MotionP
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                {t("heroSubtitle")}
              </MotionP>

              {/* CTA Buttons */}
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 sm:gap-6 w-full max-w-sm sm:max-w-none mx-auto lg:mx-0"
              >
                <Link href="/forms/media-content-report" className="w-full sm:w-auto">
                  <AdvancedGradientButton
                    className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 text-base font-semibold lg:text-lg justify-center min-h-[56px] lg:min-h-[60px]"
                    gradientColor="rgba(15, 122, 46, 0.6)"
                  >
                    <span>{t("applyLicense")}</span>
                    {locale === "ar" ? (
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </AdvancedGradientButton>
                </Link>

                <Link href="/contact" className="w-full sm:w-auto">
                  <InteractiveHoverButton className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 justify-center bg-white/15 border-white/50 hover:bg-white/25 backdrop-blur-md text-base lg:text-lg font-semibold min-h-[56px] lg:min-h-[60px]">
                    {t("contactHapa")}
                  </InteractiveHoverButton>
                </Link>
              </MotionDiv>
            </div>

            {/* Right Side: Quick Stats */}
            <div className="lg:col-span-4 space-y-6">
              <MotionDiv
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="bg-white/15 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/30 shadow-xl"
              >
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-white mb-2">
                      {t("keyStatistics")}
                    </h2>
                    <div className="w-12 h-0.5 bg-secondary mx-auto"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">450+</div>
                        <div className="text-sm text-gray-300">
                          {t("registeredJournalists")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">40+</div>
                        <div className="text-sm text-gray-300">
                          {t("mediaOperators")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">89%</div>
                        <div className="text-sm text-gray-300">
                          {t("complaintsResolved")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionDiv>

              {/* Trust Badge */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-center lg:text-start"
              >
                <div className="inline-flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{t("officialRegulatory")}</span>
                </div>
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};