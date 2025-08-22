import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  labels: {
    singular: {
      fr: 'Archive',
      ar: 'الأرشيف'
    },
    plural: {
      fr: 'Archives',
      ar: 'الأرشيفات'
    }
  },
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: {
        fr: 'Contenu d\'introduction',
        ar: 'محتوى المقدمة'
      },
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      label: {
        fr: 'Remplir par',
        ar: 'ملء بواسطة'
      },
      options: [
        {
          label: {
            fr: 'Collection',
            ar: 'المجموعة'
          },
          value: 'collection',
        },
        {
          label: {
            fr: 'Sélection individuelle',
            ar: 'اختيار فردي'
          },
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: {
        fr: 'Collections à afficher',
        ar: 'المجموعات للعرض'
      },
      options: [
        {
          label: {
            fr: 'Articles',
            ar: 'المقالات'
          },
          value: 'posts',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: {
        fr: 'Catégories à afficher',
        ar: 'الفئات للعرض'
      },
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: {
        fr: 'Limite',
        ar: 'الحد'
      },
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: {
        fr: 'Sélection',
        ar: 'الاختيار'
      },
      relationTo: ['posts'],
    },
  ],
}
