import { Badge } from "@/components/ui/badge";
import { Clock, Eye, CheckCircle2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTranslation } from "@/utilities/admin-translations";

interface StatusBadgeProps {
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const { dt } = useAdminTranslation();
  
  const statusConfig = {
    pending: {
      icon: <Clock className="mr-1 h-3 w-3" />,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    reviewing: {
      icon: <Eye className="mr-1 h-3 w-3" />,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    resolved: {
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    dismissed: {
      icon: <Ban className="mr-1 h-3 w-3" />,
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge className={cn("font-medium", config.className, className)}>
      {showIcon && config.icon}
      {dt(`status:${status}`)}
    </Badge>
  );
}