'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useField, useDocumentInfo, useForm } from '@payloadcms/ui'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Reply, Send, Check, Clock, X } from 'lucide-react'
import { ContactSubmission } from '@/payload-types'
import { ReplyDialog } from '../EmailReply'

const ReplyField: React.FC = () => {
  const { value: replyMessage } = useField<string>({ path: 'replyMessage' })
  const { value: emailSent } = useField<boolean>({ path: 'emailSent' })
  const { value: emailSentAt } = useField<string>({ path: 'emailSentAt' })
  const { getData, submit } = useForm()
  const { id } = useDocumentInfo()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submissionData, setSubmissionData] = useState<ContactSubmission | null>(null)

  // Get the full document data
  useEffect(() => {
    const data = getData() as ContactSubmission
    setSubmissionData(data)
  }, [getData])

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const handleSuccess = useCallback(async () => {
    // Refresh the form data to show updated status
    await submit()
    setIsDialogOpen(false)
  }, [submit])

  return (
    <div className="space-y-4">
      {/* Email Status Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {emailSent ? (
              <>
                <div className="p-2 bg-green-100 rounded-full">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Reply Sent</p>
                  {emailSentAt && (
                    <p className="text-sm text-gray-500">
                      Sent on {new Date(emailSentAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-yellow-900">No Reply Sent</p>
                  <p className="text-sm text-gray-500">
                    Click the button to compose and send a reply
                  </p>
                </div>
              </>
            )}
          </div>
          
          <Button
            onClick={handleOpenDialog}
            size="sm"
            variant={emailSent ? 'outline' : 'default'}
            className="flex items-center gap-2"
          >
            <Reply className="h-4 w-4" />
            {emailSent ? 'Send Another Reply' : 'Send Reply'}
          </Button>
        </div>

        {/* Show last reply if exists */}
        {replyMessage && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Last Reply Message:</p>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{replyMessage}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Reply Dialog */}
      {submissionData && (
        <ReplyDialog
          submission={submissionData}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

export default ReplyField