import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

/**
 * Media Cleanup Jobs Collection
 * 
 * Tracks cleanup operations for orphaned media files in R2 storage.
 * Provides audit trail and allows manual or scheduled cleanup operations.
 */
export const MediaCleanupJobs: CollectionConfig = {
  slug: 'media-cleanup-jobs',
  
  admin: {
    group: 'System',
    defaultColumns: ['jobType', 'status', 'filesProcessed', 'filesDeleted', 'executedAt'],
    listSearchableFields: ['jobType', 'status'],
    description: 'Track and manage media cleanup operations for orphaned files',
    meta: {
      titleSuffix: ' – Media Cleanup Jobs',
      description: 'Manage automated cleanup of orphaned media files',
    },
    components: {
      views: {
        list: {
          Component: '@/components/admin/MediaCleanupDashboard/index.tsx',
        },
      },
    },
  },
  
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  
  fields: [
    {
      name: 'jobType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Verification Scan',
          value: 'verification',
        },
        {
          label: 'Cleanup Orphaned Files',
          value: 'cleanup',
        },
        {
          label: 'Full Audit',
          value: 'audit',
        },
      ],
      admin: {
        description: 'Type of cleanup operation performed',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Running',
          value: 'running',
        },
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
        {
          label: 'Partially Completed',
          value: 'partial',
        },
      ],
    },
    {
      name: 'executedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the job was started',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the job was completed',
      },
    },
    {
      name: 'metrics',
      type: 'group',
      fields: [
        {
          name: 'filesScanned',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total number of files scanned in R2',
          },
        },
        {
          name: 'filesProcessed',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of files processed',
          },
        },
        {
          name: 'orphanedFilesFound',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of orphaned files identified',
          },
        },
        {
          name: 'filesDeleted',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of files successfully deleted',
          },
        },
        {
          name: 'deletionErrors',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of files that failed to delete',
          },
        },
        {
          name: 'storageReclaimed',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Storage space reclaimed in bytes',
          },
        },
      ],
    },
    {
      name: 'orphanedFiles',
      type: 'array',
      admin: {
        description: 'List of orphaned files found during scan',
      },
      fields: [
        {
          name: 'filename',
          type: 'text',
          required: true,
        },
        {
          name: 'path',
          type: 'text',
          required: true,
        },
        {
          name: 'size',
          type: 'number',
          min: 0,
        },
        {
          name: 'lastModified',
          type: 'date',
        },
        {
          name: 'status',
          type: 'select',
          options: [
            {
              label: 'Found',
              value: 'found',
            },
            {
              label: 'Deleted',
              value: 'deleted',
            },
            {
              label: 'Delete Failed',
              value: 'failed',
            },
            {
              label: 'Skipped',
              value: 'skipped',
            },
          ],
          defaultValue: 'found',
        },
        {
          name: 'error',
          type: 'text',
          admin: {
            description: 'Error message if deletion failed',
          },
        },
      ],
    },
    {
      name: 'configuration',
      type: 'group',
      fields: [
        {
          name: 'dryRun',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'If true, only scans and reports without deleting',
          },
        },
        {
          name: 'includeDirectories',
          type: 'array',
          fields: [
            {
              name: 'path',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'R2 directories to scan (default: forms/)',
          },
        },
        {
          name: 'excludePatterns',
          type: 'array',
          fields: [
            {
              name: 'pattern',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'File patterns to exclude from cleanup',
          },
        },
        {
          name: 'maxFilesToProcess',
          type: 'number',
          min: 1,
          defaultValue: 1000,
          admin: {
            description: 'Maximum files to process in one job',
          },
        },
        {
          name: 'retentionDays',
          type: 'number',
          min: 0,
          defaultValue: 30,
          admin: {
            description: 'Keep files newer than this many days',
          },
        },
      ],
    },
    {
      name: 'executionLog',
      type: 'textarea',
      admin: {
        description: 'Detailed log of the cleanup operation',
        readOnly: true,
      },
    },
    {
      name: 'errorLog',
      type: 'textarea',
      admin: {
        description: 'Error messages encountered during execution',
        readOnly: true,
      },
    },
    {
      name: 'triggeredBy',
      type: 'select',
      options: [
        {
          label: 'Manual',
          value: 'manual',
        },
        {
          label: 'Scheduled',
          value: 'scheduled',
        },
        {
          label: 'API',
          value: 'api',
        },
      ],
      defaultValue: 'manual',
    },
    {
      name: 'executedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who triggered the job (for manual jobs)',
      },
    },
  ],
  
  timestamps: true,
}