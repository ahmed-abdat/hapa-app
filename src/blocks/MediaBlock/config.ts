import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    singular: {
      fr: 'Bloc média',
      ar: 'كتلة الوسائط'
    },
    plural: {
      fr: 'Blocs média',
      ar: 'كتل الوسائط'
    }
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        fr: 'Média',
        ar: 'الوسائط'
      }
    },
  ],
}
