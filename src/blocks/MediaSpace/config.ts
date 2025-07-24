import type { Block } from 'payload'

export const MediaSpace: Block = {
  slug: 'mediaSpace',
  interfaceName: 'MediaSpaceBlock',
  labels: {
    singular: 'Media Space',
    plural: 'Media Space',
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