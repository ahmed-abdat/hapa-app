'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Check, ChevronDown, Tv } from 'lucide-react'
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

// TV Channels list with bilingual support
const tvChannels = [
  // El Mouritaniya channels (official state channels)
  { value: 'mouritaniya', label: 'El Mouritaniya', labelAr: 'الموريتانية', category: 'state' },
  { value: 'mouritaniya2', label: 'El Mouritaniya 2', labelAr: 'الموريتانية 2', category: 'state' },
  { value: 'thakafiya', label: 'Thakafiya', labelAr: 'الثقافية', category: 'state' },
  { value: 'riyadiya', label: 'Riyadiya', labelAr: 'الرياضية', category: 'state' },
  { value: 'parlement', label: 'Parlement TV', labelAr: 'البرلمانية', category: 'state' },
  
  // Private channels
  { value: 'mahdhara', label: 'Al Mahdhara TV', labelAr: 'قناة المحظرة', category: 'private' },
  { value: 'ousra', label: 'Al Ousra TV', labelAr: 'قناة الأسرة', category: 'private' },
  { value: 'mourabitoune', label: 'El Mourabitoune', labelAr: 'المرابطون', category: 'private' },
  { value: 'wataniya', label: 'El Wataniya', labelAr: 'الوطنية', category: 'private' },
  { value: 'chinguitt', label: 'Chinguitt', labelAr: 'شنقيط', category: 'private' },
  { value: 'sahel', label: 'Sahel TV', labelAr: 'قناة الساحل', category: 'private' },
  { value: 'dava', label: 'DAVA TV', labelAr: 'قناة دافا', category: 'private' },
  { value: 'medina', label: 'Elmedina TV', labelAr: 'قناة المدينة', category: 'private' },
  { value: 'sahra24', label: 'Sahra24 TV', labelAr: 'قناة صحراء 24', category: 'private' },
  { value: 'ghimem', label: 'Ghimem TV', labelAr: 'قناة قمم', category: 'private' },
  
  // Other option
  { value: 'other', label: 'Autre chaîne', labelAr: 'قناة أخرى', category: 'other' },
]

interface TVChannelComboboxProps extends Omit<FormSelectProps, 'options'> {
  locale?: 'fr' | 'ar'
}

export function TVChannelCombobox({ 
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  locale,
  ...props 
}: TVChannelComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { setValue, watch, formState: { errors } } = useFormContext()
  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const t = useTranslations()
  
  const value = watch(name)
  const error = errors[name]?.message as string | undefined
  const isRTL = effectiveLocale === 'ar'

  const options = tvChannels.map(channel => ({
    value: channel.value,
    label: effectiveLocale === 'ar' ? channel.labelAr : channel.label,
    category: channel.category,
  }))

  // Group channels by category
  const stateChannels = options.filter(ch => ch.category === 'state')
  const privateChannels = options.filter(ch => ch.category === 'private')
  const otherChannels = options.filter(ch => ch.category === 'other')

  const selectedChannel = options.find(channel => channel.value === value)
  const placeholder = effectiveLocale === 'ar' ? 'اختر القناة التلفزيونية...' : 'Sélectionner une chaîne TV...'
  const searchPlaceholder = effectiveLocale === 'ar' ? 'البحث عن القناة...' : 'Rechercher une chaîne...'
  const noResultsText = effectiveLocale === 'ar' ? 'لم يتم العثور على أي قناة.' : 'Aucune chaîne trouvée.'
  const stateChannelsLabel = effectiveLocale === 'ar' ? 'القنوات الرسمية' : 'Chaînes Officielles'
  const privateChannelsLabel = effectiveLocale === 'ar' ? 'القنوات الخاصة' : 'Chaînes Privées'

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
            {selectedChannel ? (
              <div className="flex items-center flex-grow w-0 gap-2 overflow-hidden">
                <Tv size={16} className="shrink-0 text-primary" />
                <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {selectedChannel.label}
                </bdi>
              </div>
            ) : (
              <bdi className="flex items-center gap-2">
                <Tv size={16} className="text-gray-400" />
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
          <Command className="w-full max-h-[200px] sm:max-h-[320px]" dir={isRTL ? 'rtl' : 'ltr'}>
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
              
              {/* State Channels Group */}
              <CommandGroup heading={stateChannelsLabel}>
                {stateChannels.map((channel) => (
                  <CommandItem
                    className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                    key={channel.value}
                    value={`${channel.value} ${channel.label}`}
                    onSelect={() => {
                      setValue(name, channel.value === value ? '' : channel.value)
                      setOpen(false)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                      <Tv size={16} className="shrink-0 text-green-600" />
                      <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {channel.label}
                      </bdi>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        channel.value === value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Private Channels Group */}
              <CommandGroup heading={privateChannelsLabel}>
                {privateChannels.map((channel) => (
                  <CommandItem
                    className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                    key={channel.value}
                    value={`${channel.value} ${channel.label}`}
                    onSelect={() => {
                      setValue(name, channel.value === value ? '' : channel.value)
                      setOpen(false)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                      <Tv size={16} className="shrink-0 text-blue-600" />
                      <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {channel.label}
                      </bdi>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        channel.value === value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Other Channels */}
              {otherChannels.map((channel) => (
                <CommandItem
                  className="flex items-center w-full gap-2 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors duration-150"
                  key={channel.value}
                  value={`${channel.value} ${channel.label}`}
                  onSelect={() => {
                    setValue(name, channel.value === value ? '' : channel.value)
                    setOpen(false)
                  }}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex flex-grow w-0 gap-2 overflow-hidden">
                    <Tv size={16} className="shrink-0 text-gray-500" />
                    <bdi className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {channel.label}
                    </bdi>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      channel.value === value ? "opacity-100 text-primary" : "opacity-0"
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