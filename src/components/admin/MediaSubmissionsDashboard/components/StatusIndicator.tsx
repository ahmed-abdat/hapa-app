"use client";

import { useAdminTranslation } from '@/utilities/admin-translations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  isRefreshing: boolean;
  lastUpdate: Date | null;
  onManualRefresh: () => void;
}

export function StatusIndicator({
  isRefreshing,
  lastUpdate,
  onManualRefresh,
}: StatusIndicatorProps) {
  const { dt } = useAdminTranslation();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return dt('admin.never');
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return dt('admin.justNow');
    if (minutes < 60) return dt('admin.minutesAgo', { minutes });
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return dt('admin.hoursAgo', { hours });
    
    // Use locale-specific date formatting
    // Determine locale from URL or default to Arabic (matching payload.config.ts)
    const isFrench = typeof window !== 'undefined' && window.location.pathname.includes('/fr');
    const localeCode = isFrench ? 'fr-FR' : 'ar-MA';
    return date.toLocaleDateString(localeCode, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Badge */}
      <Badge
        variant="outline"
        className="flex items-center gap-1.5"
      >
        <Clock className="h-3 w-3" />
        <span className="text-xs">
          {dt('admin.lastUpdated')}: {formatLastUpdate(lastUpdate)}
        </span>
        {isRefreshing && (
          <RefreshCw className="h-3 w-3 animate-spin" />
        )}
      </Badge>

      {/* Manual Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onManualRefresh}
        disabled={isRefreshing}
        className="h-8"
      >
        <RefreshCw className={cn(
          "h-4 w-4 mr-2",
          isRefreshing && "animate-spin"
        )} />
        {dt('actions.refresh')}
      </Button>
    </div>
  );
}