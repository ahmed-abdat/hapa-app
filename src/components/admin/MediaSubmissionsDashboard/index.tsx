"use client";

import { ModernDashboard } from "./ModernDashboard";

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
    <div className="min-h-screen bg-background text-foreground antialiased">
      <ModernDashboard />
    </div>
  );
}

// Default export for backwards compatibility
export { MediaSubmissionsDashboard as default };
