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
          return (
            <div className="flex items-center gap-2">
              {formType === "complaint" ? (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              ) : (
                <FileText className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-xs font-medium">
                {formType === "complaint" ? "Plainte" : "Rapport"}
              </span>
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
          return (
            <div>
              <p className="font-medium text-sm">
                {submission.complainantInfo?.fullName || "Anonyme"}
              </p>
              <p className="text-xs text-muted-foreground">
                {submission.complainantInfo?.emailAddress}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "contentInfo.mediaType",
        header: "Média/Programme",
        cell: ({ row }) => {
          const submission = row.original;
          return (
            <div>
              <p className="text-sm">
                {submission.contentInfo?.mediaType || "Non spécifié"}
              </p>
              <p className="text-xs text-muted-foreground">
                {submission.contentInfo?.programName ||
                  submission.contentInfo?.specificChannel ||
                  "--"}
              </p>
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
          return (
            <div>
              <p className="text-sm">{date.toLocaleDateString("fr-FR")}</p>
              <p className="text-xs text-muted-foreground">
                {date.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
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
          return (
            <Badge
              variant={
                status === "pending"
                  ? "secondary"
                  : status === "resolved"
                  ? "default"
                  : status === "dismissed"
                  ? "destructive"
                  : "outline"
              }
            >
              {status === "pending"
                ? "En attente"
                : status === "resolved"
                ? "Résolu"
                : status === "dismissed"
                ? "Rejeté"
                : "En révision"}
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
          return (
            <Badge
              variant={
                priority === "urgent"
                  ? "destructive"
                  : priority === "high"
                  ? "secondary"
                  : "outline"
              }
            >
              {priority === "urgent"
                ? "Urgent"
                : priority === "high"
                ? "Haute"
                : priority === "medium"
                ? "Moyenne"
                : "Basse"}
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
                  <DropdownMenuItem onClick={() => onViewDetails(submission)}>
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateSubmission(String(submission.id), {
                        submissionStatus: "reviewing",
                      })
                    }
                  >
                    Marquer en révision
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateSubmission(String(submission.id), {
                        submissionStatus: "resolved",
                      })
                    }
                  >
                    Marquer comme résolu
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateSubmission(String(submission.id), {
                        submissionStatus: "dismissed",
                      })
                    }
                  >
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
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
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
        >
          <XCircle className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucune soumission trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
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