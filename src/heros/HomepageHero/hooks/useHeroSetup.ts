import { useEffect } from "react";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { type Locale, getLocaleDirection } from "@/utilities/locale";

/**
 * Shared hook for hero component setup
 * Reduces code duplication across all hero variants
 */
export function useHeroSetup(locale: Locale, translations: Record<string, string>) {
  const { setHeaderTheme } = useHeaderTheme();
  const direction = getLocaleDirection(locale);
  const isRTL = locale === "ar";
  
  // Translation helper
  const t = (key: keyof typeof translations) => translations[key];

  // Set header theme to light for all heroes
  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);

  return {
    direction,
    isRTL,
    t,
  };
}