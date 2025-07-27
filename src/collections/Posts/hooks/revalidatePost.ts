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
      // Revalidate specific post page for both locales
      revalidatePath(`/fr/posts/${doc.slug}`)
      revalidatePath(`/ar/posts/${doc.slug}`)
      
      // Revalidate posts listing pages for both locales
      revalidatePath('/fr/posts')
      revalidatePath('/ar/posts')
      
      // Revalidate homepage for both locales (affects news blocks)
      revalidatePath('/fr')
      revalidatePath('/ar')
      
      revalidateTag('posts-sitemap')
      revalidateTag('posts-collection')

      payload.logger.info(`Revalidated post: ${doc.slug} and related pages`)
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      revalidatePath(`/fr/posts/${previousDoc.slug}`)
      revalidatePath(`/ar/posts/${previousDoc.slug}`)
      revalidatePath('/fr/posts')
      revalidatePath('/ar/posts')
      revalidatePath('/fr')
      revalidatePath('/ar')
      
      revalidateTag('posts-sitemap')
      revalidateTag('posts-collection')

      payload.logger.info(`Revalidated unpublished post: ${previousDoc.slug}`)
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
