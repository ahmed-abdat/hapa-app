'use client'
import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()
  
  // Get the server URL and ensure it's available
  const serverURL = getClientSideURL()
  
  // Add some debugging for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('LivePreviewListener initialized', {
        serverURL,
        timestamp: new Date().toISOString(),
      })
    }
  }, [serverURL])
  
  // Don't render if we don't have a server URL
  if (!serverURL) {
    console.warn('LivePreviewListener: No server URL available')
    return null
  }
  
  return (
    <PayloadLivePreview 
      refresh={router.refresh} 
      serverURL={serverURL}
      // Add some additional options for better reliability
      opts={{
        depth: 2,
        fallbackLocale: 'fr',
      }}
    />
  )
}
