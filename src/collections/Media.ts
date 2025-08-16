import type { CollectionConfig, Where } from 'payload'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { getR2Client } from '../utilities/r2-client'
import { logger } from '../utilities/logger'

/**
 * Admin Media Collection
 * 
 * This collection is reserved for admin-uploaded media files that should
 * be available for selection in posts, pages, and other content.
 * Form submission files are now stored in the unified 'media' collection.
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
      fr: 'Fichiers média pour les contenus éditoriaux. Les pièces jointes des formulaires sont automatiquement filtrées de cette vue.',
      ar: 'ملفات الوسائط للمحتوى التحريري. يتم تصفية مرفقات النماذج تلقائياً من هذا العرض.'
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => {
      // In admin context, hide form submission media to keep admin gallery clean
      if (req.url?.includes('/admin/')) {
        const whereClause: Where = {
          and: [
            {
              or: [
                { source: { exists: false } },
                { source: { equals: 'admin' } }
              ]
            },
            {
              filename: { not_like: 'hapa_form_%' }
            }
          ]
        }
        return whereClause
      }
      // For API and frontend requests, show all files
      return true
    },
    update: authenticated,
  },
  hooks: {
    beforeChange: [
      // R2 folder organization by media type only
      ({ data, req, operation }) => {
        // Auto-set source field based on filename if not already set
        if (operation === 'create' && req.file?.name && !data.source) {
          if (req.file.name.startsWith('hapa_form_')) {
            data.source = 'form'
          } else {
            data.source = 'admin'
          }
        }
        // Only set prefix on create or when updating WITH a new file
        // This prevents errors during metadata-only updates (alt text, caption, etc.)
        if ((operation === 'create' || operation === 'update') && req.file?.name) {
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
        
        // IMPORTANT: Always return data to prevent undefined errors
        // This is critical for metadata-only updates (no file present)
        return data
      }
    ],
    afterDelete: [
      // Clean up R2 storage when media records are deleted
      async ({ doc }) => {
        if (!doc?.filename) {
          return // No filename, nothing to delete
        }

        // Determine the prefix based on file extension if not stored
        let prefix = doc.prefix
        if (!prefix) {
          // Fallback: determine folder based on file extension
          const extension = doc.filename.split('.').pop()?.toLowerCase()
          if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(extension || '')) {
            prefix = 'images'
          } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
            prefix = 'docs'
          } else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension || '')) {
            prefix = 'videos'
          } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) {
            prefix = 'audio'
          } else {
            prefix = 'media'
          }
        }
        const r2Key = `${prefix}/${doc.filename}`

        try {
          const r2Client = getR2Client()
          await r2Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: r2Key
          }))
          
          logger.info('Successfully deleted R2 file', {
            component: 'Media',
            action: 'after_delete',
            filename: doc.filename,
            metadata: { r2Key, prefix }
          })
        } catch (error) {
          const errorDetails = error as Error
          
          // Don't log as error if file doesn't exist (already deleted)
          if (errorDetails.name === 'NoSuchKey') {
            logger.warn('R2 file not found - may have been already deleted', {
              component: 'Media',
              action: 'after_delete',
              filename: doc.filename,
              metadata: { r2Key, prefix }
            })
          } else {
            // Log real errors
            logger.error('Failed to delete R2 file', errorDetails, {
              component: 'Media',
              action: 'after_delete',
              filename: doc.filename,
              metadata: { r2Key, prefix, url: doc.url }
            })
          }
        }
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
    {
      name: 'prefix',
      type: 'text',
      hidden: true, // Hidden from UI since it's auto-generated
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Admin Upload', value: 'admin' },
        { label: 'Form Submission', value: 'form' }
      ],
      defaultValue: 'admin',
      hidden: true, // Hidden from UI since it's auto-generated
      admin: {
        readOnly: true,
      },
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
