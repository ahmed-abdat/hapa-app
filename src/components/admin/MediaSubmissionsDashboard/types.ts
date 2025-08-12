export interface Submission {
  id: string;
  formType: "complaint" | "report";
  submissionStatus: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "urgent" | "high" | "medium" | "low";
  title: string;
  description?: string;
  submittedAt: string;
  updatedAt?: string;
  complainantInfo?: {
    fullName?: string | null;
    email?: string | null;
    emailAddress?: string | null;
    phone?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    gender?: string | null;
    country?: string | null;
    whatsappNumber?: string | null;
    profession?: string | null;
    relationshipToContent?: string | null;
  };
  contentInfo?: {
    mediaType?: string | null;
    mediaTypeOther?: string | null;
    programName?: string | null;
    specificChannel?: string | null;
    broadcastDate?: string | null;
    broadcastDateTime?: string | null;
    contentDescription?: string | null;
    linkScreenshot?: string | null;
    screenshotFiles?: any[] | null;
    violationType?: string | null;
    violationDetails?: string | null;
    priority?: string | null;
  };
  assignedTo?: string;
  notes?: string;
  internalNotes?: string | null;
  attachments?: string[];
}

export interface SubmissionStats {
  totalSubmissions: number;
  pendingCount: number;
  reviewingCount: number;
  resolvedCount: number;
  dismissedCount: number;
  urgentCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  averageResponseTime: number;
  weeklyTrend: number;
}

export interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  compactView: boolean;
  showNotifications: boolean;
  defaultView: "grid" | "list" | "kanban";
  itemsPerPage: number;
  showArchived: boolean;
}