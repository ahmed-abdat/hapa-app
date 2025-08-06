'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * Status badge component for media content submissions
 * Displays submission status with color coding and icons for easy recognition
 */
const SubmissionStatusBadge: React.FC = () => {
  const { data } = useRowLabel<{ 
    submissionStatus?: string;
    priority?: string;
    formType?: string;
  }>()

  const status = data?.submissionStatus || 'pending'
  const priority = data?.priority || 'medium'
  const formType = data?.formType || 'report'

  return (
    <div className="submission-status-container">
      {/* Form Type Indicator */}
      <div className={`form-type-badge ${formType}`}>
        {formType === 'complaint' ? '📋' : '⚠️'} {formType === 'complaint' ? 'Plainte' : 'Signalement'}
      </div>

      {/* Status Badge */}
      <div className={`status-badge ${status}`}>
        <span className="status-icon">{getStatusIcon(status)}</span>
        <span className="status-text">{getStatusLabel(status)}</span>
      </div>

      {/* Priority Indicator */}
      <div className={`priority-badge ${priority}`}>
        <span className="priority-icon">{getPriorityIcon(priority)}</span>
        <span className="priority-text">{getPriorityLabel(priority)}</span>
      </div>

      <style jsx>{getStyles()}</style>
    </div>
  )
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
    .submission-status-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      min-width: 200px;
    }

    .form-type-badge, .status-badge, .priority-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }

    /* Form Type Styles */
    .form-type-badge.report {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
      border: 2px solid #ff8f00;
    }

    .form-type-badge.complaint {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
      border: 2px solid #1976d2;
    }

    /* Status Styles */
    .status-badge.pending {
      background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
      color: #333;
      border: 2px solid #ffb300;
    }

    .status-badge.reviewing {
      background: linear-gradient(135deg, #2196f3 0%, #1565c0 100%);
      color: white;
      border: 2px solid #1976d2;
    }

    .status-badge.resolved {
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      color: white;
      border: 2px solid #388e3c;
    }

    .status-badge.dismissed {
      background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
      color: white;
      border: 2px solid #d32f2f;
    }

    /* Priority Styles */
    .priority-badge.low {
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      color: white;
      border: 2px solid #388e3c;
    }

    .priority-badge.medium {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
      border: 2px solid #ff8f00;
    }

    .priority-badge.high {
      background: linear-gradient(135deg, #ff5722 0%, #d84315 100%);
      color: white;
      border: 2px solid #e64a19;
    }

    .priority-badge.urgent {
      background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
      color: white;
      border: 2px solid #d32f2f;
      animation: urgent-pulse 2s infinite;
    }

    @keyframes urgent-pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
      }
    }

    .status-icon, .priority-icon {
      font-size: 14px;
    }

    .status-text, .priority-text {
      font-size: 11px;
      font-weight: 700;
    }

    /* Hover Effects */
    .form-type-badge:hover, .status-badge:hover, .priority-badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .submission-status-container {
        min-width: 150px;
      }

      .form-type-badge, .status-badge, .priority-badge {
        padding: 4px 8px;
        font-size: 10px;
      }

      .status-text, .priority-text {
        font-size: 9px;
      }
    }
  `
}

export default SubmissionStatusBadge