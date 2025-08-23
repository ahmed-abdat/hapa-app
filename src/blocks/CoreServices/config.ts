import type { Block } from 'payload'

export const CoreServices: Block = {
  slug: 'coreServices',
  interfaceName: 'CoreServicesBlock',
  labels: {
    singular: {
      fr: 'Services principaux',
      ar: 'الخدمات الأساسية'
    },
    plural: {
      fr: 'Services principaux',
      ar: 'الخدمات الأساسية'
    }
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        fr: 'Titre de la section',
        ar: 'عنوان القسم'
      },
      localized: true,
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        fr: 'Description de la section',
        ar: 'وصف القسم'
      },
      localized: true,
      required: false,
    },
  ],
}