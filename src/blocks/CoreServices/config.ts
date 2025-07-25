import type { Block } from 'payload'

export const CoreServices: Block = {
  slug: 'coreServices',
  interfaceName: 'CoreServicesBlock',
  labels: {
    singular: 'Core Services',
    plural: 'Core Services',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      localized: true,
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Section Description',
      localized: true,
      required: false,
    },
  ],
}