import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Gallery',
    plural: 'Galleries',
  },
  fields: [
    {
      name: 'title',
      label: 'Gallery Title',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional title for the gallery section',
        placeholder: 'e.g., Photo Gallery, Event Images',
      },
    },
    {
      name: 'subtitle',
      label: 'Gallery Subtitle',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional subtitle to provide more context',
        placeholder: 'Brief description of the gallery content...',
      },
    },
    {
      name: 'images',
      label: 'Gallery Images',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 50,
      fields: [
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Upload an image for the gallery',
          },
        },
        {
          name: 'title',
          label: 'Image Title',
          type: 'text',
          localized: true,
          admin: {
            description: 'Optional title for this image',
            placeholder: 'Image title...',
          },
        },
        {
          name: 'description',
          label: 'Image Description',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Optional description for this image',
            placeholder: 'Image description...',
          },
        },
      ],
      admin: {
        description: 'Add images to the gallery. Drag to reorder.',
        components: {
          RowLabel: ({ data }) => {
            return data?.title || data?.image?.filename || 'Image'
          },
        },
      },
    },
    {
      name: 'layout',
      label: 'Gallery Layout',
      type: 'select',
      defaultValue: 'masonry',
      options: [
        {
          label: 'Masonry (Pinterest-style)',
          value: 'masonry',
        },
        {
          label: 'Grid (Equal heights)',
          value: 'grid',
        },
        {
          label: 'Flexible (Mixed sizes)',
          value: 'flex',
        },
      ],
      admin: {
        description: 'Choose how to arrange the images',
      },
    },
    {
      name: 'columns',
      label: 'Number of Columns',
      type: 'select',
      defaultValue: '3',
      options: [
        {
          label: '2 Columns',
          value: '2',
        },
        {
          label: '3 Columns',
          value: '3',
        },
        {
          label: '4 Columns',
          value: '4',
        },
        {
          label: '5 Columns',
          value: '5',
        },
      ],
      admin: {
        description: 'Maximum number of columns on larger screens',
        condition: (data) => data.layout !== 'flex',
      },
    },
    {
      name: 'showTitles',
      label: 'Show Image Titles',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Display image titles and descriptions on hover',
      },
    },
    {
      name: 'enableLightbox',
      label: 'Enable Lightbox',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Allow users to view images in a fullscreen lightbox',
      },
    },
  ],
}