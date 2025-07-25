'use client'

import React from 'react'
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
  dateOfIncident?: string
  [key: string]: unknown
}

interface DetailedSubmissionViewProps {
  value?: SubmissionData
  readOnly?: boolean
  path?: string
  field?: unknown
  [key: string]: unknown
}

export const DetailedSubmissionView: React.FC<DetailedSubmissionViewProps> = (props) => {
  const { value, readOnly: _readOnly = true, path, ..._otherProps } = props
  
  // Get the actual document data using Payload's hook
  const { fields } = useWatchForm()
  const actualValue = fields?.submissionData?.value || (path ? fields?.[path]?.value : undefined)
  
  // Use the actual value from document instead of props.value
  const submissionData = actualValue || value;
  const data = submissionData as Record<string, unknown>;
  
  if (!data || typeof data !== 'object') {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md border">
        <span className="text-sm">Aucune donnée disponible</span>
      </div>
    )
  }

  // Format field names for display
  const formatFieldName = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      name: 'Nom complet',
      email: 'Adresse email',
      phone: 'Téléphone',
      subject: 'Sujet',
      message: 'Message',
      organization: 'Organisation',
      complaintType: 'Type de plainte',
      description: 'Description détaillée',
      documentType: 'Type de document',
      urgency: 'Niveau d\'urgence',
      purpose: 'Objectif',
      dateOfIncident: 'Date de l\'incident',
      formType: 'Type de formulaire',
      locale: 'Langue utilisée'
    }
    
    return fieldLabels[fieldName] || fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim()
  }

  // Format field values for display
  const formatFieldValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return 'Non renseigné'
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
    
    // Special formatting for specific fields
    if (key === 'complaintType') {
      const types: Record<string, string> = {
        service: 'Problème de service',
        staff: 'Personnel',
        procedure: 'Procédure administrative',
        other: 'Autre'
      }
      return types[value as string] || String(value)
    }
    
    if (key === 'documentType') {
      const types: Record<string, string> = {
        license: 'Licence média',
        permit: 'Permis de diffusion',
        certificate: 'Certificat',
        authorization: 'Autorisation',
        other: 'Autre document'
      }
      return types[value as string] || String(value)
    }
    
    if (key === 'urgency') {
      const urgencies: Record<string, string> = {
        normal: '📝 Normal',
        urgent: '⚡ Urgent',
        'very-urgent': '🚨 Très urgent'
      }
      return urgencies[value as string] || String(value)
    }
    
    if (key === 'formType') {
      const types: Record<string, string> = {
        contact: '📞 Formulaire de contact',
        complaint: '⚠️ Plainte officielle',
        'document-request': '📄 Demande de document'
      }
      return types[value as string] || String(value)
    }
    
    if (key === 'locale') {
      return value === 'fr' ? '🇫🇷 Français' : '🇲🇷 العربية'
    }
    
    if (key === 'dateOfIncident') {
      return new Date(value as string | number | Date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  // Organize fields by importance and category
  const personalInfo = ['name', 'email', 'phone', 'organization'].filter(key => data[key])
  const contentInfo = ['subject', 'message', 'description', 'purpose'].filter(key => data[key])
  const formMetadata = ['formType', 'locale', 'complaintType', 'documentType', 'urgency', 'dateOfIncident'].filter(key => data[key])
  const otherFields = Object.keys(data || {}).filter(key => 
    ![...personalInfo, ...contentInfo, ...formMetadata].includes(key) &&
    data[key] !== undefined &&
    data[key] !== null &&
    data[key] !== ''
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Personal Information */}
      {personalInfo.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              👤 Informations personnelles
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalInfo.map((key) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {formatFieldName(key)}
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 border">
                    {formatFieldValue(key, data[key])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Information */}
      {contentInfo.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-green-900 flex items-center">
              📝 Contenu de la demande
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {contentInfo.map((key) => (
              <div key={key} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {formatFieldName(key)}
                </label>
                <div className={`text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 border ${
                  key === 'message' || key === 'description' || key === 'purpose' 
                    ? 'whitespace-pre-wrap min-h-20' 
                    : ''
                }`}>
                  {formatFieldValue(key, data[key])}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Metadata */}
      {formMetadata.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-orange-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-orange-900 flex items-center">
              ⚙️ Détails du formulaire
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formMetadata.map((key) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {formatFieldName(key)}
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 border">
                    {formatFieldValue(key, data[key])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Fields */}
      {otherFields.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              📋 Informations supplémentaires
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherFields.map((key) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {formatFieldName(key)}
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 border">
                    {formatFieldValue(key, data[key])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}