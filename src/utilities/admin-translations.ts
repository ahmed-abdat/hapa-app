// src/utilities/admin-translations.ts
import { useTranslation } from '@payloadcms/ui'
import type { AdminTranslationsObject, AdminTranslationsKeys } from '@/translations/admin-translations'

/**
 * Type-safe translation hook for admin dashboard components
 * Provides IntelliSense support and type safety for translation keys
 * 
 * Usage:
 * ```tsx
 * const { dt } = useAdminTranslation()
 * return <h1>{dt('dashboard:title')}</h1>
 * ```
 */
export const useAdminTranslation = () => {
  const { t, i18n } = useTranslation<AdminTranslationsObject, AdminTranslationsKeys>()
  
  /**
   * Type-safe translation function with admin translation keys
   * @param key - Translation key in format 'namespace:key'
   * @returns Translated string
   */
  const dt = (key: AdminTranslationsKeys): string => {
    return t(key)
  }
  
  return { 
    dt,   // Type-safe admin translation function
    t,    // Generic Payload translation function
    i18n  // i18n object for language info
  }
}