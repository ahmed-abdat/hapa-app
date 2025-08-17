'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useAdminTranslation } from '@/utilities/admin-translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  HardDriveIcon,
  ScanIcon,
  TrashIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InfoIcon,
  SettingsIcon,
} from 'lucide-react'
import './dashboard.css'
import { cn } from '@/lib/utils'

interface CleanupJob {
  id: string
  jobType: 'verification' | 'cleanup' | 'audit'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial'
  executedAt: string
  completedAt?: string
  metrics?: {
    filesScanned: number
    filesProcessed: number
    orphanedFilesFound: number
    filesDeleted: number
    deletionErrors: number
    storageReclaimed: number
  }
  orphanedFiles?: Array<{
    filename: string
    path: string
    size?: number
    lastModified?: string
    status: 'found' | 'deleted' | 'failed' | 'skipped'
    error?: string
  }>
  configuration?: {
    dryRun: boolean
    maxFilesToProcess: number
    retentionDays: number
  }
  executionLog?: string
  errorLog?: string
}

interface ScanSettings {
  directories: string[]
  maxFiles: number
  retentionDays: number
  dryRun: boolean
}

export function CleanupDashboard() {
  const { dt, i18n } = useAdminTranslation()
  const [jobs, setJobs] = useState<CleanupJob[]>([])
  const [selectedJob, setSelectedJob] = useState<CleanupJob | null>(null)
  const [scanResults, setScanResults] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [scanSettings, setScanSettings] = useState<ScanSettings>({
    directories: ['images/', 'docs/', 'videos/', 'audio/', 'media/', 'forms/'],
    maxFiles: 1000,
    retentionDays: 30,
    dryRun: false,
  })

  // Load cleanup jobs
  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/payload/collections/media-cleanup-jobs?limit=10&sort=-createdAt')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to load cleanup jobs:', error)
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  // Scan for orphaned files
  const handleScan = async () => {
    setIsScanning(true)
    setScanResults(null)
    setSelectedFiles(new Set())

    try {
      const params = new URLSearchParams({
        dryRun: 'true',
        directories: scanSettings.directories.join(','),
        maxFiles: scanSettings.maxFiles.toString(),
        retentionDays: scanSettings.retentionDays.toString(),
      })

      const response = await fetch(`/api/admin/media-cleanup?${params}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Scan failed')
      }

      const data = await response.json()
      setScanResults(data)
      
      // Select all files by default
      if (data.orphanedFiles) {
        setSelectedFiles(new Set(data.orphanedFiles.map((f: any) => f.path)))
      }

      const message = dt('mediaCleanupJobs.messagesFoundOrphanedFiles').replace('{count}', String(data.orphanedFiles?.length || 0))
      toast.success(message)
      await loadJobs()
    } catch (error) {
      toast.error(dt('mediaCleanupJobs.errorsScanFailed'))
      console.error('Scan error:', error)
    } finally {
      setIsScanning(false)
    }
  }

  // Execute cleanup
  const handleCleanup = async () => {
    if (selectedFiles.size === 0) {
      toast.error(dt('mediaCleanupJobs.errorsNoFilesSelected'))
      return
    }

    setIsCleaning(true)

    try {
      const response = await fetch('/api/admin/media-cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orphanedFiles: Array.from(selectedFiles),
          dryRun: scanSettings.dryRun,
        }),
      })

      if (!response.ok) {
        throw new Error('Cleanup failed')
      }

      const data = await response.json()
      
      if (scanSettings.dryRun) {
        const dryRunMessage = dt('mediaCleanupJobs.messagesDryRunCompleted').replace('{count}', String(selectedFiles.size))
        toast.info(dryRunMessage)
      } else {
        const successMessage = dt('mediaCleanupJobs.messagesFilesDeleted').replace('{count}', String(data.results?.deleted || 0))
        toast.success(successMessage)
      }

      setScanResults(null)
      setSelectedFiles(new Set())
      await loadJobs()
    } catch (error) {
      toast.error(dt('mediaCleanupJobs.errorsCleanupFailed'))
      console.error('Cleanup error:', error)
    } finally {
      setIsCleaning(false)
    }
  }

  // Toggle file selection
  const toggleFileSelection = (path: string) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(path)) {
      newSelection.delete(path)
    } else {
      newSelection.add(path)
    }
    setSelectedFiles(newSelection)
  }

  // Select/deselect all files
  const toggleAllFiles = () => {
    if (selectedFiles.size === scanResults?.orphanedFiles?.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(scanResults.orphanedFiles.map((f: any) => f.path)))
    }
  }

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return `0 ${dt('mediaCleanupJobs.unitsBytes')}`
    const k = 1024
    const sizes = [
      dt('mediaCleanupJobs.unitsBytes'),
      dt('mediaCleanupJobs.unitsKilobytes'),
      dt('mediaCleanupJobs.unitsMegabytes'),
      dt('mediaCleanupJobs.unitsGigabytes')
    ]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const icons = {
      pending: ClockIcon,
      running: RefreshCwIcon,
      completed: CheckCircleIcon,
      failed: AlertTriangleIcon,
      partial: AlertTriangleIcon,
    }
    
    const statusLabels = {
      pending: dt('mediaCleanupJobs.statusPending'),
      running: dt('mediaCleanupJobs.statusRunning'),
      completed: dt('mediaCleanupJobs.statusCompleted'),
      failed: dt('mediaCleanupJobs.statusFailed'),
      partial: dt('mediaCleanupJobs.statusPartial'),
    }
    
    const Icon = icons[status as keyof typeof icons] || ClockIcon
    
    return (
      <span className={cn('status-badge', status)}>
        <Icon className="h-3 w-3" />
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    )
  }

  // Get job type badge
  const getJobTypeBadge = (type: string) => {
    const typeLabels = {
      verification: dt('mediaCleanupJobs.jobTypesVerification'),
      cleanup: dt('mediaCleanupJobs.jobTypesCleanup'),
      audit: dt('mediaCleanupJobs.jobTypesAudit'),
    }
    
    return (
      <span className={cn('job-type-badge', type)}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </span>
    )
  }

  return (
    <div className="cleanup-dashboard-container">
      {/* Header */}
      <div className="cleanup-header">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <HardDriveIcon size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{dt('mediaCleanupJobs.dashboardTitle')}</h1>
            <p className="text-sm text-muted-foreground">
              {dt('mediaCleanupJobs.dashboardSubtitle')}
            </p>
          </div>
        </div>
        <div className="action-buttons">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="cleanup-button outline"
          >
            <SettingsIcon className="h-4 w-4" />
            {dt('mediaCleanupJobs.settings')}
          </Button>
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="cleanup-button primary"
          >
            {isScanning ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                {dt('mediaCleanupJobs.scanning')}
              </>
            ) : (
              <>
                <ScanIcon className="h-4 w-4" />
                {dt('mediaCleanupJobs.scanForOrphaned')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <div className="cleanup-settings-panel">
          <div className="settings-header">
            <h3 className="text-lg font-semibold">{dt('mediaCleanupJobs.scanSettings')}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              <ChevronUpIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="settings-grid">
            <div className="setting-field">
              <Label htmlFor="directories" className="setting-label">
                {dt('mediaCleanupJobs.directoriesToScan')}
              </Label>
              <Input
                id="directories"
                value={scanSettings.directories.join(', ')}
                onChange={(e) =>
                  setScanSettings({
                    ...scanSettings,
                    directories: e.target.value.split(',').map((d) => d.trim()),
                  })
                }
                placeholder={dt('mediaCleanupJobs.labelsPlaceholderDirectories')}
              />
              <p className="setting-description">
                {dt('mediaCleanupJobs.directoriesToScanDesc')}
              </p>
            </div>
            <div className="setting-field">
              <Label htmlFor="maxFiles" className="setting-label">
                {dt('mediaCleanupJobs.maxFilesToProcess')}
              </Label>
              <Input
                id="maxFiles"
                type="number"
                value={scanSettings.maxFiles}
                onChange={(e) =>
                  setScanSettings({
                    ...scanSettings,
                    maxFiles: parseInt(e.target.value) || 1000,
                  })
                }
              />
            </div>
            <div className="setting-field">
              <Label htmlFor="retentionDays" className="setting-label">
                {dt('mediaCleanupJobs.retentionPeriod')}
              </Label>
              <Input
                id="retentionDays"
                type="number"
                value={scanSettings.retentionDays}
                onChange={(e) =>
                  setScanSettings({
                    ...scanSettings,
                    retentionDays: parseInt(e.target.value) || 30,
                  })
                }
              />
              <p className="setting-description">
                {dt('mediaCleanupJobs.retentionPeriodDesc')}
              </p>
            </div>
            <div className="setting-field">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dryRun"
                  checked={scanSettings.dryRun}
                  onCheckedChange={(checked) =>
                    setScanSettings({
                      ...scanSettings,
                      dryRun: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="dryRun"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {dt('mediaCleanupJobs.dryRunMode')}
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="cleanup-stats-grid">
        <div className="cleanup-stat-card green">
          <div className="stat-label">
            <FileIcon className="h-4 w-4" />
            {dt('mediaCleanupJobs.totalScanned')}
          </div>
          <div className="stat-value">
            {jobs.reduce((acc, job) => acc + (job.metrics?.filesScanned || 0), 0)}
          </div>
          <div className="stat-description">{dt('mediaCleanupJobs.filesChecked')}</div>
        </div>
        
        <div className="cleanup-stat-card orange">
          <div className="stat-label">
            <AlertTriangleIcon className="h-4 w-4" />
            {dt('mediaCleanupJobs.orphanedFound')}
          </div>
          <div className="stat-value">
            {jobs.reduce((acc, job) => acc + (job.metrics?.orphanedFilesFound || 0), 0)}
          </div>
          <div className="stat-description">{dt('mediaCleanupJobs.orphanedIdentified')}</div>
        </div>
        
        <div className="cleanup-stat-card blue">
          <div className="stat-label">
            <TrashIcon className="h-4 w-4" />
            {dt('mediaCleanupJobs.filesDeleted')}
          </div>
          <div className="stat-value">
            {jobs.reduce((acc, job) => acc + (job.metrics?.filesDeleted || 0), 0)}
          </div>
          <div className="stat-description">{dt('mediaCleanupJobs.successfullyDeleted')}</div>
        </div>
        
        <div className="cleanup-stat-card red">
          <div className="stat-label">
            <HardDriveIcon className="h-4 w-4" />
            {dt('mediaCleanupJobs.storageReclaimed')}
          </div>
          <div className="stat-value">
            {formatSize(jobs.reduce((acc, job) => acc + (job.metrics?.storageReclaimed || 0), 0))}
          </div>
          <div className="stat-description">{dt('mediaCleanupJobs.totalSpaceReclaimed')}</div>
        </div>
      </div>

      {/* Scan Results */}
      {scanResults && (
        <div className="scan-results-section">
          <div className="scan-results-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{dt('mediaCleanupJobs.scanResults')}</h3>
                <p className="text-sm text-muted-foreground">
                  {scanResults.orphanedFiles?.length || 0} {dt('mediaCleanupJobs.foundOrphaned')}
                  ({formatSize(scanResults.metrics?.storageSize || 0)} {dt('mediaCleanupJobs.labelsTotal')})
                </p>
              </div>
              <div className="action-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllFiles}
                >
                  {selectedFiles.size === scanResults.orphanedFiles?.length
                    ? dt('mediaCleanupJobs.selectAll')
                    : dt('mediaCleanupJobs.selectAll')}
                </Button>
                <Button
                  size="sm"
                  variant={scanSettings.dryRun ? 'outline' : 'destructive'}
                  onClick={handleCleanup}
                  disabled={isCleaning || selectedFiles.size === 0}
                  className={cn(
                    'cleanup-button',
                    scanSettings.dryRun ? 'outline' : 'destructive'
                  )}
                >
                  {isCleaning ? (
                    <>
                      <RefreshCwIcon className="h-4 w-4 animate-spin" />
                      {dt('mediaCleanupJobs.cleaningInProgress')}
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      {dt('mediaCleanupJobs.cleanupSelected')}
                      {selectedFiles.size > 0 && ` (${selectedFiles.size})`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="scan-results-content">
            <table className="cleanup-table">
              <thead>
                <tr>
                  <th className="w-12">
                    <Checkbox
                      checked={selectedFiles.size === scanResults.orphanedFiles?.length}
                      onCheckedChange={toggleAllFiles}
                    />
                  </th>
                  <th>{dt('mediaCleanupJobs.fieldsOrphanedFilesFilename')}</th>
                  <th>{dt('mediaCleanupJobs.fieldsOrphanedFilesPath')}</th>
                  <th>{dt('mediaCleanupJobs.size')}</th>
                  <th>{dt('mediaCleanupJobs.lastModified')}</th>
                </tr>
              </thead>
              <tbody>
                {scanResults.orphanedFiles?.map((file: any) => (
                  <tr key={file.path}>
                    <td>
                      <Checkbox
                        checked={selectedFiles.has(file.path)}
                        onCheckedChange={() => toggleFileSelection(file.path)}
                      />
                    </td>
                    <td className="font-mono text-sm">
                      {file.filename}
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {file.path}
                    </td>
                    <td>{formatSize(file.size || 0)}</td>
                    <td>
                      {file.lastModified
                        ? new Date(file.lastModified).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="job-history-section">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{dt('mediaCleanupJobs.jobHistory')}</h3>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-info">
                    <div className="flex items-center gap-2">
                      {getJobTypeBadge(job.jobType)}
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(job.executedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedJobId(
                      expandedJobId === job.id ? null : job.id
                    )}
                  >
                    {expandedJobId === job.id ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="job-metrics">
                  <div className="job-metric">
                    <span className="job-metric-label">{dt('mediaCleanupJobs.filesScanned')}</span>
                    <span className="job-metric-value">
                      {job.metrics?.filesScanned || 0}
                    </span>
                  </div>
                  <div className="job-metric">
                    <span className="job-metric-label">{dt('mediaCleanupJobs.orphanedFound')}</span>
                    <span className="job-metric-value">
                      {job.metrics?.orphanedFilesFound || 0}
                    </span>
                  </div>
                  <div className="job-metric">
                    <span className="job-metric-label">{dt('mediaCleanupJobs.filesDeleted')}</span>
                    <span className="job-metric-value">
                      {job.metrics?.filesDeleted || 0}
                      {job.metrics?.deletionErrors ? (
                        <span className="text-destructive text-sm ml-1">
                          ({job.metrics.deletionErrors} {dt('mediaCleanupJobs.deletionErrors')})
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>

                {/* Expanded Job Details */}
                {expandedJobId === job.id && (
                  <div className="job-details-panel">
                    <div className="job-details-grid">
                      <div className="job-detail-item">
                        <span className="job-detail-label">{dt('mediaCleanupJobs.fieldsJobTypeLabel')}</span>
                        <span className="job-detail-value">{job.jobType}</span>
                      </div>
                      <div className="job-detail-item">
                        <span className="job-detail-label">{dt('mediaCleanupJobs.fieldsStatusLabel')}</span>
                        <span className="job-detail-value">{job.status}</span>
                      </div>
                      <div className="job-detail-item">
                        <span className="job-detail-label">{dt('mediaCleanupJobs.executedAt')}</span>
                        <span className="job-detail-value">
                          {new Date(job.executedAt).toLocaleString()}
                        </span>
                      </div>
                      {job.completedAt && (
                        <div className="job-detail-item">
                          <span className="job-detail-label">{dt('mediaCleanupJobs.completedAt')}</span>
                          <span className="job-detail-value">
                            {new Date(job.completedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {job.executionLog && (
                      <div>
                        <Label className="text-sm">{dt('mediaCleanupJobs.executionLog')}</Label>
                        <div className="log-display">
                          {job.executionLog}
                        </div>
                      </div>
                    )}

                    {job.errorLog && (
                      <div>
                        <Label className="text-sm">{dt('mediaCleanupJobs.errorLog')}</Label>
                        <div className="log-display error-log">
                          {job.errorLog}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}