import { logger } from "@/utilities/logger";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SubmissionStats {
  total: number;
  pending: number;
  reviewing: number;
  resolved: number;
  rejected: number;
  recentActivity: number;
}

export interface MediaSubmission {
  id: string;
  submissionType: "complaint" | "report";
  mediaType: string;
  status: string;
  priority: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string;
  country: string;
  submissionDate: string;
  updatedAt?: string;
  reason?: string;
  description?: string;
  files?: Array<{
    id: string;
    filename: string;
    mimeType: string;
    filesize: number;
    url: string;
  }>;
}

/**
 * Fetch dashboard statistics with error handling and logging
 */
export async function fetchDashboardStats(): Promise<ApiResponse<SubmissionStats>> {
  try {
    const response = await fetch("/api/admin/media-submissions-stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.info("Dashboard stats fetched successfully");
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logger.info("Operation completed");
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Fetch media submissions with filtering and pagination
 */
export async function fetchMediaSubmissions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  submissionType?: string;
  mediaType?: string;
  search?: string;
}): Promise<ApiResponse<{
  submissions: MediaSubmission[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}>> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.submissionType) searchParams.set("submissionType", params.submissionType);
    if (params?.mediaType) searchParams.set("mediaType", params.mediaType);
    if (params?.search) searchParams.set("search", params.search);

    const response = await fetch(`/api/admin/media-submissions?${searchParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.info("Operation completed");
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logger.info("Operation completed");
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update submission status with proper error handling
 */
export async function updateSubmissionStatus(
  id: string,
  status: string,
  priority?: string
): Promise<ApiResponse<MediaSubmission>> {
  try {
    const response = await fetch(`/api/admin/media-submissions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        ...(priority && { priority }),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.info("Operation completed");
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logger.info("Operation completed");
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Bulk update submissions with error handling
 */
export async function bulkUpdateSubmissions(
  ids: string[],
  updates: { status?: string; priority?: string }
): Promise<ApiResponse<{ updated: number; failed: number }>> {
  try {
    const results = await Promise.allSettled(
      ids.map(id => updateSubmissionStatus(id, updates.status || "", updates.priority))
    );

    const updated = results.filter(result => result.status === "fulfilled" && result.value.success).length;
    const failed = results.length - updated;

    logger.info("Operation completed");
    
    return {
      success: true,
      data: { updated, failed },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logger.info("Operation completed");
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete submission with confirmation
 */
export async function deleteSubmission(id: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/admin/media-submissions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    logger.info("Operation completed");
    
    return {
      success: true,
      message: "Submission deleted successfully",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logger.info("Operation completed");
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}