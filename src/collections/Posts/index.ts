import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
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
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
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
              relationTo: 'media',
              // Note: filterOptions removed as Media collection access control handles filtering globally
              // This prevents conflicts and ensures consistent behavior with other media fields
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
              localized: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
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
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
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
                // SEO best practice: 150-160 characters for meta descriptions
                minLength: 120,
                maxLength: 160,
                admin: {
                  description: 'Ceci devrait contenir entre 120 et 160 caractères. Pour obtenir de l\'aide pour rédiger des descriptions meta de qualité, consultez les bonnes pratiques.',
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
