'use client'

import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { useLocale } from 'next-intl'
import type { Locale } from '@/utilities/locale'
import { formatDateForLocale } from '@/utilities/date-time-helpers'

interface FormDatePickerProps {
  name: string
  label: string
  required?: boolean
  minDate?: Date
  maxDate?: Date
  locale?: Locale
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function FormDatePicker({
  name,
  label,
  required = false,
  minDate,
  maxDate,
  locale,
  disabled = false,
  className = '',
  placeholder,
}: FormDatePickerProps) {
  const { control, formState: { errors } } = useFormContext()
  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const isRTL = effectiveLocale === 'ar'
  
  // Get appropriate date-fns locale
  const dateLocale = effectiveLocale === 'ar' ? ar : fr
  
  // Default placeholder based on locale
  const defaultPlaceholder = effectiveLocale === 'ar' 
    ? 'اختر التاريخ'
    : 'Sélectionner une date'

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        <bdi>
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </bdi>
      </Label>
      
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? (effectiveLocale === 'ar' ? 'التاريخ مطلوب' : 'La date est requise') : false,
        }}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={name}
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-12',
                  !field.value && 'text-muted-foreground',
                  errors[name] && 'border-red-500',
                  isRTL && 'text-right'
                )}
                disabled={disabled}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <CalendarIcon className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {field.value ? (
                  <bdi>{formatDateForLocale(field.value, effectiveLocale)}</bdi>
                ) : (
                  <span>{placeholder || defaultPlaceholder}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0" 
              align="start"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <Calendar
                mode="single"
                captionLayout="dropdown"
                fromYear={1960}
                toYear={new Date().getFullYear()}
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  // Store as YYYY-MM-DD format
                  field.onChange(date ? format(date, 'yyyy-MM-dd') : null)
                }}
                disabled={(date) => {
                  if (disabled) return true
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.ctrlKey || e.metaKey) {
                    const currentDate = field.value ? new Date(field.value) : new Date()
                    if (e.key === 'ArrowLeft') {
                      // Previous year
                      e.preventDefault()
                      const newDate = new Date(currentDate)
                      newDate.setFullYear(newDate.getFullYear() - 1)
                      if (newDate.getFullYear() >= 1960) {
                        field.onChange(format(newDate, 'yyyy-MM-dd'))
                      }
                    } else if (e.key === 'ArrowRight') {
                      // Next year
                      e.preventDefault()
                      const newDate = new Date(currentDate)
                      newDate.setFullYear(newDate.getFullYear() + 1)
                      if (newDate.getFullYear() <= new Date().getFullYear()) {
                        field.onChange(format(newDate, 'yyyy-MM-dd'))
                      }
                    } else if (e.key === 'ArrowUp') {
                      // Next month
                      e.preventDefault()
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      field.onChange(format(newDate, 'yyyy-MM-dd'))
                    } else if (e.key === 'ArrowDown') {
                      // Previous month
                      e.preventDefault()
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      field.onChange(format(newDate, 'yyyy-MM-dd'))
                    }
                  }
                }}
                initialFocus
                locale={dateLocale}
                dir={isRTL ? 'rtl' : 'ltr'}
                className={cn(
                  'rounded-md border',
                  isRTL && '[&_.rdp-caption]:flex-row-reverse [&_.rdp-nav]:flex-row-reverse'
                )}
                classNames={{
                  day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold',
                  day_today: 'bg-accent text-accent-foreground font-bold border-2 border-primary',
                  day: cn(
                    'h-9 w-9 p-0 font-normal',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground'
                  ),
                  head_cell: 'text-muted-foreground font-normal text-[0.8rem]',
                  caption: 'flex justify-center pt-1 relative items-center',
                  nav_button: cn(
                    'h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100',
                    'hover:bg-accent hover:text-accent-foreground',
                    'transition-all duration-200'
                  ),
                  nav_button_previous: isRTL ? 'absolute right-1' : 'absolute left-1',
                  nav_button_next: isRTL ? 'absolute left-1' : 'absolute right-1',
                }}
              />
              {/* Clear button */}
              {field.value && !required && (
                <div className="p-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => field.onChange(null)}
                  >
                    <bdi>{effectiveLocale === 'ar' ? 'مسح' : 'Effacer'}</bdi>
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      />
      
      {errors[name] && (
        <p className="text-sm text-red-600" role="alert">
          <bdi>{errors[name]?.message as string}</bdi>
        </p>
      )}
    </div>
  )
}