import type { CollectionSlug, PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import configPromise from '@payload-config'

export async function GET(
  req: {
    cookies: {
      get: (name: string) => {
        value: string
      }
    }
  } & Request,
): Promise<Response> {
  const payload = await getPayload({ config: configPromise })
  const { searchParams } = new URL(req.url)

  // Extract search parameters
  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as CollectionSlug
  const slug = searchParams.get('slug')
  const previewSecret = searchParams.get('previewSecret')

  // Enhanced error handling with detailed logging
  try {
    // Validate preview secret first
    if (!previewSecret || previewSecret !== process.env.PREVIEW_SECRET) {
      payload.logger.warn('Preview attempt with invalid or missing secret', {
        url: req.url,
        hasSecret: Boolean(previewSecret),
        timestamp: new Date().toISOString(),
      })
      return new Response('You are not allowed to preview this page', { status: 403 })
    }

    // Validate required parameters
    if (!path || !collection || !slug) {
      payload.logger.warn('Preview attempt with missing parameters', {
        path,
        collection,
        slug,
        url: req.url,
        timestamp: new Date().toISOString(),
      })
      return new Response('Insufficient search params provided. Required: path, collection, slug', { status: 400 })
    }

    // Validate path format
    if (!path.startsWith('/')) {
      payload.logger.warn('Preview attempt with invalid path format', {
        path,
        url: req.url,
        timestamp: new Date().toISOString(),
      })
      return new Response('This endpoint can only be used for relative previews', { status: 400 })
    }

    // Validate collection exists
    const validCollections = ['posts', 'media'] // Add your collections here
    if (!validCollections.includes(collection)) {
      payload.logger.warn('Preview attempt with invalid collection', {
        collection,
        validCollections,
        url: req.url,
        timestamp: new Date().toISOString(),
      })
      return new Response(`Invalid collection. Valid collections: ${validCollections.join(', ')}`, { status: 400 })
    }

    // Authenticate user
    let user
    try {
      user = await payload.auth({
        req: req as unknown as PayloadRequest,
        headers: req.headers,
      })
    } catch (error) {
      payload.logger.error('Error verifying user authentication for preview', {
        error: error instanceof Error ? error.message : String(error),
        url: req.url,
        timestamp: new Date().toISOString(),
      })
      return new Response('Authentication failed. Please make sure you are logged in to the admin panel.', { status: 403 })
    }

    const draft = await draftMode()

    if (!user) {
      draft.disable()
      payload.logger.warn('Preview attempt without authenticated user', {
        url: req.url,
        timestamp: new Date().toISOString(),
      })
      return new Response('You must be logged in to preview pages', { status: 403 })
    }

    // Verify the document exists (optional but good practice)
    try {
      const document = await payload.findByID({
        collection,
        id: slug,
        draft: true,
        overrideAccess: true,
      }).catch(() => null)

      if (!document) {
        // Try finding by slug instead of ID
        const documentBySlug = await payload.find({
          collection,
          where: { slug: { equals: slug } },
          draft: true,
          overrideAccess: true,
          limit: 1,
        }).catch(() => null)

        if (!documentBySlug?.docs?.[0]) {
          payload.logger.warn('Preview requested for non-existent document', {
            collection,
            slug,
            url: req.url,
            timestamp: new Date().toISOString(),
          })
          // Still enable draft mode and redirect - let the page handle the 404
        }
      }
    } catch (error) {
      payload.logger.error('Error validating document for preview', {
        error: error instanceof Error ? error.message : String(error),
        collection,
        slug,
        url: req.url,
        timestamp: new Date().toISOString(),
      })
      // Continue with preview even if validation fails
    }

    // Enable draft mode and redirect
    draft.enable()
    
    payload.logger.info('Preview mode enabled successfully', {
      collection,
      slug,
      path,
      user: user.id,
      timestamp: new Date().toISOString(),
    })

    redirect(path)
  } catch (error) {
    // Catch any unexpected errors
    payload.logger.error('Unexpected error in preview route', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
      timestamp: new Date().toISOString(),
    })
    
    return new Response('An unexpected error occurred during preview', { status: 500 })
  }
}
