export interface FontConfig {
  className: string
  style: {
    fontFamily: string
    fontWeight?: number
    fontStyle?: string
  }
  variable: string
}

export type LocaleFont = 'ar' | 'fr'

export interface LocaleCustomFont {
  className: string
  variable: string
  style: {
    fontFamily: string
  }
}

export interface LocaleFontMap {
  ar: LocaleCustomFont
  fr: LocaleCustomFont
}