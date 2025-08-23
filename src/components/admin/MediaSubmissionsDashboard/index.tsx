"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { AdminErrorBoundary } from "@/components/admin/ErrorBoundary";

// Dynamic import for heavy dashboard component with loading fallback
const ModernDashboard = dynamic(() => import("./ModernDashboard").then(mod => ({ default: mod.ModernDashboard })), {
  loading: () => (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <BarChart3 size={20} className="text-primary" />
            </div>
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="ml-auto">
            <Skeleton className="h-9 w-32" />
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* Key metrics skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border border-border/50">
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

          {/* Charts skeleton */}
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64" />
              </CardContent>
            </Card>
          </div>

          {/* Table skeleton */}
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
        </main>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for admin-only component to improve build performance
});

/**
 * MediaSubmissionsDashboard - Main Admin Dashboard Entry Point
 *
 * Modern dashboard implementation with charts and analytics visualization.
 * Features a clean, data-driven interface using standard Tailwind CSS classes.
 *
 * Features:
 * - Real-time metrics and KPIs  
 * - Interactive charts (Area, Bar, Pie charts)
 * - Advanced search and filtering
 * - Responsive modern design
 * - Full shadcn/ui component integration with proper Tailwind CSS
 * - RTL support for Arabic locale
 */
export function MediaSubmissionsDashboard() {
  return (
    <div className="dashboard-tailwind min-h-screen bg-background text-foreground antialiased">
      <ModernDashboard />
    </div>
  );
}

// Default export for backwards compatibility
export { MediaSubmissionsDashboard as default };
