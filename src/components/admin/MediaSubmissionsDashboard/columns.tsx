"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useAdminTranslation } from "@/utilities/admin-translations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react"

// Data types
export interface Submission {
  id: string
  title: string
  formType: 'report' | 'complaint'
  submissionStatus: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  submittedAt: string
  locale: 'fr' | 'ar'
  contentInfo?: {
    programName?: string
    mediaType?: string
    specificChannel?: string
    broadcastDate?: string
    broadcastTime?: string
    websiteUrl?: string
  }
  complainantInfo?: {
    fullName?: string
    emailAddress?: string
    phoneNumber?: string
    address?: string
  }
  description?: string
  assignedTo?: string
  tags?: string[]
  lastUpdated?: string
  updatedAt?: string
  internalNotes?: string
}

interface ColumnsProps {
  updateSubmission: (submissionId: string, updates: Partial<Submission>) => Promise<void>
  onViewDetails: (submission: Submission) => void
}

export const useSubmissionColumns = ({ updateSubmission, onViewDetails }: ColumnsProps): ColumnDef<Submission>[] => {
  const { dt } = useAdminTranslation()
  
  return useMemo(() => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={dt('actions.selectAll')}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={dt('actions.selectRow')}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          {dt('table.title')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const submission = row.original
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">
            {submission.title || dt('common.untitled')}
          </span>
          {submission.contentInfo?.programName && (
            <span className="text-xs text-muted-foreground">
              {submission.contentInfo.programName}
            </span>
          )}
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "formType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          {dt('table.type')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("formType") as string
      return (
        <Badge variant={type === "complaint" ? "destructive" : "default"} className="text-xs">
          {type === "complaint" ? dt('forms.complaint') : dt('forms.report')}
        </Badge>
      )
    },
    size: 120,
  },
  {
    accessorKey: "submissionStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          {dt('table.status')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const submission = row.original
      const status = row.getValue("submissionStatus") as string
      
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        reviewing: "bg-blue-100 text-blue-800 border-blue-200", 
        resolved: "bg-green-100 text-green-800 border-green-200",
        dismissed: "bg-gray-100 text-gray-800 border-gray-200"
      }
      
      const statusLabels = {
        pending: dt('status.pending'),
        reviewing: dt('status.reviewing'),
        resolved: dt('status.resolved'), 
        dismissed: dt('status.dismissed')
      }

      return (
        <Select
          value={status}
          onValueChange={async (newStatus) => {
            await updateSubmission(submission.id, { submissionStatus: newStatus as any })
          }}
        >
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue>
              <Badge 
                variant="outline" 
                className={`text-xs border ${statusColors[status as keyof typeof statusColors]}`}
              >
                {statusLabels[status as keyof typeof statusLabels]}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{dt('status.pending')}</SelectItem>
            <SelectItem value="reviewing">{dt('status.reviewing')}</SelectItem>
            <SelectItem value="resolved">{dt('status.resolved')}</SelectItem>
            <SelectItem value="dismissed">{dt('status.dismissed')}</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    size: 140,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          {dt('table.priority')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const submission = row.original
      const priority = row.getValue("priority") as string
      
      const priorityColors = {
        low: "bg-gray-100 text-gray-700 border-gray-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        high: "bg-orange-100 text-orange-800 border-orange-200", 
        urgent: "bg-red-100 text-red-800 border-red-200"
      }
      
      const priorityLabels = {
        low: dt('priority.low'),
        medium: dt('priority.medium'),
        high: dt('priority.high'),
        urgent: dt('priority.urgent')
      }

      return (
        <Select
          value={priority}
          onValueChange={async (newPriority) => {
            await updateSubmission(submission.id, { priority: newPriority as any })
          }}
        >
          <SelectTrigger className="h-7 w-24 text-xs">
            <SelectValue>
              <Badge 
                variant="outline"
                className={`text-xs border ${priorityColors[priority as keyof typeof priorityColors]}`}
              >
                {priorityLabels[priority as keyof typeof priorityLabels]}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">{dt('priority.low')}</SelectItem>
            <SelectItem value="medium">{dt('priority.medium')}</SelectItem>
            <SelectItem value="high">{dt('priority.high')}</SelectItem>
            <SelectItem value="urgent">{dt('priority.urgent')}</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    size: 120,
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          {dt('table.submittedOn')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("submittedAt") as string
      const date = new Date(dateStr)
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          })}
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "locale",
    header: dt('table.language'),
    cell: ({ row }) => {
      const locale = row.getValue("locale") as string
      return (
        <Badge variant="outline" className="text-xs">
          {locale === 'fr' ? 'FR' : 'AR'}
        </Badge>
      )
    },
    size: 80,
  },
  {
    id: "actions",
    header: dt('table.actions'),
    cell: ({ row }) => {
      const submission = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(submission)}
            className="h-7 px-2 text-xs"
          >
            {dt('actions.details')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0">
                <span className="sr-only">{dt('actions.openMenu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{dt('table.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(submission.id)}
              >
                {dt('actions.copyId')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a
                  href={`/admin/collections/media-content-submissions/${submission.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {dt('common.openInAdmin')}
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                {dt('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 120,
  },
], [dt, updateSubmission, onViewDetails])
}