'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { type Locale } from '@/utilities/locale'
import { type FormSelectProps } from '../types'

// Enhanced country list with ISO alpha-2 codes and bilingual support
const countries = [
  // Mauritania and neighboring countries (prioritized for HAPA)
  { value: 'MR', alpha2: 'MR', label: 'Mauritanie', labelAr: 'موريتانيا' },
  { value: 'MA', alpha2: 'MA', label: 'Maroc', labelAr: 'المغرب' },
  { value: 'DZ', alpha2: 'DZ', label: 'Algérie', labelAr: 'الجزائر' },
  { value: 'TN', alpha2: 'TN', label: 'Tunisie', labelAr: 'تونس' },
  { value: 'SN', alpha2: 'SN', label: 'Sénégal', labelAr: 'السنغال' },
  { value: 'ML', alpha2: 'ML', label: 'Mali', labelAr: 'مالي' },
  
  // West Africa
  { value: 'BF', alpha2: 'BF', label: 'Burkina Faso', labelAr: 'بوركينا فاسو' },
  { value: 'CI', alpha2: 'CI', label: 'Côte d\'Ivoire', labelAr: 'ساحل العاج' },
  { value: 'GH', alpha2: 'GH', label: 'Ghana', labelAr: 'غانا' },
  { value: 'GN', alpha2: 'GN', label: 'Guinée', labelAr: 'غينيا' },
  { value: 'GW', alpha2: 'GW', label: 'Guinée-Bissau', labelAr: 'غينيا بيساو' },
  { value: 'LR', alpha2: 'LR', label: 'Liberia', labelAr: 'ليبيريا' },
  { value: 'NE', alpha2: 'NE', label: 'Niger', labelAr: 'النيجر' },
  { value: 'NG', alpha2: 'NG', label: 'Nigeria', labelAr: 'نيجيريا' },
  { value: 'SL', alpha2: 'SL', label: 'Sierra Leone', labelAr: 'سيراليون' },
  { value: 'TG', alpha2: 'TG', label: 'Togo', labelAr: 'توغو' },
  
  // North Africa & Middle East
  { value: 'EG', alpha2: 'EG', label: 'Égypte', labelAr: 'مصر' },
  { value: 'LY', alpha2: 'LY', label: 'Libye', labelAr: 'ليبيا' },
  { value: 'SD', alpha2: 'SD', label: 'Soudan', labelAr: 'السودان' },
  { value: 'TD', alpha2: 'TD', label: 'Tchad', labelAr: 'تشاد' },
  { value: 'AE', alpha2: 'AE', label: 'Émirats arabes unis', labelAr: 'الإمارات العربية المتحدة' },
  { value: 'SA', alpha2: 'SA', label: 'Arabie saoudite', labelAr: 'المملكة العربية السعودية' },
  { value: 'QA', alpha2: 'QA', label: 'Qatar', labelAr: 'قطر' },
  { value: 'KW', alpha2: 'KW', label: 'Koweït', labelAr: 'الكويت' },
  { value: 'BH', alpha2: 'BH', label: 'Bahreïn', labelAr: 'البحرين' },
  { value: 'OM', alpha2: 'OM', label: 'Oman', labelAr: 'عمان' },
  { value: 'JO', alpha2: 'JO', label: 'Jordanie', labelAr: 'الأردن' },
  { value: 'LB', alpha2: 'LB', label: 'Liban', labelAr: 'لبنان' },
  { value: 'SY', alpha2: 'SY', label: 'Syrie', labelAr: 'سوريا' },
  { value: 'IQ', alpha2: 'IQ', label: 'Iraq', labelAr: 'العراق' },
  { value: 'IR', alpha2: 'IR', label: 'Iran', labelAr: 'إيران' },
  { value: 'TR', alpha2: 'TR', label: 'Turquie', labelAr: 'تركيا' },
  { value: 'AF', alpha2: 'AF', label: 'Afghanistan', labelAr: 'أفغانستان' },
  { value: 'PK', alpha2: 'PK', label: 'Pakistan', labelAr: 'باكستان' },
  
  // Europe (Major countries)
  { value: 'FR', alpha2: 'FR', label: 'France', labelAr: 'فرنسا' },
  { value: 'ES', alpha2: 'ES', label: 'Espagne', labelAr: 'إسبانيا' },
  { value: 'GB', alpha2: 'GB', label: 'Royaume-Uni', labelAr: 'المملكة المتحدة' },
  { value: 'DE', alpha2: 'DE', label: 'Allemagne', labelAr: 'ألمانيا' },
  { value: 'IT', alpha2: 'IT', label: 'Italie', labelAr: 'إيطاليا' },
  { value: 'PT', alpha2: 'PT', label: 'Portugal', labelAr: 'البرتغال' },
  { value: 'NL', alpha2: 'NL', label: 'Pays-Bas', labelAr: 'هولندا' },
  { value: 'BE', alpha2: 'BE', label: 'Belgique', labelAr: 'بلجيكا' },
  { value: 'CH', alpha2: 'CH', label: 'Suisse', labelAr: 'سويسرا' },
  { value: 'AT', alpha2: 'AT', label: 'Autriche', labelAr: 'النمسا' },
  { value: 'SE', alpha2: 'SE', label: 'Suède', labelAr: 'السويد' },
  { value: 'NO', alpha2: 'NO', label: 'Norvège', labelAr: 'النرويج' },
  { value: 'DK', alpha2: 'DK', label: 'Danemark', labelAr: 'الدنمارك' },
  { value: 'FI', alpha2: 'FI', label: 'Finlande', labelAr: 'فنلندا' },
  { value: 'PL', alpha2: 'PL', label: 'Pologne', labelAr: 'بولندا' },
  { value: 'CZ', alpha2: 'CZ', label: 'République tchèque', labelAr: 'التشيك' },
  { value: 'HU', alpha2: 'HU', label: 'Hongrie', labelAr: 'هنغاريا' },
  { value: 'RO', alpha2: 'RO', label: 'Roumanie', labelAr: 'رومانيا' },
  { value: 'BG', alpha2: 'BG', label: 'Bulgarie', labelAr: 'بلغاريا' },
  { value: 'GR', alpha2: 'GR', label: 'Grèce', labelAr: 'اليونان' },
  { value: 'RU', alpha2: 'RU', label: 'Russie', labelAr: 'روسيا' },
  { value: 'UA', alpha2: 'UA', label: 'Ukraine', labelAr: 'أوكرانيا' },
  
  // Americas
  { value: 'US', alpha2: 'US', label: 'États-Unis', labelAr: 'الولايات المتحدة' },
  { value: 'CA', alpha2: 'CA', label: 'Canada', labelAr: 'كندا' },
  { value: 'MX', alpha2: 'MX', label: 'Mexique', labelAr: 'المكسيك' },
  { value: 'BR', alpha2: 'BR', label: 'Brésil', labelAr: 'البرازيل' },
  { value: 'AR', alpha2: 'AR', label: 'Argentine', labelAr: 'الأرجنتين' },
  { value: 'CL', alpha2: 'CL', label: 'Chili', labelAr: 'تشيلي' },
  { value: 'PE', alpha2: 'PE', label: 'Pérou', labelAr: 'بيرو' },
  { value: 'CO', alpha2: 'CO', label: 'Colombie', labelAr: 'كولومبيا' },
  { value: 'VE', alpha2: 'VE', label: 'Venezuela', labelAr: 'فنزويلا' },
  
  // Asia-Pacific
  { value: 'CN', alpha2: 'CN', label: 'Chine', labelAr: 'الصين' },
  { value: 'JP', alpha2: 'JP', label: 'Japon', labelAr: 'اليابان' },
  { value: 'KR', alpha2: 'KR', label: 'Corée du Sud', labelAr: 'كوريا الجنوبية' },
  { value: 'IN', alpha2: 'IN', label: 'Inde', labelAr: 'الهند' },
  { value: 'BD', alpha2: 'BD', label: 'Bangladesh', labelAr: 'بنغلاديش' },
  { value: 'ID', alpha2: 'ID', label: 'Indonésie', labelAr: 'إندونيسيا' },
  { value: 'MY', alpha2: 'MY', label: 'Malaisie', labelAr: 'ماليزيا' },
  { value: 'TH', alpha2: 'TH', label: 'Thaïlande', labelAr: 'تايلاند' },
  { value: 'VN', alpha2: 'VN', label: 'Vietnam', labelAr: 'فيتنام' },
  { value: 'PH', alpha2: 'PH', label: 'Philippines', labelAr: 'الفلبين' },
  { value: 'SG', alpha2: 'SG', label: 'Singapour', labelAr: 'سنغافورة' },
  { value: 'LK', alpha2: 'LK', label: 'Sri Lanka', labelAr: 'سريلانكا' },
  { value: 'AU', alpha2: 'AU', label: 'Australie', labelAr: 'أستراليا' },
  { value: 'NZ', alpha2: 'NZ', label: 'Nouvelle-Zélande', labelAr: 'نيوزيلندا' },
  
  // Central/East Africa
  { value: 'ET', alpha2: 'ET', label: 'Éthiopie', labelAr: 'إثيوبيا' },
  { value: 'KE', alpha2: 'KE', label: 'Kenya', labelAr: 'كينيا' },
  { value: 'TZ', alpha2: 'TZ', label: 'Tanzanie', labelAr: 'تنزانيا' },
  { value: 'UG', alpha2: 'UG', label: 'Ouganda', labelAr: 'أوغندا' },
  { value: 'RW', alpha2: 'RW', label: 'Rwanda', labelAr: 'رواندا' },
  { value: 'BI', alpha2: 'BI', label: 'Burundi', labelAr: 'بوروندي' },
  { value: 'CD', alpha2: 'CD', label: 'RD Congo', labelAr: 'جمهورية الكونغو الديمقراطية' },
  { value: 'CF', alpha2: 'CF', label: 'Centrafrique', labelAr: 'جمهورية أفريقيا الوسطى' },
  { value: 'CM', alpha2: 'CM', label: 'Cameroun', labelAr: 'الكاميرون' },
  { value: 'GA', alpha2: 'GA', label: 'Gabon', labelAr: 'الغابون' },
  { value: 'CG', alpha2: 'CG', label: 'Congo', labelAr: 'الكونغو' },
  { value: 'AO', alpha2: 'AO', label: 'Angola', labelAr: 'أنغولا' },
  { value: 'ZM', alpha2: 'ZM', label: 'Zambie', labelAr: 'زامبيا' },
  { value: 'ZW', alpha2: 'ZW', label: 'Zimbabwe', labelAr: 'زيمبابوي' },
  { value: 'BW', alpha2: 'BW', label: 'Botswana', labelAr: 'بوتسوانا' },
  { value: 'ZA', alpha2: 'ZA', label: 'Afrique du Sud', labelAr: 'جنوب أفريقيا' },
  { value: 'NA', alpha2: 'NA', label: 'Namibie', labelAr: 'ناميبيا' },
  
  // Additional countries from different regions
  { value: 'IL', alpha2: 'IL', label: 'Israël', labelAr: 'إسرائيل' },
  { value: 'PS', alpha2: 'PS', label: 'Palestine', labelAr: 'فلسطين' },
  { value: 'CY', alpha2: 'CY', label: 'Chypre', labelAr: 'قبرص' },
  { value: 'MT', alpha2: 'MT', label: 'Malte', labelAr: 'مالطا' },
  { value: 'IS', alpha2: 'IS', label: 'Islande', labelAr: 'أيسلندا' },
  { value: 'IE', alpha2: 'IE', label: 'Irlande', labelAr: 'أيرلندا' },
  { value: 'LU', alpha2: 'LU', label: 'Luxembourg', labelAr: 'لوكسمبورغ' },
  
  // Other
  { value: 'OTHER', alpha2: null, label: 'Autre pays', labelAr: 'دولة أخرى' },
]

// Helper function to get flag URL using country-flag-icons path structure
const getFlagUrl = (countryCode: string | null): string => {
  if (!countryCode) return '/flags/globe.svg' // fallback
  // Use the static flag images from country-flag-icons (uppercase format)
  return `/flags/${countryCode.toUpperCase()}.svg`
}

interface CountryComboboxProps extends Omit<FormSelectProps, 'options'> {
  locale?: 'fr' | 'ar'
}

export function CountryCombobox({ 
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  locale,
  ...props 
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { setValue, watch, formState: { errors } } = useFormContext()
  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const t = useTranslations()
  
  const value = watch(name)
  const error = errors[name]?.message as string | undefined
  const isRTL = effectiveLocale === 'ar'

  const options = countries.map(country => ({
    value: country.value,
    alpha2: country.alpha2,
    label: effectiveLocale === 'ar' ? country.labelAr : country.label,
  }))

  const selectedCountry = options.find(country => country.value === value)
  const placeholder = effectiveLocale === 'ar' ? 'اختر البلد...' : 'Sélectionner un pays...'
  const searchPlaceholder = effectiveLocale === 'ar' ? 'البحث عن البلد...' : 'Rechercher un pays...'
  const noResultsText = effectiveLocale === 'ar' ? 'لم يتم العثور على أي بلد.' : 'Aucun pays trouvé.'

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </bdi>
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex h-12 w-full items-center justify-between whitespace-nowrap rounded-lg border-2 bg-transparent px-4 py-2 text-sm shadow-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
              "hover:bg-primary/5 hover:border-primary/30 hover:text-primary",
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400 hover:bg-red-50' 
                : 'border-gray-200 focus:border-primary focus:ring-primary/20',
              !value && "text-muted-foreground hover:text-primary"
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {selectedCountry ? (
              <div className="flex items-center flex-grow w-0 gap-2 overflow-hidden">
                {selectedCountry.alpha2 ? (
                  <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                    <img
                      src={getFlagUrl(selectedCountry.alpha2)}
                      alt={`${selectedCountry.label} flag`}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show globe icon as fallback
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Globe size={16} className="shrink-0 text-gray-500" />
                )}
                <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {selectedCountry.label}
                </bdi>
              </div>
            ) : (
              <bdi className="flex items-center gap-2">
                <Globe size={16} className="text-gray-400" />
                {placeholder}
              </bdi>
            )}
            <ChevronDown size={16} className="shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          collisionPadding={10}
          side="bottom"
          className="min-w-[--radix-popper-anchor-width] p-0"
          align={isRTL ? "end" : "start"}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <Command className="w-full max-h-[200px] sm:max-h-[270px]" dir={isRTL ? 'rtl' : 'ltr'}>
            <CommandList>
              <div className="sticky top-0 z-10 bg-popover">
                <CommandInput 
                  placeholder={searchPlaceholder}
                  className="h-9"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <CommandEmpty>
                <bdi>{noResultsText}</bdi>
              </CommandEmpty>
              <CommandGroup>
                {options.map((country) => (
                  <CommandItem
                    className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                    key={country.value}
                    value={`${country.value} ${country.label}`}
                    onSelect={() => {
                      setValue(name, country.value === value ? '' : country.value)
                      setOpen(false)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                      {country.alpha2 ? (
                        <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                          <img
                            src={getFlagUrl(country.alpha2)}
                            alt={`${country.label} flag`}
                            width={20}
                            height={20}
                            className="w-5 h-5 object-cover rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <Globe size={16} className="shrink-0 text-gray-500" />
                      )}
                      <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {country.label}
                      </bdi>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        country.value === value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">
          <bdi>{error}</bdi>
        </p>
      )}
    </div>
  )
}