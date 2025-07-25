import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { setRequestLocale } from 'next-intl/server'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const locales = ['fr', 'ar']
  const params: { locale: string; slug: string }[] = []

  posts.docs.forEach(({ slug }) => {
    locales.forEach((locale) => {
      params.push({ locale, slug })
    })
  })

  return params
}

type Args = {
  params: Promise<{
    locale: string
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = '' } = await paramsPromise
  const url = '/posts/' + slug
  
  setRequestLocale(locale)
  
  const post = await queryPostBySlug({ slug, locale })

  if (!post) {
    return <PayloadRedirects url={url} />
  }


  return (
    <article className="pt-16 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} locale={locale} />

      <div className="article-container">
        <RichText 
          className="prose-hapa max-w-none" 
          data={post.content} 
          enableGutter={false}
          variant="article"
          locale={locale}
        />
        
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <RelatedPosts
              className="max-w-none"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
              locale={locale}
            />
          </div>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug, locale })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale?: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })
  
  const shouldDisableFallback = locale && locale !== 'fr'


  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    locale: locale || 'fr',
    fallbackLocale: shouldDisableFallback ? false : undefined,
    where: {
      slug: {
        equals: slug,
      },
    },
  })


  return result.docs?.[0] || null
})
