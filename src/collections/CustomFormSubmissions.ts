import type { CollectionConfig } from 'payload'

export const CustomFormSubmissions: CollectionConfig = {
  slug: 'custom-form-submissions',
  labels: {
    singular: {
      fr: 'Soumission de formulaire personnalisé',
      ar: 'إرسال نموذج مخصص'
    },
    plural: {
      fr: 'Soumissions de formulaires personnalisés',
      ar: 'إرسالات النماذج المخصصة'
    }
  },
  admin: {
    group: {
      fr: 'Formulaires',
      ar: 'النماذج'
    },
    useAsTitle: 'formType',
    defaultColumns: ['submissionData', 'formType', 'status', 'createdAt'],
    listSearchableFields: ['submissionData', 'adminNotes'],
    pagination: {
      defaultLimit: 50,
      limits: [25, 50, 100],
    },
    description: {
      fr: 'Toutes les soumissions des formulaires personnalisés. Cliquez sur une soumission pour voir les détails complets.',
      ar: 'جميع إرسالات النماذج المخصصة. انقر على إرسال لرؤية التفاصيل الكاملة.'
    },
  },
  access: {
    create: () => true, // Allow public form submissions
    read: ({ req: { user } }) => {
      // Only authenticated users can read submissions
      if (user) {
        return true
      }
      return false
    },
    update: ({ req: { user } }) => {
      // Only authenticated users can update submissions
      if (user) {
        return true
      }
      return false
    },
    delete: ({ req: { user } }) => {
      // Only authenticated users can delete submissions
      if (user) {
        return true
      }
      return false
    },
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      label: {
        fr: 'Type de formulaire',
        ar: 'نوع النموذج'
      },
      options: [
        {
          label: {
            fr: 'Contact',
            ar: 'اتصال'
          },
          value: 'contact',
        },
        {
          label: {
            fr: 'Plainte',
            ar: 'شكوى'
          },
          value: 'complaint',
        },
        {
          label: {
            fr: 'Demande de document',
            ar: 'طلب وثيقة'
          },
          value: 'document-request',
        },
      ],
      required: true,
      admin: {
        description: {
          fr: 'Type de formulaire soumis par l\'utilisateur',
          ar: 'نوع النموذج المرسل من المستخدم'
        }
      },
    },
    {
      name: 'submissionData',
      type: 'json', 
      label: {
        fr: 'Données de soumission',
        ar: 'بيانات الإرسال'
      },
      required: true,
      admin: {
        components: {
          Field: '@/components/CustomForms/DetailedSubmissionView/index.tsx#DetailedSubmissionView',
          Cell: '@/components/CustomForms/SubmissionListCell/index.tsx#SubmissionListCell',
        },
        description: {
          fr: 'Toutes les données soumises par l\'utilisateur au format JSON',
          ar: 'جميع البيانات المرسلة من المستخدم بصيغة JSON'
        }
      },
    },
    {
      name: 'status',
      type: 'select',
      label: {
        fr: 'Statut',
        ar: 'الحالة'
      },
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
            fr: 'Consulté',
            ar: 'مطالع'
          },
          value: 'reviewed',
        },
        {
          label: {
            fr: 'En cours de traitement',
            ar: 'قيد المعالجة'
          },
          value: 'in-progress',
        },
        {
          label: {
            fr: 'Répondu',
            ar: 'تم الرد'
          },
          value: 'responded',
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
      required: true,
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Statut de traitement de la soumission',
          ar: 'حالة معالجة الإرسال'
        }
      },
    },
    {
      name: 'locale',
      type: 'select',
      label: {
        fr: 'Langue',
        ar: 'اللغة'
      },
      options: [
        {
          label: 'Français',
          value: 'fr',
        },
        {
          label: 'العربية',
          value: 'ar',
        },
      ],
      required: true,
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Langue utilisée pour soumettre le formulaire',
          ar: 'اللغة المستخدمة لإرسال النموذج'
        }
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      label: {
        fr: 'Navigateur',
        ar: 'المتصفح'  
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          fr: 'Informations sur le navigateur de l\'utilisateur',
          ar: 'معلومات متصفح المستخدم'
        }
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: {
        fr: 'Adresse IP',
        ar: 'عنوان IP'
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          fr: 'Adresse IP de l\'utilisateur (pour la sécurité)',
          ar: 'عنوان IP للمستخدم (للأمان)'
        }
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: {
        fr: 'Notes administratives',
        ar: 'ملاحظات إدارية'
      },
      admin: {
        description: {
          fr: 'Notes internes sur cette soumission (actions prises, réponses envoyées, etc.)',
          ar: 'ملاحظات داخلية حول هذا الإرسال (الإجراءات المتخذة، الردود المرسلة، إلخ)'
        },
        rows: 4,
        position: 'sidebar',
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      label: {
        fr: 'Traité par',
        ar: 'تمت معالجته بواسطة'
      },
      admin: {
        description: {
          fr: 'Administrateur qui a traité cette soumission',
          ar: 'المدير الذي عالج هذا الإرسال'
        },
        position: 'sidebar',
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: {
        fr: 'Date de traitement',
        ar: 'تاريخ المعالجة'
      },
      admin: {
        description: {
          fr: 'Date et heure de traitement de la soumission',
          ar: 'تاريخ ووقت معالجة الإرسال'
        },
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Automatically set reviewedBy and reviewedAt when status changes
        if (data.status && data.status !== 'new' && req.user) {
          data.reviewedBy = req.user.id
          data.reviewedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  timestamps: true,
}