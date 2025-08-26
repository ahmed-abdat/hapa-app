'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Reply, Send } from 'lucide-react'
import { useDocumentInfo } from '@payloadcms/ui'
import { ContactSubmission } from '@/payload-types'
import { ReplyDialog } from '../EmailReply'

export const ReplyButton: React.FC = () => {
  const { id, docPermissions, title } = useDocumentInfo()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submissionData, setSubmissionData] = useState<ContactSubmission | null>(null)

  // Fetch the full submission data when dialog opens
  const handleOpenDialog = useCallback(async () => {
    try {
      const response = await fetch(`/api/contact-submissions/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissionData(data)
        setIsDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching submission:', error)
    }
  }, [id])

  const handleSuccess = useCallback(() => {
    // Close dialog and reset state - server action should handle status updates
    setIsDialogOpen(false)
    setSubmissionData(null)
  }, [])

  // Only show button if user has update permission
  if (!docPermissions?.update) {
    return null
  }

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        size="sm"
        className="flex items-center gap-2"
      >
        <Reply className="h-4 w-4" />
        Send Reply
      </Button>

      {submissionData && (
        <ReplyDialog
          submission={submissionData}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}