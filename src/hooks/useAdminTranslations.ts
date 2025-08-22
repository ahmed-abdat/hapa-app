/**
 * Admin-safe translation hook that works in both Next.js and Payload admin contexts
 * Falls back to static translations when next-intl context is not available
 */

import { useCallback } from 'react';
import { adminTranslations } from '@/translations/admin-translations';

type TranslationKey = keyof typeof adminTranslations.fr;
type Locale = 'fr' | 'ar';

export function useAdminTranslations(namespace?: string) {
  // Try to get locale from various sources
  const getLocale = (): Locale => {
    // Check URL for locale
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/ar/') || pathname.includes('/ar')) {
        return 'ar';
      }
    }
    // Default to French
    return 'fr';
  };

  const locale = getLocale();

  const t = useCallback((key: string, values?: Record<string, any>): string => {
    // Build the full key with namespace if provided
    const fullKey = namespace ? `${namespace}.${key}` : key;
    
    // Get translation from static translations
    const translation = adminTranslations[locale][fullKey as TranslationKey];
    
    let localizedString: any;
    
    if (!translation) {
      // Try fallback to French
      const fallbackTranslation = adminTranslations.fr[fullKey as TranslationKey];
      if (!fallbackTranslation) {
        // Return the key itself as fallback
        return fullKey;
      }
      localizedString = fallbackTranslation;
    } else {
      localizedString = translation;
    }

    // Handle interpolation if values are provided
    if (values && typeof localizedString === 'string') {
      let result = localizedString;
      Object.entries(values).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, String(value));
      });
      return result;
    }

    return localizedString;
  }, [locale, namespace]);

  return t;
}

/**
 * Hook specifically for admin action translations
 */
export function useAdminActions() {
  return useAdminTranslations('actions');
}

/**
 * Hook for general admin translations
 */
export function useAdmin() {
  return useAdminTranslations('admin');
}