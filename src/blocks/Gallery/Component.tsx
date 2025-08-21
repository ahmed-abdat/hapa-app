'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Media } from '@/components/Media'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

type Props = GalleryBlockProps & {
  className?: string
  locale?: 'fr' | 'ar'
}

export const Gallery: React.FC<Props> = (props) => {
  const {
    title,
    description,
    images = [],
    enableLightbox,
    className,
    locale = 'fr',
  } = props

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    if (enableLightbox ?? true) {
      setLightboxIndex(index)
      setIsLightboxOpen(true)
    }
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setLightboxIndex(null)
  }

  const goToPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }

  const goToNext = () => {
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null

  return (
    <div className={cn('w-full', className)}>
      {/* Gallery Header */}
      {(title || description) && (
        <div className={cn('mb-8 text-center max-w-4xl mx-auto', locale === 'ar' && 'text-right')}>
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
{typeof title === 'object' ? (title as any)?.[locale] || (title as any)?.fr || title : title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
{typeof description === 'object' ? (description as any)?.[locale] || (description as any)?.fr || description : description}
            </p>
          )}
        </div>
      )}

      {/* Gallery Grid with MediaBlock-inspired Design */}
      <div className="w-full">
        <div className={cn(
          'grid gap-6',
          images.length === 1 && 'grid-cols-1 max-w-4xl mx-auto',
          images.length === 2 && 'grid-cols-1 md:grid-cols-2',
          images.length === 3 && 'grid-cols-1 md:grid-cols-3',
          images.length === 4 && 'grid-cols-1 sm:grid-cols-2',
          images.length > 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}>
          {images.map((item, index) => {
            if (!item.media || typeof item.media !== 'object') return null
            
            return (
              <GalleryItem
                key={index}
                media={item.media}
                caption={item.caption}
                index={index}
                enableLightbox={enableLightbox ?? true}
                onImageClick={openLightbox}
                locale={locale}
              />
            )
          })}
        </div>
      </div>

      {/* Simplified Lightbox */}
      {(enableLightbox ?? true) && currentImage && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-7xl w-full h-screen p-0 bg-black/95 border-none">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
                onClick={closeLightbox}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {lightboxIndex !== null && lightboxIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 z-10',
                    'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20',
                    'rounded-full w-12 h-12',
                    locale === 'ar' ? 'right-4' : 'left-4'
                  )}
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {lightboxIndex !== null && lightboxIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 z-10',
                    'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20',
                    'rounded-full w-12 h-12',
                    locale === 'ar' ? 'left-4' : 'right-4'
                  )}
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Main Image */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                {currentImage.media && typeof currentImage.media === 'object' && (
                  <Media
                    resource={currentImage.media}
                    imgClassName="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Caption */}
              {currentImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="max-w-4xl mx-auto text-center">
                    <p className="text-white text-lg leading-relaxed">
                      {typeof currentImage.caption === 'object' 
? (currentImage.caption as any)?.[locale] || (currentImage.caption as any)?.fr || currentImage.caption 
                        : currentImage.caption
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Image Counter */}
              {lightboxIndex !== null && (
                <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
                  {lightboxIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Gallery Item Component with MediaBlock-inspired design
interface GalleryItemProps {
  media: any
  caption: any
  index: number
  enableLightbox: boolean
  onImageClick: (index: number) => void
  locale: 'fr' | 'ar'
  totalImages?: number
}

const GalleryItem: React.FC<GalleryItemProps> = ({
  media,
  caption,
  index,
  enableLightbox,
  onImageClick,
  locale,
}) => {
  const handleClick = () => {
    if (enableLightbox) {
      onImageClick(index)
    }
  }

  return (
    <div
      className={cn(
        'group relative w-full',
        enableLightbox && 'cursor-pointer'
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (enableLightbox && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      tabIndex={enableLightbox ? 0 : undefined}
      role={enableLightbox ? 'button' : undefined}
      aria-label={enableLightbox ? `View image ${index + 1}` : undefined}
    >
      {/* Image Container with MediaBlock styling */}
      <div className="relative w-full">
        <Media
          resource={media}
          imgClassName={cn(
            'border border-border rounded-[0.8rem] w-full h-auto',
            'transition-opacity duration-300',
            enableLightbox && 'group-hover:opacity-90'
          )}
          priority={index < 3} // Load first 3 images with priority
        />
        
        {/* Subtle Hover Overlay */}
        {enableLightbox && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-[0.8rem] flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-12 h-12 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Caption with MediaBlock spacing */}
      {caption && (
        <div className={cn('mt-6', locale === 'ar' && 'text-right')}>
          <p className="text-muted-foreground leading-relaxed">
{typeof caption === 'object' ? (caption as any)?.[locale] || (caption as any)?.fr || caption : caption}
          </p>
        </div>
      )}
    </div>
  )
}