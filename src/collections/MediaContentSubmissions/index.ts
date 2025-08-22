import type { CollectionConfig } from "payload";
import { logger } from "@/utilities/logger";
import { isAdmin } from '../../access/isAdmin'
import { isAdminOrModerator } from '../../access/isAdminOrModerator'
import { canManageSubmissions } from '../../access/canManageSubmissions'
// Cleanup hook removed - using unified media collection

export const MediaContentSubmissions: CollectionConfig = {
  slug: "media-content-submissions",
  labels: {
    singular: {
      en: "Media Content Submission",
      fr: "Soumission de Contenu Médiatique",
      ar: "إرسال محتوى إعلامي",
    },
    plural: {
      en: "Media Content Submissions",
      fr: "Soumissions de Contenu Médiatique",
      ar: "إرسالات المحتوى الإعلامي",
    },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "submissionStatus",
      "priority",
      "formType",
      "submittedAt",
      "contentInfo.mediaType",
      "locale",
    ],
    listSearchableFields: [
      "title",
      "contentInfo.programName",
      "description",
      "complainantInfo.fullName",
      "complainantInfo.emailAddress",
      "contentInfo.specificChannel",
    ],
    hidden: ({ user }) => user?.role === 'editor',
    group: {
      fr: "Formulaires et Soumissions",
      ar: "النماذج والإرسالات",
    },
    description: {
      fr: "Gérer les signalements et plaintes de contenu médiatique soumis via les formulaires du site. Visualiser les fichiers médias, suivre le statut et gérer les soumissions.",
      ar: "إدارة التبليغات والشكاوى الخاصة بالمحتوى الإعلامي المرسلة عبر نماذج الموقع. عرض الملفات الإعلامية وتتبع الحالة وإدارة الطلبات.",
    },
    // Dashboard now accessible via sidebar navigation
    // Note: preview function removed to fix URL encoding issues with emojis
    // Admin display handled by useAsTitle field with auto-generated clean titles
  },
  access: {
    read: canManageSubmissions, // Admin sees all, moderator sees based on priority
    create: () => true, // Allow API submissions from public forms
    update: isAdminOrModerator, // Admin and moderator can update
    delete: isAdmin, // Only admin can delete
  },
  fields: [
    // Auto-generated title for admin display
    {
      name: "title",
      type: "text",
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data) {
              const formTypeLabel =
                data.formType === "report" ? "Signalement" : "Plainte";
              const programName =
                data.contentInfo?.programName ||
                data.programName ||
                "Sans titre";
              const mediaType =
                data.contentInfo?.mediaType || data.mediaType || "";

              // Enhanced safe date handling
              let dateDisplay = "Date inconnue";
              try {
                // Try multiple date sources and formats
                const dateValue =
                  data.submittedAt ||
                  data.createdAt ||
                  new Date().toISOString();

                if (dateValue) {
                  const submittedDate = new Date(dateValue);

                  // Additional validation for valid date
                  if (
                    !isNaN(submittedDate.getTime()) &&
                    submittedDate > new Date("2000-01-01")
                  ) {
                    dateDisplay = submittedDate.toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    });
                  } else {
                    // Fallback to current date if provided date is invalid
                    dateDisplay = new Date().toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    });
                  }
                }
              } catch (error) {
                // Use current date as ultimate fallback
                logger.warn("Invalid date in media submission", {
                  component: "MediaContentSubmissions",
                  action: "date_parsing",
                  metadata: {
                    submittedAt: data.submittedAt,
                    error:
                      error instanceof Error ? error.message : String(error),
                  },
                });
                dateDisplay = new Date().toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                });
              }

              const mediaTypeDisplay = mediaType ? ` [${mediaType}]` : "";
              return `${formTypeLabel}${mediaTypeDisplay} - ${programName} (${dateDisplay})`;
            }
            return "Nouvelle soumission";
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
      name: "formType",
      type: "select",
      required: true,
      label: {
        fr: "Type de formulaire",
        ar: "نوع النموذج",
      },
      options: [
        {
          label: {
            fr: "Signalement",
            ar: "تبليغ",
          },
          value: "report",
        },
        {
          label: {
            fr: "Plainte",
            ar: "شكوى",
          },
          value: "complaint",
        },
      ],
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },

    // Submission metadata
    {
      name: "submittedAt",
      type: "date",
      required: true,
      admin: {
        readOnly: true,
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
        components: {
          Field: "@/components/admin/LocalizedDateField/index",
        },
      },
      label: {
        en: "Submitted At",
        fr: "Soumis le",
        ar: "تاريخ الإرسال",
      },
    },

    {
      name: "locale",
      type: "select",
      required: true,
      options: [
        {
          label: "Français",
          value: "fr",
        },
        {
          label: "العربية",
          value: "ar",
        },
      ],
      admin: {
        readOnly: true,
        position: "sidebar",
      },
      label: {
        en: "Language",
        fr: "Langue",
        ar: "اللغة",
      },
    },

    // Submission status for internal tracking
    {
      name: "submissionStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        {
          label: {
            en: "Pending Review",
            fr: "En attente d'examen",
            ar: "في انتظار المراجعة",
          },
          value: "pending",
        },
        {
          label: {
            en: "Under Review",
            fr: "En cours d'examen",
            ar: "قيد المراجعة",
          },
          value: "reviewing",
        },
        {
          label: {
            en: "Resolved",
            fr: "Résolu",
            ar: "محلول",
          },
          value: "resolved",
        },
        {
          label: {
            en: "Dismissed",
            fr: "Rejeté",
            ar: "مرفوض",
          },
          value: "dismissed",
        },
      ],
      admin: {
        position: "sidebar",
      },
      label: {
        en: "Status",
        fr: "Statut",
        ar: "الحالة",
      },
    },

    // Priority level
    {
      name: "priority",
      type: "select",
      defaultValue: "medium",
      options: [
        {
          label: {
            en: "Low",
            fr: "Faible",
            ar: "منخفض",
          },
          value: "low",
        },
        {
          label: {
            en: "Medium",
            fr: "Moyen",
            ar: "متوسط",
          },
          value: "medium",
        },
        {
          label: {
            en: "High",
            fr: "Élevé",
            ar: "عالي",
          },
          value: "high",
        },
        {
          label: {
            en: "Urgent",
            fr: "Urgent",
            ar: "عاجل",
          },
          value: "urgent",
        },
      ],
      admin: {
        position: "sidebar",
      },
      label: {
        en: "Priority",
        fr: "Priorité",
        ar: "الأولوية",
      },
    },

    // Complainant Information (for complaints only)
    {
      name: "complainantInfo",
      type: "group",
      label: {
        en: "Complainant Information",
        fr: "Informations du Plaignant",
        ar: "معلومات الشاكي",
      },
      admin: {
        condition: (data) => data.formType === "complaint",
        description: {
          en: "Contact and identification details of the person filing this complaint",
          fr: "Coordonnées et détails d'identification de la personne déposant cette plainte",
          ar: "بيانات الاتصال والتعريف للشخص الذي يقدم هذه الشكوى",
        },
      },
      fields: [
        {
          name: "fullName",
          type: "text",
          label: {
            en: "Full Name",
            fr: "Nom Complet",
            ar: "الاسم الكامل",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "gender",
          type: "text",
          label: {
            en: "Gender",
            fr: "Genre",
            ar: "الجنس",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "country",
          type: "text",
          label: {
            en: "Country",
            fr: "Pays",
            ar: "البلد",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "emailAddress",
          type: "email",
          label: {
            en: "Email Address",
            fr: "Adresse E-mail",
            ar: "البريد الإلكتروني",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "phoneNumber",
          type: "text",
          label: {
            en: "Phone Number",
            fr: "Numéro de Téléphone",
            ar: "رقم الهاتف",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "whatsappNumber",
          type: "text",
          label: {
            en: "WhatsApp Number",
            fr: "Numéro WhatsApp",
            ar: "رقم الواتساب",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "profession",
          type: "text",
          label: {
            en: "Profession",
            fr: "Profession",
            ar: "المهنة",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "relationshipToContent",
          type: "text",
          label: {
            en: "Relationship to Content",
            fr: "Lien avec le Contenu",
            ar: "صلة بالمحتوى",
          },
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    // Quick overview fields (visible at top level)
    {
      name: "mediaType",
      type: "text",
      label: {
        en: "Media Type",
        fr: "Type de Média",
        ar: "نوع الوسيلة الإعلامية",
      },
      admin: {
        readOnly: true,
        position: "sidebar",
        components: {
          Field: "@/components/admin/MediaTypeField/index",
        },
        description: {
          fr: "Le type de média où le contenu a été trouvé (TV, Radio, Site web, etc.)",
          ar: "نوع الوسائط حيث تم العثور على المحتوى (تلفزيون، راديو، موقع ويب، إلخ)",
        },
      },
    },

    {
      name: "specificChannel",
      type: "text",
      label: {
        en: "Channel/Station",
        fr: "Chaîne/Station",
        ar: "القناة/المحطة",
      },
      admin: {
        readOnly: true,
        position: "sidebar",
        description: {
          en: "Specific TV channel or radio station",
          fr: "Chaîne TV ou station radio spécifique",
          ar: "قناة تلفزيونية أو محطة إذاعية محددة",
        },
      },
    },

    {
      name: "programName",
      type: "text",
      label: {
        en: "Program Name",
        fr: "Nom du Programme",
        ar: "اسم البرنامج",
      },
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },

    // Content Information (detailed group)
    {
      name: "contentInfo",
      type: "group",
      label: {
        en: "Content Information (Full Details)",
        fr: "Informations sur le Contenu (Détails Complets)",
        ar: "معلومات المحتوى (التفاصيل الكاملة)",
      },
      admin: {
        description: {
          en: "Complete details about the media content that was reported or complained about",
          fr: "Détails complets sur le contenu médiatique qui a fait l'objet d'un signalement ou d'une plainte",
          ar: "تفاصيل كاملة عن المحتوى الإعلامي الذي تم الإبلاغ عنه أو تقديم شكوى بشأنه",
        },
      },
      fields: [
        {
          name: "mediaType",
          type: "text",
          label: {
            en: "Media Type",
            fr: "Type de Média",
            ar: "نوع الوسيلة الإعلامية",
          },
          admin: {
            readOnly: true,
            components: {
              Field: "@/components/admin/MediaTypeField/index",
            },
            description: {
              en: "Type of media (TV, Radio, Website, etc.)",
              fr: "Type de média (TV, Radio, Site web, etc.)",
              ar: "نوع الوسائط (تلفزيون، راديو، موقع ويب، إلخ)",
            },
          },
        },
        {
          name: "mediaTypeOther",
          type: "text",
          label: {
            en: "Other Media Type",
            fr: "Autre Type de Média",
            ar: "نوع إعلام آخر",
          },
          admin: {
            readOnly: true,
            condition: (data) => data.contentInfo?.mediaType === "Autre",
          },
        },
        {
          name: "specificChannel",
          type: "text",
          label: {
            en: "TV Channel / Radio Station",
            fr: "Chaîne TV / Station Radio",
            ar: "القناة التلفزيونية / المحطة الإذاعية",
          },
          admin: {
            readOnly: true,
            description: {
              en: "Specific channel or station name",
              fr: "Nom spécifique de la chaîne ou station",
              ar: "اسم القناة أو المحطة المحددة",
            },
          },
        },
        {
          name: "programName",
          type: "text",
          label: {
            en: "Program/Content Name",
            fr: "Nom du Programme/Contenu",
            ar: "اسم البرنامج/المحتوى",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "broadcastDateTime",
          type: "text",
          label: {
            en: "Broadcast Date/Time",
            fr: "Date/Heure de Diffusion",
            ar: "تاريخ/وقت البث",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "linkScreenshot",
          type: "text",
          label: {
            en: "Link/Screenshot",
            fr: "Lien/Capture d'écran",
            ar: "رابط/صورة شاشة",
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: "screenshotFiles",
          type: "array",
          label: {
            fr: "Captures d'écran et Fichiers de Preuve",
            ar: "لقطات الشاشة وملفات الأدلة",
          },
          fields: [
            {
              name: "url",
              type: "text",
              admin: { readOnly: true },
            },
          ],
          admin: {
            readOnly: true,
            description: {
              fr: "Captures d'écran et images fournies comme preuves. Interface épurée sans URLs techniques.",
              ar: "لقطات الشاشة والصور المقدمة كأدلة. واجهة نظيفة بدون عناوين URL تقنية.",
            },
            components: {
              Field: "@/components/admin/EnhancedMediaGallery/index",
            },
          },
        },
      ],
    },

    // Reasons for report/complaint
    {
      name: "reasons",
      type: "array",
      label: {
        fr: "Motifs",
        ar: "الأسباب",
      },
      fields: [
        {
          name: "reason",
          type: "text",
          label: {
            fr: "Motif",
            ar: "السبب",
          },
          admin: {
            readOnly: true,
            components: {
              Field: "@/components/admin/ReasonField/index",
            },
          },
        },
      ],
      admin: {
        readOnly: true,
        components: {
          RowLabel: "@/components/admin/ReasonRowLabel/index",
        },
      },
    },

    {
      name: "reasonOther",
      type: "text",
      label: {
        en: "Other Reason",
        fr: "Autre Motif",
        ar: "سبب آخر",
      },
      admin: {
        readOnly: true,
      },
    },

    // Content description
    {
      name: "description",
      type: "textarea",
      label: {
        en: "Content Description",
        fr: "Description du Contenu",
        ar: "وصف المحتوى",
      },
      admin: {
        readOnly: true,
        rows: 6,
      },
    },

    // Attachments
    {
      name: "attachmentTypes",
      type: "array",
      label: {
        en: "Attachment Types",
        fr: "Types de Pièces Jointes",
        ar: "أنواع المرفقات",
      },
      fields: [
        {
          name: "type",
          type: "text",
          admin: {
            components: {
              Field: "@/components/admin/AttachmentTypeField/index",
            },
          },
        },
      ],
      admin: {
        readOnly: true,
        components: {
          RowLabel: "@/components/admin/AttachmentTypeRowLabel/index",
        },
      },
    },

    {
      name: "attachmentOther",
      type: "text",
      label: {
        en: "Other Attachment",
        fr: "Autre Pièce Jointe",
        ar: "مرفق آخر",
      },
      admin: {
        readOnly: true,
      },
    },

    {
      name: "attachmentFiles",
      type: "array",
      label: {
        fr: "Fichiers de Preuve Supplémentaires",
        ar: "ملفات أدلة إضافية",
      },
      fields: [
        {
          name: "url",
          type: "text",
          admin: { readOnly: true },
        },
      ],
      admin: {
        readOnly: true,
        description: {
          fr: "Fichiers de preuve supplémentaires (vidéos, audio, documents). Interface épurée sans URLs techniques.",
          ar: "ملفات أدلة إضافية (فيديو، صوت، مستندات). واجهة نظيفة بدون عناوين URL تقنية.",
        },
        components: {
          Field: "@/components/admin/EnhancedMediaGallery/index",
        },
      },
    },

    // Moderator notes (visible to both moderator and admin)
    {
      name: "moderatorNotes",
      type: "textarea",
      label: {
        fr: "Notes du Modérateur",
        ar: "ملاحظات المشرف",
      },
      admin: {
        description: {
          fr: "Notes du modérateur pour examen par l'administrateur",
          ar: "ملاحظات من المشرف لمراجعة المسؤول",
        },
        rows: 4,
        condition: ({ user }) => Boolean(user && ['admin', 'moderator'].includes(user?.role)),
      },
    },

    // Admin-only internal notes
    {
      name: "internalNotes",
      type: "textarea",
      label: {
        fr: "Notes Internes Admin",
        ar: "ملاحظات الإدارة الداخلية",
      },
      admin: {
        description: {
          fr: "Notes internes réservées aux administrateurs (non visibles par les modérateurs)",
          ar: "ملاحظات داخلية للمسؤول فقط (غير مرئية للمشرفين)",
        },
        rows: 4,
      },
      access: {
        read: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
        update: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
      },
    },

    // Audit trail - who reviewed this submission
    {
      name: "reviewedBy",
      type: "relationship",
      relationTo: "users",
      label: {
        fr: "Examiné par",
        ar: "تمت المراجعة بواسطة",
      },
      admin: {
        readOnly: true,
        position: "sidebar",
      },
      access: {
        read: ({ req: { user } }) => Boolean(user && ['admin', 'moderator'].includes(user?.role)),
        update: () => false, // Set automatically via hooks
      },
    },

    {
      name: "reviewedAt",
      type: "date",
      label: {
        fr: "Examiné le",
        ar: "تاريخ المراجعة",
      },
      admin: {
        readOnly: true,
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
      access: {
        read: ({ req: { user } }) => Boolean(user && ['admin', 'moderator'].includes(user?.role)),
        update: () => false, // Set automatically via hooks
      },
    },

    // Admin notes (kept for backward compatibility but renamed label)
    {
      name: "adminNotes",
      type: "textarea",
      label: {
        fr: "Notes Générales",
        ar: "ملاحظات عامة",
      },
      admin: {
        description: {
          fr: "Notes générales visibles par tous les utilisateurs autorisés",
          ar: "ملاحظات عامة مرئية لجميع المستخدمين المصرح لهم",
        },
        rows: 4,
      },
    },

    // Response/resolution details
    {
      name: "resolution",
      type: "group",
      label: {
        en: "Resolution Details",
        fr: "Détails de la Résolution",
        ar: "تفاصيل الحل",
      },
      admin: {
        condition: (data) =>
          ["resolved", "dismissed"].includes(data.submissionStatus),
      },
      fields: [
        {
          name: "resolvedAt",
          type: "date",
          label: {
            en: "Resolved At",
            fr: "Résolu le",
            ar: "تاريخ الحل",
          },
          admin: {
            date: {
              pickerAppearance: "dayAndTime",
            },
          },
        },
        {
          name: "resolvedBy",
          type: "text",
          label: {
            en: "Resolved By",
            fr: "Résolu par",
            ar: "تم الحل بواسطة",
          },
        },
        {
          name: "resolutionNotes",
          type: "textarea",
          label: {
            en: "Resolution Notes",
            fr: "Notes de Résolution",
            ar: "ملاحظات الحل",
          },
          admin: {
            rows: 4,
          },
        },
        {
          name: "actionTaken",
          type: "textarea",
          label: {
            en: "Action Taken",
            fr: "Action Entreprise",
            ar: "الإجراء المتخذ",
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
      ({ data, operation, req, originalDoc }) => {
        if (operation === "create") {
          // Set submission timestamp
          if (!data.submittedAt) {
            data.submittedAt = new Date().toISOString();
          }

          // Auto-set priority based on reasons
          if (data.reasons && Array.isArray(data.reasons)) {
            const urgentReasons = ["hateSpeech", "fakeNews", "misinformation"];
            const hasUrgentReason = data.reasons.some(
              (reasonObj: { reason: string }) =>
                urgentReasons.includes(reasonObj.reason)
            );
            if (hasUrgentReason) {
              data.priority = "high";
            }
          }
        }

        // Audit trail: Track who reviewed the submission
        if (operation === "update" && req.user) {
          // Check if status changed
          if (originalDoc && data.submissionStatus !== originalDoc.submissionStatus) {
            data.reviewedBy = req.user.id;
            data.reviewedAt = new Date().toISOString();
            
            // Log status change
            logger.info('Submission status changed', {
              component: 'MediaContentSubmissions',
              action: 'status_change',
              metadata: {
                submissionId: originalDoc.id,
                oldStatus: originalDoc.submissionStatus,
                newStatus: data.submissionStatus,
                reviewedBy: req.user.email,
                userRole: req.user.role
              }
            });
          }
        }

        // Update resolution timestamp when status changes to resolved/dismissed
        if (["resolved", "dismissed"].includes(data.submissionStatus)) {
          if (!data.resolution?.resolvedAt) {
            data.resolution = {
              ...data.resolution,
              resolvedAt: new Date().toISOString(),
              resolvedBy: req.user?.email || 'System',
            };
          }
        }

        return data;
      },
    ],
    // beforeDelete: [cleanupFormMediaHook], // Disabled - FormMedia collection removed
  },
};
