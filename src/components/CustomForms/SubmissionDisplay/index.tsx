'use client'

import React from 'react'
// import { Button } from '@/components/ui/button' // Unused import
import { useWatchForm } from '@payloadcms/ui'

interface SubmissionData {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
  organization?: string
  complaintType?: string
  description?: string
  documentType?: string
  urgency?: string
  purpose?: string
  [key: string]: unknown
}

interface SubmissionDisplayProps {
  value?: SubmissionData
  readOnly?: boolean
  // Payload field component props
  path?: string
  field?: unknown
  [key: string]: unknown
}

export const SubmissionDisplay: React.FC<SubmissionDisplayProps> = (props) => {
  // Extract value from props - Payload passes it differently
  const { value, readOnly: _readOnly = true, path, ..._otherProps } = props
  
  // Get the actual document data using Payload's hook
  const { fields } = useWatchForm()
  const actualValue = fields?.submissionData?.value || (path ? fields?.[path]?.value : undefined)
  
  // Use the actual value from document instead of props.value
  const submissionData = actualValue || value;
  
  if (!submissionData || typeof submissionData !== 'object') {
    return (
      <div className="p-3 text-center text-gray-500 bg-gray-50 rounded-md border">
        <span className="text-sm">Aucune donnée disponible</span>
      </div>
    )
  }

  // Create a compact summary view showing key information
  const data = submissionData as Record<string, unknown>;
  const keyInfo = [
    { label: 'Nom', value: data.name },
    { label: 'Email', value: data.email },
    { label: 'Téléphone', value: data.phone },
    { label: 'Sujet', value: data.subject },
  ].filter(item => item.value)

  const description = data.message || data.description || 'Aucune description'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Key Information */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {keyInfo.map((item, index) => (
          <div key={index} className="flex">
            <span className="font-medium text-gray-700 min-w-16">{item.label}:</span>
            <span className="text-gray-900 ml-2 truncate" title={String(item.value)}>{String(item.value)}</span>
          </div>
        ))}
      </div>
      
      {/* Message/Description Preview */}
      {description && (
        <div className="pt-2 border-t border-gray-100">
          <span className="font-medium text-gray-700 text-sm">Message:</span>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {String(description).length > 100 ? `${String(description).substring(0, 100)}...` : String(description)}
          </p>
        </div>
      )}
    </div>
  )
}