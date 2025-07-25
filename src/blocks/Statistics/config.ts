import type { Block } from 'payload'

export const Statistics: Block = {
  slug: 'statistics',
  interfaceName: 'StatisticsBlock',
  labels: {
    singular: 'Statistics',
    plural: 'Statistics',
  },
  fields: [
    {
      name: 'title',
      label: 'Section Title',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional title for the statistics section',
        placeholder: 'e.g., Our Impact in Numbers',
      },
    },
    {
      name: 'subtitle',
      label: 'Section Subtitle',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional subtitle to provide more context',
        placeholder: 'Brief description of what these statistics represent...',
      },
    },
    {
      name: 'statistics',
      label: 'Statistics',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'value',
          label: 'Number Value',
          type: 'number',
          required: true,
          admin: {
            description: 'The numerical value to display',
            placeholder: 'e.g., 1000',
          },
        },
        {
          name: 'prefix',
          label: 'Prefix',
          type: 'text',
          admin: {
            description: 'Text to show before the number (e.g., "$", "+")',
            placeholder: 'e.g., +, $',
          },
        },
        {
          name: 'suffix',
          label: 'Suffix',
          type: 'text',
          admin: {
            description: 'Text to show after the number (e.g., "%", "K", "M")',
            placeholder: 'e.g., %, K, M',
          },
        },
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            description: 'The label describing what this statistic represents',
            placeholder: 'e.g., Happy Customers',
          },
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          localized: true,
          admin: {
            description: 'Optional additional description',
            placeholder: 'Additional context about this statistic...',
          },
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'select',
          options: [
            {
              label: 'Trending Up',
              value: 'trending',
            },
            {
              label: 'Users',
              value: 'users',
            },
            {
              label: 'Files',
              value: 'files',
            },
            {
              label: 'Award',
              value: 'award',
            },
            {
              label: 'Building',
              value: 'building',
            },
            {
              label: 'Globe',
              value: 'globe',
            },
          ],
          admin: {
            description: 'Choose an icon to represent this statistic',
          },
        },
      ],
      admin: {
        description: 'Add statistics to display. Each will be animated when it comes into view.',
      },
    },
    {
      name: 'layout',
      label: 'Layout Style',
      type: 'select',
      defaultValue: 'grid',
      options: [
        {
          label: 'Grid (Responsive)',
          value: 'grid',
        },
        {
          label: 'Horizontal Row',
          value: 'horizontal',
        },
        {
          label: 'Vertical Stack',
          value: 'vertical',
        },
      ],
      admin: {
        description: 'How to arrange the statistics',
      },
    },
    {
      name: 'variant',
      label: 'Visual Style',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Featured (Gradient)',
          value: 'featured',
        },
        {
          label: 'Minimal',
          value: 'minimal',
        },
        {
          label: 'Glassmorphism',
          value: 'glassmorphism',
        },
      ],
      admin: {
        description: 'Choose the visual style for the statistics display',
      },
    },
  ],
}