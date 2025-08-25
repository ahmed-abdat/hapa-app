'use client'

import React, { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ClockIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLocale } from 'next-intl'
import type { Locale } from '@/utilities/locale'
import { generateTimeOptions, formatTimeForDisplay } from '@/utilities/date-time-helpers'

interface FormTimePickerProps {
  name: string
  label: string
  required?: boolean
  use12Hour?: boolean
  minuteInterval?: 1 | 5 | 10 | 15 | 30
  locale?: Locale
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function FormTimePicker({
  name,
  label,
  required = false,
  use12Hour,
  minuteInterval = 15,
  locale,
  placeholder,
  disabled = false,
  className = '',
}: FormTimePickerProps) {
  const { control, formState: { errors } } = useFormContext()
  const currentLocale = useLocale() as Locale
  const effectiveLocale = locale || currentLocale
  const isRTL = effectiveLocale === 'ar'
  
  // Determine 12-hour format based on locale if not specified
  const use12HourFormat = use12Hour !== undefined 
    ? use12Hour 
    : effectiveLocale === 'ar'
  
  // Generate time options
  const timeOptions = useMemo(() => {
    return generateTimeOptions(minuteInterval, use12HourFormat)
  }, [minuteInterval, use12HourFormat])
  
  // Default placeholder based on locale
  const defaultPlaceholder = placeholder || (
    effectiveLocale === 'ar' 
      ? 'اختر الوقت (اختياري)'
      : 'Sélectionner l\'heure (optionnel)'
  )

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
          required: required ? (effectiveLocale === 'ar' ? 'الوقت مطلوب' : 'L\'heure est requise') : false,
        }}
        render={({ field }) => (
          <div className="relative">
            <Select 
              value={field.value || (required ? '' : 'no-time')} 
              onValueChange={(value) => {
                field.onChange(value === 'no-time' ? '' : value)
              }} 
              disabled={disabled}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <SelectTrigger 
                id={name}
                className={cn(
                  'h-12 w-full',
                  errors[name] && 'border-red-500',
                  isRTL && 'text-right'
                )}
              >
                <div className={cn('flex items-center', isRTL ? 'flex-row-reverse' : '')}>
                  <ClockIcon className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  <SelectValue placeholder={defaultPlaceholder} />
                </div>
              </SelectTrigger>
              <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                <ScrollArea className="h-60">
                  {/* Optional: Add "No time" option for non-required fields */}
                  {!required && (
                    <SelectItem value="no-time">
                      <bdi className="text-muted-foreground">
                        {effectiveLocale === 'ar' ? 'بدون وقت' : 'Sans heure'}
                      </bdi>
                    </SelectItem>
                  )}
                  
                  {/* Time options */}
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <bdi>{option.label}</bdi>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        )}
      />
      
      {errors[name] && (
        <p className="text-sm text-red-600" role="alert">
          <bdi>{errors[name]?.message as string}</bdi>
        </p>
      )}
      
      {!required && !errors[name] && (
        <p className="text-xs text-gray-500">
          <bdi>{effectiveLocale === 'ar' ? 'اختياري' : 'Optionnel'}</bdi>
        </p>
      )}
    </div>
  )
}