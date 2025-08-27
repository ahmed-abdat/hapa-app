/**
 * SEO Configuration Constants
 * Centralized configuration for SEO auto-population feature
 */

export const SEO_CONFIG = {
  /**
   * Keywords used to detect auto-generated content
   * These are used to identify when SEO fields were auto-populated
   * and may need to be regenerated
   */
  AUTO_GENERATED_KEYWORDS: [
    'HAPA',
    'Haute Autorité',
    'السلطة العليا',
    'الهيئة العليا'
  ],

  /**
   * Site names by locale
   * Used in meta title generation
   */
  SITE_NAMES: {
    fr: 'HAPA',
    ar: 'الهيئة العليا للصحافة والسمعيات البصرية',
    en: 'HAPA' // Fallback
  } as const,

  /**
   * Default meta descriptions by locale
   * Used as fallbacks when content extraction fails
   */
  DEFAULT_DESCRIPTIONS: {
    fr: 'Haute Autorité de la Presse et de l\'Audiovisuel - République Islamique de Mauritanie',
    ar: 'السلطة العليا للصحافة والسمعيات البصرية - الجمهورية الإسلامية الموريتانية',
    en: 'High Authority for Press and Audiovisual - Islamic Republic of Mauritania'
  } as const,

  /**
   * SEO validation thresholds
   */
  VALIDATION: {
    MIN_DESCRIPTION_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 160,
    MIN_TITLE_LENGTH: 10,
    MAX_TITLE_LENGTH: 60
  } as const,

  /**
   * Content extraction limits
   */
  EXTRACTION: {
    MAX_CONTENT_LENGTH: 500,
    PARAGRAPH_MIN_LENGTH: 50,
    EXCERPT_TARGET_LENGTH: 155
  } as const
} as const;

export type SupportedLocale = keyof typeof SEO_CONFIG.SITE_NAMES;