// Lazy-loaded translation system for better performance
import type { NestedKeysStripped } from '@payloadcms/translations'

// Translation namespace types
export type TranslationNamespace = 
  | 'general'
  | 'dashboard'
  | 'actions'
  | 'status'
  | 'priority'
  | 'forms'
  | 'stats'
  | 'filters'
  | 'tabs'
  | 'table'
  | 'details'
  | 'recent'
  | 'empty'
  | 'common'
  | 'admin'
  | 'search'
  | 'modernDashboard'
  | 'violations'
  | 'media'

// Cache for loaded translations
const translationCache = new Map<string, any>()

// Lazy load translation namespace
export async function loadTranslationNamespace(
  namespace: TranslationNamespace,
  locale: 'fr' | 'ar' = 'fr'
): Promise<Record<string, any>> {
  const cacheKey = `${locale}-${namespace}`
  
  // Return from cache if already loaded
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  try {
    // Dynamically import the namespace
    const loadedModule = await import(`./${locale}/${namespace}.ts`)
    const translations = loadedModule.default || loadedModule
    
    // Cache the result
    translationCache.set(cacheKey, translations)
    
    return translations
  } catch (error) {
    console.warn(`Failed to load translation namespace ${namespace} for locale ${locale}`, error)
    
    // Fallback to French if Arabic fails
    if (locale === 'ar') {
      return loadTranslationNamespace(namespace, 'fr')
    }
    
    // Return empty object as last resort
    return {}
  }
}

// Load multiple namespaces at once
export async function loadTranslationNamespaces(
  namespaces: TranslationNamespace[],
  locale: 'fr' | 'ar' = 'fr'
): Promise<Record<string, any>> {
  const translations = await Promise.all(
    namespaces.map(ns => loadTranslationNamespace(ns, locale))
  )
  
  // Merge all namespace translations
  return Object.assign({}, ...translations)
}

// Preload critical namespaces for better UX
export async function preloadCriticalTranslations(locale: 'fr' | 'ar' = 'fr') {
  const criticalNamespaces: TranslationNamespace[] = [
    'general',
    'actions',
    'common',
    'status'
  ]
  
  return loadTranslationNamespaces(criticalNamespaces, locale)
}

// Clear translation cache (useful for locale switching)
export function clearTranslationCache() {
  translationCache.clear()
}