'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import Image from 'next/image'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { type Locale } from '@/i18n/routing'

type Props = {
  locale?: Locale
  className?: string
} & GalleryBlockProps

// Lightbox Modal Component
const Lightbox: React.FC<{
  images: Array<{ image: { url: string; alt?: string; width: number; height: number }; title?: string; description?: string }>
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
  locale: Locale
}> = ({ images, currentIndex, isOpen, onClose, onNavigate, locale }) => {
  const isRTL = locale === 'ar'
  const currentImage = images[currentIndex]

  if (!isOpen || !currentImage) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Container */}
        <div className="flex items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.image.url}
              alt={currentImage.image.alt || 'Gallery image'}
              width={currentImage.image.width}
              height={currentImage.image.height}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            {/* Image Info */}
            {(currentImage.title || currentImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                {currentImage.title && (
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {currentImage.title}
                  </h3>
                )}
                {currentImage.description && (
                  <p className="text-white/80 text-sm">
                    {currentImage.description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors',
                isRTL ? 'right-4' : 'left-4'
              )}
            >
              <span className="sr-only">Previous image</span>
              <div className={cn('w-6 h-6 border-l-2 border-t-2 border-white transform', isRTL ? 'rotate-45' : '-rotate-45')} />
            </button>
            <button
              onClick={() => onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors',
                isRTL ? 'left-4' : 'right-4'
              )}
            >
              <span className="sr-only">Next image</span>
              <div className={cn('w-6 h-6 border-r-2 border-t-2 border-white transform', isRTL ? '-rotate-45' : 'rotate-45')} />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export const GalleryBlock: React.FC<Props> = ({
  title,
  subtitle,
  images = [],
  layout = 'masonry',
  columns = 3,
  showTitles = true,
  enableLightbox = true,
  className,
  locale = 'fr',
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)
  const isRTL = locale === 'ar'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  }

  const getLayoutClasses = () => {
    // Convert string to number for column handling
    const numColumns = typeof columns === 'string' ? parseInt(columns) : columns || 3
    
    const columnClasses = {
      2: 'md:columns-2',
      3: 'md:columns-2 lg:columns-3',
      4: 'md:columns-2 lg:columns-3 xl:columns-4',
      5: 'md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5',
    }

    switch (layout) {
      case 'masonry':
        return `columns-1 ${columnClasses[numColumns as keyof typeof columnClasses]} gap-6`
      case 'grid':
        const gridClasses = {
          2: 'grid-cols-1 md:grid-cols-2',
          3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        }
        return `grid ${gridClasses[numColumns as keyof typeof gridClasses]} gap-6`
      default:
        return 'flex flex-wrap gap-6 justify-center'
    }
  }

  const handleImageClick = (index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index)
    }
  }

  if (!images.length) {
    return null
  }

  return (
    <>
      <section 
        className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={locale}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={cn(
                'text-center mb-12',
                { 'text-right': isRTL }
              )}
            >
              {title && (
                <h2
                  className={cn(
                    'text-3xl md:text-4xl font-bold text-foreground mb-4',
                    'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
                    {
                      'font-arabic-display': locale === 'ar',
                    }
                  )}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className={cn(
                    'text-lg text-muted-foreground max-w-2xl mx-auto',
                    {
                      'font-arabic-sans': locale === 'ar',
                    }
                  )}
                >
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}

          {/* Gallery */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={getLayoutClasses()}
          >
            {images.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={cn(
                  'relative group cursor-pointer overflow-hidden rounded-2xl',
                  layout === 'masonry' ? 'mb-6 break-inside-avoid' : '',
                  layout === 'grid' ? 'aspect-square' : ''
                )}
                onClick={() => handleImageClick(index)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.title || 'Gallery image'}
                    width={item.image.width}
                    height={item.image.height}
                    className={cn(
                      'w-full transition-transform duration-500 group-hover:scale-110',
                      layout === 'grid' ? 'h-full object-cover' : 'h-auto'
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Hover Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {enableLightbox && (
                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Title and Description */}
                    {showTitles && (item.title || item.description) && (
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {item.title && (
                          <h3
                            className={cn(
                              'text-white font-semibold text-lg mb-1',
                              {
                                'font-arabic-display': locale === 'ar',
                              }
                            )}
                          >
                            {item.title}
                          </h3>
                        )}
                        {item.description && (
                          <p
                            className={cn(
                              'text-white/80 text-sm line-clamp-2',
                              {
                                'font-arabic-sans': locale === 'ar',
                              }
                            )}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Image Index */}
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxIndex >= 0}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={setLightboxIndex}
        locale={locale}
      />
    </>
  )
}