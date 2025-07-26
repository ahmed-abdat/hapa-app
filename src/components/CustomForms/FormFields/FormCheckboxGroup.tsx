'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FormFieldProps } from '../types'

interface CheckboxOption {
  value: string
  label: string
}

interface FormCheckboxGroupProps extends Omit<FormFieldProps, 'placeholder'> {
  options: CheckboxOption[]
  direction?: 'vertical' | 'horizontal'
}

export function FormCheckboxGroup({
  name,
  label,
  required = false,
  disabled = false,
  className = '',
  options,
  direction = 'vertical'
}: FormCheckboxGroupProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const error = errors[name]?.message as string | undefined

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={`
            ${direction === 'vertical' ? 'space-y-3' : 'flex flex-wrap gap-4'}
            ${error ? 'border border-red-300 rounded p-3 bg-red-50' : ''}
          `}>
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id={`${name}-${option.value}`}
                  checked={field.value?.includes(option.value) || false}
                  disabled={disabled}
                  onCheckedChange={(checked) => {
                    const currentValue = field.value || []
                    if (checked) {
                      field.onChange([...currentValue, option.value])
                    } else {
                      field.onChange(currentValue.filter((v: string) => v !== option.value))
                    }
                  }}
                  className={`
                    ${error ? 'border-red-500' : 'border-gray-300'}
                    data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600
                  `}
                />
                <Label 
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  {option.label}
                </Label>
              </div>
            ))}
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