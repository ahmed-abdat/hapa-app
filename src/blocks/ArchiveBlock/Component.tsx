import type { Post, Category } from '@/payload-types'
import type { Locale } from '@/utilities/locale'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

// Archive block props type definition
type ArchiveBlockProps = {
  id?: string
  categories?: (string | Category)[]
  introContent?: unknown
  limit?: number
  populateBy?: 'collection' | 'selection'
  selectedDocs?: (string | Post)[]
  locale?: Locale
  blockType?: string
  [key: string]: unknown
}

export const ArchiveBlock: React.FC<ArchiveBlockProps> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs, locale = 'fr' } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category: string | Category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post: string | Post) => {
        if (typeof post === 'object') return post
        return null
      }).filter(Boolean) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent as any} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} locale={locale} />
    </div>
  )
}
