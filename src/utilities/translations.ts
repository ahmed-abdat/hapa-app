import { type Locale } from './locale'

export const translations = {
  fr: {
    author: 'Auteur',
    datePublished: 'Date de publication',
    categories: 'Catégories',
    untitledCategory: 'Catégorie sans titre',
    readMore: 'Lire la suite',
    search: 'Rechercher',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    noImage: 'Aucune image',
  },
  ar: {
    author: 'المؤلف',
    datePublished: 'تاريخ النشر',
    categories: 'الفئات',
    untitledCategory: 'فئة بدون عنوان',
    readMore: 'اقرأ المزيد',
    search: 'البحث',
    noResults: 'لم يتم العثور على نتائج',
    loading: 'جاري التحميل...',
    noImage: 'لا توجد صورة',
  },
} as const

export type TranslationKey = keyof typeof translations.fr

export function getTranslation(key: TranslationKey, locale: Locale): string {
  return translations[locale][key] || translations.fr[key]
}

export function t(key: TranslationKey, locale: Locale): string {
  return getTranslation(key, locale)
}