import type { Block } from 'payload'

export const PartnersSection: Block = {
  slug: 'partnersSection',
  interfaceName: 'PartnersSectionBlock',
  labels: {
    singular: {
      en: 'Partners & Trust Block',
      fr: 'Bloc Partenaires et Confiance',
      ar: 'قسم الشركاء والثقة',
    },
    plural: {
      en: 'Partners & Trust Blocks',
      fr: 'Blocs Partenaires et Confiance',
      ar: 'أقسام الشركاء والثقة',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: {
        en: 'Section Title',
        fr: 'Titre de la Section',
        ar: 'عنوان القسم',
      },
      admin: {
        placeholder: {
          en: 'Partners & Trust',
          fr: 'Partenaires et Confiance',
          ar: 'الشركاء والثقة',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Section Description',
        fr: 'Description de la Section',
        ar: 'وصف القسم',
      },
      admin: {
        placeholder: {
          en: 'Building trust through transparency and international partnerships...',
          fr: 'Bâtir la confiance par la transparence et les partenariats internationaux...',
          ar: 'بناء الثقة من خلال الشفافية والشراكات الدولية...',
        },
      },
    },
    {
      name: 'showTrustMetrics',
      type: 'checkbox',
      label: {
        en: 'Show Trust Metrics',
        fr: 'Afficher les Métriques de Confiance',
        ar: 'إظهار مقاييس الثقة',
      },
      defaultValue: true,
      admin: {
        description: {
          en: 'Display certification badges and trust indicators',
          fr: 'Afficher les badges de certification et indicateurs de confiance',
          ar: 'عرض شارات الاعتماد ومؤشرات الثقة',
        },
      },
    },
    {
      name: 'showPartnerLogos',
      type: 'checkbox',
      label: {
        en: 'Show Partner Logos',
        fr: 'Afficher les Logos des Partenaires',
        ar: 'إظهار شعارات الشركاء',
      },
      defaultValue: true,
      admin: {
        description: {
          en: 'Display logos of international partners and organizations',
          fr: 'Afficher les logos des partenaires et organisations internationales',
          ar: 'عرض شعارات الشركاء والمنظمات الدولية',
        },
      },
    },
    {
      name: 'partners',
      type: 'array',
      label: {
        en: 'Partners',
        fr: 'Partenaires',
        ar: 'الشركاء',
      },
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Partner Name',
            fr: 'Nom du Partenaire',
            ar: 'اسم الشريك',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Partner Logo',
            fr: 'Logo du Partenaire',
            ar: 'شعار الشريك',
          },
          admin: {
            description: {
              en: 'Upload partner logo (recommended: 200x100px, transparent background)',
              fr: 'Télécharger le logo du partenaire (recommandé: 200x100px, fond transparent)',
              ar: 'تحميل شعار الشريك (مستحسن: 200x100 بكسل، خلفية شفافة)',
            },
          },
        },
        {
          name: 'url',
          type: 'text',
          label: {
            en: 'Partner Website URL',
            fr: 'URL du Site Web du Partenaire',
            ar: 'رابط موقع الشريك',
          },
          admin: {
            placeholder: 'https://example.com',
          },
          validate: (val) => {
            if (val && !/^https?:\/\/.+/.test(val)) {
              return 'Please enter a valid URL starting with http:// or https://'
            }
            return true
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Partnership Description',
            fr: 'Description du Partenariat',
            ar: 'وصف الشراكة',
          },
          admin: {
            rows: 3,
            placeholder: {
              en: 'Brief description of the partnership...',
              fr: 'Brève description du partenariat...',
              ar: 'وصف مختصر للشراكة...',
            },
          },
        },
      ],
      admin: {
        description: {
          en: 'Add partner organizations and their details',
          fr: 'Ajouter les organisations partenaires et leurs détails',
          ar: 'إضافة المنظمات الشريكة وتفاصيلها',
        },
      },
    },
  ],
}