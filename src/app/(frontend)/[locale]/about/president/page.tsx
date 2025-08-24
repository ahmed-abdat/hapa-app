import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateMeta } from '@/utilities/generateMeta'
import { type Locale  } from '@/utilities/locale'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import BackToTopButton from './BackToTopButton'

type Args = {
  params: Promise<{
    locale: string
  }>
}

export default async function PresidentPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  
  if (locale !== 'fr' && locale !== 'ar') {
    notFound()
  }
  
  const t = await getTranslations()
  
  const presidentData = {
    fr: {
      title: t('presidentMessage'),
      name: t('presidentName'),
      position: t('presidentTitle'),
      content: t('presidentMessageContent'),
      readMore: t('readMore'),
      backToTop: t('backToTop')
    },
    ar: {
      title: t('presidentMessage'),
      name: t('presidentName'),
      position: t('presidentTitle'),
      content: t('presidentMessageContent'),
      readMore: t('readMore'),
      backToTop: t('backToTop')
    }
  }
  
  const content = presidentData[locale as keyof typeof presidentData]
  
  return (
    <article className="min-h-screen pb-24" >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-accent text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {content.title}
                </h1>
                <div className="w-24 h-1 bg-secondary"></div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-semibold text-secondary">
                  {content.name}
                </h2>
                <p className="text-base md:text-lg text-white/90 leading-relaxed">
                  {content.position}
                </p>
              </div>
            </div>
            
            {/* President Image */}
            <div className="relative">
              <div className="aspect-[3/4] sm:aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                <Image
                  src="/president-image.jpg"
                  alt={content.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, 50vw"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Main Content */}
      <section className="relative bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="prose prose-lg prose-primary max-w-none">
            <div className={`text-gray-700 leading-relaxed space-y-6 text-base md:text-lg ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}>
              {content.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.trim().startsWith('-')) {
                  // Handle bullet points
                  const bulletPoints = paragraph.split('\n').filter(line => line.trim().startsWith('-'))
                  return (
                    <ul key={index} className="space-y-3 my-8">
                      {bulletPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></span>
                          <span className={locale === 'ar' ? 'text-right' : 'text-left'}>
                            {point.replace(/^-\s*/, '')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p key={index} className={`leading-relaxed ${
                    locale === 'ar' ? 'text-right' : 'text-left'
                  }`}>
                    {paragraph}
                  </p>
                )
              })}
            </div>
            
            {/* Signature */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xl font-semibold text-primary mb-2">
                  {content.name}
                </p>
                <p className="text-gray-600">
                  {content.position}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTopButton label={content.backToTop} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  
  const titles = {
    fr: "Mot du Président - HAPA",
    ar: "كلمة الرئيس - الهابا"
  }
  
  const descriptions = {
    fr: "Message du Président de la Haute Autorité de la Presse et de l'Audiovisuel de Mauritanie",
    ar: "رسالة رئيس السلطة العليا للصحافة والسمعيات البصرية في موريتانيا"
  }
  
  return generateMeta({
    doc: {
      meta: {
        title: titles[locale as keyof typeof titles] || titles.fr,
        description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      }
    }
  })
}

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}