import type { CollectionConfig } from 'payload'

export const MediaContentSubmissions: CollectionConfig = {
  slug: 'media-content-submissions',
  labels: {
    singular: {
      en: 'Media Content Submission',
      fr: 'Soumission de Contenu Médiatique',
      ar: 'إرسال محتوى إعلامي',
    },
    plural: {
      en: 'Media Content Submissions',
      fr: 'Soumissions de Contenu Médiatique',
      ar: 'إرسالات المحتوى الإعلامي',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'formType', 'submissionStatus', 'submittedAt', 'locale'],
    group: {
      en: 'Forms & Submissions',
      fr: 'Formulaires et Soumissions',
      ar: 'النماذج والإرسالات',
    },
    description: {
      en: 'Manage media content reports and complaints submitted through the website forms',
      fr: 'Gérer les signalements et plaintes de contenu médiatique soumis via les formulaires du site',
      ar: 'إدارة التبليغات والشكاوى الخاصة بالمحتوى الإعلامي المرسلة عبر نماذج الموقع',
    },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // Allow API submissions
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Auto-generated title for admin display
    {
      name: 'title',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data) {
              const formTypeLabel = data.formType === 'report' ? 'Signalement' : 'Plainte'
              const programName = data.programName || 'Sans titre'
              const date = new Date(data.submittedAt).toLocaleDateString('fr-FR')
              return `${formTypeLabel} - ${programName} (${date})`
            }
            return 'Nouvelle soumission'
          },
        ],
      },
      admin: {
        readOnly: true,
        hidden: true, // Hide from admin form but use for title
      },
    },

    // Form identification
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        {
          label: {
            en: 'Report',
            fr: 'Signalement',
            ar: 'تبليغ',
          },
          value: 'report',
        },
        {
          label: {
            en: 'Complaint',
            fr: 'Plainte',
            ar: 'شكوى',
          },
          value: 'complaint',
        },
      ],
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    // Submission metadata
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      label: {
        en: 'Submitted At',
        fr: 'Soumis le',
        ar: 'تاريخ الإرسال',
      },
    },

    {
      name: 'locale',
      type: 'select',
      required: true,
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
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      label: {
        en: 'Language',
        fr: 'Langue',
        ar: 'اللغة',
      },
    },

    // Submission status for internal tracking
    {
      name: 'submissionStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: {
            en: 'Pending Review',
            fr: 'En attente d\'examen',
            ar: 'في انتظار المراجعة',
          },
          value: 'pending',
        },
        {
          label: {
            en: 'Under Review',
            fr: 'En cours d\'examen',
            ar: 'قيد المراجعة',
          },
          value: 'reviewing',
        },
        {
          label: {
            en: 'Resolved',
            fr: 'Résolu',
            ar: 'محلول',
          },
          value: 'resolved',
        },
        {
          label: {
            en: 'Dismissed',
            fr: 'Rejeté',
            ar: 'مرفوض',
          },
          value: 'dismissed',
        },
      ],
      admin: {
        position: 'sidebar',
      },
      label: {
        en: 'Status',
        fr: 'Statut',
        ar: 'الحالة',
      },
    },

    // Priority level
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        {
          label: {
            en: 'Low',
            fr: 'Faible',
            ar: 'منخفض',
          },
          value: 'low',
        },
        {
          label: {
            en: 'Medium',
            fr: 'Moyen',
            ar: 'متوسط',
          },
          value: 'medium',
        },
        {
          label: {
            en: 'High',
            fr: 'Élevé',
            ar: 'عالي',
          },
          value: 'high',
        },
        {
          label: {
            en: 'Urgent',
            fr: 'Urgent',
            ar: 'عاجل',
          },
          value: 'urgent',
        },
      ],
      admin: {
        position: 'sidebar',
      },
      label: {
        en: 'Priority',
        fr: 'Priorité',
        ar: 'الأولوية',
      },
    },

    // Complainant Information (for complaints only)
    {
      name: 'complainantInfo',
      type: 'group',
      label: {
        en: 'Complainant Information',
        fr: 'Informations du Plaignant',
        ar: 'معلومات الشاكي',
      },
      admin: {
        condition: (data) => data.formType === 'complaint',
      },
      fields: [
        {
          name: 'fullName',
          type: 'text',
          label: {
            en: 'Full Name',
            fr: 'Nom Complet',
            ar: 'الاسم الكامل',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'emailAddress',
          type: 'email',
          label: {
            en: 'Email Address',
            fr: 'Adresse E-mail',
            ar: 'البريد الإلكتروني',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'phoneNumber',
          type: 'text',
          label: {
            en: 'Phone Number',
            fr: 'Numéro de Téléphone',
            ar: 'رقم الهاتف',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'whatsappNumber',
          type: 'text',
          label: {
            en: 'WhatsApp Number',
            fr: 'Numéro WhatsApp',
            ar: 'رقم الواتساب',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'profession',
          type: 'text',
          label: {
            en: 'Profession',
            fr: 'Profession',
            ar: 'المهنة',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'relationshipToContent',
          type: 'text',
          label: {
            en: 'Relationship to Content',
            fr: 'Lien avec le Contenu',
            ar: 'صلة بالمحتوى',
          },
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    // Content Information
    {
      name: 'contentInfo',
      type: 'group',
      label: {
        en: 'Content Information',
        fr: 'Informations sur le Contenu',
        ar: 'معلومات المحتوى',
      },
      fields: [
        {
          name: 'mediaType',
          type: 'text',
          label: {
            en: 'Media Type',
            fr: 'Type de Média',
            ar: 'نوع الوسيلة الإعلامية',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'mediaTypeOther',
          type: 'text',
          label: {
            en: 'Other Media Type',
            fr: 'Autre Type de Média',
            ar: 'نوع إعلام آخر',
          },
          admin: {
            readOnly: true,
            condition: (data) => data.contentInfo?.mediaType === 'other',
          },
        },
        {
          name: 'programName',
          type: 'text',
          label: {
            en: 'Program/Content Name',
            fr: 'Nom du Programme/Contenu',
            ar: 'اسم البرنامج/المحتوى',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'broadcastDateTime',
          type: 'text',
          label: {
            en: 'Broadcast Date/Time',
            fr: 'Date/Heure de Diffusion',
            ar: 'تاريخ/وقت البث',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'linkScreenshot',
          type: 'text',
          label: {
            en: 'Link/Screenshot',
            fr: 'Lien/Capture d\'écran',
            ar: 'رابط/صورة شاشة',
          },
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    // Reasons for report/complaint
    {
      name: 'reasons',
      type: 'array',
      label: {
        en: 'Reasons',
        fr: 'Motifs',
        ar: 'الأسباب',
      },
      fields: [
        {
          name: 'reason',
          type: 'text',
        },
      ],
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'reasonOther',
      type: 'text',
      label: {
        en: 'Other Reason',
        fr: 'Autre Motif',
        ar: 'سبب آخر',
      },
      admin: {
        readOnly: true,
      },
    },

    // Content description
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Content Description',
        fr: 'Description du Contenu',
        ar: 'وصف المحتوى',
      },
      admin: {
        readOnly: true,
        rows: 6,
      },
    },

    // Attachments
    {
      name: 'attachmentTypes',
      type: 'array',
      label: {
        en: 'Attachment Types',
        fr: 'Types de Pièces Jointes',
        ar: 'أنواع المرفقات',
      },
      fields: [
        {
          name: 'type',
          type: 'text',
        },
      ],
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'attachmentOther',
      type: 'text',
      label: {
        en: 'Other Attachment',
        fr: 'Autre Pièce Jointe',
        ar: 'مرفق آخر',
      },
      admin: {
        readOnly: true,
      },
    },

    // Admin notes and actions
    {
      name: 'adminNotes',
      type: 'textarea',
      label: {
        en: 'Admin Notes',
        fr: 'Notes Admin',
        ar: 'ملاحظات الإدارة',
      },
      admin: {
        description: {
          en: 'Internal notes for tracking and follow-up',
          fr: 'Notes internes pour le suivi et le follow-up',
          ar: 'ملاحظات داخلية للمتابعة والتطوير',
        },
        rows: 4,
      },
    },

    // Response/resolution details
    {
      name: 'resolution',
      type: 'group',
      label: {
        en: 'Resolution Details',
        fr: 'Détails de la Résolution',
        ar: 'تفاصيل الحل',
      },
      admin: {
        condition: (data) => ['resolved', 'dismissed'].includes(data.submissionStatus),
      },
      fields: [
        {
          name: 'resolvedAt',
          type: 'date',
          label: {
            en: 'Resolved At',
            fr: 'Résolu le',
            ar: 'تاريخ الحل',
          },
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'resolvedBy',
          type: 'text',
          label: {
            en: 'Resolved By',
            fr: 'Résolu par',
            ar: 'تم الحل بواسطة',
          },
        },
        {
          name: 'resolutionNotes',
          type: 'textarea',
          label: {
            en: 'Resolution Notes',
            fr: 'Notes de Résolution',
            ar: 'ملاحظات الحل',
          },
          admin: {
            rows: 4,
          },
        },
        {
          name: 'actionTaken',
          type: 'textarea',
          label: {
            en: 'Action Taken',
            fr: 'Action Entreprise',
            ar: 'الإجراء المتخذ',
          },
          admin: {
            rows: 3,
          },
        },
      ],
    },

  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          // Set submission timestamp
          if (!data.submittedAt) {
            data.submittedAt = new Date().toISOString()
          }
          
          // Auto-set priority based on reasons
          if (data.reasons && Array.isArray(data.reasons)) {
            const urgentReasons = ['Discours de haine / Incitation à la violence', 'Désinformation / Informations mensongères', 'Désinformation / Fake news']
            const hasUrgentReason = data.reasons.some((reasonObj: any) => 
              urgentReasons.includes(reasonObj.reason)
            )
            if (hasUrgentReason) {
              data.priority = 'high'
            }
          }
        }
        
        // Update resolution timestamp when status changes to resolved/dismissed
        if (['resolved', 'dismissed'].includes(data.submissionStatus)) {
          if (!data.resolution?.resolvedAt) {
            data.resolution = {
              ...data.resolution,
              resolvedAt: new Date().toISOString(),
            }
          }
        }

        return data
      },
    ],
  },
}