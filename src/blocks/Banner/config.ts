import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Banner: Block = {
  slug: 'banner',
  interfaceName: 'BannerBlock',
  labels: {
    singular: {
      fr: 'Bannière',
      ar: 'لافتة'
    },
    plural: {
      fr: 'Bannières',
      ar: 'لافتات'
    }
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'info',
      label: {
        fr: 'Style',
        ar: 'النمط'
      },
      options: [
        { 
          label: {
            fr: 'Info',
            ar: 'معلومات'
          },
          value: 'info' 
        },
        { 
          label: {
            fr: 'Avertissement',
            ar: 'تحذير'
          },
          value: 'warning' 
        },
        { 
          label: {
            fr: 'Erreur',
            ar: 'خطأ'
          },
          value: 'error' 
        },
        { 
          label: {
            fr: 'Succès',
            ar: 'نجاح'
          },
          value: 'success' 
        },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: {
        fr: 'Contenu',
        ar: 'المحتوى'
      },
      required: true,
    },
  ],
}
