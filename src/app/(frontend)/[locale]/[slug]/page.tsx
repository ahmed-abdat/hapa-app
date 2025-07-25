import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { isValidLocale, type Locale } from '@/utilities/locale'
import { notFound } from 'next/navigation'

import type { Page } from '@/payload-types'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
  })

  const params: { locale: string; slug: string }[] = []
  
    pages.docs?.forEach((doc) => {
      if (doc.slug && doc.slug !== 'home') {
        params.push(
          { locale: 'fr', slug: doc.slug },
          { locale: 'ar', slug: doc.slug }
        )
      }
    })

    return params
  } catch (error) {
    console.error('Error generating static params for pages:', error)
    // Return empty array on database error to allow build to continue
    return []
  }
}

type Args = {
  params: Promise<{
    locale: Locale
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = 'home' } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }
  
  const url = '/' + locale + '/' + slug

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug,
    locale,
  }) as RequiredDataFromCollectionSlug<'pages'> | null

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} locale={locale} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = 'home' } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    return {}
  }
  
  const page = await queryPageBySlug({
    slug,
    locale,
  }) as Partial<Page> | null

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })
  
  const shouldDisableFallback = locale && locale !== 'fr'

  const queryOptions = {
    collection: 'pages' as const,
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    locale,
    fallbackLocale: shouldDisableFallback ? (false as const) : ('fr' as const),
    where: {
      slug: {
        equals: slug,
      },
    },
  }

  const result = await payload.find(queryOptions)

  return result.docs?.[0] || null
})
