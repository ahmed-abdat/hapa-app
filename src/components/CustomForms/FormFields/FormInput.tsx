'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormFieldProps } from '../types'

export function FormInput({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  type = 'text'
}: FormFieldProps & { type?: 'text' | 'email' | 'tel' | 'password' }) {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  const error = errors[name]?.message as string | undefined

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Input
        {...register(name)}
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
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