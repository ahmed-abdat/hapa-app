'use client'

import { useRouter, usePathname } from 'next/navigation'
import { locales, getLocaleName, type Locale } from '@/utilities/locale'
import { Globe } from 'lucide-react'

type Props = {
  currentLocale: Locale
}

export const LanguageSwitcher: React.FC<Props> = ({ currentLocale }) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-primary" />
      <div className="flex gap-1">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              locale === currentLocale
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-700 hover:text-primary hover:bg-gray-50'
            }`}
            aria-label={`Switch to ${getLocaleName(locale)}`}
          >
            {getLocaleName(locale)}
          </button>
        ))}
      </div>
    </div>
  )
}