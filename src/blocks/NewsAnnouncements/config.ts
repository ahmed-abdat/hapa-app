import type { Block } from 'payload'

export const NewsAnnouncements: Block = {
  slug: 'newsAnnouncements',
  interfaceName: 'NewsAnnouncementsBlock',
  labels: {
    singular: {
      en: 'News & Announcements Block',
      fr: 'Bloc Actualités et Annonces',
      ar: 'قسم الأخبار والإعلانات',
    },
    plural: {
      en: 'News & Announcements Blocks',
      fr: 'Blocs Actualités et Annonces',
      ar: 'أقسام الأخبار والإعلانات',
    },
  },
  fields: [
    {
      name: 'layoutVariant',
      type: 'select',
      label: {
        en: 'Layout Variant',
        fr: 'Variante de Mise en Page',
        ar: 'نوع التخطيط',
      },
      defaultValue: 'simple',
      options: [
        {
          label: {
            en: 'Simple - Clean uniform grid',
            fr: 'Simple - Grille uniforme et propre',
            ar: 'بسيط - شبكة موحدة ونظيفة',
          },
          value: 'simple',
        },
        {
          label: {
            en: 'Rich - Urgent announcements + Featured posts',
            fr: 'Riche - Annonces urgentes + Articles vedettes',
            ar: 'غني - إعلانات عاجلة + مقالات مميزة',
          },
          value: 'rich',
        },
      ],
      admin: {
        description: {
          en: 'Choose between simple grid layout or rich layout with urgent announcements and featured posts.',
          fr: 'Choisir entre une mise en page grille simple ou riche avec annonces urgentes et articles vedettes.',
          ar: 'اختر بين تخطيط الشبكة البسيط أو التخطيط الغني مع الإعلانات العاجلة والمقالات المميزة.',
        },
      },
    },
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
          en: 'News & Announcements',
          fr: 'Actualités et Annonces',
          ar: 'الأخبار والإعلانات',
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
          en: 'Stay informed about the latest regulatory updates and official announcements from HAPA...',
          fr: 'Restez informé des dernières mises à jour réglementaires et annonces officielles de HAPA...',
          ar: 'ابق على اطلاع على آخر التحديثات التنظيمية والإعلانات الرسمية من هابا...',
        },
      },
    },
    {
      name: 'showFeatured',
      type: 'checkbox',
      label: {
        en: 'Show Featured Post',
        fr: 'Afficher l\'Article Vedette',
        ar: 'إظهار المقال المميز',
      },
      defaultValue: true,
      admin: {
        condition: (data, siblingData) => siblingData.layoutVariant === 'rich',
        description: {
          en: 'Display the most recent post as a featured article with larger layout (Rich layout only)',
          fr: 'Afficher le post le plus récent comme article vedette avec une mise en page plus grande (Mise en page riche uniquement)',
          ar: 'عرض أحدث منشور كمقال مميز بتخطيط أكبر (التخطيط الغني فقط)',
        },
      },
    },
    {
      name: 'showUrgentBanner',
      type: 'checkbox',
      label: {
        en: 'Show Urgent Announcements Banner',
        fr: 'Afficher la Bannière d\'Annonces Urgentes',
        ar: 'إظهار شريط الإعلانات العاجلة',
      },
      defaultValue: true,
      admin: {
        condition: (data, siblingData) => siblingData.layoutVariant === 'rich',
        description: {
          en: 'Display urgent announcements banner at the top (Rich layout only)',
          fr: 'Afficher la bannière d\'annonces urgentes en haut (Mise en page riche uniquement)',
          ar: 'عرض شريط الإعلانات العاجلة في الأعلى (التخطيط الغني فقط)',
        },
      },
    },
    {
      name: 'maxPosts',
      type: 'number',
      label: {
        en: 'Maximum Posts to Display',
        fr: 'Nombre Maximum de Posts à Afficher',
        ar: 'العدد الأقصى للمنشورات المعروضة',
      },
      defaultValue: 6,
      min: 3,
      max: 12,
      admin: {
        description: {
          en: 'Set the maximum number of posts to display in this section',
          fr: 'Définir le nombre maximum de posts à afficher dans cette section',
          ar: 'تحديد العدد الأقصى للمنشورات المعروضة في هذا القسم',
        },
      },
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      label: {
        en: 'Select Posts (Optional)',
        fr: 'Sélectionner les Posts (Optionnel)',
        ar: 'اختر المنشورات (اختياري)',
      },
      admin: {
        description: {
          en: 'Manually select specific posts to display. If empty, will show the most recent posts automatically.',
          fr: 'Sélectionner manuellement des posts spécifiques à afficher. Si vide, affichera automatiquement les posts les plus récents.',
          ar: 'اختر يدوياً منشورات محددة للعرض. إذا كان فارغاً، سيعرض أحدث المنشورات تلقائياً.',
        },
      },
    },
  ],
}