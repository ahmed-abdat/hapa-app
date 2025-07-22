import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { enforceFrenchLocale } from '@/utilities/hooks/enforceFrenchLocale'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: {
    singular: {
      fr: 'Page',
      ar: 'صفحة'
    },
    plural: {
      fr: 'Pages',
      ar: 'صفحات'
    }
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
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
        console.log('🔍 LIVE PREVIEW DEBUG - Input data:', {
          dataId: data?.id,
          dataSlug: data?.slug,
          dataTitle: data?.title,
          locale,
          localeType: typeof locale
        })

        // Check if French title exists for slug generation
        const frenchTitle = data?.title && typeof data.title === 'object' && 'fr' in data.title 
          ? data.title.fr 
          : typeof data?.title === 'string' 
          ? data.title 
          : null
        
        console.log('🔍 LIVE PREVIEW DEBUG - French title check:', {
          titleType: typeof data?.title,
          isObject: typeof data?.title === 'object',
          hasFr: data?.title && typeof data.title === 'object' && 'fr' in data.title,
          frenchTitle
        })
        
        if (!frenchTitle || !frenchTitle.trim()) {
          console.log('🚫 LIVE PREVIEW DEBUG - No French title found')
          return '' // Return empty string to disable preview for pages without French title
        }

        // Ensure we have a valid slug
        const slug = typeof data?.slug === 'string' && data.slug.trim() ? data.slug : ''
        if (!slug) {
          console.log('🚫 LIVE PREVIEW DEBUG - No slug found')
          return '' // Return empty string if no slug is available
        }

        console.log('✅ LIVE PREVIEW DEBUG - Generating preview path with:', {
          slug,
          collection: 'pages',
          locale: (locale && typeof locale === 'object' && 'code' in locale) ? String((locale as { code: string }).code) : String(locale || 'fr')
        })

        const path = generatePreviewPath({
          slug,
          collection: 'pages',
          req,
          locale: (locale && typeof locale === 'object' && 'code' in locale) ? String((locale as { code: string }).code) : String(locale || 'fr'),
        })

        console.log('✅ LIVE PREVIEW DEBUG - Generated path:', path)
        return path
      },
    },
    preview: (data, { req, locale }) => {
      console.log('🔍 PREVIEW DEBUG - Input data:', {
        dataId: data?.id,
        dataSlug: data?.slug,
        dataTitle: data?.title,
        locale,
        localeType: typeof locale
      })

      // Check if French title exists for slug generation
      const frenchTitle = data?.title && typeof data.title === 'object' && 'fr' in data.title 
        ? data.title.fr 
        : typeof data?.title === 'string' 
        ? data.title 
        : null
      
      console.log('🔍 PREVIEW DEBUG - French title check:', {
        titleType: typeof data?.title,
        isObject: typeof data?.title === 'object',
        hasFr: data?.title && typeof data.title === 'object' && 'fr' in data.title,
        frenchTitle
      })
      
      if (!frenchTitle || !frenchTitle.trim()) {
        console.log('🚫 PREVIEW DEBUG - No French title found')
        return '' // Return empty string to disable preview for pages without French title
      }

      // Ensure we have a valid slug
      const slug = typeof data?.slug === 'string' && data.slug.trim() ? data.slug : ''
      if (!slug) {
        console.log('🚫 PREVIEW DEBUG - No slug found')
        return '' // Return empty string if no slug is available
      }

      console.log('✅ PREVIEW DEBUG - Generating preview path with:', {
        slug,
        collection: 'pages',
        locale: (locale && typeof locale === 'object' && 'code' in locale) ? String((locale as { code: string }).code) : String(locale || 'fr')
      })

      const path = generatePreviewPath({
        slug,
        collection: 'pages',
        req,
        locale: (locale && typeof locale === 'object' && 'code' in locale) ? String((locale as { code: string }).code) : String(locale || 'fr'),
      })

      console.log('✅ PREVIEW DEBUG - Generated path:', path)
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
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              localized: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
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
            }),

            MetaDescriptionField({}),
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
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  hooks: {
    beforeOperation: [enforceFrenchLocale],
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
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
}
