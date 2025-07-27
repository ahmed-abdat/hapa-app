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
