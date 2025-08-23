'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { getMediaTypeLabel, getMediaTypeIcon } from '@/utilities/media-type-translations'

const MediaTypeField: React.FC = () => {
  const { value } = useField<string>({ path: 'mediaType' })
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
            color: '#6b7280',
            direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
          }}>
            {submissionLocale === 'ar' ? 'لا يوجد نوع وسائط' : 'Aucun type de média'}
          </div>
        </div>
      </div>
    )
  }

  const label = getMediaTypeLabel(value, submissionLocale)
  const icon = getMediaTypeIcon(value)

  return (
    <div className="field-type">
      <div className="field-type__wrap">
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '6px',
          border: '1px solid #fcd34d',
          direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexDirection: submissionLocale === 'ar' ? 'row-reverse' : 'row'
          }}>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <div>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '14px',
                color: '#92400e'
              }}>
                {label}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#94a3b8',
                marginTop: '4px',
                fontFamily: 'monospace'
              }}>
                {value}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaTypeField