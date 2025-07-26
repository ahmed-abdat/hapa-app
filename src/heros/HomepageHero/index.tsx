"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Shield, Users, FileText } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { AdvancedGradientButton } from "@/components/magicui/advanced-gradient-button";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { type Locale, getLocaleDirection } from "@/utilities/locale";

// Simple static homepage hero component
export const HomepageHero: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme();
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
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
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[80vh]">
            {/* Main Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-start">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white">
                  {t("heroTitle")}
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto lg:ms-0" />
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                {t("heroSubtitle")}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link href="/services/media-licensing">
                  <AdvancedGradientButton
                    className="px-6 py-4 text-sm font-semibold lg:text-base"
                    gradientColor="rgba(15, 122, 46, 0.6)"
                  >
                    <span>{t("applyLicense")}</span>
                    {locale === "ar" ? (
                      <ArrowLeft className="h-4 w-4 ml-2 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    )}
                  </AdvancedGradientButton>
                </Link>

                <Link href="/contact">
                  <InteractiveHoverButton className="px-8 py-4 w-auto">
                    {t("contactHapa")}
                  </InteractiveHoverButton>
                </Link>
              </motion.div>
            </div>

            {/* Right Side: Quick Stats */}
            <div className="lg:col-span-5 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg"
              >
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {t("keyStatistics")}
                    </h3>
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
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-center lg:text-start"
              >
                <div className="inline-flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{t("officialRegulatory")}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};