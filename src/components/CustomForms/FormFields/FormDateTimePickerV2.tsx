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
  use12Hour?: boolean // Use 12-hour format with AM/PM
  minuteInterval?: 1 | 5 | 10 | 15 | 30 // Minute selection intervals
  minDate?: Date // Minimum selectable date
  maxDate?: Date // Maximum selectable date
  showTodayButton?: boolean // Show "Today" button
  showClearButton?: boolean // Show "Clear" button
  mobileNative?: boolean // Use native picker on mobile
  helperText?: string // Helper text to show below the input
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
  defaultMode = 'input',
  use12Hour,
  minuteInterval = 5,
  minDate,
  maxDate,
  showTodayButton = true,
  showClearButton = true,
  mobileNative = false,
  helperText,
  ...props
}: FormDateTimePickerV2Props) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)
  const [inputMode, setInputMode] = React.useState<'input' | 'picker'>(defaultMode)
  const [validationError, setValidationError] = React.useState<string | undefined>()
  
  const {
    control,
    formState: { errors },
    watch,
    trigger
  } = useFormContext()

  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const isRTL = effectiveLocale === 'ar'
  const error = errors[name]?.message as string | undefined
  
  // Determine whether to use 12-hour format (default true for English-like locales)
  const use12HourFormat = use12Hour !== undefined ? use12Hour : effectiveLocale === 'fr' ? false : true
  
  // Check if device is mobile
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const dateLocale = effectiveLocale === 'ar' ? ar : fr
  
  // Generate hours based on format
  const hours = use12HourFormat 
    ? Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i)
    : Array.from({ length: 24 }, (_, i) => i)
  
  // Generate minutes based on interval
  const minutes = Array.from({ length: 60 / minuteInterval }, (_, i) => i * minuteInterval)

  const formatDate = React.useCallback((date: Date) => {
    if (dateOnly) {
      return effectiveLocale === 'ar' 
        ? format(date, 'yyyy/MM/dd', { locale: dateLocale })
        : format(date, 'dd/MM/yyyy', { locale: dateLocale })
    }
    
    // Handle 12-hour format
    if (use12HourFormat) {
      return effectiveLocale === 'ar'
        ? format(date, 'yyyy/MM/dd hh:mm a', { locale: dateLocale })
        : format(date, 'dd/MM/yyyy hh:mm a', { locale: dateLocale })
    }
    
    return effectiveLocale === 'ar'
      ? format(date, 'yyyy/MM/dd HH:mm', { locale: dateLocale })
      : format(date, 'dd/MM/yyyy HH:mm', { locale: dateLocale })
  }, [dateOnly, use12HourFormat, effectiveLocale, dateLocale])

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    if (dateOnly) {
      return effectiveLocale === 'ar' ? 'yyyy/MM/dd' : 'dd/MM/yyyy'
    }
    
    // Show that time is optional in placeholder
    if (use12HourFormat) {
      return effectiveLocale === 'ar' ? 'yyyy/MM/dd (hh:mm AM/PM)' : 'dd/MM/yyyy (hh:mm AM/PM)'
    }
    
    return effectiveLocale === 'ar' ? 'yyyy/MM/dd (HH:mm)' : 'dd/MM/yyyy (HH:mm)'
  }

  // Get locale-specific validation messages
  const getValidationMessage = (errorType: 'invalid_format' | 'date_required' | 'future_date' | 'past_date' | 'min_date' | 'max_date') => {
    const messages = {
      fr: {
        invalid_format: dateOnly 
          ? 'Format invalide. Utilisez: jj/mm/aaaa (ex: 25/12/2024)'
          : 'Format invalide. Utilisez: jj/mm/aaaa hh:mm (ex: 25/12/2024 14:30)',
        date_required: 'La date est requise',
        future_date: 'La date doit être dans le futur',
        past_date: 'La date doit être dans le passé',
        min_date: `La date doit être après le ${minDate ? formatDate(minDate) : ''}`,
        max_date: `La date doit être avant le ${maxDate ? formatDate(maxDate) : ''}`
      },
      ar: {
        invalid_format: dateOnly
          ? 'تنسيق غير صالح. استخدم: yyyy/mm/dd (مثال: 2024/12/25)'
          : 'تنسيق غير صالح. استخدم: yyyy/mm/dd hh:mm (مثال: 2024/12/25 14:30)',
        date_required: 'التاريخ مطلوب',
        future_date: 'يجب أن يكون التاريخ في المستقبل',
        past_date: 'يجب أن يكون التاريخ في الماضي',
        min_date: `يجب أن يكون التاريخ بعد ${minDate ? formatDate(minDate) : ''}`,
        max_date: `يجب أن يكون التاريخ قبل ${maxDate ? formatDate(maxDate) : ''}`
      }
    }
    return messages[effectiveLocale]?.[errorType] || errorType
  }
  
  // Parse date from various input formats with smart parsing
  const parseInputDate = (input: string): { date: Date | null; error?: string } => {
    if (!input) return { date: null }
    
    // Normalize input: replace common separators and remove extra spaces
    const normalized = input
      .replace(/[.,،]/g, '/')  // Replace dots, commas (including Arabic comma) with slashes
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim()
    
    // Build format list based on settings
    let formats: string[] = []
    
    if (dateOnly) {
      formats = effectiveLocale === 'ar'
        ? ['yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy.MM.dd', 'yyyy/M/d', 'yyyy-M-d']
        : ['dd/MM/yyyy', 'dd-MM-yyyy', 'dd.MM.yyyy', 'd/M/yyyy', 'd-M-yyyy']
    } else {
      // Allow date input without time (will default to 00:00)
      const dateOnlyFormats = effectiveLocale === 'ar'
        ? ['yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy.MM.dd', 'yyyy/M/d', 'yyyy-M-d']
        : ['dd/MM/yyyy', 'dd-MM-yyyy', 'dd.MM.yyyy', 'd/M/yyyy', 'd-M-yyyy']
      
      if (use12HourFormat) {
        formats = [
          ...(effectiveLocale === 'ar'
            ? ['yyyy/MM/dd hh:mm a', 'yyyy-MM-dd hh:mm a', 'yyyy/MM/dd h:mm a', 'yyyy/M/d h:mm a']
            : ['dd/MM/yyyy hh:mm a', 'dd-MM-yyyy hh:mm a', 'dd/MM/yyyy h:mm a', 'd/M/yyyy h:mm a']),
          ...dateOnlyFormats // Allow date without time
        ]
      } else {
        formats = [
          ...(effectiveLocale === 'ar'
            ? ['yyyy/MM/dd HH:mm', 'yyyy-MM-dd HH:mm', 'yyyy/MM/dd HH:mm:ss', 'yyyy/M/d H:mm']
            : ['dd/MM/yyyy HH:mm', 'dd-MM-yyyy HH:mm', 'dd/MM/yyyy HH:mm:ss', 'd/M/yyyy H:mm']),
          ...dateOnlyFormats // Allow date without time
        ]
      }
    }

    for (const formatStr of formats) {
      const parsed = parse(normalized, formatStr, new Date())
      if (isValid(parsed)) {
        // Validate against min/max dates
        if (minDate && parsed < minDate) {
          return { date: null, error: getValidationMessage('min_date') }
        }
        if (maxDate && parsed > maxDate) {
          return { date: null, error: getValidationMessage('max_date') }
        }
        return { date: parsed }
      }
    }
    
    return { date: null, error: getValidationMessage('invalid_format') }
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
    type: 'hour' | 'minute' | 'ampm',
    value: string
  ) => {
    const newDate = new Date(date)
    
    if (type === 'hour') {
      const hour = parseInt(value)
      if (use12HourFormat) {
        const currentHours = newDate.getHours()
        const isAM = currentHours < 12
        
        if (hour === 12) {
          newDate.setHours(isAM ? 0 : 12)
        } else {
          newDate.setHours(isAM ? hour : hour + 12)
        }
      } else {
        newDate.setHours(hour)
      }
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(value))
    } else if (type === 'ampm' && use12HourFormat) {
      const hours = newDate.getHours()
      if (value === 'AM' && hours >= 12) {
        newDate.setHours(hours - 12)
      } else if (value === 'PM' && hours < 12) {
        newDate.setHours(hours + 12)
      }
    }
    
    return newDate
  }
  
  // Helper function to get current period (AM/PM)
  const getCurrentPeriod = (date: Date) => {
    return date.getHours() >= 12 ? 'PM' : 'AM'
  }
  
  // Helper function to convert 24-hour to 12-hour display
  const getDisplayHour = (hour: number) => {
    if (!use12HourFormat) return hour
    if (hour === 0) return 12
    if (hour > 12) return hour - 12
    return hour
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
  
  // Watch the field value for syncing
  const fieldValue = watch(name)
  
  // Sync input value with field value (moved outside Controller to comply with hooks rules)
  React.useEffect(() => {
    if (fieldValue && !isFocused) {
      setInputValue(formatDate(new Date(fieldValue)))
    } else if (!fieldValue && !isFocused) {
      setInputValue('')
    }
  }, [fieldValue, isFocused, formatDate])

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
                className="h-7 px-2 text-xs text-gray-600 hover:text-white hover:bg-primary transition-all duration-200"
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

          const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatInputValue(e.target.value)
            setInputValue(formatted)
            
            // Clear validation error when user starts typing
            if (validationError) {
              setValidationError(undefined)
            }
            
            // Try to parse and update field value
            const result = parseInputDate(formatted)
            if (result.date) {
              field.onChange(result.date.toISOString())
            }
          }

          const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault() // Prevent form submission
              const result = parseInputDate(inputValue)
              if (result.date) {
                field.onChange(result.date.toISOString())
                setInputValue(formatDate(result.date))
                setValidationError(undefined)
              } else if (inputValue) {
                // Show validation error
                setValidationError(result.error)
                // Keep the invalid input to let user correct it
              }
              // Remove focus to trigger validation
              ;(e.target as HTMLInputElement).blur()
            }
          }

          const handleInputBlur = () => {
            setIsFocused(false)
            // Validate and format on blur
            const result = parseInputDate(inputValue)
            if (result.date) {
              field.onChange(result.date.toISOString())
              setInputValue(formatDate(result.date))
              setValidationError(undefined)
              // Clear any validation errors on successful parse
              if (errors[name]) {
                trigger(name)
              }
            } else if (inputValue) {
              // For date-time fields, if only date is entered, default time to 00:00
              if (!dateOnly && inputValue.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/)) {
                const dateWithTime = inputValue + ' 00:00'
                const resultWithTime = parseInputDate(dateWithTime)
                if (resultWithTime.date) {
                  field.onChange(resultWithTime.date.toISOString())
                  setInputValue(formatDate(resultWithTime.date))
                  setValidationError(undefined)
                  if (errors[name]) {
                    trigger(name)
                  }
                  return
                }
              }
              // Show validation error
              setValidationError(result.error)
            } else {
              // Empty input - clear the field
              field.onChange(null)
              setValidationError(undefined)
            }
          }

          const handleClear = () => {
            field.onChange(null)
            setInputValue('')
            setIsOpen(false)
          }
          
          const handleToday = () => {
            const today = new Date()
            // Ensure today is within min/max range
            if (minDate && today < minDate) return
            if (maxDate && today > maxDate) return
            
            field.onChange(today.toISOString())
            setInputValue(formatDate(today))
            setIsOpen(false)
          }

          // Use native picker on mobile if requested
          if (mobileNative && isMobile && inputMode === 'input') {
            return (
              <div className="relative w-full">
                <Input
                  type={dateOnly ? "date" : "datetime-local"}
                  value={field.value ? (dateOnly 
                    ? format(new Date(field.value), 'yyyy-MM-dd')
                    : format(new Date(field.value), "yyyy-MM-dd'T'HH:mm"))
                    : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value)
                      if (isValid(date)) {
                        field.onChange(date.toISOString())
                      }
                    } else {
                      field.onChange(null)
                    }
                  }}
                  min={minDate ? format(minDate, dateOnly ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm") : undefined}
                  max={maxDate ? format(maxDate, dateOnly ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm") : undefined}
                  disabled={disabled}
                  className={cn(
                    "h-12 w-full transition-all duration-200",
                    "hover:border-primary hover:bg-primary/5",
                    error 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary/20',
                    "text-sm sm:text-base"
                  )}
                  aria-label={label}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${name}-error` : undefined}
                />
                {showClearButton && field.value && !disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent",
                      isRTL ? "left-1" : "right-1"
                    )}
                    aria-label={effectiveLocale === 'ar' ? 'مسح' : 'Effacer'}
                  >
                    <Cross2Icon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                )}
              </div>
            )
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
                    field.value && showClearButton ? "pe-10" : "pe-3",
                    "hover:border-primary hover:bg-primary/5",
                    error && inputValue // Only show error if user has typed something
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400' 
                      : 'border-gray-300 focus:border-primary focus:ring-primary/20',
                    isRTL ? "text-right" : "text-left",
                    "text-sm sm:text-base"
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  aria-label={label}
                  aria-invalid={!!error && !!inputValue}
                  aria-describedby={error && inputValue ? `${name}-error` : undefined}
                />
                
                {/* Clear button */}
                {showClearButton && field.value && !disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent",
                      isRTL ? "left-1" : "right-1"
                    )}
                    aria-label={effectiveLocale === 'ar' ? 'مسح' : 'Effacer'}
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
                      "hover:bg-primary hover:border-primary hover:text-white",
                      error && field.value // Only show error if field has value
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400 hover:bg-red-50' 
                        : 'border-gray-300 focus:border-primary focus:ring-primary/20',
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
                    {showClearButton && field.value && !disabled && (
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
                  className="w-auto p-0 z-50 max-w-[95vw] sm:max-w-[600px]"
                  align="start"
                  alignOffset={-4}
                  sideOffset={5}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="flex flex-col sm:flex-row max-h-[80vh] sm:max-h-none overflow-auto">
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
                      disabled={[
                        ...(minDate ? [{ before: minDate }] : []),
                        ...(maxDate ? [{ after: maxDate }] : [])
                      ]}
                      className={cn(
                        "max-w-full p-2 sm:p-3",
                        // Primary color hover states for calendar navigation arrows with better contrast
                        "[&_.rdp-button_previous:hover]:bg-primary [&_.rdp-button_previous:hover]:text-white",
                        "[&_.rdp-button_next:hover]:bg-primary [&_.rdp-button_next:hover]:text-white",
                        // Primary color hover states for calendar days with better contrast
                        "[&_.rdp-day_button:hover]:bg-primary [&_.rdp-day_button:hover]:text-white",
                        // Today styling (only when not selected)
                        "[&_.rdp-day_today:not([data-selected])]:bg-primary/10 [&_.rdp-day_today:not([data-selected])]:text-primary [&_.rdp-day_today:not([data-selected])]:font-bold [&_.rdp-day_today:not([data-selected])]:ring-2 [&_.rdp-day_today:not([data-selected])]:ring-primary/30",
                        // Selected day styling (takes precedence over today)
                        "[&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-white [&_.rdp-day_selected]:font-bold [&_.rdp-day_selected]:shadow-md",
                        // Ensure selected state overrides today when both apply
                        "[&_[data-selected][data-today]]:bg-primary [&_[data-selected][data-today]]:text-white",
                        // Disabled days
                        "[&_.rdp-day_disabled]:opacity-50 [&_.rdp-day_disabled]:cursor-not-allowed",
                        // Mobile optimization with larger touch targets
                        "[&_.rdp-caption]:text-sm sm:text-base",
                        "[&_.rdp-day]:text-sm sm:text-base",
                        "[&_.rdp-day_button]:min-h-[40px] [&_.rdp-day_button]:min-w-[40px] sm:[&_.rdp-day_button]:min-h-[36px] sm:[&_.rdp-day_button]:min-w-[36px]"
                      )}
                    />
                    
                    {!dateOnly && (
                      <div 
                        className="flex flex-col sm:flex-row border-t sm:border-t-0 sm:border-s"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-x sm:divide-y-0">
                          {/* Hours */}
                          <ScrollArea className="h-[150px] sm:flex-1 sm:h-auto sm:w-[100px]" dir={isRTL ? 'rtl' : 'ltr'}>
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-600 mb-2 text-center">
                                {effectiveLocale === 'ar' ? 'ساعة' : 'Heure'}
                              </p>
                              <div className="grid grid-cols-4 sm:grid-cols-3 gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                {hours.map((hour) => {
                                  const currentHour = field.value ? new Date(field.value).getHours() : -1
                                  const isSelected = use12HourFormat 
                                    ? (currentHour % 12 === hour % 12 || (currentHour === 0 && hour === 12) || (currentHour === 12 && hour === 12))
                                    : currentHour === hour
                                  
                                  return (
                                    <Button
                                      key={hour}
                                      size="sm"
                                      variant={isSelected ? "default" : "ghost"}
                                      className="w-full h-10 text-sm touch-manipulation hover:bg-primary hover:text-white transition-colors"
                                      onClick={() => {
                                        const currentDate = field.value ? new Date(field.value) : new Date()
                                        const newDate = handleTimeChange(currentDate, 'hour', hour.toString())
                                        field.onChange(newDate.toISOString())
                                      }}
                                      aria-label={`${hour} ${effectiveLocale === 'ar' ? 'ساعة' : 'heure'}`}
                                    >
                                      <bdi dir={isRTL ? 'rtl' : 'ltr'}>
                                        {use12HourFormat ? hour : hour.toString().padStart(2, '0')}
                                      </bdi>
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          </ScrollArea>

                          {/* Minutes */}
                          <ScrollArea className="h-[150px] sm:flex-1 sm:h-auto sm:w-[100px]" dir={isRTL ? 'rtl' : 'ltr'}>
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-600 mb-2 text-center">
                                {effectiveLocale === 'ar' ? 'دقيقة' : 'Minute'}
                              </p>
                              <div className={cn(
                                "grid gap-1",
                                minuteInterval === 1 ? "grid-cols-6 sm:grid-cols-4" : 
                                minuteInterval <= 5 ? "grid-cols-4 sm:grid-cols-3" : 
                                "grid-cols-3 sm:grid-cols-2"
                              )} dir={isRTL ? 'rtl' : 'ltr'}>
                                {minutes.map((minute) => (
                                  <Button
                                    key={minute}
                                    size="sm"
                                    variant={
                                      field.value && new Date(field.value).getMinutes() === minute
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="w-full h-10 text-sm touch-manipulation hover:bg-primary hover:text-white transition-colors"
                                    onClick={() => {
                                      const currentDate = field.value ? new Date(field.value) : new Date()
                                      const newDate = handleTimeChange(currentDate, 'minute', minute.toString())
                                      field.onChange(newDate.toISOString())
                                    }}
                                    aria-label={`${minute} ${effectiveLocale === 'ar' ? 'دقيقة' : 'minute'}`}
                                  >
                                    <bdi dir={isRTL ? 'rtl' : 'ltr'}>{minute.toString().padStart(2, '0')}</bdi>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </ScrollArea>
                          
                          {/* AM/PM Toggle for 12-hour format */}
                          {use12HourFormat && (
                            <div className="border-t sm:border-t-0 sm:border-s p-2 sm:w-[80px]">
                              <p className="text-xs font-medium text-gray-600 mb-2 text-center">
                                {effectiveLocale === 'ar' ? 'الفترة' : 'Période'}
                              </p>
                              <div className="flex flex-row sm:flex-col gap-1">
                                {['AM', 'PM'].map((period) => (
                                  <Button
                                    key={period}
                                    size="sm"
                                    variant={
                                      field.value && getCurrentPeriod(new Date(field.value)) === period
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="flex-1 sm:w-full h-10 text-sm touch-manipulation hover:bg-primary hover:text-white transition-colors"
                                    onClick={() => {
                                      const currentDate = field.value ? new Date(field.value) : new Date()
                                      const newDate = handleTimeChange(currentDate, 'ampm', period)
                                      field.onChange(newDate.toISOString())
                                    }}
                                    aria-label={period}
                                  >
                                    {period}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Today and Clear buttons */}
                        {(showTodayButton || showClearButton) && (
                          <div className="border-t sm:border-t-0 sm:border-s p-2 flex flex-row sm:flex-col gap-1 sm:w-[100px]">
                            {showTodayButton && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleToday}
                                className="flex-1 sm:w-full h-10 text-xs hover:bg-primary hover:text-white transition-colors"
                                disabled={disabled || (minDate && new Date() < minDate) || (maxDate && new Date() > maxDate)}
                                aria-label={effectiveLocale === 'ar' ? 'اليوم' : "Aujourd'hui"}
                              >
                                {effectiveLocale === 'ar' ? 'اليوم' : "Aujourd'hui"}
                              </Button>
                            )}
                            {showClearButton && field.value && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                                className="flex-1 sm:w-full h-10 text-xs hover:bg-red-500 hover:text-white transition-colors"
                                disabled={disabled}
                                aria-label={effectiveLocale === 'ar' ? 'مسح' : 'Effacer'}
                              >
                                {effectiveLocale === 'ar' ? 'مسح' : 'Effacer'}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )
        }}
      />

      {/* Show validation error or form error */}
      {(validationError || (error && inputValue)) && (
        <p id={`${name}-error`} className="text-sm text-red-600 mt-1 animate-in fade-in duration-200" role="alert">
          <bdi>{validationError || error}</bdi>
        </p>
      )}
      
      {/* Helper text */}
      {!validationError && !error && helperText && (
        <p className="text-sm text-gray-500 mt-1">
          <bdi>{helperText}</bdi>
        </p>
      )}
      
      {/* Format hint - show when in input mode and no errors */}
      {!validationError && !error && !helperText && inputMode === 'input' && (
        <p className="text-xs text-gray-400 mt-1">
          <bdi>
            {effectiveLocale === 'ar' 
              ? `التنسيق: ${getPlaceholder()}`
              : `Format attendu: ${getPlaceholder()}`}
            {dateOnly ? '' : effectiveLocale === 'ar' 
              ? ' (الوقت اختياري)'
              : ' (heure optionnelle)'}
          </bdi>
        </p>
      )}
    </div>
  )
}