'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useParams, useSearchParams } from 'next/navigation'
import { type Locale } from '@/utilities/locale'
import { routing } from '@/i18n/routing'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const languages = [
  { code: "fr", name: "Français", flag: "/locales-flags/fr.svg" },
  { code: "ar", name: "العربية", flag: "/locales-flags/ar.svg" },
] as const

type Props = {
  label?: string;
  className?: string;
}

export const LanguageSwitcher: React.FC<Props> = ({ label, className }) => {
  const t = useTranslations()
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const searchParams = useSearchParams()

  function onSelectChange(nextLocale: string) {
    // Preserve any query parameters when switching languages
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params, query },
      { locale: nextLocale as Locale }
    )
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale)

  return (
    <div className={cn("relative inline-block", className)}>
      <Select defaultValue={currentLocale} onValueChange={onSelectChange}>
        <SelectTrigger 
          className="w-[100px] lg:w-[120px] h-8 lg:h-9 border-gray-200 bg-white hover:bg-gray-50 focus:ring-primary"
          aria-label={label || t('LocaleSwitcher.select-language')}
        >
          <SelectValue>
            {currentLanguage && (
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5 overflow-hidden rounded-sm">
                  <Image
                    src={currentLanguage.flag}
                    alt={`${currentLanguage.code} flag`}
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </div>
                <span className={cn(
                  "text-sm font-medium line-clamp-1",
                  currentLanguage.code === "ar" && "font-arabic-sans"
                )}>
                  {currentLanguage.name}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="w-[100px] lg:w-[120px]">
          {routing.locales.map((locale) => {
            const lang = languages.find((l) => l.code === locale)
            if (!lang) return null

            return (
              <SelectItem
                key={locale}
                value={locale}
                className="py-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 overflow-hidden rounded-sm">
                    <Image
                      src={lang.flag}
                      alt={`${lang.code} flag`}
                      fill
                      sizes="20px"
                      className="object-cover"
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-medium line-clamp-1",
                    lang.code === "ar" && "font-arabic-sans"
                  )}>
                    {lang.name}
                  </span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}