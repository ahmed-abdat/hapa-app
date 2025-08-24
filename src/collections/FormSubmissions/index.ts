import type { CollectionConfig } from 'payload'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: {
    singular: {
      fr: 'Soumission de formulaire',
      ar: 'إرسال النموذج'
    },
    plural: {
      fr: 'Soumissions de formulaires',
      ar: 'إرسالات النماذج'
    }
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['formType', 'name', 'email', 'status', 'createdAt'],
    group: {
      fr: 'Contenu',
      ar: 'المحتوى'
    }
  },
  access: {
    read: () => true, // Public can submit forms
    create: () => true, // Public can create submissions
    update: ({ req: { user } }) => Boolean(user), // Only authenticated users can update
    delete: ({ req: { user } }) => Boolean(user), // Only authenticated users can delete
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        {
          label: {
            fr: 'Contact',
            ar: 'اتصال'
          },
          value: 'contact'
        },
        {
          label: {
            fr: 'Plainte',
            ar: 'شكوى'
          },
          value: 'complaint'
        }
      ],
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: {
            fr: 'En attente',
            ar: 'قيد الانتظار'
          },
          value: 'pending'
        },
        {
          label: {
            fr: 'En cours',
            ar: 'قيد المعالجة'
          },
          value: 'in-progress'
        },
        {
          label: {
            fr: 'Résolu',
            ar: 'تم الحل'
          },
          value: 'resolved'
        }
      ],
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Français',
          value: 'fr'
        },
        {
          label: 'العربية',
          value: 'ar'
        }
      ],
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        fr: 'Nom',
        ar: 'الاسم'
      }
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: {
        fr: 'Email',
        ar: 'البريد الإلكتروني'
      }
    },
    {
      name: 'phone',
      type: 'text',
      label: {
        fr: 'Téléphone',
        ar: 'الهاتف'
      }
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: {
        fr: 'Sujet',
        ar: 'الموضوع'
      }
    },
    {
      name: 'message',
      type: 'textarea',
      label: {
        fr: 'Message',
        ar: 'الرسالة'
      }
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        readOnly: true
      },
      label: {
        fr: 'Soumis le',
        ar: 'تاريخ الإرسال'
      }
    }
  ]
}