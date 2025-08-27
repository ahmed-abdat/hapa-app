import type { Field, Tab } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
  ChecklistFeature,
  AlignFeature,
  IndentFeature,
} from '@payloadcms/richtext-lexical'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { Gallery } from '../../blocks/Gallery/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { YouTubeVideo } from '../../blocks/YouTubeVideo/config'
import { buildSEOTab } from './buildFields'

/**
 * Build the tabs for Posts collection
 * Dynamically includes/excludes SEO tab based on configuration
 */
export function buildPostTabs(): Tab[] {
  const tabs: Tab[] = []

  // Content Tab - Always present
  tabs.push({
    fields: [
      {
        name: 'heroImage',
        type: 'upload',
        label: {
          fr: 'Image principale',
          ar: 'الصورة الرئيسية'
        },
        relationTo: 'media',
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
              OrderedListFeature(),
              UnorderedListFeature(),
              ChecklistFeature(),
              AlignFeature(),
              IndentFeature(),
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
  })

  // Metadata Tab - Always present
  tabs.push({
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
        admin: {
          position: 'sidebar',
        },
        hasMany: true,
        relationTo: 'categories',
      },
    ],
    label: {
      fr: 'Métadonnées',
      ar: 'البيانات الوصفية'
    },
  })

  // SEO Tab - Conditional based on configuration
  const seoTab = buildSEOTab()
  if (seoTab) {
    tabs.push(seoTab as Tab)
  }

  return tabs
}