"use client";

import React from "react";
import { type Locale } from "@/utilities/locale";
import { CorporateHero } from "./variants/CorporateHero";
import { MinimalHero } from "./variants/MinimalHero";
import { GradientHero } from "./variants/GradientHero";
import { AuthorityHero } from "./variants/AuthorityHero";
import { InteractiveHero } from "./variants/InteractiveHero";
import { FloatingHero } from "./variants/FloatingHero";
import type { HeroVariant, HeroVariantProps } from "./types";

// Use the shared interface instead of duplicating
interface HomepageHeroProps extends HeroVariantProps {
  variant?: HeroVariant;
}

// Hero variant configuration - can be set via environment variable or prop
const getHeroVariant = (): HeroVariant => {
  // Priority: 1. Environment variable, 2. Default
  const envVariant = process.env.NEXT_PUBLIC_HERO_VARIANT as HeroVariant;
  
  const validVariants: HeroVariant[] = [
    'corporate', 'minimal', 'gradient', 
    'authority', 'interactive', 'floating'
  ];
  
  if (envVariant && validVariants.includes(envVariant)) {
    return envVariant;
  }
  
  // Default to corporate (current style)
  return 'corporate';
};

// Variant selector component mapping
const HeroVariants = {
  corporate: CorporateHero,
  minimal: MinimalHero,
  gradient: GradientHero,
  authority: AuthorityHero,
  interactive: InteractiveHero,
  floating: FloatingHero,
  cinematic: GradientHero, // fallback to gradient for cinematic
  geometric: GradientHero, // fallback to gradient for geometric
} as const;

export const HomepageHero: React.FC<HomepageHeroProps> = ({ 
  locale, 
  translations, 
  variant 
}) => {
  // Use prop variant or environment/default variant
  const activeVariant = variant || getHeroVariant();
  const HeroComponent = HeroVariants[activeVariant];

  // Fallback to CorporateHero if variant not found
  if (!HeroComponent) {
    console.warn(`Hero variant "${activeVariant}" not found, falling back to corporate`);
    return <CorporateHero locale={locale} translations={translations} />;
  }

  return <HeroComponent locale={locale} translations={translations} />;
};