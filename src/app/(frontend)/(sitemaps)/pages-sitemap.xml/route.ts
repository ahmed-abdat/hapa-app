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

    // Static routes for HAPA website (no pages collection)
    const sitemap = [
      {
        loc: `${SITE_URL}/`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/actualites`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/about/mission`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/about/organization`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/about/president`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/about/bylaws`,
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
