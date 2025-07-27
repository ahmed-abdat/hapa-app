import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, type Locale } from '@/utilities/locale'
import { ContactUsHero } from '@/heros/ContactUsHero'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { generateLocalizedMetadata } from '@/utilities/generateMetadata'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ContactUsPage({ params }: Props) {
  const { locale } = await params
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Contact page blocks
  const blocks = [
    {
      blockType: 'contactForm' as const,
    }
  ]

  return (
    <div className="pb-24">
      {/* Contact Hero Section */}
      <ContactUsHero locale={locale} />

      {/* Contact Form and Information */}
      <RenderBlocks blocks={blocks} locale={locale} />
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  if (!isValidLocale(locale)) {
    return {}
  }

  const title = locale === 'ar' 
    ? 'اتصل بنا - هابا'
    : 'Contactez-nous - HAPA'
    
  const description = locale === 'ar'
    ? 'تواصل مع الهيئة العليا للصحافة والسمعي البصري في موريتانيا'
    : 'Contactez la Haute Autorité de la Presse et de l\'Audiovisuel en Mauritanie'

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
        'fr': '/fr/contact',
        'ar': '/ar/contact',
      },
    },
  }
}

// Generate static params for contact page with locales
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}