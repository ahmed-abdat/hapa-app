'use client'

import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { usePathname } from 'next/navigation'
import { PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
// import { getTranslation } from '@/utilities/translations'
import { isValidLocale, defaultLocale } from '@/utilities/locale'

interface FooterProps {
  footerData?: Footer
}

export function Footer({ footerData }: FooterProps = {}) {
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1]
  const validLocale = isValidLocale(currentLocale) ? currentLocale : defaultLocale

  // Static navigation items instead of CMS-managed ones
  const defaultNavItems = [
    {
      href: `/${validLocale}/about`,
      label: validLocale === 'ar' ? 'حول الهيئة' : 'À propos'
    },
    {
      href: `/${validLocale}/actualites`,
      label: validLocale === 'ar' ? 'الأخبار' : 'Actualités'
    },
    {
      href: `/${validLocale}/contact`,
      label: validLocale === 'ar' ? 'اتصل بنا' : 'Contact'
    }
  ]

  return (
    <footer className="mt-auto bg-gradient-to-br from-accent via-accent/95 to-accent/90 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Organization Info */}
          <div className="lg:col-span-2">
            <Link className="flex items-center gap-x-4 mb-6 group" href={`/${validLocale}`}>
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
                  {validLocale === 'ar' 
                    ? 'الهيئة العليا للصحافة والإعلام' 
                    : 'HAPA'
                  }
                </h3>
                <p className="text-secondary text-sm font-medium">
                  {validLocale === 'ar' 
                    ? 'الهيئة العليا للصحافة والإعلام' 
                    : 'Haute Autorité de la Presse et de l\'Audiovisuel'
                  }
                </p>
                <p className="text-white/80 text-xs mt-1">
                  {validLocale === 'ar' 
                    ? 'الجمهورية الإسلامية الموريتانية' 
                    : 'République Islamique de Mauritanie'
                  }
                </p>
              </div>
            </Link>
            <p className="text-white/90 text-sm leading-relaxed mb-6">
              {validLocale === 'ar' 
                ? 'الهيئة المستقلة المكلفة بتنظيم ومراقبة وسائل الإعلام في الجمهورية الإسلامية الموريتانية.'
                : 'L\'autorité indépendante chargée de la régulation et du contrôle des médias en République Islamique de Mauritanie.'
              }
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-x-3 text-white/90">
                <MapPinIcon className="w-5 h-5 text-secondary" />
                <span>
                  {validLocale === 'ar' 
                    ? 'نواكشوط، موريتانيا' 
                    : 'Nouakchott, Mauritanie'
                  }
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
              {validLocale === 'ar' ? 'روابط سريعة' : 'Liens rapides'}
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
              {validLocale === 'ar' ? 'الخدمات' : 'Services'}
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link 
                href={`/${validLocale}/services/complaints`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {validLocale === 'ar' ? 'الشكاوى والمطالبات' : 'Plaintes et réclamations'}
              </Link>
              <Link 
                href={`/${validLocale}/services/authorization`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {validLocale === 'ar' ? 'طلبات الترخيص' : 'Demandes d\'autorisation'}
              </Link>
              <Link 
                href={`/${validLocale}/decisions`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {validLocale === 'ar' ? 'القرارات واللوائح' : 'Décisions et règlements'}
              </Link>
              <Link 
                href={`/${validLocale}/statistics`}
                className="text-white/80 hover:text-secondary transition-colors duration-200 hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {validLocale === 'ar' ? 'الإحصائيات القطاعية' : 'Statistiques sectorielles'}
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
                © 2024 HAPA - {validLocale === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
              </p>
              <div className="flex items-center gap-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-white/60 text-xs">
                  {validLocale === 'ar' ? 'الموقع الرسمي' : 'Site officiel'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <Link 
                href={`/${validLocale}/legal`}
                className="hover:text-secondary transition-colors duration-200"
              >
                {validLocale === 'ar' ? 'الإشعارات القانونية' : 'Mentions légales'}
              </Link>
              <Link 
                href={`/${validLocale}/privacy`}
                className="hover:text-secondary transition-colors duration-200"
              >
                {validLocale === 'ar' ? 'سياسة الخصوصية' : 'Politique de confidentialité'}
              </Link>
              <Link 
                href={`/${validLocale}/accessibility`}
                className="hover:text-secondary transition-colors duration-200"
              >
                {validLocale === 'ar' ? 'إمكانية الوصول' : 'Accessibilité'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
