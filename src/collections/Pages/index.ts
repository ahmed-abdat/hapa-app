import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { AboutMission } from '../../blocks/AboutMission/config'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { CoreServices } from '../../blocks/CoreServices/config'
import { FormBlock } from '../../blocks/Form/config'
import { Gallery } from '../../blocks/Gallery/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { MediaSpace } from '../../blocks/MediaSpace/config'
import { NewsAnnouncements } from '../../blocks/NewsAnnouncements/config'
import { PartnersSection } from '../../blocks/PartnersSection/config'
import { Quote } from '../../blocks/Quote/config'
import { Statistics } from '../../blocks/Statistics/config'
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
        // Check if French title exists for slug generation
        const frenchTitle = data?.title && typeof data.title === 'object' && 'fr' in data.title 
          ? String(data.title.fr || '') 
          : typeof data?.title === 'string' 
          ? data.title 
          : null
        
        if (!frenchTitle || (typeof frenchTitle === 'string' && !frenchTitle.trim())) {
          return '' // Return empty string to disable preview for pages without French title
        }

        // Ensure we have a valid slug
        const slug = typeof data?.slug === 'string' && data.slug.trim() ? data.slug : ''
        if (!slug) {
          return '' // Return empty string if no slug is available
        }

        const path = generatePreviewPath({
          slug,
          collection: 'pages',
          req,
          locale: (locale && typeof locale === 'object' && 'code' in locale) ? String((locale as { code: string }).code) : String(locale || 'fr'),
        })

        return path
      },
    },
    preview: (data, { req, locale }) => {
      // Check if French title exists for slug generation
      const frenchTitle = data?.title && typeof data.title === 'object' && 'fr' in data.title 
        ? String(data.title.fr || '') 
        : typeof data?.title === 'string' 
        ? data.title 
        : null
      
      if (!frenchTitle || (typeof frenchTitle === 'string' && !frenchTitle.trim())) {
        return '' // Return empty string to disable preview for pages without French title
      }

      // Ensure we have a valid slug
      const slug = typeof data?.slug === 'string' && data.slug.trim() ? data.slug : ''
      if (!slug) {
        return '' // Return empty string if no slug is available
      }

      const path = generatePreviewPath({
        slug,
        collection: 'pages',
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
              blocks: [AboutMission, CallToAction, Content, CoreServices, Gallery, MediaBlock, MediaSpace, NewsAnnouncements, PartnersSection, Quote, Statistics, Archive, FormBlock],
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
