'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  PlayIcon, 
  PauseIcon, 
  TrashIcon, 
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  HardDriveIcon,
  ScanIcon,
  DownloadIcon,
} from 'lucide-react'

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

export default function MediaCleanupDashboard() {
  const [jobs, setJobs] = useState<CleanupJob[]>([])
  const [selectedJob, setSelectedJob] = useState<CleanupJob | null>(null)
  const [scanResults, setScanResults] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [scanSettings, setScanSettings] = useState<ScanSettings>({
    directories: ['forms/'],
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
      await loadJobs() // Reload jobs to show the new scan job
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

      // Clear results and reload jobs
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
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: ClockIcon },
      running: { variant: 'default', icon: RefreshCwIcon },
      completed: { variant: 'success', icon: CheckCircleIcon },
      failed: { variant: 'destructive', icon: AlertTriangleIcon },
      partial: { variant: 'warning', icon: AlertTriangleIcon },
    }
    
    const config = variants[status] || variants.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  // Get job type badge
  const getJobTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      verification: { variant: 'outline', label: 'Scan' },
      cleanup: { variant: 'default', label: 'Cleanup' },
      audit: { variant: 'secondary', label: 'Audit' },
    }
    
    const config = variants[type] || variants.verification
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Cleanup Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage orphaned media files and cleanup operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
          <Button
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <ScanIcon className="mr-2 h-4 w-4" />
                Scan for Orphaned Files
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scan Results */}
      {scanResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scan Results</CardTitle>
                <CardDescription>
                  Found {scanResults.orphanedFiles?.length || 0} orphaned files
                  ({formatSize(scanResults.metrics?.storageSize || 0)} total)
                </CardDescription>
              </div>
              <div className="flex gap-2">
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
                >
                  {isCleaning ? (
                    <>
                      <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="mr-2 h-4 w-4" />
                      {scanSettings.dryRun ? 'Dry Run' : 'Delete Selected'}
                      {selectedFiles.size > 0 && ` (${selectedFiles.size})`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedFiles.size === scanResults.orphanedFiles?.length}
                        onCheckedChange={toggleAllFiles}
                      />
                    </TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanResults.orphanedFiles?.map((file: any) => (
                    <TableRow key={file.path}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFiles.has(file.path)}
                          onCheckedChange={() => toggleFileSelection(file.path)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {file.filename}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.path}
                      </TableCell>
                      <TableCell>{formatSize(file.size || 0)}</TableCell>
                      <TableCell>
                        {file.lastModified
                          ? new Date(file.lastModified).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cleanup Jobs</CardTitle>
          <CardDescription>
            History of cleanup operations and scans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Executed</TableHead>
                <TableHead>Files Scanned</TableHead>
                <TableHead>Orphaned Found</TableHead>
                <TableHead>Files Deleted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{getJobTypeBadge(job.jobType)}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    {new Date(job.executedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{job.metrics?.filesScanned || 0}</TableCell>
                  <TableCell>{job.metrics?.orphanedFilesFound || 0}</TableCell>
                  <TableCell>
                    {job.metrics?.filesDeleted || 0}
                    {job.metrics?.deletionErrors ? (
                      <span className="text-destructive ml-1">
                        ({job.metrics.deletionErrors} failed)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedJob(job)
                        setShowJobDetails(true)
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Settings</DialogTitle>
            <DialogDescription>
              Configure parameters for scanning orphaned files
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="directories">Directories to Scan</Label>
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
              <p className="text-sm text-muted-foreground mt-1">
                Comma-separated list of R2 directories
              </p>
            </div>
            <div>
              <Label htmlFor="maxFiles">Maximum Files to Process</Label>
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
            <div>
              <Label htmlFor="retentionDays">Retention Period (days)</Label>
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
              <p className="text-sm text-muted-foreground mt-1">
                Only scan files older than this many days
              </p>
            </div>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Detailed information about the cleanup job
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Job Type</Label>
                  <div className="mt-1">{getJobTypeBadge(selectedJob.jobType)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                </div>
                <div>
                  <Label>Executed At</Label>
                  <div className="mt-1">
                    {new Date(selectedJob.executedAt).toLocaleString()}
                  </div>
                </div>
                {selectedJob.completedAt && (
                  <div>
                    <Label>Completed At</Label>
                    <div className="mt-1">
                      {new Date(selectedJob.completedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {selectedJob.metrics && (
                <div>
                  <Label>Metrics</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {selectedJob.metrics.filesScanned}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Files Scanned
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {selectedJob.metrics.orphanedFilesFound}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Orphaned Found
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {selectedJob.metrics.filesDeleted}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Files Deleted
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {selectedJob.executionLog && (
                <div>
                  <Label>Execution Log</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-sm">
                    {selectedJob.executionLog}
                  </pre>
                </div>
              )}

              {selectedJob.errorLog && (
                <div>
                  <Label>Error Log</Label>
                  <pre className="mt-1 p-2 bg-destructive/10 rounded text-sm text-destructive">
                    {selectedJob.errorLog}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}