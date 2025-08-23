'use client'

import React from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import { getMotifLabel, getMotifConfig } from '@/utilities/motif-translations'
import { getReasonKeyFromIndex } from '@/lib/form-options'

/**
 * Simple field component to display reasons as a list instead of accordion
 * Shows localized labels based on submission locale
 */
const SimpleReasonsField: React.FC = () => {
  // Get the reasons field value directly
  const { value: reasons } = useField<any>({ path: 'reasons' })
  // Get document info to access the submission's locale (following HAPA patterns)
  const documentInfo = useDocumentInfo()
  
  // Use the locale from the submission document, not the admin UI locale
  const submissionLocale = (documentInfo?.data?.locale || 'fr') as 'fr' | 'ar'
  const isRTL = submissionLocale === 'ar'
  
  // Handle both array format and single value format
  let reasonsArray: Array<{ reason: string }> = []
  
  if (Array.isArray(reasons)) {
    // New format: array of objects with reason property
    reasonsArray = reasons
  } else if (typeof reasons === 'number') {
    // Legacy format: numeric index, convert to proper reason key using centralized mapping
    const reasonKey = getReasonKeyFromIndex(reasons)
    reasonsArray = [{ reason: reasonKey }]
  } else if (typeof reasons === 'string') {
    // Legacy format: string value
    reasonsArray = [{ reason: reasons }]
  }
  
  if (!reasonsArray || reasonsArray.length === 0) {
    return (
      <div style={{ 
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        fontStyle: 'italic',
        color: '#6b7280',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        {isRTL ? 'لا توجد أسباب محددة' : 'Aucun motif spécifié'}
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
        {isRTL ? 'الأسباب المختارة:' : 'Motifs sélectionnés:'}
      </div>
      
      <ul style={{
        margin: 0,
        paddingLeft: isRTL ? 0 : '20px',
        paddingRight: isRTL ? '20px' : 0,
        listStyleType: 'none'
      }}>
        {reasonsArray.map((item, index) => {
          const config = getMotifConfig(item.reason)
          const label = getMotifLabel(item.reason, submissionLocale)
          
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
              {/* Severity indicator */}
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 
                  config.severity === 'critical' ? '#dc2626' :
                  config.severity === 'high' ? '#f97316' :
                  config.severity === 'medium' ? '#eab308' :
                  '#6b7280',
                flexShrink: 0,
                marginRight: isRTL ? '0' : '8px',
                marginLeft: isRTL ? '8px' : '0'
              }} />
              
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
                {item.reason}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SimpleReasonsField