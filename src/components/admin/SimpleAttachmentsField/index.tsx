'use client'

import React from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import { getAttachmentTypeLabel, getAttachmentTypeConfig } from '@/utilities/attachment-type-translations'
import { getAttachmentTypeKeyFromIndex } from '@/lib/form-options'

/**
 * Simple field component to display attachment types as a list instead of accordion
 * Shows localized labels based on submission locale
 */
const SimpleAttachmentsField: React.FC = () => {
  // Get the attachmentTypes field value directly
  const { value: attachmentTypes } = useField<any>({ path: 'attachmentTypes' })
  // Get document info to access the submission's locale (following HAPA patterns)
  const documentInfo = useDocumentInfo()
  
  // Use the locale from the submission document, not the admin UI locale
  const submissionLocale = (documentInfo?.data?.locale || 'fr') as 'fr' | 'ar'
  const isRTL = submissionLocale === 'ar'
  
  // Handle both array format and single value format
  let attachmentTypesArray: Array<{ type: string }> = []
  
  if (Array.isArray(attachmentTypes)) {
    // New format: array of objects with type property
    attachmentTypesArray = attachmentTypes
  } else if (typeof attachmentTypes === 'number') {
    // Legacy format: numeric index, convert to proper attachment type key using centralized mapping
    const typeKey = getAttachmentTypeKeyFromIndex(attachmentTypes)
    attachmentTypesArray = [{ type: typeKey }]
  } else if (typeof attachmentTypes === 'string') {
    // Legacy format: string value
    attachmentTypesArray = [{ type: attachmentTypes }]
  }
  
  if (!attachmentTypesArray || attachmentTypesArray.length === 0) {
    return (
      <div style={{ 
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        fontStyle: 'italic',
        color: '#6b7280',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        {isRTL ? 'لا توجد مرفقات' : 'Aucune pièce jointe'}
      </div>
    )
  }

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <div style={{
        marginBottom: '8px',
        fontWeight: '600',
        fontSize: '13px',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {isRTL ? 'أنواع المرفقات:' : 'Types de pièces jointes:'}
      </div>
      
      <ul style={{
        margin: 0,
        paddingLeft: isRTL ? 0 : '20px',
        paddingRight: isRTL ? '20px' : 0,
        listStyleType: 'none'
      }}>
        {attachmentTypesArray.map((item, index) => {
          const config = getAttachmentTypeConfig(item.type)
          const label = getAttachmentTypeLabel(item.type, submissionLocale)
          
          return (
            <li 
              key={index} 
              style={{
                padding: '8px 12px',
                marginBottom: '6px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                direction: isRTL ? 'rtl' : 'ltr'
              }}
            >
              {/* Icon */}
              <span style={{
                fontSize: '16px',
                flexShrink: 0,
                marginRight: isRTL ? '0' : '8px',
                marginLeft: isRTL ? '8px' : '0'
              }}>
                {config.icon}
              </span>
              
              {/* Label */}
              <span style={{
                flex: 1,
                fontSize: '14px',
                color: '#111827',
                marginRight: isRTL ? '0' : '8px',
                marginLeft: isRTL ? '8px' : '0'
              }}>
                {label}
              </span>
              
              {/* Key (for admin reference) */}
              <span style={{
                fontSize: '11px',
                color: '#9ca3af',
                fontFamily: 'monospace',
                backgroundColor: '#f3f4f6',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                {item.type}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SimpleAttachmentsField