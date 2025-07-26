'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import React from 'react'
import { useParams } from 'next/navigation'
import { PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { type Locale } from '@/utilities/locale'

interface FooterProps {
  footerData?: unknown // Optional footer data for compatibility (not used)
}

export function Footer({ footerData }: FooterProps = {}) {
  const params = useParams()
  const locale = (params?.locale as Locale) || 'fr'
  const t = useTranslations()

  // Static navigation items instead of CMS-managed ones
  const defaultNavItems = [
    {
      href: `/${locale}/about`,
      label: t('about')
    },
    {
      href: `/${locale}/actualites`,
      label: t('news')
    },
    {
      href: `/${locale}/contact`,
      label: t('contact')
    }
  ]

  return (
    <footer className="mt-auto bg-gradient-to-br from-accent via-accent/95 to-accent/90 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Organization Info */}
          <div className="lg:col-span-2">
            <Link className="flex items-center gap-x-4 mb-6 group" href={`/${locale}`}>
              {/* HAPA Official Logo */}
              <div className="relative">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow p-2">
                  <Image 
                    src="/logo_hapa1.png" 
                    alt="HAPA Logo" 
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {locale === 'ar' ? t('hapaFullName') : 'HAPA'}
                </h3>
                <p className="text-secondary text-sm font-medium">
                  {t('hapaFullName')}
                </p>
                <p className="text-white/80 text-xs mt-1">
                  {t('islamicRepublicMauritania')}
                </p>
              </div>
            </Link>
            <p className="text-white/90 text-sm leading-relaxed mb-6">
              {t('footerAboutHapa')}
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-x-3 text-white/90">
                <MapPinIcon className="w-5 h-5 text-secondary" />
                <span>
                  {t('nouakchottMauritania')}
                </span>
              </div>
              <div className="flex items-center gap-x-3 text-white/90">
                <MailIcon className="w-5 h-5 text-secondary" />
                <span>contact@hapa.mr</span>
              </div>
              <div className="flex items-center gap-x-3 text-white/90">
                <PhoneIcon className="w-5 h-5 text-secondary" />
                <span>+222 45 25 26 79</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-secondary mb-4 border-b-2 border-secondary/30 pb-2">
              {t('quickLinks')}
            </h4>
            <nav className="flex flex-col gap-2">
              {defaultNavItems.map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href}
                  className="text-white/80 hover:text-secondary text-sm transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-secondary mb-4 border-b-2 border-secondary/30 pb-2">
              {t('services')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link 
                href={`/${locale}/forms/media-content-report`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {locale === 'fr' ? 'Signalement de contenu' : 'تبليغ عن المحتوى'}
              </Link>
              <Link 
                href={`/${locale}/forms/media-content-complaint`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {locale === 'fr' ? 'Plainte officielle' : 'شكوى رسمية'}
              </Link>
              <Link 
                href={`/${locale}/contact`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {t('contact')}
              </Link>
              <Link 
                href={`/${locale}/publications/decisions`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {locale === 'fr' ? 'Décisions et communiqués' : 'قرارات وبيانات'}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/20 bg-accent/20">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-white/80 text-sm">
                © 2024 HAPA - {t('allRightsReserved')}
              </p>
              <div className="flex items-center gap-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-white/60 text-xs">
                  {t('officialWebsite')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <Link 
                href={`/${locale}/legal`}
                className="hover:text-secondary transition-colors duration-200"
              >
                {t('legalNotices')}
              </Link>
              <Link 
                href={`/${locale}/privacy`}
                className="hover:text-secondary transition-colors duration-200"
              >
                {t('privacyPolicy')}
              </Link>
              <Link 
                href={`/${locale}/accessibility`}
                className="hover:text-secondary transition-colors duration-200"
              >
                {t('accessibility')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
