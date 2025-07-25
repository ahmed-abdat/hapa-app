import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import { motion } from 'framer-motion'
import { ClockIcon, UserIcon, CalendarIcon, TagIcon } from 'lucide-react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { t } from '@/utilities/translations'
import { type Locale } from '@/utilities/locale'
import { formatReadingTime } from '@/utilities/readingTime'
import { cn } from '@/utilities/ui'

export const PostHero: React.FC<{
  post: Post
  locale: Locale
}> = ({ post, locale }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title, content } = post
  const isRTL = locale === 'ar'

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  }

  return (
    <div className="relative -mt-[10.4rem] flex items-end min-h-[90vh]">
      {/* Enhanced Background with Multiple Overlays */}
      <div className="absolute inset-0 min-h-[90vh]">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="object-cover" resource={heroImage} />
        )}
        
        {/* Multiple gradient overlays for sophisticated look */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container z-10 relative text-white pb-12 pt-32"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-4xl mx-auto">
          {/* Categories with enhanced styling */}
          {categories && categories.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <TagIcon className="w-4 h-4 text-secondary" />
              {categories.map((category, index) => {
                if (typeof category === 'object' && category !== null) {
                  const { title: categoryTitle } = category
                  const titleToUse = categoryTitle || t('untitledCategory', locale)
                  const isLast = index === categories.length - 1

                  return (
                    <React.Fragment key={index}>
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                          'bg-secondary/20 text-secondary border border-secondary/30',
                          'backdrop-blur-sm hover:bg-secondary/30 transition-colors',
                          {
                            'font-arabic-sans': locale === 'ar',
                          }
                        )}
                      >
                        {titleToUse}
                      </span>
                      {!isLast && <span className="text-white/40">•</span>}
                    </React.Fragment>
                  )
                }
                return null
              })}
            </motion.div>
          )}

          {/* Enhanced Title */}
          <motion.div variants={titleVariants} className="mb-8">
            <h1
              className={cn(
                'text-4xl md:text-6xl lg:text-7xl font-bold',
                'bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent',
                'leading-tight',
                {
                  'font-arabic-display text-3xl md:text-5xl lg:text-6xl': locale === 'ar',
                }
              )}
            >
              {title}
            </h1>
          </motion.div>

          {/* Enhanced Metadata Bar */}
          <motion.div
            variants={itemVariants}
            className={cn(
              'flex flex-wrap items-center gap-6 p-6 rounded-2xl',
              'bg-white/10 backdrop-blur-md border border-white/20',
              'shadow-2xl',
              {
                'flex-row-reverse': isRTL,
              }
            )}
          >
            {/* Author Information */}
            {hasAuthors && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 border border-primary/30">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">
                    {t('author', locale)}
                  </p>
                  <p
                    className={cn('text-sm font-medium text-white', {
                      'font-arabic-sans': locale === 'ar',
                    })}
                  >
                    {formatAuthors(populatedAuthors)}
                  </p>
                </div>
              </div>
            )}

            {/* Published Date */}
            {publishedAt && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 border border-accent/30">
                  <CalendarIcon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">
                    {t('datePublished', locale)}
                  </p>
                  <time
                    dateTime={publishedAt}
                    className={cn('text-sm font-medium text-white', {
                      'font-arabic-sans': locale === 'ar',
                    })}
                  >
                    {formatDateTime(publishedAt)}
                  </time>
                </div>
              </div>
            )}

            {/* Reading Time */}
            {content && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30">
                  <ClockIcon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">
                    {locale === 'ar' ? 'وقت القراءة' : 'Temps de lecture'}
                  </p>
                  <p
                    className={cn('text-sm font-medium text-white', {
                      'font-arabic-sans': locale === 'ar',
                    })}
                  >
                    {formatReadingTime(content, locale)}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="w-1 h-3 bg-white/60 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  )
}
