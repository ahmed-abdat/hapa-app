'use client'
import React from 'react'
import { SlugComponent } from './SlugComponent'
import { useFormFields } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'
import type { TextFieldClientProps } from 'payload'

type SlugFieldWithNoticeProps = {
  fieldToUse: string
  checkboxFieldPath: string
} & TextFieldClientProps

export const SlugFieldWithNotice: React.FC<SlugFieldWithNoticeProps> = (props) => {
  const { fieldToUse } = props
  const searchParams = useSearchParams()
  const _currentLocale = searchParams.get('locale') || 'fr'
  
  // Check if French title exists for future use
  const { _frenchTitle } = useFormFields(([fields]) => {
    const titleField = fields[fieldToUse]?.value
    
    let frenchTitle = ''
    
    if (titleField && typeof titleField === 'object' && 'fr' in titleField) {
      frenchTitle = titleField.fr as string || ''
    } else if (titleField && typeof titleField === 'string') {
      frenchTitle = titleField
    }
    
    return {
      _frenchTitle: frenchTitle,
    }
  })

  return (
    <div>
      <SlugComponent {...props} />
    </div>
  )
}