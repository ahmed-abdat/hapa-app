'use client'

import { Link } from '@/i18n/navigation'
import React, { useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  Phone, 
  Mail, 
  AlertCircle,
  HelpCircle
} from 'lucide-react'

export default function NotFound() {
  const t = useTranslations()
  const locale = useLocale() as 'fr' | 'ar'

  // Set page title for 404
  useEffect(() => {
    document.title = t('pageNotFound') + ' - HAPA'
  }, [t])


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section with 404 */}
      <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24">
        <div className="hapa-container">
          <div className="text-center max-w-4xl mx-auto px-4">
            {/* 404 Number with HAPA Branding */}
            <div className="relative mb-6 sm:mb-8 md:mb-10">
              <div className="text-[120px] xs:text-[150px] sm:text-[200px] md:text-[250px] lg:text-[300px] font-bold text-primary/20 leading-none select-none" aria-hidden="true">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg transform -rotate-3">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                  <span className="text-sm sm:text-lg font-semibold">{t('pageNotFound')}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              {t('pageNotFound')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              {t('pageNotFoundDesc')}
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 md:mb-20 px-4">
              <Button asChild size="lg" className="gap-2 text-base w-full sm:w-auto">
                <Link href="/">
                  <Home className="w-5 h-5" />
                  {locale === 'fr' ? 'Retour à l\'accueil' : 'العودة للرئيسية'}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-base w-full sm:w-auto">
                <Link href="/contact">
                  <HelpCircle className="w-5 h-5" />
                  {locale === 'fr' ? 'Obtenir de l\'aide' : 'الحصول على المساعدة'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Emergency Contact Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary/5">
        <div className="hapa-container">
          <Card className="max-w-2xl border-primary/20 shadow-lg mx-4">
            <CardContent className="p-6 sm:p-8 md:p-10 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6">
                {locale === 'fr' ? 'Besoin d\'aide immédiate ?' : 'تحتاج مساعدة فورية؟'}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
                {locale === 'fr'
                  ? 'Notre équipe est disponible pour vous aider à naviguer sur notre site et trouver l\'information dont vous avez besoin.'
                  : 'فريقنا متاح لمساعدتك في التنقل في موقعنا والعثور على المعلومات التي تحتاجها.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
                  <Link href="/contact">
                    <Mail className="w-4 h-4" />
                    {locale === 'fr' ? 'Nous écrire' : 'راسلنا'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
                  <a href="tel:+22245252525">
                    <Phone className="w-4 h-4" />
                    {locale === 'fr' ? 'Nous appeler' : 'اتصل بنا'}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
