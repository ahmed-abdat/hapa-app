import type { CollectionConfig } from 'payload'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: {
      fr: 'Message de Contact',
      ar: 'رسالة اتصال'
    },
    plural: {
      fr: 'Messages de Contact',
      ar: 'رسائل الاتصال'
    }
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'status', 'emailSent', 'createdAt'],
    group: {
      fr: 'Messages de Contact',
      ar: 'رسائل الاتصال'
    },
    hidden: ({ user }) => user?.role === 'editor',
    description: {
      fr: 'Messages de contact reçus via le formulaire de contact du site web',
      ar: 'رسائل الاتصال المستلمة عبر نموذج الاتصال بالموقع'
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
        position: 'sidebar',
        readOnly: true,
        description: {
          fr: 'Langue du formulaire soumis (non modifiable)',
          ar: 'لغة النموذج المُرسل (غير قابل للتعديل)'
        }
      }
    },
    {
      name: 'preferredLanguage',
      type: 'select',
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
        position: 'sidebar',
        description: {
          fr: 'Langue préférée pour la réponse',
          ar: 'اللغة المفضلة للرد'
        }
      },
      hooks: {
        beforeChange: [
          ({ data, originalDoc }) => {
            // Set preferredLanguage to locale if not already set
            if (data && !data.preferredLanguage && (data.locale || originalDoc?.locale)) {
              data.preferredLanguage = data.locale || originalDoc?.locale
            }
            return data
          }
        ]
      }
    },
    // User-submitted data (read-only)
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        fr: 'Nom du contact',
        ar: 'اسم المتصل'
      },
      admin: {
        readOnly: true,
        description: {
          fr: 'Nom fourni par l\'utilisateur (non modifiable)',
          ar: 'الاسم المقدم من المستخدم (غير قابل للتعديل)'
        }
      }
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: {
        fr: 'Email du contact',
        ar: 'بريد المتصل الإلكتروني'
      },
      admin: {
        readOnly: true,
        description: {
          fr: 'Email fourni par l\'utilisateur (non modifiable)',
          ar: 'البريد الإلكتروني المقدم من المستخدم (غير قابل للتعديل)'
        }
      }
    },
    {
      name: 'phone',
      type: 'text',
      label: {
        fr: 'Téléphone du contact',
        ar: 'هاتف المتصل'
      },
      admin: {
        readOnly: true,
        description: {
          fr: 'Téléphone fourni par l\'utilisateur (non modifiable)',
          ar: 'الهاتف المقدم من المستخدم (غير قابل للتعديل)'
        }
      }
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: {
        fr: 'Sujet du message',
        ar: 'موضوع الرسالة'
      },
      admin: {
        readOnly: true,
        description: {
          fr: 'Sujet fourni par l\'utilisateur (non modifiable)',
          ar: 'الموضوع المقدم من المستخدم (غير قابل للتعديل)'
        }
      }
    },
    {
      name: 'message',
      type: 'textarea',
      label: {
        fr: 'Message original',
        ar: 'الرسالة الأصلية'
      },
      admin: {
        readOnly: true,
        description: {
          fr: 'Message original envoyé par l\'utilisateur (non modifiable)',
          ar: 'الرسالة الأصلية المرسلة من المستخدم (غير قابل للتعديل)'
        }
      }
    },
    // Admin management fields
    {
      name: 'adminNotes',
      type: 'textarea',
      label: {
        fr: 'Notes administratives',
        ar: 'ملاحظات إدارية'
      },
      admin: {
        description: {
          fr: 'Notes internes pour l\'équipe administrative',
          ar: 'ملاحظات داخلية للفريق الإداري'
        }
      }
    },
    {
      name: 'replySection',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/ContactSubmissions/InlineReplyPanel',
        }
      },
      label: {
        fr: 'Envoyer une réponse',
        ar: 'إرسال رد'
      }
    },
    {
      name: 'replyMessage',
      type: 'textarea',
      label: {
        fr: 'Message de réponse',
        ar: 'رسالة الرد'
      },
      admin: {
        description: {
          fr: 'Réponse à envoyer à l\'utilisateur par email',
          ar: 'الرد المراد إرساله للمستخدم عبر البريد الإلكتروني'
        },
        condition: () => false // Hide this field as it's managed by the custom component
      }
    },
    {
      name: 'emailSent',
      type: 'checkbox',
      label: {
        fr: 'Email de réponse envoyé',
        ar: 'تم إرسال البريد الإلكتروني'
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          fr: 'Indique si une réponse a été envoyée à l\'utilisateur',
          ar: 'يشير إلى ما إذا تم إرسال رد للمستخدم'
        }
      }
    },
    {
      name: 'emailSentAt',
      type: 'date',
      label: {
        fr: 'Date d\'envoi de la réponse',
        ar: 'تاريخ إرسال الرد'
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          fr: 'Date et heure d\'envoi de la réponse',
          ar: 'تاريخ ووقت إرسال الرد'
        }
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