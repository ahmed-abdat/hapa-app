'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function LocaleHandler() {
  const pathname = usePathname()

  useEffect(() => {
    // Extract locale from pathname
    const locale = pathname.split('/')[1] || 'fr'
    const isArabic = locale === 'ar'
    const direction = isArabic ? 'rtl' : 'ltr'
    const language = ['fr', 'ar'].includes(locale) ? locale : 'fr'

    // Update HTML attributes
    document.documentElement.lang = language
    document.documentElement.dir = direction
    
    // Apply Arabic font classes automatically
    const body = document.body
    if (isArabic) {
      body.classList.add('font-arabic-sans')
      body.classList.remove('font-sans')
    } else {
      body.classList.add('font-sans')
      body.classList.remove('font-arabic-sans')
    }
  }, [pathname])

  return null
}