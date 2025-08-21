'use client'

import React from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  url: string
  title: string
  className?: string
}

export const ShareButton: React.FC<ShareButtonProps> = ({ url, title, className }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy URL')
      }
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={cn(
        "gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 transition-all",
        className
      )}
    >
      <Share2 className="h-4 w-4" />
      <span>Partager</span>
    </Button>
  )
}