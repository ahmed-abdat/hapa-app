"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminTranslation } from "@/utilities/admin-translations";
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
import {
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Activity,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ContactSubmission {
  id: string;
  status: 'pending' | 'in-progress' | 'resolved';
  locale: 'fr' | 'ar';
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  replyMessage?: string;
  emailSent?: boolean;
  emailSentAt?: string;
}

interface ContactStats {
  totalSubmissions: number;
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  statusBreakdown: {
    pending: number;
    inProgress: number;
    resolved: number;
  };
  localeBreakdown: {
    fr: number;
    ar: number;
  };
  recentSubmissions: ContactSubmission[];
}

export function ContactDashboardComponent() {
  const { locale } = useParams();
  const { theme } = useTheme();
  const { dt, i18n } = useAdminTranslation();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch contact submissions data
  const fetchContactSubmissions = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      try {
        const response = await fetch("/api/admin/contact-submissions-stats", {
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

            if (isRefresh) {
              toast.success(
                i18n.language === 'ar' ? 'تم التحديث بنجاح' : 'Données actualisées avec succès'
              );
            }
          } else {
            throw new Error(data.error || "Failed to fetch data");
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error: any) {
        const errorMsg = error.message || "Unknown error occurred";
        setError(errorMsg);
        logger.error("Contact Dashboard Error:", errorMsg);
        
        if (isRefresh) {
          toast.error(
            i18n.language === 'ar' ? 'فشل في التحديث' : 'Échec de l\'actualisation'
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [i18n.language]
  );

  // Initial data load
  useEffect(() => {
    fetchContactSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <Activity className="h-4 w-4" />;
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Format status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return dt('status.pending');
      case 'in-progress': return dt('status.reviewing');
      case 'resolved': return dt('status.resolved');
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <MessageCircle size={20} className="text-primary" />
              </div>
              <div>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </header>
          <main className="p-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="p-4 sm:px-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {i18n.language === 'ar' ? 'خطأ' : 'Erreur'}
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => fetchContactSubmissions()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}
            </Button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold md:text-xl">
                {i18n.language === 'ar' 
                  ? 'لوحة تحكم - رسائل الاتصال' 
                  : 'Tableau de bord - Messages de Contact'
                }
              </h1>
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'ar' 
                  ? 'إدارة ومتابعة رسائل الاتصال من الموقع' 
                  : 'Gestion et suivi des messages de contact du site'
                }
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/admin/collections/contact-submissions?where[status][equals]=pending', '_blank')}
            >
              <Clock className="h-4 w-4 mr-1" />
              {dt('modernDashboard.pending')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/admin/collections/contact-submissions', '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {dt('actions.allMessages')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchContactSubmissions(true)}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              {dt('actions.refresh')}
            </Button>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {i18n.language === 'ar' ? 'إجمالي الرسائل' : 'Total Messages'}
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dt('actions.allMessages')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {i18n.language === 'ar' ? 'اليوم' : 'Aujourd\'hui'}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalToday || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {i18n.language === 'ar' ? 'رسائل اليوم' : 'Messages du jour'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dt('status.pending')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.statusBreakdown?.pending || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {i18n.language === 'ar' ? 'تحتاج للمراجعة' : 'À traiter'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {i18n.language === 'ar' ? 'تم الحل' : 'Résolus'}
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.statusBreakdown?.resolved || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {i18n.language === 'ar' ? 'رسائل محلولة' : 'Messages traités'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {i18n.language === 'ar' ? 'الرسائل الحديثة' : 'Messages Récents'}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'ar' 
                  ? 'آخر رسائل الاتصال المستلمة - انقر على أي رسالة لعرض التفاصيل' 
                  : 'Derniers messages de contact reçus - Cliquez sur un message pour voir les détails'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {stats?.recentSubmissions?.length ? (
                    stats.recentSubmissions.map((submission) => (
                      <div 
                        key={submission.id} 
                        className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          // Navigate to contact submissions collection with this specific submission
                          window.open(
                            `/admin/collections/contact-submissions/${submission.id}`, 
                            '_blank'
                          );
                        }}
                      >
                        <Avatar>
                          <AvatarFallback>
                            {submission.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium hover:text-primary transition-colors">
                              {submission.subject}
                            </p>
                            <div className="flex items-center gap-1">
                              <Badge className={cn("text-xs", getStatusColor(submission.status))}>
                                {getStatusIcon(submission.status)}
                                <span className="ml-1">{getStatusText(submission.status)}</span>
                              </Badge>
                              {submission.emailSent && (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {i18n.language === 'ar' ? 'تم الرد' : 'Répondu'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-3 w-3 mr-1" />
                            {submission.name}
                            <Mail className="h-3 w-3 ml-3 mr-1" />
                            {submission.email}
                            {submission.phone && (
                              <>
                                <Phone className="h-3 w-3 ml-3 mr-1" />
                                {submission.phone}
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {new Date(submission.submittedAt).toLocaleString(
                                i18n.language === 'ar' ? 'ar-MR' : 'fr-FR'
                              )}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/admin/collections/contact-submissions/${submission.id}`, 
                                  '_blank'
                                );
                              }}
                            >
                              {dt('actions.viewDetails')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {i18n.language === 'ar' ? 'لا توجد رسائل حديثة' : 'Aucun message récent'}
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Quick Actions */}
              <div className="flex justify-center mt-6 pt-4 border-t">
                <Button 
                  onClick={() => window.open('/admin/collections/contact-submissions', '_blank')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {i18n.language === 'ar' ? 'عرض جميع الرسائل' : 'Voir tous les messages'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}