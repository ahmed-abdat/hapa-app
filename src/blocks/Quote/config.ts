import type { Block } from 'payload'

export const Quote: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  labels: {
    singular: 'Quote',
    plural: 'Quotes',
  },
  fields: [
    {
      name: 'quote',
      label: 'Quote Text',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'The main quote or testimonial text',
        placeholder: 'Enter the quote text...',
      },
    },
    {
      name: 'author',
      label: 'Author',
      type: 'text',
      localized: true,
      admin: {
        description: 'The person who said or wrote this quote',
        placeholder: 'e.g., John Doe',
      },
    },
    {
      name: 'role',
      label: 'Author Role/Title',
      type: 'text',
      localized: true,
      admin: {
        description: 'The role, title, or organization of the author',
        placeholder: 'e.g., CEO of Company, Expert in Field',
      },
    },
    {
      name: 'variant',
      label: 'Quote Style',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Featured Quote',
          value: 'featured',
        },
        {
          label: 'Testimonial',
          value: 'testimonial',
        },
        {
          label: 'Pull Quote',
          value: 'pull',
        },
      ],
      admin: {
        description: 'Choose the visual style for this quote',
      },
    },
    {
      name: 'showIcon',
      label: 'Show Quote Icon',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Display a quote icon in the block',
      },
    },
  ],
}