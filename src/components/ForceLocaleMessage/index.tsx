'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDocumentInfo } from '@payloadcms/ui'

export const ForceLocaleMessage: React.FC = () => {
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Always call hooks at the top level
  const router = useRouter()
  const searchParams = useSearchParams()
  const docInfo = useDocumentInfo()
  
  const id = docInfo?.id
  const currentLocale = searchParams.get('locale')
  const isNewDocument = !id || id === 'create'
  
  // Ensure we only run client-side logic after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    // Only run client-side logic after hydration is complete
    if (!isClient || error || !router || !searchParams) return
    
    try {
      // Force French locale for new posts
      if (isNewDocument && currentLocale !== 'fr') {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('locale', 'fr')
        router.replace(`?${newSearchParams.toString()}`)
      }
    } catch (err) {
      // Error during locale redirection
      setError('Failed to redirect to French locale')
    }
  }, [isClient, isNewDocument, currentLocale, router, searchParams, error])
  
  // Prevent hydration mismatch by only rendering after client-side hydration
  if (!isClient) {
    return null
  }
  
  // Show error state if something went wrong
  if (error) {
    return (
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#dc2626'
      }}>
        <strong>⚠️ Error:</strong> {error}
      </div>
    )
  }
  
  // Show message for new posts not in French locale
  if (isNewDocument && currentLocale !== 'fr') {
    return (
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e40af'
      }}>
        <strong>🇫🇷 French First:</strong> New posts should start in French locale to ensure proper slug generation. Redirecting to French locale...
      </div>
    )
  }
  
  // Remove tip message since we now handle Arabic slugs automatically
  
  return null
}