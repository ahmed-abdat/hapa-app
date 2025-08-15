import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { ALLOWED_MIME_TYPES } from '../lib/constants'
import { deleteFormMediaFromR2 } from './FormMedia/hooks/deleteFromR2'

/**
 * Form Media Collection
 * 
 * Dedicated collection for media files uploaded through form submissions.
 * This collection is completely separate from the main Media collection
 * to prevent form submission files from appearing in admin media selection.
 */
export const FormMedia: CollectionConfig = {
  slug: 'form-media',
  labels: {
    singular: {
      fr: 'Média de Formulaire',
      ar: 'وسائط النموذج'
    },
    plural: {
      fr: 'Médias de Formulaires',
      ar: 'وسائط النماذج'
    }
  },
  admin: {
    group: {
      fr: 'Formulaires et Soumissions',
      ar: 'النماذج والإرسالات'
    },
    description: {
      fr: 'Fichiers téléchargés via les formulaires de soumission. Ces fichiers ne sont pas disponibles pour la sélection dans les autres contenus.',
      ar: 'الملفات المرفوعة عبر نماذج الإرسال. هذه الملفات غير متاحة للاختيار في المحتويات الأخرى.'
    },
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'formType', 'submissionDate'],
    listSearchableFields: ['filename', 'alt', 'formType', 'submissionId'],
    // Hide from global search to prevent accidental selection
    hidden: ({ user }) => !user, // Only visible to authenticated users
  },
  access: {
    // Form submissions can create (via API)
    create: () => true,
    // Only authenticated users can read
    read: authenticated, 
    // Only authenticated users can update/delete
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeChange: [
      // R2 folder organization for form media with dedicated prefix
      ({ data, req }) => {
        if (req.file?.name) {
          // Get file extension to determine folder type
          const extension = req.file.name.split('.').pop()?.toLowerCase()
          let folder = 'forms/misc'
          
          // Categorize form media files with dedicated forms/ prefix
          if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(extension || '')) {
            folder = 'forms/images'
          } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
            folder = 'forms/documents'
          } else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension || '')) {
            folder = 'forms/videos'
          } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) {
            folder = 'forms/audio'
          }
          
          // Set prefix for R2 storage organization
          data.prefix = folder
        }
        return data
      }
    ],
    beforeDelete: [deleteFormMediaFromR2],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: {
        fr: 'Texte alternatif',
        ar: 'نص بديل'
      },
      admin: {
        description: {
          fr: 'Description du fichier pour l\'accessibilité',
          ar: 'وصف الملف لإمكانية الوصول'
        }
      }
    },
    {
      name: 'caption',
      type: 'richText',
      label: {
        fr: 'Légende',
        ar: 'التسمية التوضيحية'
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    // Form-specific metadata fields
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
            fr: 'Signalement',
            ar: 'تبليغ',
          },
          value: 'report',
        },
        {
          label: {
            fr: 'Plainte',
            ar: 'شكوى',
          },
          value: 'complaint',
        },
      ],
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Type de formulaire d\'origine',
          ar: 'نوع النموذج الأصلي'
        }
      },
    },
    {
      name: 'fileType',
      type: 'select',
      label: {
        fr: 'Type de fichier',
        ar: 'نوع الملف'
      },
      options: [
        {
          label: {
            fr: 'Capture d\'écran',
            ar: 'لقطة شاشة',
          },
          value: 'screenshot',
        },
        {
          label: {
            fr: 'Pièce jointe',
            ar: 'مرفق',
          },
          value: 'attachment',
        },
      ],
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Catégorie du fichier uploadé',
          ar: 'فئة الملف المرفوع'
        }
      },
    },
    {
      name: 'submissionId',
      type: 'text',
      label: {
        fr: 'ID de soumission',
        ar: 'معرف الإرسال'
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          fr: 'Identifiant de la soumission de formulaire associée',
          ar: 'معرف إرسال النموذج المرتبط'
        }
      },
    },
    {
      name: 'uploadStatus',
      type: 'select',
      label: {
        fr: 'Statut du téléchargement',
        ar: 'حالة الرفع'
      },
      defaultValue: 'staging',
      options: [
        {
          label: {
            fr: 'En attente',
            ar: 'قيد الانتظار',
          },
          value: 'staging',
        },
        {
          label: {
            fr: 'Confirmé',
            ar: 'مؤكد',
          },
          value: 'confirmed',
        },
        {
          label: {
            fr: 'Orphelin',
            ar: 'يتيم',
          },
          value: 'orphaned',
        },
      ],
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Statut du fichier dans le processus de soumission',
          ar: 'حالة الملف في عملية الإرسال'
        }
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: {
        fr: 'Date d\'expiration',
        ar: 'تاريخ انتهاء الصلاحية'
      },
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          fr: 'Date après laquelle le fichier sera automatiquement supprimé s\'il n\'est pas confirmé',
          ar: 'التاريخ الذي سيتم بعده حذف الملف تلقائيًا إذا لم يتم تأكيده'
        }
      },
    },
    {
      name: 'submissionDate',
      type: 'date',
      label: {
        fr: 'Date de soumission',
        ar: 'تاريخ الإرسال'
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          fr: 'Date et heure de téléchargement du fichier',
          ar: 'تاريخ ووقت رفع الملف'
        }
      },
    },
  ],
  upload: {
    // Store form media files in R2 cloud storage with dedicated forms/ prefix
    adminThumbnail: ({ doc }: { doc: Record<string, unknown> }) => {
      return typeof doc.url === 'string' ? doc.url : null
    },
    focalPoint: true,
    disableLocalStorage: true, // Force R2 storage only
    // No pre-generated sizes to save storage costs
    imageSizes: [],
    // File size and type restrictions for form uploads
    // Uses centralized ALLOWED_MIME_TYPES from constants.ts for consistency
    mimeTypes: [...ALLOWED_MIME_TYPES],
  },
}