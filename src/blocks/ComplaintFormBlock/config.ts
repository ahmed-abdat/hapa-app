import type { Block } from 'payload'

export const ComplaintFormBlock: Block = {
  slug: 'complaintForm',
  labels: {
    singular: {
      fr: 'Formulaire de Plainte',
      ar: 'نموذج الشكوى'
    },
    plural: {
      fr: 'Formulaires de Plainte',
      ar: 'نماذج الشكوى'
    }
  },
  interfaceName: 'ComplaintFormBlock',
  fields: [
    {
      name: 'id',
      type: 'text',
      defaultValue: () => `complaint-form-${Date.now()}`,
      admin: {
        hidden: true,
      },
    },
  ],
}