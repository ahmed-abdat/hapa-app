"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminTranslation } from "@/utilities/admin-translations";
import { logger } from "@/utilities/logger";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Clock,
  Users,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Eye,
  FileText,
  ExternalLink,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  MoreVertical,
  ArrowUpRight,
  Loader2,
  Search,
  Settings,
  ChevronDown,
  Save,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  FileVideo,
  Radio,
  Wifi,
  Newspaper,
  Hash,
  Info,
  Archive,
  SlidersHorizontal,
  Bell,
  Upload,
  CheckCheck,
  PieChart,
  LineChart,
  BarChart,
  Target,
  Zap,
  Star,
} from "lucide-react";

// Shadcn UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

// Enhanced Data Visualization Components
interface ChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  className?: string;
}

const MiniBarChart: React.FC<ChartProps> = ({ data, className }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={cn("flex items-end gap-1 h-16", className)}>
      {data.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="bg-primary/20 hover:bg-primary/30 transition-colors rounded-sm cursor-pointer min-w-[8px]"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || "hsl(var(--primary))",
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.name}: {item.value}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

const DonutChart: React.FC<ChartProps> = ({ data, className }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <div className={cn("relative w-24 h-24", className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${percentage * 2.51} 251.2`;
          const strokeDashoffset = -currentAngle * 2.51;
          currentAngle += percentage;
          
          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{total}</span>
      </div>
    </div>
  );
};

// Types
interface SubmissionStats {
  totalSubmissions: number;
  reportSubmissions: number;
  complaintSubmissions: number;
  pendingCount: number;
  reviewingCount: number;
  resolvedCount: number;
  dismissedCount: number;
  todaySubmissions: number;
  weekSubmissions: number;
  monthSubmissions: number;
  urgentCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  frenchSubmissions: number;
  arabicSubmissions: number;
  mediaTypeStats: {
    television: number;
    radio: number;
    online: number;
    print: number;
    other: number;
  };
  reportStats: {
    total: number;
    pending: number;
    reviewing: number;
    resolved: number;
    dismissed: number;
    french: number;
    arabic: number;
    thisWeek: number;
    thisMonth: number;
  };
  complaintStats: {
    total: number;
    pending: number;
    reviewing: number;
    resolved: number;
    dismissed: number;
    french: number;
    arabic: number;
    thisWeek: number;
    thisMonth: number;
  };
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    resolutionTrend: number;
  };
}

interface Submission {
  id: string;
  title: string;
  formType: "report" | "complaint";
  submissionStatus: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  submittedAt: string;
  locale: "fr" | "ar";
  contentInfo?: {
    programName?: string;
    mediaType?: string;
    specificChannel?: string;
    broadcastDate?: string;
    broadcastTime?: string;
    websiteUrl?: string;
  };
  complainantInfo?: {
    fullName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    address?: string;
  };
  description?: string;
  assignedTo?: string;
  tags?: string[];
  lastUpdated?: string;
  responseTime?: number;
  internalNotes?: string;
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
}

// Dashboard Settings Type
interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  compactView: boolean;
  showNotifications: boolean;
  defaultView: "grid" | "list";
  itemsPerPage: number;
  showArchived: boolean;
  enableAnimations: boolean;
  darkMode: boolean;
}

export function EnhancedDashboard() {
  const { dt, i18n } = useAdminTranslation();
  const params = useParams();
  const currentLocale = (params?.locale as "fr" | "ar") || "fr";
  const isRTL = currentLocale === "ar";

  // State
  const [stats, setStats] = useState<SubmissionStats>({
    totalSubmissions: 0,
    reportSubmissions: 0,
    complaintSubmissions: 0,
    pendingCount: 0,
    reviewingCount: 0,
    resolvedCount: 0,
    dismissedCount: 0,
    todaySubmissions: 0,
    weekSubmissions: 0,
    monthSubmissions: 0,
    urgentCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    frenchSubmissions: 0,
    arabicSubmissions: 0,
    mediaTypeStats: {
      television: 0,
      radio: 0,
      online: 0,
      print: 0,
      other: 0,
    },
    reportStats: {
      total: 0,
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0,
      french: 0,
      arabic: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
    complaintStats: {
      total: 0,
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0,
      french: 0,
      arabic: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
    trends: {
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      resolutionTrend: 0,
    },
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Dashboard settings
  const [settings, setSettings] = useState<DashboardSettings>({
    autoRefresh: false,
    refreshInterval: 30000,
    compactView: false,
    showNotifications: true,
    defaultView: "grid",
    itemsPerPage: 20,
    showArchived: false,
    enableAnimations: true,
    darkMode: false,
  });

  // Real-time updates simulation
  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(fetchData, settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/media-submissions-stats", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setSubmissions(data.submissions);
        }
      }
    } catch (error) {
      logger.error("Error fetching dashboard data", error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate metrics
  const resolutionRate = useMemo(() => {
    if (stats.totalSubmissions === 0) return 0;
    return Math.round((stats.resolvedCount / stats.totalSubmissions) * 100);
  }, [stats]);

  const avgResponseTime = useMemo(() => {
    const resolvedSubmissions = submissions.filter(s => s.submissionStatus === 'resolved');
    if (resolvedSubmissions.length === 0) return 0;
    
    const totalTime = resolvedSubmissions.reduce((sum, submission) => {
      return sum + (submission.responseTime || 0);
    }, 0);
    
    return Math.round(totalTime / resolvedSubmissions.length);
  }, [submissions]);

  // Prepare chart data
  const statusChartData = useMemo(() => [
    { name: dt("status:pending"), value: stats.pendingCount, color: "#3b82f6" },
    { name: dt("status:reviewing"), value: stats.reviewingCount, color: "#f59e0b" },
    { name: dt("status:resolved"), value: stats.resolvedCount, color: "#10b981" },
    { name: dt("status:dismissed"), value: stats.dismissedCount, color: "#ef4444" },
  ], [stats, dt]);

  const priorityChartData = useMemo(() => [
    { name: dt("priority:urgent"), value: stats.urgentCount, color: "#dc2626" },
    { name: dt("priority:high"), value: stats.highCount, color: "#ea580c" },
    { name: dt("priority:medium"), value: stats.mediumCount, color: "#ca8a04" },
    { name: dt("priority:low"), value: stats.lowCount, color: "#6b7280" },
  ], [stats, dt]);

  const mediaTypeChartData = useMemo(() => [
    { name: "TV", value: stats.mediaTypeStats.television },
    { name: "Radio", value: stats.mediaTypeStats.radio },
    { name: "Online", value: stats.mediaTypeStats.online },
    { name: "Print", value: stats.mediaTypeStats.print },
    { name: "Other", value: stats.mediaTypeStats.other },
  ], [stats]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesType =
        typeFilter === "all" || submission.formType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || submission.submissionStatus === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || submission.priority === priorityFilter;
      const matchesSearch =
        searchQuery === "" ||
        submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.complainantInfo?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        submission.contentInfo?.programName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesType && matchesStatus && matchesPriority && matchesSearch;
    });
  }, [submissions, typeFilter, statusFilter, priorityFilter, searchQuery]);

  // Handle submission update
  const handleUpdateSubmission = async (
    submissionId: string,
    updates: Partial<Submission>
  ) => {
    try {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, ...updates } : s))
      );
    } catch (error) {
      logger.error("Error updating submission", error as Error);
    }
  };

  // Media type icon
  const getMediaIcon = (mediaType?: string) => {
    switch (mediaType?.toLowerCase()) {
      case "television":
      case "tv":
      case "télévision":
        return <FileVideo className="h-4 w-4" />;
      case "radio":
        return <Radio className="h-4 w-4" />;
      case "online":
      case "internet":
      case "en ligne":
        return <Wifi className="h-4 w-4" />;
      case "print":
      case "presse":
      case "journal":
        return <Newspaper className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  // Status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reviewing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "dismissed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Progressive loading skeleton
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px]" />
        <Skeleton className="h-4 w-[120px] mt-2" />
      </CardContent>
    </Card>
  );

  // Enhanced metric card component
  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    color = "blue",
    description,
    chart 
  }: {
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ElementType;
    color?: string;
    description?: string;
    chart?: React.ReactNode;
  }) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        color === "blue" && "bg-blue-500",
        color === "green" && "bg-green-500", 
        color === "orange" && "bg-orange-500",
        color === "red" && "bg-red-500",
        color === "purple" && "bg-purple-500"
      )} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          color === "blue" && "text-blue-500",
          color === "green" && "text-green-500",
          color === "orange" && "text-orange-500", 
          color === "red" && "text-red-500",
          color === "purple" && "text-purple-500"
        )} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center text-xs font-medium",
              trend >= 0 ? "text-green-600" : "text-red-600"
            )}>
              <ArrowUpRight className={cn(
                "h-3 w-3 mr-1",
                trend < 0 && "rotate-180"
              )} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {chart && (
          <div className="mt-3">
            {chart}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Loading state with progressive loading
  if (loading && submissions.length === 0) {
    return (
      <div className={cn("w-full p-6 space-y-6", isRTL && "rtl")}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div
      className={cn("flex-1 space-y-6 p-4 md:p-6 lg:p-8", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Enhanced Header with real-time indicators */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {dt("dashboard:title")}
            </h1>
            {settings.autoRefresh && (
              <div className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            {dt("dashboard:subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={dt("filters:type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dt("filters:all")}</SelectItem>
              <SelectItem value="report">{dt("forms:report")}</SelectItem>
              <SelectItem value="complaint">{dt("forms:complaint")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowSettingsSheet(true)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                isRTL ? "ml-2" : "mr-2",
                loading && "animate-spin"
              )}
            />
            {dt("actions:refresh")}
          </Button>
        </div>
      </div>

      {/* Enhanced KPI Cards with visualizations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title={dt("stats:total")}
          value={stats.totalSubmissions}
          trend={stats.trends.weeklyGrowth}
          icon={FileText}
          color="blue"
          description={`+${stats.weekSubmissions} ${dt("stats:thisWeek")}`}
          chart={<MiniBarChart data={mediaTypeChartData} />}
        />

        <MetricCard
          title={dt("stats:pending")}
          value={stats.pendingCount}
          icon={Clock}
          color="orange"
          description={`${Math.round((stats.pendingCount / stats.totalSubmissions) * 100)}% ${dt("common:ofTotal")}`}
          chart={
            <Progress
              value={(stats.pendingCount / stats.totalSubmissions) * 100}
              className="h-2"
            />
          }
        />

        <MetricCard
          title={dt("stats:resolutionRate")}
          value={`${resolutionRate}%`}
          trend={stats.trends.resolutionTrend}
          icon={CheckCircle2}
          color="green"
          description={`${stats.resolvedCount}/${stats.totalSubmissions} ${dt("stats:resolved")}`}
        />

        <MetricCard
          title={dt("stats:urgent")}
          value={stats.urgentCount}
          icon={AlertTriangle}
          color="red"
          description={dt("common:requiresImmediateAction")}
          chart={<DonutChart data={priorityChartData} />}
        />

        <MetricCard
          title={dt("common:averageResponseTime")}
          value={`${avgResponseTime}h`}
          icon={Activity}
          color="purple"
          description={dt("common:lastThirtyDays")}
          chart={
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">Within SLA</span>
            </div>
          }
        />
      </div>

      {/* Enhanced Analytics Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Distribution with Interactive Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {dt("common:statusDistribution")}
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <DonutChart data={statusChartData} className="w-32 h-32" />
            </div>
            <div className="space-y-2">
              {statusChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Levels with Trends */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {dt("common:priorityLevels")}
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityChartData.map((priority, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getPriorityColor(priority.name.toLowerCase())}>
                    {priority.name}
                  </Badge>
                  <span className="text-sm font-medium">{priority.value}</span>
                </div>
                <Progress
                  value={(priority.value / stats.totalSubmissions) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Media Type Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {dt("common:mediaTypes")}
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.mediaTypeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMediaIcon(type)}
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-12">
                      <Progress
                        value={(count / stats.totalSubmissions) * 100}
                        className="h-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Notifications */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {dt("common:quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start">
              <CheckCheck className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {dt("actions:bulkActions")}
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {dt("common:export")}
            </Button>
            <Button variant="outline" className="justify-start">
              <Upload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {dt("common:import")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {dt("common:notifications")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.urgentCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {stats.urgentCount} {dt("common:urgentSubmissions")}
                  </AlertDescription>
                </Alert>
              )}
              <div className="text-sm text-muted-foreground">
                {dt("common:allCaughtUp")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              {dt("common:performance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{dt("common:onTime")}</span>
                <span className="text-sm font-medium">94%</span>
              </div>
              <Progress value={94} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{dt("common:target")}: 90%</span>
                <span className="text-green-600">+4% {dt("common:aboveTarget")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>{dt("common:recentSubmissions")}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={dt("filters:search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={dt("filters:status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dt("filters:all")}</SelectItem>
                  <SelectItem value="pending">{dt("status:pending")}</SelectItem>
                  <SelectItem value="reviewing">{dt("status:reviewing")}</SelectItem>
                  <SelectItem value="resolved">{dt("status:resolved")}</SelectItem>
                  <SelectItem value="dismissed">{dt("status:dismissed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubmissions.slice(0, 5).map((submission, index) => (
              <div
                key={submission.id}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                  "hover:bg-primary/5 hover:border-primary/20 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                  settings.enableAnimations && "animate-in slide-in-from-bottom-2",
                  settings.enableAnimations && `animation-delay-[${index * 100}ms]`
                )}
                style={settings.enableAnimations ? { animationDelay: `${index * 100}ms` } : {}}
                onClick={() =>
                  window.open(
                    `/admin/collections/media-content-submissions/${submission.id}`,
                    "_blank"
                  )
                }
              >
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {submission.formType === "report" ? "R" : "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {submission.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {submission.complainantInfo?.fullName ||
                          dt("common:anonymous")}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(submission.submittedAt).toLocaleDateString(
                          currentLocale
                        )}
                      </span>
                      {submission.contentInfo?.mediaType && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            {getMediaIcon(submission.contentInfo.mediaType)}
                            {submission.contentInfo.mediaType}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(submission.submissionStatus)}>
                    {submission.submissionStatus === "pending" && dt("status:pending")}
                    {submission.submissionStatus === "reviewing" && dt("status:reviewing")}
                    {submission.submissionStatus === "resolved" && dt("status:resolved")}
                    {submission.submissionStatus === "dismissed" && dt("status:dismissed")}
                  </Badge>
                  <Badge className={getPriorityColor(submission.priority)}>
                    {submission.priority === "urgent" && dt("priority:urgent")}
                    {submission.priority === "high" && dt("priority:high")}
                    {submission.priority === "medium" && dt("priority:medium")}
                    {submission.priority === "low" && dt("priority:low")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {filteredSubmissions.length > 5 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("/admin/collections/media-content-submissions", "_blank")}
              >
                {dt("common:viewAll")} ({filteredSubmissions.length - 5} {dt("common:more")})
                <ExternalLink className={cn("h-4 w-4", isRTL ? "mr-2" : "ml-2")} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Sheet */}
      <Sheet open={showSettingsSheet} onOpenChange={setShowSettingsSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{dt("common:dashboardSettings")}</SheetTitle>
            <SheetDescription>
              {dt("common:customizeYourDashboard")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-refresh">{dt("settings:autoRefresh")}</Label>
              <Switch
                id="auto-refresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, autoRefresh: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="animations">{dt("settings:enableAnimations")}</Label>
              <Switch
                id="animations"
                checked={settings.enableAnimations}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, enableAnimations: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">{dt("settings:showNotifications")}</Label>
              <Switch
                id="notifications"
                checked={settings.showNotifications}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, showNotifications: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{dt("settings:refreshInterval")}</Label>
              <Select
                value={settings.refreshInterval.toString()}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    refreshInterval: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15000">15 {dt("common:seconds")}</SelectItem>
                  <SelectItem value="30000">30 {dt("common:seconds")}</SelectItem>
                  <SelectItem value="60000">1 {dt("common:minute")}</SelectItem>
                  <SelectItem value="300000">5 {dt("common:minutes")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button
              onClick={() => setShowSettingsSheet(false)}
              className="w-full"
            >
              {dt("actions:save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default EnhancedDashboard;