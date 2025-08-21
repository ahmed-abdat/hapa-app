'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Media } from '@/components/Media'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
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
    layout = 'grid',
    gridColumns = '3',
    images = [],
    enableLightbox = true,
    className,
    locale = 'fr',
  } = props

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    if (enableLightbox) {
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

  const getGridClass = () => {
    switch (gridColumns) {
      case '2':
        return 'grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'
      case '4':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'
      default: // '3'
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
    }
  }

  const getMasonryClass = () => {
    switch (gridColumns) {
      case '2':
        return 'columns-1 md:columns-2 gap-4 md:gap-6'
      case '4':
        return 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4'
      default: // '3'
        return 'columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-6'
    }
  }

  const getCarouselClass = () => {
    return 'flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth'
  }

  const renderGalleryContent = () => {
    switch (layout) {
      case 'masonry':
        return (
          <div className={getMasonryClass()}>
            {images.map((item, index) => {
              if (!item.media || typeof item.media !== 'object') return null
              
              return (
                <div key={index} className="break-inside-avoid mb-4 md:mb-6">
                  <GalleryItem
                    media={item.media}
                    caption={item.caption}
                    index={index}
                    enableLightbox={enableLightbox}
                    onImageClick={openLightbox}
                    locale={locale}
                    layout="masonry"
                  />
                </div>
              )
            })}
          </div>
        )

      case 'carousel':
        return (
          <div className={getCarouselClass()}>
            {images.map((item, index) => {
              if (!item.media || typeof item.media !== 'object') return null
              
              return (
                <div key={index} className="flex-shrink-0 w-72 md:w-80">
                  <GalleryItem
                    media={item.media}
                    caption={item.caption}
                    index={index}
                    enableLightbox={enableLightbox}
                    onImageClick={openLightbox}
                    locale={locale}
                    layout="carousel"
                  />
                </div>
              )
            })}
          </div>
        )

      default: // 'grid'
        return (
          <div className={cn('grid', getGridClass())}>
            {images.map((item, index) => {
              if (!item.media || typeof item.media !== 'object') return null
              
              return (
                <GalleryItem
                  key={index}
                  media={item.media}
                  caption={item.caption}
                  index={index}
                  enableLightbox={enableLightbox}
                  onImageClick={openLightbox}
                  locale={locale}
                  layout="grid"
                />
              )
            })}
          </div>
        )
    }
  }

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null

  return (
    <div className={cn('container mx-auto px-4', className)}>
      {/* Gallery Header */}
      {(title || description) && (
        <div className={cn('mb-8 text-center', locale === 'ar' && 'text-right')}>
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {typeof title === 'object' ? title[locale] || title.fr : title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {typeof description === 'object' ? description[locale] || description.fr : description}
            </p>
          )}
        </div>
      )}

      {/* Gallery Content */}
      {renderGalleryContent()}

      {/* Lightbox Modal */}
      {enableLightbox && currentImage && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeLightbox}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {lightboxIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20',
                    locale === 'ar' ? 'right-4' : 'left-4'
                  )}
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {lightboxIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20',
                    locale === 'ar' ? 'left-4' : 'right-4'
                  )}
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Lightbox Image */}
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
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white bg-black/50 px-4 py-2 rounded">
                    {typeof currentImage.caption === 'object' 
                      ? currentImage.caption[locale] || currentImage.caption.fr 
                      : currentImage.caption
                    }
                  </p>
                </div>
              )}

              {/* Image Counter */}
              <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded text-sm">
                {lightboxIndex + 1} / {images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Gallery Item Component
interface GalleryItemProps {
  media: any
  caption: any
  index: number
  enableLightbox: boolean
  onImageClick: (index: number) => void
  locale: 'fr' | 'ar'
  layout?: 'grid' | 'masonry' | 'carousel'
}

const GalleryItem: React.FC<GalleryItemProps> = ({
  media,
  caption,
  index,
  enableLightbox,
  onImageClick,
  locale,
  layout = 'grid',
}) => {
  const handleClick = () => {
    if (enableLightbox) {
      onImageClick(index)
    }
  }

  // Get layout-specific classes
  const getImageContainerClass = () => {
    switch (layout) {
      case 'grid':
        return 'aspect-square overflow-hidden' // Square aspect ratio for grid
      case 'carousel':
        return 'aspect-[4/3] overflow-hidden' // 4:3 aspect ratio for carousel
      case 'masonry':
      default:
        return 'overflow-hidden' // Natural height for masonry
    }
  }

  const getImageClass = () => {
    switch (layout) {
      case 'grid':
      case 'carousel':
        return 'w-full h-full object-cover transition-transform duration-300'
      case 'masonry':
      default:
        return 'w-full h-auto transition-transform duration-300'
    }
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100',
        'hover:shadow-lg transition-all duration-300',
        enableLightbox && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50',
        'transform hover:-translate-y-1'
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
      <div className={cn('relative', getImageContainerClass())}>
        <Media
          resource={media}
          imgClassName={cn(
            getImageClass(),
            enableLightbox && 'group-hover:scale-105'
          )}
        />
        
        {/* Hover Overlay */}
        {enableLightbox && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
        )}
        
        {/* Hover Icon */}
        {enableLightbox && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className={cn(
          'p-3 bg-white', 
          locale === 'ar' && 'text-right'
        )}>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {typeof caption === 'object' ? caption[locale] || caption.fr : caption}
          </p>
        </div>
      )}
    </div>
  )
}