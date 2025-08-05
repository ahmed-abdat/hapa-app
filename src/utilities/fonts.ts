import { louguiya, louguiyaFR } from '@/fonts'
import type { Locale } from '@/utilities/locale'
import type { LocaleFontMap, LocaleCustomFont } from '@/types/fonts'

// Map of locale to font configuration
const localeFontMap: LocaleFontMap = {
  ar: louguiya,
  fr: louguiyaFR,
}

/**
 * Get the appropriate font configuration for a given locale
 * @param locale - The locale to get font for
 * @returns The font configuration
 */
export function getLocaleFont(locale: Locale) {
  return localeFontMap[locale as keyof LocaleFontMap] || louguiyaFR // Default to French font
}

/**
 * Get the font class name for a given locale
 * @param locale - The locale to get font class for
 * @returns The font class name
 */
export function getFontClassName(locale: Locale): string {
  const font = getLocaleFont(locale)
  return font.className
}

/**
 * Get the font CSS variable for a given locale
 * @param locale - The locale to get font variable for
 * @returns The font CSS variable
 */
export function getFontVariable(locale: Locale): string {
  const font = getLocaleFont(locale)
  return font.variable
}

/**
 * Get both font class and variable for a given locale
 * @param locale - The locale to get font properties for
 * @returns Object containing className and variable
 */
export function getFontProperties(locale: Locale) {
  const font = getLocaleFont(locale)
  return {
    className: font.className,
    variable: font.variable,
  }
}