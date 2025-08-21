import React from 'react'
import { cn } from '@/lib/utils'
import { extractYouTubeVideoId, generateYouTubeEmbedUrl } from '@/utilities/youtube'
import { Play, Youtube } from 'lucide-react'
import { Card } from '@/components/ui/card'

import type { YouTubeVideoBlock as YouTubeVideoBlockProps } from '@/payload-types'

type Props = YouTubeVideoBlockProps & {
  className?: string
  enableGutter?: boolean
}

export const YouTubeVideoBlock: React.FC<Props> = ({
  videoUrl,
  title,
  className,
  enableGutter = true,
}) => {
  const videoId = extractYouTubeVideoId(videoUrl)

  if (!videoId) {
    return (
      <div
        className={cn(
          'rounded-lg border border-red-200 bg-red-50 p-4 text-red-700',
          {
            container: enableGutter,
          },
          className,
        )}
      >
        <p className="text-sm">URL YouTube invalide: {videoUrl}</p>
      </div>
    )
  }

  const embedUrl = generateYouTubeEmbedUrl(videoId, {
    privacyMode: true,
    controls: true,
    modestBranding: true,
  })

  const videoTitle = title || 'Vidéo YouTube'

  return (
    <div
      className={cn(
        'my-8',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      <Card className="overflow-hidden border-gray-200 shadow-lg bg-white">
        {/* YouTube Video Container with enhanced styling */}
        <div className="relative group bg-black">
          {/* 16:9 aspect ratio container */}
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={videoTitle}
              className="absolute inset-0 h-full w-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
            
            {/* Light decorative overlay that appears on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
          
          {/* YouTube branding badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-full backdrop-blur-sm shadow-md">
            <Youtube className="h-4 w-4" />
            <span className="text-xs font-semibold">YouTube</span>
          </div>
        </div>
        
        {/* Video Title/Caption */}
        {title && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-red-600" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}