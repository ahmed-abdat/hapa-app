import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    label: {
      fr: 'Taille de colonne',
      ar: 'حجم العمود'
    },
    options: [
      {
        label: {
          fr: 'Un tiers',
          ar: 'الثلث'
        },
        value: 'oneThird',
      },
      {
        label: {
          fr: 'Moitié',
          ar: 'النصف'
        },
        value: 'half',
      },
      {
        label: {
          fr: 'Deux tiers',
          ar: 'الثلثان'
        },
        value: 'twoThirds',
      },
      {
        label: {
          fr: 'Pleine largeur',
          ar: 'كامل'
        },
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: {
      fr: 'Texte enrichi',
      ar: 'النص المنسق'
    },
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: {
      fr: 'Activer le lien',
      ar: 'تفعيل الرابط'
    },
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    singular: {
      fr: 'Contenu',
      ar: 'المحتوى'
    },
    plural: {
      fr: 'Blocs de contenu',
      ar: 'كتل المحتوى'
    }
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: {
        fr: 'Colonnes',
        ar: 'الأعمدة'
      },
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
