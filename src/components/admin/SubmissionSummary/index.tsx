'use client'

import React from 'react'

/**
 * Submission summary component for admin list view
 * Provides a clean, organized view of submission key information
 */
interface SubmissionSummaryProps {
  data: {
    title?: string
    formType?: string
    submissionStatus?: string
    priority?: string
    programName?: string
    contentInfo?: {
      programName?: string
      mediaType?: string
      specificChannel?: string
    }
    mediaType?: string
    specificChannel?: string
    submittedAt?: string
    locale?: string
  }
}

const SubmissionSummary: React.FC<SubmissionSummaryProps> = ({ data }) => {
  const programName = data.contentInfo?.programName || data.programName || 'Programme non spécifié'
  const mediaType = data.contentInfo?.mediaType || data.mediaType || 'Type non spécifié'
  const channel = data.contentInfo?.specificChannel || data.specificChannel || null
  const submittedDate = formatDate(data.submittedAt)
  const formType = data.formType || 'report'
  const status = data.submissionStatus || 'pending'
  const priority = data.priority || 'medium'
  const locale = data.locale || 'fr'

  return (
    <div className="submission-summary">
      <div className="summary-header">
        <div className="form-type-indicator">
          {formType === 'complaint' ? '📋' : '⚠️'} 
          <span className="form-type-text">
            {formType === 'complaint' ? 'Plainte' : 'Signalement'}
          </span>
        </div>
        <div className="submission-date">{submittedDate}</div>
      </div>

      <div className="content-info">
        <div className="program-name" title={programName}>
          📺 {truncateText(programName, 40)}
        </div>
        <div className="media-details">
          <span className="media-type">{getMediaTypeIcon(mediaType)} {mediaType}</span>
          {channel && <span className="channel">📡 {truncateText(channel, 25)}</span>}
        </div>
      </div>

      <div className="status-indicators">
        <div className={`status-pill ${status}`}>
          {getStatusIcon(status)} {getStatusLabel(status)}
        </div>
        <div className={`priority-pill ${priority}`}>
          {getPriorityIcon(priority)} {getPriorityLabel(priority)}
        </div>
        <div className={`locale-pill ${locale}`}>
          {locale === 'ar' ? '🇲🇷' : '🇫🇷'} {locale.toUpperCase()}
        </div>
      </div>

      <style jsx>{getStyles()}</style>
    </div>
  )
}

// Helper functions
function formatDate(dateString?: string): string {
  if (!dateString) return 'Date inconnue'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Date invalide'
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Date invalide'
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

function getMediaTypeIcon(mediaType: string): string {
  switch (mediaType.toLowerCase()) {
    case 'tv':
    case 'télévision': return '📺'
    case 'radio': return '📻'
    case 'website':
    case 'site web': return '🌐'
    case 'journal':
    case 'newspaper': return '📰'
    case 'magazine': return '📖'
    default: return '📢'
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending': return '⏳'
    case 'reviewing': return '👀'
    case 'resolved': return '✅'
    case 'dismissed': return '❌'
    default: return '📋'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'En attente'
    case 'reviewing': return 'En cours'
    case 'resolved': return 'Résolu'
    case 'dismissed': return 'Rejeté'
    default: return 'Inconnu'
  }
}

function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'low': return '🟢'
    case 'medium': return '🟡'
    case 'high': return '🟠'
    case 'urgent': return '🔴'
    default: return '⚪'
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'low': return 'Faible'
    case 'medium': return 'Moyen'
    case 'high': return 'Élevé'
    case 'urgent': return 'Urgent'
    default: return 'Moyen'
  }
}

function getStyles() {
  return `
    .submission-summary {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      min-width: 350px;
      max-width: 500px;
    }

    .submission-summary:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f3f4;
    }

    .form-type-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #495057;
      font-size: 14px;
    }

    .form-type-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .submission-date {
      font-size: 12px;
      color: #6c757d;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 12px;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    }

    .content-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .program-name {
      font-size: 16px;
      font-weight: 600;
      color: #212529;
      line-height: 1.3;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .media-details {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .media-type, .channel {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #495057;
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
    }

    .status-indicators {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .status-pill, .priority-pill, .locale-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Status Colors */
    .status-pill.pending {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .status-pill.reviewing {
      background: #cce5ff;
      color: #004085;
      border: 1px solid #99d3ff;
    }

    .status-pill.resolved {
      background: #d4edda;
      color: #155724;
      border: 1px solid #a3e6a8;
    }

    .status-pill.dismissed {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f1a8ad;
    }

    /* Priority Colors */
    .priority-pill.low {
      background: #d4edda;
      color: #155724;
      border: 1px solid #a3e6a8;
    }

    .priority-pill.medium {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .priority-pill.high {
      background: #ffe6cc;
      color: #cc5500;
      border: 1px solid #ffcc99;
    }

    .priority-pill.urgent {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f1a8ad;
      animation: urgent-glow 2s infinite;
    }

    @keyframes urgent-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.3); }
      50% { box-shadow: 0 0 0 4px rgba(220, 53, 69, 0); }
    }

    /* Locale Colors */
    .locale-pill.fr {
      background: #e3f2fd;
      color: #1565c0;
      border: 1px solid #bbdefb;
    }

    .locale-pill.ar {
      background: #f3e5f5;
      color: #7b1fa2;
      border: 1px solid #e1bee7;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .submission-summary {
        min-width: 280px;
        padding: 12px;
      }

      .summary-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .media-details {
        flex-direction: column;
        gap: 6px;
        align-items: flex-start;
      }

      .status-indicators {
        gap: 6px;
      }
    }
  `
}

export default SubmissionSummary