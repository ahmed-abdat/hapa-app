import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Bell, Shield, Clock, CheckCircle } from 'lucide-react'

import { DynamicMediaContentReportForm } from '@/components/CustomForms/DynamicMediaContentReportForm'
import { isValidLocale } from '@/utilities/locale'

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  const t = await getTranslations()

  return {
    title: t('mediaContentReportTitle'),
    description: t('mediaContentReportDesc'),
    openGraph: {
      title: t('mediaContentReportTitle'),
      description: t('mediaContentReportDesc'),
      type: 'website',
    },
  }
}

export default async function MediaContentReportPage({ params }: PageProps) {
  const { locale } = await params
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  const t = await getTranslations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="bg-white/20 rounded-full p-2 md:p-3">
                <Bell className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
              {t('mediaContentReportTitle')}
            </h1>
            <p className="text-sm md:text-base lg:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              {t('mediaContentReportDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Information Cards - Mobile Optimized */}
      <div className="container mx-auto px-4 -mt-4 md:-mt-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* Quick Process */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-5 border border-primary/20">
              <div className="flex items-center mb-3 gap-x-2">
                <div className="bg-primary/10 rounded-lg p-2 flex items-center justify-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h2 className="text-sm md:text-base font-semibold text-gray-900">
                  {t('quickProcess')}
                </h2>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {t('quickProcessDesc')}
              </p>
            </div>

            {/* Confidential */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-5 border border-primary/20">
              <div className="flex items-center mb-3 gap-x-2">
                <div className="bg-primary/10 rounded-lg p-2 flex items-center justify-center">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h2 className="text-sm md:text-base font-semibold text-gray-900">
                  {t('confidential')}
                </h2>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {t('confidentialDesc')}
              </p>
            </div>

            {/* Follow-up */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-5 border border-primary/20">
              <div className="flex items-center mb-3 gap-x-2">
                <div className="bg-primary/10 rounded-lg p-2 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h2 className="text-sm md:text-base font-semibold text-gray-900">
                  {t('guaranteedFollowup')}
                </h2>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {t('guaranteedFollowupDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <DynamicMediaContentReportForm />
        </div>
      </div>

      {/* Help Section - Mobile Optimized */}
      <div className="bg-gray-50 py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
              {t('needHelpQuestion')}
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              {t('helpTeamAvailable')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium text-sm md:text-base"
              >
                {t('contactUs')}
              </a>
              <a
                href={`/${locale}/forms/media-content-complaint`}
                className="inline-flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-medium text-sm md:text-base"
              >
                {t('officialComplaint')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}