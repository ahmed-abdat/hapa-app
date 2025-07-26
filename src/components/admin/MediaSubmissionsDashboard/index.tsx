'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react'

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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch submissions from our custom admin API
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
        // Redirect to login or show error message
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

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isThisWeek = (date: Date) => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date >= weekAgo && date <= today
  }

  const isThisMonth = (date: Date) => {
    const today = new Date()
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300'
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const formTypeMatch = selectedFormType === 'all' || submission.formType === selectedFormType
    const statusMatch = selectedStatus === 'all' || submission.submissionStatus === selectedStatus
    return formTypeMatch && statusMatch
  })

  const openSubmissionDetails = (submissionId: string) => {
    // Open submission in Payload admin interface
    window.open(`/admin/collections/media-content-submissions/${submissionId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de Bord des Soumissions Médiatiques
            </h1>
            <p className="text-gray-600">
              Gérez et suivez les signalements et plaintes concernant le contenu médiatique
            </p>
          </div>
          <Button
            onClick={fetchData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                Actualisation...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Actualiser
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Submissions */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total des Soumissions
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.reportSubmissions} signalements, {stats.complaintSubmissions} plaintes
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En Attente
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pendingCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Nécessitent une révision
            </p>
          </CardContent>
        </Card>

        {/* In Review */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En Cours d&apos;Examen
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.reviewingCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Actuellement en révision
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ce Mois-ci
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.monthSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.weekSubmissions} cette semaine, {stats.todaySubmissions} aujourd&apos;hui
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Type Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reports Card */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${selectedFormType === 'report' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => setSelectedFormType(selectedFormType === 'report' ? 'all' : 'report')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Signalements de Contenu
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Contenus médiatiques inappropriés signalés
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-3">
              {stats.reportStats.total}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>En attente:</span>
                <span className="font-medium">{stats.reportStats.pending}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>En révision:</span>
                <span className="font-medium">{stats.reportStats.reviewing}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Résolus:</span>
                <span className="font-medium text-green-600">{stats.reportStats.resolved}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Français:</span>
                  <span className="font-medium">{stats.reportStats.french}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>العربية:</span>
                  <span className="font-medium">{stats.reportStats.arabic}</span>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Cette semaine:</span>
                  <span className="font-medium text-blue-600">{stats.reportStats.thisWeek}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ce mois:</span>
                  <span className="font-medium text-blue-600">{stats.reportStats.thisMonth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Card */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${selectedFormType === 'complaint' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedFormType(selectedFormType === 'complaint' ? 'all' : 'complaint')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Plaintes Officielles
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Plaintes formelles avec informations de contact
              </p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-3">
              {stats.complaintStats.total}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>En attente:</span>
                <span className="font-medium">{stats.complaintStats.pending}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>En révision:</span>
                <span className="font-medium">{stats.complaintStats.reviewing}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Résolues:</span>
                <span className="font-medium text-green-600">{stats.complaintStats.resolved}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Français:</span>
                  <span className="font-medium">{stats.complaintStats.french}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>العربية:</span>
                  <span className="font-medium">{stats.complaintStats.arabic}</span>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Cette semaine:</span>
                  <span className="font-medium text-blue-600">{stats.complaintStats.thisWeek}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ce mois:</span>
                  <span className="font-medium text-blue-600">{stats.complaintStats.thisMonth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics - Show when a specific form type is selected */}
      {selectedFormType !== 'all' && (
        <Card className="border-2 border-dashed border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedFormType === 'report' ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Statistiques détaillées - Signalements
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  Statistiques détaillées - Plaintes
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFormType === 'report' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Types de médias signalés</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{stats.mediaTypeStats.television}</div>
                      <div className="text-sm text-gray-600">Télévision</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{stats.mediaTypeStats.radio}</div>
                      <div className="text-sm text-gray-600">Radio</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{stats.mediaTypeStats.online}</div>
                      <div className="text-sm text-gray-600">En ligne</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{stats.mediaTypeStats.print}</div>
                      <div className="text-sm text-gray-600">Presse écrite</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{stats.mediaTypeStats.other}</div>
                      <div className="text-sm text-gray-600">Autre</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedFormType === 'complaint' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Répartition des plaintes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{stats.complaintStats.pending}</div>
                      <div className="text-sm text-gray-600">En attente</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">{stats.complaintStats.reviewing}</div>
                      <div className="text-sm text-gray-600">En révision</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{stats.complaintStats.resolved}</div>
                      <div className="text-sm text-gray-600">Résolues</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">{stats.complaintStats.dismissed}</div>
                      <div className="text-sm text-gray-600">Rejetées</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <h4 className="font-medium mb-2 text-gray-700">Priorité des soumissions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{stats.urgentCount}</div>
                  <div className="text-sm text-gray-600">Urgente</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{stats.highCount}</div>
                  <div className="text-sm text-gray-600">Élevée</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{stats.mediumCount}</div>
                  <div className="text-sm text-gray-600">Moyenne</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{stats.lowCount}</div>
                  <div className="text-sm text-gray-600">Faible</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFormType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFormType('all')}
          >
            Tous ({stats.totalSubmissions})
          </Button>
          <Button
            variant={selectedFormType === 'report' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFormType('report')}
          >
            Signalements ({stats.reportSubmissions})
          </Button>
          <Button
            variant={selectedFormType === 'complaint' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFormType('complaint')}
          >
            Plaintes ({stats.complaintSubmissions})
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            Tous les statuts
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
          >
            En attente ({stats.pendingCount})
          </Button>
          <Button
            variant={selectedStatus === 'reviewing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('reviewing')}
          >
            En révision ({stats.reviewingCount})
          </Button>
        </div>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Soumissions ({filteredSubmissions.length})
            </span>
            {selectedFormType !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormType('all')}
              >
                Voir toutes
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune soumission trouvée</p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openSubmissionDetails(submission.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {submission.formType === 'report' ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <MessageCircle className="h-5 w-5 text-blue-500" />
                        )}
                        <h3 className="font-medium text-gray-900">
                          {submission.title}
                        </h3>
                        <Badge className={getPriorityColor(submission.priority)}>
                          {submission.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(submission.submittedAt).toLocaleString('fr-FR')}
                        </span>
                        <span className="uppercase text-xs bg-gray-100 px-2 py-1 rounded">
                          {submission.locale}
                        </span>
                      </div>

                      {submission.complainantInfo && (
                        <p className="text-sm text-gray-600">
                          Contact: {submission.complainantInfo.fullName} - {submission.complainantInfo.emailAddress}
                        </p>
                      )}

                      {submission.contentInfo && (
                        <p className="text-sm text-gray-600">
                          Média: {submission.contentInfo.mediaType} - {submission.contentInfo.programName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(submission.submissionStatus)}>
                        {submission.submissionStatus === 'pending' && 'En attente'}
                        {submission.submissionStatus === 'reviewing' && 'En révision'}
                        {submission.submissionStatus === 'resolved' && 'Résolu'}
                        {submission.submissionStatus === 'dismissed' && 'Rejeté'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}