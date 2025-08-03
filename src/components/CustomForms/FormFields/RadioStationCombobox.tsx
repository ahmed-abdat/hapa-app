'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Check, ChevronDown, Radio } from 'lucide-react'
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

// Radio Stations list with bilingual support - matches official HAPA specification
const radioStations = [
  // Radio Mauritanie (official state radio network)
  { value: 'radio_mauritanie', label: 'Radio Mauritanie', labelAr: 'إذاعة موريتانيا الأم', category: 'state' },
  { value: 'radio_coran', label: 'Radio Coran', labelAr: 'إذاعة القرآن الكريم', category: 'state' },
  { value: 'radio_scolaire', label: 'Radio scolaire', labelAr: 'الاذاعة المدرسية', category: 'state' },
  { value: 'radio_jeunesse', label: 'Radio Jeunesse', labelAr: 'إذاعة الشباب', category: 'state' },
  { value: 'radio_culture', label: 'Radio culture', labelAr: 'الإذاعة الثقافية', category: 'state' },
  { value: 'radio_sante', label: 'Radio Éducation à la santé', labelAr: 'إذاعة التثقيف الصحي', category: 'state' },
  { value: 'radio_rurale', label: 'Radio rurale', labelAr: 'الإذاعة الريفية', category: 'state' },
  
  // Private radio stations
  { value: 'radio_mauritanides', label: 'Radio Mauritanides', labelAr: 'إذاعة موريتانيد', category: 'private' },
  { value: 'radio_koubeni', label: 'Radio Koubeni', labelAr: 'إذاعة كوبني', category: 'private' },
  { value: 'radio_tenwir', label: 'Radio Tenwir', labelAr: 'إذاعة التنوير', category: 'private' },
  
  // Other option
  { value: 'other', label: 'Autre station', labelAr: 'محطة أخرى', category: 'other' },
]

interface RadioStationComboboxProps extends Omit<FormSelectProps, 'options'> {
  locale?: 'fr' | 'ar'
}

export function RadioStationCombobox({ 
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  locale,
  ...props 
}: RadioStationComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { setValue, watch, formState: { errors } } = useFormContext()
  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const t = useTranslations()
  
  const value = watch(name)
  const error = errors[name]?.message as string | undefined
  const isRTL = effectiveLocale === 'ar'

  const options = radioStations.map(station => ({
    value: station.value,
    label: effectiveLocale === 'ar' ? station.labelAr : station.label,
    category: station.category,
  }))

  // Group stations by category
  const stateStations = options.filter(st => st.category === 'state')
  const privateStations = options.filter(st => st.category === 'private')
  const regionalStations = options.filter(st => st.category === 'regional')
  const otherStations = options.filter(st => st.category === 'other')

  const selectedStation = options.find(station => station.value === value)
  const placeholder = effectiveLocale === 'ar' ? 'اختر المحطة الإذاعية...' : 'Sélectionner une station radio...'
  const searchPlaceholder = effectiveLocale === 'ar' ? 'البحث عن المحطة...' : 'Rechercher une station...'
  const noResultsText = effectiveLocale === 'ar' ? 'لم يتم العثور على أي محطة.' : 'Aucune station trouvée.'
  const stateStationsLabel = effectiveLocale === 'ar' ? 'الإذاعات الرسمية' : 'Radios Officielles'
  const privateStationsLabel = effectiveLocale === 'ar' ? 'الإذاعات الخاصة' : 'Radios Privées'
  const regionalStationsLabel = effectiveLocale === 'ar' ? 'الإذاعات الجهوية' : 'Radios Régionales'

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
            {selectedStation ? (
              <div className="flex items-center flex-grow w-0 gap-2 overflow-hidden">
                <Radio size={16} className="shrink-0 text-primary" />
                <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {selectedStation.label}
                </bdi>
              </div>
            ) : (
              <bdi className="flex items-center gap-2">
                <Radio size={16} className="text-gray-400" />
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
          <Command className="w-full max-h-[200px] sm:max-h-[360px]" dir={isRTL ? 'rtl' : 'ltr'}>
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
              
              {/* State Stations Group */}
              <CommandGroup heading={stateStationsLabel}>
                {stateStations.map((station) => (
                  <CommandItem
                    className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                    key={station.value}
                    value={`${station.value} ${station.label}`}
                    onSelect={() => {
                      setValue(name, station.value === value ? '' : station.value)
                      setOpen(false)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                      <Radio size={16} className="shrink-0 text-green-600" />
                      <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {station.label}
                      </bdi>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        station.value === value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Private Stations Group */}
              <CommandGroup heading={privateStationsLabel}>
                {privateStations.map((station) => (
                  <CommandItem
                    className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                    key={station.value}
                    value={`${station.value} ${station.label}`}
                    onSelect={() => {
                      setValue(name, station.value === value ? '' : station.value)
                      setOpen(false)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                      <Radio size={16} className="shrink-0 text-blue-600" />
                      <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {station.label}
                      </bdi>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        station.value === value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Regional Stations Group */}
              <CommandGroup heading={regionalStationsLabel}>
                {regionalStations.map((station) => (
                  <CommandItem
                    className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                    key={station.value}
                    value={`${station.value} ${station.label}`}
                    onSelect={() => {
                      setValue(name, station.value === value ? '' : station.value)
                      setOpen(false)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                      <Radio size={16} className="shrink-0 text-purple-600" />
                      <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {station.label}
                      </bdi>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        station.value === value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Other Stations */}
              {otherStations.map((station) => (
                <CommandItem
                  className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                  key={station.value}
                  value={`${station.value} ${station.label}`}
                  onSelect={() => {
                    setValue(name, station.value === value ? '' : station.value)
                    setOpen(false)
                  }}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                    <Radio size={16} className="shrink-0 text-gray-500" />
                    <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {station.label}
                    </bdi>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      station.value === value ? "opacity-100 text-primary" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
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