import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
    color?: string;
  };
  badge?: {
    text: string;
    color?: string;
    icon?: LucideIcon;
    iconColor?: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  description?: string;
  progressBar?: {
    value: number;
    label?: string;
    color?: string;
  };
  dateRange?: string;
  urgent?: boolean;
  className?: string;
}

export function StatCard({
  title,
  subtitle,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  valueColor,
  trend,
  badge,
  description,
  progressBar,
  dateRange,
  urgent = false,
  className,
}: StatCardProps) {
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;
  const trendColor = trend?.isPositive ? "text-green-600" : "text-red-600";
  
  return (
    <div className="dashboard-tailwind">
      <Card className={cn(
        "h-full transition-all duration-200 shadow-md hover:shadow-lg",
        urgent && "border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/30",
        className
      )}>
        <CardContent className="flex flex-col h-full p-6">
          {/* Icon & Badge */}
          <div className="flex items-center justify-between mb-8">
            <Icon className={cn("size-6", iconColor)} />
            
            {badge && (
              <Badge className={cn(
                "px-2 py-1 rounded-full flex items-center gap-1",
                badge.color || "bg-secondary text-secondary-foreground"
              )}>
                {badge.icon && (
                  <badge.icon className={cn("w-3 h-3", badge.iconColor)} />
                )}
                {badge.text}
              </Badge>
            )}
            
            {trend && !badge && (
              <Badge className={cn(
                "px-2 py-1 rounded-full flex items-center gap-1",
                trend.isPositive 
                  ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
              )}>
                <TrendIcon className="w-3 h-3" />
                {trend.isPositive ? "+" : ""}{trend.value}%
              </Badge>
            )}
            
            {urgent && !badge && !trend && (
              <Badge className="px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                URGENT
              </Badge>
            )}
          </div>

          {/* Value & Title */}
          <div className="flex-1 flex flex-col justify-between grow">
            <div>
              <div className="text-base font-medium text-muted-foreground mb-1">
                {title}
              </div>
              {subtitle && (
                <div className="text-sm text-muted-foreground/75 mb-2">
                  {subtitle}
                </div>
              )}
              <div className={cn(
                "text-3xl font-bold text-foreground mb-6",
                valueColor,
                urgent && "text-red-700 dark:text-red-400"
              )}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
              
              {/* Description */}
              {description && (
                <div className="text-sm text-muted-foreground mb-4">
                  {description}
                </div>
              )}
              
              {/* Progress Bar */}
              {progressBar && (
                <div className="space-y-2 mb-4">
                  <Progress 
                    value={progressBar.value} 
                    className={cn(
                      "h-2",
                      progressBar.color && `[&>div]:${progressBar.color}`
                    )}
                  />
                  <div className="text-xs text-muted-foreground">
                    {progressBar.label || `${progressBar.value}% completion`}
                  </div>
                </div>
              )}
            </div>
            
            {/* Date Range */}
            {dateRange && (
              <div className="pt-3 border-t border-muted text-xs text-muted-foreground font-medium">
                {dateRange}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}