"use client";

import React, { useEffect } from "react";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { UnifiedHeroCTA } from "../components/UnifiedHeroCTA";
import { type Locale, getLocaleDirection } from "@/utilities/locale";
import type { HeroVariantProps } from "../types";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const MotionDiv = dynamic(() => 
  import('framer-motion').then(mod => ({ 
    default: mod.motion.div 
  })), 
  { 
    loading: () => <div className="opacity-0" />,
    ssr: false
  }
);

// Gradient Hero - Bold geometric shapes and vibrant gradients
export const GradientHero: React.FC<HeroVariantProps> = ({ locale, translations }) => {
  const { setHeaderTheme } = useHeaderTheme();
  const direction = getLocaleDirection(locale);
  const isRTL = locale === "ar";
  const t = (key: keyof typeof translations) => translations[key];

  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);

  return (
    <div
      className="relative -mt-header-height lg:-mt-header-height-lg min-h-screen bg-white overflow-hidden"
    >
      {/* Geometric Background Shapes */}
      <div className="absolute inset-0">
        {/* Large gradient circle */}
        <div className="absolute -top-40 -end-40 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-3xl" />
        
        {/* Secondary gradient circle */}
        <div className="absolute -bottom-40 -start-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary/30 via-primary/20 to-transparent blur-3xl" />
        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 end-1/4 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 rotate-45 rounded-3xl blur-2xl" />
        <div className="absolute bottom-1/3 start-1/3 w-40 h-40 bg-gradient-to-tr from-secondary/20 to-accent/20 rotate-12 rounded-3xl blur-2xl" />
      </div>

      {/* Mesh gradient overlay - locale-aware positioning */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: isRTL 
            ? `radial-gradient(at 73% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%),
               radial-gradient(at 3% 21%, hsla(125, 98%, 72%, 0.15) 0px, transparent 50%),
               radial-gradient(at 48% 99%, hsla(354, 98%, 61%, 0.15) 0px, transparent 50%),
               radial-gradient(at 90% 29%, hsla(256, 96%, 67%, 0.15) 0px, transparent 50%),
               radial-gradient(at 3% 96%, hsla(38, 60%, 74%, 0.15) 0px, transparent 50%)`
            : `radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%),
               radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.15) 0px, transparent 50%),
               radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.15) 0px, transparent 50%),
               radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.15) 0px, transparent 50%),
               radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.15) 0px, transparent 50%)`,
        }}
      />

      <div className="relative z-10 pt-header-height lg:pt-header-height-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 xl:gap-10 items-center">
            {/* Content - Always on left side, but with RTL text alignment */}
            <MotionDiv
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-start"
            >
              {/* Official Badge - Smaller and less prominent */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-3 py-1.5 mb-6">
                <span className="text-xs font-medium text-gray-600">{t("officialRegulatory")}</span>
              </div>

              {/* Title with better scale - Reduced sizes for better proportion */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {t("heroTitle")}
                </span>
              </h1>

              {/* Subtitle - Reduced size for better readability */}
              <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t("heroSubtitle")}
              </p>

              {/* CTA Section - More prominent */}
              <div className="mt-8 sm:mt-10 lg:mt-12">
                <UnifiedHeroCTA
                  locale={locale}
                  translations={{
                    reportMediaContent: t("reportMediaContent"),
                    contactHapa: t("contactHapa")
                  }}
                  variant="gradient"
                  size="md"
                  alignment="left"
                />
              </div>
            </MotionDiv>

            {/* Visual - Hero Card with Next.js Image - Always on right side */}
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="relative mx-auto lg:mx-0 w-full">
                {/* Main HAPA Card with Hero Image - Larger size, cleaner design */}
                <AspectRatio ratio={16 / 10} className="relative">
                  {/* Clean Image Container with Professional Shadow */}
                  <div className="group relative w-full h-full rounded-2xl shadow-xl overflow-hidden bg-gray-100 
                                  hover:shadow-2xl transition-all duration-300 ring-1 ring-black/5">
                    {/* Optimized Hero Image */}
                    <Image
                      src="/hero.webp"
                      alt="HAPA - Haute Autorité de la Presse et de l'Audiovisuel"
                      fill
                      priority
                      quality={95}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 100vw"
                    />
                    
                    {/* Much Lighter Overlay for Better UX */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent 
                                    group-hover:from-transparent transition-all duration-500" />
                  </div>
                </AspectRatio>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
};