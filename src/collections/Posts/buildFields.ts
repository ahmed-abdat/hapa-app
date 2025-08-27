import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { seoConfig } from './config/seo.config'
import type { Field } from 'payload'

/**
 * Build the SEO tab fields based on configuration
 * Returns null if SEO tab should be hidden
 */
export function buildSEOTab(): Field | null {
  if (!seoConfig.showSEOTab) {
    return null
  }

  const seoFields: Field[] = []

  // Add fields based on configuration
  if (seoConfig.fields.showOverview) {
    seoFields.push(
      OverviewField({
        titlePath: 'meta.title',
        descriptionPath: 'meta.description',
        imagePath: 'meta.image',
      })
    )
  }

  if (seoConfig.fields.showTitle) {
    seoFields.push(
      MetaTitleField({
        hasGenerateFn: seoConfig.showManualGenerators,
        overrides: {
          label: {
            fr: 'Titre SEO',
            ar: 'عنوان السيو'
          }
        }
      })
    )
  }

  if (seoConfig.fields.showImage) {
    seoFields.push(
      MetaImageField({
        relationTo: 'media',
        overrides: {
          label: {
            fr: 'Image SEO',
            ar: 'صورة السيو'
          }
        }
      })
    )
  }

  if (seoConfig.fields.showDescription) {
    // Add custom description field if manual generators are hidden
    if (!seoConfig.showManualGenerators) {
      seoFields.push({
        name: 'description',
        type: 'textarea',
        label: {
          fr: 'Description SEO (générée automatiquement)',
          ar: 'وصف السيو (يتم إنشاؤه تلقائيًا)'
        },
        admin: {
          description: {
            fr: 'Cette description sera générée automatiquement lors de la sauvegarde ou publication',
            ar: 'سيتم إنشاء هذا الوصف تلقائيًا عند الحفظ أو النشر'
          },
          readOnly: true,
        },
        minLength: 120,
        maxLength: 160,
      })
    } else {
      // Add the field with manual generator component
      seoFields.push({
        type: 'ui',
        name: 'seoDescriptionGenerator',
        label: {
          fr: 'Générateur de description SEO',
          ar: 'مولد وصف السيو'
        },
        admin: {
          components: {
            Field: '@/components/admin/SEODescriptionGenerator/index.tsx#SEODescriptionGenerator',
          },
        },
      })
      
      seoFields.push(
        MetaDescriptionField({
          hasGenerateFn: seoConfig.showManualGenerators,
          overrides: {
            label: {
              fr: 'Description SEO',
              ar: 'وصف السيو'
            },
            minLength: 120,
            maxLength: 160,
            admin: {
              description: {
                fr: 'Ceci devrait contenir entre 120 et 160 caractères. Pour obtenir de l\'aide pour rédiger des descriptions meta de qualité, consultez les bonnes pratiques.',
                ar: 'يجب أن يحتوي هذا على ما بين 120 و 160 حرفًا. للحصول على المساعدة في كتابة وصف ميتا عالي الجودة، راجع أفضل الممارسات.'
              }
            }
          }
        })
      )
    }
  }

  if (seoConfig.fields.showPreview) {
    seoFields.push(
      PreviewField({
        hasGenerateFn: true,
        titlePath: 'meta.title',
        descriptionPath: 'meta.description',
      })
    )
  }

  // Return the SEO tab as a Tab type
  return {
    name: 'meta',
    type: 'group' as const,
    label: {
      fr: 'SEO',
      ar: 'تحسين محركات البحث'
    },
    fields: seoFields,
  }
}