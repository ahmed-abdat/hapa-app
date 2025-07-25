'use client'

import React from 'react'

interface SubmissionListCellProps {
  rowData?: {
    submissionData?: {
      name?: string
      email?: string
      phone?: string
      subject?: string
      message?: string
      description?: string
      formType?: string
    }
    formType?: string
    status?: string
    createdAt?: string
  }
  [key: string]: unknown
}

export const SubmissionListCell: React.FC<SubmissionListCellProps> = ({ rowData, ..._props }) => {
  if (!rowData?.submissionData) {
    return <span className="text-gray-400 text-sm">Pas de données</span>
  }

  const data = rowData.submissionData
  const formTypeLabels: Record<string, string> = {
    contact: '📞 Contact',
    complaint: '⚠️ Plainte',
    'document-request': '📄 Document'
  }

  const statusLabels: Record<string, { label: string, color: string }> = {
    new: { label: 'Nouveau', color: 'bg-blue-100 text-blue-800' },
    reviewed: { label: 'Consulté', color: 'bg-yellow-100 text-yellow-800' },
    'in-progress': { label: 'En cours', color: 'bg-orange-100 text-orange-800' },
    responded: { label: 'Répondu', color: 'bg-green-100 text-green-800' },
    closed: { label: 'Fermé', color: 'bg-gray-100 text-gray-800' }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const message = data.message || data.description || 'Aucun message'
  const status = statusLabels[rowData.status || 'new']

  return (
    <div className="py-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header with name and form type */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {data.name || 'Utilisateur anonyme'}
            </span>
            <span className="text-sm text-gray-500">
              {formTypeLabels[data.formType || rowData.formType || ''] || rowData.formType}
            </span>
          </div>
          
          {/* Contact info */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
            {data.email && (
              <span className="flex items-center gap-1">
                📧 <span className="truncate max-w-40">{data.email}</span>
              </span>
            )}
            {data.phone && (
              <span className="flex items-center gap-1">
                📱 {data.phone}
              </span>
            )}
          </div>

          {/* Subject/Message preview */}
          {(data.subject || message !== 'Aucun message') && (
            <div className="text-sm text-gray-700">
              {data.subject && (
                <div className="font-medium mb-1 truncate">
                  {data.subject}
                </div>
              )}
              {message !== 'Aucun message' && (
                <div className="text-gray-600 line-clamp-2">
                  {message.length > 80 ? `${message.substring(0, 80)}...` : message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status and date */}
        <div className="flex flex-col items-end gap-1 ml-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
            {status.label}
          </span>
          {rowData.createdAt && (
            <span className="text-xs text-gray-500">
              {formatDate(rowData.createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}