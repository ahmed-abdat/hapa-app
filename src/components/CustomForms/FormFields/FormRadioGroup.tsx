'use client'

import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { FormFieldProps } from '../types'

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
                <input
                  type="radio"
                  id={`${name}-${option.value}`}
                  value={option.value}
                  checked={field.value === option.value}
                  disabled={disabled}
                  onChange={(e) => field.onChange(e.target.value)}
                  className={`
                    h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500
                    ${error ? 'border-red-500' : 'border-gray-300'}
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