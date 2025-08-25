'use client'

import React from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Locale } from '@/utilities/locale'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface ShareButtonProps {
  url: string
  title: string
  className?: string
  locale?: Locale
  shareText?: string
}

export const ShareButton: React.FC<ShareButtonProps> = ({ url, title, className, locale, shareText }) => {
  const t = useTranslations()
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
        toast.success(t('Share.copiedToClipboard'))
      } catch (err) {
        console.error('Failed to copy URL')
      }
    }
  }

  const isRTL = locale === 'ar'
  const buttonText = shareText || t('Share.share')

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
      {isRTL ? (
        <>
          <span className="hidden sm:inline">{buttonText}</span>
          <Share2 className="h-4 w-4" />
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{buttonText}</span>
        </>
      )}
    </Button>
  )
}