'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

import './SubmissionsTable.scss'

interface Submission {
  id: string
  title: string
  formType: 'report' | 'complaint'
  submissionStatus: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  submittedAt: string
  locale: 'fr' | 'ar'
  adminNotes?: string
  contentInfo?: {
    programName?: string
    mediaType?: string
    broadcastDate?: string
    description?: string
  }
  complainantInfo?: {
    fullName?: string
    emailAddress?: string
    phoneNumber?: string
    organization?: string
  }
  reporterInfo?: {
    emailAddress?: string
    reportType?: string
    incidentDetails?: string
  }
}

interface SubmissionsTableProps {
  submissions: Submission[]
  onRefresh: () => void
}

export function SubmissionsTable({ submissions, onRefresh }: SubmissionsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [tempData, setTempData] = useState<{
    status: string
    priority: string
    notes: string
  }>({ status: '', priority: '', notes: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  const openSubmissionDetails = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const closeSubmissionDetails = () => {
    setSelectedSubmission(null)
  }

  const startEditing = (submission: Submission) => {
    setEditingId(submission.id)
    setTempData({
      status: submission.submissionStatus,
      priority: submission.priority,
      notes: submission.adminNotes || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setTempData({ status: '', priority: '', notes: '' })
  }

  const saveChanges = async (submissionId: string) => {
    if (isUpdating) return

    try {
      setIsUpdating(true)
      
      const response = await fetch(`/api/admin/media-submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          submissionStatus: tempData.status,
          priority: tempData.priority,
          adminNotes: tempData.notes,
        }),
      })

      if (response.ok) {
        setEditingId(null)
        setTempData({ status: '', priority: '', notes: '' })
        onRefresh()
      } else {
        console.error('Failed to update submission')
      }
    } catch (error) {
      console.error('Error updating submission:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟠'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'reviewing': return '👁️'
      case 'resolved': return '✅'
      case 'dismissed': return '❌'
      default: return '⚪'
    }
  }

  const getFormTypeIcon = (formType: string) => {
    return formType === 'report' ? '⚠️' : '💬'
  }

  if (submissions.length === 0) {
    return (
      <div className="submissions-table">
        <div className="submissions-table__empty">
          <div className="empty-state">
            <span className="empty-state__icon">📋</span>
            <h3>Aucune soumission trouvée</h3>
            <p>Il n&apos;y a pas de soumissions correspondant aux critères sélectionnés.</p>
            <Button
              buttonStyle="secondary"
              size="small"
              onClick={onRefresh}
            >
              Actualiser
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="submissions-table">
      {/* Table */}
      <div className="submissions-table__container">
        <table className="submissions-table__table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Titre</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Date</th>
              <th>Langue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <React.Fragment key={submission.id}>
                <tr className="submissions-table__row">
                <td>
                  <div className="form-type-cell">
                    <span className="form-type-icon">
                      {getFormTypeIcon(submission.formType)}
                    </span>
                    <span className="form-type-label">
                      {submission.formType === 'report' ? 'Signalement' : 'Plainte'}
                    </span>
                  </div>
                </td>
                
                <td>
                  <div className="title-cell">
                    <h4>{submission.title}</h4>
                    {submission.contentInfo?.programName && (
                      <span className="program-name">
                        📺 {submission.contentInfo.programName}
                      </span>
                    )}
                  </div>
                </td>
                
                <td>
                  {editingId === submission.id ? (
                    <div className="edit-field">
                      <select 
                        value={tempData.status}
                        onChange={(e) => setTempData(prev => ({ ...prev, status: e.target.value }))}
                        className="status-select"
                      >
                        <option value="pending">En attente</option>
                        <option value="reviewing">En révision</option>
                        <option value="resolved">Résolu</option>
                        <option value="dismissed">Rejeté</option>
                      </select>
                    </div>
                  ) : (
                    <div className={`status-badge status-badge--${submission.submissionStatus}`}>
                      <span className="status-icon">{getStatusIcon(submission.submissionStatus)}</span>
                      <span className="status-text">
                        {submission.submissionStatus === 'pending' && 'En attente'}
                        {submission.submissionStatus === 'reviewing' && 'En révision'}
                        {submission.submissionStatus === 'resolved' && 'Résolu'}
                        {submission.submissionStatus === 'dismissed' && 'Rejeté'}
                      </span>
                    </div>
                  )}
                </td>
                
                <td>
                  {editingId === submission.id ? (
                    <div className="edit-field">
                      <select
                        value={tempData.priority}
                        onChange={(e) => setTempData(prev => ({ ...prev, priority: e.target.value }))}
                        className="priority-select"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  ) : (
                    <div className={`priority-badge priority-badge--${submission.priority}`}>
                      <span className="priority-icon">{getPriorityIcon(submission.priority)}</span>
                      <span className="priority-text">
                        {submission.priority === 'low' && 'Faible'}
                        {submission.priority === 'medium' && 'Moyenne'}
                        {submission.priority === 'high' && 'Élevée'}
                        {submission.priority === 'urgent' && 'Urgente'}
                      </span>
                    </div>
                  )}
                </td>
                
                <td>
                  <div className="date-cell">
                    📅 {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                
                <td>
                  <span className={`locale-badge locale-badge--${submission.locale}`}>
                    {submission.locale.toUpperCase()}
                  </span>
                </td>
                
                <td>
                  <div className="action-buttons">
                    {editingId === submission.id ? (
                      <>
                        <button
                          className="action-btn action-btn--save"
                          onClick={() => saveChanges(submission.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? '⏳' : '💾'} Sauvegarder
                        </button>
                        <button
                          className="action-btn action-btn--cancel"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                        >
                          ❌ Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => startEditing(submission)}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => openSubmissionDetails(submission)}
                        >
                          👁️ Détails
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              
              {editingId === submission.id && (
                <tr className="edit-notes-row">
                  <td colSpan={7}>
                    <div className="edit-notes">
                      <h4>Notes administratives:</h4>
                      <textarea
                        value={tempData.notes}
                        onChange={(e) => setTempData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Ajouter des notes administratives..."
                        rows={3}
                        className="notes-textarea"
                      />
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="submission-modal">
          <div className="submission-modal__overlay" onClick={closeSubmissionDetails} />
          <div className="submission-modal__content">
            <div className="submission-modal__header">
              <div className="modal-title">
                <span className="form-type-icon">
                  {getFormTypeIcon(selectedSubmission.formType)}
                </span>
                <h2>{selectedSubmission.title}</h2>
              </div>
              <button 
                className="modal-close"
                onClick={closeSubmissionDetails}
              >
                ❌
              </button>
            </div>
            
            <div className="submission-modal__body">
              {/* Basic Info */}
              <div className="info-section">
                <h3>Informations générales</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Type:</strong>
                    <span>
                      {getFormTypeIcon(selectedSubmission.formType)} 
                      {selectedSubmission.formType === 'report' ? 'Signalement' : 'Plainte'}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Statut:</strong>
                    <span className={`status-badge status-badge--${selectedSubmission.submissionStatus}`}>
                      {getStatusIcon(selectedSubmission.submissionStatus)}
                      {selectedSubmission.submissionStatus === 'pending' && 'En attente'}
                      {selectedSubmission.submissionStatus === 'reviewing' && 'En révision'}
                      {selectedSubmission.submissionStatus === 'resolved' && 'Résolu'}
                      {selectedSubmission.submissionStatus === 'dismissed' && 'Rejeté'}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Priorité:</strong>
                    <span className={`priority-badge priority-badge--${selectedSubmission.priority}`}>
                      {getPriorityIcon(selectedSubmission.priority)}
                      {selectedSubmission.priority === 'low' && 'Faible'}
                      {selectedSubmission.priority === 'medium' && 'Moyenne'}
                      {selectedSubmission.priority === 'high' && 'Élevée'}
                      {selectedSubmission.priority === 'urgent' && 'Urgente'}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Date de soumission:</strong>
                    <span>📅 {new Date(selectedSubmission.submittedAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="info-item">
                    <strong>Langue:</strong>
                    <span className={`locale-badge locale-badge--${selectedSubmission.locale}`}>
                      {selectedSubmission.locale.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Info */}
              {selectedSubmission.contentInfo && (
                <div className="info-section">
                  <h3>Informations sur le contenu</h3>
                  <div className="info-grid">
                    {selectedSubmission.contentInfo.programName && (
                      <div className="info-item">
                        <strong>Programme:</strong>
                        <span>📺 {selectedSubmission.contentInfo.programName}</span>
                      </div>
                    )}
                    {selectedSubmission.contentInfo.mediaType && (
                      <div className="info-item">
                        <strong>Type de média:</strong>
                        <span>{selectedSubmission.contentInfo.mediaType}</span>
                      </div>
                    )}
                    {selectedSubmission.contentInfo.broadcastDate && (
                      <div className="info-item">
                        <strong>Date de diffusion:</strong>
                        <span>📅 {new Date(selectedSubmission.contentInfo.broadcastDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {selectedSubmission.contentInfo.description && (
                      <div className="info-item">
                        <strong>Description:</strong>
                        <div className="description-text">
                          {selectedSubmission.contentInfo.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {selectedSubmission.complainantInfo && (
                <div className="info-section">
                  <h3>Informations de contact</h3>
                  <div className="info-grid">
                    {selectedSubmission.complainantInfo.fullName && (
                      <div className="info-item">
                        <strong>Nom complet:</strong>
                        <span>👤 {selectedSubmission.complainantInfo.fullName}</span>
                      </div>
                    )}
                    {selectedSubmission.complainantInfo.emailAddress && (
                      <div className="info-item">
                        <strong>Email:</strong>
                        <span>
                          📧 
                          <a href={`mailto:${selectedSubmission.complainantInfo.emailAddress}`}>
                            {selectedSubmission.complainantInfo.emailAddress}
                          </a>
                        </span>
                      </div>
                    )}
                    {selectedSubmission.complainantInfo.phoneNumber && (
                      <div className="info-item">
                        <strong>Téléphone:</strong>
                        <span>📞 {selectedSubmission.complainantInfo.phoneNumber}</span>
                      </div>
                    )}
                    {selectedSubmission.complainantInfo.organization && (
                      <div className="info-item">
                        <strong>Organisation:</strong>
                        <span>🏢 {selectedSubmission.complainantInfo.organization}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reporter Info */}
              {selectedSubmission.reporterInfo && (
                <div className="info-section">
                  <h3>Informations du signalement</h3>
                  <div className="info-grid">
                    {selectedSubmission.reporterInfo.emailAddress && (
                      <div className="info-item">
                        <strong>Email du signaleur:</strong>
                        <span>
                          📧 
                          <a href={`mailto:${selectedSubmission.reporterInfo.emailAddress}`}>
                            {selectedSubmission.reporterInfo.emailAddress}
                          </a>
                        </span>
                      </div>
                    )}
                    {selectedSubmission.reporterInfo.reportType && (
                      <div className="info-item">
                        <strong>Type de signalement:</strong>
                        <span>{selectedSubmission.reporterInfo.reportType}</span>
                      </div>
                    )}
                    {selectedSubmission.reporterInfo.incidentDetails && (
                      <div className="info-item">
                        <strong>Détails de l&apos;incident:</strong>
                        <div className="description-text">
                          {selectedSubmission.reporterInfo.incidentDetails}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedSubmission.adminNotes && (
                <div className="info-section">
                  <h3>Notes administratives</h3>
                  <div className="admin-notes">
                    {selectedSubmission.adminNotes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="submission-modal__footer">
              <Button
                buttonStyle="secondary"
                onClick={() => window.open(`/admin/collections/media-content-submissions/${selectedSubmission.id}`, '_blank')}
              >
                Modifier dans Payload
              </Button>
              <Button
                buttonStyle="primary"
                onClick={closeSubmissionDetails}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}