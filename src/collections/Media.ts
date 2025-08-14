import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Admin Media Collection
 * 
 * This collection is reserved for admin-uploaded media files that should
 * be available for selection in posts, pages, and other content.
 * Form submission files are stored in the separate 'form-media' collection.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      fr: 'Média',
      ar: 'وسائط'
    },
    plural: {
      fr: 'Médias',
      ar: 'وسائط'
    }
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'width', 'height', 'filesize', 'updatedAt'],
    listSearchableFields: ['filename', 'alt'],
    description: {
      fr: 'Fichiers média pour les contenus éditoriaux. Les fichiers des formulaires sont dans une collection séparée.',
      ar: 'ملفات الوسائط للمحتوى التحريري. ملفات النماذج موجودة في مجموعة منفصلة.'
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [
      // R2 folder organization by media type only
      ({ data, req }) => {
        if (req.file?.name) {
          // Get file extension to determine folder type
          const extension = req.file.name.split('.').pop()?.toLowerCase()
          let folder = 'media'
          
          // Categorize by file type - simple structure
          if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(extension || '')) {
            folder = 'images'
          } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
            folder = 'docs'
          } else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension || '')) {
            folder = 'videos'
          } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) {
            folder = 'audio'
          }
          
          // Simple structure: just store by type
          data.prefix = folder
          
        }
        return data
      }
    ]
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Store ONLY original images in R2 cloud storage, organized by type (images/, docs/, videos/, audio/)
    // Image optimization will be handled by ImageKit or Next.js Image component
    adminThumbnail: ({ doc }: { doc: Record<string, unknown> }) => {
      return typeof doc.url === 'string' ? doc.url : null
    }, // Use original image for admin thumbnail
    focalPoint: true,
    disableLocalStorage: true, // Force R2 storage only
    // Removed imageSizes array - store only original images for maximum cost efficiency
    imageSizes: [], // No pre-generated sizes - save 85% storage costs
  },
}
