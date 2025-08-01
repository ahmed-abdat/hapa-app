import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { isValidLocale, type Locale } from '@/utilities/locale'
import { HomepageHero } from '@/heros/HomepageHero'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Post } from '@/payload-types'
import { getTranslations } from 'next-intl/server'

type Args = {
  params: Promise<{
    locale: Locale
  }>
}

export default async function HomePage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server')
  setRequestLocale(locale)

  // Get server-side translations for HomepageHero
  const t = await getTranslations({ locale })

  const payload = await getPayload({ config: configPromise })

  // Get latest 6 posts for the news section (2 rows of 3 on desktop)
  let latestPosts: Post[] = []
  try {
    const postsResult = await payload.find({
      collection: 'posts',
      depth: 2,
      limit: 6,
      sort: '-publishedAt',
      locale,
      where: {
        _status: {
          equals: 'published',
        },
      },
    })
    latestPosts = postsResult.docs
  } catch (error) {
    // Error fetching posts - continue with empty array
    // Continue with empty posts array
  }

  // Optimized homepage structure following UX best practices
  const blocks = [
    {
      blockType: 'aboutMission' as const,
    },
    {
      blockType: 'mediaReportingCTA' as const,
    },
    {
      blockType: 'coreServices' as const,
    },
    {
      blockType: 'newsAnnouncements' as const,
      layoutVariant: 'simple',
      posts: latestPosts,
      maxPosts: 6,
      title: locale === 'ar' ? 'آخر الأخبار والإعلانات' : 'Actualités et Annonces',
      description: locale === 'ar' ? 'ابق على اطلاع على آخر التحديثات التنظيمية والإعلانات الرسمية من الهيئة العليا للصحافة والإعلام.' : 'Restez informé des dernières mises à jour réglementaires et annonces officielles de HAPA.',
    },
    {
      blockType: 'mediaSpace' as const,
    },
    {
      blockType: 'partnersSection' as const,
    },
  ]

  // Create translations object for HomepageHero
  const heroTranslations = {
    heroTitle: t('heroTitle'),
    heroSubtitle: t('heroSubtitle'),
    reportMediaContent: t('reportMediaContent'),
    contactHapa: t('contactHapa'),
    keyStatistics: t('keyStatistics'),
    registeredJournalists: t('registeredJournalists'),
    mediaOperators: t('mediaOperators'),
    complaintsResolved: t('complaintsResolved'),
    officialRegulatory: t('officialRegulatory'),
  }

  return (
    <div className="pb-24 overflow-hidden">
      {/* Hero Section - Simple static component */}
      <HomepageHero locale={locale} translations={heroTranslations} />

      {/* Main Content Blocks */}
      <RenderBlocks blocks={blocks} locale={locale} />
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  
  if (!isValidLocale(locale)) {
    return {}
  }

  const title = locale === 'ar' 
    ? 'هابا - الهيئة العليا للصحافة والسمعي البصري'
    : 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel'
    
  const description = locale === 'ar'
    ? 'الهيئة العليا للصحافة والسمعي البصري في موريتانيا - الجهة المنظمة للإعلام'
    : 'Haute Autorité de la Presse et de l\'Audiovisuel en Mauritanie - Autorité de régulation des médias'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'ar' ? 'ar_MR' : 'fr_MR',
    },
    alternates: {
      languages: {
        'fr': '/fr',
        'ar': '/ar',
      },
    },
  }
}

// Generate static params for home page with locales
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}