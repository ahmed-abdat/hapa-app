"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminTranslation } from "@/utilities/admin-translations";
import { getMediaTypeLabel, getMediaChannelLabel } from "@/lib/media-mappings";
import { useParams } from "next/navigation";
import { logger } from "@/utilities/logger";
import { useTheme } from "@/providers/Theme";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LabelList,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Activity,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Search,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import "./dashboard.css";
import { type MediaContentSubmission } from "@/payload-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIndicator } from "./components/StatusIndicator";
import { SubmissionsDataTable } from "./components/SubmissionsDataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatCard } from "./components/StatCard";

// Chart color configuration with CSS variable support
const chartColors = {
  primary: "hsl(142, 80%, 25%)", // HAPA Green
  secondary: "hsl(60, 95%, 50%)", // HAPA Yellow
  accent: "hsl(142, 75%, 20%)", // HAPA Dark Green
  pending: "#f59e0b",
  resolved: "#10b981",
  rejected: "#ef4444",
  inReview: "#3b82f6",
};

export function ModernDashboard() {
  const { locale } = useParams();
  const { theme } = useTheme();
  const { dt, i18n } = useAdminTranslation();
  const [submissions, setSubmissions] = useState<MediaContentSubmission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Enhanced fetch submissions with error handling and optimizations
  const fetchSubmissions = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new Error("Request timeout after 30 seconds"));
      }, 30000); // 30s timeout - aligned with backend capacity

      try {
        const response = await fetch("/api/admin/media-submissions-stats", {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSubmissions(data.submissions || []);
            setStats(data.stats || null);
            setLastUpdate(new Date());

            if (isRefresh) {
              toast.success(dt("modernDashboard.dataUpdated"), {
                duration: 2000,
              });
            }
          } else {
            throw new Error(data.error || dt("modernDashboard.unknownError"));
          }
        } else {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      } catch (error) {
        // Handle abort errors specifically
        if (error instanceof Error && error.name === "AbortError") {
          const errorMessage = dt("modernDashboard.requestTimeout");
          logger.warn("Request aborted due to timeout", {
            component: "ModernDashboard",
            action: "fetch_timeout",
            metadata: { isRefresh },
          });
          setError(errorMessage);
          if (!isRefresh) {
            toast.error(errorMessage);
          }
        } else {
          const errorMessage =
            error instanceof Error
              ? error.message
              : dt("modernDashboard.unknownError");
          logger.error("Error fetching submissions", error, {
            component: "ModernDashboard",
            action: "fetch_error",
            metadata: { isRefresh },
          });
          setError(errorMessage);

          if (!isRefresh) {
            toast.error(
              dt("modernDashboard.loadingDataError") + ": " + errorMessage
            );
          }
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dt]
  );

  // Enhanced update submission with optimistic updates and immediate dashboard refresh
  const handleUpdateSubmission = useCallback(
    async (
      id: string,
      updates: Partial<{
        submissionStatus: MediaContentSubmission["submissionStatus"];
        priority: MediaContentSubmission["priority"];
      }>
    ) => {
      // Show loading state
      const loadingToast = toast.loading(
        dt("modernDashboard.updatingInProgress")
      );

      // Optimistic update for immediate UI feedback
      const previousSubmissions = [...submissions];
      const updatedSubmissions = submissions.map((sub) =>
        String(sub.id) === String(id)
          ? { ...sub, ...updates, updatedAt: new Date().toISOString() }
          : sub
      );
      setSubmissions(updatedSubmissions);

      try {
        const response = await fetch("/api/admin/update-submission", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ submissionId: id, updates }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Dismiss loading and show success
            toast.dismiss(loadingToast);

            // Get status text for notification
            const statusText =
              updates.submissionStatus === "resolved"
                ? dt("modernDashboard.resolved")
                : updates.submissionStatus === "reviewing"
                ? dt("modernDashboard.inReview")
                : updates.submissionStatus === "dismissed"
                ? dt("modernDashboard.dismissed")
                : dt("modernDashboard.pending");

            toast.success(`${dt("modernDashboard.markedAs")} ${statusText}`, {
              duration: 4000,
              action: {
                label: dt("modernDashboard.viewDetails"),
                onClick: () =>
                  (window.location.href = `/admin/collections/media-content-submissions/${id}`),
              },
            });

            // Immediate refresh to ensure accurate stats and counts
            await fetchSubmissions(true);
          } else {
            throw new Error(result.error || dt("modernDashboard.updateError"));
          }
        } else {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      } catch (error) {
        // Dismiss loading toast and revert optimistic update
        toast.dismiss(loadingToast);
        setSubmissions(previousSubmissions);

        logger.error("Error updating submission", error, {
          component: "ModernDashboard",
          action: "update_error",
          metadata: { submissionId: id, status: updates.submissionStatus },
        });
        toast.error(
          dt("modernDashboard.updateError") +
            ": " +
            (error instanceof Error
              ? error.message
              : dt("modernDashboard.unknownError")),
          {
            duration: 5000,
          }
        );
      }
    },
    [submissions, fetchSubmissions, dt]
  );

  // Navigate to Payload admin route for submission details
  const handleViewDetails = useCallback(
    (submission: MediaContentSubmission) => {
      window.location.href = `/admin/collections/media-content-submissions/${submission.id}`;
    },
    []
  );

  useEffect(() => {
    // Initial load
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Calculate enhanced dynamic statistics with actionable insights
  const dynamicStats = useMemo(() => {
    if (!submissions.length || !stats) return null;
    const total = stats.totalSubmissions || 0;
    const pending = stats.pendingCount || 0;
    const resolved = stats.resolvedCount || 0;
    const rejected = stats.dismissedCount || 0;
    const inReview = stats.reviewingCount || 0;

    const resolutionRate =
      total > 0 ? ((resolved / total) * 100).toFixed(1) : "0";

    // CRITICAL INSIGHTS FOR ADMIN DECISION-MAKING

    // 1. Urgent Priority Analysis
    const urgentComplaintsByStatus = submissions
      .filter((s) => s.priority === "urgent" && s.formType === "complaint")
      .reduce((acc, s) => {
        acc[s.submissionStatus] = (acc[s.submissionStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // 2. Media Type Risk Analysis (most complained about channels)
    const mediaRiskAnalysis = submissions
      .filter(
        (s) => s.formType === "complaint" && s.submissionStatus === "pending"
      )
      .reduce((acc, s) => {
        const rawMediaType = s.contentInfo?.mediaType || "unknown";
        const rawChannel = s.contentInfo?.specificChannel || "unspecified";
        const submissionLocale = (s.locale || "fr") as "fr" | "ar";
        const mediaType = getMediaTypeLabel(
          rawMediaType,
          submissionLocale
        );
        const channel =
          rawChannel === "unspecified"
            ? submissionLocale === "ar"
              ? "غير محدد"
              : "Non spécifié"
            : getMediaChannelLabel(
                rawChannel,
                rawMediaType as "radio" | "television",
                submissionLocale
              );
        const key = `${mediaType}: ${channel}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // 3. Response Time Analysis for Performance
    const overduePendingSubmissions = submissions
      .filter((s) => s.submissionStatus === "pending")
      .filter((s) => {
        const submittedDate = new Date(s.submittedAt);
        const daysSinceSubmitted =
          (new Date().getTime() - submittedDate.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysSinceSubmitted > 7; // Overdue if pending for more than 7 days
      });

    // 4. Language Distribution for Resource Planning
    const languageWorkload = submissions
      .filter((s) => s.submissionStatus === "pending")
      .reduce((acc, s) => {
        acc[s.locale] = (acc[s.locale] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // 5. Complex Cases Identification
    const complexCases = submissions.filter(
      (s) =>
        (s.priority === "urgent" || s.priority === "high") &&
        s.submissionStatus === "pending" &&
        s.formType === "complaint"
    ).length;

    // 6. CRITICAL VIOLATION ANALYSIS (Based on ReportReasonEnum from forms)
    const violationAnalysis = submissions
      .filter((s) => s.submissionStatus === "pending")
      .reduce((acc, s) => {
        // Parse reasons from the submission
        const reasons = Array.isArray(s.reasons) ? s.reasons : [];
        reasons.forEach((reasonObj: any) => {
          const reason = reasonObj?.reason || reasonObj;

          // Map to violation categories from the enum
          switch (reason) {
            case "hateSpeech":
              acc.hateSpeech = (acc.hateSpeech || 0) + 1;
              break;
            case "misinformation":
            case "fakeNews":
              acc.misinformation = (acc.misinformation || 0) + 1;
              break;
            case "privacyViolation":
              acc.privacy = (acc.privacy || 0) + 1;
              break;
            case "shockingContent":
              acc.inappropriate = (acc.inappropriate || 0) + 1;
              break;
            case "pluralismViolation":
              acc.pluralism = (acc.pluralism || 0) + 1;
              break;
            case "falseAdvertising":
              acc.advertising = (acc.advertising || 0) + 1;
              break;
            default:
              acc.other = (acc.other || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>);

    // 7. ATTACHMENT INSIGHTS (Evidence Quality Analysis)
    const evidenceQuality = submissions
      .filter((s) => s.submissionStatus === "pending")
      .reduce(
        (acc, s) => {
          const hasScreenshots =
            s.contentInfo?.screenshotFiles &&
            s.contentInfo.screenshotFiles.length > 0;
          const hasAttachments =
            s.attachmentFiles && s.attachmentFiles.length > 0;
          const hasLink = s.contentInfo?.linkScreenshot;

          if (hasScreenshots || hasAttachments || hasLink) {
            acc.withEvidence = (acc.withEvidence || 0) + 1;
          } else {
            acc.withoutEvidence = (acc.withoutEvidence || 0) + 1;
          }
          return acc;
        },
        { withEvidence: 0, withoutEvidence: 0 }
      );

    // 8. FORM TYPE BREAKDOWN WITH ACTIONABLE INSIGHTS
    const formBreakdown = {
      complaints: {
        total: submissions.filter((s) => s.formType === "complaint").length,
        urgent: submissions.filter(
          (s) => s.formType === "complaint" && s.priority === "urgent"
        ).length,
        pending: submissions.filter(
          (s) => s.formType === "complaint" && s.submissionStatus === "pending"
        ).length,
        withComplainant: submissions.filter(
          (s) =>
            s.formType === "complaint" &&
            s.complainantInfo?.fullName &&
            s.complainantInfo?.emailAddress
        ).length,
        anonymous: submissions.filter(
          (s) =>
            s.formType === "complaint" &&
            (!s.complainantInfo?.fullName || !s.complainantInfo?.emailAddress)
        ).length,
      },
      reports: {
        total: submissions.filter((s) => s.formType === "report").length,
        urgent: submissions.filter(
          (s) => s.formType === "report" && s.priority === "urgent"
        ).length,
        pending: submissions.filter(
          (s) => s.formType === "report" && s.submissionStatus === "pending"
        ).length,
        anonymous: submissions.filter((s) => s.formType === "report").length, // All reports are anonymous
      },
    };

    // Calculate average response time from submissions
    const avgResponseTime = (() => {
      const resolvedSubmissions = submissions.filter(
        (s) => s.submissionStatus === "resolved"
      );
      if (resolvedSubmissions.length === 0) return "2.5";

      const totalHours = resolvedSubmissions.reduce((acc, sub) => {
        const submitted = new Date(sub.submittedAt);
        const updated = sub.updatedAt ? new Date(sub.updatedAt) : new Date();
        const hours =
          (updated.getTime() - submitted.getTime()) / (1000 * 60 * 60);
        return acc + hours;
      }, 0);

      return (totalHours / resolvedSubmissions.length).toFixed(1);
    })();

    // Weekly trend data (real data from last 7 days)
    const weeklyData = (() => {
      const days = [
        dt("modernDashboard.days.sun"),
        dt("modernDashboard.days.mon"),
        dt("modernDashboard.days.tue"),
        dt("modernDashboard.days.wed"),
        dt("modernDashboard.days.thu"),
        dt("modernDashboard.days.fri"),
        dt("modernDashboard.days.sat"),
      ];
      const data = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const daySubmissions = submissions.filter((s) => {
          const subDate = new Date(s.submittedAt);
          return subDate >= dayStart && subDate <= dayEnd;
        });

        data.push({
          day: days[dayStart.getDay()],
          submissions: daySubmissions.length,
          resolved: daySubmissions.filter(
            (s) => s.submissionStatus === "resolved"
          ).length,
        });
      }

      return data;
    })();

    // Status distribution for pie chart (filter out zero values)
    const statusDistribution = [
      {
        name: dt("status.pending"),
        value: pending,
        color: chartColors.pending,
        percentage: 0,
      },
      {
        name: dt("status.resolved"),
        value: resolved,
        color: chartColors.resolved,
        percentage: 0,
      },
      {
        name: dt("status.dismissed"),
        value: rejected,
        color: chartColors.rejected,
        percentage: 0,
      },
      {
        name: dt("status.reviewing"),
        value: inReview,
        color: chartColors.inReview,
        percentage: 0,
      },
    ]
      .filter((item) => item.value > 0)
      .map((item) => ({
        ...item,
        percentage: ((item.value / total) * 100).toFixed(1),
      }));

    // Monthly trend data (real data from last 6 months)
    const monthlyTrend = (() => {
      const months = [
        dt("modernDashboard.months.jan"),
        dt("modernDashboard.months.feb"),
        dt("modernDashboard.months.mar"),
        dt("modernDashboard.months.apr"),
        dt("modernDashboard.months.may"),
        dt("modernDashboard.months.jun"),
        dt("modernDashboard.months.jul"),
        dt("modernDashboard.months.aug"),
        dt("modernDashboard.months.sep"),
        dt("modernDashboard.months.oct"),
        dt("modernDashboard.months.nov"),
        dt("modernDashboard.months.dec"),
      ];
      const data = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          0,
          23,
          59,
          59,
          999
        );

        const monthSubmissions = submissions.filter((s) => {
          const subDate = new Date(s.submittedAt);
          return subDate >= monthDate && subDate <= monthEnd;
        });

        data.push({
          month: months[monthDate.getMonth()],
          total: monthSubmissions.length,
          resolved: monthSubmissions.filter(
            (s) => s.submissionStatus === "resolved"
          ).length,
          pending: monthSubmissions.filter(
            (s) => s.submissionStatus === "pending"
          ).length,
        });
      }

      return data;
    })();

    // Convert risk analysis to array for charts
    const topRiskyChannels = Object.entries(mediaRiskAnalysis)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([channel, count]) => ({ channel, complaints: count }));

    // Priority distribution for urgent action
    const priorityDistribution = [
      {
        name: dt("priority.urgent"),
        value: urgentComplaintsByStatus.pending || 0,
        color: "#ef4444",
        category: "urgent",
      },
      {
        name: dt("priority.high"),
        value: submissions.filter(
          (s) => s.priority === "high" && s.submissionStatus === "pending"
        ).length,
        color: "#f97316",
        category: "high",
      },
      {
        name: dt("priority.medium"),
        value: submissions.filter(
          (s) => s.priority === "medium" && s.submissionStatus === "pending"
        ).length,
        color: "#eab308",
        category: "medium",
      },
      {
        name: dt("priority.low"),
        value: submissions.filter(
          (s) => s.priority === "low" && s.submissionStatus === "pending"
        ).length,
        color: "#64748b",
        category: "low",
      },
    ].filter((item) => item.value > 0);

    // Convert violation analysis to chart format
    const violationDistribution = Object.entries(violationAnalysis)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6) // Top 6 violation types
      .map(([type, count]) => ({
        type:
          type === "hateSpeech"
            ? dt("modernDashboard.hateSpeech")
            : type === "misinformation"
            ? dt("modernDashboard.misinformation")
            : type === "privacy"
            ? dt("modernDashboard.privacy")
            : type === "inappropriate"
            ? dt("modernDashboard.shockingContent")
            : type === "pluralism"
            ? dt("modernDashboard.pluralism")
            : type === "advertising"
            ? dt("modernDashboard.falseAdvertising")
            : dt("modernDashboard.others"),
        count,
        severity:
          type === "hateSpeech" || type === "misinformation"
            ? "high"
            : "medium",
      }));

    return {
      total,
      pending,
      resolved,
      rejected,
      inReview,
      resolutionRate,
      avgResponseTime,
      weeklyData,
      statusDistribution,
      monthlyTrend,
      // ENHANCED INSIGHTS FOR DECISION MAKING
      urgentComplaintsByStatus,
      mediaRiskAnalysis,
      topRiskyChannels,
      overduePendingCount: overduePendingSubmissions.length,
      languageWorkload,
      complexCases,
      priorityDistribution,
      violationDistribution,
      evidenceQuality,
      formTypeInsights: formBreakdown,
    };
  }, [submissions, stats, dt]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Skeleton className="h-8 w-80" />
            <div className="ml-auto">
              <Skeleton className="h-8 w-32" />
            </div>
          </header>

          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>

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

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96" />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (error || !dynamicStats) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {error
                ? dt("modernDashboard.connectionError")
                : dt("modernDashboard.noData")}
            </CardTitle>
            <CardDescription>
              {error
                ? dt("modernDashboard.unableToLoadDashboard")
                : dt("modernDashboard.noDataAvailable")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => fetchSubmissions()}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
                />
                {dt("modernDashboard.retry")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href =
                    "/admin/collections/media-content-submissions";
                }}
                className="w-full"
              >
                {dt("modernDashboard.viewSubmissionsDirectly")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="hapa-dashboard-container" data-theme={theme}>
      <div className="hapa-section">
        <header className="hapa-header">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div
                className="hapa-icon-container"
                style={{ height: "2.5rem", width: "2.5rem" }}
              >
                <BarChart3 size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {dt("modernDashboard.controlCenterTitle")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {dt("modernDashboard.mediaSubmissionsManagement")}
                </p>
              </div>
            </div>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {/* Enhanced Status indicator */}
            <StatusIndicator
              isRefreshing={refreshing}
              lastUpdate={lastUpdate}
              onManualRefresh={() => fetchSubmissions(true)}
            />
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Calendar className="h-4 w-4 mr-2" />
                      {timeRange === "7d"
                        ? dt("modernDashboard.timeRange7d")
                        : timeRange === "30d"
                        ? dt("modernDashboard.timeRange30d")
                        : dt("modernDashboard.timeRangeAll")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTimeRange("7d")}>
                      <Clock className="h-4 w-4 mr-2" />
                      {dt("modernDashboard.last7Days")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange("30d")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {dt("modernDashboard.last30Days")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange("all")}>
                      <Activity className="h-4 w-4 mr-2" />
                      {dt("modernDashboard.allData")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>{dt("modernDashboard.dataAnalysisPeriod")}</p>
              </TooltipContent>
            </ShadcnTooltip>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {dt("modernDashboard.export")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{dt("modernDashboard.exportToExcel")}</p>
              </TooltipContent>
            </ShadcnTooltip>
          </div>
        </header>
      </div>

      <main className="space-y-6">
        {/* Key Metrics Section - Enhanced StatCards */}
        <div className="hapa-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <StatCard
              title={dt("modernDashboard.totalSubmissions")}
              subtitle={dt("modernDashboard.last30DaysLabel")}
              value={dynamicStats.total}
              icon={FileText}
              iconColor="text-blue-500"
              valueColor="text-blue-600"
              trend={{
                value: dynamicStats.total > 100 ? 12.3 : 0,
                label: dt("modernDashboard.vsPreviousMonth"),
                isPositive: true,
                color: "text-green-600",
              }}
              badge={{
                text: `${dynamicStats.formTypeInsights.complaints.total} ${dt(
                  "modernDashboard.complaints"
                )}, ${dynamicStats.formTypeInsights.reports.total} ${dt(
                  "modernDashboard.reports"
                )}`,
                variant: "secondary",
              }}
              dateRange={(() => {
                const now = new Date();
                const month = now.getMonth(); // 0-based month index
                const year = now.getFullYear();

                if (locale === "ar") {
                  // Use Arabic month names from translations
                  const arabicMonths = [
                    dt("modernDashboard.months.jan"),
                    dt("modernDashboard.months.feb"),
                    dt("modernDashboard.months.mar"),
                    dt("modernDashboard.months.apr"),
                    dt("modernDashboard.months.may"),
                    dt("modernDashboard.months.jun"),
                    dt("modernDashboard.months.jul"),
                    dt("modernDashboard.months.aug"),
                    dt("modernDashboard.months.sep"),
                    dt("modernDashboard.months.oct"),
                    dt("modernDashboard.months.nov"),
                    dt("modernDashboard.months.dec"),
                  ];
                  return `جميع بيانات ${arabicMonths[month]} ${year}`;
                } else {
                  // Use French month names from translations or native
                  const frenchMonths = [
                    "janvier",
                    "février",
                    "mars",
                    "avril",
                    "mai",
                    "juin",
                    "juillet",
                    "août",
                    "septembre",
                    "octobre",
                    "novembre",
                    "décembre",
                  ];
                  return `Toutes les données ${frenchMonths[month]} ${year}`;
                }
              })()}
            />

            <StatCard
              title={dt("modernDashboard.urgentActionRequired")}
              subtitle={dt("modernDashboard.criticalComplaints")}
              value={dynamicStats.complexCases}
              icon={AlertCircle}
              iconColor="text-red-500"
              valueColor="text-red-600"
              urgent={dynamicStats.complexCases > 0}
              badge={{
                text:
                  dynamicStats.complexCases > 0
                    ? dt("priority.urgent").toUpperCase()
                    : "OK",
                variant:
                  dynamicStats.complexCases > 0 ? "destructive" : "secondary",
                icon: dynamicStats.complexCases > 0 ? AlertCircle : undefined,
              }}
              description={dt("modernDashboard.immediateAttentionRequired")}
            />

            <StatCard
              title={dt("modernDashboard.pending")}
              subtitle={dt("modernDashboard.submissionsToProcess")}
              value={dynamicStats.pending}
              icon={Clock}
              iconColor="text-orange-500"
              valueColor="text-orange-600"
              trend={{
                value: -5.2,
                label: dt("modernDashboard.vsLastWeek"),
                isPositive: false,
                color: "text-red-600",
              }}
              description={`FR: ${
                dynamicStats.languageWorkload.fr || 0
              } • AR: ${dynamicStats.languageWorkload.ar || 0}`}
              progressBar={{
                value: 35,
                label: dt("modernDashboard.completionPercentage"),
                color: "bg-yellow-500",
              }}
            />

            <StatCard
              title={dt("modernDashboard.responseTime")}
              subtitle={dt("modernDashboard.average")}
              value={`${dynamicStats.avgResponseTime}h`}
              icon={Zap}
              iconColor="text-green-500"
              valueColor="text-green-600"
              badge={{
                text: dt("modernDashboard.excellent"),
                variant: "secondary",
                icon: Zap,
                iconColor: "text-green-500",
              }}
              description={`${dt("modernDashboard.resolutionRate")}: ${
                dynamicStats.resolutionRate
              }%`}
            />

            <StatCard
              title={dt("modernDashboard.overdueFiles")}
              subtitle={dt("modernDashboard.moreThan7Days")}
              value={dynamicStats.overduePendingCount}
              icon={AlertTriangle}
              iconColor="text-orange-500"
              valueColor="text-orange-600"
              trend={{
                value: -8.1,
                label: dt("modernDashboard.vsLastMonth"),
                isPositive: false,
                color: "text-red-600",
              }}
              badge={{
                text: dt("modernDashboard.attention"),
                variant: "destructive",
                icon: AlertTriangle,
                iconColor: "text-orange-500",
              }}
            />
          </div>
        </div>

        {/* Section Separator */}
        <div className="hapa-section-separator"></div>

        {/* Risk Analysis Section */}
        <div className="hapa-section">
          {dynamicStats.topRiskyChannels.length > 0 && (
            <div className="hapa-card hapa-card-red">
              <div className="hapa-card-header">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <h3 className="hapa-card-title font-semibold">
                    {dt("modernDashboard.mediaRiskAnalysis")}
                  </h3>
                </div>
                <p className="text-sm hapa-text-muted mt-1">
                  {dt("modernDashboard.channelsWithMostComplaints")}
                </p>
              </div>
              <div className="hapa-card-content">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {dynamicStats.topRiskyChannels.map((channel, index) => (
                    <div
                      key={channel.channel}
                      className="flex items-center justify-between p-3 bg-card/50 hover:bg-card/80 rounded-lg border border-border/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="hapa-badge hapa-badge-destructive text-xs">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">
                          {channel.channel}
                        </span>
                      </div>
                      <span className="hapa-badge hapa-badge-outline">
                        {channel.complaints} {dt("modernDashboard.complaints")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Violation Analysis Chart - Critical for Regulatory Decisions */}
          {dynamicStats.violationDistribution.length > 0 && (
            <div className="hapa-card hapa-card-red">
              <div className="hapa-card-header">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="hapa-card-title font-semibold">
                    {dt("modernDashboard.criticalViolationsAnalysis")}
                  </h3>
                </div>
                <p className="text-sm hapa-text-muted mt-1">
                  {dt("modernDashboard.mostFrequentViolations")}
                </p>
              </div>
              <div className="hapa-card-content">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={dynamicStats.violationDistribution}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={100} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-muted-foreground">
                                {payload[0].value} {dt("modernDashboard.cases")}{" "}
                                • {dt("modernDashboard.severity")}:{" "}
                                {data.severity === "high"
                                  ? dt("modernDashboard.high")
                                  : dt("modernDashboard.moderate")}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {dynamicStats.violationDistribution.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.severity === "high" ? "#ef4444" : "#f97316"
                            }
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div
                  style={{
                    marginTop: "1rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <div className="p-3 bg-card/50 hover:bg-card/80 rounded-lg border border-border/50 transition-colors text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {dynamicStats.evidenceQuality.withEvidence}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dt("modernDashboard.withEvidence")}
                    </div>
                  </div>
                  <div className="p-3 bg-card/50 hover:bg-card/80 rounded-lg border border-border/50 transition-colors text-center">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {dynamicStats.evidenceQuality.withoutEvidence}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dt("modernDashboard.withoutEvidence")}
                    </div>
                  </div>
                  <div className="p-3 bg-card/50 hover:bg-card/80 rounded-lg border border-border/50 transition-colors text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(
                        (dynamicStats.evidenceQuality.withEvidence /
                          (dynamicStats.evidenceQuality.withEvidence +
                            dynamicStats.evidenceQuality.withoutEvidence ||
                            1)) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dt("modernDashboard.evidenceQuality")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Separator */}
        <div className="hapa-section-separator"></div>

        {/* Form Analysis Section */}
        <div className="hapa-section">
          <div className="hapa-card hapa-card-blue">
            <div className="hapa-card-header">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" style={{ color: "#2563eb" }} />
                <h3 className="hapa-card-title font-semibold">
                  {dt("modernDashboard.formTypesAnalysis")}
                </h3>
              </div>
              <p className="text-sm hapa-text-muted mt-1">
                {dt("modernDashboard.distributionAndPriorities")}
              </p>
            </div>
            <div className="hapa-card-content">
              <div className="grid grid-cols-2 gap-8">
                {/* Complaints Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    {dt("modernDashboard.complaintsLabel")} (
                    {dynamicStats.formTypeInsights.complaints.total})
                  </h4>
                  <div className="space-y-2 pl-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {dt("modernDashboard.pending")}
                      </span>
                      <Badge variant="secondary" className="font-bold">
                        {dynamicStats.formTypeInsights.complaints.pending}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {dt("modernDashboard.urgent")}
                      </span>
                      <Badge variant="destructive" className="font-bold">
                        {dynamicStats.formTypeInsights.complaints.urgent}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {dt("modernDashboard.withContact")}
                      </span>
                      <Badge variant="outline" className="font-bold">
                        {
                          dynamicStats.formTypeInsights.complaints
                            .withComplainant
                        }
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Reports Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    {dt("modernDashboard.reportsLabel")} (
                    {dynamicStats.formTypeInsights.reports.total})
                  </h4>
                  <div className="space-y-2 pl-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {dt("modernDashboard.pending")}
                      </span>
                      <Badge variant="secondary" className="font-bold">
                        {dynamicStats.formTypeInsights.reports.pending}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {dt("modernDashboard.urgent")}
                      </span>
                      <Badge variant="destructive" className="font-bold">
                        {dynamicStats.formTypeInsights.reports.urgent}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {dt("modernDashboard.anonymous")}
                      </span>
                      <Badge variant="outline" className="font-bold">
                        {dynamicStats.formTypeInsights.reports.anonymous}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Separator */}
        <div className="hapa-section-separator"></div>

        {/* Charts Section */}
        <div className="hapa-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Weekly Trend Chart */}
            <div className="hapa-card col-span-2">
              <div className="hapa-card-header">
                <h3 className="hapa-card-title font-semibold">
                  {dt("modernDashboard.weeklyTrend")}
                </h3>
                <p className="text-sm hapa-text-muted mt-1">
                  {dt("modernDashboard.submissionsAndResolutions7Days")}
                </p>
              </div>
              <div className="hapa-card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dynamicStats.weeklyData}>
                    <defs>
                      <linearGradient
                        id="colorSubmissions"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={chartColors.primary}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartColors.primary}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorResolved"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={chartColors.accent}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartColors.accent}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="submissions"
                      stroke={chartColors.primary}
                      fillOpacity={1}
                      fill="url(#colorSubmissions)"
                      name={dt("modernDashboard.submissions")}
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      stroke={chartColors.accent}
                      fillOpacity={1}
                      fill="url(#colorResolved)"
                      name={dt("modernDashboard.resolved")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Pie Chart - Improved */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {dt("modernDashboard.statusDistribution")}
                </CardTitle>
                <CardDescription>
                  {dt("modernDashboard.currentDistribution")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={dynamicStats.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dynamicStats.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="font-medium">{payload[0].name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {payload[0].value} (
                                  {payload[0].payload.percentage}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend with counts */}
                  <div className="grid grid-cols-2 gap-2">
                    {dynamicStats.statusDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.value} ({item.percentage}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Separator */}
        <div className="hapa-section-separator"></div>

        {/* Monthly Analysis Section */}
        <div className="hapa-section">
          <Card>
            <CardHeader>
              <CardTitle>{dt("modernDashboard.monthlyAnalysis")}</CardTitle>
              <CardDescription>
                {dt("modernDashboard.realEvolution6Months")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dynamicStats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <p className="font-medium mb-2">{label}</p>
                            {payload.map((entry, index) => (
                              <p
                                key={index}
                                className="text-sm"
                                style={{ color: entry.color }}
                              >
                                {entry.name}: {entry.value}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    fill={chartColors.primary}
                    name={dt("modernDashboard.total")}
                  />
                  <Bar
                    dataKey="resolved"
                    fill={chartColors.accent}
                    name={dt("modernDashboard.resolved")}
                  />
                  <Bar
                    dataKey="pending"
                    fill={chartColors.pending}
                    name={dt("modernDashboard.pending")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Section Separator */}
        <div className="hapa-section-separator"></div>

        {/* Data Table Section */}
        <div className="hapa-section">
          <Card>
            <CardHeader>
              <CardTitle>{dt("modernDashboard.recentSubmissions")}</CardTitle>
              <CardDescription>
                {dt("modernDashboard.allSubmissionsWithPagination")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsDataTable
                submissions={submissions}
                onUpdateSubmission={handleUpdateSubmission}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
