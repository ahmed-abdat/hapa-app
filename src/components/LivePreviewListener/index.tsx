'use client'
import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { logger } from '@/utilities/logger'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()
  
  // Get the server URL and ensure it's available
  const serverURL = getClientSideURL()
  
  // Add some debugging for development
  React.useEffect(() => {
    logger.debug('LivePreviewListener initialized', {
      component: 'LivePreviewListener',
      action: 'initialize',
      metadata: { 
        serverURL,
        timestamp: new Date().toISOString(),
      }
    })
  }, [serverURL])
  
  // Don't render if we don't have a server URL
  if (!serverURL) {
    logger.warn('LivePreviewListener: No server URL available', {
      component: 'LivePreviewListener',
      action: 'missing_server_url'
    })
    return null
  }
  
  return (
    <PayloadLivePreview 
      refresh={router.refresh} 
      serverURL={serverURL}
      // Add depth for better reliability with nested data
      depth={2}
    />
  )
}
