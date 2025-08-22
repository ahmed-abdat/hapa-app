import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: {
    singular: {
      fr: 'Code',
      ar: 'الكود'
    },
    plural: {
      fr: 'Blocs de code',
      ar: 'كتل الكود'
    }
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'typescript',
      label: {
        fr: 'Langage',
        ar: 'اللغة'
      },
      options: [
        {
          label: {
            fr: 'TypeScript',
            ar: 'تايب سكريبت'
          },
          value: 'typescript',
        },
        {
          label: {
            fr: 'JavaScript',
            ar: 'جافا سكريبت'
          },
          value: 'javascript',
        },
        {
          label: {
            fr: 'CSS',
            ar: 'CSS'
          },
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: {
        fr: 'Code',
        ar: 'الكود'
      },
      required: true,
    },
  ],
}
