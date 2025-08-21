import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      // Use Promise.all for parallel revalidation - much faster
      const revalidationPromises = [
        // Revalidate specific post page for both locales
        revalidatePath(`/fr/posts/${doc.slug}`),
        revalidatePath(`/ar/posts/${doc.slug}`),
        
        // Revalidate posts listing pages for both locales
        revalidatePath('/fr/posts'),
        revalidatePath('/ar/posts'),
        
        // Revalidate homepage for both locales (affects news blocks)
        revalidatePath('/fr'),
        revalidatePath('/ar'),
      ];

      // Use tags for more efficient cache invalidation
      const tagPromises = [
        revalidateTag('posts-sitemap'),
        revalidateTag('posts-collection'),
        revalidateTag(`post-${doc.slug}`), // Add specific post tag
      ];

      // Execute all revalidations in parallel
      Promise.all([...revalidationPromises, ...tagPromises]).then(() => {
        payload.logger.info(`✅ Revalidated post: ${doc.slug} and related pages`)
      }).catch((error) => {
        payload.logger.error(`❌ Failed to revalidate post: ${doc.slug}`, error)
      });
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      // Use parallel revalidation for unpublishing too
      const unpublishPromises = [
        revalidatePath(`/fr/posts/${previousDoc.slug}`),
        revalidatePath(`/ar/posts/${previousDoc.slug}`),
        revalidatePath('/fr/posts'),
        revalidatePath('/ar/posts'),
        revalidatePath('/fr'),
        revalidatePath('/ar'),
        revalidateTag('posts-sitemap'),
        revalidateTag('posts-collection'),
        revalidateTag(`post-${previousDoc.slug}`),
      ];

      Promise.all(unpublishPromises).then(() => {
        payload.logger.info(`✅ Revalidated unpublished post: ${previousDoc.slug}`)
      }).catch((error) => {
        payload.logger.error(`❌ Failed to revalidate unpublished post: ${previousDoc.slug}`, error)
      });
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    // Revalidate deleted post pages for both locales
    revalidatePath(`/fr/posts/${doc?.slug}`)
    revalidatePath(`/ar/posts/${doc?.slug}`)
    
    // Revalidate posts listing pages for both locales
    revalidatePath('/fr/posts')
    revalidatePath('/ar/posts')
    
    // Revalidate homepage for both locales
    revalidatePath('/fr')
    revalidatePath('/ar')
    
    revalidateTag('posts-sitemap')
    revalidateTag('posts-collection')
  }

  return doc
}
