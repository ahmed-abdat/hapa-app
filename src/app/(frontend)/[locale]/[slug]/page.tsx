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

export async function generateStaticParams() {
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
    if (doc.slug !== 'home') {
      params.push(
        { locale: 'fr', slug: doc.slug },
        { locale: 'ar', slug: doc.slug }
      )
    }
  })

  return params
}

type Args = {
  params: Promise<{
    locale: string
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = 'home' } = await paramsPromise
  
  console.log('🔍 PAGE DEBUG - Rendering page:', {
    locale,
    slug,
    draft,
    validLocale: isValidLocale(locale)
  })
  
  if (!isValidLocale(locale)) {
    console.log('🚫 PAGE DEBUG - Invalid locale, returning notFound')
    notFound()
  }
  
  const url = '/' + locale + '/' + slug

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug,
    locale,
  })

  console.log('🔍 PAGE DEBUG - Query result:', {
    pageFound: !!page,
    pageTitle: page?.title,
    pageSlug: page?.slug,
    draft
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    console.log('🏠 PAGE DEBUG - Using homeStatic fallback')
    page = homeStatic
  }

  if (!page) {
    console.log('🚫 PAGE DEBUG - No page found, returning PayloadRedirects')
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
      <RenderBlocks blocks={layout} />
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
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  console.log('🔍 QUERY PAGE DEBUG - Starting query:', {
    slug,
    locale,
    draft,
    shouldDisableFallback: locale && locale !== 'fr'
  })

  const payload = await getPayload({ config: configPromise })
  
  const shouldDisableFallback = locale && locale !== 'fr'

  const queryOptions = {
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    locale,
    fallbackLocale: shouldDisableFallback ? false : undefined,
    where: {
      slug: {
        equals: slug,
      },
    },
  }

  console.log('🔍 QUERY PAGE DEBUG - Query options:', queryOptions)

  const result = await payload.find(queryOptions)

  console.log('🔍 QUERY PAGE DEBUG - Query result:', {
    totalDocs: result.totalDocs,
    docsCount: result.docs?.length || 0,
    firstDocSlug: result.docs?.[0]?.slug,
    firstDocTitle: result.docs?.[0]?.title,
    firstDocId: result.docs?.[0]?.id
  })

  return result.docs?.[0] || null
})
