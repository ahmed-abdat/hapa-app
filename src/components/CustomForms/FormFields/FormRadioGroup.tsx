'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormFieldProps } from '../types'
import { useLocale } from 'next-intl'
import { type Locale } from '@/utilities/locale'

interface RadioOption {
  value: string
  label: string
}

interface FormRadioGroupProps extends Omit<FormFieldProps, 'placeholder'> {
  options: RadioOption[]
  direction?: 'vertical' | 'horizontal'
}

export function FormRadioGroup({
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  options,
  direction = 'vertical'
}: FormRadioGroupProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const locale = useLocale() as Locale
  const isRTL = locale === 'ar'
  const error = errors[name]?.message as string | undefined

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </bdi>
      </Label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={`
            ${error ? 'border border-red-300 rounded p-3 bg-red-50' : ''}
          `}>
            <RadioGroup
              value={field.value || ''}
              onValueChange={field.onChange}
              disabled={disabled}
              dir={isRTL ? 'rtl' : 'ltr'}
              className={`
                ${direction === 'vertical' ? 'space-y-3' : 'flex flex-wrap gap-4'}
              `}
            >
              {options.map((option) => (
                <div 
                  key={option.value} 
                  className="flex items-center gap-2"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                    className={`
                      ${error ? 'border-red-500' : ''}
                    `}
                  />
                  <Label 
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm text-gray-700 cursor-pointer select-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <bdi>{option.label}</bdi>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      />
      
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}