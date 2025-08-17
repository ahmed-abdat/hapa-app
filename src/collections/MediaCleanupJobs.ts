import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

/**
 * Media Cleanup Jobs Collection
 * 
 * Tracks cleanup operations for orphaned media files in R2 storage.
 * Provides audit trail and allows manual or scheduled cleanup operations.
 */
export const MediaCleanupJobs: CollectionConfig = {
  slug: 'media-cleanup-jobs',
  labels: {
    singular: {
      fr: "Tâche de Nettoyage Média",
      ar: "مهمة تنظيف الوسائط",
    },
    plural: {
      fr: "Tâches de Nettoyage Média",
      ar: "مهام تنظيف الوسائط",
    },
  },
  
  admin: {
    group: {
      fr: "Système",
      ar: "النظام",
    },
    defaultColumns: ['jobType', 'status', 'filesProcessed', 'filesDeleted', 'executedAt'],
    listSearchableFields: ['jobType', 'status'],
    description: {
      fr: "Suivre et gérer les opérations de nettoyage des fichiers média orphelins",
      ar: "تتبع وإدارة عمليات تنظيف ملفات الوسائط اليتيمة",
    },
    meta: {
      titleSuffix: " – Media Cleanup Jobs",
      description: "Manage automated cleanup of orphaned media files",
    },
    components: {
      views: {
        list: {
          Component: '@/components/admin/MediaCleanupDashboard/index.tsx',
        },
      },
    },
  },
  
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  
  fields: [
    {
      name: 'jobType',
      type: 'select',
      required: true,
      options: [
        {
          label: {
            fr: "Scan de Vérification",
            ar: "فحص التحقق",
          },
          value: 'verification',
        },
        {
          label: {
            fr: "Nettoyage des Fichiers Orphelins",
            ar: "تنظيف الملفات اليتيمة",
          },
          value: 'cleanup',
        },
        {
          label: {
            fr: "Audit Complet",
            ar: "مراجعة شاملة",
          },
          value: 'audit',
        },
      ],
      admin: {
        description: {
          fr: "Type d'opération de nettoyage effectuée",
          ar: "نوع عملية التنظيف المنفذة",
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: {
            fr: "En Attente",
            ar: "في الانتظار",
          },
          value: 'pending',
        },
        {
          label: {
            fr: "En Cours",
            ar: "قيد التشغيل",
          },
          value: 'running',
        },
        {
          label: {
            fr: "Terminé",
            ar: "مكتمل",
          },
          value: 'completed',
        },
        {
          label: {
            fr: "Échoué",
            ar: "فشل",
          },
          value: 'failed',
        },
        {
          label: {
            fr: "Partiellement Terminé",
            ar: "مكتمل جزئياً",
          },
          value: 'partial',
        },
      ],
    },
    {
      name: 'executedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          fr: "Quand la tâche a été démarrée",
          ar: "وقت بدء المهمة",
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          fr: "Quand la tâche a été terminée",
          ar: "وقت انتهاء المهمة",
        },
      },
    },
    {
      name: 'metrics',
      type: 'group',
      fields: [
        {
          name: 'filesScanned',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              fr: "Nombre total de fichiers scannés dans R2",
              ar: "العدد الإجمالي للملفات المفحوصة في R2",
            },
          },
        },
        {
          name: 'filesProcessed',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              fr: "Nombre de fichiers traités",
              ar: "عدد الملفات المعالجة",
            },
          },
        },
        {
          name: 'orphanedFilesFound',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              fr: "Nombre de fichiers orphelins identifiés",
              ar: "عدد الملفات اليتيمة المحددة",
            },
          },
        },
        {
          name: 'filesDeleted',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              fr: "Nombre de fichiers supprimés avec succès",
              ar: "عدد الملفات المحذوفة بنجاح",
            },
          },
        },
        {
          name: 'deletionErrors',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              fr: "Nombre de fichiers qui ont échoué à la suppression",
              ar: "عدد الملفات التي فشل حذفها",
            },
          },
        },
        {
          name: 'storageReclaimed',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              fr: "Espace de stockage récupéré en octets",
              ar: "مساحة التخزين المستردة بالبايت",
            },
          },
        },
      ],
    },
    {
      name: 'orphanedFiles',
      type: 'array',
      admin: {
        description: {
          fr: "Liste des fichiers orphelins trouvés pendant le scan",
          ar: "قائمة الملفات اليتيمة الموجودة أثناء الفحص",
        },
      },
      fields: [
        {
          name: 'filename',
          type: 'text',
          required: true,
        },
        {
          name: 'path',
          type: 'text',
          required: true,
        },
        {
          name: 'size',
          type: 'number',
          min: 0,
        },
        {
          name: 'lastModified',
          type: 'date',
        },
        {
          name: 'status',
          type: 'select',
          options: [
            {
              label: {
                fr: "Trouvé",
                ar: "موجود",
              },
              value: 'found',
            },
            {
              label: {
                fr: "Supprimé",
                ar: "محذوف",
              },
              value: 'deleted',
            },
            {
              label: {
                fr: "Suppression Échouée",
                ar: "فشل الحذف",
              },
              value: 'failed',
            },
            {
              label: {
                fr: "Ignoré",
                ar: "تم تخطيه",
              },
              value: 'skipped',
            },
          ],
          defaultValue: 'found',
        },
        {
          name: 'error',
          type: 'text',
          admin: {
            description: {
              fr: "Message d'erreur si la suppression a échoué",
              ar: "رسالة الخطأ في حالة فشل الحذف",
            },
          },
        },
      ],
    },
    {
      name: 'configuration',
      type: 'group',
      fields: [
        {
          name: 'dryRun',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: {
              fr: "Si vrai, scanne et rapporte seulement sans supprimer",
              ar: "إذا كان صحيحاً، يفحص ويبلغ فقط دون حذف",
            },
          },
        },
        {
          name: 'includeDirectories',
          type: 'array',
          fields: [
            {
              name: 'path',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: {
              fr: "Répertoires R2 à scanner (par défaut: forms/)",
              ar: "مجلدات R2 للفحص (افتراضي: forms/)",
            },
          },
        },
        {
          name: 'excludePatterns',
          type: 'array',
          fields: [
            {
              name: 'pattern',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: {
              fr: "Motifs de fichiers à exclure du nettoyage",
              ar: "أنماط الملفات المستبعدة من التنظيف",
            },
          },
        },
        {
          name: 'maxFilesToProcess',
          type: 'number',
          min: 1,
          defaultValue: 1000,
          admin: {
            description: {
              fr: "Maximum de fichiers à traiter dans une tâche",
              ar: "الحد الأقصى للملفات المعالجة في مهمة واحدة",
            },
          },
        },
        {
          name: 'retentionDays',
          type: 'number',
          min: 0,
          defaultValue: 30,
          admin: {
            description: {
              fr: "Garder les fichiers plus récents que ce nombre de jours",
              ar: "الاحتفاظ بالملفات الأحدث من هذا العدد من الأيام",
            },
          },
        },
      ],
    },
    {
      name: 'executionLog',
      type: 'textarea',
      admin: {
        description: {
          fr: "Journal détaillé de l'opération de nettoyage",
          ar: "سجل مفصل لعملية التنظيف",
        },
        readOnly: true,
      },
    },
    {
      name: 'errorLog',
      type: 'textarea',
      admin: {
        description: {
          fr: "Messages d'erreur rencontrés pendant l'exécution",
          ar: "رسائل الخطأ المواجهة أثناء التنفيذ",
        },
        readOnly: true,
      },
    },
    {
      name: 'triggeredBy',
      type: 'select',
      options: [
        {
          label: {
            fr: "Manuel",
            ar: "يدوي",
          },
          value: 'manual',
        },
        {
          label: {
            fr: "Programmé",
            ar: "مجدول",
          },
          value: 'scheduled',
        },
        {
          label: {
            fr: "API",
            ar: "واجهة برمجة التطبيقات",
          },
          value: 'api',
        },
      ],
      defaultValue: 'manual',
    },
    {
      name: 'executedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: {
          fr: "Utilisateur qui a déclenché la tâche (pour les tâches manuelles)",
          ar: "المستخدم الذي أطلق المهمة (للمهام اليدوية)",
        },
      },
    },
  ],
  
  timestamps: true,
}