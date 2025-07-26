'use client'

import React, { useState, useEffect } from 'react'
import { 
  Banner,
  Button,
  useConfig
} from '@payloadcms/ui'
import { SubmissionsTable } from './SubmissionsTable'

import './index.scss'

interface SubmissionStats {
  totalSubmissions: number
  reportSubmissions: number
  complaintSubmissions: number
  pendingCount: number
  reviewingCount: number
  resolvedCount: number
  dismissedCount: number
  todaySubmissions: number
  weekSubmissions: number
  monthSubmissions: number
  urgentCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  frenchSubmissions: number
  arabicSubmissions: number
  mediaTypeStats: {
    television: number
    radio: number
    online: number
    print: number
    other: number
  }
  reportStats: {
    total: number
    pending: number
    reviewing: number
    resolved: number
    dismissed: number
    french: number
    arabic: number
    thisWeek: number
    thisMonth: number
  }
  complaintStats: {
    total: number
    pending: number
    reviewing: number
    resolved: number
    dismissed: number
    french: number
    arabic: number
    thisWeek: number
    thisMonth: number
  }
}

interface Submission {
  id: string
  title: string
  formType: 'report' | 'complaint'
  submissionStatus: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  submittedAt: string
  locale: 'fr' | 'ar'
  contentInfo?: {
    programName?: string
    mediaType?: string
  }
  complainantInfo?: {
    fullName?: string
    emailAddress?: string
  }
}

export function MediaSubmissionsDashboard() {
  const config = useConfig()
  const [stats, setStats] = useState<SubmissionStats>({
    totalSubmissions: 0,
    reportSubmissions: 0,
    complaintSubmissions: 0,
    pendingCount: 0,
    reviewingCount: 0,
    resolvedCount: 0,
    dismissedCount: 0,
    todaySubmissions: 0,
    weekSubmissions: 0,
    monthSubmissions: 0,
    urgentCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    frenchSubmissions: 0,
    arabicSubmissions: 0,
    mediaTypeStats: {
      television: 0,
      radio: 0,
      online: 0,
      print: 0,
      other: 0,
    },
    reportStats: {
      total: 0,
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0,
      french: 0,
      arabic: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
    complaintStats: {
      total: 0,
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0,
      french: 0,
      arabic: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
  })
  
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormType, setSelectedFormType] = useState<'all' | 'report' | 'complaint'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all')
  const [currentView, setCurrentView] = useState<'dashboard' | 'table'>('dashboard')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/media-submissions-stats', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setStats(data.stats)
          setSubmissions(data.submissions)
        } else {
          console.error('API returned error:', data.error)
        }
      } else if (response.status === 401) {
        console.error('Unauthorized access - user not logged in')
        window.location.href = '/admin/login'
      } else {
        console.error('Failed to fetch data:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const formTypeMatch = selectedFormType === 'all' || submission.formType === selectedFormType
    const statusMatch = selectedStatus === 'all' || submission.submissionStatus === selectedStatus
    return formTypeMatch && statusMatch
  })

  const openSubmissionDetails = (submissionId: string) => {
    window.open(`/admin/collections/media-content-submissions/${submissionId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="media-submissions-dashboard">
        <div className="media-submissions-dashboard__loading">
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Chargement des données...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="media-submissions-dashboard">
      {/* Header Banner */}
      <Banner type="success" className="media-submissions-dashboard__header">
        <div className="header-content">
          <div className="header-info">
            <h1>Tableau de Bord des Soumissions Médiatiques</h1>
            <p>Gérez et suivez les signalements et plaintes concernant le contenu médiatique</p>
          </div>
          <div className="header-actions">
            <Button
              onClick={fetchData}
              disabled={loading}
              buttonStyle="secondary"
              size="small"
            >
              {loading ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
        </div>
      </Banner>

      {/* Navigation Tabs */}
      <div className="media-submissions-dashboard__nav">
        <button
          className={`nav-tab ${currentView === 'dashboard' ? 'nav-tab--active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="nav-tab__icon">📊</span>
          Tableau de Bord
        </button>
        <button
          className={`nav-tab ${currentView === 'table' ? 'nav-tab--active' : ''}`}
          onClick={() => setCurrentView('table')}
        >
          <span className="nav-tab__icon">📋</span>
          Gestion des Soumissions
        </button>
      </div>

      {/* Main Content */}
      {currentView === 'dashboard' ? (
        <div className="media-submissions-dashboard__content">
          {/* Statistics Cards */}
          <div className="stats-grid">
            {/* Total Submissions */}
            <div className="stat-card stat-card--primary">
              <div className="stat-card__header">
                <h3>Total des Soumissions</h3>
                <span className="stat-card__icon">👥</span>
              </div>
              <div className="stat-card__value">{stats.totalSubmissions}</div>
              <div className="stat-card__details">
                {stats.reportSubmissions} signalements, {stats.complaintSubmissions} plaintes
              </div>
            </div>

            {/* Pending */}
            <div className="stat-card stat-card--warning">
              <div className="stat-card__header">
                <h3>En Attente</h3>
                <span className="stat-card__icon">⏳</span>
              </div>
              <div className="stat-card__value">{stats.pendingCount}</div>
              <div className="stat-card__details">Nécessitent une révision</div>
            </div>

            {/* In Review */}
            <div className="stat-card stat-card--info">
              <div className="stat-card__header">
                <h3>En Cours d&apos;Examen</h3>
                <span className="stat-card__icon">👁️</span>
              </div>
              <div className="stat-card__value">{stats.reviewingCount}</div>
              <div className="stat-card__details">Actuellement en révision</div>
            </div>

            {/* This Month */}
            <div className="stat-card stat-card--success">
              <div className="stat-card__header">
                <h3>Ce Mois-ci</h3>
                <span className="stat-card__icon">📈</span>
              </div>
              <div className="stat-card__value">{stats.monthSubmissions}</div>
              <div className="stat-card__details">
                {stats.weekSubmissions} cette semaine, {stats.todaySubmissions} aujourd&apos;hui
              </div>
            </div>
          </div>

          {/* Form Type Cards */}
          <div className="form-type-grid">
            {/* Reports Card */}
            <div 
              className={`form-type-card ${selectedFormType === 'report' ? 'form-type-card--selected' : ''}`}
              onClick={() => setSelectedFormType(selectedFormType === 'report' ? 'all' : 'report')}
            >
              <div className="form-type-card__header">
                <div className="form-type-card__info">
                  <h3>Signalements de Contenu</h3>
                  <p>Contenus médiatiques inappropriés signalés</p>
                </div>
                <span className="form-type-card__icon form-type-card__icon--warning">⚠️</span>
              </div>
              <div className="form-type-card__value">{stats.reportStats.total}</div>
              <div className="form-type-card__stats">
                <div className="stat-row">
                  <span>En attente:</span>
                  <span>{stats.reportStats.pending}</span>
                </div>
                <div className="stat-row">
                  <span>En révision:</span>
                  <span>{stats.reportStats.reviewing}</span>
                </div>
                <div className="stat-row">
                  <span>Résolus:</span>
                  <span className="stat-positive">{stats.reportStats.resolved}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-row">
                  <span>Cette semaine:</span>
                  <span className="stat-highlight">{stats.reportStats.thisWeek}</span>
                </div>
              </div>
            </div>

            {/* Complaints Card */}
            <div 
              className={`form-type-card ${selectedFormType === 'complaint' ? 'form-type-card--selected' : ''}`}
              onClick={() => setSelectedFormType(selectedFormType === 'complaint' ? 'all' : 'complaint')}
            >
              <div className="form-type-card__header">
                <div className="form-type-card__info">
                  <h3>Plaintes Officielles</h3>
                  <p>Plaintes formelles avec informations de contact</p>
                </div>
                <span className="form-type-card__icon form-type-card__icon--info">💬</span>
              </div>
              <div className="form-type-card__value">{stats.complaintStats.total}</div>
              <div className="form-type-card__stats">
                <div className="stat-row">
                  <span>En attente:</span>
                  <span>{stats.complaintStats.pending}</span>
                </div>
                <div className="stat-row">
                  <span>En révision:</span>
                  <span>{stats.complaintStats.reviewing}</span>
                </div>
                <div className="stat-row">
                  <span>Résolues:</span>
                  <span className="stat-positive">{stats.complaintStats.resolved}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-row">
                  <span>Cette semaine:</span>
                  <span className="stat-highlight">{stats.complaintStats.thisWeek}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Submissions Preview */}
          <div className="recent-submissions">
            <div className="section-header">
              <h2>Soumissions Récentes</h2>
              <Button
                buttonStyle="secondary"
                size="small"
                onClick={() => setCurrentView('table')}
              >
                Voir tout
              </Button>
            </div>
            
            <div className="submissions-preview">
              {filteredSubmissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="submission-preview"
                  onClick={() => openSubmissionDetails(submission.id)}
                >
                  <div className="submission-preview__content">
                    <div className="submission-preview__header">
                      <span className={`submission-type submission-type--${submission.formType}`}>
                        {submission.formType === 'report' ? '⚠️' : '💬'}
                      </span>
                      <h4>{submission.title}</h4>
                      <span className={`priority-badge priority-badge--${submission.priority}`}>
                        {submission.priority}
                      </span>
                    </div>
                    
                    <div className="submission-preview__meta">
                      <span className="submission-date">
                        📅 {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className={`locale-badge locale-badge--${submission.locale}`}>
                        {submission.locale.toUpperCase()}
                      </span>
                    </div>

                    {submission.complainantInfo && (
                      <div className="submission-preview__contact">
                        📧 {submission.complainantInfo.fullName} - {submission.complainantInfo.emailAddress}
                      </div>
                    )}

                    {submission.contentInfo && (
                      <div className="submission-preview__media">
                        📺 {submission.contentInfo.mediaType} - {submission.contentInfo.programName}
                      </div>
                    )}
                  </div>

                  <div className="submission-preview__status">
                    <span className={`status-badge status-badge--${submission.submissionStatus}`}>
                      {submission.submissionStatus === 'pending' && 'En attente'}
                      {submission.submissionStatus === 'reviewing' && 'En révision'}
                      {submission.submissionStatus === 'resolved' && 'Résolu'}
                      {submission.submissionStatus === 'dismissed' && 'Rejeté'}
                    </span>
                    <button className="view-details-btn">
                      👁️ Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="media-submissions-dashboard__table">
          {/* Filters */}
          <div className="table-filters">
            <div className="filter-group">
              <h3>Type de soumission:</h3>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${selectedFormType === 'all' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedFormType('all')}
                >
                  Tous ({stats.totalSubmissions})
                </button>
                <button
                  className={`filter-btn ${selectedFormType === 'report' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedFormType('report')}
                >
                  Signalements ({stats.reportSubmissions})
                </button>
                <button
                  className={`filter-btn ${selectedFormType === 'complaint' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedFormType('complaint')}
                >
                  Plaintes ({stats.complaintSubmissions})
                </button>
              </div>
            </div>

            <div className="filter-group">
              <h3>Statut:</h3>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${selectedStatus === 'all' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedStatus('all')}
                >
                  Tous
                </button>
                <button
                  className={`filter-btn ${selectedStatus === 'pending' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedStatus('pending')}
                >
                  En attente ({stats.pendingCount})
                </button>
                <button
                  className={`filter-btn ${selectedStatus === 'reviewing' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedStatus('reviewing')}
                >
                  En révision ({stats.reviewingCount})
                </button>
                <button
                  className={`filter-btn ${selectedStatus === 'resolved' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedStatus('resolved')}
                >
                  Résolu ({stats.resolvedCount})
                </button>
                <button
                  className={`filter-btn ${selectedStatus === 'dismissed' ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedStatus('dismissed')}
                >
                  Rejeté ({stats.dismissedCount})
                </button>
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <SubmissionsTable 
            submissions={filteredSubmissions} 
            onRefresh={fetchData}
          />
        </div>
      )}
    </div>
  )
}