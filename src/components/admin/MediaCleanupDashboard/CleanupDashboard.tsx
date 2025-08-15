'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
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

      toast.success(`Found ${data.orphanedFiles?.length || 0} orphaned files`)
      await loadJobs()
    } catch (error) {
      toast.error('Failed to scan for orphaned files')
      console.error('Scan error:', error)
    } finally {
      setIsScanning(false)
    }
  }

  // Execute cleanup
  const handleCleanup = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for cleanup')
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
        toast.info(`Dry run completed. Would delete ${selectedFiles.size} files`)
      } else {
        toast.success(`Deleted ${data.results?.deleted || 0} files`)
      }

      setScanResults(null)
      setSelectedFiles(new Set())
      await loadJobs()
    } catch (error) {
      toast.error('Failed to execute cleanup')
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
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
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
    
    const Icon = icons[status as keyof typeof icons] || ClockIcon
    
    return (
      <span className={cn('status-badge', status)}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    )
  }

  // Get job type badge
  const getJobTypeBadge = (type: string) => {
    return (
      <span className={cn('job-type-badge', type)}>
        {type === 'verification' ? 'Scan' : type === 'cleanup' ? 'Cleanup' : 'Audit'}
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
            <h1 className="text-xl font-bold">Media Cleanup Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage orphaned media files and cleanup operations
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
            Settings
          </Button>
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="cleanup-button primary"
          >
            {isScanning ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <ScanIcon className="h-4 w-4" />
                Scan for Orphaned Files
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <div className="cleanup-settings-panel">
          <div className="settings-header">
            <h3 className="text-lg font-semibold">Scan Settings</h3>
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
                Directories to Scan
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
                placeholder="forms/, media/"
              />
              <p className="setting-description">
                Comma-separated list of R2 directories
              </p>
            </div>
            <div className="setting-field">
              <Label htmlFor="maxFiles" className="setting-label">
                Maximum Files to Process
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
                Retention Period (days)
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
                Only scan files older than this many days
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
                  Dry Run Mode (preview only, no actual deletion)
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
            Total Scanned
          </div>
          <div className="stat-value">
            {jobs.reduce((acc, job) => acc + (job.metrics?.filesScanned || 0), 0)}
          </div>
          <div className="stat-description">Files checked in all scans</div>
        </div>
        
        <div className="cleanup-stat-card orange">
          <div className="stat-label">
            <AlertTriangleIcon className="h-4 w-4" />
            Orphaned Found
          </div>
          <div className="stat-value">
            {jobs.reduce((acc, job) => acc + (job.metrics?.orphanedFilesFound || 0), 0)}
          </div>
          <div className="stat-description">Files without references</div>
        </div>
        
        <div className="cleanup-stat-card blue">
          <div className="stat-label">
            <TrashIcon className="h-4 w-4" />
            Files Deleted
          </div>
          <div className="stat-value">
            {jobs.reduce((acc, job) => acc + (job.metrics?.filesDeleted || 0), 0)}
          </div>
          <div className="stat-description">Successfully removed</div>
        </div>
        
        <div className="cleanup-stat-card red">
          <div className="stat-label">
            <HardDriveIcon className="h-4 w-4" />
            Storage Reclaimed
          </div>
          <div className="stat-value">
            {formatSize(jobs.reduce((acc, job) => acc + (job.metrics?.storageReclaimed || 0), 0))}
          </div>
          <div className="stat-description">Space freed up</div>
        </div>
      </div>

      {/* Scan Results */}
      {scanResults && (
        <div className="scan-results-section">
          <div className="scan-results-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Scan Results</h3>
                <p className="text-sm text-muted-foreground">
                  Found {scanResults.orphanedFiles?.length || 0} orphaned files
                  ({formatSize(scanResults.metrics?.storageSize || 0)} total)
                </p>
              </div>
              <div className="action-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllFiles}
                >
                  {selectedFiles.size === scanResults.orphanedFiles?.length
                    ? 'Deselect All'
                    : 'Select All'}
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      {scanSettings.dryRun ? 'Dry Run' : 'Delete Selected'}
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
                  <th>Filename</th>
                  <th>Path</th>
                  <th>Size</th>
                  <th>Last Modified</th>
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
          <h3 className="text-lg font-semibold mb-4">Recent Cleanup Jobs</h3>
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
                    <span className="job-metric-label">Files Scanned</span>
                    <span className="job-metric-value">
                      {job.metrics?.filesScanned || 0}
                    </span>
                  </div>
                  <div className="job-metric">
                    <span className="job-metric-label">Orphaned Found</span>
                    <span className="job-metric-value">
                      {job.metrics?.orphanedFilesFound || 0}
                    </span>
                  </div>
                  <div className="job-metric">
                    <span className="job-metric-label">Files Deleted</span>
                    <span className="job-metric-value">
                      {job.metrics?.filesDeleted || 0}
                      {job.metrics?.deletionErrors ? (
                        <span className="text-destructive text-sm ml-1">
                          ({job.metrics.deletionErrors} failed)
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
                        <span className="job-detail-label">Job Type</span>
                        <span className="job-detail-value">{job.jobType}</span>
                      </div>
                      <div className="job-detail-item">
                        <span className="job-detail-label">Status</span>
                        <span className="job-detail-value">{job.status}</span>
                      </div>
                      <div className="job-detail-item">
                        <span className="job-detail-label">Executed At</span>
                        <span className="job-detail-value">
                          {new Date(job.executedAt).toLocaleString()}
                        </span>
                      </div>
                      {job.completedAt && (
                        <div className="job-detail-item">
                          <span className="job-detail-label">Completed At</span>
                          <span className="job-detail-value">
                            {new Date(job.completedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {job.executionLog && (
                      <div>
                        <Label className="text-sm">Execution Log</Label>
                        <div className="log-display">
                          {job.executionLog}
                        </div>
                      </div>
                    )}

                    {job.errorLog && (
                      <div>
                        <Label className="text-sm">Error Log</Label>
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