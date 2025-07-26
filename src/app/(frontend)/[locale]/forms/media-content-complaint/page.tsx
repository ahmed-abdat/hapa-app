import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { MessageCircle, Shield, Clock, UserCheck } from 'lucide-react'

import { MediaContentComplaintForm } from '@/components/CustomForms/MediaContentComplaintForm'
import { isValidLocale, type Locale, getLocaleDirection } from '@/utilities/locale'

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
    title: t('mediaContentComplaintTitle'),
    description: t('mediaContentComplaintDesc'),
    openGraph: {
      title: t('mediaContentComplaintTitle'),
      description: t('mediaContentComplaintDesc'),
      type: 'website',
    },
  }
}

export default async function MediaContentComplaintPage({ params }: PageProps) {
  const { locale } = await params
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  const t = await getTranslations()
  const direction = getLocaleDirection(locale)

  return (
    <div dir={direction} className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 rounded-full p-4">
                <MessageCircle className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('mediaContentComplaintTitle')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              {t('mediaContentComplaintDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Official Response */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 rounded-lg p-3 mr-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('officialResponse')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('officialResponseDesc')}
              </p>
            </div>

            {/* Legal Protection */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 rounded-lg p-3 mr-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('legalProtection')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('legalProtectionDesc')}
              </p>
            </div>

            {/* Follow-up Guaranteed */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 rounded-lg p-3 mr-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('followupGuaranteed')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('followupGuaranteedDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-start">
              <div className="bg-primary/10 rounded-lg p-2 mr-4 flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-2">
                  {t('officialComplaint')}
                </h3>
                <p className="text-primary/80 text-sm">
                  {t('officialComplaintNotice')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <MediaContentComplaintForm />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('processQuestionsTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('guidanceText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
              >
                {t('contactUs')}
              </a>
              <a
                href={`/${locale}/forms/media-content-report`}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                {t('simpleReportText')}
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