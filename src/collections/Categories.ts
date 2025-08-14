import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      fr: 'Catégorie',
      ar: 'فئة'
    },
    plural: {
      fr: 'Catégories',
      ar: 'فئات'
    }
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    listSearchableFields: ['title'],
    preview: (data, { req, locale }) => {
      const slug = typeof data.slug === 'string' ? data.slug : ''
      if (!slug) return ''
      
      const currentLocale = (locale && typeof locale === 'object' && 'code' in locale) 
        ? String((locale as { code: string }).code) 
        : String(locale || 'fr')
      
      return `/${currentLocale}/publications/${slug}`
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      index: true, // Add database index for filtering and search
    },
    ...slugField(),
  ],
}
