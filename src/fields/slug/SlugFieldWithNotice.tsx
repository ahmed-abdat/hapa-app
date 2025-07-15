'use client'
import React from 'react'
import { SlugComponent } from './SlugComponent'
import { useFormFields } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

type SlugFieldWithNoticeProps = {
  fieldToUse: string
  checkboxFieldPath: string
} & TextFieldClientProps

export const SlugFieldWithNotice: React.FC<SlugFieldWithNoticeProps> = (props) => {
  const { fieldToUse } = props
  
  // Check if French title exists
  const frenchTitle = useFormFields(([fields]) => {
    const titleField = fields[fieldToUse]?.value
    if (titleField && typeof titleField === 'object' && 'fr' in titleField) {
      return titleField.fr as string
    }
    return titleField as string
  })

  const hasFrenchTitle = frenchTitle && frenchTitle.trim()

  return (
    <div>
      <SlugComponent {...props} />
      {!hasFrenchTitle && (
        <div className="field-notice" style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <strong>Notice:</strong> Please add a French title first to generate the URL slug. The slug will be created automatically from the French title.
        </div>
      )}
    </div>
  )
}