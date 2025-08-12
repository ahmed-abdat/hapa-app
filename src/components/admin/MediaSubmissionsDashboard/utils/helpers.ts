import {
  FileVideo,
  Radio,
  Wifi,
  Newspaper,
  Hash,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";

export type MediaType = "video" | "radio" | "online" | "print" | "other";
export type SubmissionStatus = "pending" | "reviewing" | "resolved" | "rejected";
export type PriorityLevel = "low" | "medium" | "high" | "urgent";

// Media Type Helpers
export function getMediaIcon(mediaType: string): LucideIcon {
  const type = mediaType?.toLowerCase() as MediaType;
  
  switch (type) {
    case "video":
      return FileVideo;
    case "radio":
      return Radio;
    case "online":
      return Wifi;
    case "print":
      return Newspaper;
    case "other":
      return Hash;
    default:
      return FileText;
  }
}

export function getMediaTypeKey(mediaType: string): string {
  const type = mediaType?.toLowerCase();
  return `dashboard.mediaType.${type || 'unknown'}`;
}

export const MEDIA_TYPES = [
  { value: "video", labelKey: "dashboard.mediaType.video" },
  { value: "radio", labelKey: "dashboard.mediaType.radio" },
  { value: "online", labelKey: "dashboard.mediaType.online" },
  { value: "print", labelKey: "dashboard.mediaType.print" },
  { value: "other", labelKey: "dashboard.mediaType.other" },
] as const;

// Status Helpers
export function getStatusBadgeVariant(status: string): BadgeProps["variant"] {
  switch (status?.toLowerCase()) {
    case "pending":
      return "secondary";
    case "reviewing":
      return "outline";
    case "resolved":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

export function getPriorityBadgeVariant(priority: string): BadgeProps["variant"] {
  switch (priority?.toLowerCase()) {
    case "low":
      return "secondary";
    case "medium":
      return "outline";
    case "high":
      return "default";
    case "urgent":
      return "destructive";
    default:
      return "secondary";
  }
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "rgb(234, 179, 8)";
    case "reviewing":
      return "rgb(59, 130, 246)";
    case "resolved":
      return "rgb(34, 197, 94)";
    case "rejected":
      return "rgb(239, 68, 68)";
    default:
      return "rgb(107, 114, 128)";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case "low":
      return "rgb(107, 114, 128)";
    case "medium":
      return "rgb(59, 130, 246)";
    case "high":
      return "rgb(249, 115, 22)";
    case "urgent":
      return "rgb(239, 68, 68)";
    default:
      return "rgb(107, 114, 128)";
  }
}

export function getStatusTranslationKey(status: string): string {
  return `dashboard.status.${status?.toLowerCase() || 'unknown'}`;
}

export function getPriorityTranslationKey(priority: string): string {
  return `dashboard.priority.${priority?.toLowerCase() || 'unknown'}`;
}

export const STATUS_OPTIONS = [
  { value: "pending", labelKey: "dashboard.status.pending" },
  { value: "reviewing", labelKey: "dashboard.status.reviewing" },
  { value: "resolved", labelKey: "dashboard.status.resolved" },
  { value: "rejected", labelKey: "dashboard.status.rejected" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "low", labelKey: "dashboard.priority.low" },
  { value: "medium", labelKey: "dashboard.priority.medium" },
  { value: "high", labelKey: "dashboard.priority.high" },
  { value: "urgent", labelKey: "dashboard.priority.urgent" },
] as const;