'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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

interface FormDateTimePickerProps extends Omit<FormFieldProps, 'placeholder'> {
  placeholder?: string
  dateOnly?: boolean
  locale?: 'fr' | 'ar'
}

export function FormDateTimePicker({
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  placeholder,
  dateOnly = false,
  locale,
  ...props
}: FormDateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const isRTL = effectiveLocale === 'ar'
  const error = errors[name]?.message as string | undefined

  const dateLocale = effectiveLocale === 'ar' ? ar : fr
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
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

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </bdi>
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled}
                className={cn(
                  "flex h-12 w-full items-center justify-start whitespace-nowrap rounded-lg border-2 bg-transparent px-4 py-2 text-sm shadow-sm transition-all duration-200",
                  "hover:bg-primary/5 hover:border-primary/30 hover:text-primary",
                  error 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400 hover:bg-red-50' 
                    : 'border-gray-200 focus:border-primary focus:ring-primary/20',
                  !field.value && "text-muted-foreground hover:text-primary",
                  isRTL && "flex-row-reverse"
                )}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <CalendarIcon className={cn(
                  "h-4 w-4",
                  isRTL ? "ms-2" : "me-2"
                )} />
                <bdi className="flex-1 text-start">
                  {field.value ? (
                    formatDate(new Date(field.value))
                  ) : (
                    <span>{getPlaceholder()}</span>
                  )}
                </bdi>
              </Button>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-auto p-0"
              align={isRTL ? "end" : "start"}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className={cn(
                "sm:flex",
                isRTL && "sm:flex-row-reverse"
              )}>
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
                    isRTL && "[&_.rdp-nav]:flex-row-reverse [&_.rdp-button_next]:order-first [&_.rdp-button_previous]:order-last",
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
                    "[&_[data-selected][data-today]]:bg-primary [&_[data-selected][data-today]]:text-primary-foreground"
                  )}
                />
                
                {!dateOnly && (
                  <div 
                    className={cn(
                      "flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x",
                      isRTL && "sm:flex-row-reverse sm:divide-x-reverse"
                    )}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {/* Hours */}
                    <ScrollArea className="w-64 sm:w-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className="flex sm:flex-col p-2 gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <Button
                            key={hour}
                            size="sm"
                            variant={
                              field.value && new Date(field.value).getHours() === hour
                                ? "default"
                                : "ghost"
                            }
                            className="sm:w-full shrink-0 min-w-[40px] h-8"
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
                      <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>

                    {/* Minutes */}
                    <ScrollArea className="w-64 sm:w-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className="flex sm:flex-col p-2 gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
                        {minutes.map((minute) => (
                          <Button
                            key={minute}
                            size="sm"
                            variant={
                              field.value && new Date(field.value).getMinutes() === minute
                                ? "default"
                                : "ghost"
                            }
                            className="sm:w-full shrink-0 min-w-[40px] h-8"
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
                      <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      />

      {error && (
        <p className="text-sm text-red-600 mt-1">
          <bdi>{error}</bdi>
        </p>
      )}
    </div>
  )
}