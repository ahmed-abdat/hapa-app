import { type Locale } from "@/utilities/locale";

export interface HeroVariantProps {
  locale: Locale;
  translations: {
    heroTitle: string;
    heroSubtitle: string;
    reportMediaContent: string;
    contactHapa: string;
    keyStatistics: string;
    registeredJournalists: string;
    mediaOperators: string;
    complaintsResolved: string;
    officialRegulatory: string;
    globalPerformance: string;
    governmentAuthority: string;
    official: string;
    services: string;
    contactSupport: string;
  };
}

export type HeroVariant = 
  | 'corporate'    // Original HAPA hero
  | 'minimal'      // Clean, text-focused
  | 'gradient'     // Geometric shapes with gradients
  | 'authority'    // Professional government style
  | 'interactive'  // Data-driven with live elements
  | 'cinematic'    // Video background with overlay
  | 'geometric'    // Abstract shapes and patterns
  | 'floating';    // Floating UI elements