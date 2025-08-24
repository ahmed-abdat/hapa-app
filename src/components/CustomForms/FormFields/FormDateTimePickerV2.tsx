'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { CalendarIcon, Cross2Icon, Pencil1Icon, ReaderIcon } from '@radix-ui/react-icons'
import { format, parse, isValid } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'
import { type Locale } from '@/utilities/locale'
import { FormFieldProps } from '../types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface FormDateTimePickerV2Props extends Omit<FormFieldProps, 'placeholder'> {
  placeholder?: string
  dateOnly?: boolean
  locale?: 'fr' | 'ar'
  defaultMode?: 'input' | 'picker' // Default input mode
}

export function FormDateTimePickerV2({
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  placeholder,
  dateOnly = false,
  locale,
  defaultMode = 'picker',
  ...props
}: FormDateTimePickerV2Props) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)
  const [inputMode, setInputMode] = React.useState<'input' | 'picker'>(defaultMode)
  
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const isRTL = effectiveLocale === 'ar'
  const error = errors[name]?.message as string | undefined

  const dateLocale = effectiveLocale === 'ar' ? ar : fr
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  const formatDate = (date: Date) => {
    if (dateOnly) {
      return effectiveLocale === 'ar' 
        ? format(date, 'yyyy/MM/dd', { locale: dateLocale })
        : format(date, 'dd/MM/yyyy', { locale: dateLocale })
    }
    return effectiveLocale === 'ar'
      ? format(date, 'yyyy/MM/dd HH:mm', { locale: dateLocale })
      : format(date, 'dd/MM/yyyy HH:mm', { locale: dateLocale })
  }

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    if (dateOnly) {
      return effectiveLocale === 'ar' ? 'yyyy/MM/dd' : 'dd/MM/yyyy'
    }
    return effectiveLocale === 'ar' ? 'yyyy/MM/dd HH:mm' : 'dd/MM/yyyy HH:mm'
  }

  // Parse date from various input formats
  const parseInputDate = (input: string): Date | null => {
    if (!input) return null
    
    const formats = dateOnly 
      ? effectiveLocale === 'ar'
        ? ['yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy.MM.dd']
        : ['dd/MM/yyyy', 'dd-MM-yyyy', 'dd.MM.yyyy']
      : effectiveLocale === 'ar'
        ? ['yyyy/MM/dd HH:mm', 'yyyy-MM-dd HH:mm', 'yyyy/MM/dd HH:mm:ss']
        : ['dd/MM/yyyy HH:mm', 'dd-MM-yyyy HH:mm', 'dd/MM/yyyy HH:mm:ss']

    for (const formatStr of formats) {
      const parsed = parse(input, formatStr, new Date())
      if (isValid(parsed)) {
        return parsed
      }
    }
    return null
  }

  // Format input value for display
  const formatInputValue = (value: string) => {
    // Apply basic masking for date input
    let formatted = value.replace(/[^0-9/:. -]/g, '')
    
    if (dateOnly) {
      // Auto-insert separators for date
      if (effectiveLocale === 'ar') {
        // yyyy/MM/dd format
        if (formatted.length === 4 && !formatted.includes('/')) {
          formatted += '/'
        } else if (formatted.length === 7 && formatted.split('/').length === 2) {
          formatted += '/'
        }
      } else {
        // dd/MM/yyyy format
        if (formatted.length === 2 && !formatted.includes('/')) {
          formatted += '/'
        } else if (formatted.length === 5 && formatted.split('/').length === 2) {
          formatted += '/'
        }
      }
    }
    
    return formatted
  }

  const handleTimeChange = (
    date: Date,
    type: 'hour' | 'minute',
    value: string
  ) => {
    const newDate = new Date(date)
    if (type === 'hour') {
      newDate.setHours(parseInt(value))
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(value))
    }
    return newDate
  }

  const getModeTooltip = () => {
    if (inputMode === 'input') {
      return effectiveLocale === 'ar' 
        ? 'التبديل إلى منتقي التاريخ' 
        : 'Basculer vers le sélecteur de date'
    }
    return effectiveLocale === 'ar' 
      ? 'التبديل إلى الإدخال اليدوي' 
      : 'Basculer vers la saisie manuelle'
  }

  const getModeIcon = () => {
    return inputMode === 'input' ? <CalendarIcon className="h-4 w-4" /> : <Pencil1Icon className="h-4 w-4" />
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          <bdi>
            {label}
            {required && <span className="text-red-500 ms-1">*</span>}
          </bdi>
        </Label>
        
        {/* Mode Toggle Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInputMode(prev => prev === 'input' ? 'picker' : 'input')}
                className="h-7 px-2 text-xs text-gray-600 hover:text-primary"
                disabled={disabled}
              >
                {getModeIcon()}
                <span className="ms-1 hidden sm:inline">
                  {inputMode === 'input' 
                    ? (effectiveLocale === 'ar' ? 'منتقي' : 'Calendrier')
                    : (effectiveLocale === 'ar' ? 'يدوي' : 'Manuel')}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getModeTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Sync input value with field value
          React.useEffect(() => {
            if (field.value && !isFocused) {
              setInputValue(formatDate(new Date(field.value)))
            } else if (!field.value && !isFocused) {
              setInputValue('')
            }
          }, [field.value])

          const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatInputValue(e.target.value)
            setInputValue(formatted)
            
            // Try to parse and update field value
            const parsed = parseInputDate(formatted)
            if (parsed) {
              field.onChange(parsed.toISOString())
            }
          }

          const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault() // Prevent form submission
              const parsed = parseInputDate(inputValue)
              if (parsed) {
                field.onChange(parsed.toISOString())
                setInputValue(formatDate(parsed))
              } else if (inputValue) {
                // Invalid input - reset to previous value or clear
                if (field.value) {
                  setInputValue(formatDate(new Date(field.value)))
                } else {
                  setInputValue('')
                  field.onChange(null)
                }
              }
              // Remove focus to trigger validation
              ;(e.target as HTMLInputElement).blur()
            }
          }

          const handleInputBlur = () => {
            setIsFocused(false)
            // Validate and format on blur
            const parsed = parseInputDate(inputValue)
            if (parsed) {
              field.onChange(parsed.toISOString())
              setInputValue(formatDate(parsed))
            } else if (inputValue) {
              // Invalid input - reset to previous value or clear
              if (field.value) {
                setInputValue(formatDate(new Date(field.value)))
              } else {
                setInputValue('')
                field.onChange(null)
              }
            } else {
              // Empty input - clear the field
              field.onChange(null)
            }
          }

          const handleClear = () => {
            field.onChange(null)
            setInputValue('')
            setIsOpen(false)
          }

          // Manual Input Mode
          if (inputMode === 'input') {
            return (
              <div className="relative w-full">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={handleInputBlur}
                  placeholder={getPlaceholder()}
                  disabled={disabled}
                  className={cn(
                    "h-12 w-full transition-all duration-200",
                    field.value ? "pe-10" : "pe-3",
                    "hover:border-primary/30",
                    error 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400' 
                      : 'border-gray-200 focus:border-primary focus:ring-primary/20',
                    isRTL ? "text-right" : "text-left",
                    "text-sm sm:text-base"
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                
                {/* Clear button */}
                {field.value && !disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent",
                      isRTL ? "left-1" : "right-1"
                    )}
                  >
                    <Cross2Icon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                )}
              </div>
            )
          }

          // Calendar Picker Mode
          return (
            <div className="relative w-full">
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "flex h-12 w-full items-center justify-between whitespace-nowrap rounded-lg border-2 bg-transparent px-4 py-2 text-sm shadow-sm transition-all duration-200",
                      "hover:bg-primary/5 hover:border-primary/30",
                      error 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400 hover:bg-red-50' 
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20',
                      !field.value && "text-muted-foreground"
                    )}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <bdi className="text-start">
                        {field.value ? (
                          formatDate(new Date(field.value))
                        ) : (
                          <span>{getPlaceholder()}</span>
                        )}
                      </bdi>
                    </span>
                    {field.value && !disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClear()
                        }}
                        className="h-6 w-6 p-0 hover:bg-transparent ms-2"
                      >
                        <Cross2Icon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      </Button>
                    )}
                  </Button>
                </PopoverTrigger>
                
                <PopoverContent 
                  className="w-auto p-0 z-50"
                  align="start"
                  sideOffset={5}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex flex-col sm:flex-row">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          if (dateOnly) {
                            field.onChange(date.toISOString())
                            setIsOpen(false)
                          } else {
                            // Preserve existing time or set to current time
                            const existingDate = field.value ? new Date(field.value) : new Date()
                            date.setHours(existingDate.getHours())
                            date.setMinutes(existingDate.getMinutes())
                            field.onChange(date.toISOString())
                          }
                        }
                      }}
                      initialFocus
                      locale={dateLocale}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      captionLayout="dropdown"
                      className={cn(
                        "max-w-full",
                        // Primary color hover states for calendar navigation arrows
                        "[&_.rdp-button_previous:hover]:bg-primary/10 [&_.rdp-button_previous:hover]:text-primary",
                        "[&_.rdp-button_next:hover]:bg-primary/10 [&_.rdp-button_next:hover]:text-primary",
                        // Primary color hover states for calendar days
                        "[&_.rdp-day_button:hover]:bg-primary/10 [&_.rdp-day_button:hover]:text-primary",
                        // Today styling (only when not selected)
                        "[&_.rdp-day_today:not([data-selected])]:bg-primary/10 [&_.rdp-day_today:not([data-selected])]:text-primary [&_.rdp-day_today:not([data-selected])]:font-medium",
                        // Selected day styling (takes precedence over today)
                        "[&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground [&_.rdp-day_selected]:font-medium",
                        // Ensure selected state overrides today when both apply
                        "[&_[data-selected][data-today]]:bg-primary [&_[data-selected][data-today]]:text-primary-foreground",
                        // Mobile optimization
                        "[&_.rdp-caption]:text-sm sm:text-base",
                        "[&_.rdp-day]:text-sm sm:text-base"
                      )}
                    />
                    
                    {!dateOnly && (
                      <div 
                        className="flex flex-row sm:flex-col sm:h-[300px] divide-x sm:divide-y sm:divide-x-0 border-t sm:border-t-0 sm:border-s"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {/* Hours */}
                        <ScrollArea className="flex-1 h-[200px] sm:h-auto sm:w-[80px]" dir={isRTL ? 'rtl' : 'ltr'}>
                          <div className="grid grid-cols-4 sm:grid-cols-2 p-2 gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
                            {hours.map((hour) => (
                              <Button
                                key={hour}
                                size="sm"
                                variant={
                                  field.value && new Date(field.value).getHours() === hour
                                    ? "default"
                                    : "ghost"
                                }
                                className="w-full h-8 text-xs"
                                onClick={() => {
                                  const currentDate = field.value ? new Date(field.value) : new Date()
                                  const newDate = handleTimeChange(currentDate, 'hour', hour.toString())
                                  field.onChange(newDate.toISOString())
                                }}
                              >
                                <bdi dir={isRTL ? 'rtl' : 'ltr'}>{hour.toString().padStart(2, '0')}</bdi>
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>

                        {/* Minutes */}
                        <ScrollArea className="flex-1 h-[200px] sm:h-auto sm:w-[80px]" dir={isRTL ? 'rtl' : 'ltr'}>
                          <div className="grid grid-cols-3 sm:grid-cols-2 p-2 gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
                            {minutes.map((minute) => (
                              <Button
                                key={minute}
                                size="sm"
                                variant={
                                  field.value && new Date(field.value).getMinutes() === minute
                                    ? "default"
                                    : "ghost"
                                }
                                className="w-full h-8 text-xs"
                                onClick={() => {
                                  const currentDate = field.value ? new Date(field.value) : new Date()
                                  const newDate = handleTimeChange(currentDate, 'minute', minute.toString())
                                  field.onChange(newDate.toISOString())
                                }}
                              >
                                <bdi dir={isRTL ? 'rtl' : 'ltr'}>{minute.toString().padStart(2, '0')}</bdi>
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )
        }}
      />

      {error && (
        <p className="text-sm text-red-600 mt-1">
          <bdi>{error}</bdi>
        </p>
      )}
    </div>
  )
}