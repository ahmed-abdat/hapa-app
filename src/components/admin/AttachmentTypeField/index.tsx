'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { getAttachmentTypeLabel, getAttachmentTypeDescription } from '@/utilities/attachment-type-translations'

const AttachmentTypeField: React.FC = () => {
  const { value } = useField<string>({ path: 'type' })
  const { value: formData } = useField<any>({ path: '' })
  
  // Determine locale from the submission
  const submissionLocale = formData?.locale || 'fr'
  
  if (!value) {
    return (
      <div className="field-type">
        <div className="field-type__wrap">
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '4px',
            fontStyle: 'italic',
            color: '#6b7280'
          }}>
            {submissionLocale === 'ar' ? 'لا يوجد نوع مرفق' : 'Aucun type de pièce jointe'}
          </div>
        </div>
      </div>
    )
  }

  const label = getAttachmentTypeLabel(value, submissionLocale)
  const description = getAttachmentTypeDescription(value, submissionLocale)

  return (
    <div className="field-type">
      <div className="field-type__wrap">
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '6px',
          border: '1px solid #e0e7ff',
          direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
        }}>
          <div style={{ 
            fontWeight: '600', 
            fontSize: '14px',
            color: '#1e40af',
            marginBottom: description ? '4px' : '0'
          }}>
            {label}
          </div>
          {description && (
            <div style={{ 
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px'
            }}>
              {description}
            </div>
          )}
          <div style={{
            fontSize: '10px',
            color: '#94a3b8',
            marginTop: '8px',
            fontFamily: 'monospace'
          }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttachmentTypeField