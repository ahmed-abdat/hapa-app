import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Flag, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTranslation } from "@/utilities/admin-translations";

interface PriorityBadgeProps {
  priority: "urgent" | "high" | "medium" | "low";
  showIcon?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showIcon = true, className }: PriorityBadgeProps) {
  const { dt } = useAdminTranslation();
  
  const priorityConfig = {
    urgent: {
      icon: <AlertCircle className="mr-1 h-3 w-3" />,
      className: "bg-red-50 text-red-700 border-red-200",
    },
    high: {
      icon: <AlertTriangle className="mr-1 h-3 w-3" />,
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    medium: {
      icon: <Flag className="mr-1 h-3 w-3" />,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    low: {
      icon: <Info className="mr-1 h-3 w-3" />,
      className: "bg-slate-50 text-slate-700 border-slate-200",
    },
  };

  const config = priorityConfig[priority] || priorityConfig.low;

  return (
    <Badge className={cn("font-medium", config.className, className)}>
      {showIcon && config.icon}
      {dt(`priority:${priority}`)}
    </Badge>
  );
}