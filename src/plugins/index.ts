import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
// import { formBuilderPlugin } from '@payloadcms/plugin-form-builder' // Replaced with custom forms
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
// import { redirectsPlugin } from '@payloadcms/plugin-redirects' // Removed - not needed
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
// import { revalidateRedirects } from '@/hooks/revalidateRedirects' // Removed with redirects
import { GenerateTitle, GenerateURL, GenerateDescription, GenerateImage } from '@payloadcms/plugin-seo/types'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { generateSEOTitle, generateSEODescription, generateContentSummary } from '@/utilities/seo'

const generateTitle: GenerateTitle<Post> = ({ doc, locale }) => {
  // Get the title based on locale
  let title = ''
  const currentLocale = typeof locale === 'string' ? locale : (locale as any)?.code || 'fr'
  
  if (doc?.title) {
    if (typeof doc.title === 'object') {
      // Handle localized title
      title = (doc.title as any)[currentLocale] || (doc.title as any).fr || ''
    } else if (typeof doc.title === 'string') {
      title = doc.title
    }
  }
  
  // Use different site names based on locale
  const siteName = currentLocale === 'ar' 
    ? 'الهيئة العليا للصحافة والإعلام السمعي البصري'
    : 'HAPA'
  
  return generateSEOTitle(title, siteName)
}

const generateDescription: GenerateDescription<Post> = ({ doc, locale }) => {
  const currentLocale = typeof locale === 'string' ? locale : (locale as any)?.code || 'fr'
  
  // Get the content based on locale
  let content = null
  let title = ''
  
  if (doc?.content) {
    if (typeof doc.content === 'object' && 'root' in doc.content) {
      // Direct content object
      content = doc.content
    } else if (typeof doc.content === 'object') {
      // Localized content
      content = (doc.content as any)[currentLocale] || (doc.content as any).fr || null
    }
  }
  
  // If we have content, use the smart summary function
  if (content) {
    return generateContentSummary(content)
  }
  
  // Get title as fallback
  if (doc?.title) {
    if (typeof doc.title === 'object') {
      title = (doc.title as any)[currentLocale] || (doc.title as any).fr || ''
    } else if (typeof doc.title === 'string') {
      title = doc.title
    }
  }
  
  // Generate description from content, with title as fallback
  return generateSEODescription(content, title)
}

const generateImage: GenerateImage<Post> = ({ doc }): string | Promise<string> => {
  // Priority: heroImage > first media block > default
  if (doc?.heroImage && typeof doc.heroImage === 'object' && 'url' in doc.heroImage) {
    return doc.heroImage.url as string
  }
  
  // Return empty string to use default
  return ''
}

const generateURL: GenerateURL<Post> = ({ doc, locale }) => {
  const url = getServerSideURL()
  const currentLocale = typeof locale === 'string' ? locale : (locale as any)?.code || 'fr'
  
  // Generate proper localized URLs
  if (doc?.slug) {
    return `${url}/${currentLocale}/posts/${doc.slug}`
  }
  
  return `${url}/${currentLocale}`
}

export const plugins: Plugin[] = [
  // Redirects plugin removed - not needed for this project
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateDescription,
    generateImage,
    generateURL,
    collections: [], // Empty array - Posts collection already has SEO fields configured manually
    uploadsCollection: 'media',
    tabbedUI: false, // Keep disabled as Posts collection manages its own tabs
    interfaceName: 'HAPASEO', // Custom TypeScript interface
  }),
  // Removed formBuilderPlugin - replaced with custom forms
  // formBuilderPlugin({...}),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: {
        singular: {
          fr: 'Index de recherche (Auto)',
          ar: 'فهرس البحث (تلقائي)'
        },
        plural: {
          fr: 'Index de recherche (Auto)',
          ar: 'فهرس البحث (تلقائي)'
        }
      },
      admin: {
        description: {
          fr: 'Collection automatique pour l\'indexation des contenus. Mise à jour lors de la création/modification d\'articles. Utilisée par le moteur de recherche du site.',
          ar: 'مجموعة تلقائية لفهرسة المحتويات. يتم تحديثها عند إنشاء/تعديل المقالات. تستخدم من قبل محرك البحث في الموقع.'
        }
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  payloadCloudPlugin(),
]
