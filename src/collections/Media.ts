import type { CollectionConfig } from 'payload'
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
 * Extract R2 storage key from media URL for cleanup operations
 * @param url - Full URL to the media file 
 * @returns R2 key path or null if invalid URL
 */
function extractR2KeyFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const urlObj = new URL(url.trim())
    const key = urlObj.pathname.startsWith('/') 
      ? urlObj.pathname.substring(1) 
      : urlObj.pathname
    
    return key || null
  } catch (error) {
    logger.error('Failed to extract R2 key from URL', error as Error, {
      component: 'Media',
      metadata: { url }
    })
    return null
  }
}

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
      ({ data, req, operation }) => {
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
        if (!doc?.url) {
          return // No URL, nothing to delete
        }

        const r2Key = extractR2KeyFromUrl(doc.url)
        if (!r2Key) {
          return // Invalid URL format
        }

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
            metadata: { r2Key }
          })
        } catch (error) {
          // Log error but don't throw - prevents database rollback
          // Orphaned files will be cleaned up by the cleanup job
          logger.error('Failed to delete R2 file', error as Error, {
            component: 'Media',
            action: 'after_delete',
            filename: doc.filename,
            metadata: { r2Key, url: doc.url }
          })
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
