'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

const collectionLabels = {
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  media: {
    plural: 'Media',
    singular: 'Media',
  },
  categories: {
    plural: 'Categories',
    singular: 'Category',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const [isExitingPreview, setIsExitingPreview] = useState(false)
  
  // Better collection detection based on current path
  const detectCollection = (): keyof typeof collectionLabels => {
    if (segments?.includes('posts') || segments?.[0] === 'posts') return 'posts'
    if (segments?.includes('media') || segments?.[0] === 'media') return 'media'
    if (segments?.includes('categories') || segments?.[0] === 'categories') return 'categories'
    return 'posts' // default fallback
  }
  
  const collection = detectCollection()
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white relative z-50', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Posts',
            singular: collectionLabels[collection]?.singular || 'Post',
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={async () => {
            if (isExitingPreview) return // Prevent multiple calls
            
            setIsExitingPreview(true)
            try {
              const response = await fetch('/next/exit-preview')
              if (response.ok) {
                // Get the current path to redirect to the same page but without preview
                const currentPath = window.location.pathname
                router.push(currentPath)
                router.refresh()
              } else {
                console.error('Failed to exit preview mode')
              }
            } catch (error) {
              console.error('Error exiting preview mode:', error)
            } finally {
              setIsExitingPreview(false)
            }
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 100,
          }}
        />
      </div>
    </div>
  )
}
