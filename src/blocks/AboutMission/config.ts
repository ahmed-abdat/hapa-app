import type { Block } from 'payload'

export const AboutMission: Block = {
  slug: 'aboutMission',
  interfaceName: 'AboutMissionBlock',
  labels: {
    singular: {
      en: 'About/Mission Block',
      fr: 'Bloc À Propos/Mission',
      ar: 'قسم حول/مهمة',
    },
    plural: {
      en: 'About/Mission Blocks',
      fr: 'Blocs À Propos/Mission',
      ar: 'أقسام حول/مهمة',
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
          en: 'About HAPA',
          fr: 'À Propos de HAPA',
          ar: 'حول الهيئة العليا للصحافة والإعلام',
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
          en: 'Brief description of HAPA\'s role and mission...',
          fr: 'Brève description du rôle et de la mission de HAPA...',
          ar: 'وصف مختصر لدور ومهمة الهيئة العليا للصحافة والإعلام...',
        },
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Featured Image',
        fr: 'Image Principale',
        ar: 'الصورة الرئيسية',
      },
      admin: {
        description: {
          en: 'Optional image to display alongside the content',
          fr: 'Image optionnelle à afficher avec le contenu',
          ar: 'صورة اختيارية لعرضها مع المحتوى',
        },
      },
    },
    {
      name: 'showStats',
      type: 'checkbox',
      label: {
        en: 'Show Statistics',
        fr: 'Afficher les Statistiques',
        ar: 'إظهار الإحصائيات',
      },
      defaultValue: true,
      admin: {
        description: {
          en: 'Display achievement statistics and impact numbers',
          fr: 'Afficher les statistiques de réussite et les chiffres d\'impact',
          ar: 'عرض إحصائيات الإنجازات وأرقام التأثير',
        },
      },
    },
  ],
}