'use client'
import { cn } from '@/lib/utils'
import useClickableCard from '@/utilities/useClickableCard'
import { Link } from '@/i18n/navigation'
import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { Calendar, ArrowRight, Eye } from 'lucide-react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { useTranslations } from 'next-intl'
import { type Locale } from '@/utilities/locale'

export type CardPostData = Pick<Post, 'id' | 'slug' | 'categories' | 'meta' | 'title' | 'publishedAt' | 'createdAt'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
  locale?: Locale
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps, locale = 'fr' } = props
  const t = useTranslations()

  const { slug, categories, meta, title, publishedAt, createdAt } = doc || {}
  const { description, image: metaImage } = meta || {}

  // Memoize expensive computations for performance
  const computedValues = React.useMemo(() => {
    const hasCategories = categories && Array.isArray(categories) && categories.length > 0
    const titleToUse = titleFromProps || title
    const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
    const href = `/${relationTo}/${slug}`
    const publicationDate = publishedAt || createdAt
    
    // Calculate responsive title size based on title length
    const getTitleClass = (titleLength: number) => {
      if (titleLength > 80) return "text-base sm:text-lg"
      if (titleLength > 50) return "text-lg sm:text-xl"
      return "text-xl sm:text-2xl"
    }
    const titleClass = getTitleClass(titleToUse?.length || 0)

    return {
      hasCategories,
      titleToUse,
      sanitizedDescription,
      href,
      publicationDate,
      titleClass
    }
  }, [categories, titleFromProps, title, description, relationTo, slug, publishedAt, createdAt])

  const { hasCategories, titleToUse, sanitizedDescription, href, publicationDate, titleClass } = computedValues

  // Optimized animation variants - use id-based delay for consistent performance
  const animationDelay = React.useMemo(() => {
    if (!doc?.id) return 0
    // Use id hash for consistent but varied delays (0-0.3s range)
    return ((doc.id as number) % 4) * 0.075
  }, [doc?.id])

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: animationDelay,
        ease: "easeOut"
      }
    }
  }

  // Memoize image variants for performance
  const imageVariants: Variants = React.useMemo(() => ({
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  }), [])

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover="hover"
      className={cn(
        'group relative bg-gradient-to-br from-gray-50/80 to-gray-100/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:cursor-pointer border border-gray-200/60 hover:border-primary/30',
        'hover:-translate-y-2 backdrop-blur-sm',
        className,
      )}
      ref={card.ref}
    >
      {/* Modern gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Image Section with Enhanced Animations */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100/60 to-gray-200/40">
        {!metaImage && (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-gray-400 bg-gradient-to-br from-primary/10 to-accent/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Eye className="h-8 w-8 mb-2 text-primary/40" />
            <span className="text-xs font-medium">{t('noImage')}</span>
          </motion.div>
        )}
        {metaImage && typeof metaImage !== 'string' && (
          <motion.div variants={imageVariants} className="h-full w-full">
            <Media 
              resource={metaImage} 
              size="33vw" 
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}
        
        {/* Enhanced gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Modern Categories with HAPA branding */}
        {showCategories && hasCategories && (
          <motion.div 
            className="absolute bottom-4 left-4 right-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-2">
              {categories?.slice(0, 2).map((category) => {
                if (typeof category === 'object') {
                  const { title: titleFromCategory } = category
                  const categoryTitle = titleFromCategory || t('untitledCategory')

                  return (
                    <motion.span 
                      key={category.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/90 backdrop-blur-md text-white border border-white/20"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(19, 139, 58, 1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      {categoryTitle}
                    </motion.span>
                  )
                }
                return null
              })}
              {categories && categories.length > 2 && (
                <motion.span 
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/90 backdrop-blur-md text-white border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  +{categories.length - 2}
                </motion.span>
              )}
            </div>
          </motion.div>
        )}

        {/* Modern corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Content Section with Enhanced Typography */}
      <div className="p-6 relative">
        {/* Publication Date with Icon */}
        {publicationDate && (
          <motion.div 
            className="flex items-center gap-2 text-xs text-gray-500 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Calendar className="h-3.5 w-3.5 text-primary/60" />
            <time dateTime={publicationDate} className="font-medium">
              {locale === 'ar' ? 
                new Date(publicationDate).toLocaleDateString('ar-MA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  numberingSystem: 'latn' // Force Latin numerals (0-9)
                }) :
                new Date(publicationDate).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              }
            </time>
          </motion.div>
        )}

        {/* Enhanced Title */}
        {titleToUse && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className={cn(
              "font-bold leading-tight tracking-tight text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2",
              titleClass
            )}>
              <Link className="block hover:underline decoration-primary/30" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </motion.div>
        )}
        
        {/* Enhanced Description */}
        {description && (
          <motion.div 
            className="mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {sanitizedDescription}
            </p>
          </motion.div>
        )}
        
        {/* Modern Read More Section */}
        <motion.div 
          className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-primary/20 transition-colors duration-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-primary font-semibold text-sm group-hover:text-accent transition-colors duration-300">
            {t('readMore')}
          </span>
          
          <motion.div 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary transition-all duration-300 rtl:rotate-180"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
          </motion.div>
        </motion.div>
        
        {/* Categories fallback at bottom */}
        {!showCategories && hasCategories && (
          <motion.div 
            className="mt-3 pt-3 border-t border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-wrap gap-1">
              {categories?.slice(0, 2).map((category) => {
                if (typeof category === 'object') {
                  const categoryTitle = category.title || t('untitledCategory')
                  return (
                    <span 
                      key={category.id}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    >
                      {categoryTitle}
                    </span>
                  )
                }
                return null
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Subtle HAPA brand accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.article>
  )
}
