import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const dateFallback = new Date().toISOString()

    // Static routes for HAPA website with locale prefixes (no pages collection)
    const sitemap = [
      // French routes
      {
        loc: `${SITE_URL}/fr`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/fr/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/fr/posts`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/fr/actualites`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/fr/about/mission`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/fr/about/organization`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/fr/about/president`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/fr/about/bylaws`,
        lastmod: dateFallback,
      },
      // Arabic routes
      {
        loc: `${SITE_URL}/ar`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/ar/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/ar/posts`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/ar/actualites`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/ar/about/mission`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/ar/about/organization`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/ar/about/president`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/ar/about/bylaws`,
        lastmod: dateFallback,
      },
    ]

    return sitemap
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
