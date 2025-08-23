import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCheck, RefreshCw, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTranslation } from "@/utilities/admin-translations";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedItemsCount: number;
  showBulkActions: boolean;
  onToggleBulkActions: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  loading: boolean;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  selectedItemsCount,
  showBulkActions,
  onToggleBulkActions,
  onRefresh,
  onOpenSettings,
  loading,
}: DashboardHeaderProps) {
  const { dt } = useAdminTranslation();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          {dt("dashboard:title")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {dt("dashboard:subtitle")}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={dt("search:placeholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[250px] pl-9"
          />
        </div>
        
        <Button
          onClick={onToggleBulkActions}
          variant="outline"
          size="sm"
          className={cn(selectedItemsCount > 0 && "bg-blue-50")}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          {selectedItemsCount > 0 
            ? `${selectedItemsCount} ${dt("selected")}` 
            : dt("bulkActions")}
        </Button>

        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>

        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="sm"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}