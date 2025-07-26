import { getTranslations } from 'next-intl/server';
import { getServerSideURL } from '@/utilities/getURL';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import type { Metadata } from 'next';

export async function generateLocalizedMetadata(locale: 'fr' | 'ar' = 'fr'): Promise<Metadata> {
  const t = await getTranslations({ locale });
  
  // Split keywords string by comma and trim whitespace
  const keywordsString = t('siteKeywords');
  const keywords = keywordsString.split(',').map(keyword => keyword.trim());

  return {
    metadataBase: new URL(getServerSideURL()),
    title: {
      default: `HAPA - ${t('organizationName')}`,
      template: "%s | HAPA"
    },
    description: t('siteDescription'),
    keywords,
    authors: [{ name: "HAPA", url: "https://hapa.mr" }],
    creator: "HAPA",
    publisher: "HAPA",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: mergeOpenGraph({
      title: `HAPA - ${t('organizationName')}`,
      description: t('siteDescription'),
      siteName: "HAPA",
      locale: locale === 'ar' ? 'ar_MR' : 'fr_MR',
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title: `HAPA - ${t('organizationName')}`,
      description: t('siteDescription'),
      creator: "@HAPA_MR",
    },
    alternates: {
      canonical: getServerSideURL(),
      languages: {
        'fr': `${getServerSideURL()}/fr`,
        'ar': `${getServerSideURL()}/ar`,
      },
    },
  };
}