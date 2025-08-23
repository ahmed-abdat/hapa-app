'use client'

import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FormTextareaProps } from '../types'

export function FormTextarea({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  maxLength
}: FormTextareaProps) {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext()

  const error = errors[name]?.message as string | undefined
  const currentValue = watch(name) || ''
  const currentLength = currentValue.length

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          <bdi>
            {label}
            {required && <span className="text-red-500 ms-1">*</span>}
          </bdi>
        </Label>
        {maxLength && (
          <span className="text-xs text-gray-500">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      
      <Textarea
        {...register(name)}
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full resize-none p-4 rounded-lg border-2 transition-all duration-200 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} focus:ring-4`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}