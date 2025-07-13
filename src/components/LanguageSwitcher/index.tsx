'use client'

import { useRouter, usePathname } from 'next/navigation'
import { locales, getLocaleName, type Locale } from '@/utilities/locale'

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
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`px-3 py-1 text-sm rounded ${
            locale === currentLocale
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {getLocaleName(locale)}
        </button>
      ))}
    </div>
  )
}