'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { HardDriveIcon } from 'lucide-react'

// Dynamic import for the main dashboard component with loading fallback
const CleanupDashboard = dynamic(
  () => import('./CleanupDashboard').then(mod => ({ default: mod.CleanupDashboard })),
  {
    loading: () => (
      <div className="cleanup-dashboard-container">
        <div className="cleanup-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <HardDriveIcon size={20} className="text-primary" />
            </div>
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="ml-auto">
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="cleanup-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="cleanup-stat-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    ssr: false, // Disable SSR for admin-only component
  }
)

/**
 * MediaCleanupDashboard - Admin Dashboard for Media Cleanup Operations
 * 
 * Provides interface for scanning and cleaning orphaned media files.
 * Matches the styling and UX patterns of MediaSubmissionsDashboard.
 */
export default function MediaCleanupDashboard() {
  return <CleanupDashboard />
}