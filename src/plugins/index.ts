import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
// import { formBuilderPlugin } from '@payloadcms/plugin-form-builder' // Replaced with custom forms
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
// import { redirectsPlugin } from '@payloadcms/plugin-redirects' // Removed - not needed
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
// import { revalidateRedirects } from '@/hooks/revalidateRedirects' // Removed with redirects
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post> = ({ doc }) => {
  return doc?.title ? `${doc.title} | HAPA` : 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel'
}

const generateURL: GenerateURL<Post> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  // Redirects plugin removed - not needed for this project
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
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
