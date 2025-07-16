'use client'

import { useRouter, usePathname } from 'next/navigation'
import { type Locale } from '@/utilities/locale'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  currentLocale: Locale
}

const languages = [
  { code: "fr", name: "Français", flag: "/flags/fr.svg" },
  { code: "ar", name: "العربية", flag: "/flags/ar.svg" },
] as const

export const LanguageSwitcher: React.FC<Props> = ({ currentLocale }) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale)

  return (
    <div className="relative">
      <Select value={currentLocale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-[100px] lg:w-[120px] h-8 lg:h-9 border-gray-200 bg-white hover:bg-gray-50 focus:ring-primary">
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
                <span className="text-sm font-medium line-clamp-1">
                  {currentLanguage.name}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="w-[100px] lg:w-[120px]">
          {languages.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              className="py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5 overflow-hidden rounded-sm">
                  <Image
                    src={language.flag}
                    alt={`${language.code} flag`}
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium line-clamp-1">
                  {language.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}