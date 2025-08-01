import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { AlertTriangle, Shield, Clock, CheckCircle } from 'lucide-react'

import { MediaContentReportForm } from '@/components/CustomForms/MediaContentReportForm'
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 rounded-full p-4">
                <AlertTriangle className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('mediaContentReportTitle')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              {t('mediaContentReportDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Quick Process */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
              <div className="flex items-center mb-4 gap-x-2">
                <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-center gap-x-2">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('quickProcess')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('quickProcessDesc')}
              </p>
            </div>

            {/* Confidential */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
              <div className="flex items-center mb-4 gap-x-2">
                <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-center gap-x-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('confidential')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('confidentialDesc')}
              </p>
            </div>

            {/* Follow-up */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
              <div className="flex items-center mb-4 gap-x-2">
                <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-center gap-x-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('guaranteedFollowup')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('guaranteedFollowupDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <MediaContentReportForm />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('needHelpQuestion')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('helpTeamAvailable')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
              >
                {t('contactUs')}
              </a>
              <a
                href={`/${locale}/forms/media-content-complaint`}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
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