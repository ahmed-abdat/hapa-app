'use client'

import { RowLabelComponent } from 'payload'
import { getAttachmentTypeLabel } from '@/utilities/attachment-type-translations'

const AttachmentTypeRowLabel = ({ data, index }: any) => {
  const type = data?.type
  
  // Try to get the submission locale from parent context
  // Since we're in an array field, we need to look up the parent document
  const formData = (data as any)?.__parentDoc || {}
  const submissionLocale = formData?.locale || 'fr'
  
  if (!type) {
    return (
      <span style={{ 
        fontStyle: 'italic',
        color: '#6b7280'
      }}>
        {submissionLocale === 'ar' ? `مرفق ${(index || 0) + 1}` : `Pièce jointe ${(index || 0) + 1}`}
      </span>
    )
  }

  const label = getAttachmentTypeLabel(type, submissionLocale)

  return (
    <div style={{ 
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
    }}>
      <span style={{
        padding: '2px 8px',
        backgroundColor: '#f0f9ff',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        color: '#1e40af',
        border: '1px solid #dbeafe'
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '10px',
        color: '#94a3b8',
        fontFamily: 'monospace'
      }}>
        ({type})
      </span>
    </div>
  )
}

export default AttachmentTypeRowLabel