import type { Block } from 'payload'

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: {
    singular: {
      fr: 'Formulaire de Contact',
      ar: 'نموذج الاتصال'
    },
    plural: {
      fr: 'Formulaires de Contact',
      ar: 'نماذج الاتصال'
    }
  },
  interfaceName: 'ContactFormBlock',
  fields: [
    {
      name: 'id',
      type: 'text',
      defaultValue: () => `contact-form-${Date.now()}`,
      admin: {
        hidden: true,
      },
    },
  ],
}