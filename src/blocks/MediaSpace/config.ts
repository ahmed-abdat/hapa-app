import type { Block } from 'payload'

export const MediaSpace: Block = {
  slug: 'mediaSpace',
  interfaceName: 'MediaSpaceBlock',
  labels: {
    singular: {
      fr: 'Espace média',
      ar: 'مساحة الوسائط'
    },
    plural: {
      fr: 'Espaces média',
      ar: 'مساحات الوسائط'
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