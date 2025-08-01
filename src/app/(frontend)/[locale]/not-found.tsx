'use client'

import { Link } from '@/i18n/navigation'
import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Home, 
  Phone, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Scale,
  Users,
  Newspaper,
  AlertCircle,
  HelpCircle
} from 'lucide-react'

export default function NotFound() {
  const t = useTranslations()
  const locale = useLocale() as 'fr' | 'ar'
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const isRTL = locale === 'ar'
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  // Set page title for 404
  useEffect(() => {
    document.title = t('pageNotFound') + ' - HAPA'
  }, [t])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const quickLinks = [
    {
      icon: Home,
      title: locale === 'fr' ? 'Accueil' : 'الرئيسية',
      description: locale === 'fr' ? 'Retour à la page d\'accueil' : 'العودة إلى الصفحة الرئيسية',
      href: '/'
    },
    {
      icon: Newspaper,
      title: t('news'),
      description: locale === 'fr' ? 'Actualités et annonces officielles' : 'الأخبار والإعلانات الرسمية',
      href: '/news'
    },
    {
      icon: Users,
      title: t('about'),
      description: locale === 'fr' ? 'À propos de HAPA' : 'حول السلطة العليا',
      href: '/about'
    },
    {
      icon: Scale,
      title: t('services'),
      description: locale === 'fr' ? 'Services et procédures' : 'الخدمات والإجراءات',
      href: '/forms'
    },
    {
      icon: FileText,
      title: t('legalFramework'),
      description: locale === 'fr' ? 'Cadre juridique et réglementaire' : 'الإطار القانوني والتنظيمي',
      href: '/about/bylaws'
    },
    {
      icon: Phone,
      title: t('contact'),
      description: locale === 'fr' ? 'Nous contacter' : 'اتصل بنا',
      href: '/contact'
    }
  ]

  const popularSearches = [
    locale === 'fr' ? 'Licences' : 'تراخيص',
    locale === 'fr' ? 'Actualités' : 'أخبار',
    locale === 'fr' ? 'Décisions' : 'قرارات',
    locale === 'fr' ? 'Contact' : 'اتصال',
    locale === 'fr' ? 'Plaintes' : 'شكاوى'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section with 404 */}
      <section className="section-spacing">
        <div className="hapa-container">
          <div className="text-center max-w-4xl mx-auto">
            {/* 404 Number with HAPA Branding */}
            <div className="relative mb-8">
              <div className="text-[200px] sm:text-[250px] md:text-[300px] font-bold text-primary/20 leading-none select-none" aria-hidden="true">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg transform -rotate-3">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-lg font-semibold">{t('pageNotFound')}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('pageNotFound')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('pageNotFoundDesc')}
            </p>

            {/* Search Section */}
            <Card className="max-w-md mx-auto mb-12">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${
                      isRTL ? 'right-3' : 'left-3'
                    }`} />
                    <Input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      // className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <Search className="w-4 h-4 mr-2" />
                    {t('searchButton')}
                  </Button>
                </form>
                
                {/* Popular Searches */}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">{t('popularSearches')}:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(term)
                          router.push(`/${locale}/search?q=${encodeURIComponent(term)}`)
                        }}
                        className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  <Home className="w-5 h-5" />
                  {t('goBackHome')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/contact">
                  <HelpCircle className="w-5 h-5" />
                  {locale === 'fr' ? 'Obtenir de l\'aide' : 'الحصول على المساعدة'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Links */}
      <section className="section-spacing-sm bg-muted/30">
        <div className="hapa-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {locale === 'fr' ? 'Liens utiles' : 'روابط مفيدة'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Explorez nos services principaux et trouvez l\'information que vous recherchez'
                : 'استكشف خدماتنا الرئيسية واعثر على المعلومات التي تبحث عنها'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                  <CardContent className="p-6">
                    <Link href={link.href} className="block">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {link.description}
                          </p>
                          <div className={`flex items-center gap-2 mt-3 text-primary group-hover:gap-3 transition-all ${
                            isRTL ? 'flex-row-reverse' : ''
                          }`}>
                            <span className="text-sm font-medium">
                              {locale === 'fr' ? 'Voir plus' : 'اعرف المزيد'}
                            </span>
                            <ArrowIcon className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="section-spacing-sm bg-primary/5">
        <div className="hapa-container">
          <Card className="max-w-2xl mx-auto border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                {locale === 'fr' ? 'Besoin d\'aide immédiate ?' : 'تحتاج مساعدة فورية؟'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {locale === 'fr'
                  ? 'Notre équipe est disponible pour vous aider à naviguer sur notre site et trouver l\'information dont vous avez besoin.'
                  : 'فريقنا متاح لمساعدتك في التنقل في موقعنا والعثور على المعلومات التي تحتاجها.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/contact">
                    <Mail className="w-4 h-4" />
                    {locale === 'fr' ? 'Nous écrire' : 'راسلنا'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
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
