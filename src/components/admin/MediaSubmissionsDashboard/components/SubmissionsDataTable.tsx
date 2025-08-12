"use client";

import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  FileText,
  MoreVertical,
  Search,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Zap,
  Eye,
  CheckCircle2,
  XCircleIcon,
  AlertTriangle,
  Calendar,
  User,
  Mail,
  Tv,
  Radio,
  Newspaper,
  Globe,
} from "lucide-react";
import type { MediaContentSubmission } from "@/payload-types";

interface SubmissionsDataTableProps {
  submissions: MediaContentSubmission[];
  onUpdateSubmission: (
    id: string,
    updates: Partial<{
      submissionStatus: MediaContentSubmission["submissionStatus"];
      priority: MediaContentSubmission["priority"];
    }>
  ) => void;
  onViewDetails: (submission: MediaContentSubmission) => void;
}

export function SubmissionsDataTable({
  submissions,
  onUpdateSubmission,
  onViewDetails,
}: SubmissionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Define columns for the table
  const columns: ColumnDef<MediaContentSubmission>[] = useMemo(
    () => [
      {
        accessorKey: "formType",
        header: "Type",
        cell: ({ row }) => {
          const formType = row.getValue("formType") as string;
          const submission = row.original;
          const isUrgent = submission.priority === 'urgent';
          
          return (
            <div className="flex items-center gap-2">
              <div className={`relative p-2 rounded-lg ${
                formType === "complaint" 
                  ? "bg-orange-50 border border-orange-200 dark:bg-orange-950/20" 
                  : "bg-blue-50 border border-blue-200 dark:bg-blue-950/20"
              }`}>
                {formType === "complaint" ? (
                  <AlertCircle className={`h-4 w-4 ${
                    isUrgent ? 'text-red-600' : 'text-orange-600'
                  }`} />
                ) : (
                  <FileText className="h-4 w-4 text-blue-600" />
                )}
                {isUrgent && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <span className="text-sm font-semibold">
                  {formType === "complaint" ? "Plainte" : "Signalement"}
                </span>
                {isUrgent && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">URGENT</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "complainantInfo.fullName",
        header: "Soumetteur",
        cell: ({ row }) => {
          const submission = row.original;
          const hasComplainant = submission.complainantInfo?.fullName;
          
          return (
            <div className="flex items-start gap-2">
              <div className={`p-1.5 rounded-full ${
                hasComplainant 
                  ? "bg-green-100 dark:bg-green-950/20" 
                  : "bg-gray-100 dark:bg-gray-800"
              }`}>
                <User className={`h-3 w-3 ${
                  hasComplainant ? "text-green-600" : "text-gray-500"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {hasComplainant ? submission.complainantInfo.fullName : "Anonyme"}
                </p>
                {submission.complainantInfo?.emailAddress && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {submission.complainantInfo.emailAddress}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {submission.locale === 'fr' ? '🇫🇷 Français' : '🇦🇷 العربية'}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "contentInfo.mediaType",
        header: "Média/Programme",
        cell: ({ row }) => {
          const submission = row.original;
          const mediaType = submission.contentInfo?.mediaType;
          const programName = submission.contentInfo?.programName;
          const channel = submission.contentInfo?.specificChannel;
          
          const getMediaIcon = (type: string) => {
            switch (type?.toLowerCase()) {
              case 'télévision':
              case 'television':
                return <Tv className="h-4 w-4 text-blue-600" />;
              case 'radio':
                return <Radio className="h-4 w-4 text-green-600" />;
              case 'presse écrite':
              case 'journal':
                return <Newspaper className="h-4 w-4 text-purple-600" />;
              case 'internet':
              case 'web':
                return <Globe className="h-4 w-4 text-orange-600" />;
              default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
            }
          };
          
          return (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {getMediaIcon(mediaType || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {mediaType || "Non spécifié"}
                </p>
                {(programName || channel) && (
                  <div className="space-y-0.5">
                    {programName && (
                      <p className="text-xs text-muted-foreground truncate">
                        📺 {programName}
                      </p>
                    )}
                    {channel && (
                      <p className="text-xs text-muted-foreground truncate">
                        📡 {channel}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "submittedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 p-0 hover:bg-transparent"
            >
              Date
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("submittedAt"));
          const now = new Date();
          const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          const getTimeStatus = (hours: number) => {
            if (hours < 1) return { text: 'Récent', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' };
            if (hours < 24) return { text: `${hours}h`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' };
            if (hours < 168) return { text: `${diffDays}j`, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/20' };
            return { text: 'Ancien', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' };
          };
          
          const timeStatus = getTimeStatus(diffHours);
          
          return (
            <div className="flex items-start gap-2">
              <div className={`p-1.5 rounded-full ${timeStatus.bg}`}>
                <Calendar className={`h-3 w-3 ${timeStatus.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{date.toLocaleDateString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground">
                  {date.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${timeStatus.bg} ${timeStatus.color}`}>
                  <Clock className="h-3 w-3" />
                  {timeStatus.text}
                </span>
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.getValue("submittedAt"));
          const dateB = new Date(rowB.getValue("submittedAt"));
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        accessorKey: "submissionStatus",
        header: "Statut",
        cell: ({ row }) => {
          const status = row.getValue("submissionStatus") as string;
          
          const getStatusConfig = (status: string) => {
            switch (status) {
              case 'pending':
                return {
                  icon: <Clock className="h-3 w-3" />,
                  text: 'En attente',
                  variant: 'secondary' as const,
                  className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400'
                };
              case 'resolved':
                return {
                  icon: <CheckCircle2 className="h-3 w-3" />,
                  text: 'Résolu',
                  variant: 'default' as const,
                  className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400'
                };
              case 'dismissed':
                return {
                  icon: <XCircleIcon className="h-3 w-3" />,
                  text: 'Rejeté',
                  variant: 'destructive' as const,
                  className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400'
                };
              case 'reviewing':
                return {
                  icon: <Eye className="h-3 w-3" />,
                  text: 'En révision',
                  variant: 'outline' as const,
                  className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                };
              default:
                return {
                  icon: <AlertCircle className="h-3 w-3" />,
                  text: status,
                  variant: 'outline' as const,
                  className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                };
            }
          };
          
          const config = getStatusConfig(status);
          
          return (
            <Badge className={`flex items-center gap-1.5 px-3 py-1 ${config.className}`}>
              {config.icon}
              {config.text}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "priority",
        header: "Priorité",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as string;
          
          const getPriorityConfig = (priority: string) => {
            switch (priority) {
              case 'urgent':
                return {
                  icon: <Zap className="h-3 w-3" />,
                  text: 'Urgent',
                  className: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse dark:bg-red-950/20 dark:text-red-400'
                };
              case 'high':
                return {
                  icon: <ArrowUp className="h-3 w-3" />,
                  text: 'Haute',
                  className: 'bg-orange-100 text-orange-800 border-orange-300 font-semibold dark:bg-orange-950/20 dark:text-orange-400'
                };
              case 'medium':
                return {
                  icon: <ArrowUpDown className="h-3 w-3" />,
                  text: 'Moyenne',
                  className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/20 dark:text-yellow-600'
                };
              case 'low':
                return {
                  icon: <ArrowDown className="h-3 w-3" />,
                  text: 'Basse',
                  className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300'
                };
              default:
                return {
                  icon: <AlertCircle className="h-3 w-3" />,
                  text: priority,
                  className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300'
                };
            }
          };
          
          const config = getPriorityConfig(priority);
          
          return (
            <Badge className={`flex items-center gap-1.5 px-3 py-1 ${config.className}`}>
              {config.icon}
              {config.text}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const submission = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onViewDetails(submission)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateSubmission(String(submission.id), {
                        submissionStatus: "reviewing",
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                    Marquer en révision
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateSubmission(String(submission.id), {
                        submissionStatus: "resolved",
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Marquer comme résolu
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateSubmission(String(submission.id), {
                        submissionStatus: "dismissed",
                      })
                    }
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Rejeter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onUpdateSubmission, onViewDetails]
  );

  const table = useReactTable({
    data: submissions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Helper functions for filter values
  const statusFilter = (table.getColumn("submissionStatus")?.getFilterValue() as string[]) || [];
  const priorityFilter = (table.getColumn("priority")?.getFilterValue() as string[]) || [];
  const formTypeFilter = (table.getColumn("formType")?.getFilterValue() as string[]) || [];

  const setStatusFilter = (values: string[]) => {
    table.getColumn("submissionStatus")?.setFilterValue(values.length ? values : undefined);
  };

  const setPriorityFilter = (values: string[]) => {
    table.getColumn("priority")?.setFilterValue(values.length ? values : undefined);
  };

  const setFormTypeFilter = (values: string[]) => {
    table.getColumn("formType")?.setFilterValue(values.length ? values : undefined);
  };

  return (
    <div className="w-full space-y-4">
      {/* Enhanced Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (nom, email, programme, média)..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select
          value={statusFilter.length === 1 ? statusFilter[0] : "all"}
          onValueChange={(value) => setStatusFilter(value === "all" ? [] : [value])}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="reviewing">En révision</SelectItem>
            <SelectItem value="resolved">Résolu</SelectItem>
            <SelectItem value="dismissed">Rejeté</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter.length === 1 ? priorityFilter[0] : "all"}
          onValueChange={(value) => setPriorityFilter(value === "all" ? [] : [value])}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={formTypeFilter.length === 1 ? formTypeFilter[0] : "all"}
          onValueChange={(value) => setFormTypeFilter(value === "all" ? [] : [value])}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="complaint">Plaintes</SelectItem>
            <SelectItem value="report">Signalements</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setGlobalFilter("");
            setStatusFilter([]);
            setPriorityFilter([]);
            setFormTypeFilter([]);
          }}
          className="bg-background hover:bg-muted transition-colors"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Réinitialiser les filtres
        </Button>
      </div>

      {/* Enhanced Table */}
      <div className="rounded-xl border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50 border-b border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-muted/20 font-semibold text-foreground/80">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => {
                const submission = row.original;
                const isUrgent = submission.priority === 'urgent';
                const isOverdue = submission.submissionStatus === 'pending' && 
                  ((new Date().getTime() - new Date(submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)) > 7;
                
                return (
                  <TableRow 
                    key={row.id} 
                    data-state={row.getIsSelected() && "selected"}
                    className={`
                      hover:bg-muted/30 transition-all duration-200
                      ${isUrgent ? 'bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10' : ''}
                      ${isOverdue ? 'bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-950/10' : ''}
                      ${index % 2 === 0 ? 'bg-muted/10' : ''}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium">Aucune soumission trouvée</p>
                    <p className="text-sm">Essayez de modifier vos filtres ou votre recherche</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Lignes par page:</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()} ({table.getFilteredRowModel().rows.length} résultat
              {table.getFilteredRowModel().rows.length > 1 ? "s" : ""})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            onClick={() => window.open("/admin/collections/media-content-submissions", "_blank")}
          >
            Voir dans Payload CMS
          </Button>
        </div>
      </div>
    </div>
  );
}