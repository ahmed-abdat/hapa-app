import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { Gallery } from '../../blocks/Gallery/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { YouTubeVideo } from '../../blocks/YouTubeVideo/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { enforceFrenchLocale } from '@/utilities/hooks/enforceFrenchLocale'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from '@/fields/slug'
import { formatSlug } from '@/fields/slug/formatSlug'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: {
    singular: {
      fr: 'Article',
      ar: 'مقال'
    },
    plural: {
      fr: 'Articles',
      ar: 'مقالات'
    }
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: authenticatedOrPublished,
    update: isAdminOrEditor,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    hidden: ({ user }) => user?.role === 'moderator',
    components: {
      edit: {
        beforeDocumentControls: [
          '@/components/ForceLocaleMessage/index.tsx#ForceLocaleMessage',
        ],
      },
    },
    livePreview: {
      url: ({ data, req, locale }) => {
        
        // Handle the case where data might be the document object or just a string
        let frenchTitle = ''
        let slug = ''
        
        if (typeof data === 'object' && data !== null) {
          // Normal case - data is the document object
          if (data.title && typeof data.title === 'object' && 'fr' in data.title) {
            frenchTitle = String(data.title.fr || '')
          } else if (typeof data.title === 'string') {
            frenchTitle = data.title
          }
          
          slug = typeof data.slug === 'string' ? data.slug : ''
        } else if (typeof data === 'string') {
          // Fallback case - data is just the title string
          frenchTitle = data
          // We'll need to generate the slug from the title
          slug = '' // Will be handled below
        }


        if (!frenchTitle || !frenchTitle.trim()) {
          return '' // Return empty string to disable preview for posts without French title
        }

        // If we don't have a slug but have a title, generate it
        if (!slug && frenchTitle) {
          slug = formatSlug(frenchTitle)
        }

        if (!slug) {
          return '' // Return empty string if no slug is available
        }

        // For live preview, return direct frontend URL (not preview route)
        // This allows the iframe to load the actual content without redirect issues
        const currentLocale = (locale && typeof locale === 'object' && 'code' in locale) 
          ? String((locale as { code: string }).code) 
          : String(locale || 'fr')
        
        return `/${currentLocale}/posts/${slug}`
      },
    },
    preview: (data, { req, locale }) => {
      
      // Handle the case where data might be the document object or just a string
      let frenchTitle = ''
      let slug = ''
      
      if (typeof data === 'object' && data !== null) {
        // Normal case - data is the document object
        if (data.title && typeof data.title === 'object' && 'fr' in data.title) {
          frenchTitle = String(data.title.fr || '')
        } else if (typeof data.title === 'string') {
          frenchTitle = data.title
        }
        
        slug = typeof data.slug === 'string' ? data.slug : ''
      } else if (typeof data === 'string') {
        // Fallback case - data is just the title string
        frenchTitle = data
        // We'll need to generate the slug from the title
        slug = '' // Will be handled below
      }


      if (!frenchTitle || !frenchTitle.trim()) {
        return '' // Return empty string to disable preview for posts without French title
      }

      // If we don't have a slug but have a title, generate it
      if (!slug && frenchTitle) {
        // Use imported formatSlug function
        slug = formatSlug(frenchTitle)
      }

      if (!slug) {
        return '' // Return empty string if no slug is available
      }

      const path = generatePreviewPath({
        slug,
        collection: 'posts',
        req, 
        locale: (locale && typeof locale === 'object' && 'code' in locale) ? String((locale as { code: string }).code) : String(locale || 'fr'),
      })

      return path
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        fr: 'Titre',
        ar: 'العنوان'
      },
      required: true,
      localized: true,
      index: true, // Add database index for search queries
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              label: {
                fr: 'Image principale',
                ar: 'الصورة الرئيسية'
              },
              relationTo: 'media',
              // Note: filterOptions removed as Media collection access control handles filtering globally
              // This prevents conflicts and ensures consistent behavior with other media fields
            },
            {
              name: 'content',
              type: 'richText',
              label: {
                fr: 'Contenu de l\'article',
                ar: 'محتوى المقال'
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, Gallery, MediaBlock, YouTubeVideo] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              required: true,
              localized: true,
            },
          ],
          label: {
            fr: 'Contenu',
            ar: 'المحتوى'
          },
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              label: {
                fr: 'Articles liés',
                ar: 'المقالات ذات الصلة'
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              label: {
                fr: 'Catégories',
                ar: 'الفئات'
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: {
            fr: 'Métadonnées',
            ar: 'البيانات الوصفية'
          },
        },
        {
          name: 'meta',
          label: {
            fr: 'SEO',
            ar: 'تحسين محركات البحث'
          },
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
              overrides: {
                label: {
                  fr: 'Titre SEO',
                  ar: 'عنوان السيو'
                }
              }
            }),
            MetaImageField({
              relationTo: 'media',
              overrides: {
                label: {
                  fr: 'Image SEO',
                  ar: 'صورة السيو'
                }
              }
              // Note: filterOptions not supported by MetaImageField
              // Media collection access control handles filtering
            }),
            {
              type: 'ui',
              name: 'seoDescriptionGenerator',
              admin: {
                components: {
                  Field: '@/components/admin/SEODescriptionGenerator/index.tsx#SEODescriptionGenerator',
                },
              },
            },
            MetaDescriptionField({
              hasGenerateFn: true,
              overrides: {
                label: {
                  fr: 'Description SEO',
                  ar: 'وصف السيو'
                },
                // SEO best practice: 150-160 characters for meta descriptions
                minLength: 120,
                maxLength: 160,
                admin: {
                  description: {
                    fr: 'Ceci devrait contenir entre 120 et 160 caractères. Pour obtenir de l\'aide pour rédiger des descriptions meta de qualité, consultez les bonnes pratiques.',
                    ar: 'يجب أن تحتوي على 120-160 حرفاً. للحصول على مساعدة في كتابة أوصاف سيو عالية الجودة، راجع أفضل الممارسات.'
                  }
                },
              },
            }),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: {
        fr: 'Date de publication',
        ar: 'تاريخ النشر'
      },
      index: true, // Add database index for faster date-based queries
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      label: {
        fr: 'Auteurs',
        ar: 'المؤلفون'
      },
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    beforeOperation: [enforceFrenchLocale],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  // Add compound indexes for common query patterns
  indexes: [
    {
      fields: ['_status', 'publishedAt'],
      unique: false,
    },
  ],
}
