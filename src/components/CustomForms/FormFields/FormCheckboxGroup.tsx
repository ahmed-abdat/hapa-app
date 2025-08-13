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
  direction = 'horizontal'
}: FormCheckboxGroupProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()

  const error = errors[name]?.message as string | undefined

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-destructive ms-1">*</span>}
        </bdi>
      </Label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={`
            ${direction === 'vertical' ? 'space-y-3' : 'flex flex-wrap gap-4'}
            ${error ? 'border border-destructive rounded p-3 bg-destructive/10' : ''}
          `}>
            {options.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
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
                  className={error ? 'border-destructive' : ''}
                />
                <Label 
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  <bdi>{option.label}</bdi>
                </Label>
              </div>
            ))}
          </div>
        )}
      />
      
      {error && (
        <p className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}