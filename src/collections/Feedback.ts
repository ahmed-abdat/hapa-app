import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  labels: {
    singular: {
      fr: 'Message',
      ar: 'رسالة'
    },
    plural: {
      fr: 'Messages',
      ar: 'رسائل'
    }
  },
  access: {
    create: anyone, // Allow public submissions
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    useAsTitle: 'subject',
    listSearchableFields: ['name', 'email', 'subject', 'message'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: {
          fr: 'Nom du contact',
          ar: 'اسم جهة الاتصال'
        }
      }
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: {
          fr: 'Adresse email du contact',
          ar: 'عنوان البريد الإلكتروني للاتصال'
        }
      }
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: {
          fr: 'Sujet du message',
          ar: 'موضوع الرسالة'
        }
      }
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: {
          fr: 'Contenu du message',
          ar: 'محتوى الرسالة'
        },
        rows: 6,
      }
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: {
            fr: 'Nouveau',
            ar: 'جديد'
          },
          value: 'new',
        },
        {
          label: {
            fr: 'En cours',
            ar: 'قيد المعالجة'
          },
          value: 'in_progress',
        },
        {
          label: {
            fr: 'Résolu',
            ar: 'تم حله'
          },
          value: 'resolved',
        },
        {
          label: {
            fr: 'Fermé',
            ar: 'مغلق'
          },
          value: 'closed',
        },
      ],
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Statut de traitement du message',
          ar: 'حالة معالجة الرسالة'
        }
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        {
          label: {
            fr: 'Faible',
            ar: 'منخفض'
          },
          value: 'low',
        },
        {
          label: {
            fr: 'Normal',
            ar: 'عادي'
          },
          value: 'normal',
        },
        {
          label: {
            fr: 'Élevé',
            ar: 'عالي'
          },
          value: 'high',
        },
        {
          label: {
            fr: 'Urgente',
            ar: 'عاجل'
          },
          value: 'urgent',
        },
      ],
      defaultValue: 'normal',
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Priorité de traitement',
          ar: 'أولوية المعالجة'
        }
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            fr: 'Réponse Admin',
            ar: 'رد المشرف'
          },
          fields: [
            {
              name: 'adminResponse',
              type: 'textarea',
              localized: true,
              admin: {
                description: {
                  fr: 'Réponse de l\'administrateur au message',
                  ar: 'رد المشرف على الرسالة'
                },
                rows: 8,
              },
            },
            {
              name: 'responseDate',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
                description: {
                  fr: 'Date et heure de la réponse',
                  ar: 'تاريخ ووقت الرد'
                }
              },
            },
            {
              name: 'respondedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                description: {
                  fr: 'Administrateur qui a répondu',
                  ar: 'المشرف الذي أجاب'
                }
              },
            },
          ],
        },
        {
          label: {
            fr: 'Notes Internes',
            ar: 'ملاحظات داخلية'
          },
          fields: [
            {
              name: 'internalNotes',
              type: 'textarea',
              admin: {
                description: {
                  fr: 'Notes internes pour l\'équipe (non visibles au public)',
                  ar: 'ملاحظات داخلية للفريق (غير مرئية للجمهور)'
                },
                rows: 6,
              },
            },
            {
              name: 'tags',
              type: 'text',
              hasMany: true,
              admin: {
                description: {
                  fr: 'Étiquettes pour catégoriser le message',
                  ar: 'علامات لتصنيف الرسالة'
                }
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}