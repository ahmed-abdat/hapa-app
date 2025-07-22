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
    // Hero section translations
    heroTitle: 'Haute Autorité de la Presse et de l\'Audiovisuel',
    heroSubtitle: 'Réguler le paysage médiatique mauritanien avec transparence et intégrité',
    applyLicense: 'Demander Licence',
    contactHapa: 'Nous Contacter',
    registeredJournalists: 'Journalistes enregistrés',
    complaintsResolved: 'Plaintes résolues',
    mediaOperators: 'Opérateurs médiatiques',
    keyStatistics: 'Statistiques clés',
    officialRegulatory: 'Autorité de régulation officielle',
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
    // Hero section translations
    heroTitle: 'الهيئة العليا للصحافة والإعلام',
    heroSubtitle: 'تنظيم المشهد الإعلامي الموريتاني بشفافية ونزاهة',
    applyLicense: 'طلب ترخيص',
    contactHapa: 'اتصل بنا',
    registeredJournalists: 'صحفيون مسجلون',
    complaintsResolved: 'شكاوى محلولة',
    mediaOperators: 'المشغلون الإعلاميون',
    keyStatistics: 'إحصائيات رئيسية',
    officialRegulatory: 'السلطة التنظيمية الرسمية',
  },
} as const

export type TranslationKey = keyof typeof translations.fr

export function getTranslation(key: TranslationKey, locale: Locale): string {
  return translations[locale][key] || translations.fr[key]
}

export function t(key: TranslationKey, locale: Locale): string {
  return getTranslation(key, locale)
}