/**
 * Admin-safe translation hook that works in both Next.js and Payload admin contexts
 * Falls back to static translations when next-intl context is not available
 */

import { useCallback } from "react";
import { adminTranslations } from "@/translations/admin-translations";

type TranslationKey =
  | keyof typeof adminTranslations.fr
  | keyof typeof adminTranslations.ar;
type Locale = "fr" | "ar";

export function useAdminTranslations(namespace?: string) {
  // Try to get locale from various sources
  const getLocale = (): Locale => {
    // First try to get locale from Payload's admin interface
    if (typeof window !== "undefined") {
      // Check for Payload admin locale in localStorage (Payload stores user preferences here)
      try {
        const payloadLang = localStorage.getItem("payload-language");
        if (payloadLang === "ar" || payloadLang === "fr") {
          return payloadLang as Locale;
        }
      } catch (e) {
        // Ignore localStorage errors
      }

      // Check document language attribute (set by Payload admin)
      const docLang = document.documentElement.lang;
      if (docLang === "ar" || docLang === "fr") {
        return docLang as Locale;
      }

      // Check URL for frontend locale (Next.js routes)
      const pathname = window.location.pathname;
      if (pathname.includes("/ar/") || pathname.includes("/ar")) {
        return "ar";
      }

      // Check if we're in admin interface - default to Arabic as per config
      if (pathname.includes("/admin")) {
        return "ar"; // Match payload.config.ts defaultLocale
      }
    }

    // Default to French for frontend
    return "ar";
  };

  const locale = getLocale();

  const t = useCallback(
    (key: string, values?: Record<string, any>): string => {
      // Build the full key with namespace if provided
      const fullKey = namespace ? `${namespace}.${key}` : key;

      // Get translation from static translations
      const translation =
        adminTranslations[locale][
          fullKey as keyof (typeof adminTranslations)[typeof locale]
        ];

      let localizedString: any;

      if (!translation) {
        // Try fallback to French
        const fallbackTranslation =
          adminTranslations.fr[fullKey as keyof typeof adminTranslations.fr];
        if (!fallbackTranslation) {
          // Return the key itself as fallback
          return fullKey;
        }
        localizedString = fallbackTranslation;
      } else {
        localizedString = translation;
      }

      // Handle interpolation if values are provided
      if (values && typeof localizedString === "string") {
        let result = localizedString;
        Object.entries(values).forEach(([key, value]) => {
          result = result.replace(`{${key}}`, String(value));
        });
        return result;
      }

      return localizedString;
    },
    [locale, namespace]
  );

  return t;
}

/**
 * Hook specifically for admin action translations
 */
export function useAdminActions() {
  return useAdminTranslations("actions");
}

/**
 * Hook for general admin translations
 */
export function useAdmin() {
  return useAdminTranslations("admin");
}
